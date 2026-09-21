export const ANIO_INICIAL = 2023;

/* Años seleccionables: desde 2023 hasta el año actual + 5.
   Se calcula dinámicamente para no quedar desactualizado. */
export const ANOS: number[] = (() => {
  const fin = new Date().getFullYear() + 5;
  const anios: number[] = [];
  for (let anio = ANIO_INICIAL; anio <= fin; anio++) anios.push(anio);
  return anios;
})();
