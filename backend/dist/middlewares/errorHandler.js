export class ApiError extends Error {
    status;
    code;
    constructor(status, code, message) {
        super(message);
        this.status = status;
        this.code = code;
    }
}
export function notFoundHandler(req, res) {
    res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Ruta no encontrada" } });
}
export function errorHandler(err, req, res, next) {
    if (err instanceof ApiError) {
        return res.status(err.status).json({ success: false, error: { code: err.code, message: err.message } });
    }
    console.error(err);
    res.status(500).json({ success: false, error: { code: "INTERNAL_ERROR", message: "Error interno" } });
}
