# REVISIÓN DEL BACKEND — Ipsum2

Análisis del backend actual (`backend/src/`): qué funciona bien, qué errores/riesgos tiene, qué cambiaría y qué patrones aplicaría según la funcionalidad concreta de esta app (control financiero de proyectos, sin usuarios ni base de datos real todavía). Complementa `PLAN BASE DE DATOS SUPABASE.md` (a dónde migrar los datos) y no reemplaza `PLAN AGOSTO.md`/`PLAN CONTROL DE CUENTAS.md` (qué features faltan) — este documento se enfoca en **cómo está construido** lo que ya existe.

---

## 1. Cómo está armado hoy (resumen)

Cada dominio (`proyectos`, `movimientos`, `dashboard`, `stats`, `catalogos`, `bonos`) sigue el mismo patrón de 4 capas: `routes/` → `controllers/` → `services/` (lógica + arreglos en memoria) → `validators/` (parseo/validación manual). Todo se persiste reescribiendo `backend/seed-data.json` completo después de cada mutación (`backend/src/persistencia.ts:29-37`). No hay base de datos, no hay autenticación, no hay tests.

---

## 2. Aciertos

1. **Capas consistentes en los 6 dominios.** El mismo patrón routes/controllers/services/validators se repite sin excepciones, lo que hace el código muy predecible: para entender cualquier endpoint nuevo basta con conocer uno. Esto también significa que migrar la capa `services/` a Postgres (ver `PLAN BASE DE DATOS SUPABASE.md`) puede hacerse dominio por dominio sin tocar routes/controllers.
2. **Sobre de respuesta uniforme.** Todo endpoint responde `{ success: true, data }` o `{ success: false, error: { code, message } }` (`backend/src/middlewares/errorHandler.ts`), y `lib/api.ts:16-20` lo desempaqueta en un solo lugar. El frontend nunca tiene que inspeccionar formas de respuesta distintas por endpoint.
3. **Campos derivados nunca persistidos.** `ganancia`, `totalIngresos`, `totalEgresos`, `gastadoManoObra` se recalculan siempre desde `movimientos` (`backend/src/services/proyectos.ts:48-68`) en vez de guardarse en el proyecto. Evita el bug clásico de "el total no cuadra porque quedó desactualizado" que aparece cuando se denormaliza sin disciplina.
4. **Reutilización explícita de la lógica de prorrateo.** `calcularDistribucionAdministrativa` (`backend/src/services/dashboard.ts:47-71`) se usa tanto en el dashboard como en el detalle de proyecto (`backend/src/controllers/proyectos.ts:14-17`), con un comentario que documenta la decisión (`/* C5: ... */`). Es la clase de reutilización de lógica de negocio que suele duplicarse por accidente.
5. **Tipos como unión discriminada.** `CrearMovimientoInput` (`backend/src/validators/movimientos.ts:19-44`) modela con precisión las tres formas reales de un movimiento (ingreso / egreso-general / egreso-administrativo) usando el sistema de tipos de TypeScript, y el resto del código (`services/dashboard.ts`, `services/stats.ts`) se apoya en ese discriminante con type guards en vez de casteos.
6. **Un solo cliente HTTP tipado en el frontend.** `lib/api.ts` centraliza cada llamada y su tipo de retorno; no hay `fetch` sueltos en componentes.
7. **Documentación de planes inusualmente completa.** `PLAN AGOSTO.md` y `PLAN CONTROL DE CUENTAS.md` documentan contexto de negocio, reglas exactas, archivos afectados y pasos de verificación antes de escribir código. Vale la pena mantener ese estándar para lo que salga de esta revisión.

---

## 3. Problemas encontrados

### Críticos

