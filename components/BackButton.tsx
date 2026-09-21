"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

/* Botón "regresar": vuelve a la última pestaña visitada dentro de la app
   (historial del navegador). Si la página se abrió directo (sin historial
   interno), navega al fallback. */
export default function BackButton({
  fallback = "/",
  label = "Volver",
  className = "btn btn-ghost btn-circle btn-sm sm:btn-md shrink-0",
  iconSize = 22,
}: {
  fallback?: string;
  label?: string;
  className?: string;
  iconSize?: number;
}) {
  const router = useRouter();

  const handleClick = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallback);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
      aria-label={label}
    >
      <ChevronLeft size={iconSize} />
    </button>
  );
}
