import { listarProyectos } from "./proyectos.js";
import { listarMovimientos, mesAnioDeMovimiento, type Movimiento } from "./movimientos.js";

export type DistribucionGastoAdministrativo = {
  proyectoId: string;
  nombre: string;
  monto: number;
  porcentaje: number;
};

export type EgresoProyecto = {
  id: string;
  monto: number;
  categoria: string;
  descripcion: string;
  creadoEn: string;
};

export type ProyectoDelMes = {
  id: string;
  nombre: string;
  bono: string;
  presupuesto: number;
  estado: "Revisión" | "Finalizado";
  egresos: EgresoProyecto[];
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
  proyectosDelMes: ProyectoDelMes[];
  presupuestoTotal: number;
  estadoMes: "En proceso" | "Cerrado" | null;
};

/* C5: prorrata de los gastos administrativos del mes por peso presupuestario.
   Reutilizada por el dashboard y por el detalle de proyecto (gastosAdministrativosMes) */
export async function calcularDistribucionAdministrativa(
  mes: string,
  anio: string
): Promise<DistribucionGastoAdministrativo[]> {
  const todos = await listarProyectos();
  const proyectosDelMes = todos.filter((p) => p.mesAsignacion === mes && p.anioAsignacion === anio);

  const gastosAdministrativos = (await listarMovimientos({}))
    .filter((m) => {
      if (m.tipo !== "egreso" || m.tipoEgreso !== "egreso-administrativo") return false;
      const fecha = mesAnioDeMovimiento(m);
      return fecha.mes === mes && fecha.anio === anio;
    })
    .reduce((sum, m) => sum + m.monto, 0);

  const presupuestoTotal = proyectosDelMes.reduce((sum, p) => sum + p.presupuesto, 0);

  return proyectosDelMes.map((p) => {
    const peso = presupuestoTotal > 0 ? p.presupuesto / presupuestoTotal : 0;
    return {
      proyectoId: p.id,
      nombre: p.nombre,
      monto: gastosAdministrativos * peso,
      porcentaje: Math.round(peso * 1000) / 10,
    };
  });
}

export async function calcularDashboard(mes: string, anio: string): Promise<ResumenDashboard> {
  const proyectos = await listarProyectos();
  const movimientos = await listarMovimientos({});

  const movimientosDelPeriodo = movimientos.filter((m) => {
    const fecha = mesAnioDeMovimiento(m);
    return fecha.mes === mes && fecha.anio === anio;
  });

  const ingresos = movimientosDelPeriodo
    .filter((m) => m.tipo === "ingreso")
    .reduce((sum, m) => sum + m.monto, 0);

  const egresos = movimientosDelPeriodo
    .filter((m) => m.tipo === "egreso")
    .reduce((sum, m) => sum + m.monto, 0);

  const balance = ingresos - egresos;
  const pctGastado = ingresos > 0 ? (egresos / ingresos) * 100 : 0;

  const gastosAdministrativos = movimientosDelPeriodo
    .filter((m) => m.tipo === "egreso" && m.tipoEgreso === "egreso-administrativo")
    .reduce((sum, m) => sum + m.monto, 0);

  const proyectosDelMes = proyectos.filter(
    (p) => p.mesAsignacion === mes && p.anioAsignacion === anio
  );

  const presupuestoTotal = proyectosDelMes.reduce((sum, p) => sum + p.presupuesto, 0);

  /* La distribucion reutiliza la funcion extraida (C5); el resultado es identico */
  const distribucionGastosAdministrativos = await calcularDistribucionAdministrativa(mes, anio);

  const pctGastosAdministrativos =
    presupuestoTotal > 0 ? (gastosAdministrativos / presupuestoTotal) * 100 : 0;

  /* C4: estado del mes segun sus proyectos (null si el mes no tiene proyectos) */
  const estadoMes: ResumenDashboard["estadoMes"] =
    proyectosDelMes.length === 0
      ? null
      : proyectosDelMes.every((p) => p.estado === "Finalizado")
        ? "Cerrado"
        : "En proceso";

  return {
    mes,
    anio,
    ingresos,
    egresos,
    balance,
    pctGastado: Math.round(pctGastado * 10) / 10,
    gastosAdministrativos,
    pctGastosAdministrativos: Math.round(pctGastosAdministrativos * 100) / 100,
    superaLimiteAdministrativo: pctGastosAdministrativos > 10,
    distribucionGastosAdministrativos,
    proyectosDelMes: proyectosDelMes.map((p) => ({
      id: p.id,
      nombre: p.nombre,
      bono: p.bono,
      presupuesto: p.presupuesto,
      estado: p.estado,
      egresos: movimientos
        .filter(
          (m): m is Extract<Movimiento, { tipoEgreso: "egreso-general" }> =>
            m.tipo === "egreso" &&
            m.tipoEgreso === "egreso-general" &&
            m.proyectoId === p.id
        )
        .map((m) => ({
          id: m.id,
          monto: m.monto,
          categoria: m.categoria,
          descripcion: m.descripcion,
          creadoEn: m.creadoEn,
        })),
    })),
    presupuestoTotal,
    estadoMes,
  };
}
