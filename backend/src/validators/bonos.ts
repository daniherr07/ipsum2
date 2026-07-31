import { ApiError } from "../middlewares/errorHandler.js";

export function validarNombre(body: unknown): string {
  if (typeof body !== "object" || body === null) {
    throw new ApiError(400, "VALIDATION_ERROR", "El cuerpo de la solicitud es invalido");
  }
  const data = body as Record<string, unknown>;
  const nombre = typeof data.nombre === "string" ? data.nombre.trim() : "";
  if (!nombre) {
    throw new ApiError(400, "VALIDATION_ERROR", "nombre es obligatorio");
  }
  return nombre;
}
