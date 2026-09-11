import type { Request, Response } from "express";
import {
  actualizarProyecto,
  crearProyecto,
  enriquecerProyecto,
  listarProyectosEnriquecidos,
  obtenerProyecto,
} from "../services/proyectos.js";
import { calcularDistribucionAdministrativa } from "../services/dashboard.js";
import { validarActualizarProyecto, validarCrearProyecto } from "../validators/proyectos.js";
import { guardarEstado } from "../persistencia.js";

/* C5: gasto administrativo que le corresponde al proyecto segun su mes de asignacion */
function gastosAdministrativosDelProyecto(proyectoId: string, mes: string, anio: string): number {
  const dist = calcularDistribucionAdministrativa(mes, anio);
  return dist.find((d) => d.proyectoId === proyectoId)?.monto ?? 0;
}

export function postProyecto(req: Request, res: Response) {
  const input = validarCrearProyecto(req.body);
  const proyecto = crearProyecto(input);
  guardarEstado();
  res.status(201).json({ success: true, data: enriquecerProyecto(proyecto) });
}

export function getProyectos(req: Request, res: Response) {
  res.json({ success: true, data: listarProyectosEnriquecidos() });
}

export function getProyecto(req: Request, res: Response) {
  const proyecto = obtenerProyecto(req.params.id);
  res.json({
    success: true,
    data: {
      ...enriquecerProyecto(proyecto),
      gastosAdministrativosMes: gastosAdministrativosDelProyecto(
        proyecto.id,
        proyecto.mesAsignacion,
        proyecto.anioAsignacion
      ),
    },
  });
}

/* C7: edicion parcial (presupuesto MO, contratista, mes/anio asignacion, estado) */
export function putProyecto(req: Request, res: Response) {
  const cambios = validarActualizarProyecto(req.body);
  const proyecto = actualizarProyecto(req.params.id, cambios);
  guardarEstado();
  res.json({
    success: true,
    data: {
      ...enriquecerProyecto(proyecto),
      gastosAdministrativosMes: gastosAdministrativosDelProyecto(
        proyecto.id,
        proyecto.mesAsignacion,
        proyecto.anioAsignacion
      ),
    },
  });
}
