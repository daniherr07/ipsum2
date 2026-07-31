import { Router } from "express";
import { deleteCatalogoItem, getCatalogo, postCatalogoItem, putCatalogoItem, } from "../controllers/catalogos.js";
export const catalogosRouter = Router();
catalogosRouter.get("/catalogos/:tipo", getCatalogo);
catalogosRouter.post("/catalogos/:tipo", postCatalogoItem);
catalogosRouter.put("/catalogos/:tipo/:id", putCatalogoItem);
catalogosRouter.delete("/catalogos/:tipo/:id", deleteCatalogoItem);
