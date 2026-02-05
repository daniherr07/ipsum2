"use client"

import { useState, useMemo } from "react"
import { ArrowLeft, TrendingDown, TrendingUp, DollarSign, Plus } from "lucide-react"
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

export default function PruebaPage() {
  const [activeTab, setActiveTab] = useState<"ingresos" | "egresos">("ingresos")
  const [egresoSubTab, setEgresoSubTab] = useState<"mano-obra" | "materiales">("mano-obra")
  const [searchTerm, setSearchTerm] = useState("")

  // Generar datos aleatorios al cargar
  const [proyecto] = useState(() => {
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

    return {
      id: Math.random().toString(36).substr(2, 9),
      nombre: nombres[Math.floor(Math.random() * nombres.length)],
      descripcion:
        descripcionesProyecto[Math.floor(Math.random() * descripcionesProyecto.length)],
      ubicacion: "San José, Costa Rica",
      estado: "En Construcción",
      porcentajeCompletion: Math.floor(Math.random() * 80) + 20,
    }
  })

  const [transacciones] = useState<Transaccion[]>(() => {
    const transacciones: Transaccion[] = []
    
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

    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio"]

    // Generar egresos aleatorios (8-12 por mes, separados en mano de obra y materiales)
    for (let mes = 0; mes < 6; mes++) {
      const numEgresos = Math.floor(Math.random() * 5) + 8
      for (let i = 0; i < numEgresos; i++) {
        const esManoObra = Math.random() > 0.5
        transacciones.push({
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

      // Generar ingresos marcados como "pago cuota" (4-6 por mes)
      const numIngresos = Math.floor(Math.random() * 3) + 4
      for (let i = 0; i < numIngresos; i++) {
        const unidad = Math.floor(Math.random() * 50) + 1
        transacciones.push({
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

    return transacciones.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
  })

  // Calcular totales
  const totales = useMemo(() => {
    const totalIngresos = transacciones
      .filter((t) => t.tipo === "ingreso")
      .reduce((sum, t) => sum + t.monto, 0)
    const totalEgresos = transacciones
      .filter((t) => t.tipo === "egreso")
      .reduce((sum, t) => sum + t.monto, 0)

    return {
      ingresos: totalIngresos,
      egresos: totalEgresos,
      saldo: totalIngresos - totalEgresos,
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
      <div className="min-h-screen bg-gradient-to-b from-[var(--base-100)] to-[var(--base-200)] text-[var(--foreground)]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[var(--primary)] to-[#0470c8] text-[var(--primary-foreground)] shadow-lg">
          <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-center relative">
            <Link href="/dashboard" className="absolute left-4">
              <button className="btn btn-ghost btn-sm btn-circle hover:bg-[var(--primary-600)]">
                <ArrowLeft className="h-5 w-5" />
              </button>
            </Link>
            <h1 className="text-lg font-bold">Proyecto Base - Prueba</h1>
            <button
              onClick={() => {}}
              className="absolute right-4 btn btn-ghost btn-sm btn-circle hover:bg-[var(--primary-600)] flex items-center justify-center"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {/* Información del Proyecto */}
          <div className="bg-white dark:bg-[var(--base-200)] border-2 border-[var(--primary-200)] rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">{proyecto.nombre}</h2>
            <p className="text-[var(--base-500)] mb-4">{proyecto.descripcion}</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-[var(--base-600)] dark:text-[var(--base-400)]">
                  Ubicación
                </p>
                <p className="font-semibold text-[var(--foreground)]">{proyecto.ubicacion}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--base-600)] dark:text-[var(--base-400)]">Estado</p>
                <p className="font-semibold text-[var(--primary)]">{proyecto.estado}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex justify-between mb-2">
                <p className="text-sm text-[var(--base-600)] dark:text-[var(--base-400)]">
                  Progreso
                </p>
                <p className="text-sm font-semibold text-[var(--primary)]">
                  {proyecto.porcentajeCompletion}%
                </p>
              </div>
              <div className="w-full bg-[var(--base-300)] rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[var(--primary)] to-[#0470c8] h-full transition-all"
                  style={{ width: `${proyecto.porcentajeCompletion}%` }}
                />
              </div>
            </div>
          </div>

          {/* Resumen Financiero */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Ingresos */}
            <div className="bg-white dark:bg-[var(--base-200)] border-2 border-[var(--success)] rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-[var(--base-600)] dark:text-[var(--base-400)] uppercase">
                  Total Ingresos
                </h3>
                <TrendingUp className="h-5 w-5 text-[var(--success)]" />
              </div>
              <p className="text-2xl font-bold text-[var(--success)]">{formatCurrency(totales.ingresos)}</p>
              <p className="text-xs text-[var(--base-500)] mt-2">
                {transacciones.filter((t) => t.tipo === "ingreso").length} transacciones
              </p>
            </div>

            {/* Egresos */}
            <div className="bg-white dark:bg-[var(--base-200)] border-2 border-[var(--error)] rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-[var(--base-600)] dark:text-[var(--base-400)] uppercase">
                  Total Egresos
                </h3>
                <TrendingDown className="h-5 w-5 text-[var(--error)]" />
              </div>
              <p className="text-2xl font-bold text-[var(--error)]">{formatCurrency(totales.egresos)}</p>
              <p className="text-xs text-[var(--base-500)] mt-2">
                {transacciones.filter((t) => t.tipo === "egreso").length} transacciones
              </p>
            </div>

            {/* Saldo */}
            <div
              className={`border-2 rounded-xl shadow-md p-6 ${
                totales.saldo >= 0
                  ? "bg-white dark:bg-[var(--base-200)] border-[var(--success)]"
                  : "bg-white dark:bg-[var(--base-200)] border-[var(--error)]"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-[var(--base-600)] dark:text-[var(--base-400)] uppercase">
                  Saldo
                </h3>
                <DollarSign className={`h-5 w-5 ${totales.saldo >= 0 ? "text-[var(--success)]" : "text-[var(--error)]"}`} />
              </div>
              <p
                className={`text-2xl font-bold ${
                  totales.saldo >= 0 ? "text-[var(--success)]" : "text-[var(--error)]"
                }`}
              >
                {formatCurrency(totales.saldo)}
              </p>
              <p className="text-xs text-[var(--base-500)] mt-2">
                {totales.saldo >= 0 ? "Superávit" : "Déficit"}
              </p>
            </div>
          </div>

          {/* Tabla con Tabs */}
          <div className="bg-white dark:bg-[var(--base-200)] border-2 border-[var(--primary-200)] rounded-xl shadow-md overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b-2 border-[var(--primary-200)]">
              <button
                onClick={() => setActiveTab("ingresos")}
                className={`flex-1 py-4 px-6 text-center font-semibold transition-all ${
                  activeTab === "ingresos"
                    ? "bg-[var(--success)] text-white border-b-4 border-[var(--success)]"
                    : "bg-white dark:bg-[var(--base-200)] text-[var(--foreground)] hover:bg-[var(--base-50)] dark:hover:bg-[var(--base-300)]"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Ingresos - Pagos de Cuota</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab("egresos")}
                className={`flex-1 py-4 px-6 text-center font-semibold transition-all ${
                  activeTab === "egresos"
                    ? "bg-[var(--error)] text-white border-b-4 border-[var(--error)]"
                    : "bg-white dark:bg-[var(--base-200)] text-[var(--foreground)] hover:bg-[var(--base-50)] dark:hover:bg-[var(--base-300)]"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <TrendingDown className="h-5 w-5" />
                  <span>Egresos - Gastos de Proyecto</span>
                </div>
              </button>
            </div>

            {/* Contenido de Tabs */}
            <div className="p-6">
              {activeTab === "ingresos" && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-[var(--success)]">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--base-600)] dark:text-[var(--base-400)]">
                          Fecha
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--base-600)] dark:text-[var(--base-400)]">
                          Descripción
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--base-600)] dark:text-[var(--base-400)]">
                          Categoría
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-[var(--base-600)] dark:text-[var(--base-400)]">
                          Monto
                        </th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-[var(--base-600)] dark:text-[var(--base-400)]">
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {transacciones
                        .filter((t) => t.tipo === "ingreso")
                        .map((transaccion, idx) => (
                          <tr
                            key={transaccion.id}
                            className={`border-b border-[var(--base-300)] hover:bg-[var(--success-50)] dark:hover:bg-[var(--base-300)] transition-colors ${
                              idx % 2 === 0 ? "bg-[var(--base-50)] dark:bg-[var(--base-200)]" : ""
                            }`}
                          >
                            <td className="py-3 px-4 text-sm text-[var(--foreground)]">
                              {formatDate(transaccion.fecha)}
                            </td>
                            <td className="py-3 px-4 text-sm text-[var(--foreground)]">
                              {transaccion.descripcion}
                            </td>
                            <td className="py-3 px-4 text-sm">
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--success-100)] dark:bg-[var(--success-900)] text-[var(--success)]">
                                {transaccion.categoria}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm font-bold text-right text-[var(--success)]">
                              +{formatCurrency(transaccion.monto)}
                            </td>
                            <td className="py-3 px-4 text-sm text-center">
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--primary-100)] dark:bg-[var(--primary-900)] text-[var(--primary)]">
                                Pago Cuota
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === "egresos" && (
                <div>
                  {/* Subtabs de Egresos */}
                  <div className="flex gap-4 mb-6 border-b-2 border-[var(--error-200)] pb-4">
                    <button
                      onClick={() => setEgresoSubTab("mano-obra")}
                      className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                        egresoSubTab === "mano-obra"
                          ? "bg-[var(--error)] text-white"
                          : "bg-[var(--base-100)] dark:bg-[var(--base-300)] text-[var(--foreground)] hover:bg-[var(--base-200)]"
                      }`}
                    >
                      Mano de Obra
                    </button>
                    <button
                      onClick={() => setEgresoSubTab("materiales")}
                      className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                        egresoSubTab === "materiales"
                          ? "bg-[var(--error)] text-white"
                          : "bg-[var(--base-100)] dark:bg-[var(--base-300)] text-[var(--foreground)] hover:bg-[var(--base-200)]"
                      }`}
                    >
                      Materiales
                    </button>
                  </div>

                  {/* Filtro de búsqueda */}
                  <div className="mb-6">
                    <input
                      type="text"
                      placeholder="Buscar por descripción..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border-2 border-[var(--error-200)] bg-[var(--base-50)] dark:bg-[var(--base-300)] text-[var(--foreground)] placeholder-[var(--base-400)] focus:border-[var(--error)] focus:outline-none focus:ring-2 focus:ring-[var(--error-100)]"
                    />
                  </div>

                  {/* Tabla de Egresos */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-[var(--error)]">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--base-600)] dark:text-[var(--base-400)]">
                            Fecha
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--base-600)] dark:text-[var(--base-400)]">
                            Descripción
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--base-600)] dark:text-[var(--base-400)]">
                            Categoría
                          </th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-[var(--base-600)] dark:text-[var(--base-400)]">
                            Monto
                          </th>
                          <th className="text-center py-3 px-4 text-sm font-semibold text-[var(--base-600)] dark:text-[var(--base-400)]">
                            Estado
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {transacciones
                          .filter((t) => t.tipo === "egreso")
                          .filter((t) => egresoSubTab === "mano-obra" ? t.categoria === "Mano de Obra" : t.categoria === "Materiales")
                          .filter((t) => t.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
                          .map((transaccion, idx) => (
                            <tr
                              key={transaccion.id}
                              className={`border-b border-[var(--base-300)] hover:bg-[var(--error-50)] dark:hover:bg-[var(--base-300)] transition-colors ${
                                idx % 2 === 0 ? "bg-[var(--base-50)] dark:bg-[var(--base-200)]" : ""
                              }`}
                            >
                              <td className="py-3 px-4 text-sm text-[var(--foreground)]">
                                {formatDate(transaccion.fecha)}
                              </td>
                              <td className="py-3 px-4 text-sm text-[var(--foreground)]">
                                {transaccion.descripcion}
                              </td>
                              <td className="py-3 px-4 text-sm">
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--error-100)] dark:bg-[var(--error-900)] text-[var(--error)]">
                                  {transaccion.categoria}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-sm font-bold text-right text-[var(--error)]">
                                -{formatCurrency(transaccion.monto)}
                              </td>
                              <td className="py-3 px-4 text-sm text-center">
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--warning-100)] dark:bg-[var(--warning-900)] text-[var(--warning)]">
                                  Completado
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
