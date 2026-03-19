"use client"

import React, { useState, useEffect, useMemo } from "react"
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Wallet,
  Building2,
  BarChart3,
  PieChart,
  Users,
  Calculator,
  Target,
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"

/* ─── Types ─── */
type Proyecto = {
  id: string
  nombre: string
  estado: "activo" | "completado" | "pausado"
  ingresos: number
  egresos: number
  gastosAdmin: number
  gastosMateriales: number
  avance: number // 0-100
  mes: string
}

type CostoAdmin = {
  nombre: string
  monto: number
  porcentaje: number
}

type MesResumen = {
  mes: string
  costoAdmin: number
  ingresosProyectos: number
}

/* ─── Data ─── */
const PROYECTOS: Proyecto[] = [
  { id: "1", nombre: "Residencial Los Robles",   estado: "activo",     ingresos: 12500000, egresos: 9800000,  gastosAdmin: 1450000, gastosMateriales: 5200000, avance: 65, mes: "Enero" },
  { id: "2", nombre: "Casa Montaña Escazú",      estado: "activo",     ingresos: 8200000,  egresos: 6100000,  gastosAdmin: 920000,  gastosMateriales: 3400000, avance: 40, mes: "Febrero" },
  { id: "3", nombre: "Condominio Vista Verde",    estado: "completado", ingresos: 18000000, egresos: 14200000, gastosAdmin: 2100000, gastosMateriales: 8100000, avance: 100, mes: "Marzo" },
  { id: "4", nombre: "Remodelación San José",     estado: "pausado",    ingresos: 3500000,  egresos: 3200000,  gastosAdmin: 480000,  gastosMateriales: 1800000, avance: 30, mes: "Abril" },
  { id: "5", nombre: "Casa Playa Guanacaste",     estado: "activo",     ingresos: 15800000, egresos: 11500000, gastosAdmin: 1780000, gastosMateriales: 6300000, avance: 55, mes: "Mayo" },
  { id: "6", nombre: "Townhouse Heredia",         estado: "completado", ingresos: 9600000,  egresos: 7900000,  gastosAdmin: 1050000, gastosMateriales: 4500000, avance: 100, mes: "Junio" },
]

const COSTOS_ADMIN: CostoAdmin[] = [
  { nombre: "Salarios",       monto: 3200000, porcentaje: 41 },
  { nombre: "Permisos y legal", monto: 1450000, porcentaje: 19 },
  { nombre: "Transporte",     monto: 980000,  porcentaje: 13 },
  { nombre: "Seguros",        monto: 860000,  porcentaje: 11 },
  { nombre: "Oficina y admin", monto: 750000,  porcentaje: 10 },
  { nombre: "Otros",          monto: 540000,  porcentaje: 6 },
]

const MENSUAL: MesResumen[] = [
  { mes: "Ago", costoAdmin: 1100000, ingresosProyectos: 5200000 },
  { mes: "Sep", costoAdmin: 1250000, ingresosProyectos: 6100000 },
  { mes: "Oct", costoAdmin: 1180000, ingresosProyectos: 4800000 },
  { mes: "Nov", costoAdmin: 1320000, ingresosProyectos: 7200000 },
  { mes: "Dic", costoAdmin: 1450000, ingresosProyectos: 5500000 },
  { mes: "Ene", costoAdmin: 1480000, ingresosProyectos: 6800000 },
]

/* ─── Helpers ─── */
const fmt = (v: number) => `₵${Math.abs(v).toLocaleString("es-CR")}`
const fmtCompact = (v: number) => {
  if (Math.abs(v) >= 1_000_000) return `₵${(v / 1_000_000).toFixed(1)}M`
  if (Math.abs(v) >= 1_000)     return `₵${(v / 1_000).toFixed(0)}K`
  return `${v}`
}

/* ─── Hooks ─── */
function useAnimatedNumber(target: number, duration = 1000) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    const steps = 30
    const increment = target / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      const done = increment > 0 ? current >= target : current <= target
      if (done) { setValue(target); clearInterval(timer) }
      else      { setValue(Math.round(current)) }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [target, duration])

  return value
}

