# PLAN BASE DE DATOS SUPABASE — Ipsum2

Diseño de base de datos relacional (Postgres/Supabase) para reemplazar el almacenamiento actual (arreglos en memoria + `backend/seed-data.json`, ver `backend/src/persistencia.ts`), y configuración de Row Level Security (RLS) para que la base quede segura por defecto.

**Contexto crítico:** hoy la app no tiene ningún usuario ni autenticación (el login en `app/login/page.jsx` es solo cosmético — `handleSubmit` hace un `setTimeout` y no llama a ningún backend, ver líneas 88-96). Este documento asume que se introduce autenticación real (Supabase Auth) como parte de la migración, porque **RLS sin usuarios autenticados no tiene sentido** — sin eso, la única defensa sería el `anon key`, que nunca debe tener permisos de escritura sobre datos financieros.

---

## 1. Mapeo del modelo actual → modelo relacional

| Hoy (en memoria / JSON) | Ubicación | Pasa a ser |
|---|---|---|
| `proyectos: Proyecto[]` | `backend/src/services/proyectos.ts` | tabla `proyectos` |
| `movimientos: Movimiento[]` (unión discriminada) | `backend/src/services/movimientos.ts` | tabla `movimientos` con `CHECK` que valida la forma |
| `catalogos["ordenes-compra"/"proveedores"/"contratistas"]` | `backend/src/services/catalogos.ts` | tablas `ordenes_compra`, `proveedores`, `contratistas` |
| `bonos: Bono[]` con `subtipos` anidados | `backend/src/services/bonos.ts` | tablas `bonos` + `subtipos_bono` |
| Catálogo de cuentas en `localStorage` | `lib/cuentasBancarias.ts` | tabla `cuentas_bancarias` (ver PLAN CONTROL DE CUENTAS.md, bloque B1) |
| — (no existe) | — | tabla `perfiles` (usuarios + rol) — **nueva**, requisito para RLS |
| Campos derivados calculados en request (`gastadoManoObra`, `totalIngresos`, etc.) | `services/proyectos.ts#enriquecerProyecto` | vista `proyectos_enriquecidos` (opcional, recomendado) |

---

## 2. Convenciones

- `snake_case` para tablas/columnas (Postgres es case-sensitive con comillas; evita dolores de cabeza).
- `uuid` como PK expuesta vía API en lugar de enteros secuenciales: dado que estos datos (montos, proyectos) son financieros y se exponen por REST, un ID secuencial permite enumerar registros (`/proyectos/1`, `/proyectos/2`...); el volumen de filas de esta app (cientos/miles, un solo negocio) es demasiado bajo para que la fragmentación de índice de UUIDv4 importe en la práctica. Si el proyecto creciera mucho, migrar a `bigint identity` internamente + un `uuid` público sería la siguiente evolución.
- `text` en vez de `varchar(n)` (mismo rendimiento en Postgres, sin límites artificiales).
- `timestamptz`, nunca `timestamp`, para todo lo que sea fecha/hora de auditoría.
- `numeric(14,2)` para dinero (nunca `float`/`double precision`) — evita errores de punto flotante en sumas acumuladas de muchos movimientos.
- Cada tabla mutable por usuarios tiene `creado_por uuid references auth.users(id)` para trazabilidad mínima.
- Nombres únicos "case-insensitive" (p. ej. bonos, catálogos, cuentas bancarias) se implementan con un índice único sobre `lower(nombre)`, no con `unique(nombre)` a secas.

Extensión necesaria (ya viene habilitada en proyectos nuevos de Supabase, se declara por completitud):

```sql
create extension if not exists pgcrypto; -- gen_random_uuid()
```

---

## 3. Modelo de usuarios y roles (prerrequisito de RLS)

Roles propuestos, alineados con el uso real de la app (un dueño/administrador — Felipe — y personal que carga datos):

- **admin**: acceso total, incluida gestión de catálogos y usuarios.
- **editor**: puede crear/editar proyectos, movimientos y catálogos, pero no borrar registros financieros ni gestionar usuarios.
- **lector**: solo lectura (p. ej. un contador externo que solo necesita ver el dashboard/conciliación).

```sql
create type public.rol_usuario as enum ('admin', 'editor', 'lector');

create table public.perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null,
  rol public.rol_usuario not null default 'lector',
  activo boolean not null default true,
  creado_en timestamptz not null default now()
);
```

