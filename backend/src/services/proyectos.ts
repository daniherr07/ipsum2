import { ApiError } from "../middlewares/errorHandler.js";
import { supabase } from "../supabase.js";
import { MESES } from "../utils/fechas.js";
import type { ActualizarProyectoInput, CrearProyectoInput, EstadoProyecto } from "../validators/proyectos.js";
import { listarMovimientos } from "./movimientos.js";

export type Proyecto = CrearProyectoInput & {
  id: string;
  creadoEn: string;
};

/* Campos derivados: se calculan desde los movimientos, no se almacenan */
export type ProyectoEnriquecido = Proyecto & {
  gastadoManoObra: number;
  totalIngresos: number;
  totalEgresos: number;
  ganancia: number;
};

/* subtipos_bono se referencia con el nombre exacto de la FK simple
   (proyectos_subtipo_bono_id_fkey) porque tambien existe la restriccion
   compuesta proyectos_subtipo_pertenece_a_bono entre las mismas tablas -
   sin el nombre explicito, PostgREST no sabe cual de las dos usar. */
const SELECT_PROYECTO = `
  id, nombre, presupuesto, presupuesto_mano_obra, anio_asignacion, mes_asignacion, estado, creado_en,
  contratistas ( nombre ),
  bonos ( nombre ),
  subtipos_bono!proyectos_subtipo_bono_id_fkey ( nombre )
`;

type FilaProyecto = {
  id: string;
  nombre: string;
  presupuesto: string;
  presupuesto_mano_obra: string;
  anio_asignacion: number;
  mes_asignacion: number;
  estado: EstadoProyecto;
  creado_en: string;
  contratistas: { nombre: string } | null;
  bonos: { nombre: string };
  subtipos_bono: { nombre: string } | null;
};

function mesANumero(mes: string): number {
  return MESES.indexOf(mes) + 1;
}

function aProyecto(fila: FilaProyecto): Proyecto {
  return {
    id: fila.id,
    nombre: fila.nombre,
    presupuesto: Number(fila.presupuesto),
    presupuestoManoObra: Number(fila.presupuesto_mano_obra),
    mesAsignacion: MESES[fila.mes_asignacion - 1],
    anioAsignacion: String(fila.anio_asignacion),
    estado: fila.estado,
    bono: fila.bonos.nombre,
    subtipoBono: fila.subtipos_bono?.nombre,
    contratista: fila.contratistas?.nombre ?? "-",
    creadoEn: fila.creado_en,
  };
}

/* Resuelve nombre -> id contra los catalogos reales. Los validators ya
   confirmaron que el nombre existe (H1); esto solo traduce a la FK. */
async function resolverContratistaId(nombre: string): Promise<string | null> {
  const { data, error } = await supabase.from("contratistas").select("id").eq("nombre", nombre).maybeSingle();
  if (error) throw new ApiError(500, "DB_ERROR", error.message);
  return data?.id ?? null;
}

async function resolverBonoId(nombre: string): Promise<string> {
  const { data, error } = await supabase.from("bonos").select("id").eq("nombre", nombre).maybeSingle();
  if (error) throw new ApiError(500, "DB_ERROR", error.message);
  if (!data) throw new ApiError(400, "VALIDATION_ERROR", `bono "${nombre}" no existe`);
  return data.id;
}

async function resolverSubtipoBonoId(bonoId: string, nombre: string): Promise<string> {
  const { data, error } = await supabase
    .from("subtipos_bono")
    .select("id")
    .eq("bono_id", bonoId)
    .eq("nombre", nombre)
    .maybeSingle();
  if (error) throw new ApiError(500, "DB_ERROR", error.message);
  if (!data) throw new ApiError(400, "VALIDATION_ERROR", `subtipoBono "${nombre}" no existe para este bono`);
  return data.id;
}

export async function crearProyecto(input: CrearProyectoInput): Promise<Proyecto> {
  const bonoId = await resolverBonoId(input.bono);
  const subtipoBonoId = input.subtipoBono ? await resolverSubtipoBonoId(bonoId, input.subtipoBono) : null;
  const contratistaId = await resolverContratistaId(input.contratista);

  const { data, error } = await supabase
    .from("proyectos")
    .insert({
      nombre: input.nombre,
      presupuesto: input.presupuesto,
      presupuesto_mano_obra: input.presupuestoManoObra,
      contratista_id: contratistaId,
      anio_asignacion: Number(input.anioAsignacion),
      mes_asignacion: mesANumero(input.mesAsignacion),
      estado: input.estado,
      bono_id: bonoId,
      subtipo_bono_id: subtipoBonoId,
    })
    .select(SELECT_PROYECTO)
    .single();
  if (error) throw new ApiError(500, "DB_ERROR", error.message);
  return aProyecto(data as unknown as FilaProyecto);
}

export async function listarProyectos(): Promise<Proyecto[]> {
  const { data, error } = await supabase.from("proyectos").select(SELECT_PROYECTO).order("creado_en");
  if (error) throw new ApiError(500, "DB_ERROR", error.message);
  return (data as unknown as FilaProyecto[]).map(aProyecto);
}

