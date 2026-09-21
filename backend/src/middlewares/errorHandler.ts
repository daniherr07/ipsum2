import type { NextFunction, Request, Response } from "express";

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Ruta no encontrada" } });
}

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ success: false, error: { code: err.code, message: err.message } });
  }
  console.error(err);
  res.status(500).json({ success: false, error: { code: "INTERNAL_ERROR", message: "Error interno" } });
}
