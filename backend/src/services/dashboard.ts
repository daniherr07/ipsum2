import { listarProyectos } from "./proyectos.js";
import { listarMovimientos } from "./movimientos.js";
import { mesAnioDe } from "../utils/fechas.js";

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

export function calcularDashboard(mes: string, anio: string): ResumenDashboard {
  const proyectos = listarProyectos();
  const movimientos = listarMovimientos({});

  const movimientosDelPeriodo = movimientos.filter((m) => {
    const fecha = mesAnioDe(m.creadoEn);
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

  const distribucionGastosAdministrativos: DistribucionGastoAdministrativo[] = proyectosDelMes.map((p) => {
    const peso = presupuestoTotal > 0 ? p.presupuesto / presupuestoTotal : 0;
    return {
      proyectoId: p.id,
      nombre: p.nombre,
      monto: gastosAdministrativos * peso,
      porcentaje: Math.round(peso * 1000) / 10,
    };
  });

  const pctGastosAdministrativos =
    presupuestoTotal > 0 ? (gastosAdministrativos / presupuestoTotal) * 100 : 0;

  return {
    mes,
    anio,
    ingresos,
    egresos,
    balance,
    pctGastado: Math.round(pctGastado * 10) / 10,
    gastosAdministrativos,
    pctGastosAdministrativos: Math.round(pctGastosAdministrativos * 10) / 10,
    superaLimiteAdministrativo: pctGastosAdministrativos > 10,
    distribucionGastosAdministrativos,
    proyectosDelMes: proyectosDelMes.map((p) => ({ id: p.id, nombre: p.nombre, bono: p.bono })),
  };
}
