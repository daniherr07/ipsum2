const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type ApiSuccess<T> = { success: true; data: T };
type ApiFailure = { success: false; error: { code: string; message: string } };
type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  const result = (await response.json()) as ApiResponse<T>;

  if (!result.success) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export type Proyecto = {
  id: string;
  nombre: string;
  presupuesto: number;
  mesAsignacion: string;
  anioAsignacion: string;
  estado: "Revisión" | "Finalizado";
  bono: string;
  subtipoBono: string;
  creadoEn: string;
};

export function listarProyectos(): Promise<Proyecto[]> {
  return apiFetch<Proyecto[]>("/proyectos");
}

export function crearProyecto(
  input: Omit<Proyecto, "id" | "creadoEn">
): Promise<Proyecto> {
  return apiFetch<Proyecto>("/proyectos", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function obtenerProyecto(id: string): Promise<Proyecto> {
  return apiFetch<Proyecto>(`/proyectos/${id}`);
}

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

export type Movimiento = CrearMovimientoInput & {
  id: string;
  creadoEn: string;
};

export function crearMovimiento(input: CrearMovimientoInput): Promise<Movimiento> {
  return apiFetch<Movimiento>("/movimientos", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function listarMovimientos(filtros?: {
  tipo?: string;
  proyectoId?: string;
}): Promise<Movimiento[]> {
  const query = new URLSearchParams();
  if (filtros?.tipo) query.set("tipo", filtros.tipo);
  if (filtros?.proyectoId) query.set("proyectoId", filtros.proyectoId);
  const qs = query.toString();
  return apiFetch<Movimiento[]>(`/movimientos${qs ? `?${qs}` : ""}`);
}

export function actualizarMovimiento(
  id: string,
  input: CrearMovimientoInput
): Promise<Movimiento> {
  return apiFetch<Movimiento>(`/movimientos/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function eliminarMovimiento(id: string): Promise<Record<string, never>> {
  return apiFetch(`/movimientos/${id}`, { method: "DELETE" });
}

export type DistribucionGastoAdministrativo = {
  proyectoId: string;
  nombre: string;
  monto: number;
  porcentaje: number;
};

export type ResumenDashboard = {
  mes: string;
  anio: string;
  ingresos: number;
  egresos: number;
  balance: number;
  pctGastado: number;
  gastosAdministrativos: number;
  pctGastosAdministrativos: number;
  superaLimiteAdministrativo: boolean;
  distribucionGastosAdministrativos: DistribucionGastoAdministrativo[];
  proyectosDelMes: { id: string; nombre: string; bono: string }[];
};

export function obtenerDashboard(mes: string, anio: string): Promise<ResumenDashboard> {
  return apiFetch<ResumenDashboard>(
    `/dashboard?mes=${encodeURIComponent(mes)}&anio=${encodeURIComponent(anio)}`
  );
}

export type ResumenMensual = { mes: string; ingresos: number; egresos: number };

export type ResumenStats = {
  anio: string;
  tipoBono?: string;
  ingresos: number;
  egresos: number;
  balance: number;
  serieMensual: ResumenMensual[];
  mejorMes: { mes: string; neto: number } | null;
  peorMes: { mes: string; neto: number } | null;
  promedioMensualIngresos: number;
};

export function obtenerStats(anio: string, tipoBono?: string): Promise<ResumenStats> {
  const query = new URLSearchParams({ anio });
  if (tipoBono) query.set("tipoBono", tipoBono);
  return apiFetch<ResumenStats>(`/stats?${query.toString()}`);
}

export type TipoCatalogo = "ordenes-compra" | "proveedores";

export type ItemCatalogo = {
  id: string;
  nombre: string;
  creadoEn: string;
};

export function listarCatalogo(tipo: TipoCatalogo): Promise<ItemCatalogo[]> {
  return apiFetch<ItemCatalogo[]>(`/catalogos/${tipo}`);
}

export function crearItemCatalogo(tipo: TipoCatalogo, nombre: string): Promise<ItemCatalogo> {
  return apiFetch<ItemCatalogo>(`/catalogos/${tipo}`, {
    method: "POST",
    body: JSON.stringify({ nombre }),
  });
}

export function actualizarItemCatalogo(
  tipo: TipoCatalogo,
  id: string,
  nombre: string
): Promise<ItemCatalogo> {
  return apiFetch<ItemCatalogo>(`/catalogos/${tipo}/${id}`, {
    method: "PUT",
    body: JSON.stringify({ nombre }),
  });
}

export function eliminarItemCatalogo(tipo: TipoCatalogo, id: string): Promise<Record<string, never>> {
  return apiFetch(`/catalogos/${tipo}/${id}`, { method: "DELETE" });
}

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

export function listarBonos(): Promise<Bono[]> {
  return apiFetch<Bono[]>("/bonos");
}

export function crearBono(nombre: string): Promise<Bono> {
  return apiFetch<Bono>("/bonos", { method: "POST", body: JSON.stringify({ nombre }) });
}

export function actualizarBono(id: string, nombre: string): Promise<Bono> {
  return apiFetch<Bono>(`/bonos/${id}`, { method: "PUT", body: JSON.stringify({ nombre }) });
}

export function eliminarBono(id: string): Promise<Record<string, never>> {
  return apiFetch(`/bonos/${id}`, { method: "DELETE" });
}

export function crearSubtipoBono(bonoId: string, nombre: string): Promise<SubtipoBono> {
  return apiFetch<SubtipoBono>(`/bonos/${bonoId}/subtipos`, {
    method: "POST",
    body: JSON.stringify({ nombre }),
  });
}

export function actualizarSubtipoBono(
  bonoId: string,
  subtipoId: string,
  nombre: string
): Promise<SubtipoBono> {
  return apiFetch<SubtipoBono>(`/bonos/${bonoId}/subtipos/${subtipoId}`, {
    method: "PUT",
    body: JSON.stringify({ nombre }),
  });
}

export function eliminarSubtipoBono(
  bonoId: string,
  subtipoId: string
): Promise<Record<string, never>> {
  return apiFetch(`/bonos/${bonoId}/subtipos/${subtipoId}`, { method: "DELETE" });
}
