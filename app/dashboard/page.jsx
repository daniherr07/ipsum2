"use client"

import { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Wallet, 
  FolderKanban, 
  FileText, 
  BarChart3,
  TrendingUp, 
  TrendingDown 
} from "lucide-react";

import Link from 'next/link';

export default function DashboardConstructora() {
  // Estado para manejo de fecha (Cronopedagogía aplicada)
  const [mes, setMes] = useState("Octubre");
  const [anio, setAnio] = useState(2025);

  return (
    <div className="min-h-screen bg-[var(--color-primary-950)] text-white font-sans flex flex-col items-center justify-center p-6">
      
      {/* Selector de Fecha - Jerarquía Superior */}
      <div className="flex flex-col items-center mb-10">
        <span className="text-gray-500 text-sm font-medium mb-1">{anio}</span>
        <div className="flex items-center gap-8">
          <button className="btn btn-ghost btn-circle btn-sm bg-[#1a2c3d] hover:bg-slate-800 border-none shadow-lg">
            <ChevronLeft size={20} className="text-gray-400" />
          </button>
          <h1 className="text-4xl font-black tracking-tight">{mes}</h1>
          <button className="btn btn-ghost btn-circle btn-sm bg-[#1a2c3d] hover:bg-slate-800 border-none shadow-lg">
            <ChevronRight size={20} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Card Principal de Control Financiero */}
      <div className="w-full max-w-md bg-[#162534] rounded-[42px] p-7 shadow-2xl border border-white/5 space-y-7">
        
        {/* Fila de Indicadores: Egresos e Ingresos */}
        <div className="grid grid-cols-2 gap-5">
          {/* Egresos: Basado en --error de globals.css */}
          <div className="bg-[#261b26] p-5 rounded-[28px] flex flex-col items-center border border-[var(--error)]/20 shadow-xl">
            <div className="flex items-center gap-2 text-[var(--error-content)] mb-1">
              <TrendingDown size={14} strokeWidth={3} />
              <span className="text-[10px] uppercase font-black tracking-widest opacity-80">Egresos</span>
            </div>
            <span className="text-2xl font-black text-[var(--error-content)]">₵900 780</span>
          </div>
          
          {/* Ingresos: Basado en --success de globals.css */}
          <div className="bg-[#182623] p-5 rounded-[28px] flex flex-col items-center border border-[var(--success)]/20 shadow-xl">
            <div className="flex items-center gap-2 text-[var(--success-content)] mb-1">
              <TrendingUp size={14} strokeWidth={3} />
              <span className="text-[10px] uppercase font-black tracking-widest opacity-80">Ingresos</span>
            </div>
            <span className="text-2xl font-black text-[var(--success-content)]">₵450 970</span>
          </div>
        </div>

        {/* Balance Total Destacado (Centro de Gravedad UI) */}
        <div className="bg-[#233344] rounded-[32px] p-8 flex flex-col items-center shadow-inner border border-white/5 relative overflow-hidden">
          <span className="text-gray-400 text-[11px] uppercase font-black tracking-[0.25em] mb-3 z-10">Balance Total</span>
          <span className="text-5xl font-black text-[var(--error-content)] tracking-tighter drop-shadow-2xl z-10">
            ₵-449 810
          </span>
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
        </div>

        {/* Listado de Categorías de Gasto */}
        <div className="space-y-4 px-4 pb-2">
          <div className="flex justify-between items-center group">
            <span className="text-gray-300 font-semibold group-hover:text-white transition-colors">Administrativos:</span>
            <span className="font-bold text-[var(--error-content)]">₵-560 000</span>
          </div>
          <div className="flex justify-between items-center group">
            <span className="text-gray-300 font-semibold group-hover:text-white transition-colors">Proyectos:</span>
            <span className="font-bold text-[var(--success-content)]">₵+275 000</span>
          </div>
          <div className="flex justify-between items-center group border-t border-white/5 pt-4">
            <span className="text-gray-300 font-semibold group-hover:text-white transition-colors">Otros:</span>
            <span className="font-bold text-[var(--error-content)]">₵-15 000</span>
          </div>
        </div>
      </div>

      {/* Grid de Menú de Módulos (Estilo DaisyUI 5) */}
      <div className="grid grid-cols-2 gap-5 w-full max-w-md mt-12">

        <Link href={"/movs"} className="btn h-32 bg-[#1a2c3d] border-none hover:bg-[#233344] rounded-[32px] flex flex-col items-center justify-center gap-3 transition-all hover:scale-[1.03] active:scale-95 shadow-2xl">
          <div className="p-4 bg-[#233344] rounded-2xl text-[var(--color-primary-200)] shadow-inner">
            <Wallet size={28} />
          </div>
          <span className="text-[11px] font-black uppercase tracking-widest text-gray-200">Movimientos</span>
        </Link>

        <Link href={"/plantillas"} className="btn h-32 bg-[#1a2c3d] border-none hover:bg-[#233344] rounded-[32px] flex flex-col items-center justify-center gap-3 transition-all hover:scale-[1.03] active:scale-95 shadow-2xl">
          <div className="p-4 bg-[#233344] rounded-2xl text-[var(--color-primary-200)] shadow-inner">
            <FileText size={28} />
          </div>
          <span  className="text-[11px] font-black uppercase tracking-widest text-gray-200">Plantillas</span>
        </Link>

        <Link href={"/stats"} className="btn h-32 bg-[#1a2c3d] border-none hover:bg-[#233344] rounded-[32px] flex flex-col items-center justify-center gap-3 transition-all hover:scale-[1.03] active:scale-95 shadow-2xl">
          <div className="p-4 bg-[#233344] rounded-2xl text-[var(--color-primary-200)] shadow-inner">
            <BarChart3 size={28} />
          </div>
          <span className="text-[11px] font-black uppercase tracking-widest text-gray-200">Gráficos</span>
        </Link>
      </div>
    </div>
  );
}