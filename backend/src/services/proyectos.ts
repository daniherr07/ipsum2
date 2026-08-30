import { randomUUID } from "node:crypto";
import { ApiError } from "../middlewares/errorHandler.js";
import type { ActualizarProyectoInput, CrearProyectoInput } from "../validators/proyectos.js";
import { listarMovimientos } from "./movimientos.js";

export type Proyecto = CrearProyectoInput & {
  id: string;
  creadoEn: string;
};

export type ProyectoEnriquecido = Proyecto & {
  gastadoManoObra: number;
  totalIngresos: number;
  totalEgresos: number;
  ganancia: number;
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

// Suma en una sola pasada los movimientos del proyecto: cuanto se ha gastado
// en mano de obra, y el total de ingresos/egresos para calcular la ganancia.
// Los egresos administrativos NO cuentan aqui (no pertenecen a un proyecto).
export function enriquecerProyecto(p: Proyecto): ProyectoEnriquecido {
  const movimientosDelProyecto = listarMovimientos({ proyectoId: p.id });

  let gastadoManoObra = 0;
  let totalIngresos = 0;
  let totalEgresos = 0;

  for (const m of movimientosDelProyecto) {
    if (m.tipo === "ingreso") {
      totalIngresos += m.monto;
    } else if (m.tipo === "egreso" && m.tipoEgreso === "egreso-general") {
      totalEgresos += m.monto;
      if (m.categoria === "Mano de Obra") {
        gastadoManoObra += m.monto;
      }
    }
  }

  return {
    ...p,
    gastadoManoObra,
    totalIngresos,
    totalEgresos,
    ganancia: totalIngresos - totalEgresos,
  };
}

export function listarProyectosEnriquecidos(): ProyectoEnriquecido[] {
  return proyectos.map(enriquecerProyecto);
}

export function obtenerProyectoEnriquecido(id: string): ProyectoEnriquecido {
  return enriquecerProyecto(obtenerProyecto(id));
}

// Un mes (mes+anio) esta "Cerrado" si tiene proyectos y todos estan Finalizado.
// Si no tiene proyectos, no aplica (null en el dashboard).
export function esMesCerrado(mes: string, anio: string): boolean {
  const delMes = proyectos.filter((p) => p.mesAsignacion === mes && p.anioAsignacion === anio);
  return delMes.length > 0 && delMes.every((p) => p.estado === "Finalizado");
}

export function actualizarProyecto(id: string, cambios: ActualizarProyectoInput): Proyecto {
  const index = proyectos.findIndex((p) => p.id === id);
  if (index === -1) {
    throw new ApiError(404, "NOT_FOUND", "Proyecto no encontrado");
  }
  const actual = proyectos[index];

  if (cambios.presupuestoManoObra !== undefined && cambios.presupuestoManoObra > actual.presupuesto) {
    throw new ApiError(400, "VALIDATION_ERROR", "presupuestoManoObra no puede ser mayor al presupuesto");
  }

  const actualizado: Proyecto = { ...actual, ...cambios };
  proyectos[index] = actualizado;
  return actualizado;
}
