import { ApiError } from "../middlewares/errorHandler.js";

export const TIPOS_CATALOGO = ["ordenes-compra", "proveedores"] as const;
export type TipoCatalogo = (typeof TIPOS_CATALOGO)[number];

export function validarTipoCatalogo(tipo: string): TipoCatalogo {
  if (!TIPOS_CATALOGO.includes(tipo as TipoCatalogo)) {
    throw new ApiError(400, "VALIDATION_ERROR", `tipo debe ser uno de: ${TIPOS_CATALOGO.join(", ")}`);
  }
  return tipo as TipoCatalogo;
}

export type CrearItemCatalogoInput = { nombre: string };

export function validarCrearItemCatalogo(body: unknown): CrearItemCatalogoInput {
  if (typeof body !== "object" || body === null) {
    throw new ApiError(400, "VALIDATION_ERROR", "El cuerpo de la solicitud es invalido");
  }
  const data = body as Record<string, unknown>;
  const nombre = typeof data.nombre === "string" ? data.nombre.trim() : "";
  if (!nombre) {
    throw new ApiError(400, "VALIDATION_ERROR", "nombre es obligatorio");
  }
  return { nombre };
}
