import { ApiError } from "../middlewares/errorHandler.js";

export type CrearCategoriaInput = {
  nombre: string;
  aceptaOrdenCompra: boolean;
  aceptaProveedor: boolean;
  esManoObra: boolean;
};

export type ActualizarCategoriaInput = {
  nombre?: string;
  aceptaOrdenCompra?: boolean;
  aceptaProveedor?: boolean;
  esManoObra?: boolean;
};

function validarNombre(data: Record<string, unknown>): string {
  const nombre = typeof data.nombre === "string" ? data.nombre.trim() : "";
  if (!nombre) {
    throw new ApiError(400, "VALIDATION_ERROR", "El nombre es obligatorio");
  }
  return nombre;
}

function validarBooleano(valor: unknown, campo: string, porDefecto: boolean): boolean {
  if (valor === undefined) return porDefecto;
  if (typeof valor !== "boolean") {
    throw new ApiError(400, "VALIDATION_ERROR", `${campo} debe ser verdadero o falso`);
  }
  return valor;
}

export function validarCrearCategoria(body: unknown): CrearCategoriaInput {
  if (typeof body !== "object" || body === null) {
    throw new ApiError(400, "VALIDATION_ERROR", "El cuerpo de la solicitud es invalido");
  }
  const data = body as Record<string, unknown>;
  return {
    nombre: validarNombre(data),
    aceptaOrdenCompra: validarBooleano(data.aceptaOrdenCompra, "aceptaOrdenCompra", false),
    aceptaProveedor: validarBooleano(data.aceptaProveedor, "aceptaProveedor", true),
    esManoObra: validarBooleano(data.esManoObra, "esManoObra", false),
  };
}

export function validarActualizarCategoria(body: unknown): ActualizarCategoriaInput {
  if (typeof body !== "object" || body === null) {
    throw new ApiError(400, "VALIDATION_ERROR", "El cuerpo de la solicitud es invalido");
  }
  const data = body as Record<string, unknown>;
  const cambios: ActualizarCategoriaInput = {};
  if (data.nombre !== undefined) cambios.nombre = validarNombre(data);
  if (data.aceptaOrdenCompra !== undefined) {
    cambios.aceptaOrdenCompra = validarBooleano(data.aceptaOrdenCompra, "aceptaOrdenCompra", false);
  }
  if (data.aceptaProveedor !== undefined) {
    cambios.aceptaProveedor = validarBooleano(data.aceptaProveedor, "aceptaProveedor", true);
  }
  if (data.esManoObra !== undefined) {
    cambios.esManoObra = validarBooleano(data.esManoObra, "esManoObra", false);
  }
  if (Object.keys(cambios).length === 0) {
    throw new ApiError(400, "VALIDATION_ERROR", "No hay cambios para actualizar");
  }
  return cambios;
}
