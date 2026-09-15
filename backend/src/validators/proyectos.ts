import { ApiError } from "../middlewares/errorHandler.js";
import { MESES } from "../utils/fechas.js";
import { listarBonos } from "../services/bonos.js";
import { listarCatalogo } from "../services/catalogos.js";

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
    throw new ApiError(400, "VALIDATION_ERROR", `bono "${bonoInput}" no existe en el catalogo de bonos`);
  }
  if (bono.subtipos.length === 0) {
    return { bono: bono.nombre };
  }
  if (!subtipoInput) {
    throw new ApiError(400, "VALIDATION_ERROR", "subtipoBono es obligatorio para este bono");
  }
  const subtipo = bono.subtipos.find((s) => s.nombre.toLowerCase() === subtipoInput.toLowerCase());
  if (!subtipo) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      `subtipoBono "${subtipoInput}" no pertenece al bono "${bono.nombre}"`
    );
  }
  return { bono: bono.nombre, subtipoBono: subtipo.nombre };
}

/* H1: contratista debe existir en el catalogo de contratistas */
async function validarContratista(input: string): Promise<string> {
  const catalogo = await listarCatalogo("contratistas");
  const contratista = catalogo.find((c) => c.nombre.toLowerCase() === input.toLowerCase());
  if (!contratista) {
    throw new ApiError(400, "VALIDATION_ERROR", `contratista "${input}" no existe en el catalogo de contratistas`);
  }
  return contratista.nombre;
}

export async function validarCrearProyecto(body: unknown): Promise<CrearProyectoInput> {
  if (typeof body !== "object" || body === null) {
    throw new ApiError(400, "VALIDATION_ERROR", "El cuerpo de la solicitud es invalido");
  }
  const data = body as Record<string, unknown>;

  const nombre = toTrimmedString(data.nombre);
  if (!nombre) {
    throw new ApiError(400, "VALIDATION_ERROR", "nombre es obligatorio");
  }

  const presupuesto = toNumber(data.presupuesto);
  if (presupuesto === undefined || presupuesto <= 0) {
    throw new ApiError(400, "VALIDATION_ERROR", "presupuesto debe ser un numero mayor a 0");
  }

  const presupuestoManoObra = toNumber(data.presupuestoManoObra);
  if (presupuestoManoObra === undefined || presupuestoManoObra <= 0) {
    throw new ApiError(400, "VALIDATION_ERROR", "presupuestoManoObra debe ser un numero mayor a 0");
  }
  if (presupuestoManoObra > presupuesto) {
    throw new ApiError(400, "VALIDATION_ERROR", "presupuestoManoObra no puede superar el presupuesto del proyecto");
  }

  const mesAsignacion = toTrimmedString(data.mesAsignacion);
  if (!mesAsignacion || !MESES.includes(mesAsignacion)) {
    throw new ApiError(400, "VALIDATION_ERROR", "mesAsignacion debe ser un mes valido");
  }

  const anioAsignacion = toTrimmedString(data.anioAsignacion);
  if (!anioAsignacion || !ANIO_REGEX.test(anioAsignacion)) {
    throw new ApiError(400, "VALIDATION_ERROR", "anioAsignacion debe ser un anio de 4 digitos");
  }

  const estado = toTrimmedString(data.estado);
  if (estado !== "Revisión" && estado !== "Finalizado") {
    throw new ApiError(400, "VALIDATION_ERROR", "estado debe ser 'Revisión' o 'Finalizado'");
  }

  const bonoInput = toTrimmedString(data.bono);
  if (!bonoInput) {
    throw new ApiError(400, "VALIDATION_ERROR", "bono es obligatorio");
  }
  const { bono, subtipoBono } = await validarBonoYSubtipo(bonoInput, toTrimmedString(data.subtipoBono));

  const contratistaInput = toTrimmedString(data.contratista);
  if (!contratistaInput) {
    throw new ApiError(400, "VALIDATION_ERROR", "contratista es obligatorio");
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
    throw new ApiError(400, "VALIDATION_ERROR", "El cuerpo de la solicitud es invalido");
  }
  const data = body as Record<string, unknown>;
  const cambios: ActualizarProyectoInput = {};

  if (data.presupuestoManoObra !== undefined) {
    const valor = toNumber(data.presupuestoManoObra);
    if (valor === undefined || valor <= 0) {
      throw new ApiError(400, "VALIDATION_ERROR", "presupuestoManoObra debe ser un numero mayor a 0");
    }
    cambios.presupuestoManoObra = valor;
  }

  if (data.contratista !== undefined) {
    const valor = toTrimmedString(data.contratista);
    if (!valor) {
      throw new ApiError(400, "VALIDATION_ERROR", "contratista no puede estar vacio");
    }
    cambios.contratista = await validarContratista(valor);
  }

  if (data.mesAsignacion !== undefined) {
    const valor = toTrimmedString(data.mesAsignacion);
    if (!valor || !MESES.includes(valor)) {
      throw new ApiError(400, "VALIDATION_ERROR", "mesAsignacion debe ser un mes valido");
    }
    cambios.mesAsignacion = valor;
  }

  if (data.anioAsignacion !== undefined) {
    const valor = toTrimmedString(data.anioAsignacion);
    if (!valor || !ANIO_REGEX.test(valor)) {
      throw new ApiError(400, "VALIDATION_ERROR", "anioAsignacion debe ser un anio de 4 digitos");
    }
    cambios.anioAsignacion = valor;
  }

  if (data.estado !== undefined) {
    const valor = toTrimmedString(data.estado);
    if (valor !== "Revisión" && valor !== "Finalizado") {
      throw new ApiError(400, "VALIDATION_ERROR", "estado debe ser 'Revisión' o 'Finalizado'");
    }
    cambios.estado = valor;
  }

  if (Object.keys(cambios).length === 0) {
    throw new ApiError(400, "VALIDATION_ERROR", "Debe enviar al menos un campo para actualizar");
  }

  return cambios;
}