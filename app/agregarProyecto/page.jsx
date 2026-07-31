"use client";

import { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";
import { crearProyecto, listarBonos } from "@/lib/api";

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
   Campo de formulario con label consistente
========================= */
function Field({ label, error, children }) {
  return (
    <div className="form-control">
      <label className="label pt-0">
        <span className="label-text font-semibold">{label}</span>
      </label>
      {children}
      {error && <span className="text-error text-sm mt-1">{error}</span>}
    </div>
  );
}

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

const ANOS = [2024, 2025, 2026, 2027, 2028];

const initialFormData = {
  nombreProyecto: "",
  presupuesto: "",
  mesAsignacion: "",
  anioAsignacion: "",
  estado: "Revisión",
  bono: "",
  subtipoBonoI: "",
};

/* Mismo separador de miles que el resto de la app (₡1.500.000) */
const formatCurrency = (value) => {
  const num = parseInt(value.replace(/\D/g, "")) || 0;
  return `₡${num.toLocaleString("es-ES", {
    maximumFractionDigits: 0,
    useGrouping: "always",
  })}`;
};

export default function AgregarProyecto() {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [bonos, setBonos] = useState([]);

  useEffect(() => {
    listarBonos()
      .then(setBonos)
      .catch(() => {
        Swal.fire({
          icon: "error",
          title: "No se pudieron cargar los bonos",
          text: "Verifica que el backend esté corriendo en localhost:4000",
        });
      });
  }, []);

  const bonoSeleccionado = bonos.find((b) => b.nombre === formData.bono);
  const subtiposDisponibles = bonoSeleccionado?.subtipos ?? [];

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

  const handleBonoChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      bono: value,
      subtipoBonoI: "",
    }));
  };

  /* Presupuesto: solo dígitos, se muestra formateado en ₡ */
  const handlePresupuestoChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setFormData((prev) => ({
      ...prev,
      presupuesto: value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombreProyecto.trim()) {
      newErrors.nombreProyecto = "El nombre del proyecto es requerido";
    }
    if (!formData.mesAsignacion) {
      newErrors.mesAsignacion = "El mes de asignación es requerido";
    }
    if (!formData.anioAsignacion) {
      newErrors.anioAsignacion = "El año de asignación es requerido";
    }
    if (!formData.bono) {
      newErrors.bono = "El bono es requerido";
    }
    if (subtiposDisponibles.length > 0 && !formData.subtipoBonoI) {
      newErrors.subtipoBonoI = "El subtipo de bono es requerido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await crearProyecto({
        nombre: formData.nombreProyecto,
        presupuesto: Number(formData.presupuesto),
        mesAsignacion: formData.mesAsignacion,
        anioAsignacion: String(formData.anioAsignacion),
        estado: formData.estado,
        bono: formData.bono,
        subtipoBono: formData.subtipoBonoI || undefined,
      });

      Swal.fire({
        title: "¡Éxito!",
        html: `El proyecto "<strong>${formData.nombreProyecto}</strong>" ha sido creado exitosamente.`,
        icon: "success",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#035496",
      }).then(() => {
        setFormData(initialFormData);
        setErrors({});
      });
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.message,
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    }
  };

  return (
    <div className="min-h-[calc(100svh-64px)] bg-base-200">
      <main className="p-3 sm:p-4 lg:p-6">
        <div className="max-w-2xl mx-auto flex flex-col gap-4 sm:gap-5">
          {/* Header */}
          <FadeIn delay={0} className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="btn btn-ghost btn-circle btn-sm sm:btn-md shrink-0"
              aria-label="Volver al inicio"
            >
              <ChevronLeft size={22} />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-black">
                Agregar Proyecto
              </h1>
              <p className="text-xs sm:text-sm text-base-content/60">
                Registra un nuevo proyecto en el sistema
              </p>
            </div>
          </FadeIn>

          {/* Formulario */}
          <FadeIn delay={100} className="bg-base-100 rounded-lg shadow-md">
            <form
              onSubmit={handleSubmit}
              className="p-4 sm:p-6 flex flex-col gap-5"
            >
              {/* Nombre del Proyecto */}
              <Field label="Nombre del Proyecto" error={errors.nombreProyecto}>
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
              </Field>

              {/* Presupuesto */}
              <Field label="Presupuesto">
                <label className="input input-bordered flex items-center gap-2 w-full">
                  <span className="text-primary font-bold">₡</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    name="presupuesto"
                    value={
                      formData.presupuesto
                        ? formatCurrency(formData.presupuesto)
                        : ""
                    }
                    onChange={handlePresupuestoChange}
                    placeholder="₡0"
                    className="grow"
                  />
                </label>
              </Field>

              {/* Mes y Año de Asignación */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <Field label="Mes de Asignación" error={errors.mesAsignacion}>
                  <select
                    name="mesAsignacion"
                    value={formData.mesAsignacion}
                    onChange={handleInputChange}
                    className={`select select-bordered w-full ${
                      errors.mesAsignacion ? "select-error" : ""
                    }`}
                  >
                    <option value="">Seleccionar...</option>
                    {MESES.map((mes, index) => (
                      <option key={index} value={mes}>
                        {mes}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Año de Asignación" error={errors.anioAsignacion}>
                  <select
                    name="anioAsignacion"
                    value={formData.anioAsignacion}
                    onChange={handleInputChange}
                    className={`select select-bordered w-full ${
                      errors.anioAsignacion ? "select-error" : ""
                    }`}
                  >
                    <option value="">Seleccionar...</option>
                    {ANOS.map((ano) => (
                      <option key={ano} value={ano}>
                        {ano}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              {/* Estado */}
              <Field label="Estado">
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleInputChange}
                  className="select select-bordered w-full"
                >
                  <option value="Revisión">Revisión</option>
                  <option value="Finalizado">Finalizado</option>
                </select>
              </Field>

              {/* Bono y Subtipo de Bono */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <Field label="Bono" error={errors.bono}>
                  <select
                    name="bono"
                    value={formData.bono}
                    onChange={handleBonoChange}
                    className={`select select-bordered w-full ${
                      errors.bono ? "select-error" : ""
                    }`}
                  >
                    <option value="">Seleccionar...</option>
                    {bonos.map((b) => (
                      <option key={b.id} value={b.nombre}>
                        {b.nombre}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Subtipo de Bono" error={errors.subtipoBonoI}>
                  <select
                    name="subtipoBonoI"
                    value={formData.subtipoBonoI}
                    onChange={handleInputChange}
                    disabled={subtiposDisponibles.length === 0}
                    className={`select select-bordered w-full ${
                      errors.subtipoBonoI ? "select-error" : ""
                    }`}
                  >
                    <option value="">
                      {subtiposDisponibles.length === 0
                        ? "Sin subtipo"
                        : "Seleccionar..."}
                    </option>
                    {subtiposDisponibles.map((s) => (
                      <option key={s.id} value={s.nombre}>
                        {s.nombre}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-2">
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
      </main>
    </div>
  );
}
