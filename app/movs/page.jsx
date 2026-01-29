"use client";

import { useState } from "react";
import { Pencil, Trash } from "lucide-react";
import Link from "next/link";

const data = [
  {
    id: 1,
    mount: 3500,
    type: "ingreso",
    template: null,
    title: "Pago Mutual",
    description: "Pago mensual recibido por concepto de mutualidad",
    created_at: "09/11/2024",
  },
  {
    id: 2,
    mount: 5000,
    type: "egreso",
    template: "plantilla construccion 1",
    title: "Inicio Construcción 1",
    description:
      "Pago inicial para el arranque de la construcción de la vivienda",
    created_at: "23/08/2024",
  },
  {
    id: 3,
    mount: 125000,
    type: "ingreso",
    template: null,
    title: "Aporte Familiar",
    description: "Aporte económico recibido para gastos de la casa",
    created_at: "01/09/2024",
  },
  {
    id: 4,
    mount: 84250,
    type: "egreso",
    template: "plantilla materiales",
    title: "Compra de Materiales",
    description: "Compra de cemento, arena y varilla para obra gris",
    created_at: "05/09/2024",
  },
  {
    id: 5,
    mount: 250000,
    type: "ingreso",
    template: null,
    title: "Depósito Salarial",
    description: "Depósito correspondiente al salario mensual",
    created_at: "15/09/2024",
  },
  {
    id: 6,
    mount: 67500,
    type: "egreso",
    template: "plantilla servicios",
    title: "Pago Servicios Públicos",
    description: "Pago de agua y electricidad del mes",
    created_at: "18/09/2024",
  },
  {
    id: 7,
    mount: 180000,
    type: "egreso",
    template: "plantilla construccion 2",
    title: "Mano de Obra",
    description: "Pago de mano de obra para avance de construcción",
    created_at: "25/09/2024",
  },
  {
    id: 8,
    mount: 95000,
    type: "ingreso",
    template: null,
    title: "Ingreso Extraordinario",
    description: "Ingreso adicional por trabajo ocasional",
    created_at: "02/10/2024",
  },
  {
    id: 9,
    mount: 42000,
    type: "egreso",
    template: "plantilla mantenimiento",
    title: "Mantenimiento General",
    description: "Compra de herramientas y reparaciones menores",
    created_at: "07/10/2024",
  },
  {
    id: 10,
    mount: 300000,
    type: "ingreso",
    template: null,
    title: "Transferencia Bancaria",
    description: "Transferencia recibida para continuidad del proyecto",
    created_at: "20/10/2024",
  },
  {
    id: 11,
    mount: 220000,
    type: "egreso",
    template: "plantilla construccion 2",
    title: "Avance Obra Gris",
    description: "Pago parcial por avance de obra gris en vivienda",
    created_at: "28/10/2024",
  },
  {
    id: 12,
    mount: 180000,
    type: "ingreso",
    template: null,
    title: "Aporte Institucional",
    description: "Aporte recibido por programa de apoyo habitacional",
    created_at: "02/11/2024",
  },
  {
    id: 13,
    mount: 73500,
    type: "egreso",
    template: "plantilla materiales",
    title: "Material Eléctrico",
    description: "Compra de cableado, breakers y tomacorrientes",
    created_at: "05/11/2024",
  },
  {
    id: 14,
    mount: 95000,
    type: "egreso",
    template: "plantilla servicios",
    title: "Pago Internet y Teléfono",
    description: "Servicios de comunicación del mes",
    created_at: "10/11/2024",
  },
  {
    id: 15,
    mount: 300000,
    type: "ingreso",
    template: null,
    title: "Salario Mensual",
    description: "Depósito salarial correspondiente al mes",
    created_at: "15/11/2024",
  },
  {
    id: 16,
    mount: 125000,
    type: "egreso",
    template: "plantilla mantenimiento",
    title: "Reparaciones Varias",
    description: "Reparaciones menores y ajustes estructurales",
    created_at: "18/11/2024",
  },
  {
    id: 17,
    mount: 52000,
    type: "egreso",
    template: "plantilla transporte",
    title: "Transporte Materiales",
    description: "Flete para traslado de materiales de construcción",
    created_at: "20/11/2024",
  },
  {
    id: 18,
    mount: 100000,
    type: "ingreso",
    template: null,
    title: "Ingreso Extra",
    description: "Ingreso por trabajo independiente",
    created_at: "22/11/2024",
  },
  {
    id: 19,
    mount: 210000,
    type: "egreso",
    template: "plantilla construccion 3",
    title: "Instalación Techo",
    description: "Pago por instalación de estructura de techo",
    created_at: "25/11/2024",
  },
  {
    id: 20,
    mount: 45000,
    type: "egreso",
    template: "plantilla servicios",
    title: "Pago Agua",
    description: "Recibo de agua potable del mes",
    created_at: "28/11/2024",
  },
  {
    id: 21,
    mount: 275000,
    type: "ingreso",
    template: null,
    title: "Transferencia Familiar",
    description: "Apoyo económico familiar para proyecto habitacional",
    created_at: "01/12/2024",
  },
  {
    id: 22,
    mount: 86000,
    type: "egreso",
    template: "plantilla materiales",
    title: "Pintura y Acabados",
    description: "Compra de pintura, brochas y rodillos",
    created_at: "04/12/2024",
  },
  {
    id: 23,
    mount: 65000,
    type: "egreso",
    template: "plantilla mantenimiento",
    title: "Herramientas",
    description: "Compra de herramientas manuales",
    created_at: "06/12/2024",
  },
  {
    id: 24,
    mount: 320000,
    type: "ingreso",
    template: null,
    title: "Pago Bono Vivienda",
    description: "Desembolso parcial del bono de vivienda",
    created_at: "10/12/2024",
  },
  {
    id: 25,
    mount: 150000,
    type: "egreso",
    template: "plantilla construccion 4",
    title: "Instalación Eléctrica",
    description: "Pago por instalación eléctrica interna",
    created_at: "12/12/2024",
  },
  {
    id: 26,
    mount: 92000,
    type: "egreso",
    template: "plantilla servicios",
    title: "Electricidad",
    description: "Recibo de electricidad del mes",
    created_at: "15/12/2024",
  },
  {
    id: 27,
    mount: 50000,
    type: "ingreso",
    template: null,
    title: "Reintegro",
    description: "Reintegro por gastos previamente adelantados",
    created_at: "18/12/2024",
  },
  {
    id: 28,
    mount: 110000,
    type: "egreso",
    template: "plantilla construccion 5",
    title: "Instalación Sanitaria",
    description: "Pago por instalación de tuberías y sanitarios",
    created_at: "20/12/2024",
  },
  {
    id: 29,
    mount: 340000,
    type: "ingreso",
    template: null,
    title: "Salario Diciembre",
    description: "Depósito salarial correspondiente a diciembre",
    created_at: "22/12/2024",
  },
  {
    id: 30,
    mount: 98000,
    type: "egreso",
    template: "plantilla mantenimiento",
    title: "Limpieza Final",
    description: "Limpieza general posterior a trabajos de construcción",
    created_at: "27/12/2024",
  },
];

