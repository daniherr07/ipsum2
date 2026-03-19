"use client"

import React, { useState, useMemo, useEffect } from "react"
import { TrendingDown, TrendingUp, DollarSign, Building2 } from "lucide-react"

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

// Stat Card component - estilo de /stats
function StatCard({ icon: Icon, label, value, colorClass, delay = 0, subtitle }: {
  icon: typeof TrendingUp
  label: string
  value: number
  colorClass: string
  delay?: number
  subtitle?: string
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
          <span className="text-sm font-medium uppercase tracking-wide">{label}</span>
        </div>
        <span className={`text-xl lg:text-2xl font-bold ${colorClass}`}>
          {formatCurrency(animatedValue)}
        </span>
        {subtitle && <p className="text-xs text-base-content/60">{subtitle}</p>}
      </div>
    </div>
  )
}

export default function PruebaPage() {
  const [activeTab, setActiveTab] = useState<"ingresos" | "egresos">("ingresos")
  const [mounted, setMounted] = useState(false)

  const [proyecto, setProyecto] = useState({
    id: "",
    nombre: "",
    descripcion: "",
    ubicacion: "San José, Costa Rica",
    estado: "En Construcción",
  })

  const [transacciones, setTransacciones] = useState<Transaccion[]>([])

  useEffect(() => {
    const nombres = ["Plaza Principal", "Centro Comercial", "Residencial Vista", "Oficinas Ejecutivas", "Proyecto Magna"]
    const descripciones = ["Torre de oficinas en zona central", "Centro comercial moderno", "Complejo residencial de lujo", "Edificio corporativo", "Desarrollo inmobiliario"]

    setProyecto({
      id: Math.random().toString(36).substr(2, 9),
      nombre: nombres[Math.floor(Math.random() * nombres.length)],
      descripcion: descripciones[Math.floor(Math.random() * descripciones.length)],
      ubicacion: "San José, Costa Rica",
      estado: "En Construcción",
    })

    const txns: Transaccion[] = []
    
    const descManoObra = ["Pago nómina constructores", "Salarios operarios", "Mano de obra especializada", "Contratistas", "Electricistas", "Plomeros"]
    const descMateriales = ["Compra de cemento y acero", "Alquiler de maquinaria", "Transporte de materiales", "Suministro eléctrico", "Tuberías", "Ladrillos"]

    for (let mes = 0; mes < 6; mes++) {
      const numEgresos = Math.floor(Math.random() * 5) + 8
      for (let i = 0; i < numEgresos; i++) {
        const esManoObra = Math.random() > 0.5
        txns.push({
          id: `egreso-${mes}-${i}`,
          descripcion: esManoObra ? descManoObra[Math.floor(Math.random() * descManoObra.length)] : descMateriales[Math.floor(Math.random() * descMateriales.length)],
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

  const totales = useMemo(() => {
    const totalIngresos = transacciones.filter((t) => t.tipo === "ingreso").reduce((sum, t) => sum + t.monto, 0)
    const totalEgresos = transacciones.filter((t) => t.tipo === "egreso").reduce((sum, t) => sum + t.monto, 0)
    const presupuesto = Math.round(totalEgresos * 1.35 / 1000000) * 1000000

    return { ingresos: totalIngresos, egresos: totalEgresos, saldo: totalIngresos - totalEgresos, presupuesto }
  }, [transacciones])

  const transaccionesFiltradas = useMemo(() => {
    const tipoFiltro = activeTab === "ingresos" ? "ingreso" : "egreso"
    return transacciones.filter((t) => t.tipo === tipoFiltro)
  }, [transacciones, activeTab])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CR", { style: "currency", currency: "CRC", minimumFractionDigits: 0 }).format(value)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00")
    return new Intl.DateTimeFormat("es-CR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date)
  }

  return (
    <>
      <div className="min-h-screen bg-base-200">

        {!mounted ? (
          <main className="flex items-center justify-center min-h-[50vh]">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </main>
        ) : (
          <main className="p-4 lg:p-6">
            <div className="max-w-7xl mx-auto flex flex-col gap-4 lg:gap-5">
              
              {/* Card del Proyecto - estilo stats */}
              <FadeIn delay={0} className="card bg-base-100 shadow-md">
                <div className="card-body p-4 lg:p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="size-5 text-primary" />
                      </div>
                      <div>
                        <h2 className="card-title text-primary text-xl lg:text-2xl">{proyecto.nombre}</h2>
                        <p className="text-sm text-base-content/60">{proyecto.descripcion}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-xs text-base-content/60 uppercase tracking-wide">Ubicación</p>
                      <p className="font-semibold text-base-content">{proyecto.ubicacion}</p>
                    </div>
                    <div>
                      <p className="text-xs text-base-content/60 uppercase tracking-wide">Estado</p>
                      <p className="font-semibold text-primary">{proyecto.estado}</p>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mt-4">
                    <div className="flex justify-between mb-1">
                      <p className="text-xs text-base-content/60">Presupuesto utilizado</p>
                      <p className="text-xs font-semibold">{Math.round((totales.egresos / totales.presupuesto) * 100)}%</p>
                    </div>
                    <progress 
                      className="progress progress-primary w-full h-2"
                      value={totales.egresos} 
                      max={totales.presupuesto}
                    />
                  </div>
                </div>
              </FadeIn>

              {/* Stat Cards - estilo stats */}
              <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-5 shrink-0">
                <StatCard 
                  icon={TrendingUp} 
                  label="Total Ingresos" 
                  value={totales.ingresos} 
                  colorClass="text-success"
                  delay={100}
                  subtitle={`${transacciones.filter((t) => t.tipo === "ingreso").length} transacciones`}
                />
                <StatCard 
                  icon={TrendingDown} 
                  label="Total Egresos" 
                  value={totales.egresos} 
                  colorClass="text-error"
                  delay={180}
                  subtitle={`${transacciones.filter((t) => t.tipo === "egreso").length} transacciones`}
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

              {/* Tabs y Tabla - estilo stats */}
              <FadeIn delay={340} className="card bg-base-100 shadow-md">
                <div className="card-body p-0">
                  {/* Tabs */}
                  <div role="tablist" className="tabs tabs-bordered">
                    <button 
                      role="tab" 
                      className={`tab gap-2 ${activeTab === "ingresos" ? "tab-active text-success" : "text-base-content/60"}`}
                      onClick={() => setActiveTab("ingresos")}
                    >
                      <TrendingUp className="size-4" />
                      Ingresos - Pagos de Cuota
                    </button>
                    <button 
                      role="tab" 
                      className={`tab gap-2 ${activeTab === "egresos" ? "tab-active text-error" : "text-base-content/60"}`}
                      onClick={() => setActiveTab("egresos")}
                    >
                      <TrendingDown className="size-4" />
                      Egresos - Gastos de Proyecto
                    </button>
                  </div>

                  {/* Tabla */}
                  <div className="overflow-x-auto">
                    <table className="table table-zebra table-sm sm:table-md">
                      <thead>
                        <tr className="text-base-content/60">
                          <th className="whitespace-nowrap">Fecha</th>
                          <th>Descripción</th>
                          <th className="whitespace-nowrap">Categoría</th>
                          <th className="text-right whitespace-nowrap">Monto</th>
                          <th className="whitespace-nowrap">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transaccionesFiltradas.slice(0, 10).map((txn) => (
                          <tr key={txn.id} className="hover">
                            <td className="text-sm whitespace-nowrap">{formatDate(txn.fecha)}</td>
                            <td className="text-sm font-medium">{txn.descripcion}</td>
                            <td className="whitespace-nowrap">
                              <span className="badge badge-ghost badge-sm">{txn.categoria}</span>
                            </td>
                            <td className={`text-right font-semibold whitespace-nowrap ${txn.tipo === "ingreso" ? "text-success" : "text-error"}`}>
                              {txn.tipo === "ingreso" ? "+" : "-"}{formatCurrency(txn.monto)}
                            </td>
                            <td className="whitespace-nowrap">
                              <span className={`badge badge-sm ${
                                txn.estado === "pago cuota" ? "badge-success" : 
                                txn.estado === "pendiente" ? "badge-warning" : "badge-ghost"
                              }`}>
                                {txn.estado === "pago cuota" ? "Pago Cuota" : txn.estado.charAt(0).toUpperCase() + txn.estado.slice(1)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </FadeIn>

            </div>
          </main>
        )}
      </div>
    </>
  )
}
