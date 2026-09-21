import type { Request, Response } from "express";
import {
  actualizarItemCatalogo,
  crearItemCatalogo,
  eliminarItemCatalogo,
  listarCatalogo,
} from "../services/catalogos.js";
import { validarCrearItemCatalogo, validarTipoCatalogo } from "../validators/catalogos.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

export const getCatalogo = asyncHandler(async (req: Request, res: Response) => {
  const tipo = validarTipoCatalogo(req.params.tipo);
  res.json({ success: true, data: await listarCatalogo(tipo) });
});

export const postCatalogoItem = asyncHandler(async (req: Request, res: Response) => {
  const tipo = validarTipoCatalogo(req.params.tipo);
  const input = validarCrearItemCatalogo(req.body);
  const item = await crearItemCatalogo(tipo, input.nombre);
  res.status(201).json({ success: true, data: item });
});

export const putCatalogoItem = asyncHandler(async (req: Request, res: Response) => {
  const tipo = validarTipoCatalogo(req.params.tipo);
  const input = validarCrearItemCatalogo(req.body);
  const item = await actualizarItemCatalogo(tipo, req.params.id, input.nombre);
  res.json({ success: true, data: item });
});

export const deleteCatalogoItem = asyncHandler(async (req: Request, res: Response) => {
  const tipo = validarTipoCatalogo(req.params.tipo);
  await eliminarItemCatalogo(tipo, req.params.id);
  res.json({ success: true, data: {} });
});