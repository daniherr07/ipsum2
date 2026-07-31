import { randomUUID } from "node:crypto";
import { ApiError } from "../middlewares/errorHandler.js";
import type { TipoCatalogo } from "../validators/catalogos.js";

export type ItemCatalogo = {
  id: string;
  nombre: string;
  creadoEn: string;
};

export type Catalogos = Record<TipoCatalogo, ItemCatalogo[]>;

const catalogos: Catalogos = {
  "ordenes-compra": [],
  proveedores: [],
};

export function listarCatalogo(tipo: TipoCatalogo): ItemCatalogo[] {
  return catalogos[tipo];
}

export function crearItemCatalogo(tipo: TipoCatalogo, nombre: string, creadoEn?: string): ItemCatalogo {
  const item: ItemCatalogo = { id: randomUUID(), nombre, creadoEn: creadoEn ?? new Date().toISOString() };
  catalogos[tipo].push(item);
  return item;
}

export function actualizarItemCatalogo(tipo: TipoCatalogo, id: string, nombre: string): ItemCatalogo {
  const lista = catalogos[tipo];
  const index = lista.findIndex((i) => i.id === id);
  if (index === -1) {
    throw new ApiError(404, "NOT_FOUND", "Elemento no encontrado");
  }
  lista[index] = { ...lista[index], nombre };
  return lista[index];
}

export function eliminarItemCatalogo(tipo: TipoCatalogo, id: string): void {
  const lista = catalogos[tipo];
  const index = lista.findIndex((i) => i.id === id);
  if (index === -1) {
    throw new ApiError(404, "NOT_FOUND", "Elemento no encontrado");
  }
  lista.splice(index, 1);
}

export function obtenerTodosCatalogos(): Catalogos {
  return catalogos;
}

export function restaurarCatalogos(data: Partial<Catalogos>): void {
  (Object.keys(catalogos) as TipoCatalogo[]).forEach((tipo) => {
    catalogos[tipo].length = 0;
    catalogos[tipo].push(...(data[tipo] ?? []));
  });
}
