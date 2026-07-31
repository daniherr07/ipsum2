import { randomUUID } from "node:crypto";
import { ApiError } from "../middlewares/errorHandler.js";
const proyectos = [];
export function crearProyecto(input, creadoEn) {
    const proyecto = {
        ...input,
        id: randomUUID(),
        creadoEn: creadoEn ?? new Date().toISOString(),
    };
    proyectos.push(proyecto);
    return proyecto;
}
export function listarProyectos() {
    return proyectos;
}
export function obtenerProyecto(id) {
    const proyecto = proyectos.find((p) => p.id === id);
    if (!proyecto) {
        throw new ApiError(404, "NOT_FOUND", "Proyecto no encontrado");
    }
    return proyecto;
}
export function existeProyecto(id) {
    return proyectos.some((p) => p.id === id);
}
export function restaurarProyectos(lista) {
    proyectos.length = 0;
    proyectos.push(...lista);
}
