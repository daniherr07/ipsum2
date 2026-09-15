import { readFileSync, renameSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { listarProyectos, type Proyecto } from "./services/proyectos.js";
import { listarMovimientos, type Movimiento } from "./services/movimientos.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// seed-data.json ya solo guarda proyectos y movimientos: catalogos y bonos
// ya viven en Supabase.
const RUTA_ESTADO = path.join(__dirname, "..", "seed-data.json");

type Estado = {
  proyectos: Proyecto[];
  movimientos: Movimiento[];
};

export function cargarEstadoGuardado(): Estado {
  return JSON.parse(readFileSync(RUTA_ESTADO, "utf-8")) as Estado;
}

export function guardarEstado(): void {
  const estado: Estado = {
    proyectos: listarProyectos(),
    movimientos: listarMovimientos({}),
  };
  const rutaTemporal = `${RUTA_ESTADO}.tmp`;
  writeFileSync(rutaTemporal, JSON.stringify(estado, null, 2), "utf-8");
  renameSync(rutaTemporal, RUTA_ESTADO);
}