"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, Plus, MapPin, Calendar, TrendingUp } from "lucide-react";
import Link from "next/link";

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

export default function ProjectsPage() {
  const [projects] = useState([
    {
      id: 1,
      nombre: "Clodomiro Picado",
      ubicacion: "San José, Costa Rica",
      estado: "Revisión de Documentos",
      fechaInicio: "15/01/2024",
      presupuesto: 50000000,
      gastos: 32500000,
    },
    {
      id: 2,
      nombre: "Monseñor Sanabria",
      ubicacion: "Cartago, Costa Rica",
      estado: "Revisión de Documentos",
      fechaInicio: "20/03/2024",
      presupuesto: 75000000,
      gastos: 33750000,
    },
    {
      id: 3,
      nombre: "Joaquín García",
      ubicacion: "Heredia, Costa Rica",
      estado: "Revisión de Documentos",
      fechaInicio: "10/05/2024",
      presupuesto: 60000000,
      gastos: 18000000,
    },
    {
      id: 4,
      nombre: "Residencial Vista",
      ubicacion: "Alajuela, Costa Rica",
      estado: "Revisión de Documentos",
      fechaInicio: "01/02/2024",
      presupuesto: 85000000,
      gastos: 46750000,
    },
    {
      id: 5,
      nombre: "Centro Comercial Norte",
      ubicacion: "San José, Costa Rica",
      estado: "Revisión de Documentos",
      fechaInicio: "15/06/2023",
      presupuesto: 120000000,
      gastos: 120000000,
    },
  ]);

  const getEstadoColor = (estado) => {
    return "badge-warning";
  };

  const getBudgetPercentage = (gastos, presupuesto) => {
    return (gastos / presupuesto) * 100;
  };

  return (
    <div className="min-h-[calc(100svh-64px)] bg-base-200 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <FadeIn delay={0} className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/" className="btn btn-ghost btn-circle">
              <ChevronLeft size={24} />
            </Link>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-base-content">
                Proyectos
              </h1>
              <p className="text-base-content/60 mt-1">
                Administra y visualiza todos tus proyectos
              </p>
            </div>
          </div>
        </FadeIn>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project, index) => (
            <FadeIn key={project.id} delay={100 + index * 50}>
              <Link
                href="/prueba"
                className="card bg-base-100 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 border-t-4 border-primary h-full"
              >
                <div className="card-body flex flex-col">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h2 className="card-title text-base text-base-content line-clamp-2">
                        {project.nombre}
                      </h2>
                    </div>
                    <span
                      className={`badge ${getEstadoColor(
                        project.estado,
                      )} badge-sm ml-2`}
                    >
                      {project.estado}
                    </span>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-2 text-sm text-base-content/60 mb-3">
                    <MapPin size={16} />
                    <span className="line-clamp-1">{project.ubicacion}</span>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-2 text-sm text-base-content/60 mb-4">
                    <Calendar size={16} />
                    <span>Inicio: {project.fechaInicio}</span>
                  </div>

                  {/* Budget Info */}
                  <div className="divider my-2"></div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-base-content/60">Presupuesto</span>
                      <span className="font-semibold">
                        ₵{(project.presupuesto / 1000000).toFixed(1)}M
                      </span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-base-content/60">Presupuesto Utilizado</span>
                      <span className="font-semibold text-warning">
                        {Math.round(getBudgetPercentage(project.gastos, project.presupuesto))}% (₵{(project.gastos / 1000000).toFixed(1)}M)
                      </span>
                    </div>
                    <progress
                      className="progress progress-warning w-full h-2"
                      value={getBudgetPercentage(project.gastos, project.presupuesto)}
                      max="100"
                    ></progress>
                    <div className="flex justify-between text-xs">
                      <span className="text-base-content/60">
                        ₵{(project.gastos / 1000000).toFixed(1)}M gastado
                      </span>
                      <span className="text-base-content/60">
                        ₵{((project.presupuesto - project.gastos) / 1000000).toFixed(1)}M restante
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>

        {/* Empty State */}
        {projects.length === 0 && (
          <FadeIn delay={100} className="text-center py-12">
            <div className="text-base-content/60">
              <p className="text-lg font-semibold mb-2">No hay proyectos</p>
              <p className="text-sm mb-4">
                Crea tu primer proyecto para comenzar
              </p>
              <Link href="/newproject" className="btn btn-primary">
                <Plus size={20} />
                Crear Proyecto
              </Link>
            </div>
          </FadeIn>
        )}
      </div>
    </div>
  );
}
