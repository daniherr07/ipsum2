import type { Request, Response } from "express";
import { calcularConciliacion } from "../services/conciliacion.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

export const getConciliacion = asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, data: await calcularConciliacion() });
});
