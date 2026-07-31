import type { Request, Response } from "express";
import {
  actualizarBono,
  actualizarSubtipo,
  crearBono,
  crearSubtipo,
  eliminarBono,
  eliminarSubtipo,
  listarBonos,
} from "../services/bonos.js";
import { validarNombre } from "../validators/bonos.js";
import { guardarEstado } from "../persistencia.js";

export function getBonos(req: Request, res: Response) {
  res.json({ success: true, data: listarBonos() });
}

export function postBono(req: Request, res: Response) {
  const nombre = validarNombre(req.body);
  const bono = crearBono(nombre);
  guardarEstado();
  res.status(201).json({ success: true, data: bono });
}

export function putBono(req: Request, res: Response) {
  const nombre = validarNombre(req.body);
  const bono = actualizarBono(req.params.id, nombre);
  guardarEstado();
  res.json({ success: true, data: bono });
}

export function deleteBono(req: Request, res: Response) {
  eliminarBono(req.params.id);
  guardarEstado();
  res.json({ success: true, data: {} });
}

export function postSubtipo(req: Request, res: Response) {
  const nombre = validarNombre(req.body);
  const subtipo = crearSubtipo(req.params.id, nombre);
  guardarEstado();
  res.status(201).json({ success: true, data: subtipo });
}

export function putSubtipo(req: Request, res: Response) {
  const nombre = validarNombre(req.body);
  const subtipo = actualizarSubtipo(req.params.id, req.params.subtipoId, nombre);
  guardarEstado();
  res.json({ success: true, data: subtipo });
}

export function deleteSubtipo(req: Request, res: Response) {
  eliminarSubtipo(req.params.id, req.params.subtipoId);
  guardarEstado();
  res.json({ success: true, data: {} });
}