**C1 — No existe autenticación en ningún nivel.** El login (`app/login/page.jsx:88-96`) es cosmético: `handleSubmit` valida el formulario y hace `setTimeout(...)`, sin llamar a ningún backend ni a Supabase Auth (que sí está instalado como dependencia, `backend/package.json:12-13`, pero no se usa en `backend/src`). El Express tampoco tiene ningún middleware de autenticación/autorización. **Cualquiera que alcance el puerto 4000 puede leer, crear, editar o borrar cualquier proyecto o movimiento financiero.**
- Escenario de fallo: el backend se despliega accesible desde internet (necesario para que el frontend en producción le hable) → cualquier persona con la URL puede hacer `DELETE /movimientos/:id` sobre datos reales sin ninguna credencial.

**C2 — CORS completamente abierto.** `app.use(cors())` sin opciones (`backend/src/server.ts:20`) refleja cualquier origen. Combinado con C1, cualquier página web (no solo el frontend legítimo) puede hacer fetch al API desde el navegador de cualquier visitante.

**C3 — Persistencia en un solo archivo, en un solo proceso, sin atomicidad.** `guardarEstado()` (`backend/src/persistencia.ts:29-37`) reescribe *todo* el estado (proyectos + movimientos + catálogos + bonos) en cada mutación individual, con `writeFileSync` directo sobre `seed-data.json` (no escribe a un archivo temporal y renombra). Si el proceso muere a mitad de la escritura, el JSON queda corrupto y la app no vuelve a levantar. Además, el estado vive en arreglos de módulo (`backend/src/services/movimientos.ts:10`, etc.) — funciona con exactamente **un** proceso Node; no soporta más de una instancia (ni siquiera un `pm2 cluster` o un despliegue serverless con más de un contenedor).

### Altos

**H1 — Falta de integridad referencial entre proyecto y catálogos.** `validarCrearProyecto` (`backend/src/validators/proyectos.ts:75-88`) solo valida que `bono`, `subtipoBono` y `contratista` sean strings no vacíos — **nunca** verifica que ese `bono`/`subtipoBono` exista en el catálogo `bonos`, ni que `contratista` exista en `catalogos["contratistas"]`. Se puede crear un proyecto con `bono: "cualquier texto"` que no aparece en ningún lado del catálogo real.
- Escenario de fallo: un typo al escribir el bono en el formulario crea un proyecto "huérfano" que nunca aparecerá agrupado con el resto de proyectos de ese bono en reportes futuros, y no hay forma de detectarlo sin revisar manualmente.

**H2 — `ordenCompra` es texto libre no validado contra el catálogo.** `validators/movimientos.ts:107` acepta cualquier string para `ordenCompra` en un egreso general, pese a que ya existe un catálogo `ordenes-compra` (`backend/src/services/catalogos.ts`) pensado exactamente para esto. Mismo tipo de problema que H1.

**H3 — Inconsistencia en qué fecha atribuye un movimiento a un mes.** El usuario elige `fechaPago` al crear un ingreso (`validators/movimientos.ts:86-89`) y `mes`/`ano` al crear un egreso administrativo (`validators/movimientos.ts:112-119`) — pero **ninguno de los dos se usa** para las agregaciones: `calcularDashboard` (`services/dashboard.ts:77-80`), `calcularDistribucionAdministrativa` (`services/dashboard.ts:52-57`) y `calcularStats` (`services/stats.ts:27-29`) agrupan siempre por `mesAnioDe(m.creadoEn)`, es decir, por la fecha en que el registro se **insertó** en el sistema, no por la fecha de negocio que el usuario indicó.
- Escenario de fallo: alguien carga en agosto un egreso administrativo y elige "mes: Julio" (porque así ocurrió en la realidad) — el dashboard de julio no lo va a mostrar; aparecerá en agosto igual. El campo `mes`/`ano` que el usuario llenó queda guardado pero es efectivamente decorativo para el cálculo.

**H4 — Cero pruebas automatizadas.** No hay ningún archivo de test ni script `test` en `package.json` (ni en la raíz ni en `backend/`). Las funciones más riesgosas de todo el proyecto — `enriquecerProyecto`, `calcularDistribucionAdministrativa`, `calcularDashboard`, `calcularStats`, `esMesCerrado` — son las que hacen la aritmética financiera que Felipe usa para tomar decisiones, y hoy dependen enteramente de revisión visual.

