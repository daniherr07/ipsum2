import { ApiError } from "../middlewares/errorHandler.js";
import { MESES } from "../utils/fechas.js";

const ANIO_REGEX = /^\d{4}$/;

export type EstadoMes = "En proceso" | "Cerrado";

export function validarParamsMes(params: { mes?: string; anio?: string }): {
  mes: string;
  anio: string;
} {
  const mes = params.mes?.trim();
  if (!mes || !MESES.includes(mes)) {
    throw new ApiError(400, "VALIDATION_ERROR", "Seleccione un mes válido");
  }
  const anio = params.anio?.trim();
  if (!anio || !ANIO_REGEX.test(anio)) {
    throw new ApiError(400, "VALIDATION_ERROR", "Seleccione un año válido");
  }
  return { mes, anio };
}

export function validarEstadoMes(body: unknown): EstadoMes {
  if (typeof body !== "object" || body === null) {
    throw new ApiError(400, "VALIDATION_ERROR", "La solicitud no es válida. Intente nuevamente.");
  }
  const estado = (body as Record<string, unknown>).estado;
  if (estado !== "En proceso" && estado !== "Cerrado") {
    throw new ApiError(400, "VALIDATION_ERROR", "Seleccione un estado de mes válido");
  }
  return estado;
}
