import { randomUUID } from "node:crypto";
import { ApiError } from "../middlewares/errorHandler.js";
import type { ActualizarProyectoInput, CrearProyectoInput } from "../validators/proyectos.js";
import { listarMovimientos } from "./movimientos.js";

export type Proyecto = CrearProyectoInput & {
  id: string;
  creadoEn: string;
};

/* Campos derivados: se calculan desde los movimientos, no se almacenan */
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

/* Enriquecimiento (C2, C6): una sola pasada sobre los movimientos del proyecto */
export function enriquecerProyecto(proyecto: Proyecto): ProyectoEnriquecido {
  const movimientos = listarMovimientos({ proyectoId: proyecto.id });
  let totalIngresos = 0;
  let totalEgresos = 0;
  let gastadoManoObra = 0;
  for (const m of movimientos) {
    if (m.tipo === "ingreso") {
      totalIngresos += m.monto;
    } else if (m.tipo === "egreso" && m.tipoEgreso === "egreso-general") {
      totalEgresos += m.monto;
      if (m.categoria === "Mano de Obra") gastadoManoObra += m.monto;
    }
  }
  return {
    ...proyecto,
    gastadoManoObra,
    totalIngresos,
    totalEgresos,
    ganancia: totalIngresos - totalEgresos,
  };
}

export function listarProyectosEnriquecidos(): ProyectoEnriquecido[] {
  return proyectos.map(enriquecerProyecto);
}

/* C4: un mes esta "Cerrado" si tiene >= 1 proyecto y TODOS estan Finalizados */
export function esMesCerrado(mes: string, anio: string): boolean {
  const delMes = proyectos.filter((p) => p.mesAsignacion === mes && p.anioAsignacion === anio);
  return delMes.length > 0 && delMes.every((p) => p.estado === "Finalizado");
}

/* C7: merge parcial de campos. La regla M1 (MO <= presupuesto del proyecto)
   se valida aqui porque requiere el proyecto actual cargado */
export function actualizarProyecto(id: string, cambios: ActualizarProyectoInput): Proyecto {
  const proyecto = obtenerProyecto(id);
  if (
    cambios.presupuestoManoObra !== undefined &&
    cambios.presupuestoManoObra > proyecto.presupuesto
  ) {
    throw new ApiError(400, "VALIDATION_ERROR", "presupuestoManoObra no puede superar el presupuesto del proyecto");
  }
  Object.assign(proyecto, cambios);
  return proyecto;
}

export function restaurarProyectos(lista: Proyecto[]): void {
  proyectos.length = 0;
  /* Normaliza proyectos legacy que no tengan los campos nuevos (C2, C3) */
  proyectos.push(
    ...lista.map((p) => ({
      presupuestoManoObra: 0,
      contratista: "-",
      ...p,
    }))
  );
}
