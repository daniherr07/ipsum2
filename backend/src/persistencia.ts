import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { listarProyectos, type Proyecto } from "./services/proyectos.js";
import { listarMovimientos, type Movimiento } from "./services/movimientos.js";
import { obtenerTodosCatalogos, type Catalogos } from "./services/catalogos.js";
import { listarBonos, type Bono } from "./services/bonos.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// seed-data.json es la unica base de datos: arranca con los datos reales del
// Excel, y cada creacion/edicion/eliminacion se escribe ahi mismo. No hay un
// archivo aparte para "lo nuevo" - todo vive en el mismo lugar.
const RUTA_ESTADO = path.join(__dirname, "..", "seed-data.json");

type Estado = {
  proyectos: Proyecto[];
  movimientos: Movimiento[];
  catalogos?: Partial<Catalogos>;
  bonos?: Bono[];
};

export function cargarEstadoGuardado(): Estado {
  return JSON.parse(readFileSync(RUTA_ESTADO, "utf-8")) as Estado;
}

// Se llama despues de cada creacion/edicion/eliminacion para que sobreviva a un
// reinicio del servidor (no hay base de datos real todavia, ver README/CLAUDE.md).
export function guardarEstado(): void {
  const estado: Estado = {
    proyectos: listarProyectos(),
    movimientos: listarMovimientos({}),
    catalogos: obtenerTodosCatalogos(),
    bonos: listarBonos(),
  };
  writeFileSync(RUTA_ESTADO, JSON.stringify(estado, null, 2), "utf-8");
}
