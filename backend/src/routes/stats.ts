import { Router } from "express";
import { getStats } from "../controllers/stats.js";

export const statsRouter = Router();

statsRouter.get("/stats", getStats);
