"use client"

import { useState } from "react"
import { ArrowLeft, Plus, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Swal from "sweetalert2"
import NavBar from "@/components/navbar/NavBar"

interface Item {
  id: number
  cantidad: string
  medida: string
  articulo: string
  valor: string
}

export default function EditarPlantillaPage() {
  const router = useRouter()

  const [nombre, setNombre] = useState("Compra 1")
  const [descripcion, setDescripcion] = useState("Materiales para construcción")
  const [items, setItems] = useState<Item[]>([
    { id: 1, cantidad: "1250", medida: "Unidad", articulo: "Block", valor: "455" },
    { id: 2, cantidad: "1250", medida: "Unidad", articulo: "Varilla", valor: "455" },
  ])

  const addItem = () =>
    setItems([
      ...items,
      { id: Date.now(), cantidad: "", medida: "Unidad", articulo: "", valor: "" },
    ])

  const removeItem = (id: number) =>
    setItems(items.filter(i => i.id !== id))

  const subtotal = items.reduce((t, i) => {
    const c = Number(i.cantidad) || 0
    const v = Number(i.valor) || 0
    return t + c * v
  }, 0)

  const flete = 8750
  const iva = subtotal * 0.13
  const total = subtotal + flete + iva

  const handleConfirmar = () => {
    Swal.fire({
      title: "¿Confirmar cambios?",
      text: "Se guardarán todos los cambios realizados a la plantilla",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, confirmar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#035496",
      cancelButtonColor: "#960303",
    }).then((result) => {
      if (result.isConfirmed) {
        console.log("Plantilla actualizada:", { nombre, descripcion, items })
        
        Swal.fire({
          title: "¡Éxito!",
          text: "Los cambios han sido guardados correctamente",
          icon: "success",
          confirmButtonColor: "#039603",
        }).then(() => {
          router.push("/plantillas")
        })
      }
    })
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-[var(--base-100)] to-[var(--base-200)] text-[var(--foreground)]">

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Main Card */}
        <section className="bg-base-200 rounded-xl shadow-md p-6 space-y-6">
          {/* Info */}
          <div className="grid gap-4">
            <div>
              <label className="label font-semibold text-[var(--foreground)]">Nombre</label>
              <input
                className="input input-bordered w-full bg-[var(--base-100)] dark:bg-[var(--base-300)] border-[var(--primary-200)] dark:border-[var(--primary-800)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-100)]"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
              />
            </div>

            <div>
              <label className="label font-semibold text-[var(--foreground)]">Descripción</label>
              <textarea
                className="textarea textarea-bordered w-full bg-[var(--base-100)] dark:bg-[var(--base-300)] border-[var(--primary-200)] dark:border-[var(--primary-800)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-100)]"
                value={descripcion}
                onChange={e => setDescripcion(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table
              className="
                table w-full
                border-separate
                border-spacing-y-3
              "
            >
              <thead>
                <tr className="text-sm font-semibold text-[var(--primary)] opacity-80">
                  <th className="w-20">Cantidad</th>
                  <th className="w-24">Medida</th>
                  <th className="flex-1">Artículo</th>
                  <th className="w-24">Valor</th>
                  <th className="w-24">Total</th>
                  <th className="w-12"></th>
                </tr>
              </thead>

              <tbody>
                {items.map(item => {
                  const rowTotal =
                    (Number(item.cantidad) || 0) * (Number(item.valor) || 0)

                  return (
                    <tr
                      key={item.id}
                      className="
                        bg-[var(--base-100)] dark:bg-[var(--base-300)]
                        rounded-lg
                        shadow-sm
                        border border-[var(--primary-100)]
                      "
                    >
                      <td className="w-20 px-1">
                        <input
                          className="input input-bordered w-full bg-white dark:bg-[var(--base-200)] border-[var(--primary-200)] dark:border-[var(--primary-800)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-100)]"
                          value={item.cantidad}
                          onChange={e =>
                            setItems(items.map(i =>
                              i.id === item.id ? { ...i, cantidad: e.target.value } : i
                            ))
                          }
                        />
                      </td>

                      <td className="w-24">
                        <select
                          className="select select-bordered w-full bg-white dark:bg-[var(--base-200)] border-[var(--primary-200)] dark:border-[var(--primary-800)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-100)]"
                          value={item.medida}
                          onChange={e =>
                            setItems(items.map(i =>
                              i.id === item.id ? { ...i, medida: e.target.value } : i
                            ))
                          }
                        >
                          <option>Unidad</option>
                          <option>Kilo</option>
                          <option>Varas</option>
                        </select>
                      </td>

                      <td className="flex-1 px-1">
                        <input
                          className="input input-bordered w-full bg-white dark:bg-[var(--base-200)] border-[var(--primary-200)] dark:border-[var(--primary-800)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-100)]"
                          placeholder="Artículo"
                          value={item.articulo}
                          onChange={e =>
                            setItems(items.map(i =>
                              i.id === item.id ? { ...i, articulo: e.target.value } : i
                            ))
                          }
                        />
                      </td>

                      <td className="w-24">
                        <input
                          className="input input-bordered w-full bg-white dark:bg-[var(--base-200)] border-[var(--primary-200)] dark:border-[var(--primary-800)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-100)]"
                          placeholder="₵"
                          value={item.valor}
                          onChange={e =>
                            setItems(items.map(i =>
                              i.id === item.id ? { ...i, valor: e.target.value } : i
                            ))
                          }
                        />
                      </td>

                      <td className="w-24 px-1 font-semibold text-center">
                        ₵{rowTotal.toLocaleString()}
                      </td>

                      <td className="w-12 text-center">
                        <button
                          className="btn btn-ghost btn-sm btn-circle"
                          onClick={() => removeItem(item.id)}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Add item */}
          <button
            onClick={addItem}
            className="
              w-full
              h-11
              btn
              btn-success
              flex
              items-center
              justify-center
              gap-2
              text-sm
              font-semibold
              hover:bg-gradient-to-r hover:from-[var(--primary)] hover:to-[#0470c8]
              hover:text-white
              transition duration-200
            "
          >
            <span className="text-lg leading-none">+</span>
            Agregar artículo
          </button>
        </section>

        {/* Totals */}
        <section className="bg-base-200 border-1 rounded-xl p-6 space-y-2 shadow-md">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span className="font-semibold">₵{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Flete</span>
            <span className="font-semibold">₵{flete.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>IVA</span>
            <span className="font-semibold">₵{iva.toFixed(0)}</span>
          </div>

          <div className="flex justify-between text-lg font-bold text-[var(--error)] border-t border-[var(--primary-100)] pt-3">
            <span>Total</span>
            <span>₵{total.toLocaleString()}</span>
          </div>
        </section>

        <button
          className="btn btn-primary w-full h-12 text-lg font-bold hover:shadow-lg transition duration-200"
          onClick={handleConfirmar}
        >
          Confirmar cambios
        </button>
      </main>
    </div>
    </>
  )
}
