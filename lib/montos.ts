/* Montos con céntimos en inputs de texto.
   El valor "crudo" que se guarda en el estado es solo dígitos y, opcional,
   una coma decimal con hasta 2 decimales: "1500", "1500,", "1500,5".
   Se muestra como ₡1.500,5 (punto para miles, coma para decimales, igual
   que el resto de la app). */

/* Texto tecleado (posiblemente ya formateado, ej. "₡1.500,5") -> crudo */
export function limpiarMontoInput(texto: string): string {
  /* El punto solo aparece en el valor formateado como separador de miles;
     si el usuario teclea un punto al final (sin coma previa) quiso decir
     decimal: se convierte en coma para no pegar los decimales al entero. */
  let t = texto
  if (t.endsWith(".") && !t.includes(",")) t = `${t.slice(0, -1)},`

  t = t.replace(/[^\d,]/g, "")
  const coma = t.indexOf(",")
  let entero = coma >= 0 ? t.slice(0, coma) : t
  const decimales = coma >= 0 ? t.slice(coma + 1).replace(/,/g, "").slice(0, 2) : ""

  entero = entero.replace(/^0+(?=\d)/, "")
  if (coma >= 0) return `${entero || "0"},${decimales}`
  return entero
}

/* Crudo -> número (redondeado a céntimos) */
export function montoANumero(crudo: string): number {
  const n = Number(crudo.replace(",", "."))
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0
}

/* Número -> crudo (para precargar un input, ej. "Usar restante") */
export function numeroAMontoInput(valor: number): string {
  const redondeado = Math.round(valor * 100) / 100
  if (Number.isInteger(redondeado)) return String(redondeado)
  return redondeado.toFixed(2).replace(".", ",").replace(/0$/, "")
}

/* Crudo -> texto visible del input, respetando lo tecleado ("₡1.500," mientras
   se escribe la coma) */
export function formatearMontoInput(crudo: string): string {
  if (!crudo) return ""
  const [entero, decimales] = crudo.split(",")
  const enteroFmt = (Number(entero) || 0).toLocaleString("es-ES", {
    maximumFractionDigits: 0,
    useGrouping: "always",
  })
  return decimales !== undefined ? `₡${enteroFmt},${decimales}` : `₡${enteroFmt}`
}

/* Número -> texto de solo lectura (₡1.500 o ₡1.500,50) */
export function formatearMonto(valor: number): string {
  const conCentimos = Math.round(valor * 100) % 100 !== 0
  return `₡${valor.toLocaleString("es-ES", {
    minimumFractionDigits: conCentimos ? 2 : 0,
    maximumFractionDigits: 2,
    useGrouping: "always",
  })}`
}
