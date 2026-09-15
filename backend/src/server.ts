import cors from "cors";
import express from "express";
import helmet from "helmet";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";
import { healthRouter } from "./routes/health.js";
import { proyectosRouter } from "./routes/proyectos.js";
import { movimientosRouter } from "./routes/movimientos.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { catalogosRouter } from "./routes/catalogos.js";
import { bonosRouter } from "./routes/bonos.js";
import { cargarEstadoGuardado } from "./persistencia.js";
import { restaurarProyectos } from "./services/proyectos.js";
import { restaurarMovimientos } from "./services/movimientos.js";

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

app.use(notFoundHandler);
app.use(errorHandler);

const estado = cargarEstadoGuardado();
restaurarProyectos(estado.proyectos);
restaurarMovimientos(estado.movimientos);
console.log(
  `Datos cargados desde seed-data.json: ${estado.proyectos.length} proyectos, ${estado.movimientos.length} movimientos. Catalogos y bonos viven en Supabase.`
);

app.listen(PORT, () => {
  console.log(`Backend escuchando en http://localhost:${PORT}`);
});
