"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, Plus, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";

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
    onSubmit({ nombre: nombre.trim() });
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

function CRUDSection({ categoryId, categoryLabel, initialData }) {
  const [items, setItems] = useState(initialData || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    setItems(initialData || []);
    setEditingId(null);
    setIsModalOpen(false);
  }, [categoryId, initialData]);

  const handleAdd = (data) => {
    const newItem = {
      id: Math.max(...(items.map((i) => i.id) || [0]), 0) + 1,
      nombre: data.nombre,
    };
    setItems([...items, newItem]);
    setIsModalOpen(false);
    Swal.fire({
      icon: "success",
      title: "Éxito",
      text: `${categoryLabel} agregado correctamente`,
      timer: 1500,
    });
  };

  const handleEdit = (data) => {
    setItems(
      items.map((i) =>
        i.id === editingId ? { ...i, nombre: data.nombre } : i,
      ),
    );
    setIsModalOpen(false);
    setEditingId(null);
    Swal.fire({
      icon: "success",
      title: "Éxito",
      text: `${categoryLabel} actualizado correctamente`,
      timer: 1500,
    });
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
    }).then((result) => {
      if (result.isConfirmed) {
        setItems(items.filter((i) => i.id !== id));
        Swal.fire(
          "Eliminado",
          `${categoryLabel} eliminado correctamente.`,
          "success",
        );
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
            {items.length > 0 ? (
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
                <td
                  colSpan="2"
                  className="text-center py-4 text-base-content/60"
                >
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
        title={
          editingId ? `Editar ${categoryLabel}` : `Agregar ${categoryLabel}`
        }
        initialData={
          editingId ? items.find((i) => i.id === editingId) : undefined
        }
      />
    </div>
  );
}

export default function Settings() {
  const [activeCategory, setActiveCategory] = useState("tiposDeBO");

  const categories = [
    {
      id: "tiposDeBO",
      label: "Tipos de Bono",
      initialData: [
        { id: 1, nombre: "Bonificación Art. 59" },
        { id: 2, nombre: "Bonificación CLP" },
        { id: 3, nombre: "Bonificación Catorcenal" },
        { id: 4, nombre: "Bono Navideño" },
        { id: 5, nombre: "Bono de Productividad" },
        { id: 6, nombre: "Bono de Puntualidad" },
      ],
    },
    {
      id: "ordenesCompra",
      label: "Órdenes de Compra",
      initialData: [
        { id: 1, nombre: "OC-2024-001-Materiales de Construcción" },
        { id: 2, nombre: "OC-2024-002-Herramientas y Equipos" },
        { id: 3, nombre: "OC-2024-003-Servicios Profesionales" },
        { id: 4, nombre: "OC-2024-004-Sistemas Eléctricos" },
        { id: 5, nombre: "OC-2024-005-Fontanería" },
        { id: 6, nombre: "OC-2024-006-Acabados" },
      ],
    },
    {
      id: "proveedores",
      label: "Proveedores",
      initialData: [
        { id: 1, nombre: "Distribuidora Nacional de Materiales" },
        { id: 2, nombre: "Importadora Latinoamérica" },
        { id: 3, nombre: "Servicios de Ingeniería y Construcción" },
        { id: 4, nombre: "Electro Suministros de Costa Rica" },
        { id: 5, nombre: "Ferretería Industrial" },
        { id: 6, nombre: "Acabados Premium S.A." },
        { id: 7, nombre: "Logística y Transporte Directo" },
      ],
    },
  ];

  const activeCategory_ = categories.find((cat) => cat.id === activeCategory);

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
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </FadeIn>

        <FadeIn
          delay={200}
          className="bg-base-100 rounded-lg shadow-lg p-6 md:p-8"
        >
          {activeCategory_ && (
            <CRUDSection
              categoryId={activeCategory_.id}
              categoryLabel={activeCategory_.label}
              initialData={activeCategory_.initialData}
            />
          )}
        </FadeIn>
      </div>
    </div>
  );
}