**H5 — Manejo de errores síncrono, frágil ante una futura migración a async.** Todo el código actual es síncrono, así que Express 4 captura automáticamente los `throw` dentro de los controllers y los enruta al middleware de error. En el momento en que `services/*.ts` pase a llamar a Postgres/Supabase (inevitablemente `async`), cualquier `await` sin un `try/catch` o un wrapper `asyncHandler` deja de propagar el error al middleware — se vuelve una promesa rechazada sin manejar, silenciosa. Esto no es un bug hoy, pero es una trampa ya sembrada para la migración de base de datos.

**H6 — Sin paginación en ningún listado.** `GET /proyectos`, `GET /movimientos`, `GET /bonos`, `GET /catalogos/:tipo` devuelven el arreglo completo siempre. Funciona con los volúmenes actuales; no escala.

**H7 — Sin auditoría ni soft delete.** `eliminarMovimiento` (`services/movimientos.ts:60-66`) hace `splice` — el registro desaparece para siempre, sin dejar rastro de quién lo borró ni cuándo. Para una app cuyo propósito es "que el dinero cuadre" (ver `PLAN CONTROL DE CUENTAS.md`), no tener trazabilidad de ediciones/borrados es una limitación seria una vez que haya más de una persona cargando datos.

### Medios

**M1 — Validación duplicada a mano en cada validador.** `toTrimmedString`/`toNumber` están copiados casi idénticos en `validators/proyectos.ts:20-33` y `validators/movimientos.ts:46-59`. Cada regla nueva (rango, formato, enum) se reescribe a mano en vez de declararse una vez.

**M2 — La regla de negocio "montos en colones enteros" no se aplica en el backend.** `PLAN CONTROL DE CUENTAS.md:36` documenta explícitamente que los montos son "colones enteros (solo dígitos)", pero `toNumber` (`validators/movimientos.ts:52-59`) acepta cualquier número finito, incluyendo decimales. Hoy no rompe nada porque el frontend solo envía enteros, pero el backend no lo garantiza — es una regla de negocio documentada que vive únicamente en la disciplina del frontend.

**M3 — Migración de datos legacy incrustada permanentemente en runtime.** `restaurarProyectos` (`services/proyectos.ts:96-103`) parchea cada proyecto viejo con `presupuestoManoObra: 0, contratista: "-"` en **cada arranque del servidor**, para siempre. Es un buen parche puntual, pero si nunca se convierte en una migración de una sola vez sobre `seed-data.json`, queda como código muerto-pero-necesario indefinidamente y nadie recuerda por qué está ahí en un año.

**M4 — Dependencias de Supabase instaladas y sin usar.** `@supabase/ssr` y `@supabase/supabase-js` están en `backend/package.json:12-13` pero no se importan en ningún archivo de `backend/src`. O se están preparando a propósito para la migración (razonable, en ese caso vale la pena decirlo en un comentario o en el README) o son resto de un scaffold y conviene quitarlas para no confundir a quien lea el `package.json` pensando que ya hay integración con Supabase.

**M5 — Sin límites de tamaño de body, sin `helmet`, sin rate limiting.** `express.json()` (`server.ts:21`) usa el límite por defecto sin decisión explícita; no hay cabeceras de seguridad (`helmet`) ni límite de intentos en ninguna ruta. Poco riesgo mientras no haya autenticación que proteger, pero se vuelve relevante en cuanto exista un endpoint de login real.

**M6 — Doble configuración de ESLint en la raíz.** `eslint.config.mjs` (el que realmente usa `npm run lint`, basado en `eslint-config-next`) y `eslint.config.mts` (una plantilla genérica de `create-next-app`, aparentemente sin uso) conviven en el repo — confunde sobre cuál es la fuente de verdad.

### Bajos

**B1 — Catálogo `proveedores` sin ningún consumidor.** Existe el tipo `TipoCatalogo` con `"proveedores"` (`validators/catalogos.ts:3`) y su CRUD completo, pero ningún `movimiento` ni `proyecto` tiene un campo que lo referencie. O es una función a medio conectar en el frontend, o quedó de un alcance anterior.

