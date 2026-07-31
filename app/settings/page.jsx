"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, Plus, Edit, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";
import {
  listarCatalogo,
  crearItemCatalogo,
  actualizarItemCatalogo,
  eliminarItemCatalogo,
  listarBonos,
  crearBono,
  actualizarBono,
  eliminarBono,
  crearSubtipoBono,
  actualizarSubtipoBono,
  eliminarSubtipoBono,
} from "@/lib/api";

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

function FormModal({ isOpen, onClose, onSubmit, title, initialData }) {
  const [nombre, setNombre] = useState("");

  useEffect(() => {
    if (initialData) {
      setNombre(initialData.nombre || "");
    } else {
      setNombre("");
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      Swal.fire("Error", "El nombre no puede estar vacío", "error");
      return;
    }
    onSubmit(nombre.trim());
    setNombre("");
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box w-full max-w-md">
        <h3 className="font-bold text-lg mb-4">{title}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-semibold">Nombre</span>
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ingrese el nombre"
              className="input input-bordered w-full"
              autoFocus
            />
          </div>
          <div className="modal-action">
            <button type="button" onClick={onClose} className="btn btn-ghost">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Guardar
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}

/* =========================
   Catálogo genérico (Órdenes de Compra, Proveedores)
   Conectado al backend real vía /catalogos/:tipo
========================= */
function CatalogoSection({ tipo, categoryLabel }) {
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const cargar = () => {
    setCargando(true);
    listarCatalogo(tipo)
      .then(setItems)
      .catch(() => {
        Swal.fire("Error", "No se pudo cargar la lista. Verifica que el backend esté corriendo.", "error");
      })
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargar();
    setEditingId(null);
    setIsModalOpen(false);
  }, [tipo]);

  const handleAdd = async (nombre) => {
    try {
      await crearItemCatalogo(tipo, nombre);
      setIsModalOpen(false);
      cargar();
      Swal.fire({ icon: "success", title: "Éxito", text: `${categoryLabel} agregado correctamente`, timer: 1500 });
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  };

  const handleEdit = async (nombre) => {
    try {
      await actualizarItemCatalogo(tipo, editingId, nombre);
      setIsModalOpen(false);
      setEditingId(null);
      cargar();
      Swal.fire({ icon: "success", title: "Éxito", text: `${categoryLabel} actualizado correctamente`, timer: 1500 });
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "¿Está seguro?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await eliminarItemCatalogo(tipo, id);
          cargar();
          Swal.fire("Eliminado", `${categoryLabel} eliminado correctamente.`, "success");
        } catch (error) {
          Swal.fire("Error", error.message, "error");
        }
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-base-content">{categoryLabel}</h2>
        <button
          onClick={() => {
            setEditingId(null);
            setIsModalOpen(true);
          }}
          className="btn btn-primary btn-sm"
        >
          <Plus size={18} /> Agregar
        </button>
      </div>

      <div className="overflow-x-auto bg-base-100 rounded-lg shadow">
        <table className="table w-full">
          <thead>
            <tr className="bg-base-200">
              <th>Nombre</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr>
                <td colSpan="2" className="text-center py-4 text-base-content/60">
                  Cargando...
                </td>
              </tr>
            ) : items.length > 0 ? (
              items.map((item) => (
                <tr key={item.id} className="hover">
                  <td className="font-semibold">{item.nombre}</td>
                  <td className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingId(item.id);
                        setIsModalOpen(true);
                      }}
                      className="btn btn-ghost btn-xs"
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="btn btn-ghost btn-xs text-error"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="text-center py-4 text-base-content/60">
                  No hay registros de {categoryLabel.toLowerCase()}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <FormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingId(null);
        }}
        onSubmit={editingId ? handleEdit : handleAdd}
        title={editingId ? `Editar ${categoryLabel}` : `Agregar ${categoryLabel}`}
        initialData={editingId ? items.find((i) => i.id === editingId) : undefined}
      />
    </div>
  );
}

