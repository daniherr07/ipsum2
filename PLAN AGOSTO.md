# PLAN DE IMPLEMENTACIÓN — Ipsum2

Documento de referencia con el detalle completo de los cambios a realizar en el frontend (Next.js, `app/` + `lib/api.ts`) y el backend (Express + TypeScript, `backend/src/`). Se organiza en **8 cambios**, cada uno con su contexto, reglas de negocio, archivos afectados, lógica a implementar y consideraciones.

---

## Contexto general del sistema

- **Frontend:** Next.js (App Router). Páginas en `app/`. Cliente de API centralizado en `lib/api.ts` (funciones que llaman a `http://localhost:4000` y normalizan respuestas `{ success, data }`).
- **Backend:** Express + TypeScript con datos en memoria que se persisten en `backend/seed-data.json` tras cada mutación (ver `backend/src/persistencia.ts`). Estructura por capas:
  - `validators/` — validación de entrada + tipos `Crear...Input`.
  - `services/` — lógica de negocio y almacenamiento en memoria (arrays).
  - `controllers/` — handlers HTTP.
  - `routes/` — definición de rutas Express.
- **Modelo de datos relevantes:**
  - `Proyecto`: `id, nombre, presupuesto, mesAsignacion, anioAsignacion, estado("Revisión"|"Finalizado"), bono, subtipoBono, creadoEn`.
  - `Movimiento`: ingreso | egreso-general (con `proyectoId`, `categoria`, `ordenCompra`) | egreso-administrativo (con `mes`, `ano`).
  - `Catalogo` (`ordenes-compra`, `proveedores`): items `id, nombre, creadoEn`.

---

## Cambio 1 — Filtro por mes al agregar un movimiento

### Objetivo
En el formulario de **Agregar Movimiento** (`app/agregarMovimento/page.tsx`), al elegir un proyecto no deben aparecer todos los proyectos del sistema, sino únicamente los asignados a un **mes y año** seleccionados por el usuario.

### Reglas
- Se agrega un selector propio de **Mes** y **Año** (default: mes/año actuales).
- El dropdown de proyecto se alimenta de `proyectosFiltrados` (proyectos cuyo `mesAsignacion` === mes seleccionado y `anioAsignacion` === año seleccionado).
- Si la lista filtrada está vacía → mostrar opción deshabilitada `"No hay proyectos en {mes} {año}"`.
- Si al cambiar el mes/año el proyecto seleccionado ya no pertenece al filtro, se limpia la selección.
- Aplica a **ambos** selectores de proyecto del formulario: el del **Ingreso** y el del componente **Egreso General**.

### Backend
**Sin cambios.** Los proyectos ya exponen `mesAsignacion` y `anioAsignacion`.

### Frontend — `app/agregarMovimento/page.tsx`
1. **Interfaz local `Proyecto`** (líneas 16–19): ampliar con `mesAsignacion: string`, `anioAsignacion: string`, `estado: string` (el campo `estado` se usa en el **Cambio 4** para derivar meses cerrados).
2. **Mapeo de `listarProyectos()`** (línea 88): incluir los campos nuevos en el `.map(...)`.
3. **Estado nuevo:** `mesFiltro` (default: `today.getMonth()+1`), `anoFiltro` (default: `today.getFullYear().toString()`).
4. **UI nueva:** bloque `<Field>` con grid de 2 columnas (Mes + Año) reutilizando las constantes `meses` y `ANOS` ya existentes en el archivo, con el mismo estilo del selector de egreso administrativo. Se coloca al inicio del formulario, antes de los selectores de proyecto.
5. **Lista derivada:** `const proyectosFiltrados = proyectos.filter(p => p.mesAsignacion === meses[mesFiltro-1] && p.anioAsignacion === anoFiltro)`.
6. **Selectores de proyecto:** reemplazar `proyectos.map(...)` por `proyectosFiltrados.map(...)` en:
   - Selector de proyecto del Ingreso (líneas ~348–361).
   - Selector de proyecto del componente Egreso General (líneas ~659–675).
7. **Efecto de limpieza:** `useEffect` que, al cambiar `mesFiltro`/`anoFiltro`, si `proyectoSeleccionado` o `componenteProyecto` no están en `proyectosFiltrados`, los resetea a `""`.

### Notas
- El `anoFiltro` usa el valor como string numérico; los proyectos guardan `anioAsignacion` como string de 4 dígitos → comparación directa funciona.
- Este cambio es el cimiento del **Cambio 4** (meses cerrados) y del **Cambio 8** (preselección de proyecto), porque ambos reutilizan el selector de mes y la lista de proyectos aquí cargada.