**B2 — `GET /stats` marcado como legacy en la propia documentación del proyecto.** `PLAN CONTROL DE CUENTAS.md` (bloque B4) ya identifica que `backend/src/{routes,controllers,services}/stats.ts` no tiene consumidores desde que `/stats` se reemplazó por "Control de Cuentas", y propone borrarlo. Sigue en el árbol.

---

## 4. Qué cambiaría (priorizado)

### Quick wins (bajo esfuerzo, se pueden hacer ya, sin esperar a la migración de base de datos)

1. Restringir CORS a los orígenes reales del frontend (`cors({ origin: [...] })`) en vez de `cors()` a secas — corrige C2 sin ninguna dependencia nueva.
2. Validar `bono`/`subtipoBono`/`contratista` contra sus catálogos reales al crear/editar un proyecto (corrige H1), y `ordenCompra` contra `ordenes-compra` (corrige H2) — son `if` adicionales en los validators existentes, reutilizando los services de catálogos/bonos que ya existen.
3. Decidir explícitamente el criterio de fecha para agregaciones (H3): o se usa siempre `creadoEn` y se deja de pedirle `mes`/`ano`/`fechaPago` al usuario para ese propósito, o se cambian `calcularDashboard`/`calcularStats`/`calcularDistribucionAdministrativa` para usar esos campos. Cualquiera de las dos es mejor que la ambigüedad actual.
4. Hacer atómica la escritura de `seed-data.json` (escribir a `seed-data.json.tmp` + `renameSync`) — corrige la mitad de C3 con cambios mínimos en `persistencia.ts`.
5. `helmet()` + límite explícito de body en `express.json()`.
6. Borrar `eslint.config.mts` (M6) y decidir sobre `proveedores` (B1) y `stats.ts` (B2): usarlos o quitarlos.

### Estructurales (requieren más diseño, se benefician de secuenciarse)

1. **Autenticación real (Supabase Auth) + autorización por rol en Express**, verificando el JWT en un middleware y exponiendo `req.usuario`/`req.rol` a los controllers. Resuelve C1. Debe ir de la mano con el diseño de roles de `PLAN BASE DE DATOS SUPABASE.md` para que la regla no viva solo en el middleware de Express (si mañana alguien pega directo a Postgres, RLS es quien realmente protege los datos).
2. **Migrar la persistencia de `services/*.ts` de arreglos en memoria a Postgres/Supabase**, dominio por dominio — la separación en capas ya existente hace que esto sea, en el caso ideal, solo un cambio dentro de cada archivo `services/`, sin tocar `routes/`/`controllers/`/`validators/`. Resuelve C3 y H6 (paginación real vía `LIMIT`/`OFFSET` o cursor).
3. **Reemplazar la validación manual por un esquema declarativo (p. ej. Zod).** Colapsa la duplicación de M1, deriva los tipos TypeScript del mismo esquema (una sola fuente de verdad en vez de un tipo + un validador escritos por separado), y hace trivial añadir la regla de M2 (entero positivo) declarativamente.
4. **Envolver los controllers en un manejador de errores async (`asyncHandler`) antes o durante la migración a Postgres**, para no heredar H5 en silencio.
5. **Mover las agregaciones financieras a SQL** (vistas o funciones RPC) en vez de traer todos los movimientos a Node y reducirlos ahí — además de rendimiento, esto es el lugar natural para resolver H3 de una vez con la columna `fecha_movimiento` propuesta en `PLAN BASE DE DATOS SUPABASE.md`.
6. **Tests unitarios (Vitest) para las funciones de cálculo puras** (`enriquecerProyecto`, `calcularDistribucionAdministrativa`, `calcularDashboard`, `calcularStats`, `esMesCerrado`) antes de tocarlas — hoy son funciones puras sobre arreglos, son las más baratas de todo el proyecto para probar y las que más costaría descubrir rotas a simple vista (resuelve H4).
7. **Auditoría mínima** (`creado_por` ya está en el diseño de tablas nuevo; sumar una tabla `auditoria` append-only para `UPDATE`/`DELETE` sobre `movimientos` y `proyectos`) una vez que existan usuarios reales — hoy es imposible sin autenticación (resuelve H7).

