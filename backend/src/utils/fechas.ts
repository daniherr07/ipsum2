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

/* "dd/mm/aaaa" que exista en el calendario (31/02 pasa el regex pero no
   es una fecha real; sin esto Postgres la rechaza con un error 500) */
export function esFechaValida(fecha: string): boolean {
  const [dd, mm, aaaa] = fecha.split("/").map(Number);
  const d = new Date(Date.UTC(aaaa, mm - 1, dd));
  return d.getUTCFullYear() === aaaa && d.getUTCMonth() === mm - 1 && d.getUTCDate() === dd;
}
