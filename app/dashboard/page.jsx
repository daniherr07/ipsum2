"use client";

import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Wallet,
  FileText,
  BarChart3,
  TrendingUp,
  TrendingDown,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import NavBar from "@/components/navbar/NavBar";

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
   Gastos Administrativos component
========================= */
function GastosAdministrativosCard({ gastosAdmin, proyectosAdmin }) {
  return (
    <div className="w-full bg-base-200 flex flex-col gap-6 rounded-lg shadow-lg p-7">
      {/* Título y monto */}
      <div className="text-center">
        <span className="text-base-content text-lg uppercase font-black">
          Gastos Administrativos
        </span>
        <span className="text-4xl font-black text-warning block mt-2">
          ₵{formatNumber(gastosAdmin)}
        </span>
      </div>

      <div className="divider m-0!"></div>

      {/* Progress bars por proyecto */}
      <div className="space-y-4">
        {proyectosAdmin.map((proyecto, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-300">
                {proyecto.nombre}
              </span>
              <span className="text-sm font-bold text-warning">
                {proyecto.porcentaje}%
              </span>
            </div>
            <progress
              className="progress progress-warning w-full"
              value={proyecto.porcentaje}
              max="100"
            ></progress>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================
   Configuración de meses
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
];

/* =========================
   Data mock por mes/año
   (luego puedes traerla de BD)
========================= */
const DATA = {
  "2025-0": {
    // Enero
    ingresos: 320000,
    egresos: 410000,
    categorias: {
      Administrativos: -180000,
      Proyectos: 80000,
      Otros: -230000,
    },
    gastosAdmin: 180000,
    proyectosAdmin: [
      { nombre: "Proyecto María", porcentaje: 35 },
      { nombre: "Proyecto Lucas", porcentaje: 30 },
      { nombre: "Proyecto Carlos", porcentaje: 20 },
      { nombre: "Proyecto Ana", porcentaje: 15 },
    ],
  },
  "2025-1": {
    // Febrero
    ingresos: 500000,
    egresos: 450000,
    categorias: {
      Administrativos: -200000,
      Proyectos: 280000,
      Otros: -70000,
    },
    gastosAdmin: 200000,
    proyectosAdmin: [
      { nombre: "Proyecto María", porcentaje: 40 },
      { nombre: "Proyecto Lucas", porcentaje: 25 },
      { nombre: "Proyecto Carlos", porcentaje: 20 },
      { nombre: "Proyecto Ana", porcentaje: 15 },
    ],
  },
  "2025-2": {
    // Marzo
    ingresos: 780000,
    egresos: 520000,
    categorias: {
      Administrativos: -220000,
      Proyectos: 450000,
      Otros: -70000,
    },
    gastosAdmin: 220000,
    proyectosAdmin: [
      { nombre: "Proyecto María", porcentaje: 38 },
      { nombre: "Proyecto Lucas", porcentaje: 28 },
      { nombre: "Proyecto Carlos", porcentaje: 18 },
      { nombre: "Proyecto Ana", porcentaje: 16 },
    ],
  },
  "2025-3": {
    // Abril
    ingresos: 620000,
    egresos: 610000,
    categorias: {
      Administrativos: -240000,
      Proyectos: 320000,
      Otros: -50000,
    },
    gastosAdmin: 240000,
    proyectosAdmin: [
      { nombre: "Proyecto María", porcentaje: 42 },
      { nombre: "Proyecto Lucas", porcentaje: 25 },
      { nombre: "Proyecto Carlos", porcentaje: 18 },
      { nombre: "Proyecto Ana", porcentaje: 15 },
    ],
  },
  "2025-4": {
    // Mayo
    ingresos: 910000,
    egresos: 700000,
    categorias: {
      Administrativos: -260000,
      Proyectos: 500000,
      Otros: -20000,
    },
    gastosAdmin: 260000,
    proyectosAdmin: [
      { nombre: "Proyecto María", porcentaje: 36 },
      { nombre: "Proyecto Lucas", porcentaje: 26 },
      { nombre: "Proyecto Carlos", porcentaje: 21 },
      { nombre: "Proyecto Ana", porcentaje: 17 },
    ],
  },
  "2025-5": {
    // Junio
    ingresos: 400000,
    egresos: 650000,
    categorias: {
      Administrativos: -250000,
      Proyectos: 150000,
      Otros: -550000,
    },
    gastosAdmin: 250000,
    proyectosAdmin: [
      { nombre: "Proyecto María", porcentaje: 39 },
      { nombre: "Proyecto Lucas", porcentaje: 27 },
      { nombre: "Proyecto Carlos", porcentaje: 19 },
      { nombre: "Proyecto Ana", porcentaje: 15 },
    ],
  },
  "2025-6": {
    // Julio
    ingresos: 1050000,
    egresos: 720000,
    categorias: {
      Administrativos: -270000,
      Proyectos: 620000,
      Otros: -10000,
    },
    gastosAdmin: 270000,
    proyectosAdmin: [
      { nombre: "Proyecto María", porcentaje: 41 },
      { nombre: "Proyecto Lucas", porcentaje: 24 },
      { nombre: "Proyecto Carlos", porcentaje: 20 },
      { nombre: "Proyecto Ana", porcentaje: 15 },
    ],
  },
  "2025-7": {
    // Agosto
    ingresos: 880000,
    egresos: 830000,
    categorias: {
      Administrativos: -300000,
      Proyectos: 520000,
      Otros: -10000,
    },
    gastosAdmin: 300000,
    proyectosAdmin: [
      { nombre: "Proyecto María", porcentaje: 37 },
      { nombre: "Proyecto Lucas", porcentaje: 28 },
      { nombre: "Proyecto Carlos", porcentaje: 20 },
      { nombre: "Proyecto Ana", porcentaje: 15 },
    ],
  },
  "2025-8": {
    // Septiembre
    ingresos: 450970,
    egresos: 900780,
    categorias: {
      Administrativos: -560000,
      Proyectos: 275000,
      Otros: -15000,
    },
    gastosAdmin: 560000,
    proyectosAdmin: [
      { nombre: "Proyecto María", porcentaje: 34 },
      { nombre: "Proyecto Lucas", porcentaje: 26 },
      { nombre: "Proyecto Carlos", porcentaje: 22 },
      { nombre: "Proyecto Ana", porcentaje: 18 },
    ],
  },
  "2025-9": {
    // Octubre
    ingresos: 780000,
    egresos: 420000,
    categorias: {
      Administrativos: -210000,
      Proyectos: 600000,
      Otros: -30000,
    },
    gastosAdmin: 210000,
    proyectosAdmin: [
      { nombre: "Proyecto María", porcentaje: 40 },
      { nombre: "Proyecto Lucas", porcentaje: 27 },
      { nombre: "Proyecto Carlos", porcentaje: 19 },
      { nombre: "Proyecto Ana", porcentaje: 14 },
    ],
  },
  "2025-10": {
    // Noviembre
    ingresos: 1200000,
    egresos: 650000,
    categorias: {
      Administrativos: -280000,
      Proyectos: 750000,
      Otros: -20000,
    },
    gastosAdmin: 280000,
    proyectosAdmin: [
      { nombre: "Proyecto María", porcentaje: 35 },
      { nombre: "Proyecto Lucas", porcentaje: 28 },
      { nombre: "Proyecto Carlos", porcentaje: 22 },
      { nombre: "Proyecto Ana", porcentaje: 15 },
    ],
  },
  "2025-11": {
    // Diciembre
    ingresos: 300000,
    egresos: 550000,
    categorias: {
      Administrativos: -200000,
      Proyectos: 50000,
      Otros: -400000,
    },
    gastosAdmin: 200000,
    proyectosAdmin: [
      { nombre: "Proyecto María", porcentaje: 38 },
      { nombre: "Proyecto Lucas", porcentaje: 26 },
      { nombre: "Proyecto Carlos", porcentaje: 21 },
      { nombre: "Proyecto Ana", porcentaje: 15 },
    ],
  },
};

export default function DashboardConstructora() {
  const [mesIndex, setMesIndex] = useState(9); // Octubre
  const [anio, setAnio] = useState(2025);
  const [isChanging, setIsChanging] = useState(false);

  const key = `${anio}-${mesIndex}`;
  const data = DATA[key] ?? {
    ingresos: 0,
    egresos: 0,
    categorias: {},
  };

  const balance = data.ingresos - data.egresos;

  /* =========================
     Trigger fade effect on month change
  ========================= */
  useEffect(() => {
    setIsChanging(true);
    const timer = setTimeout(() => setIsChanging(false), 500);
    return () => clearTimeout(timer);
  }, [mesIndex, anio]);

  /* =========================
     Navegación de meses
  ========================= */
  const mesAnterior = () => {
    if (mesIndex === 0) {
      setMesIndex(11);
      setAnio((a) => a - 1);
    } else {
      setMesIndex((m) => m - 1);
    }
  };

  const mesSiguiente = () => {
    if (mesIndex === 11) {
      setMesIndex(0);
      setAnio((a) => a + 1);
    } else {
      setMesIndex((m) => m + 1);
    }
  };

  return (
    <>
      <div className=" text-white flex flex-col items-center p-3 mt-3">
        {/* Back Button */}
        <FadeIn delay={0} className="w-full mb-4">
          <Link href="/" className="btn btn-ghost btn-circle w-fit">
            <ChevronLeft size={24} />
          </Link>
        </FadeIn>

        {/* Selector de Fecha */}
        <FadeIn delay={0} className="flex flex-col items-center mb-10">
          <span className="text-gray-500 text-sm font-medium mb-1">{anio}</span>
          <div className="flex items-center gap-8">
            <button
              onClick={mesAnterior}
              className="btn btn-ghost btn-circle btn-sm bg-primary"
            >
              <ChevronLeft size={20} />
            </button>

            <h1 className="text-4xl font-black">{MESES[mesIndex]}</h1>

            <button
              onClick={mesSiguiente}
              className="btn btn-ghost btn-circle btn-sm bg-primary"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </FadeIn>

        {/* Cards Container with fade effect on month change */}
        {/* Card Principal */}
        <div
          style={{
            opacity: isChanging ? 0 : 1,
            transform: isChanging ? "translateY(16px)" : "translateY(0)",
            transition: "opacity 0.5s ease-out, transform 0.5s ease-out",
          }}
          className="w-full max-w-2xl"
        >
          <FadeIn
            delay={100}
            className="w-full bg-base-200 flex flex-col gap-6 rounded-lg shadow-lg p-7"
          >
            {/* Ingresos / Egresos */}
            <div className="grid grid-cols-2 gap-5">
              <div className=" text-center flex flex-col items-center justify-center">
                <div className="flex justify-center gap-2 text-error">
                  <TrendingDown size={14} />
                  <span className="text-[10px] uppercase font-black">
                    Egresos
                  </span>
                </div>
                <span className="font-black text-2xl text-error">
                  ₵{formatNumber(data.egresos)}
                </span>
              </div>

              <div className="text-center flex flex-col items-center justify-center">
                <div className="flex justify-center gap-2 text-success">
                  <TrendingUp size={14} />
                  <span className="text-[10px] uppercase font-black">
                    Ingresos
                  </span>
                </div>
                <span className="font-black text-2xl text-success">
                  ₵{formatNumber(data.ingresos)}
                </span>
              </div>
            </div>

            {/* Balance */}
            <div className="text-center">
              <span className="text-base-content text-lg uppercase font-black">
                Balance Total
              </span>
              <span
                className={`text-4xl font-black line-clamp-1 ${
                  balance < 0 ? "text-error" : "text-success"
                }`}
              >
                ₵{formatNumber(balance)}
              </span>
            </div>

            <div className="divider m-0!"></div>
          </FadeIn>
        </div>

        {/* Gastos Administrativos Card */}
        <div
          style={{
            opacity: isChanging ? 0 : 1,
            transform: isChanging ? "translateY(16px)" : "translateY(0)",
            transition: "opacity 0.5s ease-out, transform 0.5s ease-out",
          }}
          className="w-full max-w-2xl"
        >
          <FadeIn delay={150} className="w-full">
            <GastosAdministrativosCard
              gastosAdmin={data.gastosAdmin}
              proyectosAdmin={data.proyectosAdmin}
            />
          </FadeIn>
        </div>

        {/* Proyectos del Mes Card */}
        <div
          style={{
            opacity: isChanging ? 0 : 1,
            transform: isChanging ? "translateY(16px)" : "translateY(0)",
            transition: "opacity 0.5s ease-out, transform 0.5s ease-out",
          }}
          className="w-full max-w-2xl"
        >
          <FadeIn
            delay={200}
            className="w-full bg-base-200 flex flex-col gap-6 rounded-lg shadow-lg p-7 mt-3"
          >
            {/* Balance */}
            <div className="text-center">
              <span className="text-base-content text-lg uppercase font-black">
                Proyectos del Mes
              </span>
            </div>

            <ul className="list bg-base-100 rounded-box shadow-md">
              <li className="list-row ">
                <div className="list-col-grow">
                  <div>Clodomiro Picado</div>
                  <div className="text-xs uppercase font-semibold opacity-60">
                    ART. 59
                  </div>
                </div>
                <Link href="/prueba" className="btn btn-square btn-primary ">
                  <ExternalLink></ExternalLink>
                </Link>
              </li>

              <li className="list-row ">
                <div className="list-col-grow">
                  <div>Monseñor Sanabria</div>
                  <div className="text-xs uppercase font-semibold opacity-60">
                    CLP
                  </div>
                </div>
                <Link href="/prueba" className="btn btn-square btn-primary ">
                  <ExternalLink></ExternalLink>
                </Link>
              </li>

              <li className="list-row ">
                <div className="list-col-grow">
                  <div>Joaquín García</div>
                  <div className="text-xs uppercase font-semibold opacity-60">
                    ART. 59
                  </div>
                </div>
                <Link href="/prueba" className="btn btn-square btn-primary ">
                  <ExternalLink></ExternalLink>
                </Link>
              </li>
            </ul>
          </FadeIn>
        </div>
      </div>
    </>
  );
}
