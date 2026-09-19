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
import { asyncHandler } from "../middlewares/asyncHandler.js";

/* C5: gasto administrativo que le corresponde al proyecto segun su mes de asignacion */
async function gastosAdministrativosDelProyecto(proyectoId: string, mes: string, anio: string): Promise<number> {
  const dist = await calcularDistribucionAdministrativa(mes, anio);
  return dist.find((d) => d.proyectoId === proyectoId)?.monto ?? 0;
}

export const postProyecto = asyncHandler(async (req: Request, res: Response) => {
  const input = await validarCrearProyecto(req.body);
  const proyecto = await crearProyecto(input);
  res.status(201).json({ success: true, data: await enriquecerProyecto(proyecto) });
});

export const getProyectos = asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, data: await listarProyectosEnriquecidos() });
});

export const getProyecto = asyncHandler(async (req: Request, res: Response) => {
  const proyecto = await obtenerProyecto(req.params.id);
  res.json({
    success: true,
    data: {
      ...(await enriquecerProyecto(proyecto)),
      gastosAdministrativosMes: await gastosAdministrativosDelProyecto(
        proyecto.id,
        proyecto.mesAsignacion,
        proyecto.anioAsignacion
      ),
    },
  });
});

/* C7: edicion parcial (presupuesto MO, contratista, mes/anio asignacion, estado) */
export const putProyecto = asyncHandler(async (req: Request, res: Response) => {
  const cambios = await validarActualizarProyecto(req.body);
  const proyecto = await actualizarProyecto(req.params.id, cambios);
  res.json({
    success: true,
    data: {
      ...(await enriquecerProyecto(proyecto)),
      gastosAdministrativosMes: await gastosAdministrativosDelProyecto(
        proyecto.id,
        proyecto.mesAsignacion,
        proyecto.anioAsignacion
      ),
    },
  });
});
