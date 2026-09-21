import { ApiError } from "../middlewares/errorHandler.js";
import {
  esMesCerrado,
  existeProyecto,
  obtenerMesAnioProyecto,
} from "../services/proyectos.js";
import { listarCatalogo } from "../services/catalogos.js";
import { MESES } from "../utils/fechas.js";

const ANIO_REGEX = /^\d{4}$/;
const FECHA_PAGO_REGEX = /^\d{2}\/\d{2}\/\d{4}$/;

export const OPCIONES_CATEGORIA = [
  "Mano de Obra",
  "Materiales",
  "Equipamiento",
  "Servicios",
  "Otros",
] as const;

/* La orden de compra solo tiene sentido para estas categorias */
export const CATEGORIAS_CON_ORDEN_COMPRA = ["Materiales", "Equipamiento"];

/* La categoria que no admite proveedor */
const CATEGORIA_SIN_PROVEEDOR = "Servicios";

/* Rechaza movimientos cuyo mes de negocio ya esta cerrado (todos los
   proyectos del mes estan Finalizados). */
async function validarMesAbiertoDeProyecto(proyectoId: string): Promise<void> {
  const mesAnio = await obtenerMesAnioProyecto(proyectoId);
  if (!mesAnio) return;
  if (await esMesCerrado(mesAnio.mes, mesAnio.anio)) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      `El mes de ${mesAnio.mes} ${mesAnio.anio} está cerrado. Ábralo para agregar movimientos.`
    );
  }
}

export type TipoMovimiento = "ingreso" | "egreso";
export type TipoEgreso = "egreso-general" | "egreso-administrativo";

export type CrearMovimientoInput =
  | {
      tipo: "ingreso";
      proyectoId: string;
      monto: number;
      nombreIngreso: string;
      fechaPago: string;
      descripcion: string;
    }
  | {
      tipo: "egreso";
      tipoEgreso: "egreso-general";
      proyectoId: string;
      monto: number;
      categoria: string;
      ordenCompra?: string;
      proveedor?: string;
      descripcion: string;
    }
  | {
      tipo: "egreso";
      tipoEgreso: "egreso-administrativo";
      monto: number;
      mes: string;
      ano: string;
      descripcion: string;
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

export async function validarCrearMovimiento(body: unknown): Promise<CrearMovimientoInput> {
  if (typeof body !== "object" || body === null) {
    throw new ApiError(400, "VALIDATION_ERROR", "La solicitud no es válida. Intente nuevamente.");
  }
  const data = body as Record<string, unknown>;

  const monto = toNumber(data.monto);
  if (monto === undefined || monto <= 0 || !Number.isInteger(monto)) {
    throw new ApiError(400, "VALIDATION_ERROR", "Agregue un monto válido mayor a 0");
  }

  const descripcion = toTrimmedString(data.descripcion);
  if (!descripcion) {
    throw new ApiError(400, "VALIDATION_ERROR", "Agregue una descripción");
  }

  if (data.tipo === "ingreso") {
    const proyectoId = toTrimmedString(data.proyectoId);
    if (!proyectoId || !(await existeProyecto(proyectoId))) {
      throw new ApiError(400, "VALIDATION_ERROR", "Seleccione un proyecto válido");
    }
    await validarMesAbiertoDeProyecto(proyectoId);
    const nombreIngreso = toTrimmedString(data.nombreIngreso);
    if (!nombreIngreso) {
      throw new ApiError(400, "VALIDATION_ERROR", "Agregue el nombre del ingreso");
    }
    const fechaPago = toTrimmedString(data.fechaPago);
    if (!fechaPago || !FECHA_PAGO_REGEX.test(fechaPago)) {
      throw new ApiError(400, "VALIDATION_ERROR", "Agregue la fecha de pago en formato dd/mm/aaaa");
    }
    return { tipo: "ingreso", proyectoId, monto, nombreIngreso, fechaPago, descripcion };
  }

  if (data.tipo === "egreso") {
    if (data.tipoEgreso === "egreso-general") {
      const proyectoId = toTrimmedString(data.proyectoId);
      if (!proyectoId || !(await existeProyecto(proyectoId))) {
        throw new ApiError(400, "VALIDATION_ERROR", "Seleccione un proyecto válido");
      }
      await validarMesAbiertoDeProyecto(proyectoId);
      const categoria = toTrimmedString(data.categoria);
      if (!categoria || !OPCIONES_CATEGORIA.includes(categoria as (typeof OPCIONES_CATEGORIA)[number])) {
        throw new ApiError(
          400,
          "VALIDATION_ERROR",
          `Seleccione una categoría válida: ${OPCIONES_CATEGORIA.join(", ")}`
        );
      }
      const ordenCompraInput = toTrimmedString(data.ordenCompra);
      let ordenCompra: string | undefined;
      if (ordenCompraInput) {
        if (!CATEGORIAS_CON_ORDEN_COMPRA.includes(categoria)) {
          throw new ApiError(
            400,
            "VALIDATION_ERROR",
            "La orden de compra solo aplica para Materiales o Equipamiento"
          );
        }
        const catalogo = await listarCatalogo("ordenes-compra");
        const encontrada = catalogo.find(
          (o) => o.nombre.toLowerCase() === ordenCompraInput.toLowerCase()
        );
        if (!encontrada) {
          throw new ApiError(
            400,
            "VALIDATION_ERROR",
            `La orden de compra "${ordenCompraInput}" no existe en el catálogo`
          );
        }
        ordenCompra = encontrada.nombre;
      }

      const proveedorInput = toTrimmedString(data.proveedor);
      let proveedor: string | undefined;
      if (proveedorInput) {
        if (categoria === CATEGORIA_SIN_PROVEEDOR) {
          throw new ApiError(
            400,
            "VALIDATION_ERROR",
            "El proveedor no aplica para la categoría Servicios"
          );
        }
        const catalogo = await listarCatalogo("proveedores");
        const encontrado = catalogo.find(
          (p) => p.nombre.toLowerCase() === proveedorInput.toLowerCase()
        );
        if (!encontrado) {
          throw new ApiError(
            400,
            "VALIDATION_ERROR",
            `El proveedor "${proveedorInput}" no existe en el catálogo`
          );
        }
        proveedor = encontrado.nombre;
      }

      return { tipo: "egreso", tipoEgreso: "egreso-general", proyectoId, monto, categoria, ordenCompra, proveedor, descripcion };
    }

    if (data.tipoEgreso === "egreso-administrativo") {
      const mes = toTrimmedString(data.mes);
      if (!mes || !MESES.includes(mes)) {
        throw new ApiError(400, "VALIDATION_ERROR", "Seleccione un mes válido");
      }
      const ano = toTrimmedString(data.ano);
      if (!ano || !ANIO_REGEX.test(ano)) {
        throw new ApiError(400, "VALIDATION_ERROR", "Seleccione un año válido");
      }
      if (await esMesCerrado(mes, ano)) {
        throw new ApiError(
          400,
          "VALIDATION_ERROR",
          `El mes de ${mes} ${ano} está cerrado. Ábralo para agregar movimientos.`
        );
      }
      return { tipo: "egreso", tipoEgreso: "egreso-administrativo", monto, mes, ano, descripcion };
    }

    throw new ApiError(400, "VALIDATION_ERROR", "Seleccione un tipo de egreso válido");
  }

  throw new ApiError(400, "VALIDATION_ERROR", "Seleccione un tipo de movimiento válido");
}