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
