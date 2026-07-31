import type { Request, Response } from "express";
import {
  actualizarItemCatalogo,
  crearItemCatalogo,
  eliminarItemCatalogo,
  listarCatalogo,
} from "../services/catalogos.js";
import { validarCrearItemCatalogo, validarTipoCatalogo } from "../validators/catalogos.js";
import { guardarEstado } from "../persistencia.js";

export function getCatalogo(req: Request, res: Response) {
  const tipo = validarTipoCatalogo(req.params.tipo);
  res.json({ success: true, data: listarCatalogo(tipo) });
}

export function postCatalogoItem(req: Request, res: Response) {
  const tipo = validarTipoCatalogo(req.params.tipo);
  const input = validarCrearItemCatalogo(req.body);
  const item = crearItemCatalogo(tipo, input.nombre);
  guardarEstado();
  res.status(201).json({ success: true, data: item });
}

export function putCatalogoItem(req: Request, res: Response) {
  const tipo = validarTipoCatalogo(req.params.tipo);
  const input = validarCrearItemCatalogo(req.body);
  const item = actualizarItemCatalogo(tipo, req.params.id, input.nombre);
  guardarEstado();
  res.json({ success: true, data: item });
}

export function deleteCatalogoItem(req: Request, res: Response) {
  const tipo = validarTipoCatalogo(req.params.tipo);
  eliminarItemCatalogo(tipo, req.params.id);
  guardarEstado();
  res.json({ success: true, data: {} });
}
