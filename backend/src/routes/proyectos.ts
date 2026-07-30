import { Router } from "express";
import { getProyecto, getProyectos, postProyecto } from "../controllers/proyectos.js";

export const proyectosRouter = Router();

proyectosRouter.get("/proyectos", getProyectos);
proyectosRouter.post("/proyectos", postProyecto);
proyectosRouter.get("/proyectos/:id", getProyecto);
