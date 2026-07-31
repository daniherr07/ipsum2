import { Router } from "express";
export const healthRouter = Router();
healthRouter.get("/health", (req, res) => {
    res.json({ success: true, data: { status: "ok" } });
});
