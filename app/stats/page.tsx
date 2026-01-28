"use client"

import React, { useState, useEffect, useMemo } from "react"
import { ArrowLeft, TrendingUp, TrendingDown, Wallet } from "lucide-react"
import Link from "next/link"
import NavBar from "@/components/navbar/NavBar"

type MonthData = { mes: string; ingresos: number; egresos: number }
type CategoryData = { nombre: string; monto: number; tipo: "ingreso" | "egreso" }

const DATA = {
  ingresos: 450970,
  egresos: 900780,
  get balance() { return this.ingresos - this.egresos },
  
  categorias: [
    { nombre: "Administrativos", monto: -560000, tipo: "egreso" },
    { nombre: "Proyectos", monto: 275000, tipo: "ingreso" },
    { nombre: "Servicios", monto: -180000, tipo: "egreso" },
    { nombre: "Otros", monto: -15000, tipo: "egreso" },
  ] as CategoryData[],
  
  mensual: [
    { mes: "Ago", ingresos: 320000, egresos: 280000 },
    { mes: "Sep", ingresos: 380000, egresos: 420000 },
    { mes: "Oct", ingresos: 290000, egresos: 350000 },
    { mes: "Nov", ingresos: 450000, egresos: 380000 },
    { mes: "Dic", ingresos: 520000, egresos: 610000 },
    { mes: "Ene", ingresos: 450970, egresos: 900780 },
  ] as MonthData[],
}

const formatCurrency = (value: number) => {
  const prefix = value >= 0 ? "+" : ""
  return `₵ ${prefix}${Math.abs(value).toLocaleString("es-CR")}`
}

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

function useDelayedState<T>(initialValue: T, targetValue: T, delay: number) {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    const timer = setTimeout(() => setValue(targetValue), delay)
    return () => clearTimeout(timer)
  }, [targetValue, delay])

  return value
}

function StatCard({ icon: Icon, label, value, colorClass, delay = 0 }: {
  icon: typeof TrendingUp
  label: string
  value: number
  colorClass: string
  delay?: number
}) {
  const animatedValue = useAnimatedNumber(value)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const id = setTimeout(() => setShow(true), delay)
    return () => clearTimeout(id)
  }, [delay])

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
          {formatCurrency(animatedValue)}
        </span>
        <p className="text-xs text-base-content/60">Este mes</p>
      </div>
    </div>
  )
}

function FadeIn({ children, delay = 0, className = "" }: { 
  children: React.ReactNode
  delay?: number
  className?: string 
}) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const id = setTimeout(() => setShow(true), delay)
    return () => clearTimeout(id)
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

function LineChart({ data }: { data: MonthData[] }) {
  const [progress, setProgress] = useState(0)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const containerRef = React.useRef<HTMLDivElement>(null)

  useEffect(() => {
    let start: number | null = null
    let animationId: number
    const duration = 1200

    const animate = (timestamp: number) => {
      if (!start) start = timestamp
      const elapsed = timestamp - start
      const t = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setProgress(eased)
      
      if (t < 1) {
        animationId = requestAnimationFrame(animate)
      }
    }

    const delay = setTimeout(() => {
      animationId = requestAnimationFrame(animate)
    }, 400)

    return () => {
      clearTimeout(delay)
      cancelAnimationFrame(animationId)
    }
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      setSize({ width, height })
    })

    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  const chart = useMemo(() => {
    if (size.width === 0 || size.height === 0) return null

    const values = data.flatMap(d => [d.ingresos, d.egresos])
    const max = Math.max(...values)
    const min = Math.min(...values) * 0.85
    const padding = { top: 8, bottom: 8 }
    const chartHeight = size.height - padding.top - padding.bottom

    const normalize = (v: number) => padding.top + chartHeight - ((v - min) / (max - min)) * chartHeight

    const ingresos = data.map((d, i) => ({
      x: (i / (data.length - 1)) * size.width,
      y: normalize(d.ingresos),
    }))

    const egresos = data.map((d, i) => ({
      x: (i / (data.length - 1)) * size.width,
      y: normalize(d.egresos),
    }))

    const toPath = (pts: { x: number; y: number }[]) =>
      pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ")

    const toArea = (pts: { x: number; y: number }[]) =>
      `${toPath(pts)} L${size.width},${size.height} L0,${size.height} Z`

    return { ingresos, egresos, ingresosPath: toPath(ingresos), egresosPath: toPath(egresos), ingresosArea: toArea(ingresos), egresosArea: toArea(egresos) }
  }, [data, size])

  return (
    <div className="flex flex-col h-full gap-2">
      <div ref={containerRef} className="flex-1 min-h-0 relative">
        {chart && (
          <svg width={size.width} height={size.height} className="absolute inset-0">
            <defs>
              <linearGradient id="gradIngresos" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" className="text-success" stopColor="currentColor" stopOpacity="0.3" />
                <stop offset="100%" className="text-success" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="gradEgresos" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" className="text-error" stopColor="currentColor" stopOpacity="0.3" />
                <stop offset="100%" className="text-error" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
              <clipPath id="chartClip">
                <rect x="0" y="0" width={size.width * progress} height={size.height} />
              </clipPath>
            </defs>

            {[0.25, 0.5, 0.75].map(pct => (
              <line 
                key={pct} 
                x1="0" 
                y1={size.height * pct} 
                x2={size.width} 
                y2={size.height * pct} 
                className="stroke-base-content/10" 
                strokeWidth="1" 
              />
            ))}

            <g clipPath="url(#chartClip)">
              <path d={chart.ingresosArea} fill="url(#gradIngresos)" />
              <path d={chart.egresosArea} fill="url(#gradEgresos)" />
              <path d={chart.ingresosPath} fill="none" className="stroke-success" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d={chart.egresosPath} fill="none" className="stroke-error" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

              {chart.ingresos.map((p, i) => (
                <circle key={`i${i}`} cx={p.x} cy={p.y} r="5" className="fill-success" />
              ))}
              {chart.egresos.map((p, i) => (
                <circle key={`e${i}`} cx={p.x} cy={p.y} r="5" className="fill-error" />
              ))}
            </g>
          </svg>
        )}
      </div>

      <div className="flex justify-between shrink-0 px-1">
        {data.map(d => (
          <span key={d.mes} className="text-xs text-base-content/60">{d.mes}</span>
        ))}
      </div>
    </div>
  )
}