Alta automática de perfil cuando se crea un usuario en `auth.users` (por defecto con el rol menos privilegiado — el `admin` se promueve a mano desde el panel de Supabase o por otro admin, nunca por auto-registro):

```sql
create or replace function public.manejar_nuevo_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfiles (id, nombre, rol)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'nombre', new.email), 'lector');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.manejar_nuevo_usuario();
```

Funciones auxiliares para políticas RLS (viven en un esquema `private` para que **no** queden expuestas por la API de PostgREST):

```sql
create schema if not exists private;

create or replace function private.rol_actual()
returns public.rol_usuario
language sql
security definer
set search_path = ''
stable
as $$
  select rol from public.perfiles
  where id = (select auth.uid()) and activo;
$$;

create or replace function private.es_admin()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select (select private.rol_actual()) = 'admin';
$$;

create or replace function private.puede_editar()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select (select private.rol_actual()) in ('admin', 'editor');
$$;

-- Solo "authenticated" puede invocarlas (las usan las policies, que se evalúan
-- con los privilegios de quien hace la consulta, no del dueño de la función:
-- SECURITY DEFINER cambia el contexto de EJECUCIÓN del cuerpo, no si el rol
-- que llama tiene permiso de invocarla). "anon" nunca debe poder llamarlas.
revoke execute on function private.rol_actual() from public, anon;
revoke execute on function private.es_admin() from public, anon;
revoke execute on function private.puede_editar() from public, anon;
grant execute on function private.rol_actual() to authenticated;
grant execute on function private.es_admin() to authenticated;
grant execute on function private.puede_editar() to authenticated;
```

Protección contra auto-escalada de privilegios (un usuario no puede otorgarse `rol = 'admin'` a sí mismo editando su propio perfil):

```sql
create or replace function public.evitar_autoescalada_rol()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.rol is distinct from old.rol and not (select private.es_admin()) then
    raise exception 'No tienes permiso para cambiar el rol';
  end if;
  return new;
end;
$$;

create trigger perfiles_evitar_autoescalada
  before update on public.perfiles
  for each row execute function public.evitar_autoescalada_rol();
```

---

## 4. Tablas de dominio

### 4.1 Catálogos simples (`contratistas`, `proveedores`, `ordenes_compra`, `cuentas_bancarias`, `bonos`)

Mismo patrón que hoy en `backend/src/services/catalogos.ts` y `backend/src/services/bonos.ts`, pero con unicidad real en la base:

```sql
create table public.contratistas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  activo boolean not null default true,
  creado_en timestamptz not null default now(),
  creado_por uuid references auth.users(id)
);
create unique index contratistas_nombre_unq on public.contratistas (lower(nombre));

create table public.proveedores (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  activo boolean not null default true,
  creado_en timestamptz not null default now(),
  creado_por uuid references auth.users(id)
);
create unique index proveedores_nombre_unq on public.proveedores (lower(nombre));

create table public.ordenes_compra (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  activo boolean not null default true,
  creado_en timestamptz not null default now(),
  creado_por uuid references auth.users(id)
);
create unique index ordenes_compra_nombre_unq on public.ordenes_compra (lower(nombre));

-- Ver PLAN CONTROL DE CUENTAS.md (bloque B1): solo el catálogo se persiste,
-- el saldo digitado en /stats es efímero por decisión de negocio ya tomada.
create table public.cuentas_bancarias (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  activa boolean not null default true,
  creado_en timestamptz not null default now(),
  creado_por uuid references auth.users(id)
);
create unique index cuentas_bancarias_nombre_unq on public.cuentas_bancarias (lower(nombre));

create table public.bonos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  creado_en timestamptz not null default now(),
  creado_por uuid references auth.users(id)
);
create unique index bonos_nombre_unq on public.bonos (lower(nombre));

create table public.subtipos_bono (
  id uuid primary key default gen_random_uuid(),
  bono_id uuid not null references public.bonos(id) on delete cascade,
  nombre text not null,
  creado_en timestamptz not null default now(),
  unique (id, bono_id) -- soporta la FK compuesta de proyectos (ver 4.2)
);
create index subtipos_bono_bono_id_idx on public.subtipos_bono (bono_id);
create unique index subtipos_bono_nombre_unq on public.subtipos_bono (bono_id, lower(nombre));
```

### 4.2 `proyectos`

