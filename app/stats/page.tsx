"use client"

import React, { useEffect, useState } from "react"
import { CalendarClock, Info, Landmark, Plus, Scale, Trash2 } from "lucide-react"
import Swal from "sweetalert2"
import { listarProyectos, obtenerDashboard, type Proyecto } from "@/lib/api"
import {
  crearCuenta,
  eliminarCuenta,
  listarCuentas,
  type CuentaBancaria,
} from "@/lib/cuentasBancarias"

type MesActivo = {
  mes: string
  anio: string
  ingresos: number
  egresos: number
  balance: number
}

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]

/* Mismo separador de miles que el resto de la app (₡1.500.000) */
const formatNumber = (value: number) =>
  value.toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: "always",
  })

const formatCurrency = (value: number) => `₡${formatNumber(value)}`

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

export default function ControlCuentasPage() {
  const [mesesActivos, setMesesActivos] = useState<MesActivo[]>([])
  const [cargando, setCargando] = useState(true)
  const [cuentas, setCuentas] = useState<CuentaBancaria[]>([])
  const [saldos, setSaldos] = useState<Record<string, string>>({})
  const [nuevaCuenta, setNuevaCuenta] = useState("")

  /* Catálogo de cuentas: temporal en localStorage hasta que exista el
     backend (ver PLAN CONTROL DE CUENTAS.md) */
  useEffect(() => {
    setCuentas(listarCuentas())
  }, [])

  /* Saldos digitados: se guardan en localStorage para que sobrevivan a un
     recargo de pagina, y solo cambian si el usuario los edita. */
  const SALDOS_STORAGE_KEY = "controlCuentasSaldos"

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SALDOS_STORAGE_KEY)
      if (raw) setSaldos(JSON.parse(raw))
    } catch {
      // localStorage no disponible o dato corrupto: arranca vacio, sin romper la pagina
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(SALDOS_STORAGE_KEY, JSON.stringify(saldos))
    } catch {
      // localStorage no disponible (ej. modo privado): no hay nada que persistir
    }
  }, [saldos])

  /* Balance acumulado de los meses con proyectos activos.
     Un mes cerrado (todos sus proyectos "Finalizado") se excluye del cálculo. */
  useEffect(() => {
    async function cargarMesesActivos() {
      try {
        const proyectos = await listarProyectos()

        const porMes = new Map<string, Proyecto[]>()
        for (const p of proyectos) {
          const key = `${p.mesAsignacion}|${p.anioAsignacion}`
          porMes.set(key, [...(porMes.get(key) ?? []), p])
        }

        const activos = [...porMes.keys()].filter(
          (key) => !porMes.get(key)!.every((p) => p.estado === "Finalizado")
        )

        const conBalance = await Promise.all(
          activos.map(async (key) => {
            const [mes, anio] = key.split("|")
            const d = await obtenerDashboard(mes, anio)
            return { mes, anio, ingresos: d.ingresos, egresos: d.egresos, balance: d.balance }
          })
        )

        conBalance.sort(
          (a, b) =>
            Number(a.anio) - Number(b.anio) ||
            MESES.indexOf(a.mes) - MESES.indexOf(b.mes)
        )

        setMesesActivos(conBalance)
      } catch {
        Swal.fire({
          icon: "error",
          title: "No se pudo cargar el balance de los meses activos",
          text: "Verifica que el backend esté corriendo en localhost:4000",
        })
      } finally {
        setCargando(false)
      }
    }
    cargarMesesActivos()
  }, [])

  /* Formato de los saldos: aceptan digitos con una coma decimal y hasta
     2 centimos (₡1.500,25), para poder digitar el saldo exacto del
     estado de cuenta. Se guardan en localStorage (ver arriba). */
  const SALDO_REGEX = /^\d*(,\d{0,2})?$/

  const saldoDe = (id: string) => {
    /* El valor guardado puede venir formateado con puntos de miles
       (ej. "1.500.000,00" despues del blur) o crudo sin formatear
       (ej. "1500000" mientras se escribe) - hay que quitar los puntos
       de miles ANTES de convertir la coma decimal a punto, si no
       "1.500.000,00" -> "1.500.000.00" (dos puntos) y parseFloat
       trunca en el primer error, devolviendo 1.5 en vez de 1500000. */
    const crudo = (saldos[id] ?? "").replace(/\./g, "").replace(",", ".")
    const num = parseFloat(crudo)
    return Number.isFinite(num) ? num : 0
  }

  /* Redondeo a céntimos para evitar residuos de punto flotante al comparar contra cero */
  const redondear = (n: number) => Math.round(n * 100) / 100

  const totalBancos = redondear(cuentas.reduce((sum, c) => sum + saldoDe(c.id), 0))
  const balanceMesesActivos = redondear(mesesActivos.reduce((sum, m) => sum + m.balance, 0))
  const diferencia = redondear(totalBancos - balanceMesesActivos)
  const todosEnCero = cuentas.every((c) => saldoDe(c.id) === 0)

  const handleSaldoChange = (id: string, value: string) => {
    const limpio = value.replace(/[^\d,]/g, "").replace(/,(?=.*,)/, "")
    if (!SALDO_REGEX.test(limpio)) return
    setSaldos((prev) => ({ ...prev, [id]: limpio }))
  }

  /* Formato de miles solo al salir del campo, para no mover el cursor mientras digita */
  const formatearSaldo = (id: string) => {
    const crudo = saldos[id]
    if (crudo === undefined) return
    const num = saldoDe(id)
    setSaldos((prev) => ({
      ...prev,
      [id]: num.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    }))
  }

  const handleAgregarCuenta = (e: React.FormEvent) => {
    e.preventDefault()
    const nombre = nuevaCuenta.trim()
    if (!nombre) return
    if (cuentas.some((c) => c.nombre.toLowerCase() === nombre.toLowerCase())) {
      Swal.fire({ icon: "warning", title: "Esa cuenta ya existe", text: nombre })
      return
    }
    const cuenta = crearCuenta(nombre)
    setCuentas((prev) => [...prev, cuenta])
    setNuevaCuenta("")
  }

  const handleEliminarCuenta = (id: string) => {
    eliminarCuenta(id)
    setCuentas((prev) => prev.filter((c) => c.id !== id))
    setSaldos((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  return (
    <div className="h-svh flex flex-col bg-base-200 overflow-hidden">
      <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto flex flex-col gap-4 lg:gap-5">

          {/* Título */}
          <FadeIn delay={0}>
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Scale className="size-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold">Control de Cuentas</h1>
                <p className="text-sm text-base-content/60">
                  Conciliación: saldos bancarios vs. balance de meses activos
                </p>
              </div>
            </div>
          </FadeIn>

          {/* Resultado del "versus" */}
          <FadeIn
            delay={80}
            className={`card shadow-md border-2 transition-colors ${
              diferencia >= 0
                ? "border-success/40 bg-success/5"
                : "border-error/40 bg-error/5"
            }`}
          >
            <div className="card-body p-4 lg:p-6 gap-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="card-title text-sm lg:text-base flex items-center gap-2">
                  <Scale className="size-5" />
                  Diferencia (bancos − aplicación)
                </h2>
                <span className={`badge badge-lg ${diferencia >= 0 ? "badge-success" : "badge-error"}`}>
                  {diferencia === 0
                    ? "Cuadra exacto"
                    : diferencia > 0
                      ? "Sobra en bancos"
                      : "Falta en bancos"}
                </span>
              </div>
              <span className={`text-4xl lg:text-5xl font-black ${diferencia >= 0 ? "text-success" : "text-error"}`}>
                {diferencia > 0 ? "+" : ""}{formatCurrency(diferencia)}
              </span>
              <div className="grid grid-cols-2 gap-3 mt-1">
                <div className="rounded-lg bg-base-100 p-3 shadow-sm">
                  <p className="text-xs text-base-content/60 uppercase tracking-wide">Total en bancos</p>
                  <p className="text-lg lg:text-xl font-bold">{formatCurrency(totalBancos)}</p>
                </div>
                <div className="rounded-lg bg-base-100 p-3 shadow-sm">
                  <p className="text-xs text-base-content/60 uppercase tracking-wide">Balance meses activos</p>
                  <p className="text-lg lg:text-xl font-bold">{formatCurrency(balanceMesesActivos)}</p>
                </div>
              </div>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">

            {/* Balance de meses activos */}
            <FadeIn delay={160} className="card bg-base-100 shadow-md">
              <div className="card-body p-4 lg:p-5 gap-3">
                <h2 className="card-title text-sm lg:text-base flex items-center gap-2">
                  <CalendarClock className="size-5 text-primary" />
                  Balance de meses activos
                </h2>
                {cargando ? (
                  <div className="flex justify-center py-8">
                    <span className="loading loading-spinner loading-md text-primary" />
                  </div>
                ) : mesesActivos.length === 0 ? (
                  <p className="text-sm text-base-content/60 py-4 text-center">
                    No hay meses con proyectos activos
                  </p>
                ) : (
                  <ul className="flex flex-col divide-y divide-base-200">
                    {mesesActivos.map((m) => (
                      <li
                        key={`${m.mes}-${m.anio}`}
                        className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2"
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{m.mes} {m.anio}</span>
                          <span className="badge badge-warning badge-sm whitespace-nowrap">En proceso</span>
                        </div>
                        <span className={`font-bold text-sm ${m.balance >= 0 ? "text-success" : "text-error"}`}>
                          {formatCurrency(m.balance)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex items-center justify-between border-t border-base-200 pt-3 mt-auto">
                  <span className="text-sm font-semibold">Total acumulado</span>
                  <span className={`text-lg font-black ${balanceMesesActivos >= 0 ? "text-success" : "text-error"}`}>
                    {formatCurrency(balanceMesesActivos)}
                  </span>
                </div>
                <p className="text-xs text-base-content/50">
                  Los meses cerrados (todos sus proyectos finalizados) se excluyen del cálculo.
                </p>
              </div>
            </FadeIn>

            {/* Cuentas bancarias */}
            <FadeIn delay={240} className="card bg-base-100 shadow-md">
              <div className="card-body p-4 lg:p-5 gap-3">
                <h2 className="card-title text-sm lg:text-base flex items-center gap-2">
                  <Landmark className="size-5 text-primary" />
                  Cuentas bancarias
                </h2>
                {todosEnCero && (
                  <div className="alert alert-info py-2 px-3 text-sm">
                    <Info className="size-4 shrink-0" />
                    <span>Ingrese los valores de las cuentas</span>
                  </div>
                )}
                <ul className="flex flex-col gap-2">
                  {cuentas.map((c) => (
                    <li key={c.id} className="flex items-center gap-2">
                      <span
                        className="text-sm font-medium w-32 sm:w-40 truncate shrink-0"
                        title={c.nombre}
                      >
                        {c.nombre}
                      </span>
                      <label className="input input-bordered input-sm flex items-center gap-2 grow">
                        <span className="text-primary font-bold">₡</span>
                        <input
                          type="text"
                          inputMode="decimal"
                          className="grow text-right"
                          placeholder="0,00"
                          aria-label={`Saldo de ${c.nombre}`}
                          value={saldos[c.id] ?? ""}
                          onChange={(e) => handleSaldoChange(c.id, e.target.value)}
                          onBlur={() => formatearSaldo(c.id)}
                        />
                      </label>
                      <button
                        className="btn btn-ghost btn-circle btn-sm text-error"
                        onClick={() => handleEliminarCuenta(c.id)}
                        aria-label={`Eliminar ${c.nombre}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </li>
                  ))}
                </ul>
                <form onSubmit={handleAgregarCuenta} className="flex items-center gap-2">
                  <input
                    type="text"
                    className="input input-bordered input-sm grow"
                    placeholder="Nueva cuenta (ej: Banco Popular)"
                    value={nuevaCuenta}
                    onChange={(e) => setNuevaCuenta(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm gap-1"
                    disabled={!nuevaCuenta.trim()}
                  >
                    <Plus className="size-4" />
                    Agregar
                  </button>
                </form>
                <div className="flex items-center justify-between border-t border-base-200 pt-3 mt-auto">
                  <span className="text-sm font-semibold">Total en bancos</span>
                  <span className="text-lg font-black">{formatCurrency(totalBancos)}</span>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </main>
    </div>
  )
}
