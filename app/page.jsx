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
  Landmark,
  Settings,
  ExternalLink,
  TriangleAlert,
  Percent,
} from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";
import InfoTip from "@/components/InfoTip";
import { obtenerDashboard, cambiarEstadoMes } from "@/lib/api";

/* =========================
   Formato de número consistente (evita mismatch de locale):
   punto para miles, coma solo para céntimos (1.234.567,89)
========================= */
function formatNumber(num) {
  return num.toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: "always",
  });
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
    label: "Control de Cuentas",
    desc: "Conciliación bancaria",
    icon: Landmark,
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
          Distribuido por peso presupuestario{" "}
          <InfoTip text="Cada gasto administrativo se reparte según el peso de cada proyecto: su presupuesto ÷ presupuesto total del mes." />
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
                  ₵{formatNumber(item.monto)}
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
   (acordeón por proyecto: desglose de egresos + estado)
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
        <div className="flex flex-col gap-2">
          {proyectos.map((proyecto) => {
            const egresos = proyecto.egresos ?? [];
            /* Resumen por categoría (una línea por categoría, no por egreso) */
            const porCategoria = Object.entries(
              egresos.reduce((acc, e) => {
                acc[e.categoria] = (acc[e.categoria] ?? 0) + e.monto;
                return acc;
              }, {})
            ).sort((a, b) => b[1] - a[1]);
            const totalEgresos = egresos.reduce((sum, e) => sum + e.monto, 0);
            return (
              <div
                key={proyecto.id ?? proyecto.nombre}
                className="collapse collapse-arrow bg-base-200 rounded-lg"
              >
                <input
                  type="checkbox"
                  aria-label={`Desplegar desglose de ${proyecto.nombre}`}
                />
                <div className="collapse-title min-h-0 py-3 pe-10">
                  <div className="flex items-center gap-2">
                    <div className="min-w-0 grow">
                      <div className="text-sm sm:text-base font-semibold truncate">
                        {proyecto.nombre}
                      </div>
                      <div className="text-xs uppercase font-semibold opacity-70 truncate">
                        {proyecto.bono} · ₵{formatNumber(proyecto.presupuesto ?? 0)}
                      </div>
                    </div>
                    {proyecto.estado && (
                      <span
                        className={`badge badge-sm shrink-0 ${
                          proyecto.estado === "Finalizado"
                            ? "badge-success"
                            : "badge-warning"
                        }`}
                      >
                        {proyecto.estado}
                      </span>
                    )}
                  </div>
                </div>
                <div className="collapse-content text-sm">
                  {porCategoria.length > 0 ? (
                    <ul className="flex flex-col divide-y divide-base-300">
                      {porCategoria.map(([categoria, monto]) => (
                        <li
                          key={categoria}
                          className="flex items-center justify-between gap-2 py-1.5"
                        >
                          <span className="text-xs font-semibold uppercase opacity-70">
                            {categoria}
                          </span>
                          <span className="font-bold text-error shrink-0">
                            ₵{formatNumber(monto)}
                          </span>
                        </li>
                      ))}
                      <li className="flex items-center justify-between gap-2 py-1.5 font-bold">
                        <span className="text-xs uppercase">Total egresos</span>
                        <span className="text-error">
                          ₵{formatNumber(totalEgresos)}
                        </span>
                      </li>
                    </ul>
                  ) : (
                    <p className="text-xs text-base-content/60 py-1">
                      Sin egresos registrados
                    </p>
                  )}
                  <div className="flex justify-end pt-2">
                    <Link
                      href={`/proyecto/${proyecto.id}`}
                      className="btn btn-ghost btn-xs gap-1 text-primary"
                      aria-label={`Ver detalle de ${proyecto.nombre}`}
                    >
                      Ver detalle
                      <ExternalLink size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
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
  presupuestoTotal: 0,
  estadoMes: null,
};

export default function Home() {
  const [mesIndex, setMesIndex] = useState(0);
  const [anio, setAnio] = useState(2025);
  const [isChanging, setIsChanging] = useState(false);
  const [data, setData] = useState(DATA_VACIA);
  const [listo, setListo] = useState(false);
  const [guardandoMes, setGuardandoMes] = useState(false);

  /* =========================
     Inicializar con el mes actual
     (en useEffect para evitar hydration mismatch)
  ========================= */
  useEffect(() => {
    const now = new Date();
    let mes = now.getMonth();
    let year = now.getFullYear();
    try {
      const raw = sessionStorage.getItem("homeMesSeleccion");
      if (raw) {
        const guardado = JSON.parse(raw);
        if (
          Number.isInteger(guardado.mesIndex) &&
          guardado.mesIndex >= 0 &&
          guardado.mesIndex <= 11 &&
          Number.isInteger(guardado.anio)
        ) {
          mes = guardado.mesIndex;
          year = guardado.anio;
        }
      }
    } catch {}
    setMesIndex(mes);
    setAnio(year);
    setListo(true);
  }, []);

  useEffect(() => {
    if (!listo) return;
    try {
      sessionStorage.setItem(
        "homeMesSeleccion",
        JSON.stringify({ mesIndex, anio })
      );
    } catch {}
  }, [mesIndex, anio, listo]);

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
     Abrir / cerrar el mes seleccionado (C4)
     Cerrar = marcar todos sus proyectos como Finalizado.
     Abrir = devolverlos a Revisión. Pide confirmación.
  ========================= */
  const cambiarEstadoMesHandler = async (nuevoEstado) => {
    if (!data.estadoMes || data.estadoMes === nuevoEstado) return;
    const cerrando = nuevoEstado === "Cerrado";
    const result = await Swal.fire({
      icon: "question",
      title: `¿${cerrando ? "Cerrar" : "Abrir"} el mes de ${MESES[mesIndex]}?`,
      text: cerrando
        ? "Todos los proyectos del mes quedarán marcados como Finalizado y no se podrán agregar movimientos."
        : "Los proyectos del mes volverán a estado Revisión y se podrán agregar movimientos.",
      showCancelButton: true,
      confirmButtonText: cerrando ? "Sí, cerrar" : "Sí, abrir",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#035496",
    });
    if (!result.isConfirmed) return;

    setGuardandoMes(true);
    try {
      await cambiarEstadoMes(MESES[mesIndex], String(anio), nuevoEstado);
      setData(await obtenerDashboard(MESES[mesIndex], String(anio)));
      Swal.fire({
        icon: "success",
        title: cerrando ? "Mes cerrado" : "Mes abierto",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No se pudo cambiar el estado del mes",
        text: error instanceof Error ? error.message : "Error desconocido",
      });
    } finally {
      setGuardandoMes(false);
    }
  };

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

            <div className="w-40 sm:w-64 flex flex-col items-center gap-1">
              <h1 className="text-2xl sm:text-4xl font-black text-center">
                {MESES[mesIndex]}
              </h1>
              {/* C4: estado del mes — el select abre/cierra el mes */}
              {data.estadoMes && (
                <select
                  value={data.estadoMes}
                  onChange={(e) => cambiarEstadoMesHandler(e.target.value)}
                  disabled={guardandoMes}
                  aria-label="Estado del mes (abrir o cerrar)"
                  className={`select select-xs sm:select-sm font-semibold ${
                    data.estadoMes === "Cerrado"
                      ? "select-success"
                      : "select-warning"
                  }`}
                >
                  <option value="En proceso">En proceso</option>
                  <option value="Cerrado">Cerrado</option>
                </select>
              )}
            </div>

            <button
              onClick={mesSiguiente}
              className="btn btn-ghost btn-circle btn-sm bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary dark:text-white dark:hover:bg-primary/80"
              aria-label="Mes siguiente"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </FadeIn>

        {/* Fila superior: Presupuesto total + % gastos administrativos */}
        <div
          style={fadeStyle}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5"
        >
          <FadeIn delay={50} className="h-full">
            <div className="w-full h-full bg-base-100 rounded-lg shadow-md p-4 sm:p-6 flex items-center gap-4">
              <div className="bg-info/10 p-3 rounded-lg shrink-0">
                <Wallet size={22} className="text-info" />
              </div>
              <div className="min-w-0">
                  <span className="text-[10px] sm:text-xs uppercase font-black text-base-content/70">
                    Presupuestado en {MESES[mesIndex]}{" "}
                    <InfoTip text="Suma de los presupuestos de todos los proyectos asignados a este mes." />
                  </span>
                <span className="block font-black text-2xl sm:text-3xl text-info leading-tight truncate">
                  ₵{formatNumber(data.presupuestoTotal)}
                </span>
                <p className="text-[10px] sm:text-xs text-base-content/60">
                  {data.proyectosDelMes.length}{" "}
                  {data.proyectosDelMes.length === 1
                    ? "proyecto"
                    : "proyectos"}
                </p>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={100} className="h-full sm:col-span-2">
            <div
              className={`w-full h-full rounded-lg shadow-md p-4 sm:p-6 flex flex-col justify-center gap-3 ${
                data.superaLimiteAdministrativo
                  ? "bg-warning/15 border-2 border-warning/40"
                  : "bg-base-100"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="bg-warning/10 p-3 rounded-lg shrink-0">
                    <Percent size={22} className="text-warning" />
                  </div>
                  <span className="text-[10px] sm:text-xs uppercase font-black text-base-content/70">
                    Gastos administrativos sobre presupuesto{" "}
                    <InfoTip text="Gastos administrativos del mes ÷ presupuesto total de los proyectos del mes." />
                  </span>
                </div>
                <div className="flex items-baseline gap-2 sm:gap-3 ms-auto">
                  <span className="font-black text-warning text-5xl sm:text-6xl leading-none">
                    {data.pctGastosAdministrativos.toFixed(2)}%
                  </span>
                  <span className="text-xs sm:text-sm text-base-content/70 font-semibold">
                    ₵{formatNumber(data.gastosAdministrativos)} de ₵
                    {formatNumber(data.presupuestoTotal)}
                  </span>
                </div>
              </div>
              <progress
                className={`progress w-full ${
                  data.superaLimiteAdministrativo
                    ? "progress-error"
                    : "progress-warning"
                }`}
                value={Math.min(data.pctGastosAdministrativos, 100)}
                max="100"
              ></progress>
            </div>
          </FadeIn>
        </div>

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
                    Gastado en {MESES[mesIndex]}{" "}
                    <InfoTip text="Suma de egresos (generales y administrativos) del mes." />
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
                      Has gastado el {pctGasto}% de lo ingresado{" "}
                      <InfoTip text="Egresos del mes ÷ ingresos del mes." />
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
