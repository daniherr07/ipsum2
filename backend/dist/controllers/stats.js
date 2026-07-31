import { ApiError } from "../middlewares/errorHandler.js";
import { calcularStats } from "../services/stats.js";
const ANIO_REGEX = /^\d{4}$/;
export function getStats(req, res) {
    const { anio, tipoBono } = req.query;
    let anioFinal = String(new Date().getFullYear());
    if (typeof anio === "string" && anio.trim() !== "") {
        if (!ANIO_REGEX.test(anio)) {
            throw new ApiError(400, "VALIDATION_ERROR", "anio debe ser un anio de 4 digitos");
        }
        anioFinal = anio;
    }
    const tipoBonoFinal = typeof tipoBono === "string" && tipoBono.trim() !== "" ? tipoBono : undefined;
    res.json({ success: true, data: calcularStats(anioFinal, tipoBonoFinal) });
}
