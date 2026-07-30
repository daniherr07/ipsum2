import { randomUUID } from "node:crypto";
import { ApiError } from "../middlewares/errorHandler.js";
import type { CrearProyectoInput } from "../validators/proyectos.js";

export type Proyecto = CrearProyectoInput & {
  id: string;
  creadoEn: string;
};

const proyectos: Proyecto[] = [];

export function crearProyecto(input: CrearProyectoInput, creadoEn?: string): Proyecto {
  const proyecto: Proyecto = {
    ...input,
    id: randomUUID(),
    creadoEn: creadoEn ?? new Date().toISOString(),
  };
  proyectos.push(proyecto);
  return proyecto;
}

export function listarProyectos(): Proyecto[] {
  return proyectos;
}

export function obtenerProyecto(id: string): Proyecto {
  const proyecto = proyectos.find((p) => p.id === id);
  if (!proyecto) {
    throw new ApiError(404, "NOT_FOUND", "Proyecto no encontrado");
  }
  return proyecto;
}

export function existeProyecto(id: string): boolean {
  return proyectos.some((p) => p.id === id);
}

export function restaurarProyectos(lista: Proyecto[]): void {
  proyectos.length = 0;
  proyectos.push(...lista);
}