export default function AddMovement() {
  const [filter, setFilter] = useState(0);

  return (
    <>
      <main className="w-full flex flex-col justify-center items-center p-3 gap-5 lg:px-[25dvw]">
        <div className="flex w-full gap-1">
          <button
            type="button"
            className={`btn flex-1 btn-primary ${filter != 0 && "btn-soft"}`}
            onClick={() => setFilter(0)}
          >
            Egreso
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
          <Link href={"/stats"} type="button" className={`btn btn-primary`}>
            Mostrar Gráficos
          </Link>
          <Link href={"/addMov"} type="button" className={`btn btn-secondary`}>
            Añadir Movimiento
          </Link>
        </div>

        <ul className="list bg-base-100 rounded-box shadow-md max-h-dvh overflow-scroll">
          {data.map((item) =>
            filter == 0 ? (
              item.type == "egreso" && (
                <li className="list-row" key={item.id}>
                  <div>
                    <h1 className="font-bold text-md">{item.title}</h1>
                    <div>₵{item.mount}</div>
                    <div
                      className={`text-xs uppercase font-semibold opacity-60 ${item.type == "ingreso" ? "text-success" : "text-error"} `}
                    >
                      {item.type}
                    </div>
                    <span className="font-bold">
                      Plantilla: {item.template || "Sin plantilla"}
                    </span>
                  </div>
                  <p className="list-col-wrap text-xs">{item.description}</p>
                  <button className="btn btn-square btn-ghost">
                    <Pencil size={16}></Pencil>
                  </button>
                  <button className="btn btn-square btn-ghost text-error">
                    <Trash size={16}></Trash>
                  </button>
                </li>
              )
            ) : filter == 1 ? (
              item.type == "ingreso" && (
                <li className="list-row" key={item.id}>
                  <div>
                    <h1 className="font-bold text-md">{item.title}</h1>
                    <div>₵{item.mount}</div>
                    <div
                      className={`text-xs uppercase font-semibold opacity-60 ${item.type == "ingreso" ? "text-success" : "text-error"} `}
                    >
                      {item.type}
                    </div>
                    <span className="font-bold">
                      Plantilla: {item.template || "Sin plantilla"}
                    </span>
                  </div>
                  <p className="list-col-wrap text-xs">{item.description}</p>
                  <button className="btn btn-square btn-ghost">
                    <Pencil size={16}></Pencil>
                  </button>
                  <button className="btn btn-square btn-ghost text-error">
                    <Trash size={16}></Trash>
                  </button>
                </li>
              )
            ) : (
              <li className="list-row" key={item.id}>
                <div>
                  <h1 className="font-bold text-md">{item.title}</h1>
                  <div>₵{item.mount}</div>
                  <div
                    className={`text-xs uppercase font-semibold opacity-60 ${item.type == "ingreso" ? "text-success" : "text-error"} `}
                  >
                    {item.type}
                  </div>

                  <span className="font-bold">
                    Plantilla: {item.template || "Sin plantilla"}
                  </span>
                </div>
                <p className="list-col-wrap text-xs">{item.description}</p>
                <button className="btn btn-square btn-ghost">
                  <Pencil size={16}></Pencil>
                </button>
                <button className="btn btn-square btn-ghost text-error">
                  <Trash size={16}></Trash>
                </button>
              </li>
            ),
          )}
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
