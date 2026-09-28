import type { Request, Response } from "express";
import {
  actualizarProyecto,
  crearProyecto,
  enriquecerProyecto,
  listarProyectos,
  obtenerProyecto,
} from "../services/proyectos.js";
import { calcularDistribucionAdministrativa } from "../services/dashboard.js";
import { listarCategorias } from "../services/categorias.js";
import { validarActualizarProyecto, validarCrearProyecto } from "../validators/proyectos.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

/* C5: gasto administrativo que le corresponde al proyecto segun su mes de asignacion */
async function gastosAdministrativosDelProyecto(proyectoId: string, mes: string, anio: string): Promise<number> {
  const dist = await calcularDistribucionAdministrativa(mes, anio);
  return dist.find((d) => d.proyectoId === proyectoId)?.monto ?? 0;
}

/* Nombres de las categorias marcadas como mano de obra en el catalogo */
async function categoriasManoObra(): Promise<Set<string>> {
  const categorias = await listarCategorias();
  return new Set(categorias.filter((c) => c.esManoObra).map((c) => c.nombre));
}

export const postProyecto = asyncHandler(async (req: Request, res: Response) => {
  const input = await validarCrearProyecto(req.body);
  const proyecto = await crearProyecto(input);
  res.status(201).json({
    success: true,
    data: await enriquecerProyecto(
      proyecto,
      await gastosAdministrativosDelProyecto(proyecto.id, proyecto.mesAsignacion, proyecto.anioAsignacion),
      await categoriasManoObra()
    ),
  });
});

export const getProyectos = asyncHandler(async (req: Request, res: Response) => {
  const proyectos = await listarProyectos();
  /* El gasto administrativo asignado depende del mes; se calcula una vez por mes
     distinto y se reutiliza para todos sus proyectos. */
  const mesesUnicos = new Map<string, { mes: string; anio: string }>();
  for (const p of proyectos) {
    mesesUnicos.set(`${p.mesAsignacion}::${p.anioAsignacion}`, {
      mes: p.mesAsignacion,
      anio: p.anioAsignacion,
    });
  }
  const [distribuciones, manoObra] = await Promise.all([
    Promise.all(
      [...mesesUnicos.values()].map(({ mes, anio }) => calcularDistribucionAdministrativa(mes, anio))
    ),
    categoriasManoObra(),
  ]);
  const adminPorProyecto = new Map(distribuciones.flat().map((d) => [d.proyectoId, d.monto]));
  res.json({
    success: true,
    data: await Promise.all(
      proyectos.map((p) => enriquecerProyecto(p, adminPorProyecto.get(p.id) ?? 0, manoObra))
    ),
  });
});

export const getProyecto = asyncHandler(async (req: Request, res: Response) => {
  const proyecto = await obtenerProyecto(req.params.id);
  res.json({
    success: true,
    data: await enriquecerProyecto(
      proyecto,
      await gastosAdministrativosDelProyecto(proyecto.id, proyecto.mesAsignacion, proyecto.anioAsignacion),
      await categoriasManoObra()
    ),
  });
});

/* C7: edicion parcial (presupuesto MO, contratista, mes/anio asignacion, estado) */
export const putProyecto = asyncHandler(async (req: Request, res: Response) => {
  const cambios = await validarActualizarProyecto(req.body);
  const proyecto = await actualizarProyecto(req.params.id, cambios);
  res.json({
    success: true,
    data: await enriquecerProyecto(
      proyecto,
      await gastosAdministrativosDelProyecto(proyecto.id, proyecto.mesAsignacion, proyecto.anioAsignacion),
      await categoriasManoObra()
    ),
  });
});
