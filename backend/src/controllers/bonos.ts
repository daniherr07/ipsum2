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
import { asyncHandler } from "../middlewares/asyncHandler.js";

export const getBonos = asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, data: await listarBonos() });
});

export const postBono = asyncHandler(async (req: Request, res: Response) => {
  const nombre = validarNombre(req.body);
  const bono = await crearBono(nombre);
  res.status(201).json({ success: true, data: bono });
});

export const putBono = asyncHandler(async (req: Request, res: Response) => {
  const nombre = validarNombre(req.body);
  const bono = await actualizarBono(req.params.id, nombre);
  res.json({ success: true, data: bono });
});

export const deleteBono = asyncHandler(async (req: Request, res: Response) => {
  await eliminarBono(req.params.id);
  res.json({ success: true, data: {} });
});

export const postSubtipo = asyncHandler(async (req: Request, res: Response) => {
  const nombre = validarNombre(req.body);
  const subtipo = await crearSubtipo(req.params.id, nombre);
  res.status(201).json({ success: true, data: subtipo });
});

export const putSubtipo = asyncHandler(async (req: Request, res: Response) => {
  const nombre = validarNombre(req.body);
  const subtipo = await actualizarSubtipo(req.params.id, req.params.subtipoId, nombre);
  res.json({ success: true, data: subtipo });
});

export const deleteSubtipo = asyncHandler(async (req: Request, res: Response) => {
  await eliminarSubtipo(req.params.id, req.params.subtipoId);
  res.json({ success: true, data: {} });
});