```sql
create type public.estado_proyecto as enum ('Revisión', 'Finalizado');

create table public.proyectos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  presupuesto numeric(14,2) not null check (presupuesto > 0),
  presupuesto_mano_obra numeric(14,2) not null check (presupuesto_mano_obra > 0),
  contratista_id uuid references public.contratistas(id) on delete set null,
  anio_asignacion smallint not null check (anio_asignacion between 2000 and 2100),
  mes_asignacion smallint not null check (mes_asignacion between 1 and 12),
  estado public.estado_proyecto not null default 'Revisión',
  bono_id uuid not null references public.bonos(id) on delete restrict,
  subtipo_bono_id uuid not null references public.subtipos_bono(id) on delete restrict,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  creado_por uuid references auth.users(id),

  constraint proyectos_mo_no_supera_presupuesto
    check (presupuesto_mano_obra <= presupuesto),

  -- Garantiza que el subtipo elegido pertenezca al bono elegido (hoy esto
  -- NO se valida ni en el frontend ni en el backend, ver REVISION DEL BACKEND.md)
  constraint proyectos_subtipo_pertenece_a_bono
    foreign key (subtipo_bono_id, bono_id)
    references public.subtipos_bono (id, bono_id)
);

create index proyectos_contratista_id_idx on public.proyectos (contratista_id);
create index proyectos_bono_id_idx on public.proyectos (bono_id);
create index proyectos_subtipo_bono_id_idx on public.proyectos (subtipo_bono_id);
create index proyectos_mes_anio_idx on public.proyectos (anio_asignacion, mes_asignacion);
create index proyectos_estado_idx on public.proyectos (estado);

create or replace function public.set_actualizado_en()
returns trigger language plpgsql as $$
begin
  new.actualizado_en = now();
  return new;
end;
$$;

create trigger proyectos_set_actualizado_en
  before update on public.proyectos
  for each row execute function public.set_actualizado_en();
```

> **Nota de diseño:** `mesAsignacion`/`anioAsignacion` hoy son strings libres validados contra un arreglo de nombres de mes en español (`backend/src/utils/fechas.ts`). Aquí se modelan como `smallint` (1-12) + año — evita bugs de acentos/mayúsculas ("Setiembre" vs "Septiembre") y permite rangos e índices reales. El nombre en español se deriva en la capa de aplicación o con una función `to_char`/lookup, nunca se almacena como texto.

### 4.3 `movimientos`

Hoy es una unión discriminada en TypeScript (`backend/src/validators/movimientos.ts:19-44`); en Postgres se modela como una sola tabla con columnas nulleables según el tipo, más un `CHECK` que reproduce exactamente esa unión a nivel de base — así ni un bug en la validación de la app, ni una edición manual, pueden dejar una fila en un estado inconsistente.

```sql
create type public.tipo_movimiento as enum ('ingreso', 'egreso');
create type public.tipo_egreso as enum ('egreso-general', 'egreso-administrativo');
create type public.categoria_egreso as enum
  ('Mano de Obra', 'Materiales', 'Equipamiento', 'Servicios', 'Otros');

create table public.movimientos (
  id uuid primary key default gen_random_uuid(),
  tipo public.tipo_movimiento not null,
  tipo_egreso public.tipo_egreso,
  proyecto_id uuid references public.proyectos(id) on delete restrict,
  monto numeric(14,2) not null check (monto > 0),
  descripcion text not null,

  -- solo cuando tipo = 'ingreso'
  nombre_ingreso text,
  fecha_pago date,

  -- solo cuando tipo_egreso = 'egreso-general'
  categoria public.categoria_egreso,
  orden_compra_id uuid references public.ordenes_compra(id) on delete set null,

  -- solo cuando tipo_egreso = 'egreso-administrativo'
  mes_admin smallint check (mes_admin between 1 and 12),
  anio_admin smallint check (anio_admin between 2000 and 2100),

  creado_en timestamptz not null default now(),
  creado_por uuid references auth.users(id),

  constraint movimientos_forma_valida check (
    (tipo = 'ingreso' and tipo_egreso is null
      and proyecto_id is not null and nombre_ingreso is not null and fecha_pago is not null
      and categoria is null and orden_compra_id is null
      and mes_admin is null and anio_admin is null)
    or
    (tipo = 'egreso' and tipo_egreso = 'egreso-general'
      and proyecto_id is not null and categoria is not null
      and nombre_ingreso is null and fecha_pago is null
      and mes_admin is null and anio_admin is null)
    or
    (tipo = 'egreso' and tipo_egreso = 'egreso-administrativo'
      and proyecto_id is null and mes_admin is not null and anio_admin is not null
      and nombre_ingreso is null and fecha_pago is null
      and categoria is null and orden_compra_id is null)
  )
);

create index movimientos_proyecto_id_idx on public.movimientos (proyecto_id);
create index movimientos_tipo_idx on public.movimientos (tipo, tipo_egreso);
create index movimientos_orden_compra_id_idx on public.movimientos (orden_compra_id);
create index movimientos_creado_en_idx on public.movimientos (creado_en);
create index movimientos_mes_admin_idx
  on public.movimientos (anio_admin, mes_admin)
  where tipo_egreso = 'egreso-administrativo';
```