---

## Cambio 2 — Presupuesto de mano de obra

### Objetivo
1. Al crear un proyecto se define un **presupuesto de mano de obra** (campo nuevo `presupuestoManoObra`).
2. Cada vez que se registra un **egreso general** con `categoria === "Mano de Obra"` asociado a ese proyecto, se acumula como **gasto de mano de obra** (campo derivado `gastadoManoObra`).
3. El avance (gastado vs. presupuestado) se **muestra en proyectos** (lista y detalle).

### Reglas de negocio
- `presupuestoManoObra` es **obligatorio** al crear el proyecto y debe ser `> 0`.
- `gastadoManoObra` es **derivado** (no se almacena): suma de todos los movimientos del proyecto con `tipo === "egreso" && tipoEgreso === "egreso-general" && categoria === "Mano de Obra"`.
- Se muestra como barra de progreso: `"Mano de Obra: ₡{gastado} de ₡{presupuestado}"`.

### Backend
- **`backend/src/validators/proyectos.ts`**
  - Agregar `presupuestoManoObra: number` a `CrearProyectoInput`.
  - Validación: requerido y `> 0` (mismo patrón que `presupuesto` actual, líneas 44–47).
- **`backend/src/services/proyectos.ts`**
  - El `type Proyecto = CrearProyectoInput & {...}` absorbe el campo automáticamente.
  - Agregar función `calcularGastadoManoObra(proyectoId): number` que use `listarMovimientos({ proyectoId })` y sume los egresos de categoría "Mano de Obra".
    - **Verificación de ciclo de imports:** `services/proyectos.ts` importa `services/movimientos.ts`, quien importa `type CrearMovimientoInput` desde `validators/movimientos.ts`, que a su vez importa `existeProyecto` (value) desde `services/proyectos.ts`. El import de tipo en `services/movimientos.ts` es `import type` → se elimina en runtime, por lo que **no hay ciclo a runtime**. Seguro.
  - Agregar función de enriquecimiento `listarProyectosEnriquecidos()` que devuelva cada proyecto con `gastadoManoObra` (y los campos del Cambio 6).
- **`backend/src/controllers/proyectos.ts`**
  - `getProyectos` y `getProyecto` devuelven el proyecto/proyectos enriquecidos con `gastadoManoObra`.
- **`backend/seed-data.json`**
  - Migración puntual: a cada proyecto existente agregar `"presupuestoManoObra": 0` (los proyectos viejos arrancan en 0; el validador solo aplica a creaciones nuevas). El próximo `guardarEstado()` persistirá el campo.

### Frontend
- **`lib/api.ts`**
  - Tipo `Proyecto` (líneas 25–35): agregar `presupuestoManoObra: number` y `gastadoManoObra?: number`.
- **`app/agregarProyecto/page.jsx`**
  - `initialFormData` += `presupuestoManoObra: ""`.
  - Nuevo `<Field label="Presupuesto de Mano de Obra">` con input de moneda (mismo formato ₡ y handler de solo dígitos que `presupuesto`).
  - `validateForm()`: requerido `> 0` (error si vacío o 0).
  - `crearProyecto(...)`: enviar `presupuestoManoObra: Number(formData.presupuestoManoObra)`.
- **`app/proyectos/page.jsx`** (card): agregar línea "Mano de Obra" con `₡${formatNumber(project.gastadoManoObra)} de ₡${formatNumber(project.presupuestoManoObra)}` + mini barra de progreso (`<progress value={gastado} max={presupuesto}>`).
- **`app/proyecto/[id]/page.tsx`**: bloque de progreso de Mano de Obra junto al progreso de presupuesto general existente.

### Migración de datos existentes
Los proyectos en `seed-data.json` no tienen el campo. Se agregará `"presupuestoManoObra": 0` manualmente; en la lista mostrarán "₡0 de ₡0" hasta que se editen (posible vía el nuevo **PUT** del Cambio 7).

---

## Cambio 3 — Contratista de mano de obra (catálogo)

### Objetivo
Al crear un proyecto se asigna el **nombre del contratista de mano de obra**, elegido desde un **catálogo reutilizable** de contratistas (gestionable en Configuración, igual que Órdenes de Compra y Proveedores).

### Backend
- **`backend/src/validators/catalogos.ts`**
  - `TIPOS_CATALOGO`: agregar `"contratistas"`. El tipo `TipoCatalogo` se actualiza automáticamente al ser `as const`.
- **`backend/src/services/catalogos.ts`**
  - Objeto inicial `catalogos`: agregar `contratistas: []`.
  - `restaurarCatalogos` ya itera sobre las claves conocidas y tolera ausencia con `?? []`, por lo que si `seed-data.json` no trae la lista, arranca vacía sin error.
