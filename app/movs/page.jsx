"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ChevronLeft,
  Plus,
  Search,
  X,
  TrendingUp,
  TrendingDown,
  Pencil,
  Trash2,
  Inbox,
} from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";
import { listarMovimientos, actualizarMovimiento, eliminarMovimiento } from "@/lib/api";

/* =========================
   Format number consistently (avoid locale mismatch)
========================= */
function formatNumber(num) {
  return Math.round(num).toLocaleString("en-US");
}

/* =========================
   FadeIn animation component
========================= */
function FadeIn({ children, delay = 0, className = "" }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(id);
  }, [delay]);

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
  );
}

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
];

const ANOS = [2024, 2025, 2026, 2027, 2028];

const CATEGORIAS = ["Mano de Obra", "Materiales", "Equipamiento", "Servicios", "Otros"];

/* Convierte el creadoEn (ISO) del backend a dd/mm/yyyy para ordenar igual que antes */
function formatearCreatedAt(creadoEnISO) {
  const fecha = new Date(creadoEnISO);
  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const anio = fecha.getFullYear();
  return `${dia}/${mes}/${anio}`;
}

// Parse date from dd/mm/yyyy format
const parseDate = (dateStr) => {
  const [day, month, year] = dateStr.split("/").map(Number);
  return new Date(year, month - 1, day);
};

/* Título visible: los egresos no tienen nombre, solo descripción */
const getTitulo = (m) => (m.tipo === "ingreso" ? m.nombreIngreso : m.descripcion);

/* Texto meta del egreso: categoría · OC  |  mes año */
const getMetaEgreso = (m) =>
  m.tipoEgreso === "egreso-administrativo"
    ? `${m.mes} ${m.ano}`
    : [m.categoria, m.ordenCompra].filter(Boolean).join(" · ");