/* =========================
   Bonos con subtipos anidados
   Conectado al backend real vía /bonos
========================= */
function BonosSection() {
  const [bonos, setBonos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [expandidoId, setExpandidoId] = useState(null);

  const [modalBono, setModalBono] = useState({ open: false, editingId: null });
  const [modalSubtipo, setModalSubtipo] = useState({ open: false, bonoId: null, editingId: null });

  const cargar = () => {
    setCargando(true);
    listarBonos()
      .then(setBonos)
      .catch(() => {
        Swal.fire("Error", "No se pudo cargar la lista de bonos. Verifica que el backend esté corriendo.", "error");
      })
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargar();
  }, []);

  const handleAddBono = async (nombre) => {
    try {
      await crearBono(nombre);
      setModalBono({ open: false, editingId: null });
      cargar();
      Swal.fire({ icon: "success", title: "Éxito", text: "Bono agregado correctamente", timer: 1500 });
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  };

  const handleEditBono = async (nombre) => {
    try {
      await actualizarBono(modalBono.editingId, nombre);
      setModalBono({ open: false, editingId: null });
      cargar();
      Swal.fire({ icon: "success", title: "Éxito", text: "Bono actualizado correctamente", timer: 1500 });
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  };

  const handleDeleteBono = (id) => {
    Swal.fire({
      title: "¿Está seguro?",
      text: "Se eliminará el bono y todos sus subtipos. Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await eliminarBono(id);
          cargar();
          Swal.fire("Eliminado", "Bono eliminado correctamente.", "success");
        } catch (error) {
          Swal.fire("Error", error.message, "error");
        }
      }
    });
  };

  const handleAddSubtipo = async (nombre) => {
    try {
      await crearSubtipoBono(modalSubtipo.bonoId, nombre);
      setModalSubtipo({ open: false, bonoId: null, editingId: null });
      cargar();
      Swal.fire({ icon: "success", title: "Éxito", text: "Subtipo agregado correctamente", timer: 1500 });
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  };

  const handleEditSubtipo = async (nombre) => {
    try {
      await actualizarSubtipoBono(modalSubtipo.bonoId, modalSubtipo.editingId, nombre);
      setModalSubtipo({ open: false, bonoId: null, editingId: null });
      cargar();
      Swal.fire({ icon: "success", title: "Éxito", text: "Subtipo actualizado correctamente", timer: 1500 });
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  };

  const handleDeleteSubtipo = (bonoId, subtipoId) => {
    Swal.fire({
      title: "¿Está seguro?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await eliminarSubtipoBono(bonoId, subtipoId);
          cargar();
          Swal.fire("Eliminado", "Subtipo eliminado correctamente.", "success");
        } catch (error) {
          Swal.fire("Error", error.message, "error");
        }
      }
    });
  };

  const bonoEnEdicion = bonos.find((b) => b.id === modalBono.editingId);
  const bonoDelSubtipo = bonos.find((b) => b.id === modalSubtipo.bonoId);
  const subtipoEnEdicion = bonoDelSubtipo?.subtipos.find((s) => s.id === modalSubtipo.editingId);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-base-content">Tipos de Bono</h2>
        <button
          onClick={() => setModalBono({ open: true, editingId: null })}
          className="btn btn-primary btn-sm"
        >
          <Plus size={18} /> Agregar Bono
        </button>
      </div>

      {cargando ? (
        <div className="bg-base-100 rounded-lg shadow p-4 text-center text-base-content/60">
          Cargando...
        </div>
      ) : bonos.length > 0 ? (
        <div className="space-y-3">
          {bonos.map((bono) => {
            const expandido = expandidoId === bono.id;
            return (
              <div key={bono.id} className="bg-base-100 rounded-lg shadow overflow-hidden">
                <div className="flex items-center justify-between p-3 sm:p-4">
                  <button
                    type="button"
                    onClick={() => setExpandidoId(expandido ? null : bono.id)}
                    className="flex items-center gap-2 flex-1 text-left min-w-0"
                  >
                    {expandido ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    <span className="font-bold truncate">{bono.nombre}</span>
                    <span className="badge badge-sm badge-ghost shrink-0">
                      {bono.subtipos.length} subtipo{bono.subtipos.length !== 1 ? "s" : ""}
                    </span>
                  </button>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => setModalBono({ open: true, editingId: bono.id })}
                      className="btn btn-ghost btn-xs"
                      title="Editar bono"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteBono(bono.id)}
                      className="btn btn-ghost btn-xs text-error"
                      title="Eliminar bono"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {expandido && (
                  <div className="border-t border-base-200 p-3 sm:p-4 bg-base-200/40 space-y-2">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold uppercase text-base-content/60">
                        Subtipos de bono
                      </span>
                      <button
                        onClick={() => setModalSubtipo({ open: true, bonoId: bono.id, editingId: null })}
                        className="btn btn-ghost btn-xs gap-1"
                      >
                        <Plus size={14} /> Agregar Subtipo
                      </button>
                    </div>
                    {bono.subtipos.length > 0 ? (
                      <ul className="space-y-1">
                        {bono.subtipos.map((subtipo) => (
                          <li
                            key={subtipo.id}
                            className="flex items-center justify-between bg-base-100 rounded-md px-3 py-2"
                          >
                            <span className="text-sm">{subtipo.nombre}</span>
                            <div className="flex gap-1">
                              <button
                                onClick={() =>
                                  setModalSubtipo({ open: true, bonoId: bono.id, editingId: subtipo.id })
                                }
                                className="btn btn-ghost btn-xs"
                                title="Editar subtipo"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteSubtipo(bono.id, subtipo.id)}
                                className="btn btn-ghost btn-xs text-error"
                                title="Eliminar subtipo"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-base-content/50 text-center py-2">
                        Este bono no tiene subtipos
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-base-100 rounded-lg shadow p-4 text-center text-base-content/60">
          No hay bonos registrados
        </div>
      )}

      <FormModal
        isOpen={modalBono.open}
        onClose={() => setModalBono({ open: false, editingId: null })}
        onSubmit={modalBono.editingId ? handleEditBono : handleAddBono}
        title={modalBono.editingId ? "Editar Bono" : "Agregar Bono"}
        initialData={bonoEnEdicion}
      />

      <FormModal
        isOpen={modalSubtipo.open}
        onClose={() => setModalSubtipo({ open: false, bonoId: null, editingId: null })}
        onSubmit={modalSubtipo.editingId ? handleEditSubtipo : handleAddSubtipo}
        title={modalSubtipo.editingId ? "Editar Subtipo" : "Agregar Subtipo"}
        initialData={subtipoEnEdicion}
      />
    </div>
  );
}

const CATEGORIAS = [
  { id: "bonos", label: "Tipos de Bono" },
  { id: "ordenes-compra", label: "Órdenes de Compra" },
  { id: "proveedores", label: "Proveedores" },
];

export default function Settings() {
  const [activeCategory, setActiveCategory] = useState("bonos");
  const categoria = CATEGORIAS.find((cat) => cat.id === activeCategory);

  return (
    <div className="min-h-[calc(100svh-64px)] bg-base-200 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <FadeIn delay={0} className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/" className="btn btn-ghost btn-circle">
              <ChevronLeft size={24} />
            </Link>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-base-content">
                Configuración
              </h1>
              <p className="text-base-content/60 mt-1">
                Administra los datos de la aplicación
              </p>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={100} className="mb-8">
          <div className="form-control w-full md:w-80">
            <label className="label">
              <span className="label-text font-semibold">
                Selecciona una categoría
              </span>
            </label>
            <select
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              className="select select-bordered w-full"
            >
              {CATEGORIAS.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </FadeIn>

        <FadeIn delay={200} className="bg-base-100 rounded-lg shadow-lg p-6 md:p-8">
          {categoria?.id === "bonos" ? (
            <BonosSection />
          ) : (
            <CatalogoSection tipo={categoria.id} categoryLabel={categoria.label} />
          )}
        </FadeIn>
      </div>
    </div>
  );
}
