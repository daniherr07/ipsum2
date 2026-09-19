import { Router } from "express";
import { getConciliacion } from "../controllers/conciliacion.js";

export const conciliacionRouter = Router();

conciliacionRouter.get("/conciliacion", getConciliacion);
