"use client"

import { useState } from "react"
import { ArrowLeft, Search } from "lucide-react"
import Link from "next/link"
import Swal from "sweetalert2"
import NavBar from "@/components/navbar/NavBar"

export default function PlantillasPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRow, setSelectedRow] = useState<number | null>(null)

  const plantillas = [
    { id: 1, nombre: "Compra 1", descripcion: "Materiales para...", monto: "₵1 080 000" },
    { id: 2, nombre: "Compra 2", descripcion: "Materiales para...", monto: "₵435 030" },
    { id: 3, nombre: "Madera Inicio", descripcion: "Materiales para...", monto: "₵900 000" },
    { id: 4, nombre: "Centro de Carga", descripcion: "Descripción básica", monto: "₵50 000" },
  ]

  const filtered = plantillas.filter(p =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = () => {
    if (!selectedRow) return

    const selected = plantillas.find(p => p.id === selectedRow)

    Swal.fire({
      theme: "dark",
      title: "¿Estás seguro?",
      text: `¿Deseas borrar la plantilla "${selected?.nombre}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, borrar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#960303",
      cancelButtonColor: "#035496",
    }).then(result => {
      if (result.isConfirmed) {
        console.log("Borrando fila:", selectedRow)

        // Aquí luego conectas backend
        setSelectedRow(null)

        Swal.fire({
          title: "Eliminado",
          text: "La plantilla fue eliminada correctamente",
          icon: "success",
          confirmButtonColor: "#039603",
        })
      }
    })
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-[var(--base-100)] to-[var(--base-200)] text-[var(--foreground)]">

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Search */}
        <div
          className="
            bg-white dark:bg-[var(--base-200)]
            rounded-xl
          "
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-base-content z-2" />
            <input
              className="input input-bordered w-full pl-10 bg-base-100 border-base-content focus:border-base-content/60 focus:ring-2 focus:ring-[var(--primary-100)]"
              placeholder="Buscar plantilla..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table Card */}
        <div
          className="
          bg-base-200
            border border-base-300
            rounded-xl
            p-4
          "
        >
          <div className="overflow-x-auto">
            <table className="table w-full border-separate border-spacing-y-3">
              <thead>
                <tr className="text-sm font-semibold text-[var(--primary)] opacity-80">
                  <th className="text-left">Nombre</th>
                  <th className="text-left">Descripción</th>
                  <th className="text-left">Monto total</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map(p => {
                  const selected = selectedRow === p.id

                  return (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedRow(p.id)}
                      className={`
                        cursor-pointer transition duration-200 rounded-lg font-medium
                        ${selected
                          ? "bg-gradient-to-r from-[var(--primary)] to-[#0470c8] text-white shadow-md scale-[1.02]"
                          : "bg-[var(--base-100)] dark:bg-[var(--base-300)] hover:bg-[var(--primary-50)] dark:hover:bg-[var(--base-300)] border border-[var(--primary-100)]"}
                      `}
                    >
                      <td className="py-4 font-semibold">{p.nombre}</td>
                      <td className="py-4 opacity-80">{p.descripcion}</td>
                      <td className="py-4 font-bold text-[var(--primary)]">{p.monto}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Primary action */}
        <Link href="/plantillas/crear">
          <button className="btn w-full h-12 text-base font-bold btn-primary text-white hover:shadow-lg transition duration-200">
            + Crear nueva plantilla
          </button>
        </Link>

        {/* Secondary actions */}
        <div className="grid grid-cols-2 gap-4 pt-1 mt-2">
          <button
            className={`btn btn-error h-12 font-semibold hover:bg-[#760202] transition duration-200 ${!selectedRow ? "opacity-50 cursor-not-allowed" : "hover:shadow-md"}`}
            disabled={!selectedRow}
            onClick={handleDelete}
          >
            Borrar
          </button>

          <Link
            href={selectedRow ? `/plantillas/${selectedRow}/editar` : "#"}
            className={!selectedRow ? "pointer-events-none opacity-50" : ""}
          >
            <button className="btn btn-warning h-12 w-full font-semibold hover:bg-[#6d6f01] transition duration-200 hover:shadow-md">
              Ver y editar
            </button>
          </Link>
        </div>
      </div>
    </div>
    </>
  )
}