---

## 5. Patrones recomendados, por funcionalidad, y por qué

| Funcionalidad | Patrón recomendado | Por qué aplica aquí específicamente |
|---|---|---|
| Validación de entrada (`validators/*.ts`) | Esquemas declarativos (Zod) en vez de funciones `toTrimmedString`/`toNumber` a mano | Elimina la duplicación real ya presente entre `proyectos.ts` y `movimientos.ts` (M1), y permite que el tipo TypeScript y la validación en runtime no puedan divergir entre sí — hoy son dos cosas escritas por separado que hay que mantener sincronizadas a mano. |
| Autenticación/autorización | Supabase Auth (JWT) + middleware de rol en Express + RLS en la base | La app es 100% financiera y hoy no tiene ningún control de acceso en ningún nivel (C1). RLS da una segunda capa que sigue protegiendo los datos aunque una ruta nueva de Express olvide el chequeo de rol — importante en un equipo pequeño donde no siempre hay revisión de código para cada endpoint nuevo. |
| Persistencia (`services/*.ts`) | Mantener la capa de servicios como está, pero que hable con Postgres en vez de con un arreglo en memoria (patrón repositorio) | El límite `services/` ya se comporta como una interfaz de repositorio (funciones `listar*`, `crear*`, `actualizar*`, `eliminar*`) — es el punto de menor fricción para introducir una base de datos real sin reescribir controllers/validators/routes. |
| Agregaciones financieras (`calcularDashboard`, `calcularStats`, `calcularDistribucionAdministrativa`) | Vistas o funciones RPC en Postgres en vez de reducir arreglos completos en Node | Estas funciones hoy escanean **todos** los movimientos en cada request; en la base de datos, la misma agregación puede usar índices y queda como la única fuente de verdad para "qué fecha define a qué mes pertenece un movimiento", resolviendo H3 de raíz en vez de parchearlo en la capa de aplicación. |
| Pruebas | Vitest sobre las funciones puras de `services/` (sin mockear nada, son funciones sobre arreglos hoy) | Es la relación costo/beneficio más alta de todo el backend: cero infraestructura de test necesaria hoy, y es exactamente el código que calcula lo que Felipe usa para decidir si un mes cuadra o no. |
| Manejo de errores async | `asyncHandler` (o subir a Express 5, que ya propaga rechazos de promesas automáticamente) | Necesario en el momento en que `services/*.ts` se vuelva `async` por la migración a Postgres — hoy Express 4 "funciona por accidente" porque todo es síncrono; eso deja de ser cierto en cuanto haya un `await` sin envolver. |
| Observabilidad | Logger estructurado (p. ej. pino) con un id de request, en vez de `console.error` suelto en `errorHandler.ts:17` | Hoy es viable porque hay un solo proceso y probablemente un solo usuario probando manualmente; deja de serlo en cuanto haya usuarios concurrentes reales y haya que reconstruir "quién hizo qué" ante un dato que no cuadra. |

---

## 6. Relación con los planes existentes

`PLAN AGOSTO.md` y `PLAN CONTROL DE CUENTAS.md` están enfocados en **features** (qué campos/pantallas faltan) y asumen la arquitectura actual (JSON + sin auth) como dada. Nada de lo que proponen entra en conflicto con esta revisión, pero tampoco resuelven ninguno de los hallazgos de la sección 3 — en particular, `PLAN CONTROL DE CUENTAS.md` añade una tabla más (`cuentasBancarias`) al mismo esquema de persistencia que hoy tiene los problemas C3/H4/H7. Si se decide migrar a Postgres (sección 4, estructurales #2), tiene sentido incorporar `cuentas_bancarias` directamente en el nuevo esquema (ya contemplado en `PLAN BASE DE DATOS SUPABASE.md`, sección 4.1) en vez de implementarla primero en JSON y migrarla después.
