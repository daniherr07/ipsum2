import { Router } from "express";
import {
  deleteCategoria,
  getCategorias,
  postCategoria,
  putCategoria,
} from "../controllers/categorias.js";

export const categoriasRouter = Router();

categoriasRouter.get("/categorias", getCategorias);
categoriasRouter.post("/categorias", postCategoria);
categoriasRouter.put("/categorias/:id", putCategoria);
categoriasRouter.delete("/categorias/:id", deleteCategoria);
