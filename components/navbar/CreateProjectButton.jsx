'use client'

import { useFormStatus } from "react-dom";

export default function CreateProjectButton() {
  const status = useFormStatus();

  return (
    <button type="submit" className="btn btn-primary" disabled={status.pending}>
      {status.pending ? "Añadiendo..." : "Añadir"}
    </button>
  );
}
