# Resumen para reunión — Estado del proyecto Ipsum2

Documento de referencia con todo lo necesario para explicar en qué punto está el proyecto antes de entregarlo al cliente (Felipe). Actualizado al 2026-09-19.

---

## 1. Resumen ejecutivo

El backend se migró por completo de un archivo local (`seed-data.json`) a una base de datos real en **Supabase (Postgres)**, con seguridad configurada. Todas las pantallas de la app (proyectos, movimientos, dashboard, Control de Cuentas, catálogos) están conectadas a esta base de datos real y probadas de punta a punta.

**Lo que NO está listo:** autenticación real (login de verdad) — lo va a construir otra web, no es responsabilidad de este equipo por ahora. Mientras eso no exista, la app funciona pero cualquiera que tenga la URL puede entrar sin contraseña.

---

## 2. Qué está listo (probado, funcionando)

| Módulo | Estado | Notas |
|---|---|---|
| Proyectos (crear, ver, editar, listar) | ✅ Listo | Incluye presupuesto de mano de obra, contratista, ganancia calculada |
| Movimientos (ingreso, egreso general, egreso administrativo) | ✅ Listo | Incluye orden de compra y proveedor opcionales |
| Catálogos (contratistas, proveedores, órdenes de compra, bonos, cuentas bancarias) | ✅ Listo | Todos conectados a formularios reales, con opción de "+ Agregar nuevo" en el momento |
| Dashboard (ingresos, egresos, balance, gastos administrativos) | ✅ Listo | Prorrateo automático por peso de presupuesto entre proyectos del mes |
| Meses "En proceso" / "Cerrado" | ✅ Listo | Un mes se cierra cuando todos sus proyectos están "Finalizado" |
| Control de Cuentas (conciliación bancaria) | ✅ Listo | Saldos bancarios se comparan contra el balance real de la app |
| Base de datos (esquema completo) | ✅ Listo | 10 tablas, relaciones, restricciones de integridad |
| Seguridad de base de datos (RLS) | ✅ Configurada | Ver sección 5 — construida pero no "activa" hasta que haya login real |

---

## 3. Qué falta — OBLIGATORIO antes de entregar al cliente

| # | Qué falta | Por qué es obligatorio | Quién lo hace |
|---|---|---|---|
| 1 | **Autenticación real** | Sin esto, cualquiera con el link entra sin contraseña y puede borrar datos financieros reales | La otra web (fuera de este equipo) |
| 2 | **Cargar datos reales del cliente** | Hoy la base está completamente vacía a propósito | El equipo, usando la app normal (Settings + formularios) |
| 3 | **Checklist de seguridad de Supabase** (ver sección 5) | Ajustes que evitan registro público no autorizado y protegen contraseñas | Quien tenga acceso al dashboard de Supabase (pasos abajo) |
| 4 | **Confirmar la URL exacta de producción** (ya se sabe que es el dominio donde vive Ipsum1) | El backend hoy solo acepta peticiones desde `localhost:3000`; hay que decirle cuál es la URL real | El equipo, en cuanto se confirme la URL exacta |
| 5 | **Correr el plan de pruebas manual** (sección 6) | Confirmar que todo funciona con datos reales, no solo de prueba | El equipo, antes de la entrega |

---

## 4. Qué es OPCIONAL (mejoras, no bloquean la entrega)

| # | Qué es | Por qué es opcional |
|---|---|---|
| 1 | Pruebas automatizadas (Vitest) | Protegen contra errores futuros al modificar código, pero hoy todo ya está probado manualmente |
| 2 | Backend de "Control de Cuentas" con más funciones (histórico de saldos, cierres de ejercicio) | La versión actual (saldo manual comparado contra balance) ya cumple lo que pidió el cliente |
| 3 | Decidir el futuro del catálogo "Proveedores" en más lugares de la app | Ya está conectado a los egresos; si se quiere en más pantallas, es una extensión, no una corrección |
| 4 | Rate limiting / límites de peticiones por IP | Solo relevante cuando el backend sea públicamente accesible en internet |

✅ **Ya resuelto:** las 3 cuentas bancarias por defecto (Banco Nacional, BAC, Mutual) ya están sembradas en Supabase, visibles en Control de Cuentas.

