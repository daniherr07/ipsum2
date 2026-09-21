import type { Request, Response } from "express";
import { cambiarEstadoMes } from "../services/meses.js";
import { validarEstadoMes, validarParamsMes } from "../validators/meses.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

export const putEstadoMes = asyncHandler(async (req: Request, res: Response) => {
  const { mes, anio } = validarParamsMes(req.params);
  const estado = validarEstadoMes(req.body);
  res.json({ success: true, data: await cambiarEstadoMes(mes, anio, estado) });
});
