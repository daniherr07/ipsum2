-- =====================================================================
-- Migracion: feedback del cliente (octubre 2026)
-- Correr completo en el SQL editor de Supabase ANTES de desplegar el
-- backend/frontend nuevos. Es idempotente: se puede correr mas de una vez.
--
--   Parte 1 (puntos 2 y 12): movimientos.categoria deja de ser el ENUM fijo
--           categoria_egreso y pasa a text con FK a categorias(nombre), para
--           aceptar cualquier categoria del catalogo configurable.
--   Parte 2 (punto 4): los egresos generales pueden guardar fecha_pago.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. Diagnostico (solo lectura): ver el estado actual
-- ---------------------------------------------------------------------
select column_name, data_type, udt_name
from information_schema.columns
where table_schema = 'public' and table_name = 'movimientos' and column_name = 'categoria';

select pg_get_constraintdef(oid) as forma_valida_actual
from pg_constraint
where conrelid = 'public.movimientos'::regclass and conname = 'movimientos_forma_valida';

-- ---------------------------------------------------------------------
-- 1. categoria: enum -> text + FK a categorias(nombre)
-- ---------------------------------------------------------------------
do $$
declare
  faltantes text;
  vista_def text;
begin
  -- 1a. categorias.nombre necesita una restriccion unique para ser destino de FK
  if not exists (
    select 1
    from pg_constraint c
    join pg_attribute a on a.attrelid = c.conrelid and a.attnum = any (c.conkey)
    where c.conrelid = 'public.categorias'::regclass
      and c.contype in ('u', 'p')
      and array_length(c.conkey, 1) = 1
      and a.attname = 'nombre'
  ) then
    select string_agg(nombre, ', ')
      into faltantes
    from (select nombre from public.categorias group by nombre having count(*) > 1) d;
    if faltantes is not null then
      raise exception 'Hay categorias con nombre repetido; renombre o elimine los duplicados en Configuracion: %', faltantes;
    end if;
    alter table public.categorias add constraint categorias_nombre_key unique (nombre);
  end if;

  -- 1b. Solo si la columna sigue siendo el enum
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'movimientos'
      and column_name = 'categoria' and udt_name = 'categoria_egreso'
  ) then
    -- Todas las categorias ya usadas deben existir en el catalogo
    select string_agg(distinct m.categoria::text, ', ')
      into faltantes
    from public.movimientos m
    where m.categoria is not null
      and not exists (select 1 from public.categorias c where c.nombre = m.categoria::text);
    if faltantes is not null then
      raise exception 'Crear primero en el catalogo de categorias (Configuracion): %', faltantes;
    end if;

    -- La vista opcional proyectos_enriquecidos (si existe) depende de la columna.
    -- to_regclass devuelve null si no existe (un cast ::regclass fallaria).
    vista_def := pg_get_viewdef(to_regclass('public.proyectos_enriquecidos'), true);
    if vista_def is not null then
      drop view public.proyectos_enriquecidos;
    end if;

    alter table public.movimientos
      alter column categoria type text using categoria::text;

    if vista_def is not null then
      execute 'create view public.proyectos_enriquecidos with (security_invoker = true) as ' || vista_def;
    end if;

    drop type if exists public.categoria_egreso;
  end if;

  -- 1c. FK (renombrar una categoria en el catalogo actualiza sus movimientos;
  --     no se puede borrar una categoria que tenga movimientos)
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.movimientos'::regclass and conname = 'movimientos_categoria_fkey'
  ) then
    alter table public.movimientos
      add constraint movimientos_categoria_fkey
      foreign key (categoria) references public.categorias (nombre)
      on update cascade on delete restrict;
  end if;
end $$;

-- ---------------------------------------------------------------------
-- 2. fecha_pago permitida en egresos generales (nullable: las filas
--    anteriores quedan sin fecha y la app muestra su fecha de registro)
-- ---------------------------------------------------------------------
alter table public.movimientos drop constraint if exists movimientos_forma_valida;

alter table public.movimientos add constraint movimientos_forma_valida check (
  (tipo = 'ingreso' and tipo_egreso is null
    and proyecto_id is not null and nombre_ingreso is not null and fecha_pago is not null
    and categoria is null and orden_compra_id is null and proveedor_id is null
    and mes_admin is null and anio_admin is null)
  or
  (tipo = 'egreso' and tipo_egreso = 'egreso-general'
    and proyecto_id is not null and categoria is not null
    and nombre_ingreso is null
    and mes_admin is null and anio_admin is null)
  or
  (tipo = 'egreso' and tipo_egreso = 'egreso-administrativo'
    and proyecto_id is null and mes_admin is not null and anio_admin is not null
    and nombre_ingreso is null and fecha_pago is null
    and categoria is null and orden_compra_id is null and proveedor_id is null)
);

-- ---------------------------------------------------------------------
-- 3. Verificacion: debe mostrar data_type = text y la FK creada
-- ---------------------------------------------------------------------
select column_name, data_type, udt_name
from information_schema.columns
where table_schema = 'public' and table_name = 'movimientos' and column_name = 'categoria';

select conname, pg_get_constraintdef(oid)
from pg_constraint
where conrelid = 'public.movimientos'::regclass
  and conname in ('movimientos_categoria_fkey', 'movimientos_forma_valida');
