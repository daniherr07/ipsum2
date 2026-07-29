"use client"

import React, { useState } from "react"
import {
  Plus,
  Trash2,
  FileText,
  ChevronLeft,
  TrendingDown,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"
import Swal from "sweetalert2"

interface Proyecto {
  id: string
  nombre: string
  mes: number
}

interface ComponenteEgreso {
  id: string
  tipo: "egreso-general" | "egreso-administrativo"
  monto: string
  mes: number
  ano: number
  proyecto?: string
  categoria?: string
  ordenCompra?: string
  descripcion?: string
}

// FadeIn animation component - estilo consistente con el resto del sitio
function FadeIn({ children, delay = 0, className = "" }: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const [show, setShow] = useState(false)

  React.useEffect(() => {
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

// Campo de formulario con label consistente
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="form-control">
      <label className="label pt-0">
        <span className="label-text font-semibold">{label}</span>
      </label>
      {children}
    </div>
  )
}

const meses = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]

const ANOS = [2024, 2025, 2026, 2027, 2028]

const proyectos: Proyecto[] = [
  { id: "proj-1", nombre: "Proyecto Magna", mes: 1 },
  { id: "proj-2", nombre: "Centro Comercial", mes: 3 },
  { id: "proj-3", nombre: "Residencial Vista", mes: 2 },
  { id: "proj-4", nombre: "Oficinas Ejecutivas", mes: 4 },
  { id: "proj-5", nombre: "Plaza Principal", mes: 5 },
]

const opcionesCategoria = ["Mano de Obra", "Materiales", "Equipamiento", "Servicios", "Otros"]

export default function AgregarMovimientoPage() {
  const today = new Date()

  // Tipo de movimiento: solo 2 opciones
  const [tipoMovimiento, setTipoMovimiento] = useState<"egreso-proyecto" | "ingreso-proyecto">("egreso-proyecto")

  // Campos principales
  const [monto, setMonto] = useState("")
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState("")
  const [nombreIngreso, setNombreIngreso] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [fechaPagoDia, setFechaPagoDia] = useState(String(today.getDate()).padStart(2, "0"))
  const [fechaPagoMes, setFechaPagoMes] = useState(String(today.getMonth() + 1).padStart(2, "0"))
  const [fechaPagoAno, setFechaPagoAno] = useState(today.getFullYear().toString())

  // Componentes del egreso de proyecto
  const [componentes, setComponentes] = useState<ComponenteEgreso[]>([])
  const [mostrarFormComponente, setMostrarFormComponente] = useState(false)
  const [tipoComponente, setTipoComponente] = useState<"egreso-general" | "egreso-administrativo" | null>(null)
  const [componenteMonto, setComponenteMonto] = useState("")
  const [componenteMes, setComponenteMes] = useState(String(today.getMonth() + 1))
  const [componenteAno, setComponenteAno] = useState(today.getFullYear().toString())
  const [componenteProyecto, setComponenteProyecto] = useState("")
  const [componenteCategoria, setComponenteCategoria] = useState("")
  const [componenteOC, setComponenteOC] = useState("")
  const [componenteDescripcion, setComponenteDescripcion] = useState("")

  const esEgreso = tipoMovimiento === "egreso-proyecto"

  const formatCurrency = (value: string) => {
    const num = parseInt(value.replace(/\D/g, "")) || 0
    return new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: "CRC",
      minimumFractionDigits: 0,
    }).format(num)
  }

  const handleMontoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMonto(e.target.value.replace(/\D/g, ""))
  }

  const handleComponenteMontoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setComponenteMonto(e.target.value.replace(/\D/g, ""))
  }

  // Calcular restante (egreso de proyecto)
  const totalNum = parseInt(monto) || 0
  const sumaComponentes = componentes.reduce((sum, c) => sum + (parseInt(c.monto) || 0), 0)
  const restante = totalNum - sumaComponentes

  const resetFormComponente = () => {
    setTipoComponente(null)
    setComponenteMonto("")
    setComponenteMes(String(today.getMonth() + 1))
    setComponenteAno(today.getFullYear().toString())
    setComponenteProyecto("")
    setComponenteCategoria("")
    setComponenteOC("")
    setComponenteDescripcion("")
    setMostrarFormComponente(false)
  }

  const cambiarTipo = (tipo: "egreso-proyecto" | "ingreso-proyecto") => {
    setTipoMovimiento(tipo)
    setMonto("")
    setProyectoSeleccionado("")
    setNombreIngreso("")
    setDescripcion("")
    setComponentes([])
    resetFormComponente()
  }

  const agregarComponente = () => {
    if (!tipoComponente || !componenteMonto) return

    const nuevo: ComponenteEgreso = {
      id: Date.now().toString(),
      tipo: tipoComponente,
      monto: componenteMonto,
      mes: parseInt(componenteMes),
      ano: parseInt(componenteAno),
      proyecto: tipoComponente === "egreso-general" ? componenteProyecto : undefined,
      categoria: tipoComponente === "egreso-general" ? componenteCategoria : undefined,
      ordenCompra:
        tipoComponente === "egreso-general" && componenteOC ? componenteOC : undefined,
      descripcion: componenteDescripcion,
    }

    setComponentes([...componentes, nuevo])
    resetFormComponente()
  }

  const eliminarComponente = (id: string) => {
    setComponentes(componentes.filter((c) => c.id !== id))
  }

  const nombreProyecto = (id?: string) =>
    proyectos.find((p) => p.id === id)?.nombre

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (esEgreso) {
      if (componentes.length === 0) {
        Swal.fire({
          icon: "warning",
          title: "Egresos requeridos",
          text: "Debes agregar al menos un tipo de egreso",
          confirmButtonColor: "#035496",
        })
        return
      }

      Swal.fire({
        icon: "success",
        title: "¡Movimiento guardado!",
        html: `
          <div style="text-align: left;">
            <p><strong>Tipo:</strong> Egreso de proyecto</p>
            <p><strong>Total:</strong> ${formatCurrency(monto)}</p>
            <p><strong>Egresos:</strong> ${componentes.length}</p>
          </div>
        `,
        confirmButtonColor: "#dc2626",
      })

      console.log({
        tipoMovimiento: "egreso-proyecto",
        montoTotal: totalNum,
        componentes,
      })
    } else {
      Swal.fire({
        icon: "success",
        title: "¡Movimiento guardado!",
        html: `
          <div style="text-align: left;">
            <p><strong>Tipo:</strong> Ingreso de proyecto</p>
            <p><strong>Monto:</strong> ${formatCurrency(monto)}</p>
            ${proyectoSeleccionado ? `<p><strong>Proyecto:</strong> ${nombreProyecto(proyectoSeleccionado)}</p>` : ""}
          </div>
        `,
        confirmButtonColor: "#16a34a",
      })

      console.log({
        tipoMovimiento: "ingreso-proyecto",
        monto,
        proyecto: proyectoSeleccionado,
        nombreIngreso,
        fechaPago: `${fechaPagoDia}/${fechaPagoMes}/${fechaPagoAno}`,
        descripcion,
      })
    }
  }

  return (
    <div className="min-h-[calc(100svh-64px)] bg-base-200">
      <main className="p-3 sm:p-4 lg:p-6">
        <div className="max-w-2xl mx-auto flex flex-col gap-4 sm:gap-5">

          {/* Header */}
          <FadeIn delay={0} className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="btn btn-ghost btn-circle btn-sm sm:btn-md shrink-0"
              aria-label="Volver al inicio"
            >
              <ChevronLeft size={22} />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-black">Agregar Movimiento</h1>
              <p className="text-xs sm:text-sm text-base-content/60">
                Registra un egreso o ingreso de proyecto
              </p>
            </div>
          </FadeIn>

          {/* Selector de tipo: segmented control (2 opciones) */}
          <FadeIn delay={50}>
            <div className="bg-base-100 rounded-lg shadow-md p-1.5 grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => cambiarTipo("egreso-proyecto")}
                className={`flex items-center justify-center gap-2 rounded-md px-2 sm:px-3 py-2.5 text-xs sm:text-sm font-bold transition-all ${
                  esEgreso
                    ? "bg-error text-white shadow-sm"
                    : "text-base-content/60 hover:bg-base-200"
                }`}
              >
                <TrendingDown size={16} className="shrink-0" />
                Egreso de proyecto
              </button>
              <button
                type="button"
                onClick={() => cambiarTipo("ingreso-proyecto")}
                className={`flex items-center justify-center gap-2 rounded-md px-2 sm:px-3 py-2.5 text-xs sm:text-sm font-bold transition-all ${
                  !esEgreso
                    ? "bg-success text-white shadow-sm"
                    : "text-base-content/60 hover:bg-base-200"
                }`}
              >
                <TrendingUp size={16} className="shrink-0" />
                Ingreso de proyecto
              </button>
            </div>
          </FadeIn>

          {/* Formulario */}
          <FadeIn delay={100} className="bg-base-100 rounded-lg shadow-md">
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 flex flex-col gap-5">

              {/* ── INGRESO DE PROYECTO ── */}
              {!esEgreso && (
                <>
                  <Field label="Proyecto">
                    <select
                      value={proyectoSeleccionado}
                      onChange={(e) => setProyectoSeleccionado(e.target.value)}
                      className="select select-bordered w-full"
                    >
                      <option value="">Seleccionar proyecto...</option>
                      {proyectos.map((proyecto) => (
                        <option key={proyecto.id} value={proyecto.id}>
                          {proyecto.nombre}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Monto">
                    <label className="input input-bordered input-success flex items-center gap-2 w-full">
                      <span className="text-success font-bold">₡</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={monto ? formatCurrency(monto) : ""}
                        onChange={handleMontoChange}
                        placeholder="₡0"
                        className="grow"
                      />
                    </label>
                  </Field>

                  <Field label="Nombre del Ingreso">
                    <input
                      type="text"
                      value={nombreIngreso}
                      onChange={(e) => setNombreIngreso(e.target.value)}
                      placeholder="Ej: Venta de materiales sobrantes"
                      className="input input-bordered input-success w-full"
                    />
                  </Field>

                  <Field label="Fecha de Pago">
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="label py-1">
                          <span className="label-text text-xs text-base-content/60">Día</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="31"
                          value={fechaPagoDia}
                          onChange={(e) =>
                            setFechaPagoDia(
                              String(Math.min(31, Math.max(1, parseInt(e.target.value) || 1))).padStart(2, "0"),
                            )
                          }
                          className="input input-bordered input-success w-full text-center"
                        />
                      </div>
                      <div>
                        <label className="label py-1">
                          <span className="label-text text-xs text-base-content/60">Mes</span>
                        </label>
                        <select
                          value={fechaPagoMes}
                          onChange={(e) =>
                            setFechaPagoMes(String(parseInt(e.target.value)).padStart(2, "0"))
                          }
                          className="select select-bordered select-success w-full"
                        >
                          {meses.map((mes, idx) => (
                            <option key={idx} value={String(idx + 1).padStart(2, "0")}>
                              {mes}
                            </option>
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
                          {ANOS.map((ano) => (
                            <option key={ano} value={ano}>{ano}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </Field>

                  <Field label="Descripción">
                    <textarea
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      placeholder="Agrega más detalles sobre este movimiento..."
                      rows={4}
                      className="textarea textarea-bordered w-full resize-none"
                    />
                  </Field>
                </>
              )}

              {/* ── EGRESO DE PROYECTO ── */}
              {esEgreso && (
                <>
                  {/* Total */}
                  <Field label="Total del egreso">
                    <label className="input input-bordered input-error flex items-center gap-2 w-full">
                      <span className="text-error font-bold">₡</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={monto ? formatCurrency(monto) : ""}
                        onChange={handleMontoChange}
                        placeholder="₡0"
                        className="grow"
                      />
                    </label>
                  </Field>

                  {/* Barra de progreso restante */}
                  {totalNum > 0 && (
                    <div className="bg-base-200 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-base-content/60">Asignado:</span>
                        <span className="font-semibold text-error">
                          {formatCurrency(sumaComponentes.toString())}
                        </span>
                      </div>
                      <progress
                        className={`progress w-full h-2 ${
                          sumaComponentes > totalNum ? "progress-error" : "progress-primary"
                        }`}
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

                  {/* Egresos agregados */}
                  {componentes.length > 0 && (
                    <div className="space-y-3">
                      <label className="label pt-0">
                        <span className="label-text font-semibold">
                          Egresos agregados ({componentes.length})
                        </span>
                      </label>
                      {componentes.map((comp, idx) => (
                        <div
                          key={comp.id}
                          className="flex items-center justify-between gap-2 bg-base-200 rounded-lg px-3 sm:px-4 py-3"
                        >
                          <div className="space-y-0.5 min-w-0">
                            <p className="text-sm font-semibold">
                              {idx + 1}.{" "}
                              {comp.tipo === "egreso-general"
                                ? "Egreso General"
                                : "Egreso Administrativo"}
                            </p>
                            <p className="text-xs text-base-content/60 truncate">
                              {comp.tipo === "egreso-general"
                                ? [
                                    nombreProyecto(comp.proyecto),
                                    comp.categoria,
                                    comp.ordenCompra,
                                  ]
                                    .filter(Boolean)
                                    .join(" · ")
                                : `${meses[comp.mes - 1]} ${comp.ano}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-bold text-error text-sm">
                              {formatCurrency(comp.monto)}
                            </span>
                            <button
                              type="button"
                              onClick={() => eliminarComponente(comp.id)}
                              className="btn btn-ghost btn-xs btn-circle text-error hover:bg-error/10"
                              aria-label="Eliminar egreso"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Botón agregar tipo de egreso */}
                  {!mostrarFormComponente && (
                    <button
                      type="button"
                      onClick={() => setMostrarFormComponente(true)}
                      className="btn btn-outline btn-error border-dashed w-full gap-2"
                    >
                      <Plus className="size-5" />
                      Agregar tipo de egreso
                    </button>
                  )}

                  {/* Formulario de componente */}
                  {mostrarFormComponente && (
                    <div className="bg-base-200 rounded-lg p-4 flex flex-col gap-4">
                      <p className="font-semibold text-sm">
                        ¿Qué tipo de egreso querés agregar?
                      </p>

                      {/* Selector tipo de egreso */}
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setTipoComponente("egreso-general")}
                          className={`btn btn-sm sm:btn-md ${
                            tipoComponente === "egreso-general"
                              ? "btn-error"
                              : "btn-outline btn-error"
                          }`}
                        >
                          Egreso General
                        </button>
                        <button
                          type="button"
                          onClick={() => setTipoComponente("egreso-administrativo")}
                          className={`btn btn-sm sm:btn-md ${
                            tipoComponente === "egreso-administrativo"
                              ? "btn-warning"
                              : "btn-outline btn-warning"
                          }`}
                        >
                          Egreso Administrativo
                        </button>
                      </div>

                      {/* Campos del componente */}
                      {tipoComponente && (
                        <div className="flex flex-col gap-4">
                          {/* Monto con sugerencia de restante */}
                          <div className="form-control">
                            <label className="label pt-0">
                              <span className="label-text font-semibold">Monto</span>
                              {restante > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setComponenteMonto(restante.toString())}
                                  className="label-text-alt link link-primary"
                                >
                                  Usar restante: {formatCurrency(restante.toString())}
                                </button>
                              )}
                            </label>
                            <label className="input input-bordered flex items-center gap-2 w-full">
                              <span className="text-base-content/60 font-bold">₡</span>
                              <input
                                type="text"
                                inputMode="numeric"
                                value={componenteMonto ? formatCurrency(componenteMonto) : ""}
                                onChange={handleComponenteMontoChange}
                                placeholder={restante > 0 ? formatCurrency(restante.toString()) : "₡0"}
                                className="grow"
                              />
                            </label>
                          </div>

                          {/* Mes y Año - solo Egreso Administrativo */}
                          {tipoComponente === "egreso-administrativo" && (
                            <div className="grid grid-cols-2 gap-4">
                              <div className="form-control">
                                <label className="label pt-0">
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
                                <label className="label pt-0">
                                  <span className="label-text font-semibold">Año</span>
                                </label>
                                <select
                                  value={componenteAno}
                                  onChange={(e) => setComponenteAno(e.target.value)}
                                  className="select select-bordered w-full"
                                >
                                  {ANOS.map((ano) => (
                                    <option key={ano} value={ano}>{ano}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          )}

                          {/* Proyecto, Categoría y OC - solo Egreso General */}
                          {tipoComponente === "egreso-general" && (
                            <>
                              <div className="form-control">
                                <label className="label pt-0">
                                  <span className="label-text font-semibold">Proyecto</span>
                                </label>
                                <select
                                  value={componenteProyecto}
                                  onChange={(e) => setComponenteProyecto(e.target.value)}
                                  className="select select-bordered w-full"
                                >
                                  <option value="">Seleccionar proyecto...</option>
                                  {proyectos.map((proyecto) => (
                                    <option key={proyecto.id} value={proyecto.id}>
                                      {proyecto.nombre}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div className="form-control">
                                <label className="label pt-0">
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

                              <div className="form-control">
                                <label className="label pt-0">
                                  <span className="label-text font-semibold">
                                    Orden de Compra (opcional)
                                  </span>
                                </label>
                                <select
                                  value={componenteOC}
                                  onChange={(e) => {
                                    if (e.target.value === "agregar-nuevo") {
                                      Swal.fire({
                                        title: "Nueva Orden de Compra",
                                        input: "text",
                                        inputLabel: "Ingrese el nombre de la nueva OC",
                                        inputPlaceholder: "Ej: OC4",
                                        confirmButtonText: "Crear",
                                        confirmButtonColor: "#035496",
                                        showCancelButton: true,
                                      }).then((result) => {
                                        if (result.isConfirmed && result.value) {
                                          setComponenteOC(result.value)
                                        }
                                      })
                                    } else {
                                      setComponenteOC(e.target.value)
                                    }
                                  }}
                                  className="select select-bordered w-full"
                                >
                                  <option value="">Seleccionar OC...</option>
                                  <option value="OC1">OC1</option>
                                  <option value="OC2">OC2</option>
                                  <option value="OC3">OC3</option>
                                  <option value="agregar-nuevo">+ Agregar nuevo</option>
                                </select>
                              </div>
                            </>
                          )}

                          {/* Descripción */}
                          <div className="form-control">
                            <label className="label pt-0">
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
                              className="btn btn-error flex-1"
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
                  )}
                </>
              )}

              {/* Botones principales */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className={`btn flex-1 ${esEgreso ? "btn-error" : "btn-success"}`}
                >
                  Guardar Movimiento
                </button>
                <Link href="/" className="btn btn-ghost flex-1">
                  Cancelar
                </Link>
              </div>
            </form>
          </FadeIn>

          {/* Resumen */}
          {(monto || (esEgreso && componentes.length > 0)) && (
            <FadeIn delay={200} className="bg-base-100 rounded-lg shadow-md">
              <div className="p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      esEgreso ? "bg-error/10" : "bg-success/10"
                    }`}
                  >
                    <FileText className={`size-4 ${esEgreso ? "text-error" : "text-success"}`} />
                  </div>
                  <h3 className="font-bold text-base">Resumen</h3>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-1 border-b border-base-200">
                    <span className="text-base-content/60">Tipo</span>
                    <span className="font-semibold">
                      {esEgreso ? "Egreso de proyecto" : "Ingreso de proyecto"}
                    </span>
                  </div>

                  {esEgreso ? (
                    <>
                      {monto && (
                        <div className="flex justify-between py-1 border-b border-base-200">
                          <span className="text-base-content/60">Total</span>
                          <span className="font-semibold text-error">
                            {formatCurrency(monto)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between py-1 border-b border-base-200">
                        <span className="text-base-content/60">Egresos</span>
                        <span className="badge badge-error badge-sm">
                          {componentes.length}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-base-200">
                        <span className="text-base-content/60">Asignado</span>
                        <span className="font-semibold text-error">
                          {formatCurrency(sumaComponentes.toString())}
                        </span>
                      </div>
                      {restante !== 0 && (
                        <div className="flex justify-between py-1">
                          <span className="text-base-content/60">Restante</span>
                          <span
                            className={`font-semibold ${
                              restante < 0 ? "text-error" : "text-success"
                            }`}
                          >
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
                          <span className="font-semibold text-success">
                            {formatCurrency(monto)}
                          </span>
                        </div>
                      )}
                      {proyectoSeleccionado && (
                        <div className="flex justify-between py-1 border-b border-base-200">
                          <span className="text-base-content/60">Proyecto</span>
                          <span className="font-semibold">
                            {nombreProyecto(proyectoSeleccionado)}
                          </span>
                        </div>
                      )}
                      {nombreIngreso && (
                        <div className="flex justify-between py-1 border-b border-base-200">
                          <span className="text-base-content/60">Ingreso</span>
                          <span className="font-semibold">{nombreIngreso}</span>
                        </div>
                      )}
                      <div className="flex justify-between py-1">
                        <span className="text-base-content/60">Fecha de Pago</span>
                        <span className="font-semibold">
                          {fechaPagoDia}/{fechaPagoMes}/{fechaPagoAno}
                        </span>
                      </div>
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
