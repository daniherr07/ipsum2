"use client";

import { useState, useEffect, useRef } from "react";
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
import Swal from "sweetalert2";
import { obtenerDashboard } from "@/lib/api";

/* =========================
   Format number consistently (avoid locale mismatch)
========================= */
function formatNumber(num) {
  return Math.round(num).toLocaleString("en-US");
}

/* =========================
   FadeIn animation component
   (entrada suave: rise + scale + blur, easing moderno)
========================= */
function FadeIn({ children, delay = 0, className = "" }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Respeta usuarios con movimiento reducido
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShow(true);
      return;
    }
    const id = requestAnimationFrame(() => setShow(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      className={className}
      style={{
        opacity: show ? 1 : 0,
        transform: show
          ? "translateY(0) scale(1)"
          : "translateY(14px) scale(0.98)",
        filter: show ? "blur(0px)" : "blur(3px)",
        willChange: show ? "auto" : "opacity, transform, filter",
        transition: `opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, filter 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
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
function GastosAdministrativosCard({
  gastosAdmin,
  pctGastosAdmin,
  superaLimite,
  distribucion,
}) {
  const ratioPeriodo = pctGastosAdmin;

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
        <p className="text-[11px] sm:text-xs text-base-content/70 mt-1">
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
        {distribucion.length > 0 ? (
          distribucion.map((item) => (
            <div key={item.proyectoId} className="space-y-1">
              <div className="flex justify-between items-baseline gap-2">
                <span className="text-sm font-semibold text-base-content/80 truncate">
                  {item.nombre}
                </span>
                <span className="text-sm font-bold text-warning shrink-0">
                  ₵{formatNumber(Math.round(item.monto))}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <progress
                  className={`progress w-full ${
                    superaLimite ? "progress-error" : "progress-warning"
                  }`}
                  value={item.porcentaje}
                  max="100"
                ></progress>
                <span className="text-xs font-semibold text-base-content/60 w-11 text-right shrink-0">
                  {item.porcentaje.toFixed(1)}%
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-sm text-base-content/60">
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
function ProyectosDelMesCard({ proyectos }) {
  return (
    <div className="w-full h-full bg-base-100 flex flex-col gap-5 rounded-lg shadow-md p-5 sm:p-7">
      <div className="text-center">
        <span className="text-base-content text-sm sm:text-lg uppercase font-black">
          Proyectos del Mes
        </span>
      </div>

      {proyectos.length > 0 ? (
        <ul className="list bg-base-200 rounded-box">
          {proyectos.map((proyecto) => (
            <li className="list-row" key={proyecto.id ?? proyecto.nombre}>
              <div className="list-col-grow">
                <div className="text-sm sm:text-base">{proyecto.nombre}</div>
                <div className="text-xs uppercase font-semibold opacity-70">
                  {proyecto.tipo ?? proyecto.bono}
                </div>
              </div>
              <Link
                href={`/proyecto/${proyecto.id}`}
                className="btn btn-square btn-primary btn-sm sm:btn-md"
                aria-label={`Ver ${proyecto.nombre}`}
              >
                <ExternalLink size={18} />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-sm text-base-content/50">
          Sin proyectos asignados este mes
        </p>
      )}
    </div>
  );
}

const DATA_VACIA = {
  ingresos: 0,
  egresos: 0,
  balance: 0,
  pctGastado: 0,
  gastosAdministrativos: 0,
  pctGastosAdministrativos: 0,
  superaLimiteAdministrativo: false,
  distribucionGastosAdministrativos: [],
  proyectosDelMes: [],
};

export default function Home() {
  const [mesIndex, setMesIndex] = useState(0);
  const [anio, setAnio] = useState(2025);
  const [isChanging, setIsChanging] = useState(false);
  const [data, setData] = useState(DATA_VACIA);
  const [listo, setListo] = useState(false);

  /* =========================
     Inicializar con el mes actual
     (en useEffect para evitar hydration mismatch)
  ========================= */
  useEffect(() => {
    const now = new Date();
    setMesIndex(now.getMonth());
    setAnio(now.getFullYear());
    setListo(true);
  }, []);

  /* =========================
     Cargar el dashboard real del backend cada vez que cambia mes/año
  ========================= */
  useEffect(() => {
    if (!listo) return;
    obtenerDashboard(MESES[mesIndex], String(anio))
      .then(setData)
      .catch(() => {
        Swal.fire({
          icon: "error",
          title: "No se pudo cargar el resumen",
          text: "Verifica que el backend esté corriendo en localhost:4000",
        });
      });
  }, [mesIndex, anio, listo]);

  const balance = data.balance;
  const pctGasto = Math.round(data.pctGastado);

  /* =========================
     Fade al cambiar de mes
     (solo cuando el usuario navega, nunca al cargar)
  ========================= */
  const fadeTimer = useRef(null);
  const triggerFade = () => {
    if (fadeTimer.current) clearTimeout(fadeTimer.current);
    setIsChanging(true);
    fadeTimer.current = setTimeout(() => setIsChanging(false), 450);
  };

  useEffect(() => {
    return () => {
      if (fadeTimer.current) clearTimeout(fadeTimer.current);
    };
  }, []);

  /* =========================
     Navegación de meses
  ========================= */
  const mesAnterior = () => {
    triggerFade();
    if (mesIndex === 0) {
      setMesIndex(11);
      setAnio((a) => a - 1);
    } else {
      setMesIndex((m) => m - 1);
    }
  };

  const mesSiguiente = () => {
    triggerFade();
    if (mesIndex === 11) {
      setMesIndex(0);
      setAnio((a) => a + 1);
    } else {
      setMesIndex((m) => m + 1);
    }
  };

  const fadeStyle = {
    opacity: isChanging ? 0 : 1,
    transform: isChanging ? "translateY(10px)" : "translateY(0)",
    filter: isChanging ? "blur(2px)" : "blur(0px)",
    transition:
      "opacity 0.45s cubic-bezier(0.22, 1, 0.36, 1), transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), filter 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
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
              className="btn btn-ghost btn-circle btn-sm bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary dark:text-white dark:hover:bg-primary/80"
              aria-label="Mes anterior"
            >
              <ChevronLeft size={20} />
            </button>

            <h1 className="text-2xl sm:text-4xl font-black w-40 sm:w-64 text-center">
              {MESES[mesIndex]}
            </h1>

            <button
              onClick={mesSiguiente}
              className="btn btn-ghost btn-circle btn-sm bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary dark:text-white dark:hover:bg-primary/80"
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
                    <span className="text-[10px] sm:text-xs text-base-content/70">
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

          {/* CTA móvil: solo Agregar Movimiento */}
          <div style={fadeStyle} className="h-full lg:hidden">
            <FadeIn delay={150} className="h-full">
              <Link
                href="/agregarMovimento"
                className="relative overflow-hidden bg-primary text-white rounded-lg shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 h-full flex items-center gap-4 p-4 sm:p-5"
              >
                {/* Círculos decorativos */}
                <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10 pointer-events-none"></div>

                <div className="bg-white/15 p-3 sm:p-4 rounded-full shrink-0 relative">
                  <Plus className="w-7 h-7 sm:w-9 sm:h-9" />
                </div>
                <div className="flex-1 relative">
                  <h2 className="font-black text-lg sm:text-2xl">
                    Agregar Movimiento
                  </h2>
                  <p className="text-white/75 text-xs sm:text-sm mt-0.5">
                    Registra un ingreso o egreso
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 relative" />
              </Link>
            </FadeIn>
          </div>

          {/* CTAs escritorio: Agregar Movimiento + Agregar Proyecto (2 filas) */}
          <div style={fadeStyle} className="hidden lg:block h-full">
            <FadeIn delay={150} className="h-full">
              <div className="h-full flex flex-col gap-4">
                {/* Movimiento: sólido primario */}
                <Link
                  href="/agregarMovimento"
                  className="relative overflow-hidden bg-primary text-white rounded-lg shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 flex-1 flex items-center gap-4 p-5"
                >
                  {/* Círculo decorativo */}
                  <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-white/10 pointer-events-none"></div>

                  <div className="bg-white/15 p-3 rounded-full shrink-0 relative">
                    <Plus className="w-6 h-6" />
                  </div>
                  <div className="flex-1 relative">
                    <h2 className="font-black text-lg">Agregar Movimiento</h2>
                    <p className="text-white/75 text-xs mt-0.5">
                      Registra un ingreso o egreso
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 shrink-0 relative" />
                </Link>

                {/* Proyecto: sólido secundario (mismo estilo, color distinto) */}
                <Link
                  href="/agregarProyecto"
                  className="relative overflow-hidden bg-secondary text-white rounded-lg shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 flex-1 flex items-center gap-4 p-5"
                >
                  {/* Círculo decorativo */}
                  <div className="absolute -bottom-10 -left-10 w-28 h-28 rounded-full bg-white/10 pointer-events-none"></div>

                  <div className="bg-white/15 p-3 rounded-full shrink-0 relative">
                    <FolderPlus className="w-6 h-6" />
                  </div>
                  <div className="flex-1 relative">
                    <h2 className="font-black text-lg">Agregar Proyecto</h2>
                    <p className="text-white/75 text-xs mt-0.5">
                      Crea un nuevo proyecto
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 shrink-0 relative" />
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>

        {/* Fila secundaria: Gastos Admin + Proyectos del Mes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          <div style={fadeStyle} className="h-full">
            <FadeIn delay={200} className="h-full">
              <GastosAdministrativosCard
                gastosAdmin={data.gastosAdministrativos}
                pctGastosAdmin={data.pctGastosAdministrativos}
                superaLimite={data.superaLimiteAdministrativo}
                distribucion={data.distribucionGastosAdministrativos}
              />
            </FadeIn>
          </div>

          <div style={fadeStyle} className="h-full">
            <FadeIn delay={250} className="h-full">
              <ProyectosDelMesCard proyectos={data.proyectosDelMes} />
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
