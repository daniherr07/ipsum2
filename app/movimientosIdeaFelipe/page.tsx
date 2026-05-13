"use client"

import React, { useState, useMemo, useEffect } from "react"
import { Plus, Trash2, FileText, DollarSign, Building2, Calendar } from "lucide-react"
import Link from "next/link"

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

// FadeIn animation component - estilo stats/prueba
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
    <div className="min-h-screen bg-base-200">
      <main className="p-4 lg:p-6">
        <div className="max-w-2xl mx-auto flex flex-col gap-4 lg:gap-5">
          
          {/* Header Card */}
          <FadeIn delay={0} className="card bg-base-100 shadow-md">
            <div className="card-body p-4 lg:p-6">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  tipoMovimiento === "ingreso-casa" ? "bg-success/10" :
                  tipoMovimiento === "pago-compuesto" ? "bg-secondary/10" :
                  tipoMovimiento === "administrativo" ? "bg-warning/10" : "bg-error/10"
                }`}>
                  <FileText className={`size-5 ${
                    tipoMovimiento === "ingreso-casa" ? "text-success" :
                    tipoMovimiento === "pago-compuesto" ? "text-secondary" :
                    tipoMovimiento === "administrativo" ? "text-warning" : "text-error"
                  }`} />
                </div>
                <div>
                  <h1 className={`card-title text-xl lg:text-2xl ${
                    tipoMovimiento === "ingreso-casa" ? "text-success" :
                    tipoMovimiento === "pago-compuesto" ? "text-secondary" :
                    tipoMovimiento === "administrativo" ? "text-warning" : "text-error"
                  }`}>Nuevo Movimiento</h1>
                  <p className="text-sm text-base-content/60">
                    {tipoMovimiento === "ingreso-casa" ? "Registrar ingreso de casa" :
                     tipoMovimiento === "pago-compuesto" ? "Pago con múltiples componentes" :
                     tipoMovimiento === "administrativo" ? "Gasto administrativo" : "Pago de casa"}
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Form Card */}
          <FadeIn delay={100} className="card bg-base-100 shadow-md">
            <div className="card-body p-4 lg:p-6">
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Tipo de Movimiento */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Tipo de Movimiento</span>
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
                    className="select select-bordered w-full"
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
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">Monto</span>
                      </label>
                      <label className="input input-bordered input-primary flex items-center gap-2">
                        <DollarSign className="size-4 text-primary" />
                        <input
                          type="text"
                          value={monto ? formatCurrency(monto) : ""}
                          onChange={handleMontoChange}
                          placeholder="₡0"
                          className="grow"
                        />
                      </label>
                    </div>

                    {tipoMovimiento === "ingreso-casa" ? (
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold">Mes</span>
                        </label>
                        <div className="input input-bordered bg-base-200 flex items-center">
                          <Calendar className="size-4 text-base-content/60 mr-2" />
                          <span className="font-medium">{meses[parseInt(mesSeleccionado) - 1] || "Sin proyecto"}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text font-semibold">Mes</span>
                          </label>
                          <select
                            value={mesSeleccionado}
                            onChange={(e) => { setMesSeleccionado(e.target.value); setProyectoSeleccionado("") }}
                            className="select select-bordered w-full"
                          >
                            {meses.map((mes, idx) => (
                              <option key={idx} value={idx + 1}>{mes}</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text font-semibold">Año</span>
                          </label>
                          <select
                            value={anoSeleccionado}
                            onChange={(e) => { setAnoSeleccionado(e.target.value); setProyectoSeleccionado("") }}
                            className="select select-bordered w-full"
                          >
                            {[2024, 2025, 2026, 2027, 2028].map((ano) => (
                              <option key={ano} value={ano}>{ano}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    {tipoMovimiento !== "administrativo" && (
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold">Proyecto</span>
                        </label>
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
                          className="select select-bordered w-full"
                        >
                          <option value="">Seleccionar proyecto...</option>
                          {proyectos.map((proyecto) => (
                            <option key={proyecto.id} value={proyecto.id}>{proyecto.nombre}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {tipoMovimiento === "ingreso-casa" && (
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold">Fecha de Pago</span>
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="label py-1">
                              <span className="label-text text-xs text-base-content/60">Día</span>
                            </label>
                            <input
                              type="number" min="1" max="31" value={fechaPagoDia}
                              onChange={(e) => setFechaPagoDia(String(Math.min(31, Math.max(1, parseInt(e.target.value) || 1))).padStart(2, "0"))}
                              className="input input-bordered input-success w-full text-center"
                            />
                          </div>
                          <div>
                            <label className="label py-1">
                              <span className="label-text text-xs text-base-content/60">Mes</span>
                            </label>
                            <select
                              value={fechaPagoMes}
                              onChange={(e) => setFechaPagoMes(String(parseInt(e.target.value)).padStart(2, "0"))}
                              className="select select-bordered select-success w-full"
                            >
                              {meses.map((mes, idx) => (
                                <option key={idx} value={String(idx + 1).padStart(2, "0")}>{mes}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="label py-1">
                              <span className="label-text text-xs text-base-content/60">Año</span>
                            </label>
                            <select
                              value={fechaPagoAno}
                              onChange={(e) => setFechaPagoAno(e.target.value)}
                              className="select select-bordered select-success w-full"
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
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold">Categoría</span>
                        </label>
                        <select
                          value={categoria}
                          onChange={(e) => setCategoria(e.target.value)}
                          className="select select-bordered w-full"
                        >
                          <option value="">Seleccionar categoría...</option>
                          {opcionesCategoria.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {tipoMovimiento === "ingreso-casa" && (
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold">Nombre del Ingreso</span>
                        </label>
                        <input
                          type="text" value={nombreIngreso}
                          onChange={(e) => setNombreIngreso(e.target.value)}
                          placeholder="Ej: Venta de materiales sobrantes"
                          className="input input-bordered input-success w-full"
                        />
                      </div>
                    )}

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">Descripción</span>
                      </label>
                      <textarea
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        placeholder="Agrega más detalles sobre este movimiento..."
                        rows={4}
                        className="textarea textarea-bordered w-full resize-none"
                      />
                    </div>
                  </>
                )}

                {/* ── PAGO COMPUESTO ── */}
                {tipoMovimiento === "pago-compuesto" && (
                  <>
                    {/* Total */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">Total</span>
                      </label>
                      <label className="input input-bordered input-secondary flex items-center gap-2">
                        <DollarSign className="size-4 text-secondary" />
                        <input
                          type="text"
                          value={monto ? formatCurrency(monto) : ""}
                          onChange={handleMontoChange}
                          placeholder="₡0"
                          className="grow"
                        />
                      </label>
                    </div>

                    {/* Proyecto */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">Proyecto</span>
                      </label>
                      <select
                        value={proyectoSeleccionado}
                        onChange={(e) => setProyectoSeleccionado(e.target.value)}
                        className="select select-bordered w-full"
                      >
                        <option value="">Seleccionar proyecto...</option>
                        {proyectosConMesFijo.map((proyecto) => (
                          <option key={proyecto.id} value={proyecto.id}>{proyecto.nombre}</option>
                        ))}
                      </select>
                    </div>

                    {/* Barra de progreso restante */}
                    {totalNum > 0 && (
                      <div className="bg-base-200 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-base-content/60">Asignado:</span>
                          <span className="font-semibold text-secondary">{formatCurrency(sumaComponentes.toString())}</span>
                        </div>
                        <progress 
                          className={`progress w-full h-2 ${sumaComponentes > totalNum ? 'progress-error' : 'progress-secondary'}`}
                          value={sumaComponentes} 
                          max={totalNum}
                        />
                        <div className="flex justify-between text-sm">
                          <span className="text-base-content/60">Restante:</span>
                          <span className={`font-semibold ${restante < 0 ? "text-error" : "text-success"}`}>
                            {formatCurrency(Math.abs(restante).toString())}
                            {restante < 0 && " (excedido)"}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Componentes agregados */}
                    {componentesAcumulados.length > 0 && (
                      <div className="space-y-3">
                        <label className="label">
                          <span className="label-text font-semibold">Componentes ({componentesAcumulados.length})</span>
                        </label>
                        {componentesAcumulados.map((comp, idx) => (
                          <div
                            key={comp.id}
                            className="flex items-center justify-between bg-base-200 rounded-lg px-4 py-3"
                          >
                            <div className="space-y-0.5">
                              <p className="text-sm font-semibold">
                                {idx + 1}. {comp.tipo === "pago-casa" ? "Pago Casa" : "Pago Administrativo"}
                              </p>
                              <p className="text-xs text-base-content/60">
                                {meses[comp.mes - 1]} {comp.ano}
                                {comp.categoria && ` · ${comp.categoria}`}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-secondary">{formatCurrency(comp.monto)}</span>
                              <button
                                type="button"
                                onClick={() => eliminarComponente(comp.id)}
                                className="btn btn-ghost btn-xs btn-circle text-error hover:bg-error/10"
                              >
                                <Trash2 className="size-4" />
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
                        className="btn btn-outline btn-secondary w-full gap-2"
                      >
                        <Plus className="size-5" />
                        Agregar Componente
                      </button>
                    )}

                    {/* Formulario de componente */}
                    {mostrarFormComponente && (
                      <div className="card bg-base-200">
                        <div className="card-body p-4 space-y-4">
                          <p className="font-semibold">¿Qué tipo de pago quieres agregar?</p>

                          {/* Selector tipo componente */}
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => setTipoComponente("pago-casa")}
                              className={`btn ${tipoComponente === "pago-casa" ? "btn-error" : "btn-outline btn-error"}`}
                            >
                              Pago Casa
                            </button>
                            <button
                              type="button"
                              onClick={() => setTipoComponente("administrativo")}
                              className={`btn ${tipoComponente === "administrativo" ? "btn-warning" : "btn-outline btn-warning"}`}
                            >
                              Pago Administrativo
                            </button>
                          </div>

                          {/* Campos del componente */}
                          {tipoComponente && (
                            <div className="space-y-4">
                              {/* Monto con sugerencia */}
                              <div className="form-control">
                                <label className="label">
                                  <span className="label-text font-semibold">Monto</span>
                                  {restante > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => setComponenteMonto(restante.toString())}
                                      className="label-text-alt link link-secondary"
                                    >
                                      Usar restante: {formatCurrency(restante.toString())}
                                    </button>
                                  )}
                                </label>
                                <label className="input input-bordered flex items-center gap-2">
                                  <DollarSign className="size-4 text-base-content/60" />
                                  <input
                                    type="text"
                                    value={componenteMonto ? formatCurrency(componenteMonto) : ""}
                                    onChange={handleComponenteMontoChange}
                                    placeholder={restante > 0 ? formatCurrency(restante.toString()) : "₡0"}
                                    className="grow"
                                  />
                                </label>
                              </div>

                              {/* Mes y Año */}
                              <div className="grid grid-cols-2 gap-4">
                                <div className="form-control">
                                  <label className="label">
                                    <span className="label-text font-semibold">Mes</span>
                                  </label>
                                  <select
                                    value={componenteMes}
                                    onChange={(e) => setComponenteMes(e.target.value)}
                                    className="select select-bordered w-full"
                                  >
                                    {meses.map((mes, idx) => (
                                      <option key={idx} value={idx + 1}>{mes}</option>
                                    ))}
                                  </select>
                                </div>
                                <div className="form-control">
                                  <label className="label">
                                    <span className="label-text font-semibold">Año</span>
                                  </label>
                                  <select
                                    value={componenteAno}
                                    onChange={(e) => setComponenteAno(e.target.value)}
                                    className="select select-bordered w-full"
                                  >
                                    {[2024, 2025, 2026, 2027, 2028].map((ano) => (
                                      <option key={ano} value={ano}>{ano}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              {/* Categoría - solo pago-casa */}
                              {tipoComponente === "pago-casa" && (
                                <div className="form-control">
                                  <label className="label">
                                    <span className="label-text font-semibold">Categoría</span>
                                  </label>
                                  <select
                                    value={componenteCategoria}
                                    onChange={(e) => setComponenteCategoria(e.target.value)}
                                    className="select select-bordered w-full"
                                  >
                                    <option value="">Seleccionar categoría...</option>
                                    {opcionesCategoria.map((cat) => (
                                      <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                  </select>
                                </div>
                              )}

                              {/* Descripción */}
                              <div className="form-control">
                                <label className="label">
                                  <span className="label-text font-semibold">Descripción</span>
                                </label>
                                <textarea
                                  value={componenteDescripcion}
                                  onChange={(e) => setComponenteDescripcion(e.target.value)}
                                  placeholder="Agrega más detalles..."
                                  rows={3}
                                  className="textarea textarea-bordered w-full resize-none"
                                />
                              </div>

                              {/* Botones del componente */}
                              <div className="flex gap-3">
                                <button
                                  type="button"
                                  onClick={agregarComponente}
                                  disabled={!componenteMonto}
                                  className="btn btn-secondary flex-1"
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
                              className="btn btn-ghost w-full"
                            >
                              Cancelar
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Botones principales */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className={`btn flex-1 ${
                      tipoMovimiento === "ingreso-casa" ? "btn-success" :
                      tipoMovimiento === "pago-compuesto" ? "btn-secondary" :
                      tipoMovimiento === "administrativo" ? "btn-warning" : "btn-error"
                    }`}
                  >
                    Guardar Movimiento
                  </button>
                  <Link href="/prueba" className="btn btn-ghost flex-1">
                    Cancelar
                  </Link>
                </div>
              </form>
            </div>
          </FadeIn>

          {/* Resumen Card */}
          {(monto || (tipoMovimiento === "pago-compuesto" && componentesAcumulados.length > 0)) && (
            <FadeIn delay={200} className="card bg-base-100 shadow-md">
              <div className="card-body p-4 lg:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    tipoMovimiento === "ingreso-casa" ? "bg-success/10" :
                    tipoMovimiento === "pago-compuesto" ? "bg-secondary/10" :
                    tipoMovimiento === "administrativo" ? "bg-warning/10" : "bg-error/10"
                  }`}>
                    <Building2 className={`size-4 ${
                      tipoMovimiento === "ingreso-casa" ? "text-success" :
                      tipoMovimiento === "pago-compuesto" ? "text-secondary" :
                      tipoMovimiento === "administrativo" ? "text-warning" : "text-error"
                    }`} />
                  </div>
                  <h3 className="card-title text-base">Resumen</h3>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-1 border-b border-base-200">
                    <span className="text-base-content/60">Tipo</span>
                    <span className="font-semibold">
                      {tipoMovimiento === "pago-casa" ? "Pago Casa"
                        : tipoMovimiento === "ingreso-casa" ? "Ingreso Casa"
                        : tipoMovimiento === "pago-compuesto" ? "Pago Compuesto"
                        : "Pago Administrativo"}
                    </span>
                  </div>

                  {tipoMovimiento === "pago-compuesto" ? (
                    <>
                      <div className="flex justify-between py-1 border-b border-base-200">
                        <span className="text-base-content/60">Total</span>
                        <span className="font-semibold text-secondary">{formatCurrency(monto)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-base-200">
                        <span className="text-base-content/60">Componentes</span>
                        <span className="badge badge-secondary badge-sm">{componentesAcumulados.length}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-base-200">
                        <span className="text-base-content/60">Asignado</span>
                        <span className="font-semibold text-secondary">{formatCurrency(sumaComponentes.toString())}</span>
                      </div>
                      {restante !== 0 && (
                        <div className="flex justify-between py-1">
                          <span className="text-base-content/60">Restante</span>
                          <span className={`font-semibold ${restante < 0 ? "text-error" : "text-success"}`}>
                            {formatCurrency(Math.abs(restante).toString())}
                            {restante < 0 && " (excedido)"}
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {monto && (
                        <div className="flex justify-between py-1 border-b border-base-200">
                          <span className="text-base-content/60">Monto</span>
                          <span className={`font-semibold ${
                            tipoMovimiento === "ingreso-casa" ? "text-success" :
                            tipoMovimiento === "administrativo" ? "text-warning" : "text-error"
                          }`}>{formatCurrency(monto)}</span>
                        </div>
                      )}
                      {tipoMovimiento !== "ingreso-casa" && (
                        <div className="flex justify-between py-1 border-b border-base-200">
                          <span className="text-base-content/60">Mes y Año</span>
                          <span className="font-semibold">{meses[parseInt(mesSeleccionado) - 1]} {anoSeleccionado}</span>
                        </div>
                      )}
                      {proyectoSeleccionado && (
                        <div className="flex justify-between py-1 border-b border-base-200">
                          <span className="text-base-content/60">Proyecto</span>
                          <span className="font-semibold">
                            {proyectos.find((p) => p.id === proyectoSeleccionado)?.nombre}
                          </span>
                        </div>
                      )}
                      {categoria && (
                        <div className="flex justify-between py-1 border-b border-base-200">
                          <span className="text-base-content/60">Categoría</span>
                          <span className="badge badge-ghost badge-sm">{categoria}</span>
                        </div>
                      )}
                      {nombreIngreso && (
                        <div className="flex justify-between py-1">
                          <span className="text-base-content/60">Ingreso</span>
                          <span className="font-semibold">{nombreIngreso}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </FadeIn>
          )}

        </div>
      </main>
    </div>
  )
}