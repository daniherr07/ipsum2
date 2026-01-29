import Link from "next/link";
import {
  Search,
  Pencil,
  Plus,
  CircleUserRound,
  Bell,
  ChartColumn,
  LayoutDashboard,
  NotebookText,
  ChartPie
} from "lucide-react";
import { modifyData } from "./const";
import Form from "next/form";
import { newProjectAction } from "./newProjectAction";
import CreateProjectButton from "./CreateProjectButton";

export default function NavBar() {
  return (
    <div className="navbar bg-base-300 shadow-sm">
      {/** Menu Dropdown Mobiles */}
      <div className="navbar-start z-100">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {" "}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />{" "}
            </svg>
          </div>
          <ul
            tabIndex="-1"
            className="
            menu menu-sm dropdown-content bg-base-300 rounded-box z-1 mt-3 w-60 p-2 gap-2 shadow 
            **:text-[16px]
            "
          >
            <li className="bg-base-100 flex flex-row items-center justify-start">
              <CircleUserRound size={40} />
              <p>Steven</p>
            </li>
            <li>
              <Link
                href="/search"
                className="flex flex-row items-center justify-start"
              >
                <Search size={20} />
                <p>Buscar</p>
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="flex flex-row items-center justify-start"
              >
                <Pencil size={20} />
                <p>Modificar</p>
              </Link>
            </li>

            <div className="divider m-0!"></div>

            <li>
              <Link
                href="/dashboard"
                className="flex flex-row items-center justify-start"
              >
                <LayoutDashboard size={20} />
                <p>Dashboard</p>
              </Link>
            </li>

            <li>
              <Link
                href="/movs"
                className="flex flex-row items-center justify-start"
              >
                <ChartColumn size={20} />
                <p>Movimientos</p>
              </Link>
            </li>
            <li>
              <Link
                href="/plantillas"
                className="flex flex-row items-center justify-start"
              >
                <NotebookText size={20} />
                <p>Plantillas</p>
              </Link>
            </li>
            <li>
              <Link
                href="/stats"
                className="flex flex-row items-center justify-start"
              >
                <ChartPie size={20} />
                <p>Estadísticas</p>
              </Link>
            </li>
            <li>
              <Link href={"#"} className="text-error">
                Cerrar Sesión
              </Link>
            </li>
          </ul>
        </div>

        <div className="gap-2 items-center justify-center bg-base-100 p-2 rounded shadow-sm hidden lg:flex">
          <CircleUserRound size={30} />
          <p>Steven</p>
        </div>
      </div>

      {/** Menu Centro Escritorio */}
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li>
            <Link href="#">Buscar</Link>
          </li>
          <li>
            <details>
              <summary>Modificar</summary>
              <ul className="p-2 bg-base-300 w-40 z-1">
                {modifyData.map((item, index) => (
                  <li key={index}>
                    <Link prefetch={false} href="#">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          </li>
          <li>
            <Link href={"#"} className="text-error">
              Cerrar Sesión
            </Link>
          </li>
        </ul>
      </div>

      {/** Botón a la derecha */}
      <div className="navbar-end flex gap-5 w-full">
        <Bell size={30} className="text-primary" />

        <label htmlFor="newProjectModal" className="btn btn-primary">
          <Plus size={20} />
          <p>Nuevo Proyecto</p>
        </label>

        {/* Put this part before </body> tag */}
        <input type="checkbox" id="newProjectModal" className="modal-toggle" />
        <div className="modal" role="dialog">
          <div className="modal-box">
            <h3 className="text-lg font-bold">Nuevo Proyecto</h3>

            <Form
              className="flex flex-col gap-5 w-full"
              action={newProjectAction}
            >
              <fieldset className="fieldset mt-3">
                <label className="label">Nombre del Proyecto</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Proyecto Max Peralta"
                  name="projectName"
                />
              </fieldset>

              <div className="modal-action">
                <label htmlFor="newProjectModal">
                  <CreateProjectButton></CreateProjectButton>
                </label>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
