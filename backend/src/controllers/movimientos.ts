import type { Request, Response } from "express";
import {
  actualizarMovimiento,
  crearMovimiento,
  eliminarMovimiento,
  listarMovimientos,
} from "../services/movimientos.js";
import { validarCrearMovimiento } from "../validators/movimientos.js";
import { guardarEstado } from "../persistencia.js";

export function postMovimiento(req: Request, res: Response) {
  const input = validarCrearMovimiento(req.body);
  const movimiento = crearMovimiento(input);
  guardarEstado();
  res.status(201).json({ success: true, data: movimiento });
}

export function getMovimientos(req: Request, res: Response) {
  const { tipo } = req.query;
  const movimientos = listarMovimientos({
    tipo: typeof tipo === "string" ? tipo : undefined,
  });
  res.json({ success: true, data: movimientos });
}

export function putMovimiento(req: Request, res: Response) {
  const input = validarCrearMovimiento(req.body);
  const movimiento = actualizarMovimiento(req.params.id, input);
  guardarEstado();
  res.json({ success: true, data: movimiento });
}

export function deleteMovimiento(req: Request, res: Response) {
  eliminarMovimiento(req.params.id);
  guardarEstado();
  res.json({ success: true, data: {} });
}
