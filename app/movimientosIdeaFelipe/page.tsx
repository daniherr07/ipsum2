"use client"

import { useState, useMemo } from "react"
import { ArrowLeft, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react"
import Link from "next/link"
import NavBar from "@/components/navbar/NavBar"

interface Proyecto {
  id: string
  nombre: string
  mes: number
}

interface ComponentePago {
  id: string
  tipo: "pago-casa" | "administrativo"
  monto: string
  mes: number
  ano: number
  categoria?: string
  descripcion?: string
}

const styleSheet = typeof document !== 'undefined' ? (() => {
  const style = document.createElement('style')
  style.textContent = `
    select option {
      color: #000000 !important;
      background-color: #ffffff !important;
      padding: 8px;
      font-weight: 500;
    }
    select option:checked {
      background: linear-gradient(#035496, #035496) !important;
      background-color: #035496 !important;
      color: #ffffff !important;
    }
  `
  if (document.head) {
    document.head.appendChild(style)
  }
  return style
})() : null

export default function NuevoMovimientoPage() {
  const [tipoMovimiento, setTipoMovimiento] = useState<"pago-casa" | "ingreso-casa" | "administrativo" | "pago-compuesto">("pago-casa")
  const [monto, setMonto] = useState("")
  const [mesSeleccionado, setMesSeleccionado] = useState("1")
  const [anoSeleccionado, setAnoSeleccionado] = useState(new Date().getFullYear().toString())
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState("")
  const [categoria, setCategoria] = useState("")
  const [nombreIngreso, setNombreIngreso] = useState("")
  const [descripcion, setDescripcion] = useState("")

  const today = new Date()
  const [fechaPagoDia, setFechaPagoDia] = useState(String(today.getDate()).padStart(2, "0"))
  const [fechaPagoMes, setFechaPagoMes] = useState(String(today.getMonth() + 1).padStart(2, "0"))
  const [fechaPagoAno, setFechaPagoAno] = useState(today.getFullYear().toString())

  // Estados pago compuesto
  const [componentesAcumulados, setComponentesAcumulados] = useState<ComponentePago[]>([])
  const [mostrarFormComponente, setMostrarFormComponente] = useState(false)
  const [tipoComponente, setTipoComponente] = useState<"pago-casa" | "administrativo" | null>(null)
  const [componenteMonto, setComponenteMonto] = useState("")
  const [componenteMes, setComponenteMes] = useState(String(today.getMonth() + 1))
  const [componenteAno, setComponenteAno] = useState(today.getFullYear().toString())
  const [componenteCategoria, setComponenteCategoria] = useState("")
  const [componenteDescripcion, setComponenteDescripcion] = useState("")

  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ]

  const proyectosConMesFijo: Proyecto[] = [
    { id: "proj-1", nombre: "Proyecto Magna", mes: 1 },
    { id: "proj-2", nombre: "Centro Comercial", mes: 3 },
    { id: "proj-3", nombre: "Residencial Vista", mes: 2 },
    { id: "proj-4", nombre: "Oficinas Ejecutivas", mes: 4 },
    { id: "proj-5", nombre: "Plaza Principal", mes: 5 },
  ]

  const proyectos: Proyecto[] = useMemo(() => {
    if (tipoMovimiento === "ingreso-casa") return proyectosConMesFijo

    const proyectosBase = [
      "Proyecto Magna", "Centro Comercial", "Residencial Vista",
      "Oficinas Ejecutivas", "Plaza Principal",
    ]

    return proyectosBase
      .filter((_, idx) => {
        const mesNum = parseInt(mesSeleccionado)
        return (idx + mesNum) % 3 !== 0
      })
      .map((nombre, idx) => ({
        id: `proj-${idx}`,
        nombre,
        mes: parseInt(mesSeleccionado),
      }))
  }, [mesSeleccionado, tipoMovimiento])

  const opcionesCategoria = ["Mano de Obra", "Materiales", "Equipamiento", "Servicios", "Otros"]

  const formatCurrency = (value: string) => {
    const num = parseInt(value.replace(/\D/g, "")) || 0
    return new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: "CRC",
      minimumFractionDigits: 0,
    }).format(num)
  }

  const handleMontoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "")
    setMonto(value)
  }

  const handleComponenteMontoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "")
    setComponenteMonto(value)
  }

  // Calcular restante
  const totalNum = parseInt(monto) || 0
  const sumaComponentes = componentesAcumulados.reduce((sum, c) => sum + (parseInt(c.monto) || 0), 0)
  const restante = totalNum - sumaComponentes

  const resetFormComponente = () => {
    setTipoComponente(null)
    setComponenteMonto("")
    setComponenteMes(String(today.getMonth() + 1))
    setComponenteAno(today.getFullYear().toString())
    setComponenteCategoria("")
    setComponenteDescripcion("")
    setMostrarFormComponente(false)
  }

  const agregarComponente = () => {
    if (!tipoComponente || !componenteMonto) return

    const nuevo: ComponentePago = {
      id: Date.now().toString(),
      tipo: tipoComponente,
      monto: componenteMonto,
      mes: parseInt(componenteMes),
      ano: parseInt(componenteAno),
      categoria: tipoComponente === "pago-casa" ? componenteCategoria : undefined,
      descripcion: componenteDescripcion,
    }

    setComponentesAcumulados([...componentesAcumulados, nuevo])
    resetFormComponente()
  }

  const eliminarComponente = (id: string) => {
    setComponentesAcumulados(componentesAcumulados.filter(c => c.id !== id))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (tipoMovimiento === "pago-compuesto") {
      if (componentesAcumulados.length === 0) {
        alert("Debes agregar al menos un componente de pago")
        return
      }
      console.log({
        tipoMovimiento: "pago-compuesto",
        proyecto: proyectoSeleccionado,
        montoTotal: totalNum,
        componentes: componentesAcumulados,
      })
    } else {
      console.log({
        tipoMovimiento, monto,
        mes: meses[parseInt(mesSeleccionado) - 1],
        proyecto: proyectoSeleccionado,
        categoria, nombreIngreso, descripcion,
      })
    }
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-[var(--base-100)] to-[var(--base-200)] text-[var(--foreground)]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[var(--primary)] to-[#0470c8] text-[var(--primary-foreground)] shadow-lg">
          <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-center relative">
            <Link href="/prueba" className="absolute left-4">
              <button className="btn btn-ghost btn-sm btn-circle hover:bg-[var(--primary-600)]">
                <ArrowLeft className="h-5 w-5" />
              </button>
            </Link>
            <h1 className="text-lg font-bold">Nuevo Movimiento</h1>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="bg-white dark:bg-[var(--base-200)] border-2 border-[var(--primary-200)] rounded-xl shadow-md p-6">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Tipo de Movimiento */}
              <div>
                <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                  Tipo de Movimiento
                </label>
                <select
                  value={tipoMovimiento}
                  onChange={(e) => {
                    setTipoMovimiento(e.target.value as any)
                    setCategoria("")
                    setNombreIngreso("")
                    setProyectoSeleccionado("")
                    setMonto("")
                    setComponentesAcumulados([])
                    resetFormComponente()
                  }}
                  className="w-full px-4 py-3 bg-white dark:bg-[var(--base-300)] text-[var(--foreground)] border-2 border-[var(--primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-200)] cursor-pointer font-semibold hover:border-[#0470c8] transition-all"
                >
                  <option value="pago-casa">Pago Casa</option>
                  <option value="ingreso-casa">Ingreso Casa</option>
                  <option value="administrativo">Pago Administrativo</option>
                  <option value="pago-compuesto">Pago Compuesto</option>
                </select>
              </div>

              {/* ── CAMPOS MOVIMIENTOS SIMPLES ── */}
              {tipoMovimiento !== "pago-compuesto" && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Monto</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--primary)]">₵</span>
                      <input
                        type="text"
                        value={monto ? formatCurrency(monto) : ""}
                        onChange={handleMontoChange}
                        placeholder="0"
                        className="input input-bordered w-full pl-8 bg-[var(--base-50)] dark:bg-[var(--base-300)] border-[var(--primary-200)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-100)]"
                      />
                    </div>
                  </div>

                  {tipoMovimiento === "ingreso-casa" ? (
                    <div>
                      <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Mes</label>
                      <div className="w-full px-4 py-3 bg-[var(--base-50)] dark:bg-[var(--base-300)] text-[var(--foreground)] border-2 border-[var(--primary-200)] rounded-lg font-semibold">
                        {meses[parseInt(mesSeleccionado) - 1] || "Sin proyecto"}
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Mes</label>
                        <select
                          value={mesSeleccionado}
                          onChange={(e) => { setMesSeleccionado(e.target.value); setProyectoSeleccionado("") }}
                          className="w-full px-4 py-3 bg-white dark:bg-[var(--base-300)] text-[var(--foreground)] border-2 border-[var(--primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-200)] cursor-pointer font-semibold hover:border-[#0470c8] transition-all"
                        >
                          {meses.map((mes, idx) => (
                            <option key={idx} value={idx + 1}>{mes}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Año</label>
                        <select
                          value={anoSeleccionado}
                          onChange={(e) => { setAnoSeleccionado(e.target.value); setProyectoSeleccionado("") }}
                          className="w-full px-4 py-3 bg-white dark:bg-[var(--base-300)] text-[var(--foreground)] border-2 border-[var(--primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-200)] cursor-pointer font-semibold hover:border-[#0470c8] transition-all"
                        >
                          {[2024, 2025, 2026, 2027, 2028].map((ano) => (
                            <option key={ano} value={ano}>{ano}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {tipoMovimiento !== "administrativo" && (
                    <div>
                      <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Proyecto</label>
                      <select
                        value={proyectoSeleccionado}
                        onChange={(e) => {
                          const idSeleccionado = e.target.value
                          setProyectoSeleccionado(idSeleccionado)
                          if (tipoMovimiento === "ingreso-casa" && idSeleccionado) {
                            const found = proyectosConMesFijo.find(p => p.id === idSeleccionado)
                            if (found) setMesSeleccionado(found.mes.toString())
                          }
                        }}
                        className="w-full px-4 py-3 bg-white dark:bg-[var(--base-300)] text-[var(--foreground)] border-2 border-[var(--primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-200)] cursor-pointer font-semibold hover:border-[#0470c8] transition-all"
                      >
                        <option value="">Seleccionar proyecto...</option>
                        {proyectos.map((proyecto) => (
                          <option key={proyecto.id} value={proyecto.id}>{proyecto.nombre}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {tipoMovimiento === "ingreso-casa" && (
                    <div>
                      <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Fecha de Pago</label>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-[var(--base-600)] dark:text-[var(--base-400)] mb-1">Día</label>
                          <input
                            type="number" min="1" max="31" value={fechaPagoDia}
                            onChange={(e) => setFechaPagoDia(String(Math.min(31, Math.max(1, parseInt(e.target.value) || 1))).padStart(2, "0"))}
                            className="w-full px-3 py-2 bg-white dark:bg-[var(--base-300)] text-[var(--foreground)] border-2 border-[var(--primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-200)] font-semibold text-center"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[var(--base-600)] dark:text-[var(--base-400)] mb-1">Mes</label>
                          <select
                            value={fechaPagoMes}
                            onChange={(e) => setFechaPagoMes(String(parseInt(e.target.value)).padStart(2, "0"))}
                            className="w-full px-3 py-2 bg-white dark:bg-[var(--base-300)] text-[var(--foreground)] border-2 border-[var(--primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-200)] cursor-pointer font-semibold"
                          >
                            {meses.map((mes, idx) => (
                              <option key={idx} value={String(idx + 1).padStart(2, "0")}>{mes}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[var(--base-600)] dark:text-[var(--base-400)] mb-1">Año</label>
                          <select
                            value={fechaPagoAno}
                            onChange={(e) => setFechaPagoAno(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-[var(--base-300)] text-[var(--foreground)] border-2 border-[var(--primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-200)] cursor-pointer font-semibold"
                          >
                            {[2024, 2025, 2026, 2027, 2028].map((ano) => (
                              <option key={ano} value={ano}>{ano}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {tipoMovimiento === "pago-casa" && (
                    <div>
                      <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Categoría</label>
                      <select
                        value={categoria}
                        onChange={(e) => setCategoria(e.target.value)}
                        className="w-full px-4 py-3 bg-white dark:bg-[var(--base-300)] text-[var(--foreground)] border-2 border-[var(--primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-200)] cursor-pointer font-semibold hover:border-[#0470c8] transition-all"
                      >
                        <option value="">Seleccionar categoría...</option>
                        {opcionesCategoria.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {tipoMovimiento === "ingreso-casa" && (
                    <div>
                      <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Nombre del Ingreso</label>
                      <input
                        type="text" value={nombreIngreso}
                        onChange={(e) => setNombreIngreso(e.target.value)}
                        placeholder="Ej: Venta de materiales sobrantes"
                        className="input input-bordered w-full bg-[var(--base-50)] dark:bg-[var(--base-300)] border-[var(--primary-200)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-100)]"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Descripción</label>
                    <textarea
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      placeholder="Agrega más detalles sobre este movimiento..."
                      rows={4}
                      className="textarea textarea-bordered w-full bg-[var(--base-50)] dark:bg-[var(--base-300)] border-[var(--primary-200)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-100)] resize-none"
                    />
                  </div>
                </>
              )}

              {/* ── PAGO COMPUESTO ── */}
              {tipoMovimiento === "pago-compuesto" && (
                <>
                  {/* Total */}
                  <div>
                    <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Total</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--primary)]">₵</span>
                      <input
                        type="text"
                        value={monto ? formatCurrency(monto) : ""}
                        onChange={handleMontoChange}
                        placeholder="0"
                        className="input input-bordered w-full pl-8 bg-[var(--base-50)] dark:bg-[var(--base-300)] border-[var(--primary-200)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-100)]"
                      />
                    </div>
                  </div>

                  {/* Proyecto */}
                  <div>
                    <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Proyecto</label>
                    <select
                      value={proyectoSeleccionado}
                      onChange={(e) => setProyectoSeleccionado(e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-[var(--base-300)] text-[var(--foreground)] border-2 border-[var(--primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-200)] cursor-pointer font-semibold hover:border-[#0470c8] transition-all"
                    >
                      <option value="">Seleccionar proyecto...</option>
                      {proyectosConMesFijo.map((proyecto) => (
                        <option key={proyecto.id} value={proyecto.id}>{proyecto.nombre}</option>
                      ))}
                    </select>
                  </div>

                  {/* Barra de progreso restante */}
                  {totalNum > 0 && (
                    <div className="bg-[var(--base-50)] dark:bg-[var(--base-300)] border-2 border-[var(--primary-200)] rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-sm font-semibold">
                        <span className="text-[var(--base-600)] dark:text-[var(--base-400)]">Asignado:</span>
                        <span className="text-[var(--primary)]">{formatCurrency(sumaComponentes.toString())}</span>
                      </div>
                      <div className="w-full bg-[var(--base-200)] dark:bg-[var(--base-400)] rounded-full h-2.5">
                        <div
                          className="h-2.5 rounded-full transition-all"
                          style={{
                            width: `${Math.min((sumaComponentes / totalNum) * 100, 100)}%`,
                            backgroundColor: sumaComponentes > totalNum ? '#ef4444' : '#035496',
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-sm font-semibold">
                        <span className="text-[var(--base-600)] dark:text-[var(--base-400)]">Restante:</span>
                        <span className={restante < 0 ? "text-red-500" : "text-green-600"}>
                          {formatCurrency(Math.abs(restante).toString())}
                          {restante < 0 && " (excedido)"}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Componentes agregados */}
                  {componentesAcumulados.length > 0 && (
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-[var(--foreground)]">
                        Componentes ({componentesAcumulados.length})
                      </label>
                      {componentesAcumulados.map((comp, idx) => (
                        <div
                          key={comp.id}
                          className="flex items-center justify-between bg-[var(--base-50)] dark:bg-[var(--base-300)] border border-[var(--primary-200)] rounded-lg px-4 py-3"
                        >
                          <div className="space-y-0.5">
                            <p className="text-sm font-semibold text-[var(--foreground)]">
                              {idx + 1}. {comp.tipo === "pago-casa" ? "Pago Casa" : "Pago Administrativo"}
                            </p>
                            <p className="text-xs text-[var(--base-500)]">
                              {meses[comp.mes - 1]} {comp.ano}
                              {comp.categoria && ` · ${comp.categoria}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-[var(--primary)]">{formatCurrency(comp.monto)}</span>
                            <button
                              type="button"
                              onClick={() => eliminarComponente(comp.id)}
                              className="btn btn-ghost btn-xs btn-circle text-red-400 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Botón agregar componente */}
                  {!mostrarFormComponente && (
                    <button
                      type="button"
                      onClick={() => setMostrarFormComponente(true)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-[var(--primary)] rounded-lg text-[var(--primary)] font-semibold hover:bg-[var(--primary-50)] transition-all"
                    >
                      <Plus className="h-5 w-5" />
                      Agregar Componente
                    </button>
                  )}

                  {/* Formulario de componente */}
                  {mostrarFormComponente && (
                    <div className="border-2 border-[var(--primary-200)] rounded-xl p-4 space-y-4 bg-[var(--base-50)] dark:bg-[var(--base-300)]">
                      <p className="text-sm font-bold text-[var(--foreground)]">¿Qué tipo de pago quieres agregar?</p>

                      {/* Selector tipo componente */}
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setTipoComponente("pago-casa")}
                          className={`px-4 py-3 rounded-lg border-2 font-semibold text-sm transition-all ${
                            tipoComponente === "pago-casa"
                              ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                              : "border-[var(--primary-200)] text-[var(--foreground)] hover:border-[var(--primary)]"
                          }`}
                        >
                          Pago Casa
                        </button>
                        <button
                          type="button"
                          onClick={() => setTipoComponente("administrativo")}
                          className={`px-4 py-3 rounded-lg border-2 font-semibold text-sm transition-all ${
                            tipoComponente === "administrativo"
                              ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                              : "border-[var(--primary-200)] text-[var(--foreground)] hover:border-[var(--primary)]"
                          }`}
                        >
                          Pago Administrativo
                        </button>
                      </div>

                      {/* Campos del componente */}
                      {tipoComponente && (
                        <div className="space-y-4">
                          {/* Monto con sugerencia */}
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <label className="text-sm font-semibold text-[var(--foreground)]">Monto</label>
                              {restante > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setComponenteMonto(restante.toString())}
                                  className="text-xs text-[var(--primary)] font-semibold hover:underline"
                                >
                                  Usar restante: {formatCurrency(restante.toString())}
                                </button>
                              )}
                            </div>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--primary)]">₵</span>
                              <input
                                type="text"
                                value={componenteMonto ? formatCurrency(componenteMonto) : ""}
                                onChange={handleComponenteMontoChange}
                                placeholder={restante > 0 ? formatCurrency(restante.toString()) : "0"}
                                className="input input-bordered w-full pl-8 bg-white dark:bg-[var(--base-200)] border-[var(--primary-200)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-100)]"
                              />
                            </div>
                          </div>

                          {/* Mes y Año */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Mes</label>
                              <select
                                value={componenteMes}
                                onChange={(e) => setComponenteMes(e.target.value)}
                                className="w-full px-4 py-3 bg-white dark:bg-[var(--base-200)] text-[var(--foreground)] border-2 border-[var(--primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-200)] cursor-pointer font-semibold hover:border-[#0470c8] transition-all"
                              >
                                {meses.map((mes, idx) => (
                                  <option key={idx} value={idx + 1}>{mes}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Año</label>
                              <select
                                value={componenteAno}
                                onChange={(e) => setComponenteAno(e.target.value)}
                                className="w-full px-4 py-3 bg-white dark:bg-[var(--base-200)] text-[var(--foreground)] border-2 border-[var(--primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-200)] cursor-pointer font-semibold hover:border-[#0470c8] transition-all"
                              >
                                {[2024, 2025, 2026, 2027, 2028].map((ano) => (
                                  <option key={ano} value={ano}>{ano}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Categoría - solo pago-casa */}
                          {tipoComponente === "pago-casa" && (
                            <div>
                              <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Categoría</label>
                              <select
                                value={componenteCategoria}
                                onChange={(e) => setComponenteCategoria(e.target.value)}
                                className="w-full px-4 py-3 bg-white dark:bg-[var(--base-200)] text-[var(--foreground)] border-2 border-[var(--primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-200)] cursor-pointer font-semibold hover:border-[#0470c8] transition-all"
                              >
                                <option value="">Seleccionar categoría...</option>
                                {opcionesCategoria.map((cat) => (
                                  <option key={cat} value={cat}>{cat}</option>
                                ))}
                              </select>
                            </div>
                          )}

                          {/* Descripción */}
                          <div>
                            <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Descripción</label>
                            <textarea
                              value={componenteDescripcion}
                              onChange={(e) => setComponenteDescripcion(e.target.value)}
                              placeholder="Agrega más detalles..."
                              rows={3}
                              className="textarea textarea-bordered w-full bg-white dark:bg-[var(--base-200)] border-[var(--primary-200)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-100)] resize-none"
                            />
                          </div>

                          {/* Botones del componente */}
                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={agregarComponente}
                              disabled={!componenteMonto}
                              className="btn btn-primary flex-1 bg-[var(--primary)] hover:bg-[#0470c8] border-0 disabled:opacity-50"
                            >
                              Agregar
                            </button>
                            <button
                              type="button"
                              onClick={resetFormComponente}
                              className="btn btn-ghost flex-1"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Cancelar sin tipo seleccionado */}
                      {!tipoComponente && (
                        <button
                          type="button"
                          onClick={resetFormComponente}
                          className="w-full btn btn-ghost"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Botones principales */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="btn btn-primary flex-1 bg-[var(--primary)] hover:bg-[#0470c8] border-0"
                >
                  Guardar Movimiento
                </button>
                <Link href="/prueba" className="btn btn-ghost flex-1">
                  Cancelar
                </Link>
              </div>
            </form>
          </div>

          {/* Resumen */}
          {(monto || (tipoMovimiento === "pago-compuesto" && componentesAcumulados.length > 0)) && (
            <div className="bg-white dark:bg-[var(--base-200)] border-2 border-[var(--primary-200)] rounded-xl shadow-md p-6 mt-6">
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-4">Resumen</h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-[var(--base-600)] dark:text-[var(--base-400)]">Tipo:</span>
                  <span className="font-semibold ml-2">
                    {tipoMovimiento === "pago-casa" ? "Pago Casa"
                      : tipoMovimiento === "ingreso-casa" ? "Ingreso Casa"
                      : tipoMovimiento === "pago-compuesto" ? "Pago Compuesto"
                      : "Pago Administrativo"}
                  </span>
                </p>

                {tipoMovimiento === "pago-compuesto" ? (
                  <>
                    <p>
                      <span className="text-[var(--base-600)] dark:text-[var(--base-400)]">Total:</span>
                      <span className="font-semibold ml-2 text-[var(--primary)]">{formatCurrency(monto)}</span>
                    </p>
                    <p>
                      <span className="text-[var(--base-600)] dark:text-[var(--base-400)]">Componentes:</span>
                      <span className="font-semibold ml-2">{componentesAcumulados.length}</span>
                    </p>
                    <p>
                      <span className="text-[var(--base-600)] dark:text-[var(--base-400)]">Asignado:</span>
                      <span className="font-semibold ml-2 text-[var(--primary)]">{formatCurrency(sumaComponentes.toString())}</span>
                    </p>
                    {restante !== 0 && (
                      <p>
                        <span className="text-[var(--base-600)] dark:text-[var(--base-400)]">Restante:</span>
                        <span className={`font-semibold ml-2 ${restante < 0 ? "text-red-500" : "text-green-600"}`}>
                          {formatCurrency(Math.abs(restante).toString())}
                          {restante < 0 && " (excedido)"}
                        </span>
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    {monto && (
                      <p>
                        <span className="text-[var(--base-600)] dark:text-[var(--base-400)]">Monto:</span>
                        <span className="font-semibold ml-2 text-[var(--primary)]">{formatCurrency(monto)}</span>
                      </p>
                    )}
                    {tipoMovimiento !== "ingreso-casa" && (
                      <p>
                        <span className="text-[var(--base-600)] dark:text-[var(--base-400)]">Mes y Año:</span>
                        <span className="font-semibold ml-2">{meses[parseInt(mesSeleccionado) - 1]} {anoSeleccionado}</span>
                      </p>
                    )}
                    {proyectoSeleccionado && (
                      <p>
                        <span className="text-[var(--base-600)] dark:text-[var(--base-400)]">Proyecto:</span>
                        <span className="font-semibold ml-2">
                          {proyectos.find((p) => p.id === proyectoSeleccionado)?.nombre}
                        </span>
                      </p>
                    )}
                    {categoria && (
                      <p>
                        <span className="text-[var(--base-600)] dark:text-[var(--base-400)]">Categoría:</span>
                        <span className="font-semibold ml-2">{categoria}</span>
                      </p>
                    )}
                    {nombreIngreso && (
                      <p>
                        <span className="text-[var(--base-600)] dark:text-[var(--base-400)]">Ingreso:</span>
                        <span className="font-semibold ml-2">{nombreIngreso}</span>
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}