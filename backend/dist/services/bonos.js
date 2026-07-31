import { randomUUID } from "node:crypto";
import { ApiError } from "../middlewares/errorHandler.js";
const bonos = [];
export function listarBonos() {
    return bonos;
}
function encontrarBono(id) {
    const bono = bonos.find((b) => b.id === id);
    if (!bono) {
        throw new ApiError(404, "NOT_FOUND", "Bono no encontrado");
    }
    return bono;
}
export function crearBono(nombre, creadoEn) {
    const bono = {
        id: randomUUID(),
        nombre,
        subtipos: [],
        creadoEn: creadoEn ?? new Date().toISOString(),
    };
    bonos.push(bono);
    return bono;
}
export function actualizarBono(id, nombre) {
    const bono = encontrarBono(id);
    bono.nombre = nombre;
    return bono;
}
export function eliminarBono(id) {
    const index = bonos.findIndex((b) => b.id === id);
    if (index === -1) {
        throw new ApiError(404, "NOT_FOUND", "Bono no encontrado");
    }
    bonos.splice(index, 1);
}
export function crearSubtipo(bonoId, nombre) {
    const bono = encontrarBono(bonoId);
    const subtipo = { id: randomUUID(), nombre };
    bono.subtipos.push(subtipo);
    return subtipo;
}
export function actualizarSubtipo(bonoId, subtipoId, nombre) {
    const bono = encontrarBono(bonoId);
    const subtipo = bono.subtipos.find((s) => s.id === subtipoId);
    if (!subtipo) {
        throw new ApiError(404, "NOT_FOUND", "Subtipo de bono no encontrado");
    }
    subtipo.nombre = nombre;
    return subtipo;
}
export function eliminarSubtipo(bonoId, subtipoId) {
    const bono = encontrarBono(bonoId);
    const index = bono.subtipos.findIndex((s) => s.id === subtipoId);
    if (index === -1) {
        throw new ApiError(404, "NOT_FOUND", "Subtipo de bono no encontrado");
    }
    bono.subtipos.splice(index, 1);
}
export function restaurarBonos(lista) {
    bonos.length = 0;
    bonos.push(...lista);
}
