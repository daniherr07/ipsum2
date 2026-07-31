import { listarProyectos } from "./proyectos.js";
import { listarMovimientos } from "./movimientos.js";
import { MESES, mesAnioDe } from "../utils/fechas.js";

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

export function calcularStats(anio: string, tipoBono?: string): ResumenStats {
  const proyectos = listarProyectos();
  const movimientos = listarMovimientos({});

  const proyectosPermitidos = tipoBono
    ? new Set(proyectos.filter((p) => p.bono === tipoBono).map((p) => p.id))
    : null;

  const movimientosDelAnio = movimientos.filter((m) => {
    const fecha = mesAnioDe(m.creadoEn);
    if (fecha.anio !== anio) return false;
    if (!proyectosPermitidos) return true;
    if (m.tipo === "ingreso") return proyectosPermitidos.has(m.proyectoId);
    if (m.tipo === "egreso" && m.tipoEgreso === "egreso-general") {
      return proyectosPermitidos.has(m.proyectoId);
    }
    return false;
  });

  const ingresos = movimientosDelAnio
    .filter((m) => m.tipo === "ingreso")
    .reduce((sum, m) => sum + m.monto, 0);

  const egresos = movimientosDelAnio
    .filter((m) => m.tipo === "egreso")
    .reduce((sum, m) => sum + m.monto, 0);

  const balance = ingresos - egresos;

  const serieMensual: ResumenMensual[] = MESES.map((mes) => {
    const delMes = movimientosDelAnio.filter((m) => mesAnioDe(m.creadoEn).mes === mes);
    return {
      mes,
      ingresos: delMes.filter((m) => m.tipo === "ingreso").reduce((sum, m) => sum + m.monto, 0),
      egresos: delMes.filter((m) => m.tipo === "egreso").reduce((sum, m) => sum + m.monto, 0),
    };
  });

  const mesesConDatos = serieMensual.filter((s) => s.ingresos > 0 || s.egresos > 0);

  const mejorMes = mesesConDatos.length
    ? mesesConDatos.reduce((mejor, actual) =>
        actual.ingresos - actual.egresos > mejor.ingresos - mejor.egresos ? actual : mejor
      )
    : null;

  const peorMes = mesesConDatos.length
    ? mesesConDatos.reduce((peor, actual) =>
        actual.ingresos - actual.egresos < peor.ingresos - peor.egresos ? actual : peor
      )
    : null;

  const promedioMensualIngresos = mesesConDatos.length > 0 ? ingresos / mesesConDatos.length : 0;

  return {
    anio,
    tipoBono,
    ingresos,
    egresos,
    balance,
    serieMensual,
    mejorMes: mejorMes ? { mes: mejorMes.mes, neto: mejorMes.ingresos - mejorMes.egresos } : null,
    peorMes: peorMes ? { mes: peorMes.mes, neto: peorMes.ingresos - peorMes.egresos } : null,
    promedioMensualIngresos,
  };
}
