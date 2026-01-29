"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Wallet,
  FileText,
  BarChart3,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import Link from "next/link";
import NavBar from "@/components/navbar/NavBar";

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
  },
};

export default function DashboardConstructora() {
  const [mesIndex, setMesIndex] = useState(9); // Octubre
  const [anio, setAnio] = useState(2025);

  const key = `${anio}-${mesIndex}`;
  const data = DATA[key] ?? {
    ingresos: 0,
    egresos: 0,
    categorias: {},
  };

  const balance = data.ingresos - data.egresos;

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
        {/* Selector de Fecha */}
        <div className="flex flex-col items-center mb-10">
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
        </div>

        {/* Card Principal */}
        <div className="w-full max-w-md bg-base-200 flex flex-col gap-6 rounded-lg shadow-lg p-7">
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
                ₵{data.egresos.toLocaleString()}
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
                ₵{data.ingresos.toLocaleString()}
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
              ₵{balance.toLocaleString()}
            </span>
          </div>

          <div className="divider m-0!"></div>

          {/* Categorías */}
          <div className=" px-4">
            {Object.entries(data.categorias).map(([cat, val]) => (
              <div key={cat} className="flex justify-between">
                <span className="text-gray-300 font-semibold">{cat}</span>
                <span
                  className={`font-bold ${
                    val < 0 ? "text-error" : "text-success"
                  }`}
                >
                  ₵{val.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
