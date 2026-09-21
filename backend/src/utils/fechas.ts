export const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export function mesAnioDe(fechaISO: string): { mes: string; anio: string } {
  const fecha = new Date(fechaISO);
  return { mes: MESES[fecha.getMonth()], anio: String(fecha.getFullYear()) };
}

/* H3: fechaPago llega como "dd/mm/aaaa" (ver FECHA_PAGO_REGEX en
   validators/movimientos.ts), no como fecha ISO */
export function mesAnioDeFechaPago(fechaPago: string): { mes: string; anio: string } {
  const [, mm, aaaa] = fechaPago.split("/");
  return { mes: MESES[Number(mm) - 1], anio: aaaa };
}
