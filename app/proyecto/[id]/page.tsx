"use client"

import React, { useState, useMemo, useEffect } from "react"
import { useParams } from "next/navigation"
import {
  ChevronLeft,
  Plus,
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  Building2,
  Calendar,
} from "lucide-react"
import Link from "next/link"
import Swal from "sweetalert2"
import { obtenerProyecto, listarMovimientos, type Proyecto, type Movimiento } from "@/lib/api"

/* =========================
   Helpers
   Formato consistente: punto para miles,
   coma solo para céntimos (₡1.234.567,89)
========================= */
const formatNumber = (value: number) =>
  value.toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: "always",
  })

const formatCurrency = (value: number) => `₡${formatNumber(value)}`

// Animated number hook
function useAnimatedNumber(target: number, duration = 1000) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    const steps = 30
    const increment = target / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      const done = increment > 0 ? current >= target : current <= target

      if (done) {
        setValue(target)
        clearInterval(timer)
      } else {
        setValue(Math.round(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [target, duration])

  return value
}

// FadeIn animation component
function FadeIn({ children, delay = 0, className = "" }: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const tid = setTimeout(() => setShow(true), delay)
    return () => clearTimeout(tid)
  }, [delay])

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
  )
}

/* =========================
   Paleta de segmentos (clases del tema:
   funcionan en claro y oscuro)
========================= */
const PALETA = [
  { dot: "bg-error", bar: "var(--error)", stroke: "stroke-error", text: "text-error" },
  { dot: "bg-warning", bar: "var(--warning)", stroke: "stroke-warning", text: "text-warning" },
  { dot: "bg-info", bar: "var(--info)", stroke: "stroke-info", text: "text-info" },
  { dot: "bg-success", bar: "var(--success)", stroke: "stroke-success", text: "text-success" },
  { dot: "bg-primary", bar: "var(--primary)", stroke: "stroke-primary", text: "text-primary" },
]

/* =========================
   Stat Card
========================= */
const COLOR_STYLES = {
  primary: { bg: "bg-primary/10", text: "text-primary" },
  success: { bg: "bg-success/10", text: "text-success" },
  error: { bg: "bg-error/10", text: "text-error" },
} as const