- **Rutas/controladores de catálogos:** **sin cambios** — `/catalogos/:tipo` ya es genérico (GET/POST/PUT/DELETE funcionan para `"contratistas"` sin código nuevo).
- **`backend/src/validators/proyectos.ts`**
  - Agregar `contratista: string` requerido (no vacío) a `CrearProyectoInput` y su validación.
- **`backend/seed-data.json`**
  - Migración: `"contratista": "-"` en cada proyecto existente.

### Frontend
- **`lib/api.ts`**
  - `TipoCatalogo` (línea 165): agregar `"contratistas"`. Las funciones `listarCatalogo`, `crearItemCatalogo`, `actualizarItemCatalogo`, `eliminarItemCatalogo` ya operan de forma genérica con `TipoCatalogo` → **sin cambios funcionales**.
- **`app/settings/page.jsx`**
  - `CATEGORIAS` (línea 498): agregar `{ id: "contratistas", label: "Contratistas" }`. El `CatalogoSection` genérico provee el CRUD completo (tabla + modal alta/edición + borrado) sin código adicional.
- **`app/agregarProyecto/page.jsx`**
  - Estado `contratistas` cargado con `listarCatalogo("contratistas")` en el `useEffect` existente (junto a `listarBonos()`).
  - Nuevo `<Field label="Contratista de Mano de Obra">` con `<select>` poblado desde `contratistas` (mismo patrón que el select de Bono).
  - `validateForm()`: requerido (error si vacío).
  - `crearProyecto(...)`: `contratista: formData.contratista`.
- **`app/proyectos/page.jsx`** y **`app/proyecto/[id]/page.tsx`**: mostrar el contratista (en la card, junto a Bono/Subtipo; en el detalle, en el grid de datos del proyecto).

---

## Cambio 4 — Estados de mes "En proceso" / "Cerrado" (NUEVO)

### Objetivo
Los meses (mes + año) tendran dos estados derivados:
- **"En proceso"** si tienen proyectos y al menos uno no está "Finalizado".
- **"Cerrado"** si tienen ≥1 proyecto y **todos** sus proyectos están "Finalizado".
- Meses sin proyectos: **sin estado** (no muestran badge ni se bloquean).

### Reglas de bloqueo en Agregar Movimiento
El usuario decidió: **todos los selectores de mes del formulario bloquean los meses cerrados**, incluyendo:
1. Selector del filtro de proyectos (Cambio 1).
2. Mes del egreso administrativo.
3. Mes de la fecha de pago del ingreso.

Los meses cerrados aparecen **deshabilitados** con label `"{mes} (Cerrado)"`.

### Backend
- **`backend/src/services/proyectos.ts`**
  - Helper `esMesCerrado(mes: string, anio: string): boolean`:
    ```ts
    function esMesCerrado(mes, anio) {
      const delMes = listarProyectos().filter(p => p.mesAsignacion === mes && p.anioAsignacion === anio);
      return delMes.length > 0 && delMes.every(p => p.estado === "Finalizado");
    }
    ```
- **`backend/src/services/dashboard.ts`**
  - `ResumenDashboard` += `estadoMes: "En proceso" | "Cerrado" | null`.
  - `calcularDashboard`: calcular `estadoMes` a partir de `proyectosDelMes` (null si no hay proyectos).
- **`lib/api.ts`**
  - `ResumenDashboard` += `estadoMes`.

### Frontend
- **`app/page.jsx`** (home): badge junto al nombre del mes en el navegador superior — `"En proceso"` (clase `badge-warning`) o `"Cerrado"` (clase `badge-success` o `badge-ghost`). Usa `data.estadoMes` del dashboard ya cargado.
- **`app/agregarMovimento/page.tsx`** (derivación local, sin llamada extra):
  - `const mesesCerrados` = calcular por pares mes+año a partir de `proyectos` (agrupar y verificar `every(estado === "Finalizado")`). Estructura recomendada: `Set<string>` con claves `"{mes}-{año}"` o un mapa.
  - En los **3 selectores de mes** del formulario, render cada `<option>` con `disabled` si el par mes+año correspondiente está cerrado, y suffix `" (Cerrado)"`.
  - Casos `fechaPagoMes`/`fechaPagoAno` (ingreso) y `componenteMes`/`componenteAno` (egreso admin) usan combinaciones mes+año → comparar contra el set de cerrados.

### Nota
- El bloqueo es **client-side** (consistente con el estilo actual de la app). Como refuerzo opcional se podría validar server-side en `validarCrearMovimiento` (rechazar movimientos de meses cerrados), pero no es parte del alcance acordado.

