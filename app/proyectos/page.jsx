"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ChevronLeft,
  Plus,
  Search,
  X,
  Building2,
  Calendar,
  FolderOpen,
} from "lucide-react";
import Link from "next/link";

/* =========================
   Format number consistently (avoid locale mismatch)
========================= */
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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

/* =========================
   Data mock
   (mismos campos que se ingresan en /agregarProyecto)
========================= */
const initialProjects = [
  {
    id: 1,
    nombre: "Clodomiro Picado",
    presupuesto: 50000000,
    mesAsignacion: "Enero",
    anioAsignacion: "2024",
    estado: "Revisión",
    bono: "Art.59",
    subtipoBonoI: "Art.59",
  },
  {
    id: 2,
    nombre: "Monseñor Sanabria",
    presupuesto: 75000000,
    mesAsignacion: "Marzo",
    anioAsignacion: "2024",
    estado: "Revisión",
    bono: "Art.59",
    subtipoBonoI: "Art.59",
  },
  {
    id: 3,
    nombre: "Joaquín García",
    presupuesto: 60000000,
    mesAsignacion: "Mayo",
    anioAsignacion: "2024",
    estado: "Finalizado",
    bono: "Art.59",
    subtipoBonoI: "Art.59",
  },
  {
    id: 4,
    nombre: "Residencial Vista",
    presupuesto: 85000000,
    mesAsignacion: "Febrero",
    anioAsignacion: "2024",
    estado: "Revisión",
    bono: "Art.59",
    subtipoBonoI: "Art.59",
  },
  {
    id: 5,
    nombre: "Centro Comercial Norte",
    presupuesto: 120000000,
    mesAsignacion: "Junio",
    anioAsignacion: "2023",
    estado: "Finalizado",
    bono: "Art.59",
    subtipoBonoI: "Art.59",
  },
];

const ESTADOS = [
  { value: "todos", label: "Todos", activeClass: "btn-primary" },
  { value: "Revisión", label: "Revisión", activeClass: "btn-warning" },
  { value: "Finalizado", label: "Finalizado", activeClass: "btn-success" },
];

export default function ProyectosPage() {
  const [projects] = useState(initialProjects);
  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("todos");

  /* =========================
     Filtrado
  ========================= */
  const filtrados = useMemo(() => {
    let lista = [...projects];

    if (estadoFiltro !== "todos") {
      lista = lista.filter((p) => p.estado === estadoFiltro);
    }

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      lista = lista.filter((p) => p.nombre.toLowerCase().includes(q));
    }

    return lista;
  }, [projects, busqueda, estadoFiltro]);

  const limpiarFiltros = () => {
    setBusqueda("");
    setEstadoFiltro("todos");
  };

  const getEstadoBadge = (estado) =>
    estado === "Finalizado" ? "badge-success" : "badge-warning";

  return (
    <div className="min-h-[calc(100svh-64px)] bg-base-200 p-3 sm:p-4 lg:p-6">
      <div className="max-w-6xl mx-auto flex flex-col gap-4 sm:gap-5">
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
                Proyectos
              </h1>
              <p className="text-xs sm:text-sm text-base-content/60">
                {filtrados.length} de {projects.length} proyectos
              </p>
            </div>
          </div>

          <Link
            href="/agregarProyecto"
            className="btn btn-primary btn-circle btn-sm sm:btn-md sm:rounded-full sm:w-auto gap-1 sm:px-4 shrink-0"
            aria-label="Agregar proyecto"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Agregar Proyecto</span>
          </Link>
        </FadeIn>

        {/* Barra de herramientas: búsqueda + filtro por estado */}
        <FadeIn
          delay={50}
          className="bg-base-100 rounded-lg shadow-md p-3 sm:p-4 flex flex-col gap-3"
        >
          {/* Búsqueda */}
          <label className="input input-bordered flex items-center gap-2 w-full">
            <Search size={16} className="text-base-content/50 shrink-0" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar proyecto..."
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

          {/* Segmentado por estado */}
          <div className="join w-full">
            {ESTADOS.map((estado) => (
              <button
                key={estado.value}
                type="button"
                onClick={() => setEstadoFiltro(estado.value)}
                className={`btn btn-sm sm:btn-md join-item flex-1 ${
                  estadoFiltro === estado.value ? estado.activeClass : ""
                }`}
              >
                {estado.label}
              </button>
            ))}
          </div>
        </FadeIn>

        {/* Grid de proyectos */}
        {filtrados.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filtrados.map((project, index) => (
              <FadeIn key={project.id} delay={100 + index * 50} className="h-full">
                <Link
                  href="/proyecto"
                  className="bg-base-100 rounded-lg shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 h-full flex flex-col gap-3 p-4 sm:p-5"
                >
                  {/* Header: icono + nombre + estado */}
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 sm:p-2.5 rounded-lg shrink-0">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-bold text-sm sm:text-base leading-tight line-clamp-2">
                        {project.nombre}
                      </h2>
                      <p className="text-xs text-base-content/60 mt-1 flex items-center gap-1.5">
                        <Calendar size={12} className="shrink-0" />
                        {project.mesAsignacion} {project.anioAsignacion}
                      </p>
                    </div>
                    <span
                      className={`badge badge-sm shrink-0 ${getEstadoBadge(
                        project.estado,
                      )}`}
                    >
                      {project.estado}
                    </span>
                  </div>

                  {/* Bono, subtipo y presupuesto */}
                  <div className="mt-auto pt-3 border-t border-base-200">
                    <div className="flex justify-between gap-2 text-xs mb-2">
                      <span className="text-base-content/50">
                        Bono:{" "}
                        <span className="font-semibold text-base-content">
                          {project.bono}
                        </span>
                      </span>
                      <span className="text-base-content/50 text-right">
                        Subtipo:{" "}
                        <span className="font-semibold text-base-content">
                          {project.subtipoBonoI}
                        </span>
                      </span>
                    </div>
                    <p className="text-[10px] uppercase font-bold text-base-content/50">
                      Presupuesto
                    </p>
                    <p className="font-black text-primary text-lg sm:text-xl">
                      ₵{formatNumber(project.presupuesto)}
                    </p>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        ) : (
          /* Estado vacío */
          <FadeIn delay={100}>
            <div className="bg-base-100 rounded-lg shadow-md flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="bg-base-200 p-4 rounded-full mb-3">
                <FolderOpen className="w-8 h-8 text-base-content/40" />
              </div>
              {projects.length === 0 ? (
                <>
                  <p className="font-bold">No hay proyectos</p>
                  <p className="text-sm text-base-content/60 mt-1">
                    Crea tu primer proyecto para comenzar
                  </p>
                  <Link
                    href="/agregarProyecto"
                    className="btn btn-primary btn-sm rounded-full mt-4"
                  >
                    <Plus size={16} />
                    Crear Proyecto
                  </Link>
                </>
              ) : (
                <>
                  <p className="font-bold">Sin resultados</p>
                  <p className="text-sm text-base-content/60 mt-1">
                    No hay proyectos que coincidan con los filtros.
                  </p>
                  <button
                    type="button"
                    onClick={limpiarFiltros}
                    className="btn btn-primary btn-sm rounded-full mt-4"
                  >
                    Limpiar filtros
                  </button>
                </>
              )}
            </div>
          </FadeIn>
        )}
      </div>
    </div>
  );
}
