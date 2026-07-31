import { Router } from "express";
import { deleteMovimiento, getMovimientos, postMovimiento, putMovimiento, } from "../controllers/movimientos.js";
export const movimientosRouter = Router();
movimientosRouter.get("/movimientos", getMovimientos);
movimientosRouter.post("/movimientos", postMovimiento);
movimientosRouter.put("/movimientos/:id", putMovimiento);
movimientosRouter.delete("/movimientos/:id", deleteMovimiento);