---

## Cambio 5 — Gastos administrativos del mes en detalle de proyecto (NUEVO)

### Objetivo
En la página de detalle de un proyecto, mostrar el **gasto administrativo que le corresponde** de su mes de asignación (distribución proporcional por peso presupuestario — mismo cálculo que ya hace el dashboard global).

### Backend
- **`backend/src/services/dashboard.ts`**
  - Extraer la lógica actual de `distribucionGastosAdministrativos` (líneas 46–64) a una función exportada reutilizable:
    ```ts
    export function calcularDistribucionAdministrativa(mes, anio): {
      proyectoId: string; monto: number; porcentaje: number;
    }[]
    ```
  - `calcularDashboard` la consume (reemplaza la lógica inline) para que el dashboard existente siga idéntico.
- **`backend/src/controllers/proyectos.ts`** — `getProyecto`:
  - En el enriquecimiento, calcular `gastosAdministrativosMes` del proyecto:
    ```ts
    const dist = calcularDistribucionAdministrativa(p.mesAsignacion, p.anioAsignacion);
    const share = dist.find(d => d.proyectoId === p.id)?.monto ?? 0;
    return { ...p, gastadoManoObra, gastosAdministrativosMes: share, /* cambio 6 */ };
    ```
- **`lib/api.ts`**: tipo `Proyecto` += `gastosAdministrativosMes?: number`.

### Frontend — `app/proyecto/[id]/page.tsx`
- Nuevo bloque en la card del proyecto (debajo del progreso de presupuesto), o bien una `StatCard` extra en el grid de stats con color `warning`:
  - Etiqueta: `Gasto administrativo asignado ({proyecto.mesAsignacion})`.
  - Valor: `₡{formatNumber(proyecto.gastosAdministrativosMes)}`.

### Sinergia
El cálculo reutiliza exactamente la prorrata que ya vive en el dashboard, evitando duplicar lógica y garantizando que el monto coincida con lo que ve el usuario en la home para ese mes.

---

## Cambio 6 — Ganancia total en la lista de proyectos (NUEVO)

### Objetivo
En la lista de proyectos, en lugar de mostrar el **presupuesto global**, mostrar la **ganancia total** de cada obra como lectura rápida de resultados financieros.

### Definición acordada
> **Ganancia = Ingresos del proyecto − Egresos del proyecto.**

### Backend
- **`backend/src/services/proyectos.ts`**
  - Ampliar el enriquecimiento del Cambio 2: para cada proyecto, calcular además:
    - `totalIngresos` = suma de movimientos `tipo === "ingreso"` con ese `proyectoId`.
    - `totalEgresos` = suma de movimientos `tipo === "egreso" && tipoEgreso === "egreso-general"` con ese `proyectoId`.
    - `ganancia` = `totalIngresos - totalEgresos`.
  - Es una sola pasada sobre `listarMovimientos({ proyectoId })` por proyecto, reutilizable para `gastadoManoObra` (filtro extra por categoría dentro de esa pasada).
- **`lib/api.ts`**: tipo `Proyecto` += `totalIngresos?`, `totalEgresos?`, `ganancia?`.

### Frontend — `app/proyectos/page.jsx`
- Reemplazar el bloque "Presupuesto" (líneas ~228–234) por "Ganancia":
  ```jsx
  <p className="text-[10px] uppercase font-bold text-base-content/50">Ganancia</p>
  <p className={`font-black text-lg sm:text-xl ${project.ganancia >= 0 ? "text-success" : "text-error"}`}>
    ₵{formatNumber(project.ganancia)}
  </p>
  ```
- Se **conserva** la línea de "Mano de Obra" del Cambio 2 y el contratista (Cambio 3) en la card. Solo se intercambia el bloque de cierre de "Presupuesto" por "Ganancia".

---

## Cambio 7 — Presupuesto MO editable + info al registrar egreso MO (NUEVO)

### Objetivo (dos partes)

#### Parte A — Edición del presupuesto de mano de obra (y contratista) desde el detalle del proyecto
Permite ajustar el `presupuestoManoObra` y `contratista` después de la creación, mediante un nuevo endpoint `PUT /proyectos/:id`.

#### Parte B — Información del presupuesto al registrar un egreso general de mano de obra
Cuando en **Agregar Movimiento**, el componente de egreso es `egreso-general`, `categoria === "Mano de Obra"`, y hay un proyecto seleccionado, se muestra una caja informativa:
> **Presupuesto MO total: ₡X · Utilizado: ₡Y · Disponible: ₡(X−Y)**

