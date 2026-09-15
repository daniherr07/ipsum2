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
import { asyncHandler } from "../middlewares/asyncHandler.js";

function gastosAdministrativosDelProyecto(proyectoId: string, mes: string, anio: string): number {
  const dist = calcularDistribucionAdministrativa(mes, anio);
  return dist.find((d) => d.proyectoId === proyectoId)?.monto ?? 0;
}

export const postProyecto = asyncHandler(async (req: Request, res: Response) => {
  const input = await validarCrearProyecto(req.body);
  const proyecto = crearProyecto(input);
  guardarEstado();
  res.status(201).json({ success: true, data: enriquecerProyecto(proyecto) });
});

export const getProyectos = asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, data: listarProyectosEnriquecidos() });
});

export const getProyecto = asyncHandler(async (req: Request, res: Response) => {
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
});

export const putProyecto = asyncHandler(async (req: Request, res: Response) => {
  const cambios = await validarActualizarProyecto(req.body);
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
});