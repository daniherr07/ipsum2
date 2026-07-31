import { randomUUID } from "node:crypto";
import { ApiError } from "../middlewares/errorHandler.js";
const catalogos = {
    "ordenes-compra": [],
    proveedores: [],
};
export function listarCatalogo(tipo) {
    return catalogos[tipo];
}
export function crearItemCatalogo(tipo, nombre, creadoEn) {
    const item = { id: randomUUID(), nombre, creadoEn: creadoEn ?? new Date().toISOString() };
    catalogos[tipo].push(item);
    return item;
}
export function actualizarItemCatalogo(tipo, id, nombre) {
    const lista = catalogos[tipo];
    const index = lista.findIndex((i) => i.id === id);
    if (index === -1) {
        throw new ApiError(404, "NOT_FOUND", "Elemento no encontrado");
    }
    lista[index] = { ...lista[index], nombre };
    return lista[index];
}
export function eliminarItemCatalogo(tipo, id) {
    const lista = catalogos[tipo];
    const index = lista.findIndex((i) => i.id === id);
    if (index === -1) {
        throw new ApiError(404, "NOT_FOUND", "Elemento no encontrado");
    }
    lista.splice(index, 1);
}
export function obtenerTodosCatalogos() {
    return catalogos;
}
export function restaurarCatalogos(data) {
    Object.keys(catalogos).forEach((tipo) => {
        catalogos[tipo].length = 0;
        catalogos[tipo].push(...(data[tipo] ?? []));
    });
}
