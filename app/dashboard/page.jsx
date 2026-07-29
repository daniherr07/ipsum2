"use client";

import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Wallet,
  FileText,
  BarChart3,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";
import NavBar from "@/components/navbar/NavBar";

/* =========================
   Format number consistently (avoid locale mismatch)
========================= */
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/* =========================
   FadeIn animation component
========================= */
function FadeIn({ children, delay = 0, className = "" }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(id);
  }, [delay]);

  return (
    <div
      className={className}
      style={{
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0)" : "translateY(16px)",
        transition: "opacity 0.5s ease-out, transform 0.5s ease-out",
      }}
    >
      {children}
    </div>
  );
}

/* =========================
   Gastos Administrativos component
========================= */
function GastosAdministrativosCard({ gastosAdmin, proyectosAdmin }) {
  /* Peso del proyecto = presupuesto / presupuesto total del grupo.
     Asignado = gastosAdmin * peso. Alerta si supera el 10% del presupuesto. */
  const presupuestoTotal = proyectosAdmin.reduce((s, p) => s + p.presupuesto, 0);
  const ratioPeriodo =
    presupuestoTotal > 0 ? (gastosAdmin / presupuestoTotal) * 100 : 0;
  const superaLimite = ratioPeriodo > 10;

  return (
    <div className="w-full bg-base-200 flex flex-col gap-6 rounded-lg shadow-lg p-7">
      {/* Título y monto */}
      <div className="text-center">
        <span className="text-base-content text-lg uppercase font-black">
          Gastos Administrativos
        </span>
        <span className="text-4xl font-black text-warning block mt-2">
          ₵{formatNumber(gastosAdmin)}
        </span>
        <p className="text-xs text-base-content/50 mt-1">
          {ratioPeriodo.toFixed(1)}% del presupuesto del período · distribuido
          por peso presupuestario
        </p>
      </div>

      {/* Alerta: supera el 10% del presupuesto */}
      {superaLimite && (
        <div
          role="alert"
          className="alert alert-warning alert-soft rounded-lg px-3 py-2 text-xs sm:text-sm"
        >
          <TriangleAlert size={16} className="shrink-0" />
          <span>
            Los gastos administrativos superan el 10% del presupuesto del
            período
          </span>
        </div>
      )}

      <div className="divider m-0!"></div>

      {/* Distribución por proyecto */}
      <div className="space-y-4">
        {proyectosAdmin.map((proyecto, idx) => {
          const peso =
            presupuestoTotal > 0
              ? (proyecto.presupuesto / presupuestoTotal) * 100
              : 0;
          const asignado = Math.round(
            (gastosAdmin * proyecto.presupuesto) / (presupuestoTotal || 1),
          );
          return (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between items-baseline gap-2">
                <span className="text-sm font-semibold text-base-content/80 truncate">
                  {proyecto.nombre}
                </span>
                <span className="text-sm font-bold text-warning shrink-0">
                  ₵{formatNumber(asignado)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <progress
                  className={`progress w-full ${
                    superaLimite ? "progress-error" : "progress-warning"
                  }`}
                  value={peso}
                  max="100"
                ></progress>
                <span className="text-xs font-semibold text-base-content/60 w-11 text-right shrink-0">
                  {peso.toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================
   Configuración de meses
========================= */
const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

/* =========================
   Data mock por mes/año
   (luego puedes traerla de BD)
========================= */
const PROYECTOS_A = [
  { nombre: "Clodomiro Picado", presupuesto: 50000000 },
  { nombre: "Monseñor Sanabria", presupuesto: 75000000 },
  { nombre: "Joaquín García", presupuesto: 60000000 },
];

const PROYECTOS_B = [
  ...PROYECTOS_A,
  { nombre: "Residencial Vista", presupuesto: 85000000 },
];

const DATA = {
  "2025-0": { ingresos: 16000000, egresos: 20500000, gastosAdmin: 16500000, proyectosAdmin: PROYECTOS_A },
  "2025-1": { ingresos: 25000000, egresos: 22500000, gastosAdmin: 18900000, proyectosAdmin: PROYECTOS_A },
  "2025-2": { ingresos: 39000000, egresos: 26000000, gastosAdmin: 14800000, proyectosAdmin: PROYECTOS_A },
  "2025-3": { ingresos: 31000000, egresos: 30500000, gastosAdmin: 22100000, proyectosAdmin: PROYECTOS_A },
  "2025-4": { ingresos: 45500000, egresos: 35000000, gastosAdmin: 24300000, proyectosAdmin: PROYECTOS_B },
  "2025-5": { ingresos: 20000000, egresos: 32500000, gastosAdmin: 29700000, proyectosAdmin: PROYECTOS_B },
  "2025-6": { ingresos: 52500000, egresos: 36000000, gastosAdmin: 21600000, proyectosAdmin: PROYECTOS_B },
  "2025-7": { ingresos: 44000000, egresos: 41500000, gastosAdmin: 18200000, proyectosAdmin: PROYECTOS_A },
  "2025-8": { ingresos: 22500000, egresos: 45000000, gastosAdmin: 20900000, proyectosAdmin: PROYECTOS_A },
  "2025-9": { ingresos: 39000000, egresos: 21000000, gastosAdmin: 15700000, proyectosAdmin: PROYECTOS_A },
  "2025-10": { ingresos: 60000000, egresos: 32500000, gastosAdmin: 26400000, proyectosAdmin: PROYECTOS_B },
  "2025-11": { ingresos: 15000000, egresos: 27500000, gastosAdmin: 31100000, proyectosAdmin: PROYECTOS_B },
};
export default function DashboardConstructora() {
  const [mesIndex, setMesIndex] = useState(9); // Octubre
  const [anio, setAnio] = useState(2025);
  const [isChanging, setIsChanging] = useState(false);

  const key = `${anio}-${mesIndex}`;
  const data = DATA[key] ?? {
    ingresos: 0,
    egresos: 0,
    gastosAdmin: 0,
    proyectosAdmin: [],
  };

  const balance = data.ingresos - data.egresos;

  /* =========================
     Trigger fade effect on month change
  ========================= */
  useEffect(() => {
    setIsChanging(true);
    const timer = setTimeout(() => setIsChanging(false), 500);
    return () => clearTimeout(timer);
  }, [mesIndex, anio]);

  /* =========================
     Navegación de meses
  ========================= */
  const mesAnterior = () => {
    if (mesIndex === 0) {
      setMesIndex(11);
      setAnio((a) => a - 1);
    } else {
      setMesIndex((m) => m - 1);
    }
  };

  const mesSiguiente = () => {
    if (mesIndex === 11) {
      setMesIndex(0);
      setAnio((a) => a + 1);
    } else {
      setMesIndex((m) => m + 1);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center p-3 mt-3">
        {/* Back Button */}
        <FadeIn delay={0} className="w-full mb-4">
          <Link href="/" className="btn btn-ghost btn-circle w-fit">
            <ChevronLeft size={24} />
          </Link>
        </FadeIn>

        {/* Selector de Fecha */}
        <FadeIn delay={0} className="flex flex-col items-center mb-10">
          <span className="text-base-content/50 text-sm font-medium mb-1">{anio}</span>
          <div className="flex items-center gap-8">
            <button
              onClick={mesAnterior}
              className="btn btn-ghost btn-circle btn-sm bg-primary"
            >
              <ChevronLeft size={20} />
            </button>

            <h1 className="text-4xl font-black">{MESES[mesIndex]}</h1>

            <button
              onClick={mesSiguiente}
              className="btn btn-ghost btn-circle btn-sm bg-primary"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </FadeIn>

        {/* Cards Container with fade effect on month change */}
        {/* Card Principal */}
        <div
          style={{
            opacity: isChanging ? 0 : 1,
            transform: isChanging ? "translateY(16px)" : "translateY(0)",
            transition: "opacity 0.5s ease-out, transform 0.5s ease-out",
          }}
          className="w-full max-w-2xl"
        >
          <FadeIn
            delay={100}
            className="w-full bg-base-200 flex flex-col gap-6 rounded-lg shadow-lg p-7"
          >
            {/* Ingresos / Egresos */}
            <div className="grid grid-cols-2 gap-5">
              <div className=" text-center flex flex-col items-center justify-center">
                <div className="flex justify-center gap-2 text-error">
                  <TrendingDown size={14} />
                  <span className="text-[10px] uppercase font-black">
                    Egresos
                  </span>
                </div>
                <span className="font-black text-2xl text-error">
                  ₵{formatNumber(data.egresos)}
                </span>
              </div>

              <div className="text-center flex flex-col items-center justify-center">
                <div className="flex justify-center gap-2 text-success">
                  <TrendingUp size={14} />
                  <span className="text-[10px] uppercase font-black">
                    Ingresos
                  </span>
                </div>
                <span className="font-black text-2xl text-success">
                  ₵{formatNumber(data.ingresos)}
                </span>
              </div>
            </div>

            {/* Balance */}
            <div className="text-center">
              <span className="text-base-content text-lg uppercase font-black">
                Balance Total
              </span>
              <span
                className={`text-4xl font-black line-clamp-1 ${
                  balance < 0 ? "text-error" : "text-success"
                }`}
              >
                ₵{formatNumber(balance)}
              </span>
            </div>

            <div className="divider m-0!"></div>
          </FadeIn>
        </div>

        {/* Gastos Administrativos Card */}
        <div
          style={{
            opacity: isChanging ? 0 : 1,
            transform: isChanging ? "translateY(16px)" : "translateY(0)",
            transition: "opacity 0.5s ease-out, transform 0.5s ease-out",
          }}
          className="w-full max-w-2xl"
        >
          <FadeIn delay={150} className="w-full">
            <GastosAdministrativosCard
              gastosAdmin={data.gastosAdmin}
              proyectosAdmin={data.proyectosAdmin}
            />
          </FadeIn>
        </div>

        {/* Proyectos del Mes Card */}
        <div
          style={{
            opacity: isChanging ? 0 : 1,
            transform: isChanging ? "translateY(16px)" : "translateY(0)",
            transition: "opacity 0.5s ease-out, transform 0.5s ease-out",
          }}
          className="w-full max-w-2xl"
        >
          <FadeIn
            delay={200}
            className="w-full bg-base-200 flex flex-col gap-6 rounded-lg shadow-lg p-7 mt-3"
          >
            {/* Balance */}
            <div className="text-center">
              <span className="text-base-content text-lg uppercase font-black">
                Proyectos del Mes
              </span>
            </div>

            <ul className="list bg-base-100 rounded-box shadow-md">
              <li className="list-row ">
                <div className="list-col-grow">
                  <div>Clodomiro Picado</div>
                  <div className="text-xs uppercase font-semibold opacity-60">
                    ART. 59
                  </div>
                </div>
                <Link href="/proyecto" className="btn btn-square btn-primary ">
                  <ExternalLink></ExternalLink>
                </Link>
              </li>

              <li className="list-row ">
                <div className="list-col-grow">
                  <div>Monseñor Sanabria</div>
                  <div className="text-xs uppercase font-semibold opacity-60">
                    CLP
                  </div>
                </div>
                <Link href="/proyecto" className="btn btn-square btn-primary ">
                  <ExternalLink></ExternalLink>
                </Link>
              </li>

              <li className="list-row ">
                <div className="list-col-grow">
                  <div>Joaquín García</div>
                  <div className="text-xs uppercase font-semibold opacity-60">
                    ART. 59
                  </div>
                </div>
                <Link href="/proyecto" className="btn btn-square btn-primary ">
                  <ExternalLink></ExternalLink>
                </Link>
              </li>
            </ul>
          </FadeIn>
        </div>
      </div>
    </>
  );
}
