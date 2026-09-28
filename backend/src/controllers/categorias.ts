import type { Request, Response } from "express";
import {
  actualizarCategoria,
  crearCategoria,
  eliminarCategoria,
  listarCategorias,
} from "../services/categorias.js";
import { validarActualizarCategoria, validarCrearCategoria } from "../validators/categorias.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

export const getCategorias = asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, data: await listarCategorias() });
});

export const postCategoria = asyncHandler(async (req: Request, res: Response) => {
  const input = validarCrearCategoria(req.body);
  const categoria = await crearCategoria(input);
  res.status(201).json({ success: true, data: categoria });
});

export const putCategoria = asyncHandler(async (req: Request, res: Response) => {
  const cambios = validarActualizarCategoria(req.body);
  const categoria = await actualizarCategoria(req.params.id, cambios);
  res.json({ success: true, data: categoria });
});

export const deleteCategoria = asyncHandler(async (req: Request, res: Response) => {
  await eliminarCategoria(req.params.id);
  res.json({ success: true, data: {} });
});
