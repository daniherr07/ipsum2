import { ApiError } from "../middlewares/errorHandler.js";
import { calcularDashboard } from "../services/dashboard.js";
import { MESES } from "../utils/fechas.js";
const ANIO_REGEX = /^\d{4}$/;
export function getDashboard(req, res) {
    const { mes, anio } = req.query;
    const ahora = new Date();
    let mesFinal = MESES[ahora.getMonth()];
    if (typeof mes === "string" && mes.trim() !== "") {
        if (!MESES.includes(mes)) {
            throw new ApiError(400, "VALIDATION_ERROR", "mes debe ser un mes valido");
        }
        mesFinal = mes;
    }
    let anioFinal = String(ahora.getFullYear());
    if (typeof anio === "string" && anio.trim() !== "") {
        if (!ANIO_REGEX.test(anio)) {
            throw new ApiError(400, "VALIDATION_ERROR", "anio debe ser un anio de 4 digitos");
        }
        anioFinal = anio;
    }
    res.json({ success: true, data: calcularDashboard(mesFinal, anioFinal) });
}