**Corrección de un bug real de atribución de fecha** (detallado en `REVISION DEL BACKEND.md`, sección de hallazgos): hoy `calcularDashboard`, `calcularDistribucionAdministrativa` y `calcularStats` agrupan **todos** los movimientos por el mes/año de `creadoEn` (la marca de tiempo de inserción), ignorando tanto `fechaPago` (ingresos) como `mes`/`ano` (egresos administrativos) que el usuario sí eligió al crear el movimiento. Se recomienda una columna generada que unifique el criterio, y que todas las agregaciones futuras usen **esa** columna en vez de `creado_en`:

```sql
alter table public.movimientos
  add column fecha_movimiento date generated always as (
    case
      when tipo = 'ingreso' then fecha_pago
      when tipo_egreso = 'egreso-administrativo' then make_date(anio_admin::int, mes_admin::int, 1)
      else creado_en::date
    end
  ) stored;

create index movimientos_fecha_movimiento_idx on public.movimientos (fecha_movimiento);
```

### 4.4 Vista de apoyo (opcional, recomendada)

Replica `enriquecerProyecto` (`backend/src/services/proyectos.ts:48-68`) como agregación en SQL en lugar de traer todos los movimientos a Node y reducirlos ahí:

```sql
create view public.proyectos_enriquecidos
with (security_invoker = true) as
select
  p.*,
  coalesce(sum(m.monto) filter (where m.tipo = 'ingreso'), 0) as total_ingresos,
  coalesce(sum(m.monto) filter (
    where m.tipo = 'egreso' and m.tipo_egreso = 'egreso-general'), 0) as total_egresos,
  coalesce(sum(m.monto) filter (where m.categoria = 'Mano de Obra'), 0) as gastado_mano_obra,
  coalesce(sum(m.monto) filter (where m.tipo = 'ingreso'), 0)
    - coalesce(sum(m.monto) filter (
        where m.tipo = 'egreso' and m.tipo_egreso = 'egreso-general'), 0) as ganancia
from public.proyectos p
left join public.movimientos m on m.proyecto_id = p.id
group by p.id;
```

> **`security_invoker = true` no es opcional.** Sin esa cláusula, una vista en Postgres/Supabase se ejecuta con los privilegios de quien la creó (normalmente un rol con permisos amplios) e **ignora silenciosamente el RLS** de las tablas subyacentes — es el error de seguridad más común al añadir vistas sobre tablas con RLS. Toda vista nueva debe declararla.

---

## 5. Row Level Security — configuración segura

### 5.1 Reglas generales (aplican a **todas** las tablas de arriba)

```sql
alter table public.perfiles            enable row level security;
alter table public.contratistas        enable row level security;
alter table public.proveedores         enable row level security;
alter table public.ordenes_compra      enable row level security;
alter table public.cuentas_bancarias   enable row level security;
alter table public.bonos               enable row level security;
alter table public.subtipos_bono       enable row level security;
alter table public.proyectos           enable row level security;
alter table public.movimientos         enable row level security;

-- FORCE hace que hasta el dueño de la tabla (rol usado por migraciones/psql)
-- quede sujeto a las políticas. No afecta a service_role (ver 5.4): ese rol
-- tiene el atributo BYPASSRLS y se salta RLS pase lo que pase, por diseño de Supabase.
alter table public.perfiles            force row level security;
alter table public.contratistas        force row level security;
alter table public.proveedores         force row level security;
alter table public.ordenes_compra      force row level security;
alter table public.cuentas_bancarias   force row level security;
alter table public.bonos               force row level security;
alter table public.subtipos_bono       force row level security;
alter table public.proyectos           force row level security;
alter table public.movimientos         force row level security;
```

