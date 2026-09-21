# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Ipsum2 is a project/finance-tracking app ("control de cuentas" for a construction/contracting business). It's split into two independently-run apps in one repo:

- **Frontend** (repo root): Next.js 16 (App Router), React 19, Tailwind 4 + daisyUI. Mixed `.jsx`/`.tsx` files.
- **Backend** (`backend/`): Express + TypeScript, ESM (`"type": "module"`), run with `tsx`. Persists to Supabase (Postgres) — see Persistence below.

The frontend talks to the backend over HTTP via `lib/api.ts`, which points at `NEXT_PUBLIC_API_URL` (default `http://localhost:4000`).

## Commands

Both apps must be run separately (two terminals), and both are needed for the app to work end-to-end.

Frontend (repo root):
```
npm run dev      # Next.js dev server, http://localhost:3000
npm run build
npm run start
npm run lint
```

Backend (`backend/`):
```
npm run dev      # tsx watch src/server.ts, http://localhost:4000
npm run build    # tsc -> dist/
npm run start    # node dist/server.js
```

There is no test suite configured in either package.

## Architecture

### Backend layering (`backend/src/`)

Each domain (`proyectos`, `movimientos`, `dashboard`, `catalogos`, `bonos`) follows the same four-layer pattern, one file per layer per domain:

- `routes/*.ts` — Express route definitions only, wire path+verb to a controller function.
- `controllers/*.ts` — HTTP handlers: call a validator, call a service, shape the `{ success, data }` response. All controllers are wrapped in `asyncHandler` (`middlewares/asyncHandler.ts`) so a rejected promise reaches `errorHandler` instead of hanging.
- `services/*.ts` — business logic + the actual Supabase queries (`supabase.ts` exports the client). Every function here is `async`.
- `validators/*.ts` — hand-rolled input validation/coercion (no schema library), throws `ApiError` on invalid input. Several validators are also `async` because they check existence against a catalog/table in Supabase (e.g. `contratista`/`bono`/`ordenCompra` must already exist).

All responses follow `{ success: true, data }` or `{ success: false, error: { code, message } }` (see `middlewares/errorHandler.ts`, `ApiError`). The frontend's `apiFetch` in `lib/api.ts` unwraps this and throws on `success: false`.

### Persistence (important, non-obvious)

