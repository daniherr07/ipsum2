"use client"

import React, { useState, useMemo, useEffect } from "react"
import { ArrowLeft, TrendingDown, TrendingUp, DollarSign, Plus, ChevronRight } from "lucide-react"
import Link from "next/link"
import NavBar from "@/components/navbar/NavBar"

interface Transaccion {
  id: string
  descripcion: string
  monto: number
  tipo: "ingreso" | "egreso"
  categoria: string
  fecha: string
  estado: "pago cuota" | "pendiente" | "completado"
}

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
function FadeIn({ children, delay = 0, className = "", id }: { 
  children: React.ReactNode
  delay?: number
  className?: string
  id?: string 
}) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const tid = setTimeout(() => setShow(true), delay)
    return () => clearTimeout(tid)
  }, [delay])

  return (
    <div
      id={id}
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

// Stat Card component with animations
function StatCard({ icon: Icon, label, value, colorClass, delay = 0, subtitle, href }: {
  icon: typeof TrendingUp
  label: string
  value: number
  colorClass: string
  delay?: number
  subtitle?: string
  href?: string
}) {
  const animatedValue = useAnimatedNumber(value)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const id = setTimeout(() => setShow(true), delay)
    return () => clearTimeout(id)
  }, [delay])

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: "CRC",
      minimumFractionDigits: 0,
    }).format(val)
  }

  const Wrapper = href ? Link : "div"
  const wrapperProps = href ? { href } : {}

  return (
    <Wrapper 
      {...wrapperProps as any}
      className={`card bg-base-100 shadow-md hover:shadow-xl transition-all duration-500 ${href ? "cursor-pointer active:scale-95" : ""}`}
      style={{
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 0.4s ease-out, transform 0.4s ease-out, box-shadow 0.3s",
      }}
    >
      <div className="card-body p-4 lg:p-5">
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-2 ${colorClass}`}>
            <Icon className="size-5" />
            <span className="text-sm font-medium">{label}</span>
          </div>
          {href && <ChevronRight className="size-4 text-base-content/40" />}
        </div>
        <span className={`text-xl lg:text-2xl font-bold ${colorClass}`}>
          {formatCurrency(animatedValue)}
        </span>
        {subtitle && <p className="text-xs text-base-content/60">{subtitle}</p>}
      </div>
    </Wrapper>
  )
}

export default function PruebaPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [mounted, setMounted] = useState(false)

  // Generar datos aleatorios solo en el cliente
  const [proyecto, setProyecto] = useState({
    id: "",
    nombre: "",
    descripcion: "",
    ubicacion: "San José, Costa Rica",
    estado: "En Construcción",
  })

  const [transacciones, setTransacciones] = useState<Transaccion[]>([])

  useEffect(() => {
    const nombres = [
      "Proyecto Magna",
      "Centro Comercial",
      "Residencial Vista",
      "Oficinas Ejecutivas",
      "Plaza Principal",
    ]
    const descripcionesProyecto = [
      "Desarrollo inmobiliario de alto estándar",
      "Construcción de centro comercial moderno",
      "Complejo residencial de lujo",
      "Torre de oficinas en zona central",
      "Centro comercial y vivienda",
    ]

    setProyecto({
      id: Math.random().toString(36).substr(2, 9),
      nombre: nombres[Math.floor(Math.random() * nombres.length)],
      descripcion: descripcionesProyecto[Math.floor(Math.random() * descripcionesProyecto.length)],
      ubicacion: "San José, Costa Rica",
      estado: "En Construcción",
    })

    const txns: Transaccion[] = []
    
    const descManoObra = [
      "Pago nómina constructores",
      "Salarios operarios",
      "Mano de obra especializada",
      "Contratistas de fundación",
      "Carpinteros y acabados",
      "Electricistas",
      "Plomeros",
      "Maestro de obra",
    ]
    
    const descMateriales = [
      "Compra de cemento y acero",
      "Alquiler de maquinaria",
      "Transporte de materiales",
      "Suministro eléctrico",
      "Tuberías y accesorios",
      "Ladrillos y bloques",
      "Arena y grava",
      "Pintura y acabados",
      "Vidrios y ventanas",
      "Puertas y marcos",
    ]

    for (let mes = 0; mes < 6; mes++) {
      const numEgresos = Math.floor(Math.random() * 5) + 8
      for (let i = 0; i < numEgresos; i++) {
        const esManoObra = Math.random() > 0.5
        txns.push({
          id: `egreso-${mes}-${i}`,
          descripcion: esManoObra
            ? descManoObra[Math.floor(Math.random() * descManoObra.length)]
            : descMateriales[Math.floor(Math.random() * descMateriales.length)],
          monto: Math.floor(Math.random() * 5000000) + 500000,
          tipo: "egreso",
          categoria: esManoObra ? "Mano de Obra" : "Materiales",
          fecha: `2025-${String(mes + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`,
          estado: "completado",
        })
      }

      const numIngresos = Math.floor(Math.random() * 3) + 4
      for (let i = 0; i < numIngresos; i++) {
        const unidad = Math.floor(Math.random() * 50) + 1
        txns.push({
          id: `ingreso-${mes}-${i}`,
          descripcion: `Pago cuota Unidad ${unidad}`,
          monto: Math.floor(Math.random() * 80000000) + 20000000,
          tipo: "ingreso",
          categoria: "Pago Cuota",
          fecha: `2025-${String(mes + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`,
          estado: "pago cuota",
        })
      }
    }

    setTransacciones(txns.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()))
    setMounted(true)
  }, [])

  // Calcular totales
  const totales = useMemo(() => {
    const totalIngresos = transacciones
      .filter((t) => t.tipo === "ingreso")
      .reduce((sum, t) => sum + t.monto, 0)
    const totalEgresos = transacciones
      .filter((t) => t.tipo === "egreso")
      .reduce((sum, t) => sum + t.monto, 0)

    // Presupuesto: ~35% por encima de los egresos reales, redondeado a millones
    const presupuesto = Math.round(totalEgresos * 1.35 / 1000000) * 1000000

    return {
      ingresos: totalIngresos,
      egresos: totalEgresos,
      saldo: totalIngresos - totalEgresos,
      presupuesto,
    }
  }, [transacciones])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: "CRC",
      minimumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00")
    return new Intl.DateTimeFormat("es-CR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  }

  return (
    <>
      <NavBar />
      <div className="min-h-screen flex flex-col bg-base-200 overflow-hidden">
        {/* Header */}
        <header className="navbar bg-primary text-primary-content shadow-lg shrink-0">
          <div className="navbar-start">
            <Link href="/dashboard" className="btn btn-ghost btn-circle">
              <ArrowLeft className="size-5" />
            </Link>
          </div>
          <div className="navbar-center">
            <span className="text-lg font-bold">Proyecto Base - Prueba</span>
          </div>
          <div className="navbar-end">
            <button className="btn btn-ghost btn-circle">
              <Plus className="size-5" />
            </button>
          </div>
        </header>

        {!mounted ? (
          <main className="flex-1 flex items-center justify-center">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </main>
        ) : (
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto flex flex-col gap-4 lg:gap-5">
            {/* Información del Proyecto */}
            <FadeIn delay={0} className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="card-body p-4 lg:p-6">
                <h2 className="card-title text-xl lg:text-2xl">{proyecto.nombre}</h2>
                <p className="text-base-content/70">{proyecto.descripcion}</p>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-xs text-base-content/60">Ubicación</p>
                    <p className="font-semibold">{proyecto.ubicacion}</p>
                  </div>
                  <div>
                    <p className="text-xs text-base-content/60">Estado</p>
                    <p className="font-semibold text-primary">{proyecto.estado}</p>
                  </div>
                </div>

                {/* Presupuesto */}
                <div className="mt-4">
                  <div className="flex justify-between mb-1">
                    <p className="text-xs text-base-content/60">Presupuesto</p>
                    <p className="text-xs font-semibold">{formatCurrency(totales.presupuesto)}</p>
                  </div>
                  <progress 
                    className={`progress w-full h-2 ${
                      totales.egresos / totales.presupuesto > 0.9 ? "progress-error" 
                      : totales.egresos / totales.presupuesto > 0.7 ? "progress-warning" 
                      : "progress-primary"
                    }`}
                    value={totales.egresos} 
                    max={totales.presupuesto}
                  />
                  <div className="flex justify-between mt-1">
                    <p className="text-xs text-base-content/60">
                      Gastado: <span className="font-semibold text-error">{formatCurrency(totales.egresos)}</span>
                    </p>
                    <p className="text-xs text-base-content/60">
                      Disponible: <span className="font-semibold text-success">{formatCurrency(totales.presupuesto - totales.egresos)}</span>
                    </p>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Resumen Financiero */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-5 shrink-0">
              <StatCard 
                icon={TrendingUp} 
                label="Ingresos" 
                value={totales.ingresos} 
                colorClass="text-success"
                delay={100}
                subtitle={`${transacciones.filter((t) => t.tipo === "ingreso").length} transacciones`}
                href="/prueba/ingresos"
              />
              <StatCard 
                icon={TrendingDown} 
                label="Egresos" 
                value={totales.egresos} 
                colorClass="text-error"
                delay={180}
                subtitle={`${transacciones.filter((t) => t.tipo === "egreso").length} transacciones`}
                href="/prueba/egresos"
              />
              <StatCard 
                icon={DollarSign} 
                label="Saldo" 
                value={totales.saldo} 
                colorClass={totales.saldo >= 0 ? "text-success" : "text-error"}
                delay={260}
                subtitle={totales.saldo >= 0 ? "Superávit" : "Déficit"}
              />
            </section>
          </div>
        </main>
        )}
      </div>
    </>
  )
}