function CategoryItem({ category, percentage, index }: {
  category: CategoryData
  percentage: number
  index: number
}) {
  const isIngreso = category.tipo === "ingreso"
  const width = useDelayedState(0, percentage, 100 + index * 100)

  return (
    <li>
      <div className="flex justify-between text-xs lg:text-sm mb-1">
        <span className="font-medium">{category.nombre}</span>
        <span className={`font-semibold ${isIngreso ? "text-success" : "text-error"}`}>
          {formatCurrency(category.monto)}
        </span>
      </div>
      <progress
        className={`progress w-full h-1.5 lg:h-2 ${isIngreso ? "progress-success" : "progress-error"}`}
        value={width}
        max="100"
      />
    </li>
  )
}

function SummaryStats() {
  return (
    <div className="stats stats-vertical w-full bg-base-100 mt-2">
      <div className="stat p-2 lg:p-3">
        <div className="stat-title text-xs">Mejor mes</div>
        <div className="stat-value text-success text-base lg:text-lg">Nov</div>
        <div className="stat-desc text-xs">+₵70,000 neto</div>
      </div>
      <div className="stat p-2 lg:p-3">
        <div className="stat-title text-xs">Peor mes</div>
        <div className="stat-value text-error text-base lg:text-lg">Ene</div>
        <div className="stat-desc text-xs">-₵449,810 neto</div>
      </div>
      <div className="stat p-2 lg:p-3">
        <div className="stat-title text-xs">Promedio mensual</div>
        <div className="stat-value text-primary text-base lg:text-lg">₵401K</div>
        <div className="stat-desc text-xs">Ingresos</div>
      </div>
    </div>
  )
}

export default function StatsPage() {
  const totalEgresos = useMemo(() => 
    DATA.categorias
      .filter(c => c.tipo === "egreso")
      .reduce((acc, c) => acc + Math.abs(c.monto), 0),
    []
  )

  const getPercentage = (cat: CategoryData) =>
    cat.tipo === "ingreso"
      ? (cat.monto / DATA.ingresos) * 100
      : (Math.abs(cat.monto) / totalEgresos) * 100

  return (
    <>
      <NavBar />
      <div className="h-svh flex flex-col bg-base-200 overflow-hidden">
        <header className="navbar bg-primary text-primary-content shadow-lg shrink-0">
        <div className="navbar-start">
          <Link href="/dashboard" className="btn btn-ghost btn-circle">
            <ArrowLeft className="size-5" />
          </Link>
        </div>
        <div className="navbar-center">
          <span className="text-lg font-bold">Estadísticas</span>
        </div>
        <div className="navbar-end" />
      </header>

      <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto flex flex-col gap-4 lg:gap-5">
          <section className="grid grid-cols-3 gap-3 lg:gap-5 shrink-0">
            <StatCard 
              icon={TrendingUp} 
              label="Ingresos" 
              value={DATA.ingresos} 
              colorClass="text-success"
              delay={0}
            />
            <StatCard 
              icon={TrendingDown} 
              label="Egresos" 
              value={-DATA.egresos} 
              colorClass="text-error"
              delay={80}
            />
            <StatCard 
              icon={Wallet} 
              label="Balance" 
              value={DATA.balance} 
              colorClass={DATA.balance >= 0 ? "text-success" : "text-error"}
              delay={160}
            />
          </section>

          <FadeIn delay={200} className="card bg-base-100 shadow-md shrink-0">
            <div className="card-body p-4 lg:p-5">
              <div className="flex items-center justify-between">
                <h2 className="card-title text-sm lg:text-base">Comparación Mensual</h2>
                <div className="flex gap-2">
                  <span className="badge badge-success badge-sm">Ingresos</span>
                  <span className="badge badge-error badge-sm">Egresos</span>
                </div>
              </div>
              <div className="h-40 lg:h-52 mt-3">
                <LineChart data={DATA.mensual} />
              </div>
            </div>
          </FadeIn>

          <section className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-5 shrink-0">
            <FadeIn delay={300} className="card bg-base-100 shadow-md">
              <div className="card-body p-4 lg:p-5">
                <h2 className="card-title text-sm lg:text-base">Distribución por Categoría</h2>
                <ul className="space-y-2 lg:space-y-3 mt-2">
                  {DATA.categorias.map((cat, i) => (
                    <CategoryItem
                      key={cat.nombre}
                      category={cat}
                      percentage={getPercentage(cat)}
                      index={i}
                    />
                  ))}
                </ul>
              </div>
            </FadeIn>

            <FadeIn delay={400} className="card bg-base-100 shadow-md">
              <div className="card-body p-4 lg:p-5">
                <h2 className="card-title text-sm lg:text-base">Resumen del Período</h2>
                <SummaryStats />
              </div>
            </FadeIn>
          </section>
        </div>
      </main>
      </div>
    </>
  )
}
