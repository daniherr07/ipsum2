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

export function listarMovimientos(filtros?: { tipo?: string }): Promise<Movimiento[]> {
  const query = filtros?.tipo ? `?tipo=${encodeURIComponent(filtros.tipo)}` : "";
  return apiFetch<Movimiento[]>(`/movimientos${query}`);
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
