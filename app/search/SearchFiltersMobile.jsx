"use client";

import {
  SlidersHorizontal,
  Search,
  X,
  Trash,
  Calendar,
  Landmark,
  MapPin,
  Boxes,
  User
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import Form from "next/form";

export default function SearchFiltersMobile({ projects }) {
  const [search, setSearch] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const value = formData.get("search");

    setSearch(value);
  };

  return (
    <div className="w-full h-fit flex flex-col items-center justify-between gap-1 p-4">
      <div className="w-full flex">
        <label htmlFor="filtersModal">
          <SlidersHorizontal
            size={40}
            className="bg-primary rounded p-2 h-full aspect-square text-primary-content"
          />
        </label>

        <input type="checkbox" id="filtersModal" className="modal-toggle" />

        <div className="modal modal-bottom" role="dialog">
          <div className="modal-box h-[70dvh] relative px-0 pt-13">
            {/** TODO: Conseguir los filtros usando la api para ponerlos aquí
             * Actualmente usando placeholders
             */}
            <div className="flex flex-col ">
              <details
                className="collapse collapse-arrow"
                name="filters-1"
                open
              >
                <summary className="collapse-title font-semibold">
                  Tipo de Bono
                </summary>
                <div className="collapse-content text-sm">
                  <fieldset className="fieldset ">
                    <label className="label">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="checkbox"
                      />
                      Art.59
                    </label>
                  </fieldset>
                </div>
              </details>

              <div className="divider"></div>

              <details className="collapse collapse-arrow" name="filters-2">
                <summary className="collapse-title font-semibold">
                  Etapa
                </summary>
                <div className="collapse-content text-sm">
                  <fieldset className="fieldset ">
                    <label className="label">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="checkbox"
                      />
                      En Construcción
                    </label>
                  </fieldset>
                </div>
              </details>
            </div>

            <div className="modal-action absolute top-3 right-3 m-0">
              <label htmlFor="filtersModal">
                <X size={30}></X>
              </label>
            </div>
          </div>
        </div>

        <div className="divider divider-horizontal"></div>

        <Form onSubmit={handleSubmit} className="join">
          <label className="input join-item">
            <input type="text" name="search" placeholder="Buscar por nombre" />
          </label>

          <button type="submit" className="btn btn-primary join-item">
            <Search size={20} />
          </button>
        </Form>
      </div>

      <div className="w-full h-auto flex flex-col mt-3 gap-3">
        {projects &&
          projects.map((project) =>
            search != "" ? (
              project.nombre.toLowerCase().includes(search.toLowerCase()) && (
                <ProjectItem
                  key={project.id}
                  project={project}
                ></ProjectItem>
              )
            ) : (
              <ProjectItem key={project.id} project={project}></ProjectItem>
            ),
          )}
      </div>
    </div>
  );
}

