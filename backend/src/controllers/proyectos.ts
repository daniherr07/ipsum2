import type { Request, Response } from "express";
import { crearProyecto, listarProyectos, obtenerProyecto } from "../services/proyectos.js";
import { validarCrearProyecto } from "../validators/proyectos.js";
import { guardarEstado } from "../persistencia.js";

export function postProyecto(req: Request, res: Response) {
  const input = validarCrearProyecto(req.body);
  const proyecto = crearProyecto(input);
  guardarEstado();
  res.status(201).json({ success: true, data: proyecto });
}

export function getProyectos(req: Request, res: Response) {
  res.json({ success: true, data: listarProyectos() });
}

export function getProyecto(req: Request, res: Response) {
  const proyecto = obtenerProyecto(req.params.id);
  res.json({ success: true, data: proyecto });
}
