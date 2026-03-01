"use client"

import { useState, useMemo } from "react"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
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
  mes?: number
  ano?: number
  proyecto?: string
  categoria?: string
  descripcion?: string
}

// Estilos globales para los options del select
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
  
  // Estados para fecha de pago (ingreso-casa)
  const today = new Date()
  const [fechaPagoDia, setFechaPagoDia] = useState(String(today.getDate()).padStart(2, "0"))
  const [fechaPagoMes, setFechaPagoMes] = useState(String(today.getMonth() + 1).padStart(2, "0"))
  const [fechaPagoAno, setFechaPagoAno] = useState(today.getFullYear().toString())

  // Estados para pago compuesto
  const [tipoComponenteSeleccionado, setTipoComponenteSeleccionado] = useState<"pago-casa" | "administrativo" | null>(null)
  const [componentesTemporal, setComponentesTemporal] = useState<Partial<ComponentePago>>({
    tipo: "pago-casa",
    monto: "",
    mes: 1,
    ano: new Date().getFullYear(),
  })
  const [componentesAcumulados, setComponentesAcumulados] = useState<ComponentePago[]>([])

  const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]

  // Proyectos con meses fijos para ingreso-casa
  const proyectosConMesFijo: Proyecto[] = [
    { id: "proj-1", nombre: "Proyecto Magna", mes: 1 },
    { id: "proj-2", nombre: "Centro Comercial", mes: 3 },
    { id: "proj-3", nombre: "Residencial Vista", mes: 2 },
    { id: "proj-4", nombre: "Oficinas Ejecutivas", mes: 4 },
    { id: "proj-5", nombre: "Plaza Principal", mes: 5 },
  ]

  // Generar proyectos según tipo de movimiento
  const proyectos: Proyecto[] = useMemo(() => {
    if (tipoMovimiento === "ingreso-casa") {
      return proyectosConMesFijo
    }
    
    const proyectosBase = [
      "Proyecto Magna",
      "Centro Comercial",
      "Residencial Vista",
      "Oficinas Ejecutivas",
      "Plaza Principal",
    ]

    // Simular que algunos proyectos están activos en ciertos meses
    return proyectosBase
      .filter((_, idx) => {
        const mesNum = parseInt(mesSeleccionado)
        return (idx + mesNum) % 3 !== 0 // Filtro aleatorio basado en mes
      })
      .map((nombre, idx) => ({
        id: `proj-${idx}`,
        nombre,
        mes: parseInt(mesSeleccionado),
      }))
  }, [mesSeleccionado, tipoMovimiento])

  // Opciones de categoría según el tipo de movimiento
  const opcionesCategoria = useMemo(() => {
    if (tipoMovimiento === "pago-casa") {
      return ["Mano de Obra", "Materiales", "Equipamiento", "Servicios", "Otros"]
    }
    return []
  }, [tipoMovimiento])

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (tipoMovimiento === "pago-compuesto") {
      if (componentesAcumulados.length === 0) {
        alert("Debes agregar al menos un componente de pago")
        return
      }
      console.log({
        tipoMovimiento: "pago-compuesto",
        componentes: componentesAcumulados,
        montoTotal: componentesAcumulados.reduce((sum, c) => sum + parseInt(c.monto), 0),
      })
    } else {
      // Aquí irá la lógica para guardar el movimiento simple
      console.log({
        tipoMovimiento,
        monto,
        mes: meses[parseInt(mesSeleccionado) - 1],
        proyecto: proyectoSeleccionado,
        categoria,
        nombreIngreso,
        descripcion,
      })
    }
  }

  return (
    <>
      <NavBar />
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
          {/* Formulario */}
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
                    setComponentesAcumulados([])
                    setTipoComponenteSeleccionado(null)
                    setComponentesTemporal({
                      tipo: "pago-casa",
                      monto: "",
                      mes: 1,
                      ano: new Date().getFullYear(),
                    })
                  }}
                  className="w-full px-4 py-3 bg-white dark:bg-[var(--base-300)] text-[var(--foreground)] border-2 border-[var(--primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-200)] cursor-pointer font-semibold hover:border-[#0470c8] transition-all"
                >
                  <option value="pago-casa">Pago Casa</option>
                  <option value="ingreso-casa">Ingreso Casa</option>
                  <option value="administrativo">Pago Administrativo</option>
                  <option value="pago-compuesto">Pago Compuesto</option>
                </select>
              </div>

              {/* Monto - Solo para movimientos simples */}
              {tipoMovimiento !== "pago-compuesto" && (
                <div>
                  <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                    Monto
                  </label>
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
              )}

              {/* Selector de Mes y Año */}
              {tipoMovimiento === "ingreso-casa" ? (
                // Mes mostrado como solo lectura para ingreso-casa
                <div>
                  <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                    Mes
                  </label>
                  <div className="w-full px-4 py-3 bg-[var(--base-50)] dark:bg-[var(--base-300)] text-[var(--foreground)] border-2 border-[var(--primary-200)] rounded-lg font-semibold">
                    {meses[parseInt(mesSeleccionado) - 1] || "Sin proyecto"}
                  </div>
                </div>
              ) : (
                // Selectores normales para otros tipos
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                      Mes
                    </label>
                    <select
                      value={mesSeleccionado}
                      onChange={(e) => {
                        setMesSeleccionado(e.target.value)
                        setProyectoSeleccionado("")
                      }}
                      className="w-full px-4 py-3 bg-white dark:bg-[var(--base-300)] text-[var(--foreground)] border-2 border-[var(--primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-200)] cursor-pointer font-semibold hover:border-[#0470c8] transition-all"
                    >
                      {meses.map((mes, idx) => (
                        <option key={idx} value={idx + 1}>
                          {mes}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                      Año
                    </label>
                    <select
                      value={anoSeleccionado}
                      onChange={(e) => {
                        setAnoSeleccionado(e.target.value)
                        setProyectoSeleccionado("")
                      }}
                      className="w-full px-4 py-3 bg-white dark:bg-[var(--base-300)] text-[var(--foreground)] border-2 border-[var(--primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-200)] cursor-pointer font-semibold hover:border-[#0470c8] transition-all"
                    >
                      {[2024, 2025, 2026, 2027, 2028].map((ano) => (
                        <option key={ano} value={ano}>
                          {ano}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Proyectos - Solo para Pago Casa e Ingreso Casa */}
              {tipoMovimiento !== "administrativo" && (
                <div>
                  <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                    Proyecto
                  </label>
                  <select
                    value={proyectoSeleccionado}
                    onChange={(e) => {
                      const idSeleccionado = e.target.value
                      setProyectoSeleccionado(idSeleccionado)
                      
                      // Auto-cargar mes si es ingreso-casa
                      if (tipoMovimiento === "ingreso-casa" && idSeleccionado) {
                        const proyectoEncontrado = proyectosConMesFijo.find(p => p.id === idSeleccionado)
                        if (proyectoEncontrado) {
                          setMesSeleccionado(proyectoEncontrado.mes.toString())
                        }
                      }
                    }}
                    className="w-full px-4 py-3 bg-white dark:bg-[var(--base-300)] text-[var(--foreground)] border-2 border-[var(--primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-200)] cursor-pointer font-semibold hover:border-[#0470c8] transition-all"
                  >
                    <option value="">Seleccionar proyecto...</option>
                    {proyectos.map((proyecto) => (
                      <option key={proyecto.id} value={proyecto.id}>
                        {proyecto.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Fecha de Pago - Solo para Ingreso Casa */}
              {tipoMovimiento === "ingreso-casa" && (
                <div>
                  <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                    Fecha de Pago
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {/* Día */}
                    <div>
                      <label className="block text-xs font-medium text-[var(--base-600)] dark:text-[var(--base-400)] mb-1">Día</label>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        value={fechaPagoDia}
                        onChange={(e) => {
                          const val = Math.min(31, Math.max(1, parseInt(e.target.value) || 1))
                          setFechaPagoDia(String(val).padStart(2, "0"))
                        }}
                        className="w-full px-3 py-2 bg-white dark:bg-[var(--base-300)] text-[var(--foreground)] border-2 border-[var(--primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-200)] font-semibold text-center"
                      />
                    </div>

                    {/* Mes */}
                    <div>
                      <label className="block text-xs font-medium text-[var(--base-600)] dark:text-[var(--base-400)] mb-1">Mes</label>
                      <select
                        value={fechaPagoMes}
                        onChange={(e) => setFechaPagoMes(String(parseInt(e.target.value)).padStart(2, "0"))}
                        className="w-full px-3 py-2 bg-white dark:bg-[var(--base-300)] text-[var(--foreground)] border-2 border-[var(--primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-200)] cursor-pointer font-semibold"
                      >
                        {meses.map((mes, idx) => (
                          <option key={idx} value={String(idx + 1).padStart(2, "0")}>
                            {mes}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Año */}
                    <div>
                      <label className="block text-xs font-medium text-[var(--base-600)] dark:text-[var(--base-400)] mb-1">Año</label>
                      <select
                        value={fechaPagoAno}
                        onChange={(e) => setFechaPagoAno(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-[var(--base-300)] text-[var(--foreground)] border-2 border-[var(--primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-200)] cursor-pointer font-semibold"
                      >
                        {[2024, 2025, 2026, 2027, 2028].map((ano) => (
                          <option key={ano} value={ano}>
                            {ano}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Categoría o Nombre de Ingreso */}
              {tipoMovimiento === "pago-casa" && (
                <div>
                  <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                    Categoría
                  </label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-[var(--base-300)] text-[var(--foreground)] border-2 border-[var(--primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-200)] cursor-pointer font-semibold hover:border-[#0470c8] transition-all"
                  >
                    <option value="">Seleccionar categoría...</option>
                    {opcionesCategoria.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {tipoMovimiento === "ingreso-casa" && (
                <div>
                  <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                    Nombre del Ingreso
                  </label>
                  <input
                    type="text"
                    value={nombreIngreso}
                    onChange={(e) => setNombreIngreso(e.target.value)}
                    placeholder="Ej: Venta de materiales sobrantes"
                    className="input input-bordered w-full bg-[var(--base-50)] dark:bg-[var(--base-300)] border-[var(--primary-200)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-100)]"
                  />
                </div>
              )}

              {/* Descripción - Solo para movimientos simples */}
              {tipoMovimiento !== "pago-compuesto" && (
                <div>
                  <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Agrega más detalles sobre este movimiento..."
                    rows={4}
                    className="textarea textarea-bordered w-full bg-[var(--base-50)] dark:bg-[var(--base-300)] border-[var(--primary-200)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-100)] resize-none"
                  />
                </div>
              )}

              {/* SECCIÓN PAGO COMPUESTO */}
              {tipoMovimiento === "pago-compuesto" && (
                <div className="space-y-4">
                  {/* Selector inicial de tipo */}
                  {!tipoComponenteSeleccionado ? (
                    <div className="bg-gradient-to-r from-[var(--primary-100)] to-[var(--primary-200)] dark:from-[var(--base-300)] dark:to-[var(--base-400)] border-2 border-[var(--primary)] rounded-lg p-6">
                      <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 text-center">
                        ¿Qué tipo de pago deseas agregar?
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => {
                            setTipoComponenteSeleccionado("pago-casa")
                            setComponentesTemporal({
                              tipo: "pago-casa",
                              monto: "",
                            })
                          }}
                          className="btn bg-[#035496] hover:bg-[#0470c8] text-white border-0 font-bold text-base transition-all transform hover:scale-105"
                        >
                          Pago Casa
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setTipoComponenteSeleccionado("administrativo")
                            setComponentesTemporal({
                              tipo: "administrativo",
                              monto: "",
                            })
                          }}
                          className="btn bg-[#035496] hover:bg-[#0470c8] text-white border-0 font-bold text-base transition-all transform hover:scale-105"
                        >
                          Administrativo
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Formulario expandido */
                    <div className="bg-[var(--base-50)] dark:bg-[var(--base-300)] border-2 border-[var(--primary-200)] rounded-lg p-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-bold text-[var(--foreground)]">
                          {tipoComponenteSeleccionado === "pago-casa" ? "Pago Casa" : "Pago Administrativo"}
                        </h3>
                        <button
                          type="button"
                          onClick={() => {
                            setTipoComponenteSeleccionado(null)
                            setComponentesTemporal({
                              tipo: "pago-casa",
                              monto: "",
                            })
                          }}
                          className="text-[var(--base-600)] hover:text-[var(--foreground)] text-xl font-bold"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Monto */}
                      <div>
                        <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                          Monto
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary)] text-sm">₵</span>
                          <input
                            type="text"
                            value={componentesTemporal.monto ? formatCurrency(componentesTemporal.monto) : ""}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, "")
                              setComponentesTemporal({ ...componentesTemporal, monto: val })
                            }}
                            placeholder="0"
                            className="w-full px-3 pl-6 py-2 bg-white dark:bg-[var(--base-300)] text-[var(--foreground)] border-2 border-[var(--primary)] rounded-lg text-sm"
                          />
                        </div>
                      </div>

                      {/* Descripción */}
                      <div>
                        <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                          Descripción
                        </label>
                        <textarea
                          value={componentesTemporal.descripcion || ""}
                          onChange={(e) =>
                            setComponentesTemporal({
                              ...componentesTemporal,
                              descripcion: e.target.value,
                            })
                          }
                          placeholder="Detalles sobre este pago..."
                          rows={2}
                          className="w-full px-3 py-2 bg-white dark:bg-[var(--base-300)] text-[var(--foreground)] border-2 border-[var(--primary)] rounded-lg text-sm resize-none"
                        />
                      </div>

                      {/* Botones acción */}
                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (componentesTemporal.monto && componentesTemporal.monto !== "0") {
                              const nuevoComponente: ComponentePago = {
                                id: Date.now().toString(),
                                tipo: tipoComponenteSeleccionado || "pago-casa",
                                monto: componentesTemporal.monto || "0",
                                descripcion: componentesTemporal.descripcion,
                              }
                              setComponentesAcumulados([
                                ...componentesAcumulados,
                                nuevoComponente,
                              ])
                              // Resetear al selector
                              setTipoComponenteSeleccionado(null)
                              setComponentesTemporal({
                                tipo: "pago-casa",
                                monto: "",
                              })
                            }
                          }}
                          className="flex-1 btn btn-sm btn-primary bg-[var(--primary)] hover:bg-[#0470c8] border-0 text-white"
                        >
                          <Plus className="h-4 w-4" />
                          Agregar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setTipoComponenteSeleccionado(null)
                            setComponentesTemporal({
                              tipo: "pago-casa",
                              monto: "",
                            })
                          }}
                          className="flex-1 btn btn-sm btn-ghost"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Cards de componentes agregados */}
                  {componentesAcumulados.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-bold text-[var(--foreground)]">
                        Componentes Agregados ({componentesAcumulados.length})
                      </h3>
                      {componentesAcumulados.map((comp) => (
                        <div
                          key={comp.id}
                          className="bg-white dark:bg-[var(--base-300)] border-2 border-[var(--primary-200)] rounded-lg p-4 flex justify-between items-start"
                        >
                          <div className="flex-1 text-sm space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-[var(--foreground)]">
                                {comp.tipo === "pago-casa" ? "Pago Casa" : "Administrativo"}
                              </span>
                              <span className="text-[var(--primary)] font-bold">
                                {formatCurrency(comp.monto)}
                              </span>
                            </div>
                            {comp.descripcion && (
                              <p className="text-[var(--base-600)] dark:text-[var(--base-400)] text-xs italic">
                                "{comp.descripcion}"
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setComponentesAcumulados(
                                componentesAcumulados.filter(
                                  (c) => c.id !== comp.id
                                )
                              )
                            }}
                            className="ml-4 btn btn-sm btn-ghost btn-circle text-red-500 hover:bg-red-100 dark:hover:bg-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Botones */}
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

          {/* Resumen de Movimiento */}
          {(monto || tipoMovimiento === "pago-compuesto" || tipoMovimiento) && (
            <div className="bg-white dark:bg-[var(--base-200)] border-2 border-[var(--primary-200)] rounded-xl shadow-md p-6 mt-6">
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-4">Resumen</h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-[var(--base-600)] dark:text-[var(--base-400)]">Tipo:</span>
                  <span className="font-semibold ml-2">
                    {tipoMovimiento === "pago-casa"
                      ? "Pago Casa"
                      : tipoMovimiento === "ingreso-casa"
                        ? "Ingreso Casa"
                        : tipoMovimiento === "pago-compuesto"
                          ? "Pago Compuesto"
                          : "Pago Administrativo"}
                  </span>
                </p>

                {tipoMovimiento === "pago-compuesto" ? (
                  <>
                    <p>
                      <span className="text-[var(--base-600)] dark:text-[var(--base-400)]">
                        Componentes:
                      </span>
                      <span className="font-semibold ml-2">{componentesAcumulados.length}</span>
                    </p>
                    {componentesAcumulados.length > 0 && (
                      <p>
                        <span className="text-[var(--base-600)] dark:text-[var(--base-400)]">
                          Monto Total:
                        </span>
                        <span className="font-semibold ml-2 text-[var(--primary)]">
                          {formatCurrency(
                            componentesAcumulados
                              .reduce((sum, c) => sum + parseInt(c.monto), 0)
                              .toString()
                          )}
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