con aviso si el monto digitado supera el disponible.

### Backend (Parte A)
- **`backend/src/validators/proyectos.ts`**
  - `validarActualizarProyecto(body)` — esquema **parcial**:
    - `presupuestoManoObra?: number` (si viene, `> 0`).
    - `contratista?: string` (si viene, no vacío).
    - Al menos uno de los dos debe estar presente.
- **`backend/src/services/proyectos.ts`**
  - `actualizarProyecto(id, cambios): Proyecto` — busca proyecto (404 si no), merge los campos provistos, retorna.
- **`backend/src/controllers/proyectos.ts`**
  - `putProyecto(req, res)`: validar → actualizar → `guardarEstado()` → responder enriquecido.
- **`backend/src/routes/proyectos.ts`**
  - Agregar `proyectosRouter.put("/proyectos/:id", putProyecto)`.
- **`lib/api.ts`**
  - `actualizarProyecto(id, input)` → `PUT /proyectos/:id`.

### Frontend (Parte A) — `app/proyecto/[id]/page.tsx`
- Botón "Editar" (ícono `Pencil`) en la card del proyecto.
- Modal (mismo patrón que `FormModal` de `app/settings/page.jsx`) con:
  - Input de moneda "Presupuesto de Mano de Obra".
  - `<select>` de "Contratista" poblado desde `listarCatalogo("contratistas")`.
- Al guardar: `actualizarProyecto(id, {...})` → recargar el proyecto (`obtenerProyecto`).

### Frontend (Parte B) — `app/agregarMovimento/page.tsx`
- Cuando `tipoComponente === "egreso-general"` && `componenteCategoria === "Mano de Obra"` && `componenteProyecto` no vacío:
  - Buscar el proyecto seleccionado en `proyectos` (que trae `presupuestoManoObra` y `gastadoManoObra` tras extender el mapeo del Cambio 1/2).
  - Mostrar caja con los 3 valores (total, utilizado, disponible).
  - Si `componenteMonto` (numérico) > disponible → aviso (texto `text-error`) tipo `"Excede el presupuesto de mano de obra disponible"`.

### Sinergias
- Requiere que `agregarMovimento` ya haya extendido su interfaz local `Proyecto` con `presupuestoManoObra` y `gastadoManoObra` y que el GET `/proyectos` devuelva el enriquecido (Cambio 2).
- El endpoint PUT también se puede usar a futuro para editar otros campos del proyecto sin expandir UI.

---

## Cambio 8 — Botón "Agregar Movimiento" con proyecto preseleccionado (NUEVO)

### Objetivo
Desde el detalle de un proyecto (`/proyecto/[id]`), el botón "Agregar Movimiento" lleva directo al formulario con **ese proyecto ya preseleccionado** y el filtro de mes ajustado, sin necesidad de buscarlo en el dropdown.

### Regla acordada
El proyecto preseleccionado es **editable** (no queda fijo): el usuario puede cambiarlo si lo desea.

### Frontend
- **`app/proyecto/[id]/page.tsx`** (línea ~380): cambiar el `href` del botón a:
  ```jsx
  href={`/agregarMovimento?proyectoId=${proyecto.id}`}
  ```
- **`app/agregarMovimento/page.tsx`**:
  - Importar `useSearchParams` de `next/navigation`.
  - **Next.js build requirement:** `useSearchParams` debe estar envuelto en un `<Suspense>` durante el prerender. Estructura:
    ```tsx
    export default function AgregarMovimientoPage() {
      return (
        <Suspense fallback={<Spinner/>}>
          <AgregarMovimientoContenido />
        </Suspense>
      );
    }
    ```
    (o marcar la página `export const dynamic = "force-dynamic"` si se prefiere; el wrapper `Suspense` es la solución recomendada).
  - En el contenido, leer `const searchParams = useSearchParams()` y `const proyectoIdParam = searchParams.get("proyectoId")`.
  - Al cargar `listarProyectos()`, si `proyectoIdParam` existe y corresponde a un proyecto válido:
    - `setProyectoSeleccionado(proyectoIdParam)` (ingreso).
    - `setComponenteProyecto(proyectoIdParam)` (egreso general).
    - `setMesFiltro` y `setAnioFiltro` al `mesAsignacion`/`anioAsignacion` de ese proyecto (para que el proyecto aparezca en la lista filtrada del Cambio 1).
  - El usuario puede modificar libremente todos los selectores después.

---

## Resumen de archivos por cambio

