"use client";

import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Wallet,
  Plus,
  ArrowRight,
  FileText,
  FolderOpen,
  FolderPlus,
  BarChart3,
  Settings,
  ExternalLink,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";

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
  "2026-5": { ingresos: 49000000, egresos: 30500000, gastosAdmin: 17800000, proyectosAdmin: PROYECTOS_A },
  "2026-6": { ingresos: 36000000, egresos: 42300000, gastosAdmin: 19600000, proyectosAdmin: PROYECTOS_A },
};
/* =========================
   Accesos rápidos (menú)
========================= */
const ACCESOS_RAPIDOS = [
  {
    href: "/movs",
    label: "Movimientos",
    desc: "Consultar y editar",
    icon: FileText,
    iconBg: "bg-secondary/10",
    iconColor: "text-secondary",
  },
  {
    href: "/proyectos",
    label: "Proyectos",
    desc: "Ver todos",
    icon: FolderOpen,
    iconBg: "bg-info/10",
    iconColor: "text-info",
  },
  {
    href: "/agregarProyecto",
    label: "Nuevo Proyecto",
    desc: "Crear proyecto",
    icon: FolderPlus,
    iconBg: "bg-info/10",
    iconColor: "text-info",
  },
  {
    href: "/stats",
    label: "Estadísticas",
    desc: "Gráficos y resúmenes",
    icon: BarChart3,
    iconBg: "bg-warning/10",
    iconColor: "text-warning",
  },
  {
    href: "/settings",
    label: "Configuración",
    desc: "Administrar datos",
    icon: Settings,
    iconBg: "bg-accent/10",
    iconColor: "text-accent",
  },
];

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
    <div className="w-full h-full bg-base-100 flex flex-col gap-5 rounded-lg shadow-md p-5 sm:p-7">
      {/* Título y monto */}
      <div className="text-center">
        <span className="text-base-content text-sm sm:text-lg uppercase font-black">
          Gastos Administrativos
        </span>
        <span className="text-2xl sm:text-4xl font-black text-warning block mt-1 sm:mt-2">
          ₵{formatNumber(gastosAdmin)}
        </span>
        <p className="text-[11px] sm:text-xs text-base-content/50 mt-1">
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
        {proyectosAdmin.length > 0 ? (
          proyectosAdmin.map((proyecto, idx) => {
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
          })
        ) : (
          <p className="text-center text-sm text-base-content/50">
            Sin datos para este mes
          </p>
        )}
      </div>
    </div>
  );
}

