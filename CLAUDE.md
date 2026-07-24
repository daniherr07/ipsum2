# CLAUDE.md

Este archivo le da contexto a Claude Code (claude.ai/code) para trabajar en este repositorio.

## Proyecto

"Ipsum" — un frontend en Next.js para un sistema de gestión financiera de proyectos de construcción (proyectos, movimientos de ingreso/egreso, plantillas de compra, dashboards y estadísticas). La UI, los comentarios y el contenido están en español; los identificadores del código están en inglés.

Este es un **prototipo solo de frontend**: no hay backend en este repositorio, y la mayoría de las pantallas funcionan enteramente con datos simulados/hardcodeados en el estado del componente. Tratá las páginas existentes como maquetado de UI a conectar más adelante con datos reales, no como la fuente de verdad de cómo debería funcionar la persistencia.

## Comandos

```bash
npm run dev      # levanta el servidor de desarrollo (Next.js, Turbopack por defecto)
npm run build    # build de producción
npm run start    # ejecuta el build de producción
npm run lint     # ESLint (eslint.config.mjs — flat config)
```

No hay suite/framework de tests configurado en este repositorio.

## Arquitectura

**Rutas**: App Router de Next.js bajo `app/`. Los archivos de ruta son inconsistentemente `.jsx` o `.tsx` según la carpeta (no hay una convención forzada) — seguí el criterio que ya use el archivo hermano en la carpeta que estés editando. `app/layout.jsx` es el único layout raíz y renderiza `<NavBar />` una sola vez para toda la app — no agregues otro `<NavBar />` dentro de una página; varias páginas lo importan sin usarlo, resto de copiar y pegar, no repliques ese patrón.

**Existen dos capas de datos desconectadas entre sí** — fijate cuál usa realmente la página que estés tocando antes de asumir que aplica la otra:
1. La mayoría de las páginas (dashboard, stats, projects, prueba, plantillas, movimientosIdeaFelipe, newproject, settings, addMov) mantienen su propio `useState` local con arrays/objetos simulados y simulan la persistencia con `console.log` y diálogos de éxito/confirmación de SweetAlert2 (`Swal.fire`). Nada de esto se guarda realmente.
2. Existe una capa CRUD real y funcional respaldada por localStorage en `services/movementService.js` (con `data/movements.json` como datos semilla), además de un wrapper de fetch en `services/apiCliente.js` (espera `NEXT_PUBLIC_API_URL` para un futuro backend real) y un sistema de errores estructurado en `utils/errors/` (`AppError`, `ERROR_CODES`, `ERROR_MESSAGES` en español, `createSuccessResponse`/`createErrorResponse`). Por ahora **ninguna página importa esto** salvo `app/test/pages.tsx`, que es una demo descartable con `console.log` del sistema de errores. Cuando te pidan hacer que los datos de una página "persistan de verdad", esta es la capa a conectar, no una nueva.

**Estilos**: Tailwind CSS v4 + daisyUI v5, configurados enteramente en `app/globals.css` mediante bloques `@plugin "daisyui/theme"` (temas llamados `"dark"` y `"light"`) y un bloque `@theme` que mapea los tokens de color de daisyUI a variables CSS personalizadas. No hay `tailwind.config.js` (v4 no lo usa). `llms.txt` en la raíz del repo es la referencia completa de daisyUI 5 — consultalo para usar bien las clases/componentes en lugar de adivinar nombres de clases de daisyUI.

**Alias de rutas**: `@/*` apunta a la raíz del repo (ver `tsconfig.json`).

**Patrones de UI recurrentes** que conviene reutilizar en vez de reinventar:
- Un componente local `FadeIn` (transición de opacity/translateY al montar, vía `setTimeout`) se redefine en cada archivo en lugar de compartirse — copiá el patrón local existente al agregar una página nueva, en vez de importarlo entre archivos (no existe un componente compartido actualmente).
- SweetAlert2 (`Swal.fire`) es el estándar para confirmaciones y feedback de éxito/error, no `confirm()`/`alert()` nativos.
- lucide-react es el set de íconos en uso.
- El formato de moneda usa `Intl.NumberFormat("es-CR", { style: "currency", currency: "CRC", minimumFractionDigits: 0 })` o un prefijo manual `₵`/`₡` + `toLocaleString("es-CR")` — aparecen ambos patrones; para código nuevo preferí la versión con `Intl.NumberFormat`.

**Duplicación de configuración de ESLint**: existen tanto `eslint.config.mjs` (config flat de Next.js, extiende `eslint-config-next`) como `eslint.config.mts` (config genérica de `typescript-eslint` + `eslint-plugin-react`, sin reglas de Next.js) en la raíz del repo. La resolución de flat-config de ESLint prioriza `eslint.config.mjs`, por lo que `eslint.config.mts` está actualmente muerto/sin uso — no asumas que los cambios ahí tienen efecto.

## Git

El repo tiene muchas ramas activas por colaborador/agente (por ej. `feature/deilyn`, `develop`, `agents/*`, `temp/*`, además de los remotos `Cris`, `DaniG`, `Josue`, `maxbranch`) — revisá `git branch`/`git status` antes de asumir que `main` es la rama de integración a la que apuntar.
