"use client";

import { useState } from "react";
import { Pencil, Trash } from "lucide-react";

export default function AddMovement() {
  const [filter, setFilter] = useState(0);

  return (
    <>
      <nav className="w-full h-12 bg-primary flex justify-center items-center">
        <p>Movimientos</p>
      </nav>
      <main className="w-full flex flex-col justify-center items-center p-3 gap-5">
        <div className="flex w-full gap-1">
          <button
            type="button"
            className={`btn flex-1 btn-primary ${filter != 0 && "btn-soft"}`}
            onClick={() => setFilter(0)}
          >
            Gasto
          </button>
          <button
            type="button"
            className={`btn flex-1 btn-primary ${filter != 1 && "btn-soft"}`}
            onClick={() => setFilter(1)}
          >
            Ingreso
          </button>
          <button
            type="button"
            className={`btn flex-1 btn-primary ${filter != 2 && "btn-soft"}`}
            onClick={() => setFilter(2)}
          >
            Todos
          </button>
        </div>

        <fieldset className="fieldset w-full">
          <legend className="fieldset-legend">Ordenar por:</legend>
          <select defaultValue="Monto" className="select w-full">
            <option disabled={true}>Monto</option>
            <option>Fecha</option>
          </select>
        </fieldset>

        <div className="flex flex-col w-full gap-3">
          <button type="button" className={`btn btn-primary`}>
            Mostrar Gráficos
          </button>
          <button type="button" className={`btn btn-primary btn-soft`}>
            Añadir Movimiento
          </button>
        </div>

        <ul className="list bg-base-100 rounded-box shadow-md max-h-dvh overflow-scroll">
          <li className="list-row">
            <div>
              <div>$3,500</div>
              <div className="text-xs uppercase font-semibold opacity-60 text-success">
                Ingreso
              </div>
            </div>
            <p className="list-col-wrap text-xs">
              "Movimiento del proyecto x del inicio de la producción de la casa,
              agregado con unos montos de y"
            </p>
            <button className="btn btn-square btn-ghost">
              <Pencil size={16}></Pencil>
            </button>
            <button className="btn btn-square btn-ghost">
              <Trash size={16}></Trash>
            </button>
          </li>

          <li className="list-row">
            <div>
              <div>$1,500</div>
              <div className="text-xs uppercase font-semibold opacity-60 text-error">
                Egreso
              </div>
            </div>
            <p className="list-col-wrap text-xs">
              "Movimiento del proyecto x del inicio de la producción de la casa,
              agregado con unos montos de y"
            </p>
            <button className="btn btn-square btn-ghost">
              <Pencil size={16}></Pencil>
            </button>
            <button className="btn btn-square btn-ghost">
              <Trash size={16}></Trash>
            </button>
          </li>

          <li className="list-row">
            <div>
              <div>$3,500</div>
              <div className="text-xs uppercase font-semibold opacity-60 text-success">
                Ingreso
              </div>
            </div>
            <p className="list-col-wrap text-xs">
              "Movimiento del proyecto x del inicio de la producción de la casa,
              agregado con unos montos de y"
            </p>
            <button className="btn btn-square btn-ghost">
              <Pencil size={16}></Pencil>
            </button>
            <button className="btn btn-square btn-ghost">
              <Trash size={16}></Trash>
            </button>
          </li>

          <li className="list-row">
            <div>
              <div>$1,500</div>
              <div className="text-xs uppercase font-semibold opacity-60 text-error">
                Egreso
              </div>
            </div>
            <p className="list-col-wrap text-xs">
              "Movimiento del proyecto x del inicio de la producción de la casa,
              agregado con unos montos de y"
            </p>
            <button className="btn btn-square btn-ghost">
              <Pencil size={16}></Pencil>
            </button>
            <button className="btn btn-square btn-ghost">
              <Trash size={16}></Trash>
            </button>
          </li>

          <li className="list-row">
            <div>
              <div>$3,500</div>
              <div className="text-xs uppercase font-semibold opacity-60 text-success">
                Ingreso
              </div>
            </div>
            <p className="list-col-wrap text-xs">
              "Movimiento del proyecto x del inicio de la producción de la casa,
              agregado con unos montos de y"
            </p>
            <button className="btn btn-square btn-ghost">
              <Pencil size={16}></Pencil>
            </button>
            <button className="btn btn-square btn-ghost">
              <Trash size={16}></Trash>
            </button>
          </li>

          <li className="list-row">
            <div>
              <div>$1,500</div>
              <div className="text-xs uppercase font-semibold opacity-60 text-error">
                Egreso
              </div>
            </div>
            <p className="list-col-wrap text-xs">
              "Movimiento del proyecto x del inicio de la producción de la casa,
              agregado con unos montos de y"
            </p>
            <button className="btn btn-square btn-ghost">
              <Pencil size={16}></Pencil>
            </button>
            <button className="btn btn-square btn-ghost">
              <Trash size={16}></Trash>
            </button>
          </li>

          <li className="list-row">
            <div>
              <div>$3,500</div>
              <div className="text-xs uppercase font-semibold opacity-60 text-success">
                Ingreso
              </div>
            </div>
            <p className="list-col-wrap text-xs">
              "Movimiento del proyecto x del inicio de la producción de la casa,
              agregado con unos montos de y"
            </p>
            <button className="btn btn-square btn-ghost">
              <Pencil size={16}></Pencil>
            </button>
            <button className="btn btn-square btn-ghost">
              <Trash size={16}></Trash>
            </button>
          </li>

          <li className="list-row">
            <div>
              <div>$1,500</div>
              <div className="text-xs uppercase font-semibold opacity-60 text-error">
                Egreso
              </div>
            </div>
            <p className="list-col-wrap text-xs">
              "Movimiento del proyecto x del inicio de la producción de la casa,
              agregado con unos montos de y"
            </p>
            <button className="btn btn-square btn-ghost">
              <Pencil size={16}></Pencil>
            </button>
            <button className="btn btn-square btn-ghost">
              <Trash size={16}></Trash>
            </button>
          </li>
        </ul>
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