export default function MovimientosPage() {
  const [movimientos, setMovimientos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [tipoFiltro, setTipoFiltro] = useState("todos"); // todos | ingreso | egreso
  const [busqueda, setBusqueda] = useState("");
  const [sortBy, setSortBy] = useState("fecha-desc");
  const [filtroMes, setFiltroMes] = useState(""); // "" = todos los meses
  const [filtroAnio, setFiltroAnio] = useState(""); // "" = todos los años
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  const cargarMovimientos = () => {
    setCargando(true);
    listarMovimientos()
      .then((data) => {
        setMovimientos(
          data.map((m) => ({ ...m, created_at: formatearCreatedAt(m.creadoEn) }))
        );
      })
      .catch(() => {
        Swal.fire({
          icon: "error",
          title: "No se pudieron cargar los movimientos",
          text: "Verifica que el backend esté corriendo en localhost:4000",
        });
      })
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargarMovimientos();
  }, []);

  /* =========================
     Filtrado + ordenamiento
  ========================= */
  const filtrados = useMemo(() => {
    let lista = [...movimientos];

    if (tipoFiltro !== "todos") {
      lista = lista.filter((m) => m.tipo === tipoFiltro);
    }

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      lista = lista.filter(
        (m) =>
          getTitulo(m).toLowerCase().includes(q) ||
          m.descripcion.toLowerCase().includes(q) ||
          (m.categoria && m.categoria.toLowerCase().includes(q)),
      );
    }

    if (filtroMes) {
      lista = lista.filter((m) => MESES[parseDate(m.created_at).getMonth()] === filtroMes);
    }

    if (filtroAnio) {
      lista = lista.filter((m) => String(parseDate(m.created_at).getFullYear()) === filtroAnio);
    }

    lista.sort((a, b) => {
      switch (sortBy) {
        case "fecha-asc":
          return parseDate(a.created_at) - parseDate(b.created_at);
        case "monto-desc":
          return b.monto - a.monto;
        case "monto-asc":
          return a.monto - b.monto;
        case "fecha-desc":
        default:
          return parseDate(b.created_at) - parseDate(a.created_at);
      }
    });

    return lista;
  }, [movimientos, tipoFiltro, busqueda, sortBy, filtroMes, filtroAnio]);

  /* =========================
     Totales del conjunto filtrado
  ========================= */
  const totales = useMemo(
    () => ({
      ingresos: filtrados
        .filter((m) => m.tipo === "ingreso")
        .reduce((s, m) => s + m.monto, 0),
      egresos: filtrados
        .filter((m) => m.tipo === "egreso")
        .reduce((s, m) => s + m.monto, 0),
    }),
    [filtrados],
  );

  const limpiarFiltros = () => {
    setTipoFiltro("todos");
    setBusqueda("");
    setSortBy("fecha-desc");
    setFiltroMes("");
    setFiltroAnio("");
  };

  /* =========================
     Edición
  ========================= */
  const openEditModal = (item) => setEditingItem({ ...item });
  const closeEditModal = () => setEditingItem(null);

  const handleSave = async () => {
    if (!editingItem) return;

    let payload;
    if (editingItem.tipo === "ingreso") {
      payload = {
        tipo: "ingreso",
        proyectoId: editingItem.proyectoId,
        monto: Number(editingItem.monto),
        nombreIngreso: editingItem.nombreIngreso,
        fechaPago: editingItem.fechaPago,
        descripcion: editingItem.descripcion,
      };
    } else if (editingItem.tipoEgreso === "egreso-administrativo") {
      payload = {
        tipo: "egreso",
        tipoEgreso: "egreso-administrativo",
        monto: Number(editingItem.monto),
        mes: editingItem.mes,
        ano: String(editingItem.ano),
        descripcion: editingItem.descripcion,
      };
    } else {
      payload = {
        tipo: "egreso",
        tipoEgreso: "egreso-general",
        proyectoId: editingItem.proyectoId,
        monto: Number(editingItem.monto),
        categoria: editingItem.categoria,
        ordenCompra: editingItem.ordenCompra || undefined,
        descripcion: editingItem.descripcion,
      };
    }

    try {
      await actualizarMovimiento(editingItem.id, payload);
      closeEditModal();
      cargarMovimientos();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No se pudo guardar",
        text: error.message,
      });
    }
  };

  const handleInputChange = (field, value) => {
    setEditingItem((prev) => ({ ...prev, [field]: value }));
  };

  const handleTipoChange = (nuevoTipo) => {
    setEditingItem((prev) => ({
      ...prev,
      tipo: nuevoTipo,
      tipoEgreso:
        nuevoTipo === "egreso"
          ? prev.tipoEgreso || "egreso-general"
          : prev.tipoEgreso,
    }));
  };

  /* =========================
     Eliminación
  ========================= */
  const handleDelete = async () => {
    if (!deletingItem) return;
    try {
      await eliminarMovimiento(deletingItem.id);
      setDeletingItem(null);
      cargarMovimientos();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No se pudo eliminar",
        text: error.message,
      });
    }
  };

  const TIPOS = [
    { value: "todos", label: "Todos", activeClass: "btn-primary" },
    { value: "ingreso", label: "Ingresos", activeClass: "btn-success" },
    { value: "egreso", label: "Egresos", activeClass: "btn-error" },
  ];

  return (
    <>
      <main className="min-h-[calc(100svh-64px)] bg-base-200 p-3 sm:p-4 lg:p-6">
        <div className="max-w-4xl mx-auto flex flex-col gap-4 sm:gap-5">
          {/* Header: volver + título + CTA */}
          <FadeIn delay={0} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <Link
                href="/"
                className="btn btn-ghost btn-circle btn-sm sm:btn-md shrink-0"
                aria-label="Volver al inicio"
              >
                <ChevronLeft size={22} />
              </Link>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-black truncate">
                  Movimientos
                </h1>
                <p className="text-xs sm:text-sm text-base-content/60">
                  {filtrados.length} de {movimientos.length} registros
                </p>
              </div>
            </div>

            <Link
              href="/agregarMovimento"
              className="btn btn-primary btn-circle btn-sm sm:btn-md sm:rounded-full sm:w-auto gap-1 sm:px-4 shrink-0"
              aria-label="Añadir movimiento"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Añadir Movimiento</span>
            </Link>
          </FadeIn>

          {/* Resumen: ingresos / egresos del filtro actual */}
          <FadeIn delay={50} className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-base-100 rounded-lg shadow-md p-3 sm:p-4 flex items-center gap-3">
              <div className="bg-success/10 p-2 sm:p-2.5 rounded-lg shrink-0">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs uppercase font-bold text-base-content/60">
                  Ingresos
                </p>
                <p className="font-black text-success text-sm sm:text-xl truncate">
                  ₵{formatNumber(totales.ingresos)}
                </p>
              </div>
            </div>

            <div className="bg-base-100 rounded-lg shadow-md p-3 sm:p-4 flex items-center gap-3">
              <div className="bg-error/10 p-2 sm:p-2.5 rounded-lg shrink-0">
                <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-error" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs uppercase font-bold text-base-content/60">
                  Egresos
                </p>
                <p className="font-black text-error text-sm sm:text-xl truncate">
                  ₵{formatNumber(totales.egresos)}
                </p>
              </div>
            </div>
          </FadeIn>

          {/* Barra de herramientas: búsqueda + filtros */}
          <FadeIn
            delay={100}
            className="bg-base-100 rounded-lg shadow-md p-3 sm:p-4 flex flex-col gap-3"
          >
            {/* Búsqueda */}
            <label className="input input-bordered flex items-center gap-2 w-full">
              <Search size={16} className="text-base-content/50 shrink-0" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre, descripción o categoría..."
                className="grow"
              />
              {busqueda && (
                <button
                  type="button"
                  onClick={() => setBusqueda("")}
                  className="btn btn-ghost btn-xs btn-circle shrink-0"
                  aria-label="Limpiar búsqueda"
                >
                  <X size={14} />
                </button>
              )}
            </label>

            {/* Segmentado por tipo */}
            <div className="join w-full">
              {TIPOS.map((tipo) => (
                <button
                  key={tipo.value}
                  type="button"
                  onClick={() => setTipoFiltro(tipo.value)}
                  className={`btn btn-sm sm:btn-md join-item flex-1 ${
                    tipoFiltro === tipo.value ? tipo.activeClass : ""
                  }`}
                >
                  {tipo.label}
                </button>
              ))}
            </div>

            {/* Orden */}
            <div>
              <span className="text-[10px] uppercase font-bold text-base-content/50 ml-1">
                Ordenar por
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="select select-bordered select-sm w-full mt-1"
              >
                <option value="fecha-desc">Más recientes</option>
                <option value="fecha-asc">Más antiguos</option>
                <option value="monto-desc">Mayor monto</option>
                <option value="monto-asc">Menor monto</option>
              </select>
            </div>

            {/* Mes y Año */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-base-content/50 ml-1">
                  Mes
                </span>
                <select
                  value={filtroMes}
                  onChange={(e) => setFiltroMes(e.target.value)}
                  className="select select-bordered select-sm w-full mt-1"
                >
                  <option value="">Todos</option>
                  {MESES.map((mes) => (
                    <option key={mes} value={mes}>
                      {mes}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-base-content/50 ml-1">
                  Año
                </span>
                <select
                  value={filtroAnio}
                  onChange={(e) => setFiltroAnio(e.target.value)}
                  className="select select-bordered select-sm w-full mt-1"
                >
                  <option value="">Todos</option>
                  {ANOS.map((ano) => (
                    <option key={ano} value={ano}>
                      {ano}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </FadeIn>

          {/* Lista de movimientos */}
          <FadeIn delay={150}>
            <div className="bg-base-100 rounded-lg shadow-md overflow-hidden">
              {filtrados.length > 0 ? (
                <ul className="divide-y divide-base-200">
                  {filtrados.map((item) => {
                    const esIngreso = item.tipo === "ingreso";
                    return (
                      <li
                        key={item.id}
                        className="group flex items-center gap-3 p-3 sm:p-4 hover:bg-base-200/60 transition-colors"
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
                            {getTitulo(item)}
                          </p>
                          {esIngreso ? (
                            /* Ingreso: fecha + descripción en una sola línea */
                            <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                              <span className="text-[11px] text-base-content/60 shrink-0">
                                {item.fechaPago}
                              </span>
                              <span className="hidden sm:inline text-[11px] text-base-content/50 truncate">
                                {item.descripcion}
                              </span>
                            </div>
                          ) : (
                            /* Egreso: badge de tipo + meta truncada */
                            <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                              <span
                                className={`badge badge-xs shrink-0 ${
                                  item.tipoEgreso === "egreso-administrativo"
                                    ? "badge-warning"
                                    : "badge-error"
                                }`}
                              >
                                {item.tipoEgreso === "egreso-general"
                                  ? "Egreso General"
                                  : "Egreso Administrativo"}
                              </span>
                              <span className="text-[11px] text-base-content/60 truncate">
                                {getMetaEgreso(item)}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Monto */}
                        <p
                          className={`font-black text-sm sm:text-base shrink-0 ${
                            esIngreso ? "text-success" : "text-error"
                          }`}
                        >
                          {esIngreso ? "+" : "-"}₵{formatNumber(item.monto)}
                        </p>

                        {/* Acciones (hover en escritorio) */}
                        <div className="flex gap-0.5 shrink-0 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100 transition-opacity">
                          <button
                            type="button"
                            className="btn btn-ghost btn-xs sm:btn-sm btn-circle"
                            onClick={() => openEditModal(item)}
                            aria-label={`Editar ${getTitulo(item)}`}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost btn-xs sm:btn-sm btn-circle text-error"
                            onClick={() => setDeletingItem(item)}
                            aria-label={`Eliminar ${getTitulo(item)}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                /* Estado vacío */
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="bg-base-200 p-4 rounded-full mb-3">
                    <Inbox className="w-8 h-8 text-base-content/40" />
                  </div>
                  <p className="font-bold">Sin resultados</p>
                  <p className="text-sm text-base-content/60 mt-1">
                    No hay movimientos que coincidan con los filtros.
                  </p>
                  <button
                    type="button"
                    onClick={limpiarFiltros}
                    className="btn btn-primary btn-sm rounded-full mt-4"
                  >
                    Limpiar filtros
                  </button>
                </div>
              )}
            </div>
          </FadeIn>
        </div>
      </main>

      {/* Modal de Edición */}
      {editingItem && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-md p-4 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-base">Editar Movimiento</h3>
              <button
                className="btn btn-xs btn-circle btn-ghost"
                onClick={closeEditModal}
                aria-label="Cerrar"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {/* Tipo */}
              <fieldset className="fieldset w-full">
                <legend className="fieldset-legend text-xs">Tipo</legend>
                <select
                  className="select select-sm w-full"
                  value={editingItem.tipo}
                  onChange={(e) => handleTipoChange(e.target.value)}
                >
                  <option value="ingreso">Ingreso de proyecto</option>
                  <option value="egreso">Egreso de proyecto</option>
                </select>
              </fieldset>

              {/* Campos de INGRESO */}
              {editingItem.tipo === "ingreso" && (
                <>
                  <fieldset className="fieldset w-full">
                    <legend className="fieldset-legend text-xs">
                      Nombre del Ingreso
                    </legend>
                    <input
                      type="text"
                      className="input input-sm w-full"
                      value={editingItem.nombreIngreso || ""}
                      onChange={(e) =>
                        handleInputChange("nombreIngreso", e.target.value)
                      }
                    />
                  </fieldset>

                  <fieldset className="fieldset w-full">
                    <legend className="fieldset-legend text-xs">
                      Fecha de Pago
                    </legend>
                    <input
                      type="text"
                      className="input input-sm w-full"
                      value={editingItem.fechaPago || ""}
                      placeholder="dd/mm/aaaa"
                      onChange={(e) =>
                        handleInputChange("fechaPago", e.target.value)
                      }
                    />
                  </fieldset>
                </>
              )}

              {/* Campos de EGRESO */}
              {editingItem.tipo === "egreso" && (
                <>
                  <fieldset className="fieldset w-full">
                    <legend className="fieldset-legend text-xs">
                      Tipo de Egreso
                    </legend>
                    <select
                      className="select select-sm w-full"
                      value={editingItem.tipoEgreso || "egreso-general"}
                      onChange={(e) =>
                        handleInputChange("tipoEgreso", e.target.value)
                      }
                    >
                      <option value="egreso-general">Egreso General</option>
                      <option value="egreso-administrativo">
                        Egreso Administrativo
                      </option>
                    </select>
                  </fieldset>

                  {editingItem.tipoEgreso === "egreso-administrativo" ? (
                    <div className="grid grid-cols-2 gap-2">
                      <fieldset className="fieldset w-full">
                        <legend className="fieldset-legend text-xs">Mes</legend>
                        <select
                          className="select select-sm w-full"
                          value={editingItem.mes || ""}
                          onChange={(e) => handleInputChange("mes", e.target.value)}
                        >
                          <option value="">Seleccionar...</option>
                          {MESES.map((mes) => (
                            <option key={mes} value={mes}>
                              {mes}
                            </option>
                          ))}
                        </select>
                      </fieldset>
                      <fieldset className="fieldset w-full">
                        <legend className="fieldset-legend text-xs">Año</legend>
                        <select
                          className="select select-sm w-full"
                          value={editingItem.ano || ""}
                          onChange={(e) => handleInputChange("ano", e.target.value)}
                        >
                          <option value="">Seleccionar...</option>
                          {ANOS.map((ano) => (
                            <option key={ano} value={ano}>
                              {ano}
                            </option>
                          ))}
                        </select>
                      </fieldset>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <fieldset className="fieldset w-full">
                        <legend className="fieldset-legend text-xs">
                          Categoría
                        </legend>
                        <select
                          className="select select-sm w-full"
                          value={editingItem.categoria || ""}
                          onChange={(e) =>
                            handleInputChange("categoria", e.target.value)
                          }
                        >
                          <option value="">Seleccionar...</option>
                          {CATEGORIAS.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </fieldset>
                      <fieldset className="fieldset w-full">
                        <legend className="fieldset-legend text-xs">
                          Orden de Compra
                        </legend>
                        <input
                          type="text"
                          className="input input-sm w-full"
                          value={editingItem.ordenCompra || ""}
                          placeholder="Opcional"
                          onChange={(e) =>
                            handleInputChange("ordenCompra", e.target.value)
                          }
                        />
                      </fieldset>
                    </div>
                  )}
                </>
              )}

              {/* Descripción + Monto (todos) */}
              <fieldset className="fieldset w-full">
                <legend className="fieldset-legend text-xs">Descripción</legend>
                <input
                  type="text"
                  className="input input-sm w-full"
                  value={editingItem.descripcion}
                  onChange={(e) =>
                    handleInputChange("descripcion", e.target.value)
                  }
                />
              </fieldset>

              <fieldset className="fieldset w-full">
                <legend className="fieldset-legend text-xs">Monto (₵)</legend>
                <input
                  type="number"
                  className="input input-sm w-full"
                  value={editingItem.monto}
                  onChange={(e) =>
                    handleInputChange("monto", Number(e.target.value))
                  }
                />
              </fieldset>
            </div>

            <div className="modal-action mt-3">
              <button className="btn btn-sm btn-ghost" onClick={closeEditModal}>
                Cancelar
              </button>
              <button className="btn btn-sm btn-primary" onClick={handleSave}>
                Guardar
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop bg-black/50"
            onClick={closeEditModal}
          ></div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {deletingItem && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-sm p-5">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="bg-error/10 p-3 rounded-full">
                <Trash2 className="w-6 h-6 text-error" />
              </div>
              <h3 className="font-bold text-lg">¿Eliminar movimiento?</h3>
              <p className="text-sm text-base-content/60">
                <span className="font-semibold text-base-content">
                  {getTitulo(deletingItem)}
                </span>{" "}
                se eliminará permanentemente.
              </p>
            </div>
            <div className="modal-action flex gap-2 mt-2">
              <button
                className="btn btn-ghost flex-1"
                onClick={() => setDeletingItem(null)}
              >
                Cancelar
              </button>
              <button className="btn btn-error flex-1" onClick={handleDelete}>
                Eliminar
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop bg-black/50"
            onClick={() => setDeletingItem(null)}
          ></div>
        </div>
      )}
    </>
  );
}