All data lives in **Supabase (Postgres)** — there is no in-memory state and no local JSON file anymore (`backend/seed-data.json` and `persistencia.ts` were removed once every domain finished migrating). `backend/src/supabase.ts` creates the client from `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (read from `backend/.env`, gitignored — see `.env.example` for the required vars). The backend uses the **service_role** key (bypasses RLS by design), so authorization is enforced only in the Express layer today — there is no user-facing auth yet (see `PLAN BASE DE DATOS SUPABASE.md` for the RLS/roles design already applied to the schema, ready for when real auth is wired up).

Naming: DB columns are `snake_case` (`presupuesto_mano_obra`, `mes_asignacion` as a `smallint` 1-12, `anio_asignacion` as `smallint`); the app's TypeScript types stay `camelCase` with `mesAsignacion` as a Spanish month name string — each `services/*.ts` file converts between the two (see `aProyecto`/`aMovimiento` mapper functions). Foreign keys (`bono`, `subtipoBono`, `contratista`, `ordenCompra`) are stored as names in the app's types but as `*_id` UUIDs in the DB — services resolve name → id on write and join name back on read. `proyectos.subtipos_bono` embeds via the explicit constraint name `proyectos_subtipo_bono_id_fkey` (there's a second, composite FK — `proyectos_subtipo_pertenece_a_bono` — between the same two tables for integrity, so PostgREST can't auto-pick one; the hint is required or every proyectos read throws).

### Derived/computed fields

`Proyecto` (project) records store only raw fields; financial fields (`gastadoManoObra`, `totalIngresos`, `totalEgresos`, `ganancia`, `gastosAdministrativosMes`) are computed on read by scanning `movimientos` (see `services/proyectos.ts#enriquecerProyecto` and `controllers/proyectos.ts`). Never persist these — always recompute from movimientos.

`Movimiento` (transaction) is a discriminated union on `tipo`/`tipoEgreso`:
- `ingreso` — tied to a `proyectoId`.
- `egreso` + `tipoEgreso: "egreso-general"` — tied to a `proyectoId`, has `categoria` (e.g. `"Mano de Obra"` feeds `gastadoManoObra`). `ordenCompra` only applies to `Materiales`/`Equipamiento` and `proveedor` does not apply to `Servicios` — the backend rejects them otherwise (`validators/movimientos.ts`).
- `egreso` + `tipoEgreso: "egreso-administrativo"` — not tied to a project, tied to `mes`/`ano` instead, distributed across that month's projects (see `services/dashboard.ts#calcularDistribucionAdministrativa`).

A movement's business month is resolved by `services/movimientos.ts#mesAnioDeMovimiento`: ingresos by `fechaPago`, egresos administrativos by their `mes`/`ano`, and **egresos generales by their project's `mesAsignacion`/`anioAsignacion`** (embedded on read via `proyectos ( mes_asignacion, anio_asignacion )`; never by `creadoEn`). Both `/dashboard` and `/conciliacion` share this function.

A month is "Cerrado" (closed) when it has ≥1 project and all are `Finalizado` (`services/proyectos.ts#esMesCerrado`); closed months are excluded from active reconciliation logic. Once closed, the backend rejects creating/updating movements and creating projects in that month (`validators/movimientos.ts`, `validators/proyectos.ts`); the home selector and project edit modal let you open/close a month (see `PUT /meses/:mes/:anio/estado`).

### Frontend structure (`app/`, App Router)

- `app/page.jsx` — home.
- `app/proyectos/` — project list; `app/proyecto/[id]/page.tsx` — project detail.
- `app/agregarProyecto/`, `app/agregarMovimento/` — create-project / create-movement forms.
- `app/movs/` — movements list.
- `app/stats/page.tsx` — "Control de Cuentas" (bank reconciliation), see below.
- `app/settings/`, `app/login/` — settings and login pages.
- `components/navbar/` — nav bar and "create project" action.
- `lib/api.ts` — single typed client for every backend endpoint; add new endpoints here rather than calling `fetch` directly from components.
- `lib/cuentasBancarias.ts` — bank-account catalog currently kept in `localStorage` on the frontend (temporary, see Known in-flight work).

### API surface (backend routes, all mounted at root)

- `GET/POST /proyectos`, `GET/PUT /proyectos/:id`
- `GET/POST /movimientos`, `PUT/DELETE /movimientos/:id`
- `GET /dashboard?mes=&anio=`
- `PUT /meses/:mes/:anio/estado` (body `{ estado: "Cerrado" | "En proceso" }`) — closes/opens a month by marking all its projects `Finalizado`/`Revisión`
- `GET/POST /catalogos/:tipo`, `PUT/DELETE /catalogos/:tipo/:id` (`tipo` ∈ `ordenes-compra`, `proveedores`, `contratistas`)
- `GET/POST /bonos`, `PUT/DELETE /bonos/:id`, `POST/PUT/DELETE /bonos/:id/subtipos(/:subtipoId)`
- `GET /health`

## Known in-flight work (see root `.md` plan files)

- `PLAN AGOSTO.md` — implementation plan for 8 frontend+backend changes (month/year filtering on movement creation, derived financial fields, admin-expense distribution, closed-month rules, etc.). Cross-check current code against it before assuming a described change is already done.
- `PLAN CONTROL DE CUENTAS.md` — plan to move the "Control de Cuentas" (bank reconciliation) logic from `app/stats/page.tsx` + `lib/cuentasBancarias.ts` (currently frontend/localStorage-only) into the backend. Explicitly marked "No implementar hasta que se indique" (do not implement until told to).

## Notes

- Language: UI copy, domain terms, and code comments are in Spanish (`proyectos`, `movimientos`, `bonos`, `mesAsignacion`, etc.) — match this convention in new code in this repo.
- ESLint config lives only in `eslint.config.mjs` (`eslint-config-next`); `npm run lint` runs plain `eslint`, which resolves it.
- No user-facing authentication yet (`app/login/page.jsx` is cosmetic). Explicitly out of scope for the backend work done so far — it's expected to be handled by integration with another web app.
