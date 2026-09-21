import { ApiError } from "../middlewares/errorHandler.js";
import { supabase } from "../supabase.js";
import { MESES } from "../utils/fechas.js";
import type { EstadoMes } from "../validators/meses.js";

export type ResultadoCambioMes = {
  mes: string;
  anio: string;
  estado: EstadoMes;
  proyectosActualizados: number;
};

/* C4: cerrar un mes = marcar todos sus proyectos como Finalizado.
   Abrir un mes = devolverlos a Revision. La regla "cerrado si todos los
   proyectos estan Finalizado" (esMesCerrado) se mantiene como unica fuente. */
export async function cambiarEstadoMes(
  mes: string,
  anio: string,
  estado: EstadoMes
): Promise<ResultadoCambioMes> {
  const mesNumero = MESES.indexOf(mes) + 1;
  const anioNumero = Number(anio);

  const { data: proyectos, error } = await supabase
    .from("proyectos")
    .select("id")
    .eq("mes_asignacion", mesNumero)
    .eq("anio_asignacion", anioNumero);
  if (error) throw new ApiError(500, "DB_ERROR", error.message);

  if (proyectos.length === 0) {
    throw new ApiError(400, "VALIDATION_ERROR", `No hay proyectos en ${mes} ${anio}`);
  }

  const nuevoEstado = estado === "Cerrado" ? "Finalizado" : "Revisión";
  const { error: updateError } = await supabase
    .from("proyectos")
    .update({ estado: nuevoEstado })
    .eq("mes_asignacion", mesNumero)
    .eq("anio_asignacion", anioNumero);
  if (updateError) throw new ApiError(500, "DB_ERROR", updateError.message);

  return { mes, anio, estado, proyectosActualizados: proyectos.length };
}
