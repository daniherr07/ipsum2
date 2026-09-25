"use client"

import React, { useState, useMemo, useEffect } from "react"
import { useParams } from "next/navigation"
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  Building2,
  Calendar,
  Pencil,
  CircleDollarSign,
} from "lucide-react"
import Link from "next/link"
import Swal from "sweetalert2"
import BackButton from "@/components/BackButton"
import InfoTip from "@/components/InfoTip"
import {
  obtenerProyecto,
  actualizarProyecto,
  listarMovimientos,
  listarCatalogo,
  listarProyectos,
  listarBonos,
  type Proyecto,
  type Movimiento,
  type ItemCatalogo,
  type Bono,
} from "@/lib/api"
import { ANOS } from "@/lib/anios"

/* =========================
   Helpers
   Formato consistente: punto para miles,
   coma solo para céntimos (₡1.234.567,89)
========================= */
const formatNumber = (value: number) =>
  value.toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: "always",
  })

const formatCurrency = (value: number) => `₡${formatNumber(value)}`

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

/* =========================
   Paleta de segmentos (clases del tema:
   funcionan en claro y oscuro)
========================= */
const PALETA = [
  { dot: "bg-error", bar: "var(--error)", stroke: "stroke-error", text: "text-error" },
  { dot: "bg-warning", bar: "var(--warning)", stroke: "stroke-warning", text: "text-warning" },
  { dot: "bg-info", bar: "var(--info)", stroke: "stroke-info", text: "text-info" },
  { dot: "bg-success", bar: "var(--success)", stroke: "stroke-success", text: "text-success" },
  { dot: "bg-primary", bar: "var(--primary)", stroke: "stroke-primary", text: "text-primary" },
]

/* =========================
   Stat Card
========================= */
const COLOR_STYLES = {
  primary: { bg: "bg-primary/10", text: "text-primary" },
  success: { bg: "bg-success/10", text: "text-success" },
  error: { bg: "bg-error/10", text: "text-error" },
} as const

