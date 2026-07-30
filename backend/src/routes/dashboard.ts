import { Router } from "express";
import { getDashboard } from "../controllers/dashboard.js";

export const dashboardRouter = Router();

dashboardRouter.get("/dashboard", getDashboard);