| Archivo | C1 | C2 | C3 | C4 | C5 | C6 | C7 | C8 |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| `app/agregarMovimento/page.tsx` | ✏️ | ↩️ | | ✏️ | | | ✏️ | ✏️ |
| `app/agregarProyecto/page.jsx` | | ✏️ | ✏️ | | | | | |
| `app/proyectos/page.jsx` | | ✏️ | ✏️ | | | ✏️ | | |
| `app/proyecto/[id]/page.tsx` | | ✏️ | ✏️ | | ✏️ | | ✏️ | ✏️ |
| `app/page.jsx` | | | | ✏️ | | | | |
| `app/settings/page.jsx` | | | ✏️ | | | | | |
| `lib/api.ts` | | ✏️ | ✏️ | ✏️ | ✏️ | ✏️ | ✏️ | |
| `backend/src/validators/proyectos.ts` | | ✏️ | ✏️ | | | | ✏️ | |
| `backend/src/validators/catalogos.ts` | | | ✏️ | | | | | |
| `backend/src/services/proyectos.ts` | | ✏️ | | ✏️ | | ✏️ | ✏️ | |
| `backend/src/services/catalogos.ts` | | | ✏️ | | | | | |
| `backend/src/services/dashboard.ts` | | | | ✏️ | ✏️ | | | |
| `backend/src/controllers/proyectos.ts` | | ✏️ | | | ✏️ | ✏️ | ✏️ | |
| `backend/src/routes/proyectos.ts` | | | | | | | ✏️ | |
| `backend/seed-data.json` | | ✏️ | ✏️ | | | | | |

(↩️ en `agregarMovimento` para C2 indica que solo amplía la interfaz local de `Proyecto` para soportar la info del Cambio 7.)

---

## Orden de implementación propuesto

1. **Backend base de datos:** campos nuevos de `Proyecto` (`presupuestoManoObra`, `contratista`) + alta de `"contratistas"` en catálogos + migración de `seed-data.json` (C2, C3).
2. **Backend lógica/negocio:**
   - Función de enriquecimiento `listarProyectosEnriquecidos` con `gastadoManoObra`, `totalIngresos`, `totalEgresos`, `ganancia` (C2, C6).
   - `esMesCerrado` + `estadoMes` en dashboard + extracción de `calcularDistribucionAdministrativa` (C4, C5).
   - `validarActualizarProyecto`, `actualizarProyecto`, controlador y ruta `PUT /proyectos/:id` (C7).
   - Enriquecer GET `/proyectos` y GET `/proyectos/:id` con todos los campos derivados (C2, C5, C6).
3. **`lib/api.ts`:** tipos y funciones nuevas.
4. **Frontend formularios:**
   - `app/agregarProyecto/page.jsx` (C2, C3).
   - `app/agregarMovimento/page.tsx` (C1 → C4 → C7-info → C8, en ese orden de capas dentro del mismo archivo).
5. **Frontend vistas:**
   - `app/proyectos/page.jsx` (C2, C3, C6).
   - `app/proyecto/[id]/page.tsx` (C2, C3, C5, C7-edición modal, C8 link).
   - `app/page.jsx` (C4 badge).
   - `app/settings/page.jsx` (C3 categoría).
6. **Verificación:**
   - Backend: `npm run build` (tsc) en `backend/` y el script de lint si existe.
   - Frontend: `npm run lint` y `npm run build` en la raíz del proyecto.
   - Pruebas manuales: crear proyecto con presupuesto MO + contratista; registrar egreso "Mano de Obra" y ver avance; preseleccionar proyecto; comprobar meses cerrados en los 3 selectores; verificar ganancia en la lista; verificar gasto admin del mes en el detalle.

---

## Decisiones acordadas (resumen)

| Punto | Decisión |
|---|---|
| Egreso "Mano de Obra" | Aumenta lo **gastado** (no el presupuesto) |
| Filtro por mes | Selector mes/año propio, aplica a **Ingreso y Egreso General** |
| Campos nuevos obligatorios | `presupuestoManoObra` y `contratista` **requeridos** en creación |
| Contratista | **Catálogo** reutilizable (como proveedores), con CRUD en Settings |
| Ganancia | **Ingresos − Egresos** del proyecto |
| Edición de presupuesto MO | Desde el **detalle del proyecto** con botón Editar (nuevo `PUT /proyectos/:id`) |
| Meses cerrados (bloqueo) | **Todos** los selectores de mes del formulario, incluida fecha de pago |
| Proyecto preseleccionado | **Editable** (no fijo) |

---

## Riesgos / consideraciones

