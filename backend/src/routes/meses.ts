import { Router } from "express";
import { putEstadoMes } from "../controllers/meses.js";

export const mesesRouter = Router();

mesesRouter.put("/meses/:mes/:anio/estado", putEstadoMes);
