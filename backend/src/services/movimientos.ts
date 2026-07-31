import { randomUUID } from "node:crypto";
import { ApiError } from "../middlewares/errorHandler.js";
import type { CrearMovimientoInput } from "../validators/movimientos.js";

export type Movimiento = CrearMovimientoInput & {
  id: string;
  creadoEn: string;
};

const movimientos: Movimiento[] = [];

export function crearMovimiento(input: CrearMovimientoInput, creadoEn?: string): Movimiento {
  const movimiento: Movimiento = {
    ...input,
    id: randomUUID(),
    creadoEn: creadoEn ?? new Date().toISOString(),
  };
  movimientos.push(movimiento);
  return movimiento;
}

export function listarMovimientos(filtros: { tipo?: string; proyectoId?: string }): Movimiento[] {
  return movimientos.filter((m) => {
    if (filtros.tipo && m.tipo !== filtros.tipo) return false;
    if (filtros.proyectoId) {
      if (m.tipo === "ingreso") {
        if (m.proyectoId !== filtros.proyectoId) return false;
      } else if (m.tipo === "egreso" && m.tipoEgreso === "egreso-general") {
        if (m.proyectoId !== filtros.proyectoId) return false;
      } else {
        return false;
      }
    }
    return true;
  });
}

export function obtenerMovimiento(id: string): Movimiento {
  const movimiento = movimientos.find((m) => m.id === id);
  if (!movimiento) {
    throw new ApiError(404, "NOT_FOUND", "Movimiento no encontrado");
  }
  return movimiento;
}

export function actualizarMovimiento(id: string, input: CrearMovimientoInput): Movimiento {
  const index = movimientos.findIndex((m) => m.id === id);
  if (index === -1) {
    throw new ApiError(404, "NOT_FOUND", "Movimiento no encontrado");
  }
  const actualizado: Movimiento = {
    ...input,
    id,
    creadoEn: movimientos[index].creadoEn,
  };
  movimientos[index] = actualizado;
  return actualizado;
}

export function eliminarMovimiento(id: string): void {
  const index = movimientos.findIndex((m) => m.id === id);
  if (index === -1) {
    throw new ApiError(404, "NOT_FOUND", "Movimiento no encontrado");
  }
  movimientos.splice(index, 1);
}

export function restaurarMovimientos(lista: Movimiento[]): void {
  movimientos.length = 0;
  movimientos.push(...lista);
}