**Regla de oro para esta app: nunca crear una política `to anon`.** Es una herramienta 100% interna (sin vista pública), así que el rol `anon` no debe tener acceso a ninguna fila de ninguna tabla de negocio. Sin política para `anon`, Postgres deniega por defecto — eso ya es lo que se quiere.

Optimización de rendimiento obligatoria en toda política: envolver `auth.uid()` y las funciones auxiliares en `(select ...)` para que Postgres las evalúe una sola vez por consulta en vez de una vez por fila (diferencia de hasta 100x en tablas grandes).

### 5.2 Catálogos (`bonos`, `subtipos_bono`, `contratistas`, `proveedores`, `ordenes_compra`, `cuentas_bancarias`)

Mismo patrón para las seis tablas — cualquier usuario con perfil activo puede leer (los necesita para los `<select>` del formulario de proyecto/movimiento); crear/editar requiere `editor` o `admin`; borrar requiere `admin` (evita que un editor rompa la integridad referencial de proyectos/movimientos históricos que ya usan ese catálogo — además de que el `on delete restrict`/`cascade` de las FKs ya limita el daño).

```sql
-- Repetir cambiando <tabla> por cada una de las 6 tablas de catálogo
create policy "<tabla>_select" on public.<tabla>
  for select to authenticated
  using ( (select private.rol_actual()) is not null );

create policy "<tabla>_insert" on public.<tabla>
  for insert to authenticated
  with check ( (select private.puede_editar()) );

create policy "<tabla>_update" on public.<tabla>
  for update to authenticated
  using ( (select private.puede_editar()) )
  with check ( (select private.puede_editar()) );

create policy "<tabla>_delete" on public.<tabla>
  for delete to authenticated
  using ( (select private.es_admin()) );
```

### 5.3 `proyectos` y `movimientos`

```sql
create policy "proyectos_select" on public.proyectos
  for select to authenticated
  using ( (select private.rol_actual()) is not null );

create policy "proyectos_insert" on public.proyectos
  for insert to authenticated
  with check ( (select private.puede_editar()) );

create policy "proyectos_update" on public.proyectos
  for update to authenticated
  using ( (select private.puede_editar()) )
  with check ( (select private.puede_editar()) );

-- Sin política de DELETE a propósito: hoy el backend tampoco expone un
-- DELETE /proyectos/:id (ver backend/src/routes/proyectos.ts). Si algún día
-- se necesita, usar un soft-delete (columna "activo") en vez de borrar filas
-- referenciadas por movimientos históricos.

create policy "movimientos_select" on public.movimientos
  for select to authenticated
  using ( (select private.rol_actual()) is not null );

create policy "movimientos_insert" on public.movimientos
  for insert to authenticated
  with check ( (select private.puede_editar()) );

create policy "movimientos_update" on public.movimientos
  for update to authenticated
  using ( (select private.puede_editar()) )
  with check ( (select private.puede_editar()) );

-- A diferencia del backend actual (que permite DELETE a cualquiera, ver
-- backend/src/controllers/movimientos.ts:34-38), aquí se restringe a admin:
-- borrar un movimiento contable es un evento sensible.
create policy "movimientos_delete" on public.movimientos
  for delete to authenticated
  using ( (select private.es_admin()) );
```

### 5.4 `perfiles`

```sql
create policy "perfiles_select" on public.perfiles
  for select to authenticated
  using ( id = (select auth.uid()) or (select private.es_admin()) );

create policy "perfiles_update" on public.perfiles
  for update to authenticated
  using ( id = (select auth.uid()) or (select private.es_admin()) )
  with check ( id = (select auth.uid()) or (select private.es_admin()) );
  -- el cambio de "rol" ya está bloqueado a nivel de trigger (sección 3),
  -- así que esta policy no necesita duplicar esa lógica.

create policy "perfiles_insert_admin" on public.perfiles
  for insert to authenticated
  with check ( (select private.es_admin()) );

create policy "perfiles_delete_admin" on public.perfiles
  for delete to authenticated
  using ( (select private.es_admin()) );
```

### 5.5 Privilegios de esquema (segunda capa, además de RLS)

RLS filtra **filas**; los `GRANT`/`REVOKE` de Postgres controlan qué **operaciones** puede siquiera intentar cada rol sobre una tabla. Hay que configurar ambos:

```sql
revoke all on schema public from public, anon;
grant usage on schema public to authenticated;

revoke all on all tables in schema public from public, anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
-- RLS sigue decidiendo qué filas ve/toca "authenticated" realmente;
-- este GRANT solo evita un "permission denied" para operaciones legítimas.

alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;
```

`service_role` (la clave usada solo desde un backend/servidor de confianza, **nunca** en el navegador) **siempre** se salta RLS por diseño de Supabase (tiene el atributo `BYPASSRLS`). Si el Express actual (`backend/src/server.ts`) se mantiene como intermediario, debe:
- usar el **access token del usuario final** (no `service_role`) al hablar con Supabase, para que RLS siga aplicando por usuario, o
- si usa `service_role` por conveniencia, reimplementar en Express el mismo control de roles que aquí se modela en SQL — porque en ese caso RLS deja de ser una segunda capa real (queda solo la capa de aplicación).

---

## 6. Checklist de seguridad para producción

- [ ] RLS **enabled + forced** en las 9 tablas (sección 5.1).
- [ ] Ninguna política creada `to anon` en ninguna tabla de negocio.
- [ ] Toda vista nueva declarada con `security_invoker = true` (sección 4.4) — de lo contrario ignora RLS sin avisar.
- [ ] Funciones `SECURITY DEFINER` con `set search_path = ''` (evita secuestro de `search_path`) y viviendo en el esquema `private` (no expuesto por PostgREST), con `EXECUTE` revocado a `anon`.
- [ ] `perfiles.rol` protegido contra auto-escalada (trigger de la sección 3), verificado con una prueba manual: un usuario `lector` no puede convertirse en `admin` vía `UPDATE`.
- [ ] Auto-registro de usuarios **desactivado** en Supabase Auth (Settings → Auth → Allow new users to sign up = off); las cuentas las crea un admin. Esta es una app interna de un solo negocio, no tiene sentido exponer un signup público.
- [ ] Protección contra contraseñas filtradas ("Leaked password protection") activada en Supabase Auth.
- [ ] MFA habilitado al menos para la cuenta `admin`.
- [ ] Expiración corta de JWT + rotación de refresh tokens (config. por defecto de Supabase, verificar que no se haya alargado).
- [ ] La clave `service_role` **nunca** en variables `NEXT_PUBLIC_*` ni en el bundle del frontend — solo en el entorno del backend/servidor.
- [ ] Backups / Point-in-Time Recovery habilitados (son datos financieros); probar una restauración al menos una vez.
- [ ] CORS del Express actual (`app.use(cors())` en `backend/src/server.ts:20`, hoy sin restricción de origen) limitado al dominio real del frontend antes de exponer el backend públicamente — hoy cualquier sitio web puede llamar a la API desde el navegador de quien sea.
- [ ] Índices en toda columna usada dentro de una política RLS o de un `JOIN` frecuente (ya incluidos en las secciones 4.1-4.3).
- [ ] Rotar cualquier clave de Supabase que se haya llegado a commitear alguna vez en el repositorio (revisar `git log` de `.env*` antes de ir a producción).

---

## 7. Migración de datos desde `backend/seed-data.json`

Pasos sugeridos, sin automatizarlos aún (se documentan para cuando se decida ejecutar la migración):

1. Crear primero `bonos`/`subtipos_bono`/`contratistas` a partir de los valores **únicos** que aparecen hoy como texto libre en `proyectos[].bono`, `proyectos[].subtipoBono` y `proyectos[].contratista` — hoy no hay garantía de que esos strings sean consistentes entre sí (ver hallazgo en `REVISION DEL BACKEND.md`), así que este paso probablemente requiera limpieza manual de duplicados/typos antes de insertar.
2. Insertar `proyectos`, resolviendo `bono`/`subtipoBono`/`contratista` a sus nuevos `uuid` por nombre.
3. Insertar `movimientos`, resolviendo `proyectoId` al nuevo `uuid` de proyecto y `ordenCompra` (hoy texto libre) al `uuid` de `ordenes_compra` correspondiente (crear la orden en el catálogo si no existe todavía, dado que hoy no hay ese control — ver hallazgo relacionado en la revisión del backend).
4. Sembrar `cuentas_bancarias` con los 3 valores por defecto (Banco Nacional, BAC, Mutual) tal como especifica PLAN CONTROL DE CUENTAS.md.
5. Crear el primer usuario `admin` a mano desde el dashboard de Supabase y actualizar su fila en `perfiles` (`update perfiles set rol = 'admin' where id = '<uuid del usuario>'`).
