import { ApiError } from "../middlewares/errorHandler.js";
import { MESES } from "../utils/fechas.js";

const ANIO_REGEX = /^\d{4}$/;

export type EstadoProyecto = "Revisión" | "Finalizado";

export type CrearProyectoInput = {
  nombre: string;
  presupuesto: number;
  presupuestoManoObra: number;
  contratista: string;
  mesAsignacion: string;
  anioAsignacion: string;
  estado: EstadoProyecto;
  bono: string;
  subtipoBono?: string;
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
  if (presupuestoManoObra > presupuesto) {
    throw new ApiError(400, "VALIDATION_ERROR", "presupuestoManoObra no puede ser mayor al presupuesto");
  }

  const contratista = toTrimmedString(data.contratista);
  if (!contratista) {
    throw new ApiError(400, "VALIDATION_ERROR", "contratista es obligatorio");
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

  // subtipoBono es opcional: hay bonos reales sin subtipos (ej. RAMT)
  const subtipoBono = toTrimmedString(data.subtipoBono);

  return {
    nombre,
    presupuesto,
    presupuestoManoObra,
    contratista,
    mesAsignacion,
    anioAsignacion,
    estado,
    bono,
    subtipoBono,
  };
}

// Esquema parcial para PUT /proyectos/:id — solo valida los campos que vengan.
// La regla "presupuestoManoObra <= presupuesto" se revisa en el service/controller,
// porque ahi es donde ya se tiene el presupuesto actual del proyecto.
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
    const presupuestoManoObra = toNumber(data.presupuestoManoObra);
    if (presupuestoManoObra === undefined || presupuestoManoObra <= 0) {
      throw new ApiError(400, "VALIDATION_ERROR", "presupuestoManoObra debe ser un numero mayor a 0");
    }
    cambios.presupuestoManoObra = presupuestoManoObra;
  }

  if (data.contratista !== undefined) {
    const contratista = toTrimmedString(data.contratista);
    if (!contratista) {
      throw new ApiError(400, "VALIDATION_ERROR", "contratista no puede quedar vacio");
    }
    cambios.contratista = contratista;
  }

  if (data.mesAsignacion !== undefined) {
    const mesAsignacion = toTrimmedString(data.mesAsignacion);
    if (!mesAsignacion || !MESES.includes(mesAsignacion)) {
      throw new ApiError(400, "VALIDATION_ERROR", "mesAsignacion debe ser un mes valido");
    }
    cambios.mesAsignacion = mesAsignacion;
  }

  if (data.anioAsignacion !== undefined) {
    const anioAsignacion = toTrimmedString(data.anioAsignacion);
    if (!anioAsignacion || !ANIO_REGEX.test(anioAsignacion)) {
      throw new ApiError(400, "VALIDATION_ERROR", "anioAsignacion debe ser un anio de 4 digitos");
    }
    cambios.anioAsignacion = anioAsignacion;
  }

  if (data.estado !== undefined) {
    const estado = toTrimmedString(data.estado);
    if (estado !== "Revisión" && estado !== "Finalizado") {
      throw new ApiError(400, "VALIDATION_ERROR", "estado debe ser 'Revisión' o 'Finalizado'");
    }
    cambios.estado = estado;
  }

  if (Object.keys(cambios).length === 0) {
    throw new ApiError(400, "VALIDATION_ERROR", "debe enviar al menos un campo para actualizar");
  }

  return cambios;
}
