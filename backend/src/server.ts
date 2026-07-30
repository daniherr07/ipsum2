import cors from "cors";
import express from "express";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";
import { healthRouter } from "./routes/health.js";
import { proyectosRouter } from "./routes/proyectos.js";
import { movimientosRouter } from "./routes/movimientos.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { statsRouter } from "./routes/stats.js";
import { cargarEstadoGuardado } from "./persistencia.js";
import { restaurarProyectos } from "./services/proyectos.js";
import { restaurarMovimientos } from "./services/movimientos.js";

const app = express();
const PORT = process.env.PORT ?? 4000;

app.use(cors());
app.use(express.json());

app.use(healthRouter);
app.use(proyectosRouter);
app.use(movimientosRouter);
app.use(dashboardRouter);
app.use(statsRouter);

app.use(notFoundHandler);
app.use(errorHandler);

const estado = cargarEstadoGuardado();
restaurarProyectos(estado.proyectos);
restaurarMovimientos(estado.movimientos);
console.log(
  `Datos cargados desde seed-data.json: ${estado.proyectos.length} proyectos, ${estado.movimientos.length} movimientos.`
);

app.listen(PORT, () => {
  console.log(`Backend escuchando en http://localhost:${PORT}`);
});