function useDelayedState<T>(initial: T, target: T, delay: number) {
  const [value, setValue] = useState(initial)
  useEffect(() => {
    const id = setTimeout(() => setValue(target), delay)
    return () => clearTimeout(id)
  }, [target, delay])
  return value
}

/* ─── Shared components ─── */
function FadeIn({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string
}) {
  const [show, setShow] = useState(false)
  useEffect(() => { const id = setTimeout(() => setShow(true), delay); return () => clearTimeout(id) }, [delay])

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

/* ─── KPI Card ─── */
function KpiCard({ icon: Icon, label, value, suffix = "", colorClass, delay = 0 }: {
  icon: typeof TrendingUp; label: string; value: number; suffix?: string; colorClass: string; delay?: number
}) {
  const animated = useAnimatedNumber(value)
  const [show, setShow] = useState(false)
  useEffect(() => { const id = setTimeout(() => setShow(true), delay); return () => clearTimeout(id) }, [delay])

  return (
    <div
      className="card bg-base-100 shadow-md hover:shadow-xl transition-all duration-500"
      style={{
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 0.4s ease-out, transform 0.4s ease-out, box-shadow 0.3s",
      }}
    >
      <div className="card-body p-4 lg:p-5">
        <div className={`flex items-center gap-2 ${colorClass}`}>
          <Icon className="size-5" />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span className={`text-xl lg:text-2xl font-bold ${colorClass}`}>
          {suffix === "%" ? `${animated}%` : fmtCompact(animated)}
        </span>
      </div>
    </div>
  )
}

/* ─── Horizontal stacked bar (admin chart) ─── */
function AdminBarChart({ data }: { data: MesResumen[] }) {
  const [progress, setProgress] = useState(0)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const containerRef = React.useRef<HTMLDivElement>(null)

  useEffect(() => {
    let start: number | null = null
    let animId: number
    const dur = 1200
    const animate = (ts: number) => {
      if (!start) start = ts
      const t = Math.min((ts - start) / dur, 1)
      setProgress(1 - Math.pow(1 - t, 3))
      if (t < 1) animId = requestAnimationFrame(animate)
    }
    const delay = setTimeout(() => { animId = requestAnimationFrame(animate) }, 400)
    return () => { clearTimeout(delay); cancelAnimationFrame(animId) }
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect
      setSize({ width, height })
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const chart = useMemo(() => {
    if (!size.width || !size.height) return null
    const allVals = data.flatMap(d => [d.costoAdmin, d.ingresosProyectos])
    const max = Math.max(...allVals)
    const min = 0
    const pad = { top: 8, bottom: 8 }
    const ch = size.height - pad.top - pad.bottom
    const norm = (v: number) => pad.top + ch - ((v - min) / (max - min)) * ch

    const adminPts = data.map((d, i) => ({ x: (i / (data.length - 1)) * size.width, y: norm(d.costoAdmin) }))
    const ingPts   = data.map((d, i) => ({ x: (i / (data.length - 1)) * size.width, y: norm(d.ingresosProyectos) }))

    const toPath = (pts: { x: number; y: number }[]) => pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ")
    const toArea = (pts: { x: number; y: number }[]) => `${toPath(pts)} L${size.width},${size.height} L0,${size.height} Z`

    return {
      adminPts, ingPts,
      adminPath: toPath(adminPts), ingPath: toPath(ingPts),
      adminArea: toArea(adminPts), ingArea: toArea(ingPts),
    }
  }, [data, size])

  return (
    <div className="flex flex-col h-full gap-2">
      <div ref={containerRef} className="flex-1 min-h-0 relative">
        {chart && (
          <svg width={size.width} height={size.height} className="absolute inset-0">
            <defs>
              <linearGradient id="gradAdmin" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" className="text-warning" stopColor="currentColor" stopOpacity="0.35" />
                <stop offset="100%" className="text-warning" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="gradIng" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" className="text-success" stopColor="currentColor" stopOpacity="0.3" />
                <stop offset="100%" className="text-success" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
              <clipPath id="adminClip">
                <rect x="0" y="0" width={size.width * progress} height={size.height} />
              </clipPath>
            </defs>

            {[0.25, 0.5, 0.75].map(p => (
              <line key={p} x1="0" y1={size.height * p} x2={size.width} y2={size.height * p} className="stroke-base-content/10" strokeWidth="1" />
            ))}

            <g clipPath="url(#adminClip)">
              <path d={chart.ingArea} fill="url(#gradIng)" />
              <path d={chart.adminArea} fill="url(#gradAdmin)" />
              <path d={chart.ingPath} fill="none" className="stroke-success" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d={chart.adminPath} fill="none" className="stroke-warning" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              {chart.ingPts.map((p, i) => <circle key={`i${i}`} cx={p.x} cy={p.y} r="5" className="fill-success" />)}
              {chart.adminPts.map((p, i) => <circle key={`a${i}`} cx={p.x} cy={p.y} r="5" className="fill-warning" />)}
            </g>
          </svg>
        )}
      </div>
      <div className="flex justify-between shrink-0 px-1">
        {data.map(d => <span key={d.mes} className="text-xs text-base-content/60">{d.mes}</span>)}
      </div>
    </div>
  )
}

/* ─── Radial KPI ─── */
function RadialKpi({ label, value, color }: { label: string; value: number; color: string }) {
  const animated = useDelayedState(0, value, 300)
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`radial-progress ${color}`}
        style={{ "--value": animated, "--size": "4.5rem", "--thickness": "5px" } as React.CSSProperties}
        role="progressbar"
        aria-valuenow={animated}
      >
        <span className="text-sm font-bold">{animated}%</span>
      </div>
      <span className="text-xs text-base-content/70 text-center">{label}</span>
    </div>
  )
}

/* ─── Project Row ─── */
function ProjectRow({ proyecto, index }: { proyecto: Proyecto; index: number }) {
  const margen = proyecto.ingresos - proyecto.egresos
  const rentabilidad = Math.round((margen / proyecto.ingresos) * 100)
  const estadoBadge: Record<string, string> = {
    activo: "badge-success",
    completado: "badge-info",
    pausado: "badge-warning",
  }
  const estadoIcon: Record<string, typeof CheckCircle2> = {
    activo: Activity,
    completado: CheckCircle2,
    pausado: Clock,
  }
  const IconEstado = estadoIcon[proyecto.estado]
  const barWidth = useDelayedState(0, proyecto.avance, 200 + index * 120)

  return (
    <li className="list-row">
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm lg:text-base truncate">{proyecto.nombre}</span>
          <span className={`badge badge-sm ${estadoBadge[proyecto.estado]} gap-1`}>
            <IconEstado className="size-3" />
            {proyecto.estado}
          </span>
        </div>

        <div className="flex items-center gap-3 flex-wrap text-xs text-base-content/70">
          <span className="text-success font-medium">+{fmtCompact(proyecto.ingresos)}</span>
          <span className="text-error font-medium">-{fmtCompact(proyecto.egresos)}</span>
          <span className={`font-bold ${rentabilidad >= 0 ? "text-success" : "text-error"}`}>
            {rentabilidad}% rent.
          </span>
          <span>{proyecto.mes}</span>
        </div>

        <progress
          className="progress progress-primary w-full h-1.5"
          value={barWidth}
          max="100"
        />
      </div>

      <div className="flex items-center">
        <span className="text-xs text-base-content/50">{proyecto.avance}%</span>
      </div>
    </li>
  )
}

/* ─── Admin Cost Item ─── */
function CostItem({ cost, index }: { cost: CostoAdmin; index: number }) {
  const w = useDelayedState(0, cost.porcentaje, 100 + index * 100)
  return (
    <li>
      <div className="flex justify-between text-xs lg:text-sm mb-1">
        <span className="font-medium">{cost.nombre}</span>
        <span className="font-semibold text-warning">{fmt(cost.monto)}</span>
      </div>
      <progress className="progress progress-warning w-full h-1.5 lg:h-2" value={w} max="100" />
    </li>
  )
}

/* ─── Promedios ponderados ─── */
function WeightedAverages({ proyectos }: { proyectos: Proyecto[] }) {
  const totalIngresos = proyectos.reduce((s, p) => s + p.ingresos, 0)
  const totalEgresos  = proyectos.reduce((s, p) => s + p.egresos, 0)
  const numProyectos  = proyectos.length

  // Ratio entre Ingresos y Egresos
  const ratioIngEgr = (totalIngresos / totalEgresos).toFixed(2)

  // Promedio de Ingresos por mes
  const promIngresosMes = Math.round(totalIngresos / numProyectos)

  // Promedio de Egresos por mes
  const promEgresosMes = Math.round(totalEgresos / numProyectos)

  return (
    <div className="stats stats-vertical w-full bg-base-100">
      <div className="stat p-3 lg:p-4">
        <div className="stat-figure text-primary">
          <Calculator className="size-6" />
        </div>
        <div className="stat-title text-xs">Ratio Ingresos / Egresos</div>
        <div className="stat-value text-lg lg:text-xl text-primary">
          {ratioIngEgr}
        </div>
        <div className="stat-desc text-xs">Por cada ₵1 de egreso</div>
      </div>
      <div className="stat p-3 lg:p-4">
        <div className="stat-figure text-success">
          <TrendingUp className="size-6" />
        </div>
        <div className="stat-title text-xs">Prom. Ingresos / Mes</div>
        <div className="stat-value text-lg lg:text-xl text-success">{fmtCompact(promIngresosMes)}</div>
        <div className="stat-desc text-xs">Promedio mensual</div>
      </div>
      <div className="stat p-3 lg:p-4">
        <div className="stat-figure text-error">
          <TrendingDown className="size-6" />
        </div>
        <div className="stat-title text-xs">Prom. Egresos / Mes</div>
        <div className="stat-value text-lg lg:text-xl text-error">{fmtCompact(promEgresosMes)}</div>
        <div className="stat-desc text-xs">Promedio mensual</div>
      </div>
    </div>
  )
}

/* ─── Main page ─── */
export default function StatsV2Page() {
  const totalIngresos  = useMemo(() => PROYECTOS.reduce((s, p) => s + p.ingresos, 0), [])
  const totalEgresos   = useMemo(() => PROYECTOS.reduce((s, p) => s + p.egresos, 0), [])
  const totalAdmin     = useMemo(() => PROYECTOS.reduce((s, p) => s + p.gastosAdmin, 0), [])
  const activos        = useMemo(() => PROYECTOS.filter(p => p.estado === "activo").length, [])
  const completados    = useMemo(() => PROYECTOS.filter(p => p.estado === "completado").length, [])
  const pausados       = useMemo(() => PROYECTOS.filter(p => p.estado === "pausado").length, [])
  const rentabilidadGlobal = useMemo(() => Math.round(((totalIngresos - totalEgresos) / totalIngresos) * 100), [totalIngresos, totalEgresos])

  return (
    <div className="h-svh flex flex-col bg-base-200 overflow-hidden">
      {/* Header */}
      <header className="navbar bg-primary text-primary-content shadow-lg shrink-0">
        <div className="navbar-start">
          <Link href="/" className="btn btn-ghost btn-circle">
            <ArrowLeft className="size-5" />
          </Link>
        </div>
        <div className="navbar-center">
          <span className="text-lg font-bold">Stats Administrativos</span>
        </div>
        <div className="navbar-end">
          <Link href="/stats" className="btn btn-ghost btn-sm gap-1">
            <BarChart3 className="size-4" />
            <span className="hidden sm:inline">Stats V1</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto flex flex-col gap-4 lg:gap-5">

          {/* ── KPI Cards ── */}
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4">
            <KpiCard icon={Building2}    label="Proyectos Activos" value={activos}           colorClass="text-primary"  delay={0} />
            <KpiCard icon={TrendingUp}   label="Ingresos Totales"  value={totalIngresos}     colorClass="text-success"  delay={80} />
            <KpiCard icon={TrendingDown} label="Egresos Totales"   value={totalEgresos}      colorClass="text-error"    delay={160} />
            <KpiCard icon={Wallet}       label="Rentabilidad"      value={rentabilidadGlobal} colorClass={rentabilidadGlobal >= 0 ? "text-success" : "text-error"} delay={240} suffix="%" />
          </section>

          {/* ── Chart: Admin vs Ingresos ── */}
          <FadeIn delay={200} className="card bg-base-100 shadow-md">
            <div className="card-body p-4 lg:p-5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="card-title text-sm lg:text-base">Costos Admin vs Ingresos Mensuales</h2>
                <div className="flex gap-2">
                  <span className="badge badge-success badge-sm">Ingresos</span>
                  <span className="badge badge-warning badge-sm">Admin</span>
                </div>
              </div>
              <div className="h-40 lg:h-52 mt-3">
                <AdminBarChart data={MENSUAL} />
              </div>
            </div>
          </FadeIn>

          {/* ── Projects Section + Promedios Ponderados ── */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-5">
            {/* Projects list */}
            <FadeIn delay={300} className="lg:col-span-2 card bg-base-100 shadow-md">
              <div className="card-body p-4 lg:p-5">
                <div className="flex items-center justify-between">
                  <h2 className="card-title text-sm lg:text-base gap-2">
                    <Building2 className="size-4" />
                    Proyectos
                  </h2>
                  <div className="flex gap-1">
                    <span className="badge badge-success badge-sm">{activos} activos</span>
                    <span className="badge badge-info badge-sm">{completados} listos</span>
                    <span className="badge badge-warning badge-sm">{pausados} pausa</span>
                  </div>
                </div>

                <ul className="list mt-2">
                  {PROYECTOS.map((p, i) => (
                    <ProjectRow key={p.id} proyecto={p} index={i} />
                  ))}
                </ul>
              </div>
            </FadeIn>

            {/* Promedios ponderados */}
            <FadeIn delay={350} className="card bg-base-100 shadow-md">
              <div className="card-body p-4 lg:p-5">
                <h2 className="card-title text-sm lg:text-base gap-2">
                  <Calculator className="size-4" />
                  Promedios Ponderados
                </h2>
                <WeightedAverages proyectos={PROYECTOS} />
              </div>
            </FadeIn>
          </section>

          {/* ── Admin Costs + Radial KPIs ── */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-5">
            {/* Desglose costos admin */}
            <FadeIn delay={400} className="card bg-base-100 shadow-md">
              <div className="card-body p-4 lg:p-5">
                <h2 className="card-title text-sm lg:text-base gap-2">
                  <PieChart className="size-4" />
                  Desglose Gastos Administrativos
                </h2>
                <p className="text-xs text-base-content/60">Total: {fmt(totalAdmin)}</p>
                <ul className="space-y-2 lg:space-y-3 mt-2">
                  {COSTOS_ADMIN.map((c, i) => (
                    <CostItem key={c.nombre} cost={c} index={i} />
                  ))}
                </ul>
              </div>
            </FadeIn>

            {/* Radial KPIs */}
            <FadeIn delay={450} className="card bg-base-100 shadow-md">
              <div className="card-body p-4 lg:p-5">
                <h2 className="card-title text-sm lg:text-base gap-2">
                  <Activity className="size-4" />
                  Indicadores
                </h2>
                <div className="stats stats-vertical w-full bg-base-100 mt-3">
                  <div className="stat p-2 lg:p-3">
                    <div className="stat-title text-xs">Proyecto con más gastos administrativos</div>
                    <div className="stat-value text-warning text-base lg:text-lg">Vista Verde</div>
                    <div className="stat-desc text-xs">₵2,100,000 en admin</div>
                  </div>
                  <div className="stat p-2 lg:p-3">
                    <div className="stat-title text-xs">Proyecto con más ingresos</div>
                    <div className="stat-value text-success text-base lg:text-lg">Vista Verde</div>
                    <div className="stat-desc text-xs">₵18,000,000 en ingresos</div>
                  </div>
                  <div className="stat p-2 lg:p-3">
                    <div className="stat-title text-xs">Proyecto con más gastos materiales</div>
                    <div className="stat-value text-error text-base lg:text-lg">Vista Verde</div>
                    <div className="stat-desc text-xs">₵8,100,000 en materiales</div>
                  </div>
                  <div className="stat p-2 lg:p-3">
                    <div className="stat-title text-xs">Proyecto con menos gastos</div>
                    <div className="stat-value text-info text-base lg:text-lg">Remodelación San José</div>
                    <div className="stat-desc text-xs">₵3,200,000 en egresos</div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </section>

        </div>
      </main>
    </div>
  )
}
