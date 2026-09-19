import { listarProyectos, type Proyecto } from "./proyectos.js";
import { listarMovimientos, mesAnioDeMovimiento } from "./movimientos.js";
import { MESES } from "../utils/fechas.js";

export type MesActivo = {
  mes: string;
  anio: string;
  ingresos: number;
  egresos: number;
  balance: number;
};

export type ResumenConciliacion = {
  mesesActivos: MesActivo[];
  balanceTotal: number;
};

/* Mismo criterio de "mes activo" que estadoMes en dashboard.ts: tiene
   al menos un proyecto y no todos estan Finalizado. Mismo filtro de
   periodo (mesAnioDeMovimiento) que calcularDashboard, para que los
   numeros de aqui y los del dashboard nunca diverjan. */
export async function calcularConciliacion(): Promise<ResumenConciliacion> {
  const proyectos = await listarProyectos();
  const movimientos = await listarMovimientos({});

  const porMes = new Map<string, Proyecto[]>();
  for (const p of proyectos) {
    const clave = `${p.mesAsignacion}|${p.anioAsignacion}`;
    porMes.set(clave, [...(porMes.get(clave) ?? []), p]);
  }

  const clavesActivas = [...porMes.entries()]
    .filter(([, ps]) => !ps.every((p) => p.estado === "Finalizado"))
    .map(([clave]) => clave);

  const mesesActivos: MesActivo[] = clavesActivas.map((clave) => {
    const [mes, anio] = clave.split("|");
    const delPeriodo = movimientos.filter((m) => {
      const fecha = mesAnioDeMovimiento(m);
      return fecha.mes === mes && fecha.anio === anio;
    });
    const ingresos = delPeriodo.filter((m) => m.tipo === "ingreso").reduce((sum, m) => sum + m.monto, 0);
    const egresos = delPeriodo.filter((m) => m.tipo === "egreso").reduce((sum, m) => sum + m.monto, 0);
    return { mes, anio, ingresos, egresos, balance: ingresos - egresos };
  });

  mesesActivos.sort(
    (a, b) => Number(a.anio) - Number(b.anio) || MESES.indexOf(a.mes) - MESES.indexOf(b.mes)
  );

  const balanceTotal = mesesActivos.reduce((sum, m) => sum + m.balance, 0);

  return { mesesActivos, balanceTotal };
}
