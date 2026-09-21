# PLAN BACKEND — Control de Cuentas (Conciliación bancaria)

Documento de referencia con el detalle completo del trabajo pendiente en el backend (Express + TypeScript, `backend/src/`) para soportar la pestaña **Control de Cuentas** (antes "Estadísticas"). **El frontend ya está implementado** (`app/stats/page.tsx`) y funciona con los endpoints existentes + un catálogo temporal de cuentas en `localStorage`. Este plan describe cómo mover esa lógica al backend. **No implementar hasta que se indique.**

---

## Contexto

La pestaña `/stats` se reemplazó por **Control de Cuentas**, cuyo objetivo es que Felipe corrobore que el dinero en el banco coincida con lo que registra la aplicación:

1. Se **eliminó el gráfico** y toda la vista de estadísticas (Felipe no la usa).
2. **Módulo de comparación de saldos:** muestra el balance total sumado de los meses que tienen proyectos activos.
3. **Ingreso manual de cuentas bancarias:** Banco Nacional, BAC y Mutual por defecto, con opción de agregar cuentas nuevas (ej. Banco Popular) y eliminarlas.
4. **Cálculo automático del "versus":** suma los saldos bancarios ingresados y los compara contra el balance acumulado de los meses activos (la diferencia idealmente debe ser cero).
5. **Valores por defecto y alertas:**
   - Al iniciar el ejercicio, los montos de las cuentas aparecen en **cero**.
   - Se muestra el mensaje indicador **"Ingrese los valores de las cuentas"**.
   - La diferencia tiene código de colores: **rojo** si es negativa (o no cierra a cero), **verde** si es positiva.
6. **Exclusión de meses cerrados:** un mes cerrado (todos sus proyectos `Finalizado`) ya no se considera en el cálculo de conciliación activa.

### Estado actual del frontend (ya hecho)

| Pieza | Ubicación | Notas |
|---|---|---|
| Vista Control de Cuentas | `app/stats/page.tsx` | Sin gráfico. Cards: diferencia (versus), meses activos, cuentas bancarias |
| Catálogo de cuentas | `lib/cuentasBancarias.ts` | **TEMPORAL** en `localStorage` (siembra Banco Nacional, BAC, Mutual) |
| Balance de meses activos | `app/stats/page.tsx` | Calcula con `listarProyectos()` + N llamadas a `obtenerDashboard(mes, anio)` (patrón N+1) |
| Saldos del ejercicio | Estado React en `app/stats/page.tsx` | Efímeros: arrancan en cero en cada visita (cumple la regla 5) |
| NavBar / Home | `components/navbar/NavBar.jsx`, `app/page.jsx` | Etiqueta "Control de Cuentas", ícono `Landmark` |

### Decisiones clave (ya aplicadas en el frontend)

- **Saldos efímeros, cuentas persistentes.** Los montos digitados viven solo en memoria (cada ejercicio inicia en cero, como se acordó). Lo que persiste es el **catálogo de cuentas** (nombres).
- **Mes activo** = mes+año con ≥1 proyecto donde **no todos** están `Finalizado`. Es la misma derivación de `estadoMes` que ya existe en `services/dashboard.ts` (`"En proceso"` = activo, `"Cerrado"` = excluido).
- **Código de colores de la diferencia** (`diferencia = totalBancos − balanceMesesActivos`): `> 0` o `= 0` → verde ("Sobra en bancos" / "Cuadra exacto"); `< 0` → rojo ("Falta en bancos"). Si Felipe quiere que **solo el cero exacto sea verde**, es un cambio de una línea en el frontend (`diferencia === 0`).
- **Montos en colones enteros** (solo dígitos), igual que todos los inputs de dinero de la app; la comparación exacta a cero es posible porque los movimientos también son enteros.

---

## B1 — Catálogo de cuentas bancarias (reemplaza `localStorage`)

CRUD calcado del patrón de **catálogos** (`backend/src/{validators,services,controllers,routes}/catalogos.ts`), pero dedicado (no genérico) porque la entidad puede crecer (número de cuenta, moneda, etc.).

### `backend/src/validators/cuentasBancarias.ts` (nuevo)
- `CrearCuentaBancariaInput = { nombre: string }` — requerido, no vacío (mismo patrón `toTrimmedString` de `validators/catalogos.ts`).
- `validarCrearCuentaBancaria(body)`, `validarActualizarCuentaBancaria(body)`.
- Regla de negocio: **nombre único** (case-insensitive) → 409/400 si ya existe (hoy el frontend lo valida en cliente; el backend refuerza).

### `backend/src/services/cuentasBancarias.ts` (nuevo)
- `type CuentaBancaria = { id: string; nombre: string; creadoEn: string }`.
- Array en memoria + funciones: `listarCuentasBancarias()`, `crearCuentaBancaria(nombre)`, `actualizarCuentaBancaria(id, nombre)` (404 si no existe), `eliminarCuentaBancaria(id)` (404 si no existe), `restaurarCuentasBancarias(lista)`.
- `id` con `randomUUID()`, igual que catálogos.