function StatCard({ icon: Icon, label, value, color, delay = 0, subtitle, hint }: {
  icon: typeof TrendingUp
  label: string
  value: number
  color: keyof typeof COLOR_STYLES
  delay?: number
  subtitle?: string
  hint?: string
}) {
  const animatedValue = useAnimatedNumber(value)
  const styles = COLOR_STYLES[color]

  return (
    <FadeIn delay={delay} className="h-full">
      <div className="bg-base-100 rounded-lg shadow-md p-3 sm:p-4 flex items-center gap-3 h-full">
        <div className={`${styles.bg} p-2 sm:p-2.5 rounded-lg shrink-0`}>
          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${styles.text}`} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] sm:text-xs uppercase font-bold text-base-content/60">
            {label} {hint && <InfoTip text={hint} />}
          </p>
          <p className={`font-black text-sm sm:text-lg truncate ${styles.text}`}>
            {formatCurrency(animatedValue)}
          </p>
          {subtitle && (
            <p className="text-[10px] text-base-content/50">{subtitle}</p>
          )}
        </div>
      </div>
    </FadeIn>
  )
}

/* =========================
   Donut Chart (distribución de egresos)
========================= */
function DonutChart({ data }: { data: { nombre: string; monto: number }[] }) {
  const [progress, setProgress] = useState(0)
  const animKey = data.map((d) => d.monto).join(",")

  useEffect(() => {
    setProgress(0)
    let start: number | null = null
    let animId: number
    const duration = 900
    const animate = (ts: number) => {
      if (!start) start = ts
      const t = Math.min((ts - start) / duration, 1)
      setProgress(1 - Math.pow(1 - t, 3))
      if (t < 1) animId = requestAnimationFrame(animate)
    }
    const tid = setTimeout(() => {
      animId = requestAnimationFrame(animate)
    }, 200)
    return () => {
      clearTimeout(tid)
      cancelAnimationFrame(animId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animKey])

  const total = data.reduce((s, d) => s + d.monto, 0)
  if (total === 0) return null

  const R = 36
  const C = 2 * Math.PI * R
  let cumulative = 0
  const segments = data.map((d, i) => {
    const pct = d.monto / total
    const startAngle = cumulative * 360
    cumulative += pct
    return { ...d, pct, startAngle, color: PALETA[i % PALETA.length] }
  })

  return (
    <div className="flex flex-col items-center gap-3 pt-2">
      <svg width="140" height="140" viewBox="0 0 96 96">
        <circle
          cx="48"
          cy="48"
          r={R}
          fill="none"
          className="stroke-base-200"
          strokeWidth="14"
        />
        {segments.map((seg, i) => (
          <circle
            key={i}
            cx="48"
            cy="48"
            r={R}
            fill="none"
            className={seg.color.stroke}
            strokeWidth="14"
            strokeDasharray={`${seg.pct * C * progress} ${C}`}
            transform={`rotate(${seg.startAngle - 90} 48 48)`}
          />
        ))}
        <text
          x="48"
          y="45"
          textAnchor="middle"
          className="fill-base-content/50"
          style={{ fontSize: 7 }}
        >
          Total
        </text>
        <text
          x="48"
          y="54"
          textAnchor="middle"
          className="fill-base-content font-bold"
          style={{ fontSize: 8, fontWeight: 700 }}
        >
          {formatNumber(total)}
        </text>
      </svg>
      <ul className="w-full space-y-2">
        {segments.map((seg) => (
          <li
            key={seg.nombre}
            className="flex items-center justify-between gap-2 text-xs"
          >
            <span className="flex items-center gap-2 min-w-0">
              <span className={`shrink-0 w-2.5 h-2.5 rounded-full ${seg.color.dot}`} />
              <span className="font-medium truncate">{seg.nombre}</span>
            </span>
            <span className="flex items-center gap-2 shrink-0">
              <span className="text-base-content/50">{formatCurrency(seg.monto)}</span>
              <span className={`font-bold w-9 text-right ${seg.color.text}`}>
                {Math.round(seg.pct * 100)}%
              </span>
            </span>
          </li>
        ))}
      </ul>
      <div className="w-full border-t border-base-200 pt-2 flex justify-between text-xs font-semibold">
        <span className="text-base-content/60">Total egresos</span>
        <span className="text-error">{formatCurrency(total)}</span>
      </div>
    </div>
  )
}

/* =========================
   Modal de edición (C7A):
   presupuesto de mano de obra + contratista
   + mes/año de asignación y estado (M2, M3)
   (mismo patrón que FormModal de settings)
========================= */
const MESES = [
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

function EditarProyectoModal({ isOpen, onClose, proyecto, onGuardado }: {
  isOpen: boolean
  onClose: () => void
  proyecto: Proyecto
  onGuardado: () => void
}) {
  const [nombre, setNombre] = useState("")
  const [presupuesto, setPresupuesto] = useState("")
  const [presupuestoMO, setPresupuestoMO] = useState("")
  const [contratista, setContratista] = useState("")
  const [mesAsignacion, setMesAsignacion] = useState("")
  const [anioAsignacion, setAnioAsignacion] = useState("")
  const [estado, setEstado] = useState<"Revisión" | "Finalizado">("Revisión")
  const [bono, setBono] = useState("")
  const [subtipoBono, setSubtipoBono] = useState("")
  const [contratistas, setContratistas] = useState<ItemCatalogo[]>([])
  const [bonos, setBonos] = useState<Bono[]>([])
  const [otrosProyectos, setOtrosProyectos] = useState<Proyecto[]>([])
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setNombre(proyecto.nombre ?? "")
    setPresupuesto(proyecto.presupuesto ? String(proyecto.presupuesto) : "")
    setPresupuestoMO(
      proyecto.presupuestoManoObra ? String(proyecto.presupuestoManoObra) : "",
    )
    setContratista(proyecto.contratista ?? "")
    setMesAsignacion(proyecto.mesAsignacion ?? "")
    setAnioAsignacion(proyecto.anioAsignacion ?? "")
    setEstado(proyecto.estado ?? "Revisión")
    setBono(proyecto.bono ?? "")
    setSubtipoBono(proyecto.subtipoBono ?? "")
    listarCatalogo("contratistas")
      .then(setContratistas)
      .catch(() => setContratistas([]))
    listarBonos()
      .then(setBonos)
      .catch(() => setBonos([]))
    /* C4: para detectar si este proyecto es el último en proceso del mes */
    listarProyectos()
      .then(setOtrosProyectos)
      .catch(() => setOtrosProyectos([]))
  }, [isOpen, proyecto])

  const formatMonto = (value: string) => {
    const num = parseInt(value.replace(/\D/g, "")) || 0
    return `₡${num.toLocaleString("es-ES", {
      maximumFractionDigits: 0,
      useGrouping: "always",
    })}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim()) {
      Swal.fire("Error", "El nombre del proyecto es requerido", "error")
      return
    }
    const presupuestoTotal = Number(presupuesto)
    if (!presupuestoTotal || presupuestoTotal <= 0) {
      Swal.fire("Error", "El presupuesto debe ser mayor a 0", "error")
      return
    }
    const monto = Number(presupuestoMO)
    if (!monto || monto <= 0) {
      Swal.fire("Error", "El presupuesto de mano de obra debe ser mayor a 0", "error")
      return
    }
    /* M1: la mano de obra no puede superar el presupuesto total editado */
    if (monto > presupuestoTotal) {
      Swal.fire(
        "Error",
        `El presupuesto de mano de obra no puede superar el presupuesto total (${formatCurrency(presupuestoTotal)})`,
        "error",
      )
      return
    }
    if (!contratista.trim()) {
      Swal.fire("Error", "El contratista es requerido", "error")
      return
    }
    if (!mesAsignacion || !anioAsignacion) {
      Swal.fire("Error", "El mes y año de asignación son requeridos", "error")
      return
    }
    if (!bono) {
      Swal.fire("Error", "El bono es requerido", "error")
      return
    }
    const bonoSel = bonos.find((b) => b.nombre === bono)
    if (bonoSel && bonoSel.subtipos.length > 0 && !subtipoBono) {
      Swal.fire("Error", "Seleccione un subtipo de bono", "error")
      return
    }
    /* C4: si este proyecto es el último en proceso del mes, al finalizarlo
       el mes se cierra; pedir confirmación antes de guardar. */
    if (estado === "Finalizado" && proyecto.estado !== "Finalizado") {
      const delMes = otrosProyectos.filter(
        (p) =>
          p.id !== proyecto.id &&
          p.mesAsignacion === mesAsignacion &&
          p.anioAsignacion === String(anioAsignacion),
      )
      const cierraMes =
        delMes.length > 0 && delMes.every((p) => p.estado === "Finalizado")
      if (cierraMes) {
        const result = await Swal.fire({
          icon: "question",
          title: `¿Cerrar el mes de ${mesAsignacion} ${anioAsignacion}?`,
          text: "Este es el último proyecto en proceso. Al guardarlo como Finalizado, el mes quedará cerrado y no se podrán agregar movimientos.",
          showCancelButton: true,
          confirmButtonText: "Sí, cerrar el mes",
          cancelButtonText: "Cancelar",
          confirmButtonColor: "#035496",
        })
        if (!result.isConfirmed) return
      }
    }
    /* Resumen de cambios + confirmación antes de guardar */
    const resumen: string[] = []
    if (nombre.trim() !== proyecto.nombre)
      resumen.push(`Nombre: ${proyecto.nombre} → ${nombre.trim()}`)
    if (presupuestoTotal !== proyecto.presupuesto)
      resumen.push(`Presupuesto: ${formatCurrency(proyecto.presupuesto)} → ${formatCurrency(presupuestoTotal)}`)
    if (monto !== proyecto.presupuestoManoObra)
      resumen.push(`Presupuesto mano de obra: ${formatCurrency(proyecto.presupuestoManoObra)} → ${formatCurrency(monto)}`)
    if (contratista.trim() !== proyecto.contratista)
      resumen.push(`Contratista: ${proyecto.contratista} → ${contratista.trim()}`)
    if (mesAsignacion !== proyecto.mesAsignacion || String(anioAsignacion) !== String(proyecto.anioAsignacion))
      resumen.push(`Asignación: ${proyecto.mesAsignacion} ${proyecto.anioAsignacion} → ${mesAsignacion} ${anioAsignacion}`)
    if (estado !== proyecto.estado)
      resumen.push(`Estado: ${proyecto.estado} → ${estado}`)
    if (bono !== proyecto.bono)
      resumen.push(`Bono: ${proyecto.bono} → ${bono}`)
    if ((subtipoBono || "") !== (proyecto.subtipoBono ?? ""))
      resumen.push(`Subtipo: ${proyecto.subtipoBono ?? "—"} → ${subtipoBono || "—"}`)

    if (resumen.length === 0) {
      Swal.fire("Sin cambios", "No modificaste ningún dato", "info")
      return
    }
    const confirmacion = await Swal.fire({
      icon: "question",
      title: "¿Guardar cambios en el proyecto?",
      html: `<ul style="text-align:left">${resumen.map((c) => `<li>${c}</li>`).join("")}</ul>`,
      showCancelButton: true,
      confirmButtonText: "Sí, guardar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#035496",
    })
    if (!confirmacion.isConfirmed) return

    setGuardando(true)
    try {
      await actualizarProyecto(proyecto.id, {
        nombre: nombre.trim(),
        presupuesto: presupuestoTotal,
        presupuestoManoObra: monto,
        contratista: contratista.trim(),
        mesAsignacion,
        anioAsignacion,
        estado,
        bono,
        subtipoBono: subtipoBono || null,
      })
      onGuardado()
      onClose()
      Swal.fire({
        icon: "success",
        title: "Proyecto actualizado",
        timer: 1500,
        showConfirmButton: false,
      })
    } catch (error) {
      Swal.fire(
        "Error",
        error instanceof Error ? error.message : "Error desconocido",
        "error",
      )
    } finally {
      setGuardando(false)
    }
  }

  if (!isOpen) return null

  /* El contratista actual puede no estar en el catálogo (proyectos legacy) */
  const contratistaEnCatalogo = contratistas.some(
    (c) => c.nombre === contratista,
  )
  /* El año actual puede estar fuera del rango (proyectos legacy) */
  const anioEnRango = ANOS.some((a) => String(a) === anioAsignacion)
  /* Subtipos del bono elegido; si está vacío no se muestra el select */
  const subtiposDelBono = bonos.find((b) => b.nombre === bono)?.subtipos ?? []

  return (
    <div className="modal modal-open">
      <div className="modal-box w-full max-w-md">
        <h3 className="font-bold text-lg mb-4">Editar Proyecto</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-semibold">
                Nombre del Proyecto
              </span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-semibold">
                Presupuesto Total
              </span>
            </label>
            <label className="input input-bordered flex items-center gap-2 w-full">
              <span className="text-primary font-bold">₡</span>
              <input
                type="text"
                inputMode="numeric"
                value={presupuesto ? formatMonto(presupuesto) : ""}
                onChange={(e) =>
                  setPresupuesto(e.target.value.replace(/\D/g, ""))
                }
                placeholder="₡0"
                className="grow"
              />
            </label>
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-semibold">
                Presupuesto de Mano de Obra
              </span>
            </label>
            <label className="input input-bordered flex items-center gap-2 w-full">
              <span className="text-primary font-bold">₡</span>
              <input
                type="text"
                inputMode="numeric"
                value={presupuestoMO ? formatMonto(presupuestoMO) : ""}
                onChange={(e) =>
                  setPresupuestoMO(e.target.value.replace(/\D/g, ""))
                }
                placeholder="₡0"
                className="grow"
              />
            </label>
            {/* M1: límite según el presupuesto total editado */}
            <span className="text-xs text-base-content/50 mt-1">
              Máximo: {formatCurrency(Number(presupuesto) || 0)}
            </span>
          </div>

          {/* M2: mes y año de asignación */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-semibold">Asignación</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <select
                value={mesAsignacion}
                onChange={(e) => setMesAsignacion(e.target.value)}
                className="select select-bordered w-full"
              >
                <option value="">Mes...</option>
                {MESES.map((mes) => (
                  <option key={mes} value={mes}>
                    {mes}
                  </option>
                ))}
              </select>
              <select
                value={anioAsignacion}
                onChange={(e) => setAnioAsignacion(e.target.value)}
                className="select select-bordered w-full"
              >
                <option value="">Año...</option>
                {!anioEnRango && anioAsignacion && (
                  <option value={anioAsignacion}>{anioAsignacion}</option>
                )}
                {ANOS.map((ano) => (
                  <option key={ano} value={String(ano)}>
                    {ano}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* M3: estado del proyecto (segmented control) */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-semibold">Estado</span>
            </label>
            <div className="grid grid-cols-2 gap-1.5 bg-base-200 rounded-lg p-1.5">
              <button
                type="button"
                onClick={() => setEstado("Revisión")}
                className={`rounded-md px-3 py-2 text-xs sm:text-sm font-bold transition-all ${
                  estado === "Revisión"
                    ? "bg-warning text-warning-content shadow-sm"
                    : "text-base-content/60 hover:bg-base-100"
                }`}
              >
                Revisión
              </button>
              <button
                type="button"
                onClick={() => setEstado("Finalizado")}
                className={`rounded-md px-3 py-2 text-xs sm:text-sm font-bold transition-all ${
                  estado === "Finalizado"
                    ? "bg-success text-success-content shadow-sm"
                    : "text-base-content/60 hover:bg-base-100"
                }`}
              >
                Finalizado
              </button>
            </div>
          </div>
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-semibold">Contratista</span>
            </label>
            <select
              value={contratista}
              onChange={(e) => setContratista(e.target.value)}
              className="select select-bordered w-full"
            >
              <option value="">Seleccionar...</option>
              {!contratistaEnCatalogo && contratista && (
                <option value={contratista}>{contratista}</option>
              )}
              {contratistas.map((c) => (
                <option key={c.id} value={c.nombre}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Bono y subtipo (el subtipo se resetea al cambiar de bono) */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-semibold">Bono</span>
            </label>
            <select
              value={bono}
              onChange={(e) => {
                setBono(e.target.value)
                setSubtipoBono("")
              }}
              className="select select-bordered w-full"
            >
              <option value="">Seleccionar...</option>
              {!bonos.some((b) => b.nombre === bono) && bono && (
                <option value={bono}>{bono}</option>
              )}
              {bonos.map((b) => (
                <option key={b.id} value={b.nombre}>
                  {b.nombre}
                </option>
              ))}
            </select>
          </div>

          {subtiposDelBono.length > 0 && (
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">
                  Subtipo de Bono
                </span>
              </label>
              <select
                value={subtipoBono}
                onChange={(e) => setSubtipoBono(e.target.value)}
                className="select select-bordered w-full"
              >
                <option value="">Seleccionar...</option>
                {!subtiposDelBono.some((s) => s.nombre === subtipoBono) &&
                  subtipoBono && (
                    <option value={subtipoBono}>{subtipoBono}</option>
                  )}
                {subtiposDelBono.map((s) => (
                  <option key={s.id} value={s.nombre}>
                    {s.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="modal-action">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
              disabled={guardando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={guardando}
            >
              {guardando ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  )
}

export default function ProyectoPage() {
  const params = useParams()
  const id = params.id as string

  const [proyecto, setProyecto] = useState<Proyecto | null>(null)
  const [movimientos, setMovimientos] = useState<Movimiento[]>([])
  const [cargando, setCargando] = useState(true)
  const [activeTab, setActiveTab] = useState<"ingresos" | "egresos">("ingresos")
  const [modalEditar, setModalEditar] = useState(false)

  const recargarProyecto = () => {
    obtenerProyecto(id)
      .then(setProyecto)
      .catch((error) => {
        Swal.fire({
          icon: "error",
          title: "No se pudo recargar el proyecto",
          text: error instanceof Error ? error.message : "Error desconocido",
        })
      })
  }

  useEffect(() => {
    Promise.all([obtenerProyecto(id), listarMovimientos({ proyectoId: id })])
      .then(([p, m]) => {
        setProyecto(p)
        setMovimientos(m)
      })
      .catch((error) => {
        Swal.fire({
          icon: "error",
          title: "No se pudo cargar el proyecto",
          text: error instanceof Error ? error.message : "Error desconocido",
        })
      })
      .finally(() => setCargando(false))
  }, [id])

  /* =========================
     Totales
  ========================= */
  const totales = useMemo(() => {
    const ingresos = movimientos
      .filter((t) => t.tipo === "ingreso")
      .reduce((s, t) => s + t.monto, 0)
    const egresos = movimientos
      .filter((t) => t.tipo === "egreso")
      .reduce((s, t) => s + t.monto, 0)
    const presupuesto = proyecto?.presupuesto ?? 0
    return {
      ingresos,
      egresos,
      disponible: presupuesto - egresos,
      pctUso: presupuesto > 0 ? Math.round((egresos / presupuesto) * 100) : 0,
    }
  }, [movimientos, proyecto])

  /* =========================
     Desglose de egresos por categoría
  ========================= */
  const egresoCategorias = useMemo(() => {
    const map: Record<string, { monto: number; count: number }> = {}
    movimientos
      .filter((t) => t.tipo === "egreso")
      .forEach((t) => {
        const nombre =
          t.tipo === "egreso"
            ? t.tipoEgreso === "egreso-administrativo"
              ? "Egreso Administrativo"
              : t.categoria || "Otros"
            : "Otros"
        if (!map[nombre]) map[nombre] = { monto: 0, count: 0 }
        map[nombre].monto += t.monto
        map[nombre].count += 1
      })
    return Object.entries(map)
      .map(([nombre, d]) => ({ nombre, ...d }))
      .sort((a, b) => b.monto - a.monto)
  }, [movimientos])

  const donutData = useMemo(
    () => egresoCategorias.map((c) => ({ nombre: c.nombre, monto: c.monto })),
    [egresoCategorias],
  )

  const movimientosFiltrados = useMemo(() => {
    const tipoFiltro = activeTab === "ingresos" ? "ingreso" : "egreso"
    return movimientos.filter((t) => t.tipo === tipoFiltro)
  }, [activeTab, movimientos])

  const conteos = useMemo(
    () => ({
      ingresos: movimientos.filter((t) => t.tipo === "ingreso").length,
      egresos: movimientos.filter((t) => t.tipo === "egreso").length,
    }),
    [movimientos],
  )

  if (cargando) {
    return (
      <div className="min-h-[calc(100svh-64px)] bg-base-200 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    )
  }

  if (!proyecto) {
    return (
      <div className="min-h-[calc(100svh-64px)] bg-base-200 flex flex-col items-center justify-center gap-3">
        <p className="font-bold">Proyecto no encontrado</p>
        <Link href="/proyectos" className="btn btn-primary btn-sm rounded-full">
          Volver a Proyectos
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100svh-64px)] bg-base-200 p-3 sm:p-4 lg:p-6">
      <div className="max-w-6xl mx-auto flex flex-col gap-4 sm:gap-5">
        {/* Header: volver + título + CTA */}
        <FadeIn delay={0} className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <BackButton fallback="/proyectos" label="Volver" />
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-black truncate">
                Detalle de Proyecto
              </h1>
              <p className="text-xs sm:text-sm text-base-content/60">
                Resumen financiero y movimientos
              </p>
            </div>
          </div>

          {/* C8: lleva al formulario con este proyecto preseleccionado */}
          <Link
            href={`/agregarMovimento?proyectoId=${proyecto.id}`}
            className="btn btn-primary btn-circle btn-sm sm:btn-md sm:rounded-full sm:w-auto gap-1 sm:px-4 shrink-0"
            aria-label="Agregar movimiento"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Agregar Movimiento</span>
          </Link>
        </FadeIn>

        {/* Card del Proyecto */}
        <FadeIn delay={50} className="bg-base-100 rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2.5 sm:p-3 rounded-lg shrink-0">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-black text-lg sm:text-2xl text-primary leading-tight">
                  {proyecto.nombre}
                </h2>
                <p className="text-xs sm:text-sm text-base-content/60 mt-1 flex items-center gap-1.5">
                  <Calendar size={13} className="shrink-0" />
                  Asignación: {proyecto.mesAsignacion} {proyecto.anioAsignacion}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span
                  className={`badge badge-sm sm:badge-md ${
                    proyecto.estado === "Finalizado" ? "badge-success" : "badge-warning"
                  }`}
                >
                  {proyecto.estado}
                </span>
                {/* C7A: edición de presupuesto MO y contratista */}
                <button
                  type="button"
                  onClick={() => setModalEditar(true)}
                  className="btn btn-ghost btn-sm btn-circle"
                  aria-label="Editar proyecto"
                >
                  <Pencil size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] uppercase font-bold text-base-content/50">
                  Bono
                </p>
                <p className="text-xs sm:text-sm font-semibold">{proyecto.bono}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-base-content/50">
                  Subtipo de Bono
                </p>
                <p className="text-xs sm:text-sm font-semibold">
                  {proyecto.subtipoBono}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-base-content/50">
                  Contratista de Mano de Obra
                </p>
                <p className="text-xs sm:text-sm font-semibold">
                  {proyecto.contratista}
                </p>
              </div>
            </div>

            {/* Progreso de presupuesto */}
            <div>
              <div className="flex justify-between text-xs sm:text-sm mb-1">
                <span className="text-base-content/60">
                  Presupuesto utilizado{" "}
                  <InfoTip text="Porcentaje del presupuesto consumido: egresos del proyecto ÷ presupuesto del proyecto. Si supera el 100 %, el gasto excede el presupuesto asignado." />
                </span>
                <span className="font-bold">
                  {proyecto.presupuesto > 0
                    ? `${totales.pctUso}%`
                    : "Sin presupuesto definido"}
                </span>
              </div>
              <progress
                className="progress progress-primary w-full h-2"
                value={proyecto.presupuesto > 0 ? totales.egresos : 0}
                max={proyecto.presupuesto > 0 ? proyecto.presupuesto : 1}
              />
              <div className="flex justify-between text-[11px] sm:text-xs mt-1 text-base-content/60">
                <span>Gastado: {formatCurrency(totales.egresos)}</span>
                <span>Disponible: {formatCurrency(totales.disponible)}</span>
              </div>
            </div>

            {/* Progreso de Mano de Obra (C2) */}
            <div>
              <div className="flex justify-between text-xs sm:text-sm mb-1">
                <span className="text-base-content/60">
                  Mano de Obra{" "}
                  <InfoTip text="Gasto en Mano de Obra ÷ presupuesto de Mano de Obra del proyecto." />
                </span>
                <span className="font-bold">
                  {formatCurrency(proyecto.gastadoManoObra ?? 0)} de{" "}
                  {formatCurrency(proyecto.presupuestoManoObra ?? 0)}
                </span>
              </div>
              <progress
                className="progress progress-warning w-full h-2"
                value={proyecto.gastadoManoObra ?? 0}
                max={proyecto.presupuestoManoObra || 1}
              />
            </div>

            {/* Gasto administrativo asignado del mes (C5) */}
            <div className="flex justify-between items-center text-xs sm:text-sm bg-warning/10 rounded-lg px-3 py-2">
              <span className="text-base-content/60">
                Gasto administrativo asignado ({proyecto.mesAsignacion}){" "}
                <InfoTip text="Parte del gasto administrativo del mes que le corresponde a este proyecto, según su peso presupuestario (presupuesto del proyecto ÷ presupuesto total del mes)." />
              </span>
              <span className="font-bold text-warning">
                {formatCurrency(proyecto.gastosAdministrativosMes ?? 0)}
              </span>
            </div>
          </div>
        </FadeIn>

        {/* Stat Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          <StatCard
            icon={Wallet}
            label="Presupuesto"
            value={proyecto.presupuesto}
            color="primary"
            delay={100}
            hint="Presupuesto total asignado al proyecto."
          />
          <StatCard
            icon={TrendingUp}
            label="Ingresos"
            value={totales.ingresos}
            color="success"
            delay={150}
            subtitle={`${conteos.ingresos} movimientos`}
            hint="Suma de todos los ingresos registrados en el proyecto."
          />
          <StatCard
            icon={TrendingDown}
            label="Egresos"
            value={totales.egresos}
            color="error"
            delay={200}
            subtitle={`${conteos.egresos} movimientos`}
            hint="Suma de todos los egresos del proyecto (generales y el gasto administrativo asignado)."
          />
          <StatCard
            icon={PiggyBank}
            label="Disponible"
            value={totales.disponible}
            color={totales.disponible >= 0 ? "success" : "error"}
            delay={250}
            subtitle={
              proyecto.presupuesto > 0
                ? `${totales.pctUso}% utilizado`
                : "Sin presupuesto definido"
            }
            hint="Presupuesto del proyecto − egresos del proyecto. Un porcentaje sobre 100 % indica sobregiro: el disponible es negativo."
          />
          {/* M5: ganancia = ingresos − egresos (campo derivado del backend;
              si no viene, se calcula local con los totales ya cargados) */}
          <StatCard
            icon={CircleDollarSign}
            label="Ganancia"
            value={proyecto.ganancia ?? totales.ingresos - totales.egresos}
            color={
              (proyecto.ganancia ?? totales.ingresos - totales.egresos) >= 0
                ? "success"
                : "error"
            }
            delay={275}
            subtitle="Ingresos − Egresos"
            hint="Ingresos del proyecto − egresos del proyecto."
          />
        </section>

        {/* Desglose + Distribución */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          {/* Desglose de egresos */}
          <FadeIn delay={300} className="bg-base-100 rounded-lg shadow-md p-4 sm:p-5 h-full">
            <h2 className="font-bold text-sm sm:text-base">
              Desglose de Egresos{" "}
              <InfoTip text="Porcentaje de cada categoría sobre el total de egresos del proyecto." />
            </h2>
            {egresoCategorias.length > 0 ? (
              <ul className="space-y-3 mt-3">
                {egresoCategorias.map((cat, idx) => {
                  const pct = totales.egresos > 0 ? Math.round((cat.monto / totales.egresos) * 100) : 0
                  const color = PALETA[idx % PALETA.length]
                  return (
                    <li key={cat.nombre}>
                      <div className="flex justify-between items-center text-xs sm:text-sm mb-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${color.dot}`} />
                          <span className="font-medium truncate">{cat.nombre}</span>
                          <span className="text-base-content/40 text-xs shrink-0">
                            ({cat.count} mov.)
                          </span>
                        </div>
                        <span className="font-semibold text-error shrink-0">
                          {formatCurrency(cat.monto)}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-base-200">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, backgroundColor: color.bar }}
                        />
                      </div>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="text-center text-sm text-base-content/50 mt-3">
                Sin egresos todavía
              </p>
            )}
          </FadeIn>

          {/* Distribución (donut) */}
          <FadeIn delay={350} className="bg-base-100 rounded-lg shadow-md p-4 sm:p-5 h-full">
            <h2 className="font-bold text-sm sm:text-base">
              Distribución de Egresos
            </h2>
            <DonutChart data={donutData} />
          </FadeIn>
        </section>

        {/* Movimientos con tabs */}
        <FadeIn delay={400} className="bg-base-100 rounded-lg shadow-md overflow-hidden">
          {/* Tabs segmentados */}
          <div className="p-3 sm:p-4 pb-0">
            <div className="join w-full">
              <button
                type="button"
                onClick={() => setActiveTab("ingresos")}
                className={`btn btn-sm sm:btn-md join-item flex-1 gap-2 ${
                  activeTab === "ingresos" ? "btn-success" : ""
                }`}
              >
                <TrendingUp size={16} />
                Ingresos
                <span
                  className={`badge badge-xs ${
                    activeTab === "ingresos" ? "badge-ghost" : "badge-outline"
                  }`}
                >
                  {conteos.ingresos}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("egresos")}
                className={`btn btn-sm sm:btn-md join-item flex-1 gap-2 ${
                  activeTab === "egresos" ? "btn-error" : ""
                }`}
              >
                <TrendingDown size={16} />
                Egresos
                <span
                  className={`badge badge-xs ${
                    activeTab === "egresos" ? "badge-ghost" : "badge-outline"
                  }`}
                >
                  {conteos.egresos}
                </span>
              </button>
            </div>
          </div>

          {/* Lista de movimientos */}
          {movimientosFiltrados.length > 0 ? (
            <ul className="divide-y divide-base-200 mt-3">
              {movimientosFiltrados.map((mov) => {
                const esIngreso = mov.tipo === "ingreso"
                return (
                  <li
                    key={mov.id}
                    className="flex items-center gap-3 p-3 sm:p-4 hover:bg-base-200/60 transition-colors"
                  >
                    {/* Icono por tipo */}
                    <div
                      className={`p-2 sm:p-2.5 rounded-full shrink-0 ${
                        esIngreso ? "bg-success/10" : "bg-error/10"
                      }`}
                    >
                      {esIngreso ? (
                        <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
                      ) : (
                        <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-error" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm sm:text-base truncate">
                        {esIngreso ? mov.nombreIngreso : mov.descripcion}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                        {esIngreso ? (
                          <>
                            <span className="text-[11px] text-base-content/60 shrink-0">
                              {mov.fechaPago}
                            </span>
                            <span className="hidden sm:inline text-[11px] text-base-content/50 truncate">
                              {mov.descripcion}
                            </span>
                          </>
                        ) : (
                          <>
                            <span
                              className={`badge badge-xs shrink-0 ${
                                mov.tipoEgreso === "egreso-administrativo"
                                  ? "badge-warning"
                                  : "badge-error"
                              }`}
                            >
                              {mov.tipoEgreso === "egreso-general"
                                ? "Egreso General"
                                : "Egreso Administrativo"}
                            </span>
                            <span className="text-[11px] text-base-content/60 truncate">
                              {mov.tipoEgreso === "egreso-administrativo"
                                ? `${mov.mes} ${mov.ano}`
                                : [
                                    new Date(mov.creadoEn).toLocaleDateString("es-ES", {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "numeric",
                                    }),
                                    mov.categoria,
                                    mov.ordenCompra,
                                  ]
                                    .filter(Boolean)
                                    .join(" · ")}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Monto */}
                    <p
                      className={`font-black text-sm sm:text-base shrink-0 ${
                        esIngreso ? "text-success" : "text-error"
                      }`}
                    >
                      {esIngreso ? "+" : "-"}
                      {formatCurrency(mov.monto)}
                    </p>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="text-center text-sm text-base-content/50 py-8">
              Sin movimientos de este tipo todavía
            </p>
          )}
        </FadeIn>

        {/* Modal de edición de presupuesto MO y contratista (C7A) */}
        <EditarProyectoModal
          isOpen={modalEditar}
          onClose={() => setModalEditar(false)}
          proyecto={proyecto}
          onGuardado={recargarProyecto}
        />
      </div>
    </div>
  )
}
