import type { NextFunction, Request, Response } from "express";

/* Envuelve un controller async para que cualquier error (un throw dentro de
   un await) llegue al errorHandler de Express en vez de quedar como una
   promesa rechazada sin manejar. Necesario desde que los services empiezan
   a hablar con Supabase (antes todo era sincrono y Express lo atrapaba solo). */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}