function StatCard({ icon: Icon, label, value, color, delay = 0, subtitle }: {
  icon: typeof TrendingUp
  label: string
  value: number
  color: keyof typeof COLOR_STYLES
  delay?: number
  subtitle?: string
}) {
  const animatedValue = useAnimatedNumber(value)
  const styles = COLOR_STYLES[color]

  return (
    <FadeIn delay={delay} className="h-full">
      <div className="bg-base-100 rounded-lg shadow-md p-3 sm:p-4 flex items-center gap-3 h-full">
        <div className={`${styles.bg} p-2 sm:p-2.5 rounded-lg shrink-0`}>
          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${styles.text}`} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] sm:text-xs uppercase font-bold text-base-content/60">
            {label}
          </p>
          <p className={`font-black text-sm sm:text-lg truncate ${styles.text}`}>
            {formatCurrency(animatedValue)}
          </p>
          {subtitle && (
            <p className="text-[10px] text-base-content/50">{subtitle}</p>
          )}
        </div>
      </div>
    </FadeIn>
  )
}

/* =========================
   Donut Chart (distribución de egresos)
========================= */
function DonutChart({ data }: { data: { nombre: string; monto: number }[] }) {
  const [progress, setProgress] = useState(0)
  const animKey = data.map((d) => d.monto).join(",")

  useEffect(() => {
    setProgress(0)
    let start: number | null = null
    let animId: number
    const duration = 900
    const animate = (ts: number) => {
      if (!start) start = ts
      const t = Math.min((ts - start) / duration, 1)
      setProgress(1 - Math.pow(1 - t, 3))
      if (t < 1) animId = requestAnimationFrame(animate)
    }
    const tid = setTimeout(() => {
      animId = requestAnimationFrame(animate)
    }, 200)
    return () => {
      clearTimeout(tid)
      cancelAnimationFrame(animId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animKey])

  const total = data.reduce((s, d) => s + d.monto, 0)
  if (total === 0) return null

  const R = 36
  const C = 2 * Math.PI * R
  let cumulative = 0
  const segments = data.map((d, i) => {
    const pct = d.monto / total
    const startAngle = cumulative * 360
    cumulative += pct
    return { ...d, pct, startAngle, color: PALETA[i % PALETA.length] }
  })

  return (
    <div className="flex flex-col items-center gap-3 pt-2">
      <svg width="140" height="140" viewBox="0 0 96 96">
        <circle
          cx="48"
          cy="48"
          r={R}
          fill="none"
          className="stroke-base-200"
          strokeWidth="14"
        />
        {segments.map((seg, i) => (
          <circle
            key={i}
            cx="48"
            cy="48"
            r={R}
            fill="none"
            className={seg.color.stroke}
            strokeWidth="14"
            strokeDasharray={`${seg.pct * C * progress} ${C}`}
            transform={`rotate(${seg.startAngle - 90} 48 48)`}
          />
        ))}
        <text
          x="48"
          y="45"
          textAnchor="middle"
          className="fill-base-content/50"
          style={{ fontSize: 7 }}
        >
          Total
        </text>
        <text
          x="48"
          y="54"
          textAnchor="middle"
          className="fill-base-content font-bold"
          style={{ fontSize: 8, fontWeight: 700 }}
        >
          {formatNumber(total)}
        </text>
      </svg>
      <ul className="w-full space-y-2">
        {segments.map((seg) => (
          <li
            key={seg.nombre}
            className="flex items-center justify-between gap-2 text-xs"
          >
            <span className="flex items-center gap-2 min-w-0">
              <span className={`shrink-0 w-2.5 h-2.5 rounded-full ${seg.color.dot}`} />
              <span className="font-medium truncate">{seg.nombre}</span>
            </span>
            <span className="flex items-center gap-2 shrink-0">
              <span className="text-base-content/50">{formatCurrency(seg.monto)}</span>
              <span className={`font-bold w-9 text-right ${seg.color.text}`}>
                {Math.round(seg.pct * 100)}%
              </span>
            </span>
          </li>
        ))}
      </ul>
      <div className="w-full border-t border-base-200 pt-2 flex justify-between text-xs font-semibold">
        <span className="text-base-content/60">Total egresos</span>
        <span className="text-error">{formatCurrency(total)}</span>
      </div>
    </div>
  )
}

export default function ProyectoPage() {
  const params = useParams()
  const id = params.id as string

  const [proyecto, setProyecto] = useState<Proyecto | null>(null)
  const [movimientos, setMovimientos] = useState<Movimiento[]>([])
  const [cargando, setCargando] = useState(true)
  const [activeTab, setActiveTab] = useState<"ingresos" | "egresos">("ingresos")

  useEffect(() => {
    Promise.all([obtenerProyecto(id), listarMovimientos({ proyectoId: id })])
      .then(([p, m]) => {
        setProyecto(p)
        setMovimientos(m)
      })
      .catch((error) => {
        Swal.fire({
          icon: "error",
          title: "No se pudo cargar el proyecto",
          text: error instanceof Error ? error.message : "Error desconocido",
        })
      })
      .finally(() => setCargando(false))
  }, [id])

  /* =========================
     Totales
  ========================= */
  const totales = useMemo(() => {
    const ingresos = movimientos
      .filter((t) => t.tipo === "ingreso")
      .reduce((s, t) => s + t.monto, 0)
    const egresos = movimientos
      .filter((t) => t.tipo === "egreso")
      .reduce((s, t) => s + t.monto, 0)
    const presupuesto = proyecto?.presupuesto ?? 0
    return {
      ingresos,
      egresos,
      disponible: presupuesto - egresos,
      pctUso: presupuesto > 0 ? Math.round((egresos / presupuesto) * 100) : 0,
    }
  }, [movimientos, proyecto])

  /* =========================
     Desglose de egresos por categoría
  ========================= */
  const egresoCategorias = useMemo(() => {
    const map: Record<string, { monto: number; count: number }> = {}
    movimientos
      .filter((t) => t.tipo === "egreso")
      .forEach((t) => {
        const nombre =
          t.tipo === "egreso" && t.tipoEgreso === "egreso-administrativo"
            ? "Egreso Administrativo"
            : t.tipo === "egreso"
              ? t.categoria || "Otros"
              : "Otros"
        if (!map[nombre]) map[nombre] = { monto: 0, count: 0 }
        map[nombre].monto += t.monto
        map[nombre].count += 1
      })
    return Object.entries(map)
      .map(([nombre, d]) => ({ nombre, ...d }))
      .sort((a, b) => b.monto - a.monto)
  }, [movimientos])

  const donutData = useMemo(
    () => egresoCategorias.map((c) => ({ nombre: c.nombre, monto: c.monto })),
    [egresoCategorias],
  )

  const movimientosFiltrados = useMemo(() => {
    const tipoFiltro = activeTab === "ingresos" ? "ingreso" : "egreso"
    return movimientos.filter((t) => t.tipo === tipoFiltro)
  }, [activeTab, movimientos])

  const conteos = useMemo(
    () => ({
      ingresos: movimientos.filter((t) => t.tipo === "ingreso").length,
      egresos: movimientos.filter((t) => t.tipo === "egreso").length,
    }),
    [movimientos],
  )

  if (cargando) {
    return (
      <div className="min-h-[calc(100svh-64px)] bg-base-200 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    )
  }

  if (!proyecto) {
    return (
      <div className="min-h-[calc(100svh-64px)] bg-base-200 flex flex-col items-center justify-center gap-3">
        <p className="font-bold">Proyecto no encontrado</p>
        <Link href="/proyectos" className="btn btn-primary btn-sm rounded-full">
          Volver a Proyectos
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100svh-64px)] bg-base-200 p-3 sm:p-4 lg:p-6">
      <div className="max-w-6xl mx-auto flex flex-col gap-4 sm:gap-5">
        {/* Header: volver + título + CTA */}
        <FadeIn delay={0} className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link
              href="/proyectos"
              className="btn btn-ghost btn-circle btn-sm sm:btn-md shrink-0"
              aria-label="Volver a proyectos"
            >
              <ChevronLeft size={22} />
            </Link>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-black truncate">
                Detalle de Proyecto
              </h1>
              <p className="text-xs sm:text-sm text-base-content/60">
                Resumen financiero y movimientos
              </p>
            </div>
          </div>

          <Link
            href="/agregarMovimento"
            className="btn btn-primary btn-circle btn-sm sm:btn-md sm:rounded-full sm:w-auto gap-1 sm:px-4 shrink-0"
            aria-label="Agregar movimiento"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Agregar Movimiento</span>
          </Link>
        </FadeIn>

        {/* Card del Proyecto */}
        <FadeIn delay={50} className="bg-base-100 rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2.5 sm:p-3 rounded-lg shrink-0">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-black text-lg sm:text-2xl text-primary leading-tight">
                  {proyecto.nombre}
                </h2>
                <p className="text-xs sm:text-sm text-base-content/60 mt-1 flex items-center gap-1.5">
                  <Calendar size={13} className="shrink-0" />
                  Asignación: {proyecto.mesAsignacion} {proyecto.anioAsignacion}
                </p>
              </div>
              <span
                className={`badge badge-sm sm:badge-md shrink-0 ${
                  proyecto.estado === "Finalizado" ? "badge-success" : "badge-warning"
                }`}
              >
                {proyecto.estado}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] uppercase font-bold text-base-content/50">
                  Bono
                </p>
                <p className="text-xs sm:text-sm font-semibold">{proyecto.bono}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-base-content/50">
                  Subtipo de Bono
                </p>
                <p className="text-xs sm:text-sm font-semibold">
                  {proyecto.subtipoBono}
                </p>
              </div>
            </div>

            {/* Progreso de presupuesto */}
            <div>
              <div className="flex justify-between text-xs sm:text-sm mb-1">
                <span className="text-base-content/60">Presupuesto utilizado</span>
                <span className="font-bold">{totales.pctUso}%</span>
              </div>
              <progress
                className="progress progress-primary w-full h-2"
                value={totales.egresos}
                max={proyecto.presupuesto}
              />
              <div className="flex justify-between text-[11px] sm:text-xs mt-1 text-base-content/60">
                <span>Gastado: {formatCurrency(totales.egresos)}</span>
                <span>Disponible: {formatCurrency(totales.disponible)}</span>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Stat Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            icon={Wallet}
            label="Presupuesto"
            value={proyecto.presupuesto}
            color="primary"
            delay={100}
          />
          <StatCard
            icon={TrendingUp}
            label="Ingresos"
            value={totales.ingresos}
            color="success"
            delay={150}
            subtitle={`${conteos.ingresos} movimientos`}
          />
          <StatCard
            icon={TrendingDown}
            label="Egresos"
            value={totales.egresos}
            color="error"
            delay={200}
            subtitle={`${conteos.egresos} movimientos`}
          />
          <StatCard
            icon={PiggyBank}
            label="Disponible"
            value={totales.disponible}
            color={totales.disponible >= 0 ? "success" : "error"}
            delay={250}
            subtitle={`${totales.pctUso}% utilizado`}
          />
        </section>

        {/* Desglose + Distribución */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          {/* Desglose de egresos */}
          <FadeIn delay={300} className="bg-base-100 rounded-lg shadow-md p-4 sm:p-5 h-full">
            <h2 className="font-bold text-sm sm:text-base">
              Desglose de Egresos
            </h2>
            {egresoCategorias.length > 0 ? (
              <ul className="space-y-3 mt-3">
                {egresoCategorias.map((cat, idx) => {
                  const pct = totales.egresos > 0 ? Math.round((cat.monto / totales.egresos) * 100) : 0
                  const color = PALETA[idx % PALETA.length]
                  return (
                    <li key={cat.nombre}>
                      <div className="flex justify-between items-center text-xs sm:text-sm mb-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${color.dot}`} />
                          <span className="font-medium truncate">{cat.nombre}</span>
                          <span className="text-base-content/40 text-xs shrink-0">
                            ({cat.count} mov.)
                          </span>
                        </div>
                        <span className="font-semibold text-error shrink-0">
                          {formatCurrency(cat.monto)}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-base-200">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, backgroundColor: color.bar }}
                        />
                      </div>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="text-center text-sm text-base-content/50 mt-3">
                Sin egresos todavía
              </p>
            )}
          </FadeIn>

          {/* Distribución (donut) */}
          <FadeIn delay={350} className="bg-base-100 rounded-lg shadow-md p-4 sm:p-5 h-full">
            <h2 className="font-bold text-sm sm:text-base">
              Distribución de Egresos
            </h2>
            <DonutChart data={donutData} />
          </FadeIn>
        </section>

        {/* Movimientos con tabs */}
        <FadeIn delay={400} className="bg-base-100 rounded-lg shadow-md overflow-hidden">
          {/* Tabs segmentados */}
          <div className="p-3 sm:p-4 pb-0">
            <div className="join w-full">
              <button
                type="button"
                onClick={() => setActiveTab("ingresos")}
                className={`btn btn-sm sm:btn-md join-item flex-1 gap-2 ${
                  activeTab === "ingresos" ? "btn-success" : ""
                }`}
              >
                <TrendingUp size={16} />
                Ingresos
                <span
                  className={`badge badge-xs ${
                    activeTab === "ingresos" ? "badge-ghost" : "badge-outline"
                  }`}
                >
                  {conteos.ingresos}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("egresos")}
                className={`btn btn-sm sm:btn-md join-item flex-1 gap-2 ${
                  activeTab === "egresos" ? "btn-error" : ""
                }`}
              >
                <TrendingDown size={16} />
                Egresos
                <span
                  className={`badge badge-xs ${
                    activeTab === "egresos" ? "badge-ghost" : "badge-outline"
                  }`}
                >
                  {conteos.egresos}
                </span>
              </button>
            </div>
          </div>

          {/* Lista de movimientos */}
          {movimientosFiltrados.length > 0 ? (
            <ul className="divide-y divide-base-200 mt-3">
              {movimientosFiltrados.map((mov) => {
                const esIngreso = mov.tipo === "ingreso"
                return (
                  <li
                    key={mov.id}
                    className="flex items-center gap-3 p-3 sm:p-4 hover:bg-base-200/60 transition-colors"
                  >
                    {/* Icono por tipo */}
                    <div
                      className={`p-2 sm:p-2.5 rounded-full shrink-0 ${
                        esIngreso ? "bg-success/10" : "bg-error/10"
                      }`}
                    >
                      {esIngreso ? (
                        <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
                      ) : (
                        <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-error" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm sm:text-base truncate">
                        {esIngreso ? mov.nombreIngreso : mov.descripcion}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                        {esIngreso ? (
                          <>
                            <span className="text-[11px] text-base-content/60 shrink-0">
                              {mov.fechaPago}
                            </span>
                            <span className="hidden sm:inline text-[11px] text-base-content/50 truncate">
                              {mov.descripcion}
                            </span>
                          </>
                        ) : (
                          <>
                            <span
                              className={`badge badge-xs shrink-0 ${
                                mov.tipoEgreso === "egreso-administrativo"
                                  ? "badge-warning"
                                  : "badge-error"
                              }`}
                            >
                              {mov.tipoEgreso === "egreso-general"
                                ? "Egreso General"
                                : "Egreso Administrativo"}
                            </span>
                            <span className="text-[11px] text-base-content/60 truncate">
                              {mov.tipoEgreso === "egreso-administrativo"
                                ? `${mov.mes} ${mov.ano}`
                                : [mov.categoria, mov.ordenCompra]
                                    .filter(Boolean)
                                    .join(" · ")}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Monto */}
                    <p
                      className={`font-black text-sm sm:text-base shrink-0 ${
                        esIngreso ? "text-success" : "text-error"
                      }`}
                    >
                      {esIngreso ? "+" : "-"}
                      {formatCurrency(mov.monto)}
                    </p>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="text-center text-sm text-base-content/50 py-8">
              Sin movimientos de este tipo todavía
            </p>
          )}
        </FadeIn>
      </div>
    </div>
  )
}
