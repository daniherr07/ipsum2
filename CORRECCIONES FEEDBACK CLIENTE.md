# Correcciones al feedback del cliente

Cada punto tiene: lo que reportó el cliente, la causa encontrada en el sistema, la corrección aplicada y su estado.

**Estados**
- ✅ **Verificado:** corregido y comprobado con los datos reales del sistema.
- ✅ **Corregido:** cambio hecho y revisado; falta probarlo en la app.
- ⚠️ **Mitigado:** se reforzó el punto débil, pero la causa no está confirmada.

---

## 1. No acepta decimales al ingresar un movimiento — ✅ Corregido

**Reporte:** "Creo que no acepta decimales cuando uno ingresa un movimiento."

**Causa:** El campo de monto eliminaba todo lo que no fuera un número, incluida la coma. Peor aún: si se escribía `1500,50`, la coma desaparecía y se guardaba **₡150.050** sin ningún aviso. Además, el servidor rechazaba cualquier monto con decimales.

**Corrección:**
- El campo de monto ahora acepta coma decimal (máximo 2 decimales), por ejemplo `₡1.500,50`. Si se escribe un punto al final, se toma como coma decimal.
- El servidor acepta montos con hasta 2 decimales.
- La edición de movimientos también permite decimales.

---

## 2. Error al poner una categoría — ✅ Corregido

**Reporte:** "Me salió error al tratar de poner una categoría."

**Causa:** En la base de datos, la columna de categoría de los movimientos todavía tenía una lista fija de valores (Mano de Obra, Materiales, Equipamiento, Servicios, Otros). Las categorías nuevas creadas desde la app no estaban en esa lista, por lo que la base de datos rechazaba el movimiento.

**Corrección:**
- Se migró la base de datos para que la columna acepte cualquier categoría del catálogo configurable. Si una categoría se renombra en Configuración, sus movimientos se actualizan solos.
- Si una categoría no es válida, el mensaje de error ahora explica el problema en vez de mostrar un error técnico.

---

## 3. Un ingreso suma en el caso pero no en el mes — ✅ Verificado

**Reporte:** "Pongo un ingreso y no me suma creo, los suma en el caso, pero no en el mes."

**Causa:** El resumen del mes ubicaba cada ingreso según su **fecha de pago**, no según el mes del proyecto. Si la fecha de pago caía en otro mes, el ingreso aparecía en ese otro mes. En el detalle del caso sí se veía, porque ahí se suman todos sus ingresos.

**Corrección:** Los ingresos ahora se cuentan en el **mes asignado al proyecto**, sin importar la fecha de pago. Ver el punto 13 para la comprobación con los datos reales.

---

## 4. Ver los pagos de mano de obra por separado, con fecha — ✅ Corregido

**Reporte:** "La mano de obra me gustaría que pudiera haber la diferencia de observar las líneas por aparte… para enviarle al contratista lo que le queda o el desglose pago por pago con fecha."

**Causa:** El detalle del proyecto agrupaba toda la mano de obra en una sola línea, y los egresos no tenían una fecha de pago propia (solo la fecha en que se registraron).

**Corrección:**
- Los egresos generales ahora tienen un campo **Fecha de pago** (por defecto, el día de hoy), que también se puede editar en la lista de movimientos.
- Nueva sección **"Pagos de Mano de Obra"** en el detalle del proyecto: cada pago con su fecha, descripción y monto, el acumulado, el presupuesto de mano de obra, lo pagado y **lo que le queda al contratista**.
- Botón **"Copiar desglose"** para pegarlo directamente en WhatsApp o correo.
- Los egresos registrados antes de este cambio muestran su fecha de registro.

---

## 5. Ver el % de ingreso respecto al presupuesto — ✅ Corregido

**Reporte:** "Sería bueno ver el % de ingreso vrs el presupuesto."

**Corrección:** La tarjeta de **Ingresos** del proyecto muestra ahora qué porcentaje del presupuesto ya ingresó.

---