/* =========================
   Proyectos del Mes component
========================= */
function ProyectosDelMesCard() {
  const proyectos = [
    { nombre: "Clodomiro Picado", tipo: "ART. 59" },
    { nombre: "Monseñor Sanabria", tipo: "CLP" },
    { nombre: "Joaquín García", tipo: "ART. 59" },
  ];

  return (
    <div className="w-full h-full bg-base-100 flex flex-col gap-5 rounded-lg shadow-md p-5 sm:p-7">
      <div className="text-center">
        <span className="text-base-content text-sm sm:text-lg uppercase font-black">
          Proyectos del Mes
        </span>
      </div>

      <ul className="list bg-base-200 rounded-box">
        {proyectos.map((proyecto) => (
          <li className="list-row" key={proyecto.nombre}>
            <div className="list-col-grow">
              <div className="text-sm sm:text-base">{proyecto.nombre}</div>
              <div className="text-xs uppercase font-semibold opacity-60">
                {proyecto.tipo}
              </div>
            </div>
            <Link
              href="/proyecto"
              className="btn btn-square btn-primary btn-sm sm:btn-md"
              aria-label={`Ver ${proyecto.nombre}`}
            >
              <ExternalLink size={18} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Home() {
  const [mesIndex, setMesIndex] = useState(0);
  const [anio, setAnio] = useState(2025);
  const [isChanging, setIsChanging] = useState(false);

  /* =========================
     Inicializar con el mes actual
     (en useEffect para evitar hydration mismatch)
  ========================= */
  useEffect(() => {
    const now = new Date();
    setMesIndex(now.getMonth());
    setAnio(now.getFullYear());
  }, []);

  const key = `${anio}-${mesIndex}`;
  const data = DATA[key] ?? {
    ingresos: 0,
    egresos: 0,
    gastosAdmin: 0,
    proyectosAdmin: [],
  };

  const balance = data.ingresos - data.egresos;

  // Porcentaje de lo gastado respecto a lo ingresado
  const pctGasto =
    data.ingresos > 0
      ? Math.round((data.egresos / data.ingresos) * 100)
      : data.egresos > 0
        ? 100
        : 0;

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

  const fadeStyle = {
    opacity: isChanging ? 0 : 1,
    transform: isChanging ? "translateY(16px)" : "translateY(0)",
    transition: "opacity 0.5s ease-out, transform 0.5s ease-out",
  };

  return (
    <div className="min-h-[calc(100svh-64px)] bg-base-200 p-3 sm:p-4 lg:p-6">
      <div className="max-w-6xl mx-auto flex flex-col gap-4 sm:gap-5 lg:gap-6">
        {/* Selector de Fecha */}
        <FadeIn delay={0} className="flex flex-col items-center">
          <span className="text-base-content/50 text-xs sm:text-sm font-medium mb-1">
            {anio}
          </span>
          <div className="flex items-center gap-4 sm:gap-8">
            <button
              onClick={mesAnterior}
              className="btn btn-ghost btn-circle btn-sm bg-primary text-white"
              aria-label="Mes anterior"
            >
              <ChevronLeft size={20} />
            </button>

            <h1 className="text-2xl sm:text-4xl font-black w-40 sm:w-64 text-center">
              {MESES[mesIndex]}
            </h1>

            <button
              onClick={mesSiguiente}
              className="btn btn-ghost btn-circle btn-sm bg-primary text-white"
              aria-label="Mes siguiente"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </FadeIn>

        {/* Fila principal: Resumen del mes + CTA Agregar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
          {/* Card Principal: Gasto del mes */}
          <div style={fadeStyle} className="lg:col-span-2">
            <FadeIn delay={100} className="h-full">
              <div className="w-full h-full bg-base-100 flex flex-col justify-between gap-5 rounded-lg shadow-md p-5 sm:p-7">
                {/* Etiqueta */}
                <div className="flex items-center justify-center gap-2 text-error">
                  <div className="bg-error/10 p-2 rounded-lg">
                    <TrendingDown size={18} />
                  </div>
                  <span className="text-xs sm:text-sm uppercase font-black">
                    Gastado en {MESES[mesIndex]}
                  </span>
                </div>

                {/* Monto principal */}
                <div className="text-center">
                  <span className="font-black text-error text-4xl sm:text-5xl leading-none">
                    ₵{formatNumber(data.egresos)}
                  </span>
                </div>

                {/* Progreso respecto a ingresos */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] sm:text-xs text-base-content/60">
                      Has gastado el {pctGasto}% de lo ingresado
                    </span>
                  </div>
                  <progress
                    className={`progress w-full ${
                      pctGasto > 100
                        ? "progress-error"
                        : pctGasto >= 80
                          ? "progress-warning"
                          : "progress-primary"
                    }`}
                    value={Math.min(pctGasto, 100)}
                    max="100"
                  ></progress>
                </div>

                <div className="divider m-0!"></div>

                {/* Ingresos / Balance */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center flex flex-col items-center gap-1">
                    <div className="flex items-center gap-1.5 text-success">
                      <TrendingUp size={14} />
                      <span className="text-[10px] sm:text-xs uppercase font-black">
                        Ingresos
                      </span>
                    </div>
                    <span className="font-black text-lg sm:text-2xl text-success">
                      ₵{formatNumber(data.ingresos)}
                    </span>
                  </div>

                  <div className="text-center flex flex-col items-center gap-1">
                    <div
                      className={`flex items-center gap-1.5 ${
                        balance < 0 ? "text-error" : "text-success"
                      }`}
                    >
                      <Wallet size={14} />
                      <span className="text-[10px] sm:text-xs uppercase font-black">
                        Balance
                      </span>
                    </div>
                    <span
                      className={`font-black text-lg sm:text-2xl ${
                        balance < 0 ? "text-error" : "text-success"
                      }`}
                    >
                      ₵{formatNumber(balance)}
                    </span>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* CTA: Agregar Movimiento */}
          <FadeIn delay={150} className="h-full">
            <Link
              href="/agregarMovimento"
              className="relative overflow-hidden bg-primary text-white rounded-lg shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 h-full flex lg:flex-col items-center lg:justify-center gap-4 p-4 sm:p-5 lg:p-7"
            >
              {/* Círculos decorativos */}
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10 pointer-events-none"></div>
              <div className="absolute -bottom-12 -left-8 w-28 h-28 rounded-full bg-white/5 pointer-events-none hidden lg:block"></div>

              <div className="bg-white/15 p-3 sm:p-4 rounded-full shrink-0 relative">
                <Plus className="w-7 h-7 sm:w-9 sm:h-9" />
              </div>
              <div className="flex-1 lg:flex-none lg:text-center relative">
                <h2 className="font-black text-lg sm:text-2xl">
                  Agregar Movimiento
                </h2>
                <p className="text-white/70 text-xs sm:text-sm mt-0.5">
                  Registra un ingreso o egreso
                </p>
              </div>
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 relative" />
            </Link>
          </FadeIn>
        </div>

        {/* Fila secundaria: Gastos Admin + Proyectos del Mes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          <div style={fadeStyle} className="h-full">
            <FadeIn delay={200} className="h-full">
              <GastosAdministrativosCard
                gastosAdmin={data.gastosAdmin}
                proyectosAdmin={data.proyectosAdmin}
              />
            </FadeIn>
          </div>

          <div style={fadeStyle} className="h-full">
            <FadeIn delay={250} className="h-full">
              <ProyectosDelMesCard />
            </FadeIn>
          </div>
        </div>

        {/* Accesos rápidos */}
        <div>
          <FadeIn delay={300}>
            <h2 className="text-xs sm:text-sm font-bold uppercase text-base-content/60">
              Accesos rápidos
            </h2>
          </FadeIn>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-3">
            {ACCESOS_RAPIDOS.map((acceso, idx) => {
              const Icon = acceso.icon;
              return (
                <FadeIn key={acceso.href} delay={350 + idx * 50}>
                  <Link
                    href={acceso.href}
                    className="bg-base-100 rounded-lg shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 h-full flex flex-col items-center text-center gap-2 p-3 sm:p-4"
                  >
                    <div className={`${acceso.iconBg} p-2 sm:p-2.5 rounded-lg`}>
                      <Icon
                        className={`w-5 h-5 sm:w-6 sm:h-6 ${acceso.iconColor}`}
                      />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold leading-tight">
                        {acceso.label}
                      </h3>
                      <p className="text-[10px] text-base-content/60 mt-0.5 hidden sm:block">
                        {acceso.desc}
                      </p>
                    </div>
                  </Link>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
