import cors from "cors";
import express from "express";
import helmetImport from "helmet";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";
import { healthRouter } from "./routes/health.js";
import { proyectosRouter } from "./routes/proyectos.js";
import { movimientosRouter } from "./routes/movimientos.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { catalogosRouter } from "./routes/catalogos.js";
import { bonosRouter } from "./routes/bonos.js";
import { conciliacionRouter } from "./routes/conciliacion.js";

// En el build de Vercel el import por defecto de helmet llega tipado como namespace (TS2349); se soportan ambas formas.
const helmet = ((helmetImport as unknown as { default?: typeof helmetImport }).default ?? helmetImport) as typeof helmetImport;

const app = express();
const PORT = process.env.PORT ?? 4000;

const origenesPermitidos = (process.env.FRONTEND_ORIGIN ?? "http://localhost:3000")
  .split(",")
  .map((origen) => origen.trim())
  .filter(Boolean);

app.use(helmet());
app.use(cors({ origin: origenesPermitidos }));
app.use(express.json({ limit: "1mb" }));

app.use(healthRouter);
app.use(proyectosRouter);
app.use(movimientosRouter);
app.use(dashboardRouter);
app.use(catalogosRouter);
app.use(bonosRouter);
app.use(conciliacionRouter);

app.use(notFoundHandler);
app.use(errorHandler);

console.log("Catalogos, bonos, proyectos y movimientos viven en Supabase (sin datos locales).");

app.listen(PORT, () => {
  console.log(`Backend escuchando en http://localhost:${PORT}`);
});
