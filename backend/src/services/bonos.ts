import { ApiError } from "../middlewares/errorHandler.js";
import { supabase } from "../supabase.js";

export type SubtipoBono = {
  id: string;
  nombre: string;
};

export type Bono = {
  id: string;
  nombre: string;
  subtipos: SubtipoBono[];
  creadoEn: string;
};

type FilaBono = {
  id: string;
  nombre: string;
  creado_en: string;
  subtipos_bono: { id: string; nombre: string }[];
};

function aBono(fila: FilaBono): Bono {
  return {
    id: fila.id,
    nombre: fila.nombre,
    creadoEn: fila.creado_en,
    subtipos: fila.subtipos_bono.map((s) => ({ id: s.id, nombre: s.nombre })),
  };
}

export async function listarBonos(): Promise<Bono[]> {
  const { data, error } = await supabase
    .from("bonos")
    .select("id, nombre, creado_en, subtipos_bono(id, nombre)")
    .order("nombre");
  if (error) throw new ApiError(500, "DB_ERROR", error.message);
  return (data as FilaBono[]).map(aBono);
}

export async function crearBono(nombre: string): Promise<Bono> {
  const { data, error } = await supabase
    .from("bonos")
    .insert({ nombre })
    .select("id, nombre, creado_en")
    .single();
  if (error) {
    if (error.code === "23505") {
      throw new ApiError(400, "VALIDATION_ERROR", `Ya existe un bono llamado "${nombre}"`);
    }
    throw new ApiError(500, "DB_ERROR", error.message);
  }
  return { id: data.id, nombre: data.nombre, creadoEn: data.creado_en, subtipos: [] };
}

export async function actualizarBono(id: string, nombre: string): Promise<Bono> {
  const { data, error } = await supabase
    .from("bonos")
    .update({ nombre })
    .eq("id", id)
    .select("id, nombre, creado_en, subtipos_bono(id, nombre)")
    .single();
  if (error) {
    if (error.code === "PGRST116") throw new ApiError(404, "NOT_FOUND", "Bono no encontrado");
    if (error.code === "23505") throw new ApiError(400, "VALIDATION_ERROR", `Ya existe un bono llamado "${nombre}"`);
    throw new ApiError(500, "DB_ERROR", error.message);
  }
  return aBono(data as FilaBono);
}

export async function eliminarBono(id: string): Promise<void> {
  const { error, count } = await supabase.from("bonos").delete({ count: "exact" }).eq("id", id);
  if (error) throw new ApiError(500, "DB_ERROR", error.message);
  if (!count) throw new ApiError(404, "NOT_FOUND", "Bono no encontrado");
}

export async function crearSubtipo(bonoId: string, nombre: string): Promise<SubtipoBono> {
  const { data, error } = await supabase
    .from("subtipos_bono")
    .insert({ bono_id: bonoId, nombre })
    .select("id, nombre")
    .single();
  if (error) {
    if (error.code === "23505") {
      throw new ApiError(400, "VALIDATION_ERROR", `Ya existe un subtipo llamado "${nombre}" para este bono`);
    }
    if (error.code === "23503") throw new ApiError(404, "NOT_FOUND", "Bono no encontrado");
    throw new ApiError(500, "DB_ERROR", error.message);
  }
  return { id: data.id, nombre: data.nombre };
}

export async function actualizarSubtipo(bonoId: string, subtipoId: string, nombre: string): Promise<SubtipoBono> {
  const { data, error } = await supabase
    .from("subtipos_bono")
    .update({ nombre })
    .eq("id", subtipoId)
    .eq("bono_id", bonoId)
    .select("id, nombre")
    .single();
  if (error) {
    if (error.code === "PGRST116") throw new ApiError(404, "NOT_FOUND", "Subtipo de bono no encontrado");
    if (error.code === "23505") {
      throw new ApiError(400, "VALIDATION_ERROR", `Ya existe un subtipo llamado "${nombre}" para este bono`);
    }
    throw new ApiError(500, "DB_ERROR", error.message);
  }
  return { id: data.id, nombre: data.nombre };
}

export async function eliminarSubtipo(bonoId: string, subtipoId: string): Promise<void> {
  const { error, count } = await supabase
    .from("subtipos_bono")
    .delete({ count: "exact" })
    .eq("id", subtipoId)
    .eq("bono_id", bonoId);
  if (error) throw new ApiError(500, "DB_ERROR", error.message);
  if (!count) throw new ApiError(404, "NOT_FOUND", "Subtipo de bono no encontrado");
}