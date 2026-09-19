import type { Request, Response } from "express";
import {
  actualizarMovimiento,
  crearMovimiento,
  eliminarMovimiento,
  listarMovimientos,
} from "../services/movimientos.js";
import { validarCrearMovimiento } from "../validators/movimientos.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

export const postMovimiento = asyncHandler(async (req: Request, res: Response) => {
  const input = await validarCrearMovimiento(req.body);
  const movimiento = await crearMovimiento(input);
  res.status(201).json({ success: true, data: movimiento });
});

export const getMovimientos = asyncHandler(async (req: Request, res: Response) => {
  const { tipo, proyectoId } = req.query;
  const movimientos = await listarMovimientos({
    tipo: typeof tipo === "string" ? tipo : undefined,
    proyectoId: typeof proyectoId === "string" ? proyectoId : undefined,
  });
  res.json({ success: true, data: movimientos });
});

export const putMovimiento = asyncHandler(async (req: Request, res: Response) => {
  const input = await validarCrearMovimiento(req.body);
  const movimiento = await actualizarMovimiento(req.params.id, input);
  res.json({ success: true, data: movimiento });
});

export const deleteMovimiento = asyncHandler(async (req: Request, res: Response) => {
  await eliminarMovimiento(req.params.id);
  res.json({ success: true, data: {} });
});