## 6. Cuadro con lo restante por desembolsar — ✅ Corregido

**Reporte:** "Un cuadrito adicional donde esté lo restante por desembolsar (presupuesto menos ingresos) y aparezca también el % faltante."

**Corrección:** Nueva tarjeta **"Por desembolsar"** en el detalle del proyecto: presupuesto − ingresos, con el % que falta por ingresar.

---

## 7. Porcentajes pequeños en cada monto — ✅ Corregido

**Reporte:** "También el % en administrativo, en general sería bueno los porcentajes en pequeño respectivos en cada monto."

**Corrección:** En el detalle del proyecto, cada monto muestra un % pequeño:
- Ingresos, Egresos y Por desembolsar: % del presupuesto.
- Ganancia: % sobre los ingresos.
- Gasto administrativo: % del presupuesto del caso.
- Mano de obra: % usado del presupuesto de mano de obra.
- Desglose de egresos: % de cada categoría sobre el total de egresos.

---

## 8. El % de administrativos por caso no representa lo correcto — ✅ Verificado

**Reporte:** "El % de administrativos en cada caso representa el porcentaje del presupuesto de cada caso respecto al total del presupuesto del mes, y debería representar el % de administrativos de cada caso respecto al presupuesto del caso."

**Causa:** El porcentaje mostrado era el **peso** del caso dentro del mes (presupuesto del caso ÷ presupuesto total del mes).

**Corrección:** Ahora el % de cada caso es **gasto administrativo asignado ÷ presupuesto del caso**. El peso del caso se sigue mostrando aparte, en pequeño.

> **Nota:** como el gasto administrativo se reparte en proporción al presupuesto de cada caso, este porcentaje resulta **igual para todos los casos del mes**, y coincide con el % general del mes. Comprobado con los datos reales: mayo 15,08 %, junio 11,71 % y julio 60,2 % en todos sus casos.

---

## 9. No deja borrar el "01" del día en la fecha del ingreso — ✅ Corregido

**Reporte:** "En la fecha no deja borrar el 01 que está por defecto; si quiero poner 05 no me deja, solo me permite poner el 5 pero conserva el 01."

**Causa:** El campo del día se corregía automáticamente con cada tecla: al borrarlo volvía a `01`, y al escribir `0` también.

**Corrección:**
- Ahora se puede borrar y escribir libremente; el día se ajusta al salir del campo.
- Se valida que la fecha exista: por ejemplo, 31/02 muestra un aviso en lugar de fallar al guardar.

---

## 10. El cuadro de mano de obra no se actualiza — ✅ Corregido

**Reporte:** "Cuando se ingresa una mano de obra, en el cuadro donde muestra lo utilizado y demás parece que no se actualiza."

**Causa:** El formulario cargaba los datos de los proyectos una sola vez, al abrirse, y no los volvía a cargar después de guardar. Además, no contaba los egresos de mano de obra ya agregados a la lista pero aún no guardados.

**Corrección:**
- Los datos se recargan después de cada guardado.
- El cuadro suma también los egresos de mano de obra pendientes de guardar (lo indica aparte) y avisa si se excede el presupuesto.

---

## 11. Se quedó pegado en el mensaje de confirmación al guardar — ⚠️ Mitigado

**Reporte:** "En algunas ocasiones se me pegó al guardar un movimiento, exactamente en el mensaje de confirmación de que fue exitoso el ingreso… pero sí se ingresa bien."

**Causa:** No se pudo reproducir una causa exacta. Se identificaron puntos débiles: las llamadas al servidor no tenían tiempo máximo de espera, y el formulario podía volver a enviarse mientras el mensaje de éxito seguía abierto.

**Corrección (mitigación):**
- Si el servidor no responde en 20 segundos, se muestra un mensaje de error en vez de quedarse esperando.
- Se bloquea el reenvío del formulario hasta cerrar el mensaje de confirmación.
- Si un egreso con varias partes falla a la mitad, el mensaje indica cuántas se guardaron, y esas se quitan de la lista para no duplicarlas al reintentar.

