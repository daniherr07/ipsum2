import { ApiError } from "../middlewares/errorHandler.js";
import { MESES } from "../utils/fechas.js";
const ANIO_REGEX = /^\d{4}$/;
function toTrimmedString(value) {
    if (typeof value === "string")
        return value.trim();
    if (typeof value === "number")
        return String(value);
    return undefined;
}
function toNumber(value) {
    if (typeof value === "number" && Number.isFinite(value))
        return value;
    if (typeof value === "string" && value.trim() !== "") {
        const parsed = Number(value);
        if (Number.isFinite(parsed))
            return parsed;
    }
    return undefined;
}
export function validarCrearProyecto(body) {
    if (typeof body !== "object" || body === null) {
        throw new ApiError(400, "VALIDATION_ERROR", "El cuerpo de la solicitud es invalido");
    }
    const data = body;
    const nombre = toTrimmedString(data.nombre);
    if (!nombre) {
        throw new ApiError(400, "VALIDATION_ERROR", "nombre es obligatorio");
    }
    const presupuesto = toNumber(data.presupuesto);
    if (presupuesto === undefined || presupuesto <= 0) {
        throw new ApiError(400, "VALIDATION_ERROR", "presupuesto debe ser un numero mayor a 0");
    }
    const mesAsignacion = toTrimmedString(data.mesAsignacion);
    if (!mesAsignacion || !MESES.includes(mesAsignacion)) {
        throw new ApiError(400, "VALIDATION_ERROR", "mesAsignacion debe ser un mes valido");
    }
    const anioAsignacion = toTrimmedString(data.anioAsignacion);
    if (!anioAsignacion || !ANIO_REGEX.test(anioAsignacion)) {
        throw new ApiError(400, "VALIDATION_ERROR", "anioAsignacion debe ser un anio de 4 digitos");
    }
    const estado = toTrimmedString(data.estado);
    if (estado !== "Revisión" && estado !== "Finalizado") {
        throw new ApiError(400, "VALIDATION_ERROR", "estado debe ser 'Revisión' o 'Finalizado'");
    }
    const bono = toTrimmedString(data.bono);
    if (!bono) {
        throw new ApiError(400, "VALIDATION_ERROR", "bono es obligatorio");
    }
    const subtipoBono = toTrimmedString(data.subtipoBono);
    if (!subtipoBono) {
        throw new ApiError(400, "VALIDATION_ERROR", "subtipoBono es obligatorio");
    }
    return { nombre, presupuesto, mesAsignacion, anioAsignacion, estado, bono, subtipoBono };
}