---

## 5. Checklist de seguridad — Supabase (manual, en el dashboard)

Ir a **supabase.com → tu proyecto → Authentication → Settings**:

- [ ] **"Allow new users to sign up"** → apagar (nadie debe poder registrarse solo)
- [ ] **"Leaked password protection"** → activar
- [ ] **MFA (doble verificación)** → activar al menos para la cuenta admin, si el plan lo permite
- [ ] **Database → Backups** → confirmar que los backups automáticos estén activos (son datos financieros)
- [ ] **Revisar que ninguna clave de Supabase se haya subido a git alguna vez** (buscar en el historial de commits `.env`, `SUPABASE`, `service_role`)

**Nota técnica:** la seguridad por fila (RLS) ya está 100% configurada en las 9 tablas de negocio — nadie sin sesión puede leer ni escribir nada. Hoy el backend usa una llave maestra que se salta esa protección (es normal, es un servidor de confianza). Esa protección se vuelve "real" en cuanto exista login — ese día hay que cambiar una pieza de código para que el backend use el token de sesión del usuario en vez de la llave maestra.

---

## 6. Plan de pruebas antes de entregar

Con los dos servidores corriendo (`backend/` y la raíz del proyecto), probar en este orden:

1. **Catálogos** — en Settings, crear un contratista, un bono (con y sin subtipos), una orden de compra, un proveedor, una cuenta bancaria real.
2. **Proyecto** — crear un proyecto real usando esos catálogos. Verificar que aparezca en la lista y en el detalle.
3. **Movimientos** — agregar los 3 tipos: ingreso, egreso general (probando orden de compra y proveedor), egreso administrativo.
4. **Edición** — editar un proyecto (cambiar estado a "Finalizado") y editar un movimiento.
5. **Dashboard** — confirmar que los números del mes coincidan con lo cargado.
6. **Control de Cuentas** — escribir saldos bancarios reales, confirmar que "cuadra exacto" cuando coinciden con el balance de la app. Recargar la página y confirmar que los saldos no se pierden.
7. **Persistencia real** — apagar el backend y volver a prenderlo. Todo debe seguir ahí (ya no depende de memoria ni de archivos locales).
8. **Casos límite** — intentar crear un proyecto con un bono/contratista inexistente (debe rechazarlo con un mensaje claro), intentar un movimiento con monto decimal (debe rechazarlo, los montos son colones enteros).
9. **Mes cerrado** — finalizar todos los proyectos de un mes y confirmar que ya no aparece en Control de Cuentas ni se puede seleccionar en formularios de ese mes.

---

## 7. Preguntas / decisiones para la reunión

### Ya respondidas (2026-09-19)

- **Dominio de producción:** el cliente ya tiene su propio dominio, donde vive **Ipsum1** — Ipsum2 se conecta ahí. Falta confirmar la URL exacta para configurar CORS cuando se despliegue.
- **Acceso admin a Supabase:** lo van a tener **Felipe y las personas que él autorice**.
- **Catálogo "Proveedores":** por ahora solo se necesita en egresos (ya está conectado ahí). Si en el futuro se necesita en otro lado (ej. asignarlo a un proyecto, o un reporte por proveedor), es una extensión nueva, no algo pendiente hoy.

### Pendiente — la más importante para el siguiente paso técnico

- **¿Cómo se conecta la autenticación con Ipsum1?** Ipsum2 debe integrarse con el login de Ipsum1, pero todavía no se sabe el mecanismo. Hay que preguntarle al equipo de Ipsum1:
  - ¿Van a compartir la sesión (un token/cookie que Ipsum2 pueda verificar para saber quién entró), o Ipsum2 va a tener su propio login separado?
  - Si comparten sesión: ¿qué tecnología usa Ipsum1 para login? (¿tiene su propia base de usuarios? ¿usa algún proveedor externo tipo Google/Auth0?)
  - ¿Ipsum1 puede exponer un endpoint o token que Ipsum2 pueda validar, o hay que construir puente entre los dos sistemas?

  **Esta respuesta cambia bastante el trabajo pendiente** — no se puede planificar la conexión real hasta saberlo.