### `backend/src/controllers/cuentasBancarias.ts` y `backend/src/routes/cuentasBancarias.ts` (nuevos)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/cuentas-bancarias` | Lista el catálogo |
| POST | `/cuentas-bancarias` | Crea cuenta (`{ nombre }`) → 201 |
| PUT | `/cuentas-bancarias/:id` | Renombra cuenta (paridad con catálogos; el frontend aún no la usa) |
| DELETE | `/cuentas-bancarias/:id` | Elimina cuenta |

Cada mutación llama `guardarEstado()` (mismo patrón que `controllers/catalogos.ts`).

### `backend/src/persistencia.ts`
- `Estado` += `cuentasBancarias?: CuentaBancaria[]`.
- `guardarEstado()` incluye `cuentasBancarias: listarCuentasBancarias()`.

### `backend/src/server.ts`
- Importar `restaurarCuentasBancarias` y el router; `app.use(cuentasBancariasRouter)`; restaurar con `estado.cuentasBancarias ?? []`.

### Migración de `backend/seed-data.json`
- Agregar la llave `"cuentasBancarias"` con las **3 cuentas por defecto** (IDs nuevos, `creadoEn` con la fecha de la migración):
  ```json
  "cuentasBancarias": [
    { "id": "<uuid>", "nombre": "Banco Nacional", "creadoEn": "..." },
    { "id": "<uuid>", "nombre": "BAC", "creadoEn": "..." },
    { "id": "<uuid>", "nombre": "Mutual", "creadoEn": "..." }
  ]
  ```
- Alternativa sin migración manual: que `restaurarCuentasBancarias([])` siembre las 3 por defecto cuando el arreglo viene vacío. Elegir **una** de las dos (la migración explícita en el JSON es más clara).

### Alternativa evaluada y descartada (por ahora)
Persistir el `saldo` de cada cuenta en el backend. Se descartó porque la regla acordada es que **al iniciar el ejercicio los montos aparecen en cero**: el saldo es un dato del ejercicio en curso, no histórico. Si en el futuro Felipe quiere "guardar un borrador" del ejercicio, se agrega `saldo: number` a la entidad + un endpoint `POST /cuentas-bancarias/reiniciar` que ponga todos los saldos en cero.

---

## B2 — Endpoint `GET /conciliacion` (balance de meses activos)

Hoy el frontend hace el patrón **N+1**: `GET /proyectos` + un `GET /dashboard` por cada mes activo. Funciona, pero es frágil y lento. Centralizar el cálculo en el backend:

### `backend/src/services/conciliacion.ts` (nuevo)
```ts
import { listarProyectos } from "./proyectos.js";
import { listarMovimientos } from "./movimientos.js";
import { MESES, mesAnioDe } from "../utils/fechas.js";

export type MesActivo = {
  mes: string;
  anio: string;
  ingresos: number;
  egresos: number;
  balance: number;
};

export type ResumenConciliacion = {
  mesesActivos: MesActivo[];   // ordenados cronológicamente
  balanceTotal: number;        // suma de los balance de mesesActivos
};
```

`calcularConciliacion(): ResumenConciliacion`:
1. Agrupar `listarProyectos()` por `{mesAsignacion}|{anioAsignacion}`.
2. **Excluir meses cerrados:** descartar grupos donde `every(p => p.estado === "Finalizado")` (misma regla de `estadoMes` en `services/dashboard.ts` — si se quiere reutilizar, exponer `esMesCerrado(mes, anio)` desde `services/proyectos.ts`, ver PLAN AGOSTO B3).
3. Para cada mes activo, sumar ingresos/egresos de `listarMovimientos({})` filtrando por `mesAnioDe(m.creadoEn)` (mismo filtro de período que usa `calcularDashboard`, incluye egresos administrativos del mes).
4. Ordenar por año y luego por índice en `MESES`.
5. Retornar `{ mesesActivos, balanceTotal }`.

### `backend/src/controllers/conciliacion.ts` y `backend/src/routes/conciliacion.ts` (nuevos)
- `getConciliacion` → `res.json({ success: true, data: calcularConciliacion() })`.
- `conciliacionRouter.get("/conciliacion", getConciliacion)`.
- Registrar en `server.ts`. Sin mutaciones → no requiere `guardarEstado()` ni cambios en `persistencia.ts`.

---

## B3 — Migración del frontend a los endpoints nuevos

### `lib/api.ts`
```ts
export type CuentaBancaria = { id: string; nombre: string; creadoEn: string };

export function listarCuentasBancarias(): Promise<CuentaBancaria[]>            // GET /cuentas-bancarias
export function crearCuentaBancaria(nombre: string): Promise<CuentaBancaria>   // POST
export function actualizarCuentaBancaria(id: string, nombre: string)           // PUT (opcional en UI)
export function eliminarCuentaBancaria(id: string): Promise<Record<string, never>> // DELETE

export type MesActivo = { mes: string; anio: string; ingresos: number; egresos: number; balance: number };
export type ResumenConciliacion = { mesesActivos: MesActivo[]; balanceTotal: number };
export function obtenerConciliacion(): Promise<ResumenConciliacion>            // GET /conciliacion
```

