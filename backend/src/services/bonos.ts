import { randomUUID } from "node:crypto";
import { ApiError } from "../middlewares/errorHandler.js";

export type SubtipoBono = {
  id: string;
  nombre: string;
};

export type Bono = {
  id: string;
  nombre: string;
  subtipos: SubtipoBono[];
  creadoEn: string;
};

const bonos: Bono[] = [];

export function listarBonos(): Bono[] {
  return bonos;
}

function encontrarBono(id: string): Bono {
  const bono = bonos.find((b) => b.id === id);
  if (!bono) {
    throw new ApiError(404, "NOT_FOUND", "Bono no encontrado");
  }
  return bono;
}

export function crearBono(nombre: string, creadoEn?: string): Bono {
  const bono: Bono = {
    id: randomUUID(),
    nombre,
    subtipos: [],
    creadoEn: creadoEn ?? new Date().toISOString(),
  };
  bonos.push(bono);
  return bono;
}

export function actualizarBono(id: string, nombre: string): Bono {
  const bono = encontrarBono(id);
  bono.nombre = nombre;
  return bono;
}

export function eliminarBono(id: string): void {
  const index = bonos.findIndex((b) => b.id === id);
  if (index === -1) {
    throw new ApiError(404, "NOT_FOUND", "Bono no encontrado");
  }
  bonos.splice(index, 1);
}

export function crearSubtipo(bonoId: string, nombre: string): SubtipoBono {
  const bono = encontrarBono(bonoId);
  const subtipo: SubtipoBono = { id: randomUUID(), nombre };
  bono.subtipos.push(subtipo);
  return subtipo;
}

export function actualizarSubtipo(bonoId: string, subtipoId: string, nombre: string): SubtipoBono {
  const bono = encontrarBono(bonoId);
  const subtipo = bono.subtipos.find((s) => s.id === subtipoId);
  if (!subtipo) {
    throw new ApiError(404, "NOT_FOUND", "Subtipo de bono no encontrado");
  }
  subtipo.nombre = nombre;
  return subtipo;
}

export function eliminarSubtipo(bonoId: string, subtipoId: string): void {
  const bono = encontrarBono(bonoId);
  const index = bono.subtipos.findIndex((s) => s.id === subtipoId);
  if (index === -1) {
    throw new ApiError(404, "NOT_FOUND", "Subtipo de bono no encontrado");
  }
  bono.subtipos.splice(index, 1);
}

export function restaurarBonos(lista: Bono[]): void {
  bonos.length = 0;
  bonos.push(...lista);
}
