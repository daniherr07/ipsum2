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
  ChartPie,
  Home,
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
              <p>Felipe</p>
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
                href="/settings"
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
                href="/stats"
                className="flex flex-row items-center justify-start"
              >
                <ChartPie size={20} />
                <p>Estadísticas</p>
              </Link>
            </li>

            <div className="divider m-0!"></div>

            <li>
              <Link
                href="/newproject"
                className="flex flex-row items-center justify-start"
              >
                <Plus size={20} />
                <p>Agregar Proyecto</p>
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
          <p>Felipe</p>
        </div>

        <Link href="/" className="btn btn-ghost btn-circle">
          <Home size={20} />
        </Link>
      </div>

      {/** Menu Centro Escritorio */}
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 gap-2">
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
              href="/settings"
              className="flex flex-row items-center justify-start"
            >
              <Pencil size={20} />
              <p>Modificar</p>
            </Link>
          </li>

          <div className="divider divider-horizontal m-0!"></div>

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
              href="/stats"
              className="flex flex-row items-center justify-start"
            >
              <ChartPie size={20} />
              <p>Estadísticas</p>
            </Link>
          </li>

          <div className="divider divider-horizontal m-0!"></div>

          <li>
            <Link href={"#"} className="text-error">
              Cerrar Sesión
            </Link>
          </li>
        </ul>
      </div>

      {/** Botón a la derecha */}
      <div className="navbar-end flex gap-3 w-full">
        <Bell size={30} className="text-primary" />

        {/* Dropdown con opciones de agregar */}
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-primary">
            <Plus size={20} />
            <span className="hidden sm:inline">Agregar</span>
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content menu bg-base-300 rounded-box z-10 w-52 p-2 shadow-lg mt-2"
          >
            <li>
              <Link
                href="/movimientosIdeaFelipe"
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                Agregar Movimiento
              </Link>
            </li>
            <li>
              <Link href="/newproject" className="flex items-center gap-2">
                <Plus size={16} />
                Agregar Proyecto
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
