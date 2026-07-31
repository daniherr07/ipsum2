import { ApiError } from "../middlewares/errorHandler.js";
export const TIPOS_CATALOGO = ["ordenes-compra", "proveedores"];
export function validarTipoCatalogo(tipo) {
    if (!TIPOS_CATALOGO.includes(tipo)) {
        throw new ApiError(400, "VALIDATION_ERROR", `tipo debe ser uno de: ${TIPOS_CATALOGO.join(", ")}`);
    }
    return tipo;
}
export function validarCrearItemCatalogo(body) {
    if (typeof body !== "object" || body === null) {
        throw new ApiError(400, "VALIDATION_ERROR", "El cuerpo de la solicitud es invalido");
    }
    const data = body;
    const nombre = typeof data.nombre === "string" ? data.nombre.trim() : "";
    if (!nombre) {
        throw new ApiError(400, "VALIDATION_ERROR", "nombre es obligatorio");
    }
    return { nombre };
}
