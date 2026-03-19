"use client"

import React, { useState, useMemo, useEffect } from "react"
import { ArrowLeft, TrendingUp } from "lucide-react"
import Link from "next/link"

interface Transaccion {
  id: string
  descripcion: string
  monto: number
  tipo: "ingreso" | "egreso"
  categoria: string
  fecha: string
  estado: "pago cuota" | "pendiente" | "completado"
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

export default function IngresosPage() {
  const [mounted, setMounted] = useState(false)
  const [transacciones, setTransacciones] = useState<Transaccion[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const txns: Transaccion[] = []

    for (let mes = 0; mes < 6; mes++) {
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

  const filteredTransacciones = useMemo(() =>
    transacciones.filter((t) => t.descripcion.toLowerCase().includes(searchTerm.toLowerCase())),
    [transacciones, searchTerm]
  )

  const total = useMemo(() =>
    transacciones.reduce((sum, t) => sum + t.monto, 0),
    [transacciones]
  )

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: "CRC",
      minimumFractionDigits: 0,
    }).format(value)

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00")
    return new Intl.DateTimeFormat("es-CR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  }

  return (
    <div className="min-h-screen flex flex-col bg-base-200">
      <header className="navbar bg-success text-success-content shadow-lg shrink-0">
        <div className="navbar-start">
          <Link href="/prueba" className="btn btn-ghost btn-circle">
            <ArrowLeft className="size-5" />
          </Link>
        </div>
        <div className="navbar-center">
          <span className="text-lg font-bold">Ingresos</span>
        </div>
        <div className="navbar-end" />
      </header>

      <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
        {!mounted ? (
          <div className="flex-1 flex items-center justify-center h-full">
            <span className="loading loading-spinner loading-lg text-success"></span>
          </div>
        ) : (
        <div className="max-w-7xl mx-auto flex flex-col gap-4">
          {/* Total */}
          <FadeIn delay={0} className="card bg-base-100 shadow-md">
            <div className="card-body p-4 lg:p-5">
              <div className="flex items-center gap-2 text-success">
                <TrendingUp className="size-5" />
                <span className="text-sm font-medium">Total Ingresos</span>
              </div>
              <span className="text-2xl lg:text-3xl font-bold text-success">
                {formatCurrency(total)}
              </span>
              <p className="text-xs text-base-content/60">{transacciones.length} transacciones</p>
            </div>
          </FadeIn>

          {/* Tabla */}
          <FadeIn delay={150} className="card bg-base-100 shadow-md">
            <div className="card-body p-4 lg:p-6">
              {/* Búsqueda */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Buscar por descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input input-bordered input-sm w-full max-w-xs focus:input-success transition-all duration-300"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr className="border-b-2 border-success/30">
                      <th className="text-xs text-base-content/70">Fecha</th>
                      <th className="text-xs text-base-content/70">Descripción</th>
                      <th className="text-xs text-base-content/70">Categoría</th>
                      <th className="text-xs text-base-content/70 text-right">Monto</th>
                      <th className="text-xs text-base-content/70 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransacciones.map((t) => (
                      <tr
                        key={t.id}
                        className="hover:bg-success/5 transition-colors duration-200"
                      >
                        <td className="text-sm">{formatDate(t.fecha)}</td>
                        <td className="text-sm">{t.descripcion}</td>
                        <td className="text-sm">
                          <span className="badge badge-success badge-sm whitespace-nowrap">
                            {t.categoria}
                          </span>
                        </td>
                        <td className="text-sm font-bold text-right text-success">
                          +{formatCurrency(t.monto)}
                        </td>
                        <td className="text-sm text-center">
                          <span className="badge badge-primary badge-sm whitespace-nowrap">Pago Cuota</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </FadeIn>
        </div>
        )}
      </main>
    </div>
  )
}
