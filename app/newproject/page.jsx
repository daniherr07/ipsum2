"use client";

import { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";

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

export default function NewProject() {
  const [formData, setFormData] = useState({
    nombreProyecto: "",
    mesAsignacion: "",
    estado: "Revisión",
    bono: "Art.59",
    subtipoBonoI: "Art.59",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const meses = [
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombreProyecto.trim()) {
      newErrors.nombreProyecto = "El nombre del proyecto es requerido";
    }
    if (!formData.mesAsignacion) {
      newErrors.mesAsignacion = "El mes de asignación es requerido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      setIsSubmitted(true);
      Swal.fire({
        title: "¡Éxito!",
        html: `El proyecto "<strong>${formData.nombreProyecto}</strong>" ha sido creado exitosamente.`,
        icon: "success",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#3b82f6",
      }).then(() => {
        setFormData({
          nombreProyecto: "",
          mesAsignacion: "",
          estado: "Revisión",
          bono: "Art.59",
          subtipoBonoI: "Art.59",
        });
        setIsSubmitted(false);
      });
    }
  };

  return (
    <>
      <div className="text-white flex flex-col items-center p-3 mt-3 min-h-screen">
        {/* Header */}
        <FadeIn delay={0} className="w-full max-w-2xl mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/" className="btn btn-ghost btn-circle">
              <ChevronLeft size={20} />
            </Link>
            <h1 className="text-4xl font-black">Nuevo Proyecto</h1>
          </div>
        </FadeIn>

        {/* Form Card */}
        <FadeIn
          delay={100}
          className="w-full max-w-2xl bg-base-200 flex flex-col gap-6 rounded-lg shadow-lg p-7"
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Nombre del Proyecto */}
            <div className="fieldset">
              <label className="label">
                <span className="label-text font-semibold">
                  Nombre del Proyecto
                </span>
              </label>
              <input
                type="text"
                name="nombreProyecto"
                value={formData.nombreProyecto}
                onChange={handleInputChange}
                placeholder="Ej: Proyecto María"
                className={`input input-bordered w-full ${
                  errors.nombreProyecto ? "input-error" : ""
                }`}
              />
              {errors.nombreProyecto && (
                <span className="text-error text-sm mt-1">
                  {errors.nombreProyecto}
                </span>
              )}
            </div>

            {/* Mes de Asignación */}
            <div className="fieldset">
              <label className="label">
                <span className="label-text font-semibold">
                  Mes de Asignación
                </span>
              </label>
              <select
                name="mesAsignacion"
                value={formData.mesAsignacion}
                onChange={handleInputChange}
                className={`select select-bordered w-full ${
                  errors.mesAsignacion ? "select-error" : ""
                }`}
              >
                <option value="">Seleccionar mes...</option>
                {meses.map((mes, index) => (
                  <option key={index} value={mes}>
                    {mes}
                  </option>
                ))}
              </select>
              {errors.mesAsignacion && (
                <span className="text-error text-sm mt-1">
                  {errors.mesAsignacion}
                </span>
              )}
            </div>

            {/* Estado */}
            <div className="fieldset">
              <label className="label">
                <span className="label-text font-semibold">Estado</span>
              </label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleInputChange}
                className="select select-bordered w-full"
              >
                <option value="Revisión">Revisión</option>
                <option value="Finalizado">Finalizado</option>
              </select>
            </div>

            {/* Bono */}
            <div className="fieldset">
              <label className="label">
                <span className="label-text font-semibold">Bono</span>
              </label>
              <select
                name="bono"
                value={formData.bono}
                onChange={handleInputChange}
                className="select select-bordered w-full"
              >
                <option value="Art.59">Art.59</option>
              </select>
            </div>

            {/* Subtipo de Bono */}
            <div className="fieldset">
              <label className="label">
                <span className="label-text font-semibold">
                  Subtipo de Bono
                </span>
              </label>
              <select
                name="subtipoBonoI"
                value={formData.subtipoBonoI}
                onChange={handleInputChange}
                className="select select-bordered w-full"
              >
                <option value="Art.59">Art.59</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button type="submit" className="btn btn-primary flex-1">
                Crear Proyecto
              </button>
              <Link href="/" className="btn btn-ghost flex-1">
                Cancelar
              </Link>
            </div>
          </form>
        </FadeIn>
      </div>
    </>
  );
}
