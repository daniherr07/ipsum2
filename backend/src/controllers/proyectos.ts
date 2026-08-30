import type { Request, Response } from "express";
import {
  actualizarProyecto,
  crearProyecto,
  enriquecerProyecto,
  listarProyectosEnriquecidos,
  obtenerProyectoEnriquecido,
} from "../services/proyectos.js";
import { validarActualizarProyecto, validarCrearProyecto } from "../validators/proyectos.js";
import { calcularDistribucionAdministrativa } from "../services/dashboard.js";
import { guardarEstado } from "../persistencia.js";

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
  const proyecto = obtenerProyectoEnriquecido(req.params.id);
  const distribucion = calcularDistribucionAdministrativa(proyecto.mesAsignacion, proyecto.anioAsignacion);
  const gastosAdministrativosMes = distribucion.find((d) => d.proyectoId === proyecto.id)?.monto ?? 0;
  res.json({ success: true, data: { ...proyecto, gastosAdministrativosMes } });
}

export function putProyecto(req: Request, res: Response) {
  const cambios = validarActualizarProyecto(req.body);
  const proyecto = actualizarProyecto(req.params.id, cambios);
  guardarEstado();
  res.json({ success: true, data: enriquecerProyecto(proyecto) });
}
