# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Ipsum2 is a project/finance-tracking app ("control de cuentas" for a construction/contracting business). It's split into two independently-run apps in one repo:

- **Frontend** (repo root): Next.js 16 (App Router), React 19, Tailwind 4 + daisyUI. Mixed `.jsx`/`.tsx` files.
- **Backend** (`backend/`): Express + TypeScript, ESM (`"type": "module"`), run with `tsx`. No real database — see Persistence below.

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

Each domain (`proyectos`, `movimientos`, `dashboard`, `stats`, `catalogos`, `bonos`) follows the same four-layer pattern, one file per layer per domain:

- `routes/*.ts` — Express route definitions only, wire path+verb to a controller function.
- `controllers/*.ts` — HTTP handlers: call a validator, call a service, call `guardarEstado()` after any mutation, shape the `{ success, data }` response.
- `services/*.ts` — business logic + the actual in-memory data (plain arrays module-scoped in each service file). This is the source of truth at runtime.
- `validators/*.ts` — hand-rolled input validation/coercion (no schema library), throws `ApiError` on invalid input.

All responses follow `{ success: true, data }` or `{ success: false, error: { code, message } }` (see `middlewares/errorHandler.ts`, `ApiError`). The frontend's `apiFetch` in `lib/api.ts` unwraps this and throws on `success: false`.

### Persistence (important, non-obvious)

There is **no database**. `backend/seed-data.json` is the only datastore:
- On boot, `server.ts` calls `cargarEstadoGuardado()` (`persistencia.ts`) and restores each service's in-memory arrays via `restaurar*` functions.
- After every create/update/delete, controllers call `guardarEstado()`, which re-serializes all services' current in-memory state back to `seed-data.json`.
- `@supabase/*` is a dependency and `backend/.agents/skills/supabase*` exist, but nothing in `backend/src` currently uses Supabase — data is JSON-file-only for now.

### Derived/computed fields

`Proyecto` (project) records store only raw fields; financial fields (`gastadoManoObra`, `totalIngresos`, `totalEgresos`, `ganancia`, `gastosAdministrativosMes`) are computed on read by scanning `movimientos` (see `services/proyectos.ts#enriquecerProyecto` and `controllers/proyectos.ts`). Never persist these — always recompute from movimientos.

`Movimiento` (transaction) is a discriminated union on `tipo`/`tipoEgreso`:
- `ingreso` — tied to a `proyectoId`.
- `egreso` + `tipoEgreso: "egreso-general"` — tied to a `proyectoId`, has `categoria` (e.g. `"Mano de Obra"` feeds `gastadoManoObra`) and optional `ordenCompra`.
- `egreso` + `tipoEgreso: "egreso-administrativo"` — not tied to a project, tied to `mes`/`ano` instead, distributed across that month's projects (see `services/dashboard.ts#calcularDistribucionAdministrativa`).

A month is "Cerrado" (closed) when it has ≥1 project and all are `Finalizado` (`services/proyectos.ts#esMesCerrado`); closed months are excluded from active reconciliation logic.

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
- `GET /stats?anio=&tipoBono=`
- `GET/POST /catalogos/:tipo`, `PUT/DELETE /catalogos/:tipo/:id` (`tipo` ∈ `ordenes-compra`, `proveedores`, `contratistas`)
- `GET/POST /bonos`, `PUT/DELETE /bonos/:id`, `POST/PUT/DELETE /bonos/:id/subtipos(/:subtipoId)`
- `GET /health`

## Known in-flight work (see root `.md` plan files)

- `PLAN AGOSTO.md` — implementation plan for 8 frontend+backend changes (month/year filtering on movement creation, derived financial fields, admin-expense distribution, closed-month rules, etc.). Cross-check current code against it before assuming a described change is already done.
- `PLAN CONTROL DE CUENTAS.md` — plan to move the "Control de Cuentas" (bank reconciliation) logic from `app/stats/page.tsx` + `lib/cuentasBancarias.ts` (currently frontend/localStorage-only) into the backend. Explicitly marked "No implementar hasta que se indique" (do not implement until told to).

## Notes

- Language: UI copy, domain terms, and code comments are in Spanish (`proyectos`, `movimientos`, `bonos`, `mesAsignacion`, etc.) — match this convention in new code in this repo.
- There are two ESLint configs at the root (`eslint.config.mjs`, using `eslint-config-next`, and `eslint.config.mts`, a generic template config). `npm run lint` runs plain `eslint`, which resolves `eslint.config.mjs`.