export async function obtenerProyecto(id: string): Promise<Proyecto> {
  const { data, error } = await supabase.from("proyectos").select(SELECT_PROYECTO).eq("id", id).maybeSingle();
  if (error) throw new ApiError(500, "DB_ERROR", error.message);
  if (!data) throw new ApiError(404, "NOT_FOUND", "Proyecto no encontrado");
  return aProyecto(data as unknown as FilaProyecto);
}

export async function existeProyecto(id: string): Promise<boolean> {
  const { count, error } = await supabase
    .from("proyectos")
    .select("id", { count: "exact", head: true })
    .eq("id", id);
  if (error) throw new ApiError(500, "DB_ERROR", error.message);
  return (count ?? 0) > 0;
}

/* Mes/anio de asignacion del proyecto; null si no existe. Usado para
   atribuir egresos generales a su mes y para validar meses cerrados. */
export async function obtenerMesAnioProyecto(
  id: string
): Promise<{ mes: string; anio: string } | null> {
  const { data, error } = await supabase
    .from("proyectos")
    .select("mes_asignacion, anio_asignacion")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new ApiError(500, "DB_ERROR", error.message);
  if (!data) return null;
  return { mes: MESES[data.mes_asignacion - 1], anio: String(data.anio_asignacion) };
}

/* Enriquecimiento (C2, C6): una sola pasada sobre los movimientos del proyecto.
   Sigue siendo sincrono porque movimientos todavia vive en memoria (pendiente
   Ahora async porque listarMovimientos consulta Supabase. */
export async function enriquecerProyecto(proyecto: Proyecto): Promise<ProyectoEnriquecido> {
  const movimientos = await listarMovimientos({ proyectoId: proyecto.id });
  let totalIngresos = 0;
  let totalEgresos = 0;
  let gastadoManoObra = 0;
  for (const m of movimientos) {
    if (m.tipo === "ingreso") {
      totalIngresos += m.monto;
    } else if (m.tipo === "egreso" && m.tipoEgreso === "egreso-general") {
      totalEgresos += m.monto;
      if (m.categoria === "Mano de Obra") gastadoManoObra += m.monto;
    }
  }
  return {
    ...proyecto,
    gastadoManoObra,
    totalIngresos,
    totalEgresos,
    ganancia: totalIngresos - totalEgresos,
  };
}

export async function listarProyectosEnriquecidos(): Promise<ProyectoEnriquecido[]> {
  const proyectos = await listarProyectos();
  return Promise.all(proyectos.map(enriquecerProyecto));
}

/* C4: un mes esta "Cerrado" si tiene >= 1 proyecto y TODOS estan Finalizados */
export async function esMesCerrado(mes: string, anio: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("proyectos")
    .select("estado")
    .eq("mes_asignacion", mesANumero(mes))
    .eq("anio_asignacion", Number(anio));
  if (error) throw new ApiError(500, "DB_ERROR", error.message);
  return data.length > 0 && data.every((p) => p.estado === "Finalizado");
}

/* C7: merge parcial de campos. La regla M1 (MO <= presupuesto del proyecto)
   se valida aqui porque requiere el proyecto actual cargado */
export async function actualizarProyecto(id: string, cambios: ActualizarProyectoInput): Promise<Proyecto> {
  const actual = await obtenerProyecto(id);
  /* M1 combinada: la mano de obra efectiva no puede superar el presupuesto
     efectivo (cualquiera de los dos puede cambiar en esta misma edicion) */
  const presupuestoEfectivo = cambios.presupuesto ?? actual.presupuesto;
  const manoObraEfectiva = cambios.presupuestoManoObra ?? actual.presupuestoManoObra;
  if (manoObraEfectiva > presupuestoEfectivo) {
    throw new ApiError(400, "VALIDATION_ERROR", "El presupuesto de mano de obra no puede superar el presupuesto del proyecto");
  }

  const patch: Record<string, unknown> = {};
  if (cambios.nombre !== undefined) patch.nombre = cambios.nombre;
  if (cambios.presupuesto !== undefined) patch.presupuesto = cambios.presupuesto;
  if (cambios.presupuestoManoObra !== undefined) patch.presupuesto_mano_obra = cambios.presupuestoManoObra;
  if (cambios.contratista !== undefined) patch.contratista_id = await resolverContratistaId(cambios.contratista);
  if (cambios.mesAsignacion !== undefined) patch.mes_asignacion = mesANumero(cambios.mesAsignacion);
  if (cambios.anioAsignacion !== undefined) patch.anio_asignacion = Number(cambios.anioAsignacion);
  if (cambios.estado !== undefined) patch.estado = cambios.estado;
  if (cambios.bono !== undefined) {
    const bonoId = await resolverBonoId(cambios.bono);
    patch.bono_id = bonoId;
    patch.subtipo_bono_id = cambios.subtipoBono
      ? await resolverSubtipoBonoId(bonoId, cambios.subtipoBono)
      : null;
  }

  const { data, error } = await supabase
    .from("proyectos")
    .update(patch)
    .eq("id", id)
    .select(SELECT_PROYECTO)
    .single();
  if (error) {
    if (error.code === "PGRST116") throw new ApiError(404, "NOT_FOUND", "Proyecto no encontrado");
    throw new ApiError(500, "DB_ERROR", error.message);
  }
  return aProyecto(data as unknown as FilaProyecto);
}
