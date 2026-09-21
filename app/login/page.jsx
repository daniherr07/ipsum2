"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ExternalLink,
  LayoutDashboard,
  CircleCheck,
  LoaderCircle,
} from "lucide-react";

function FadeIn({ children, delay = 0, className = "" }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShow(true);
      return;
    }
    const id = requestAnimationFrame(() => setShow(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      className={className}
      style={{
        opacity: show ? 1 : 0,
        transform: show
          ? "translateY(0) scale(1)"
          : "translateY(14px) scale(0.98)",
        filter: show ? "blur(0px)" : "blur(3px)",
        willChange: show ? "auto" : "opacity, transform, filter",
        transition: `opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, filter 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

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

export default function LoginPage() {
  const [step, setStep] = useState("login"); // "login" | "destinos"
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = "El correo es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Ingresa un correo válido";
    }
    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (formData.password.length < 4) {
      newErrors.password = "Mínimo 4 caracteres";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("destinos");
    }, 900);
  };

  return (
    <div className="min-h-[calc(100svh-64px)] bg-base-200 flex items-center justify-center p-3 sm:p-4 lg:p-6">
      <div className="w-full max-w-md flex flex-col gap-4 sm:gap-5">
        {step === "login" ? (
          <>
            {/* Header / Marca */}
            <FadeIn delay={0} className="text-center">
              <h1 className="text-2xl sm:text-3xl font-black">Bienvenido</h1>
              <p className="text-sm text-base-content/60 mt-1">
                Inicia sesión para continuar al sistema
              </p>
            </FadeIn>

            {/* Card del formulario */}
            <FadeIn
              delay={100}
              className="bg-base-100 rounded-lg shadow-md"
            >
              <form
                onSubmit={handleSubmit}
                className="p-5 sm:p-7 flex flex-col gap-5"
                noValidate
              >
                {/* Correo */}
                <Field label="Correo electrónico" error={errors.email}>
                  <label
                    className={`input input-bordered flex items-center gap-2 w-full ${
                      errors.email ? "input-error" : ""
                    }`}
                  >
                    <Mail className="w-4 h-4 text-base-content/40 shrink-0" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="correo@ipsum.cr"
                      className="grow"
                      autoComplete="email"
                    />
                  </label>
                </Field>

                {/* Contraseña */}
                <Field label="Contraseña" error={errors.password}>
                  <label
                    className={`input input-bordered flex items-center gap-2 w-full ${
                      errors.password ? "input-error" : ""
                    }`}
                  >
                    <Lock className="w-4 h-4 text-base-content/40 shrink-0" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="grow"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="text-base-content/40 hover:text-base-content transition-colors shrink-0"
                      aria-label={
                        showPassword
                          ? "Ocultar contraseña"
                          : "Mostrar contraseña"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </label>
                </Field>

                {/* Submit */}
                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <LoaderCircle className="w-5 h-5 animate-spin" />
                      Iniciando sesión...
                    </>
                  ) : (
                    <>
                      Iniciar Sesión
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </FadeIn>
          </>
        ) : (
          <>
            {/* Confirmación */}
            <FadeIn delay={0} className="text-center">
              <div className="inline-flex bg-success/10 text-success p-4 rounded-full mb-3">
                <CircleCheck className="w-10 h-10" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black">
                Sesión iniciada
              </h1>
              <p className="text-sm text-base-content/60 mt-1">
                Elige a dónde quieres continuar
              </p>
            </FadeIn>

            {/* Destinos */}
            <FadeIn
              delay={100}
              className="bg-base-100 rounded-lg shadow-md p-5 sm:p-7 flex flex-col gap-3"
            >
              <a
                href="https://ipsumcr.com/login"
                className="btn btn-primary w-full"
              >
                <ExternalLink className="w-4 h-4" />
                Ir a Ipsum CR
              </a>
              <Link href="/" className="btn btn-outline btn-primary w-full">
                <LayoutDashboard className="w-4 h-4" />
                Ir al Panel del Sistema
              </Link>
            </FadeIn>

            {/* Volver */}
            <FadeIn delay={200} className="text-center">
              <button
                onClick={() => {
                  setStep("login");
                  setFormData({ email: "", password: "" });
                  setErrors({});
                }}
                className="btn btn-ghost btn-sm"
              >
                Volver al inicio de sesión
              </button>
            </FadeIn>
          </>
        )}
      </div>
    </div>
  );
}
