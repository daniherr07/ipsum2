"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ChartColumn,
  ChartPie,
  Plus,
  ChevronDown,
  Settings,
  LogOut,
  Menu,
  ArrowRightLeft,
  FolderPlus,
  Sun,
  Moon,
} from "lucide-react";

/* =========================
   Enlaces de navegación
========================= */
const NAV_LINKS = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/movs", label: "Movimientos", icon: ChartColumn },
  { href: "/stats", label: "Estadísticas", icon: ChartPie },
];

export default function NavBar() {
  const pathname = usePathname();

  /* =========================
     Tema: por defecto sigue al sistema,
     el usuario puede forzarlo con el toggle
  ========================= */
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const t = localStorage.getItem("theme") || (mq.matches ? "dark" : "light");
      document.documentElement.setAttribute("data-theme", t);
      setTheme(t);
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    localStorage.setItem("theme", next);
    document.documentElement.setAttribute("data-theme", next);
    setTheme(next);
  };

  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="navbar sticky top-0 z-50 bg-base-100/80 backdrop-blur-md border-b border-base-200 shadow-sm px-2 sm:px-4">
      {/** Izquierda: menú móvil + home */}
      <div className="navbar-start gap-1">
        {/* Menú hamburguesa (móvil) */}
        <div className="dropdown lg:hidden">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost btn-circle btn-sm"
            aria-label="Abrir menú"
          >
            <Menu size={20} />
          </div>
          <ul
            tabIndex={-1}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-50 mt-3 w-64 p-2 gap-1 shadow-lg border border-base-200"
          >
            <li className="menu-title text-xs uppercase tracking-wide">
              Navegación
            </li>
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`flex items-center gap-3 rounded-lg ${
                      active
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-base-content/70"
                    }`}
                  >
                    <Icon size={18} />
                    {link.label}
                  </Link>
                </li>
              );
            })}

            <div className="divider my-1"></div>

            <li className="menu-title text-xs uppercase tracking-wide">
              Cuenta
            </li>
            <li>
              <Link
                href="/settings"
                className="flex items-center gap-3 rounded-lg text-base-content/70"
              >
                <Settings size={18} />
                Configuración
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="flex items-center gap-3 rounded-lg text-error"
              >
                <LogOut size={18} />
                Cerrar Sesión
              </Link>
            </li>
          </ul>
        </div>

        {/* Botón Home */}
        <Link
          href="/"
          className="btn btn-ghost btn-circle btn-sm sm:btn-md"
          aria-label="Ir al inicio"
        >
          <Home size={20} />
        </Link>
      </div>

      {/** Centro: navegación tipo pill (escritorio) */}
      <nav className="navbar-center hidden lg:flex">
        <ul className="flex items-center gap-1 bg-base-200/60 rounded-full p-1">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors ${
                    active
                      ? "bg-primary/10 text-primary font-semibold shadow-sm dark:bg-primary dark:text-white"
                      : "text-base-content/70 hover:text-base-content hover:bg-base-100"
                  }`}
                >
                  <Icon size={16} />
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/** Derecha: acciones */}
      <div className="navbar-end gap-2">
        {/* Toggle de tema (por defecto: sistema) */}
        <button
          onClick={toggleTheme}
          className="btn btn-ghost btn-circle btn-sm sm:btn-md"
          aria-label={
            theme === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"
          }
          title={theme === "dark" ? "Tema claro" : "Tema oscuro"}
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* CTA Agregar */}
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-primary btn-circle btn-sm sm:btn-md sm:rounded-full sm:w-auto gap-1 sm:px-4"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Agregar</span>
            <ChevronDown size={14} className="hidden sm:inline opacity-70" />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content menu bg-base-100 rounded-box z-50 w-56 p-2 shadow-lg border border-base-200 mt-2"
          >
            <li className="menu-title text-xs uppercase tracking-wide">
              Crear nuevo
            </li>
            <li>
              <Link
                href="/agregarMovimento"
                className="flex items-center gap-3 rounded-lg"
              >
                <div className="bg-primary/10 p-1.5 rounded-md">
                  <ArrowRightLeft size={16} className="text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Movimiento</p>
                  <p className="text-xs text-base-content/50">
                    Ingreso o egreso
                  </p>
                </div>
              </Link>
            </li>
            <li>
              <Link
                href="/agregarProyecto"
                className="flex items-center gap-3 rounded-lg"
              >
                <div className="bg-info/10 p-1.5 rounded-md">
                  <FolderPlus size={16} className="text-info" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Proyecto</p>
                  <p className="text-xs text-base-content/50">
                    Nuevo proyecto
                  </p>
                </div>
              </Link>
            </li>
          </ul>
        </div>

        {/* Menú de usuario */}
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            aria-label="Menú de usuario"
            className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center cursor-pointer select-none hover:bg-primary/20 transition-colors"
          >
            <span className="text-sm font-bold leading-none">F</span>
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content menu bg-base-100 rounded-box z-50 w-64 p-2 shadow-lg border border-base-200 mt-2"
          >
            <li className="pointer-events-none mb-1">
              <div className="flex items-center gap-3 px-2 py-2">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                  <span className="text-base font-bold leading-none">F</span>
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm truncate">Felipe</p>
                  <p className="text-xs text-base-content/50 truncate">
                    Administrador
                  </p>
                </div>
              </div>
            </li>
            <div className="divider my-1"></div>
            <li>
              <Link
                href="/settings"
                className="flex items-center gap-3 rounded-lg"
              >
                <Settings size={16} />
                Configuración
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="flex items-center gap-3 rounded-lg text-error"
              >
                <LogOut size={16} />
                Cerrar Sesión
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
