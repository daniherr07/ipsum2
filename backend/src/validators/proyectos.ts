import { ApiError } from "../middlewares/errorHandler.js";
import { MESES } from "../utils/fechas.js";

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

export function validarCrearProyecto(body: unknown): CrearProyectoInput {
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
  /* M1: la mano de obra no puede superar el presupuesto total del proyecto */
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

  const bono = toTrimmedString(data.bono);
  if (!bono) {
    throw new ApiError(400, "VALIDATION_ERROR", "bono es obligatorio");
  }

  const subtipoBono = toTrimmedString(data.subtipoBono);
  if (!subtipoBono) {
    throw new ApiError(400, "VALIDATION_ERROR", "subtipoBono es obligatorio");
  }

  const contratista = toTrimmedString(data.contratista);
  if (!contratista) {
    throw new ApiError(400, "VALIDATION_ERROR", "contratista es obligatorio");
  }

  return { nombre, presupuesto, presupuestoManoObra, mesAsignacion, anioAsignacion, estado, bono, subtipoBono, contratista };
}

/* Esquema parcial para PUT /proyectos/:id (C7, M1, M2, M3):
   el frontend envia cualquier subconjunto de estos campos */
export type ActualizarProyectoInput = {
  presupuestoManoObra?: number;
  contratista?: string;
  mesAsignacion?: string;
  anioAsignacion?: string;
  estado?: EstadoProyecto;
};

export function validarActualizarProyecto(body: unknown): ActualizarProyectoInput {
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
    cambios.contratista = valor;
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