### `app/stats/page.tsx`
1. Reemplazar el `useEffect` de carga (hoy: `listarProyectos` + N× `obtenerDashboard`) por una sola llamada a `obtenerConciliacion()` → `setMesesActivos(res.mesesActivos)`.
2. Reemplazar el catálogo local por el backend:
   - Carga: `listarCuentasBancarias()` (con `Swal` de error igual que las demás pantallas).
   - Agregar: `await crearCuentaBancaria(nombre)` → append al estado (manejar 409/400 de nombre duplicado con el `Swal` warning existente).
   - Eliminar: `await eliminarCuentaBancaria(id)` → filtrar del estado + limpiar su saldo (igual que hoy).
3. **Eliminar `lib/cuentasBancarias.ts`** (el `localStorage` viejo queda huérfano; opcionalmente limpiar la key `cuentasBancarias` en el primer render con `localStorage.removeItem`).

> Los saldos del ejercicio **siguen siendo estado React** (efímeros, inician en cero). Eso no cambia.

---

## B4 — Limpieza del endpoint `/stats` legacy (opcional)

Tras el reemplazo de la pestaña, `GET /stats` ya **no tiene consumidores** en el frontend. Si se confirma que nadie más lo usa:
- Eliminar `backend/src/routes/stats.ts`, `backend/src/controllers/stats.ts`, `backend/src/services/stats.ts` y su registro en `server.ts`.
- Eliminar `obtenerStats`, `ResumenStats` y `ResumenMensual` de `lib/api.ts`.
- `listarBonos` y el resto de endpoints **se conservan** (los usa `agregarProyecto`, `settings`, etc.).

---

## Resumen de archivos por bloque

| Archivo | B1 | B2 | B3 | B4 |
|---|:-:|:-:|:-:|:-:|
| `backend/src/validators/cuentasBancarias.ts` | 🆕 | | | |
| `backend/src/services/cuentasBancarias.ts` | 🆕 | | | |
| `backend/src/controllers/cuentasBancarias.ts` | 🆕 | | | |
| `backend/src/routes/cuentasBancarias.ts` | 🆕 | | | |
| `backend/src/services/conciliacion.ts` | | 🆕 | | |
| `backend/src/controllers/conciliacion.ts` | | 🆕 | | |
| `backend/src/routes/conciliacion.ts` | | 🆕 | | |
| `backend/src/persistencia.ts` | ✏️ | | | |
| `backend/src/server.ts` | ✏️ | ✏️ | | ✏️ |
| `backend/seed-data.json` | ✏️ | | | |
| `lib/api.ts` | | | ✏️ | ✏️ |
| `app/stats/page.tsx` | | | ✏️ | |
| `lib/cuentasBancarias.ts` | | | 🗑️ | |
| `backend/src/{routes,controllers,services}/stats.ts` | | | | 🗑️ |

---

## Orden de implementación propuesto

1. **B1** (catálogo de cuentas) — independiente, mismo patrón que catálogos (bajo riesgo).
2. **B2** (`/conciliacion`) — independiente de B1; reutiliza reglas ya existentes en `dashboard.ts`.
3. **B3** (migración frontend) — requiere B1 + B2 desplegados; terminar eliminando `lib/cuentasBancarias.ts`.
4. **B4** (limpieza legacy) — solo cuando lo anterior esté verificado en producción.

## Verificación

- `npm run build` en `backend/` (tsc) sin errores.
- Con el server arriba:
  - `GET /cuentas-bancarias` → las 3 cuentas por defecto.
  - `POST /cuentas-bancarias { "nombre": "Banco Popular" }` → 201; reintentar con el mismo nombre → error de duplicado; sobrevive a reinicio del server (persistencia en `seed-data.json`).
  - `GET /conciliacion` → solo meses con proyectos no finalizados; `balanceTotal` coincide con la suma manual de los balances del dashboard de esos meses.
  - Cerrar un mes (finalizar todos sus proyectos) → desaparece de `/conciliacion`.
  - E2E frontend: la pestaña Control de Cuentas carga cuentas desde el backend, permite agregar/eliminar, los saldos inician en cero con el mensaje "Ingrese los valores de las cuentas", y la diferencia cambia de color (verde ≥ 0, rojo < 0).

## Riesgos / consideraciones

- **Duplicados de nombre:** validar unicidad case-insensitive en backend; si `seed-data.json` se edita a mano, puede colarse un duplicado (la lectura no valida).
- **Deriva entre `/dashboard` y `/conciliacion`:** ambos suman movimientos por período; extraer/reutilizar el filtro de período (o `esMesCerrado`) para que no diverjan. La UI actual usa `/dashboard`, así que al migrar a `/conciliacion` los números deben coincidir exactamente (mismo filtro por `creadoEn`).
- **Saldos efímeros:** al recargar la página se pierden los montos digitados (es lo acordado, pero conviene recordárselo a Felipe la primera vez).
- **No romper el build del frontend:** el `tsconfig.json` de la raíz incluye `backend/**/*.ts`; cualquier error de tipos en backend tumba `npm run build` del frontend (ya ocurrió con TS2783 en `services/proyectos.ts`, pendiente del PLAN AGOSTO).
