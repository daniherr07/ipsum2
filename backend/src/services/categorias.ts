import { ApiError } from "../middlewares/errorHandler.js";
import { supabase } from "../supabase.js";
import type { ActualizarCategoriaInput, CrearCategoriaInput } from "../validators/categorias.js";

export type Categoria = {
  id: string;
  nombre: string;
  aceptaOrdenCompra: boolean;
  aceptaProveedor: boolean;
  esManoObra: boolean;
  creadoEn: string;
};

type FilaCategoria = {
  id: string;
  nombre: string;
  acepta_orden_compra: boolean;
  acepta_proveedor: boolean;
  es_mano_obra: boolean;
  creado_en: string;
};

const SELECT_CATEGORIA = "id, nombre, acepta_orden_compra, acepta_proveedor, es_mano_obra, creado_en";

function aCategoria(fila: FilaCategoria): Categoria {
  return {
    id: fila.id,
    nombre: fila.nombre,
    aceptaOrdenCompra: fila.acepta_orden_compra,
    aceptaProveedor: fila.acepta_proveedor,
    esManoObra: fila.es_mano_obra,
    creadoEn: fila.creado_en,
  };
}

export async function listarCategorias(): Promise<Categoria[]> {
  const { data, error } = await supabase.from("categorias").select(SELECT_CATEGORIA).order("nombre");
  if (error) throw new ApiError(500, "DB_ERROR", error.message);
  return (data as unknown as FilaCategoria[]).map(aCategoria);
}

export async function crearCategoria(input: CrearCategoriaInput): Promise<Categoria> {
  const { data, error } = await supabase
    .from("categorias")
    .insert({
      nombre: input.nombre,
      acepta_orden_compra: input.aceptaOrdenCompra,
      acepta_proveedor: input.aceptaProveedor,
      es_mano_obra: input.esManoObra,
    })
    .select(SELECT_CATEGORIA)
    .single();
  if (error) {
    if (error.code === "23505") {
      throw new ApiError(400, "VALIDATION_ERROR", `Ya existe una categoría llamada "${input.nombre}"`);
    }
    throw new ApiError(500, "DB_ERROR", error.message);
  }
  return aCategoria(data as unknown as FilaCategoria);
}

export async function actualizarCategoria(
  id: string,
  cambios: ActualizarCategoriaInput
): Promise<Categoria> {
  const patch: Record<string, unknown> = {};
  if (cambios.nombre !== undefined) patch.nombre = cambios.nombre;
  if (cambios.aceptaOrdenCompra !== undefined) patch.acepta_orden_compra = cambios.aceptaOrdenCompra;
  if (cambios.aceptaProveedor !== undefined) patch.acepta_proveedor = cambios.aceptaProveedor;
  if (cambios.esManoObra !== undefined) patch.es_mano_obra = cambios.esManoObra;

  const { data, error } = await supabase
    .from("categorias")
    .update(patch)
    .eq("id", id)
    .select(SELECT_CATEGORIA)
    .single();
  if (error) {
    if (error.code === "PGRST116") throw new ApiError(404, "NOT_FOUND", "Categoría no encontrada");
    if (error.code === "23505") {
      throw new ApiError(400, "VALIDATION_ERROR", `Ya existe una categoría llamada "${cambios.nombre}"`);
    }
    throw new ApiError(500, "DB_ERROR", error.message);
  }
  return aCategoria(data as unknown as FilaCategoria);
}

export async function eliminarCategoria(id: string): Promise<void> {
  const { error, count } = await supabase.from("categorias").delete({ count: "exact" }).eq("id", id);
  if (error) throw new ApiError(500, "DB_ERROR", error.message);
  if (!count) throw new ApiError(404, "NOT_FOUND", "Categoría no encontrada");
}
