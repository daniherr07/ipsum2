import { ApiError } from "../middlewares/errorHandler.js";
import { supabase } from "../supabase.js";
import { MESES, mesAnioDe, mesAnioDeFechaPago } from "../utils/fechas.js";
import type { CrearMovimientoInput } from "../validators/movimientos.js";

export type Movimiento = CrearMovimientoInput & {
  id: string;
  creadoEn: string;
};

/* H3: mes/anio de negocio de un movimiento, no la fecha en que se inserto. */
export function mesAnioDeMovimiento(m: Movimiento): { mes: string; anio: string } {
  if (m.tipo === "ingreso") return mesAnioDeFechaPago(m.fechaPago);
  if (m.tipo === "egreso" && m.tipoEgreso === "egreso-administrativo") {
    return { mes: m.mes, anio: m.ano };
  }
  return mesAnioDe(m.creadoEn);
}

const SELECT_MOVIMIENTO = `
  id, tipo, tipo_egreso, proyecto_id, monto, descripcion,
  nombre_ingreso, fecha_pago,
  categoria, ordenes_compra ( nombre ),
  mes_admin, anio_admin,
  creado_en
`;

type FilaMovimiento = {
  id: string;
  tipo: "ingreso" | "egreso";
  tipo_egreso: "egreso-general" | "egreso-administrativo" | null;
  proyecto_id: string | null;
  monto: string;
  descripcion: string;
  nombre_ingreso: string | null;
  fecha_pago: string | null;
  categoria: string | null;
  ordenes_compra: { nombre: string } | null;
  mes_admin: number | null;
  anio_admin: number | null;
  creado_en: string;
};

function mesANumero(mes: string): number {
  return MESES.indexOf(mes) + 1;
}

/* fecha_pago en la base es tipo "date" (aaaa-mm-dd); la app usa dd/mm/aaaa
   (ver FECHA_PAGO_REGEX en validators/movimientos.ts) */
function fechaIsoADdMmAaaa(fecha: string): string {
  const [aaaa, mm, dd] = fecha.split("-");
  return `${dd}/${mm}/${aaaa}`;
}

function fechaDdMmAaaaAIso(fecha: string): string {
  const [dd, mm, aaaa] = fecha.split("/");
  return `${aaaa}-${mm}-${dd}`;
}

function aMovimiento(fila: FilaMovimiento): Movimiento {
  const base = {
    id: fila.id,
    creadoEn: fila.creado_en,
    monto: Number(fila.monto),
    descripcion: fila.descripcion,
  };
  if (fila.tipo === "ingreso") {
    return {
      ...base,
      tipo: "ingreso",
      proyectoId: fila.proyecto_id!,
      nombreIngreso: fila.nombre_ingreso!,
      fechaPago: fechaIsoADdMmAaaa(fila.fecha_pago!),
    };
  }
  if (fila.tipo_egreso === "egreso-general") {
    return {
      ...base,
      tipo: "egreso",
      tipoEgreso: "egreso-general",
      proyectoId: fila.proyecto_id!,
      categoria: fila.categoria!,
      ordenCompra: fila.ordenes_compra?.nombre,
    };
  }
  return {
    ...base,
    tipo: "egreso",
    tipoEgreso: "egreso-administrativo",
    mes: MESES[fila.mes_admin! - 1],
    ano: String(fila.anio_admin),
  };
}

async function resolverOrdenCompraId(nombre: string): Promise<string | null> {
  const { data, error } = await supabase.from("ordenes_compra").select("id").eq("nombre", nombre).maybeSingle();
  if (error) throw new ApiError(500, "DB_ERROR", error.message);
  return data?.id ?? null;
}

/* Construye el payload completo, poniendo explicitamente en null los campos
   que no aplican al tipo elegido - la restriccion CHECK de la tabla exige
   que esos campos esten vacios segun la forma exacta del movimiento. */
async function construirPayload(input: CrearMovimientoInput): Promise<Record<string, unknown>> {
  const payload: Record<string, unknown> = {
    tipo: input.tipo,
    tipo_egreso: null,
    proyecto_id: null,
    monto: input.monto,
    descripcion: input.descripcion,
    nombre_ingreso: null,
    fecha_pago: null,
    categoria: null,
    orden_compra_id: null,
    mes_admin: null,
    anio_admin: null,
  };

  if (input.tipo === "ingreso") {
    payload.proyecto_id = input.proyectoId;
    payload.nombre_ingreso = input.nombreIngreso;
    payload.fecha_pago = fechaDdMmAaaaAIso(input.fechaPago);
  } else if (input.tipoEgreso === "egreso-general") {
    payload.tipo_egreso = "egreso-general";
    payload.proyecto_id = input.proyectoId;
    payload.categoria = input.categoria;
    payload.orden_compra_id = input.ordenCompra ? await resolverOrdenCompraId(input.ordenCompra) : null;
  } else {
    payload.tipo_egreso = "egreso-administrativo";
    payload.mes_admin = mesANumero(input.mes);
    payload.anio_admin = Number(input.ano);
  }

  return payload;
}

export async function crearMovimiento(input: CrearMovimientoInput): Promise<Movimiento> {
  const payload = await construirPayload(input);
  const { data, error } = await supabase.from("movimientos").insert(payload).select(SELECT_MOVIMIENTO).single();
  if (error) throw new ApiError(500, "DB_ERROR", error.message);
  return aMovimiento(data as unknown as FilaMovimiento);
}

export async function listarMovimientos(filtros: { tipo?: string; proyectoId?: string }): Promise<Movimiento[]> {
  let query = supabase.from("movimientos").select(SELECT_MOVIMIENTO).order("creado_en");
  if (filtros.tipo) query = query.eq("tipo", filtros.tipo);
  if (filtros.proyectoId) query = query.eq("proyecto_id", filtros.proyectoId);
  const { data, error } = await query;
  if (error) throw new ApiError(500, "DB_ERROR", error.message);
  return (data as unknown as FilaMovimiento[]).map(aMovimiento);
}

export async function obtenerMovimiento(id: string): Promise<Movimiento> {
  const { data, error } = await supabase.from("movimientos").select(SELECT_MOVIMIENTO).eq("id", id).maybeSingle();
  if (error) throw new ApiError(500, "DB_ERROR", error.message);
  if (!data) throw new ApiError(404, "NOT_FOUND", "Movimiento no encontrado");
  return aMovimiento(data as unknown as FilaMovimiento);
}

export async function actualizarMovimiento(id: string, input: CrearMovimientoInput): Promise<Movimiento> {
  const payload = await construirPayload(input);
  const { data, error } = await supabase
    .from("movimientos")
    .update(payload)
    .eq("id", id)
    .select(SELECT_MOVIMIENTO)
    .single();
  if (error) {
    if (error.code === "PGRST116") throw new ApiError(404, "NOT_FOUND", "Movimiento no encontrado");
    throw new ApiError(500, "DB_ERROR", error.message);
  }
  return aMovimiento(data as unknown as FilaMovimiento);
}

export async function eliminarMovimiento(id: string): Promise<void> {
  const { error, count } = await supabase.from("movimientos").delete({ count: "exact" }).eq("id", id);
  if (error) throw new ApiError(500, "DB_ERROR", error.message);
  if (!count) throw new ApiError(404, "NOT_FOUND", "Movimiento no encontrado");
}