function ProjectItem({ project }) {
  const [tab, setTab] = useState(0);
  return (
    <>
      <details
        className="collapse collapse-arrow bg-base-200 border border-base-300 shadow-lg relative z-1"
        name="my-accordion-det-1"
      >
        <summary className="collapse-title font-semibold">
          {project.nombre + " "}
          <span className="text-primary-content/70">
            - {project.bono || "Bono sin definir"}
          </span>
        </summary>
        <div className="collapse-content text-sm flex flex-col gap-3">
          <div role="tablist" className="tabs tabs-border w-full flex">
            <a
              role="tab"
              className={`tab flex-1 ${tab == 0 && "tab-active"}`}
              onClick={() => setTab(0)}
            >
              Info.
            </a>
            <a
              role="tab"
              className={`tab flex-1 ${tab == 1 && "tab-active"}`}
              onClick={() => setTab(1)}
            >
              Img.
            </a>
            <a
              role="tab"
              className={`tab flex-1 ${tab == 2 && "tab-active"}`}
              onClick={() => setTab(2)}
            >
              Notas
            </a>
          </div>

          {tab == 0 && (
            <ul className="list rounded-box">
              <li className="list-row">
                <div className="text-4xl font-thin opacity-30 tabular-nums">
                  <Calendar size={35}></Calendar>
                </div>
                <div className="list-col-grow">
                  <div>
                    {new Date(project.created_at).toLocaleDateString("es-CR")}
                  </div>
                  <div className="text-xs uppercase font-semibold opacity-60">
                    Fecha de creación
                  </div>
                </div>
              </li>

              <li className="list-row">
                <div className="text-4xl font-thin opacity-30 tabular-nums">
                  <Landmark size={35}></Landmark>
                </div>
                <div className="list-col-grow">
                  <div>{project.bono || "Bono sin definir"}</div>
                  <div className="text-xs uppercase font-semibold opacity-60">
                    {project.variante_bono || "Variante sin definir"}
                  </div>
                </div>
              </li>

              <li className="list-row">
                <div className="text-4xl font-thin opacity-30 tabular-nums">
                  <MapPin size={35}></MapPin>
                </div>
                <div className="list-col-grow">
                  <div>
                    {project.provincia || "Sin provincia"},{" "}
                    {project.canton || "Sin cantón"},{" "}
                    {project.distrito || "Sin distrito"}
                  </div>
                </div>
              </li>

              <li className="list-row">
                <div className="text-4xl font-thin opacity-30 tabular-nums">
                  <Boxes size={35}></Boxes>
                </div>
                <div className="list-col-grow">
                  <div>{project.grupo || "Grupo sin definir"}</div>
                  <div className="text-xs uppercase font-semibold opacity-60">
                    Grupo del proyecto
                  </div>
                </div>
              </li>

              <li className="list-row">
                <div className="text-4xl font-thin opacity-30 tabular-nums">
                  <User size={35}></User>
                </div>
                <div className="list-col-grow">
                  <div>Encargados</div>
                  <div className="text-xs uppercase font-semibold opacity-60">
                    Del proyecto
                  </div>
                </div>
              </li>

              <li className="list-row">
                <div className="overflow-x-auto">
                  <table className="table">
                    {/* head */}
                    <thead>
                      <tr>
                        <th>Respons.</th>
                        <th>Nombre</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th>Constructor</th>
                        <td>{project.p_constructor || "Sin definir"}</td>
                      </tr>
                      <tr>
                        <th>Arquitecto</th>
                        <td>{project.arquitecto || "Sin definir"}</td>
                      </tr>
                      <tr>
                        <th>Promotor</th>
                        <td>{project.promotor || "Sin definir"}</td>
                      </tr>
                      <tr>
                        <th>Analista</th>
                        <td>{project.analista || "Sin definir"}</td>
                      </tr>
                      <tr>
                        <th>Ingeniero</th>
                        <td>{project.ingeniero || "Sin definir"}</td>
                      </tr>
                      <tr>
                        <th>Fiscal</th>
                        <td>{project.fiscal || "Sin definir"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </li>
            </ul>
          )}

          <div className="w-full flex gap-1">
            <Link
              href={`/protected/edit/${project.id}`}
              className="btn btn-primary flex-1"
            >
              Editar Proyecto
            </Link>

            <label htmlFor={`discard_${project.id}`} className="btn btn-error">
              <Trash size={25} className="text-white/50" />
            </label>
          </div>
        </div>
      </details>

      <input
        type="checkbox"
        id={`discard_${project.id}`}
        className="modal-toggle"
      />

      <div className="modal" role="dialog">
        <div className="modal-box">
          <h3 className="text-lg font-bold">¿Descartar {project.nombre}?</h3>
          <p className="py-4">
            Puede reactivar el proyecto después activando
            &quot;Descartados&quot; en filtros
          </p>
          <div className="modal-action flex *:flex-1">
            <label
              htmlFor={`discard_${project.id}`}
              className="btn btn-primary btn-primary"
            >
              Cancelar
            </label>
            <label htmlFor={`discard_${project.id}`} className="btn btn-error">
              Descartar
            </label>
          </div>
        </div>
      </div>
    </>
  );
}
