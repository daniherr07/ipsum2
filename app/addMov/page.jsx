"use client";

import { useState } from "react";
import Link from "next/link";


export default function AddMovement() {
  const [action, setAction] = useState(0);

  return (
    <>
      <nav className="w-full h-12 bg-primary flex justify-center items-center">
        <Link href={"/movs"} className="btn btn-primary btn-soft absolute left-3 top-2 text-primary-content">Atras</Link>
        <p>Ingresar Movimiento:</p>
      </nav>
      <main className="w-full flex flex-col justify-center items-center p-3 lg:px-[25dvw]">
        <div className="flex gap-5 w-full">
          <button
            type="button"
            className={`btn flex-1 btn-primary ${action == 1 && "btn-soft"}`}
            onClick={() => setAction(0)}
          >
            Gasto
          </button>
          <button
            type="button"
            className={`btn flex-1 btn-primary ${action == 0 && "btn-soft"}`}
            onClick={() => setAction(1)}
          >
            Ingreso
          </button>
        </div>

        {action == 0 ? <OutForm></OutForm> : <InForm></InForm>}
      </main>
    </>
  );
}

export function OutForm() {
  return (
    <form
      action=""
      method="get"
      className="w-full flex flex-col gap-3 **:w-full"
    >
      <fieldset className="fieldset">
        <legend className="fieldset-legend">Detalle</legend>
        <input type="text" className="input" placeholder="Pago Mutual" />
      </fieldset>

      <fieldset className="fieldset">
        <legend className="fieldset-legend">Descripción</legend>
        <input
          type="text"
          className="input"
          placeholder="Pago Mutual para el proyecto..."
        />
      </fieldset>

      <fieldset className="fieldset">
        <legend className="fieldset-legend">Proyecto asignado</legend>
        <select defaultValue="Proyecto Maria" className="select">
          <option disabled={true}>Proyecto Maria</option>
          <option>Proyecto Juan</option>
          <option>Proyecto Pablo</option>
          <option>Proyecto Daniel</option>
        </select>
      </fieldset>

      <fieldset className="fieldset">
        <legend className="fieldset-legend">Fecha de Ingreso</legend>
        <input type="date" className="input" />
      </fieldset>

      <fieldset className="fieldset">
        <legend className="fieldset-legend">Plantilla (Opcional)</legend>
        <select defaultValue="Seleccionar Plantilla" className="select">
          <option disabled={true}>Seleccionar Plantilla</option>
          <option>Plantilla 1</option>
          <option>Plantilla 2</option>
          <option>Plantilla 3</option>
        </select>
      </fieldset>

      <fieldset className="fieldset">
        <legend className="fieldset-legend">Monto</legend>
        <input type="text" className="input" placeholder="$1.200" />
      </fieldset>

      <button type="button" className="btn btn-primary w-full">
        Guardar
      </button>
    </form>
  );
}

export function InForm() {
  return (
    <form
      action=""
      method="get"
      className="w-full flex flex-col gap-3 **:w-full"
    >
      <fieldset className="fieldset">
        <legend className="fieldset-legend">Detalle</legend>
        <input type="text" className="input" placeholder="Pago Mutual" />
      </fieldset>

      <fieldset className="fieldset">
        <legend className="fieldset-legend">Descripción</legend>
        <input
          type="text"
          className="input"
          placeholder="Pago Mutual para el proyecto..."
        />
      </fieldset>

      <fieldset className="fieldset">
        <legend className="fieldset-legend">Proyecto asignado</legend>
        <select defaultValue="Proyecto Maria" className="select">
          <option disabled={true}>Proyecto Maria</option>
          <option>Proyecto Juan</option>
          <option>Proyecto Pablo</option>
          <option>Proyecto Daniel</option>
        </select>
      </fieldset>

      <fieldset className="fieldset">
        <legend className="fieldset-legend">Fecha de Ingreso</legend>
        <input type="date" className="input" />
      </fieldset>

      <fieldset className="fieldset">
        <legend className="fieldset-legend">Monto</legend>
        <input type="text" className="input" placeholder="$1.200" />
      </fieldset>

      <button type="button" className="btn btn-primary w-full">
        Guardar
      </button>
    </form>
  );
}
