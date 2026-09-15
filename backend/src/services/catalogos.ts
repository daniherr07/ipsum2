import { ApiError } from "../middlewares/errorHandler.js";
import { supabase } from "../supabase.js";
import type { TipoCatalogo } from "../validators/catalogos.js";

export type ItemCatalogo = {
  id: string;
  nombre: string;
  creadoEn: string;
};

/* TipoCatalogo usa guiones ("ordenes-compra"), las tablas de Postgres usan
   guion bajo (convencion snake_case) */
const TABLAS: Record<TipoCatalogo, string> = {
  "ordenes-compra": "ordenes_compra",
  proveedores: "proveedores",
  contratistas: "contratistas",
};

function aItemCatalogo(fila: { id: string; nombre: string; creado_en: string }): ItemCatalogo {
  return { id: fila.id, nombre: fila.nombre, creadoEn: fila.creado_en };
}

export async function listarCatalogo(tipo: TipoCatalogo): Promise<ItemCatalogo[]> {
  const { data, error } = await supabase
    .from(TABLAS[tipo])
    .select("id, nombre, creado_en")
    .order("nombre");
  if (error) throw new ApiError(500, "DB_ERROR", error.message);
  return data.map(aItemCatalogo);
}

export async function crearItemCatalogo(tipo: TipoCatalogo, nombre: string): Promise<ItemCatalogo> {
  const { data, error } = await supabase
    .from(TABLAS[tipo])
    .insert({ nombre })
    .select("id, nombre, creado_en")
    .single();
  if (error) {
    if (error.code === "23505") {
      throw new ApiError(400, "VALIDATION_ERROR", `Ya existe un elemento llamado "${nombre}"`);
    }
    throw new ApiError(500, "DB_ERROR", error.message);
  }
  return aItemCatalogo(data);
}

export async function actualizarItemCatalogo(
  tipo: TipoCatalogo,
  id: string,
  nombre: string
): Promise<ItemCatalogo> {
  const { data, error } = await supabase
    .from(TABLAS[tipo])
    .update({ nombre })
    .eq("id", id)
    .select("id, nombre, creado_en")
    .single();
  if (error) {
    if (error.code === "PGRST116") {
      throw new ApiError(404, "NOT_FOUND", "Elemento no encontrado");
    }
    if (error.code === "23505") {
      throw new ApiError(400, "VALIDATION_ERROR", `Ya existe un elemento llamado "${nombre}"`);
    }
    throw new ApiError(500, "DB_ERROR", error.message);
  }
  return aItemCatalogo(data);
}

export async function eliminarItemCatalogo(tipo: TipoCatalogo, id: string): Promise<void> {
  const { error, count } = await supabase.from(TABLAS[tipo]).delete({ count: "exact" }).eq("id", id);
  if (error) throw new ApiError(500, "DB_ERROR", error.message);
  if (!count) throw new ApiError(404, "NOT_FOUND", "Elemento no encontrado");
}