"use client";

import { useState, useEffect } from "react";
import { ArrowRightLeft, Folder, BarChart3, FileText } from "lucide-react";
import Link from "next/link";

// FadeIn animation component
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

export default function Menu() {
  return (
    <div className="min-h-[calc(100svh-64px)] bg-base-200 p-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-md flex flex-col gap-4">
        
        <FadeIn delay={0} className="text-center mb-2">
          <h1 className="text-xl sm:text-2xl font-bold text-base-content">Menú Principal</h1>
          <p className="text-xs sm:text-sm text-base-content/60 mt-1">Seleccione una opción para continuar</p>
        </FadeIn>

        <FadeIn delay={100}>
          <Link href="/movimientosIdeaFelipe" className="card bg-base-100 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 border-l-4 border-primary">
            <div className="card-body p-4 flex-row items-center gap-3">
              <div className="bg-primary/10 p-2 sm:p-3 rounded-lg">
                <ArrowRightLeft className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="card-title text-sm sm:text-base text-base-content">Agregar Movimientos</h2>
                <p className="text-xs sm:text-sm text-base-content/60 line-clamp-2">Registrar ingresos y egresos por proyecto</p>
              </div>
            </div>
          </Link>
        </FadeIn>

        <FadeIn delay={200}>
          <Link href="/movs" className="card bg-base-100 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 border-l-4 border-secondary">
            <div className="card-body p-4 flex-row items-center gap-3">
              <div className="bg-secondary/10 p-2 sm:p-3 rounded-lg">
                <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="card-title text-sm sm:text-base text-base-content">Ver Movimientos</h2>
                <p className="text-xs sm:text-sm text-base-content/60 line-clamp-2">Consultar y editar movimientos registrados</p>
              </div>
            </div>
          </Link>
        </FadeIn>

        <FadeIn delay={300}>
          <Link href="/dashboard" className="card bg-base-100 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 border-l-4 border-success">
            <div className="card-body p-4 flex-row items-center gap-3">
              <div className="bg-success/10 p-2 sm:p-3 rounded-lg">
                <Folder className="w-6 h-6 sm:w-8 sm:h-8 text-success" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="card-title text-sm sm:text-base text-base-content">Dashboard</h2>
                <p className="text-xs sm:text-sm text-base-content/60 line-clamp-2">Resumen general de proyectos y balance del mes</p>
              </div>
            </div>
          </Link>
        </FadeIn>

        <FadeIn delay={400}>
          <Link href="/stats" className="card bg-base-100 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 border-l-4 border-warning">
            <div className="card-body p-4 flex-row items-center gap-3">
              <div className="bg-warning/10 p-2 sm:p-3 rounded-lg">
                <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-warning" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="card-title text-sm sm:text-base text-base-content">Estadísticas</h2>
                <p className="text-xs sm:text-sm text-base-content/60 line-clamp-2">Gráficos y resúmenes financieros</p>
              </div>
            </div>
          </Link>
        </FadeIn>

      </div>
    </div>
  );
}