- **Ciclo de imports backend:** verificado que no existe a runtime (el `import type` en `services/movimientos.ts` se elide). Aún así, mantener los imports de tipo con `import type` para evitar regresiones.
- **`useSearchParams` en Next.js:** requiere wrapper `<Suspense>` o `force-dynamic`; sin ello, `next build` falla. Consideración ya contemplada en C8.
- **Migración de `seed-data.json`:** es puntual y solo se hace una vez. El siguiente `guardarEstado()` reescribe el archivo con los campos nuevos ya normalizados.
- **Proyectos legacy (`presupuestoManoObra: 0`, `contratista: "-"`):** mostrarán "₡0 de ₡0" y un contratista "-". Se pueden corregir manualmente en `seed-data.json` o vía el nuevo PUT (C7).
- **Meses sin proyectos:** no muestran badge ni se bloquean (regla explícita).

---

# PLAN BACKEND — Pendiente de implementación

El frontend ya está completo (C1–C8 + mejoras M1–M5) y consume campos/endpoints que el backend aún no expone. Esta sección detalla todo el trabajo pendiente en `backend/src/` + `backend/seed-data.json`. Mientras no se implemente, el frontend no se rompe (usa fallbacks `?? 0`) pero muestra ceros, no aparece el badge del mes y las rutas `/catalogos/contratistas` y `PUT /proyectos/:id` responden error.

## B1 — `validators/proyectos.ts` (C2, C3, C7, M1, M2, M3)

### Creación (`validarCrearProyecto` / `CrearProyectoInput`)
- `presupuestoManoObra: number` — requerido, `> 0` (mismo patrón `toNumber` que `presupuesto`) **y `<= presupuesto`** (M1: la mano de obra no puede superar el presupuesto total; el frontend ya valida esto en cliente, el backend refuerza).
- `contratista: string` — requerido, no vacío (`toTrimmedString`).
- Agregar ambos al objeto retornado.

### Actualización (nuevo `validarActualizarProyecto`) — esquema parcial
El frontend ya envía estos campos vía `actualizarProyecto()` (`lib/api.ts`):
- `presupuestoManoObra?: number` — si viene, `> 0` y `<= presupuesto` actual del proyecto (M1). Para esta validación se necesita el proyecto actual: el validador recibe el body puro; la comparación contra `presupuesto` se hace en el controlador o en el service (donde ya se tiene el proyecto cargado).
- `contratista?: string` — si viene, no vacío.
- `mesAsignacion?: string` — si viene, debe estar en `MESES` (M2).
- `anioAsignacion?: string` — si viene, regex `^\d{4}$` (M2).
- `estado?: "Revisión" | "Finalizado"` — si viene, uno de esos dos valores (M3).
- Regla: al menos un campo presente, si no → 400.
- Nuevo tipo exportado `ActualizarProyectoInput` (mirror del que ya existe en `lib/api.ts`).

## B2 — Catálogo "contratistas" (C3)

- **`validators/catalogos.ts`:** `TIPOS_CATALOGO = ["ordenes-compra", "proveedores", "contratistas"] as const` (el tipo `TipoCatalogo` se actualiza solo).
- **`services/catalogos.ts`:** objeto inicial `catalogos` += `contratistas: []`. `restaurarCatalogos` ya tolera su ausencia en el JSON con `?? []`.
- **Rutas/controladores:** sin cambios — `/catalogos/:tipo` ya es genérico (verificado en `controllers/catalogos.ts` y `routes/catalogos.ts`).

## B3 — `services/proyectos.ts` (C2, C4, C6, C7)

- El `type Proyecto = CrearProyectoInput & {...}` absorbe los campos nuevos automáticamente.
- **Enriquecimiento** (una sola pasada de `listarMovimientos({ proyectoId })` por proyecto):
  ```ts
  export type ProyectoEnriquecido = Proyecto & {
    gastadoManoObra: number;   // C2: egresos generales con categoria "Mano de Obra"
    totalIngresos: number;     // C6
    totalEgresos: number;      // C6 (solo egreso-general)
    ganancia: number;          // C6: totalIngresos - totalEgresos
  };
  export function enriquecerProyecto(p: Proyecto): ProyectoEnriquecido
  export function listarProyectosEnriquecidos(): ProyectoEnriquecido[]
  ```
  - `import { listarMovimientos } from "./movimientos.js"` — ciclo de imports seguro: `services/movimientos.ts` solo importa `type CrearMovimientoInput` desde validators, y `validators/movimientos.ts` importa `existeProyecto` desde aquí (value). El ciclo es validators→services→services, ya existe hoy de forma indirecta y se elide en runtime para tipos. **Verificar con build.**
