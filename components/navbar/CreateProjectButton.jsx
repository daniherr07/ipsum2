'use client'

import { useFormStatus } from "react-dom";

// CreateProjectButton renderiza un botón de envío con estado deshabilitado mientras la acción se procesa.
export default function CreateProjectButton() {
  // useFormStatus expone si el submit del formulario asociado sigue en curso.
  const status = useFormStatus();

  return (
    <button type="submit" className="btn btn-primary" disabled={status.pending}>
      {status.pending ? "Añadiendo..." : "Añadir"}
    </button>
  );
}