**Pendiente:** para confirmarlo necesitamos saber en qué dispositivo y navegador ocurrió, si era un ingreso o un egreso, si el botón se quedó en "Guardando…" o si el mensaje no se podía cerrar, y si la conexión estaba lenta.

---

## 12. Error al meter "Dirección técnica" o "Servicios" — ✅ Corregido

**Reporte:** "Al intentar meter una dirección técnica o servicios me sale error."

**Causa:** La misma del punto 2: la base de datos solo aceptaba la lista fija original de categorías (Mano de Obra, Materiales, Equipamiento, Servicios, Otros). En el catálogo, estas categorías se llaman **"Dirección Técnica"** y **"Servicios (alquiler, luz, agua)"**, y ninguna de las dos estaba en esa lista. "Servicios" sí estaba, pero escrito distinto.

**Corrección:** La misma migración del punto 2, ya aplicada. Ahora se acepta cualquier categoría del catálogo, incluidas "Batidora" y "Comisiones".

---

## 13. Los ingresos del mes no coinciden con la suma de los casos — ✅ Verificado

**Reporte:** "Los ingresos totales metidos en todos los casos no coinciden con la suma de todos en el mes… a pesar de que uno lo asigne a un proyecto (mayo), si el ingreso tiene fecha de junio se asigna a junio y no a mayo como debe ser."

**Causa:** Confirmada, tal como lo describe el cliente: el mes de un ingreso se tomaba de su fecha de pago. En los datos actuales, 6 ingresos tenían una fecha de pago fuera del mes de su proyecto.

**Corrección:** Los ingresos ahora pertenecen al **mes asignado del proyecto**. Un ingreso de un caso de mayo cuenta en mayo aunque se haya pagado en junio. El resumen del mes y el Control de Cuentas usan el mismo criterio. La fecha de pago se sigue guardando y mostrando tal como se ingresó.

Comprobado con los datos reales (ingresos del mes, en colones):

| Mes | Antes | Ahora | Suma de los casos del mes |
|---|---|---|---|
| Mayo 2026 | 41.196.000 | 68.460.000 | 68.460.000 ✅ |
| Junio 2026 | 13.844.000 | 15.000.000 | 15.000.000 ✅ |
| Julio 2026 | 0 | 8.700.000 | 8.700.000 ✅ |
| Septiembre 2026 | 8.700.000 | 0 | sin casos |
| Octubre 2026 | 28.420.000 | 0 | sin casos |

---

## Notas para el equipo

1. **Migración de base de datos: ya aplicada en Supabase** (`backend/sql/2026-10-feedback-cliente.sql`). Confirmado:
   - `movimientos.categoria` pasó de la lista fija (enum) a texto, con la referencia `movimientos_categoria_fkey` al catálogo `categorias` (puntos 2 y 12).
   - La restricción `movimientos_forma_valida` ya permite la fecha de pago en egresos generales (punto 4).

   Después de la migración, el backend lee sin errores los 40 movimientos existentes. Si se monta otro ambiente (por ejemplo, uno de pruebas), hay que correr el script ahí **antes** de desplegar el código: sin él, todo egreso general falla al guardar. Se puede correr más de una vez.
2. Cambios de código: `backend/src/services/movimientos.ts` (mes de los ingresos, fecha de egresos, mensajes de error), `backend/src/validators/movimientos.ts` (decimales y fechas), `backend/src/services/dashboard.ts` (% admin por caso), `app/agregarMovimento/page.tsx`, `app/proyecto/[id]/page.tsx`, `app/page.jsx`, `app/movs/page.jsx`, `lib/api.ts` (tiempo máximo de espera) y el nuevo `lib/montos.ts`.
3. Verificación hecha: el backend y el frontend compilan sin errores, y el lint no tiene errores nuevos. Los puntos marcados como "Verificado" se comprobaron con lecturas de los datos reales. No se crearon ni modificaron movimientos. Falta probar en la app los flujos de crear y editar.