- **`esMesCerrado(mes: string, anio: string): boolean`** (C4):
  ```ts
  const delMes = listarProyectos().filter(p => p.mesAsignacion === mes && p.anioAsignacion === anio);
  return delMes.length > 0 && delMes.every(p => p.estado === "Finalizado");
  ```
- **`actualizarProyecto(id, cambios: ActualizarProyectoInput): Proyecto`** (C7): busca (404 si no), merge de campos provistos, retorna. En el merge, si viene `presupuestoManoObra`, validar `<= proyecto.presupuesto` → 400 si no (M1).

## B4 — `services/dashboard.ts` (C4, C5)

- **Extraer** la lógica inline de `distribucionGastosAdministrativos` (líneas 46–64) a función exportada reutilizable (C5):
  ```ts
  export function calcularDistribucionAdministrativa(mes: string, anio: string): DistribucionGastoAdministrativo[]
  ```
  `calcularDashboard` la consume para que el dashboard quede idéntico.
- **`ResumenDashboard` += `estadoMes: "En proceso" | "Cerrado" | null`** (C4), calculado desde `proyectosDelMes`:
  - `null` si no hay proyectos del mes;
  - `"Cerrado"` si todos están `"Finalizado"`;
  - `"En proceso"` en otro caso.
- `controllers/dashboard.ts`: sin cambios (usa `calcularDashboard`).

## B5 — `controllers/proyectos.ts` (C2, C5, C6, C7)

- `getProyectos` → `listarProyectosEnriquecidos()`.
- `getProyecto` → enriquecido **+ `gastosAdministrativosMes`** (C5):
  ```ts
  const dist = calcularDistribucionAdministrativa(p.mesAsignacion, p.anioAsignacion);
  const share = dist.find(d => d.proyectoId === p.id)?.monto ?? 0;
  ```
- `postProyecto`: sin cambios funcionales (el validador nuevo rechaza/acepta campos); responder el proyecto enriquecido por consistencia.
- **`putProyecto` (nuevo, C7):** `validarActualizarProyecto(req.body)` → `actualizarProyecto(id, cambios)` → `guardarEstado()` → responder enriquecido.

## B6 — `routes/proyectos.ts` (C7)

```ts
proyectosRouter.put("/proyectos/:id", putProyecto);
```

## B7 — Migración de `backend/seed-data.json` (C2, C3)

- A cada uno de los **6 proyectos existentes** agregar `"presupuestoManoObra": 0` y `"contratista": "-"`.
- Agregar `"contratistas": []` dentro de `catalogos` (hoy solo tiene `ordenes-compra` y `proveedores`).
- El próximo `guardarEstado()` persistirá todo normalizado.

## Orden de implementación backend

1. B2 (catálogo) — independiente, trivial.
2. B1 (validators) + B3 (services) + B7 (migración JSON) — base de datos y reglas.
3. B4 (dashboard) — depende de B3 (`esMesCerrado` puede vivir aquí o en B3; el plan original lo ubica en `services/proyectos.ts`).
4. B5 + B6 (controllers/routes) — exponen todo.
5. Verificación: `npm run build` en `backend/`, levantar el server y probar:
   - `GET /proyectos` trae `gastadoManoObra`, `totalIngresos`, `totalEgresos`, `ganancia`.
   - `GET /proyectos/:id` trae además `gastosAdministrativosMes`.
   - `GET /catalogos/contratistas` responde `[]` (200).
   - `PUT /proyectos/:id` con `{ mesAsignacion, anioAsignacion, estado }` actualiza (M2/M3) y rechaza `presupuestoManoObra > presupuesto` (M1).
   - `GET /dashboard?mes=Enero&anio=2026` trae `estadoMes: "Cerrado"` (todos finalizados) — coincide con el badge del home.
   - Frontend end-to-end: crear proyecto, registrar egreso "Mano de Obra", editar proyecto (modal), badge de mes, preselección C8.

## Riesgos backend

- **Ciclo de imports:** `services/proyectos.ts` ↔ `validators/movimientos.ts` (value import de `existeProyecto`) ya existe; agregar `services/movimientos.ts` como dependencia de `services/proyectos.ts` lo convierte en `proyectos → movimientos → validators/movimientos → proyectos`. En ESM con Node esto funciona si `existeProyecto` no se ejecuta durante la carga del módulo (solo se llama en runtime dentro de `validarCrearMovimiento`). Verificar con `npm run build` + arranque; si hubiera problema, mover `existeProyecto` a un módulo compartido o inyectar la dependencia.
- **`PUT` parcial y M1:** la validación `presupuestoManoObra <= presupuesto` requiere leer el proyecto actual antes de mergear (hacerla en service/controller, no en el validator puro).