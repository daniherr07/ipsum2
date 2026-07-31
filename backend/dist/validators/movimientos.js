import { ApiError } from "../middlewares/errorHandler.js";
import { existeProyecto } from "../services/proyectos.js";
import { MESES } from "../utils/fechas.js";
const ANIO_REGEX = /^\d{4}$/;
const FECHA_PAGO_REGEX = /^\d{2}\/\d{2}\/\d{4}$/;
export const OPCIONES_CATEGORIA = [
    "Mano de Obra",
    "Materiales",
    "Equipamiento",
    "Servicios",
    "Otros",
];
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
export function validarCrearMovimiento(body) {
    if (typeof body !== "object" || body === null) {
        throw new ApiError(400, "VALIDATION_ERROR", "El cuerpo de la solicitud es invalido");
    }
    const data = body;
    const monto = toNumber(data.monto);
    if (monto === undefined || monto <= 0) {
        throw new ApiError(400, "VALIDATION_ERROR", "monto debe ser un numero mayor a 0");
    }
    const descripcion = toTrimmedString(data.descripcion);
    if (!descripcion) {
        throw new ApiError(400, "VALIDATION_ERROR", "descripcion es obligatoria");
    }
    if (data.tipo === "ingreso") {
        const proyectoId = toTrimmedString(data.proyectoId);
        if (!proyectoId || !existeProyecto(proyectoId)) {
            throw new ApiError(400, "VALIDATION_ERROR", "proyectoId es obligatorio y debe existir");
        }
        const nombreIngreso = toTrimmedString(data.nombreIngreso);
        if (!nombreIngreso) {
            throw new ApiError(400, "VALIDATION_ERROR", "nombreIngreso es obligatorio");
        }
        const fechaPago = toTrimmedString(data.fechaPago);
        if (!fechaPago || !FECHA_PAGO_REGEX.test(fechaPago)) {
            throw new ApiError(400, "VALIDATION_ERROR", "fechaPago es obligatoria y debe tener formato dd/mm/aaaa");
        }
        return { tipo: "ingreso", proyectoId, monto, nombreIngreso, fechaPago, descripcion };
    }
    if (data.tipo === "egreso") {
        if (data.tipoEgreso === "egreso-general") {
            const proyectoId = toTrimmedString(data.proyectoId);
            if (!proyectoId || !existeProyecto(proyectoId)) {
                throw new ApiError(400, "VALIDATION_ERROR", "proyectoId es obligatorio y debe existir");
            }
            const categoria = toTrimmedString(data.categoria);
            if (!categoria || !OPCIONES_CATEGORIA.includes(categoria)) {
                throw new ApiError(400, "VALIDATION_ERROR", `categoria debe ser una de: ${OPCIONES_CATEGORIA.join(", ")}`);
            }
            const ordenCompra = toTrimmedString(data.ordenCompra);
            return { tipo: "egreso", tipoEgreso: "egreso-general", proyectoId, monto, categoria, ordenCompra, descripcion };
        }
        if (data.tipoEgreso === "egreso-administrativo") {
            const mes = toTrimmedString(data.mes);
            if (!mes || !MESES.includes(mes)) {
                throw new ApiError(400, "VALIDATION_ERROR", "mes debe ser un mes valido para egreso administrativo");
            }
            const ano = toTrimmedString(data.ano);
            if (!ano || !ANIO_REGEX.test(ano)) {
                throw new ApiError(400, "VALIDATION_ERROR", "ano debe ser un anio de 4 digitos para egreso administrativo");
            }
            return { tipo: "egreso", tipoEgreso: "egreso-administrativo", monto, mes, ano, descripcion };
        }
        throw new ApiError(400, "VALIDATION_ERROR", "tipoEgreso debe ser 'egreso-general' o 'egreso-administrativo'");
    }
    throw new ApiError(400, "VALIDATION_ERROR", "tipo debe ser 'ingreso' o 'egreso'");
}
