import { ApiError } from "../middlewares/errorHandler.js";
import { MESES } from "../utils/fechas.js";
import { listarBonos } from "../services/bonos.js";
import { listarCatalogo } from "../services/catalogos.js";
import { esMesCerrado } from "../services/proyectos.js";

const ANIO_REGEX = /^\d{4}$/;

export type EstadoProyecto = "Revisión" | "Finalizado";

export type CrearProyectoInput = {
  nombre: string;
  presupuesto: number;
  presupuestoManoObra: number;
  mesAsignacion: string;
  anioAsignacion: string;
  estado: EstadoProyecto;
  bono: string;
  subtipoBono?: string;
  contratista: string;
};

function toTrimmedString(value: unknown): string | undefined {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  return undefined;
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

/* H1: bono/subtipoBono deben existir en el catalogo de bonos.
   Ahora es async porque listarBonos consulta Supabase. */
async function validarBonoYSubtipo(
  bonoInput: string,
  subtipoInput: string | undefined
): Promise<{ bono: string; subtipoBono?: string }> {
  const bonos = await listarBonos();
  const bono = bonos.find((b) => b.nombre.toLowerCase() === bonoInput.toLowerCase());
  if (!bono) {
    throw new ApiError(400, "VALIDATION_ERROR", `El bono "${bonoInput}" no existe en el catálogo`);
  }
  if (bono.subtipos.length === 0) {
    return { bono: bono.nombre };
  }
  if (!subtipoInput) {
    throw new ApiError(400, "VALIDATION_ERROR", "Seleccione un subtipo de bono");
  }
  const subtipo = bono.subtipos.find((s) => s.nombre.toLowerCase() === subtipoInput.toLowerCase());
  if (!subtipo) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      `El subtipo "${subtipoInput}" no pertenece al bono "${bono.nombre}"`
    );
  }
  return { bono: bono.nombre, subtipoBono: subtipo.nombre };
}

/* H1: contratista debe existir en el catalogo de contratistas */
async function validarContratista(input: string): Promise<string> {
  const catalogo = await listarCatalogo("contratistas");
  const contratista = catalogo.find((c) => c.nombre.toLowerCase() === input.toLowerCase());
  if (!contratista) {
    throw new ApiError(400, "VALIDATION_ERROR", `El contratista "${input}" no existe en el catálogo`);
  }
  return contratista.nombre;
}

export async function validarCrearProyecto(body: unknown): Promise<CrearProyectoInput> {
  if (typeof body !== "object" || body === null) {
    throw new ApiError(400, "VALIDATION_ERROR", "La solicitud no es válida. Intente nuevamente.");
  }
  const data = body as Record<string, unknown>;

  const nombre = toTrimmedString(data.nombre);
  if (!nombre) {
    throw new ApiError(400, "VALIDATION_ERROR", "Agregue el nombre del proyecto");
  }

  const presupuesto = toNumber(data.presupuesto);
  if (presupuesto === undefined || presupuesto <= 0) {
    throw new ApiError(400, "VALIDATION_ERROR", "Agregue un presupuesto válido mayor a 0");
  }

  const presupuestoManoObra = toNumber(data.presupuestoManoObra);
  if (presupuestoManoObra === undefined || presupuestoManoObra <= 0) {
    throw new ApiError(400, "VALIDATION_ERROR", "Agregue un presupuesto de mano de obra válido mayor a 0");
  }
  if (presupuestoManoObra > presupuesto) {
    throw new ApiError(400, "VALIDATION_ERROR", "El presupuesto de mano de obra no puede superar el presupuesto del proyecto");
  }

  const mesAsignacion = toTrimmedString(data.mesAsignacion);
  if (!mesAsignacion || !MESES.includes(mesAsignacion)) {
    throw new ApiError(400, "VALIDATION_ERROR", "Seleccione un mes de asignación válido");
  }

  const anioAsignacion = toTrimmedString(data.anioAsignacion);
  if (!anioAsignacion || !ANIO_REGEX.test(anioAsignacion)) {
    throw new ApiError(400, "VALIDATION_ERROR", "Seleccione un año de asignación válido");
  }

  if (await esMesCerrado(mesAsignacion, anioAsignacion)) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      `El mes de ${mesAsignacion} ${anioAsignacion} está cerrado. Ábralo para agregar proyectos.`
    );
  }

  const estado = toTrimmedString(data.estado);
  if (estado !== "Revisión" && estado !== "Finalizado") {
    throw new ApiError(400, "VALIDATION_ERROR", "Seleccione un estado válido");
  }

  const bonoInput = toTrimmedString(data.bono);
  if (!bonoInput) {
    throw new ApiError(400, "VALIDATION_ERROR", "Seleccione un bono");
  }
  const { bono, subtipoBono } = await validarBonoYSubtipo(bonoInput, toTrimmedString(data.subtipoBono));

  const contratistaInput = toTrimmedString(data.contratista);
  if (!contratistaInput) {
    throw new ApiError(400, "VALIDATION_ERROR", "Seleccione un contratista");
  }
  const contratista = await validarContratista(contratistaInput);

  return { nombre, presupuesto, presupuestoManoObra, mesAsignacion, anioAsignacion, estado, bono, subtipoBono, contratista };
}

export type ActualizarProyectoInput = {
  presupuestoManoObra?: number;
  contratista?: string;
  mesAsignacion?: string;
  anioAsignacion?: string;
  estado?: EstadoProyecto;
};

export async function validarActualizarProyecto(body: unknown): Promise<ActualizarProyectoInput> {
  if (typeof body !== "object" || body === null) {
    throw new ApiError(400, "VALIDATION_ERROR", "La solicitud no es válida. Intente nuevamente.");
  }
  const data = body as Record<string, unknown>;
  const cambios: ActualizarProyectoInput = {};

  if (data.presupuestoManoObra !== undefined) {
    const valor = toNumber(data.presupuestoManoObra);
    if (valor === undefined || valor <= 0) {
      throw new ApiError(400, "VALIDATION_ERROR", "Agregue un presupuesto de mano de obra válido mayor a 0");
    }
    cambios.presupuestoManoObra = valor;
  }

  if (data.contratista !== undefined) {
    const valor = toTrimmedString(data.contratista);
    if (!valor) {
      throw new ApiError(400, "VALIDATION_ERROR", "Seleccione un contratista");
    }
    cambios.contratista = await validarContratista(valor);
  }

  if (data.mesAsignacion !== undefined) {
    const valor = toTrimmedString(data.mesAsignacion);
    if (!valor || !MESES.includes(valor)) {
      throw new ApiError(400, "VALIDATION_ERROR", "Seleccione un mes de asignación válido");
    }
    cambios.mesAsignacion = valor;
  }

  if (data.anioAsignacion !== undefined) {
    const valor = toTrimmedString(data.anioAsignacion);
    if (!valor || !ANIO_REGEX.test(valor)) {
      throw new ApiError(400, "VALIDATION_ERROR", "Seleccione un año de asignación válido");
    }
    cambios.anioAsignacion = valor;
  }

  if (data.estado !== undefined) {
    const valor = toTrimmedString(data.estado);
    if (valor !== "Revisión" && valor !== "Finalizado") {
      throw new ApiError(400, "VALIDATION_ERROR", "Seleccione un estado válido");
    }
    cambios.estado = valor;
  }

  if (Object.keys(cambios).length === 0) {
    throw new ApiError(400, "VALIDATION_ERROR", "No hay cambios para guardar");
  }

  return cambios;
}