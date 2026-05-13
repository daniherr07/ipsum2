import { ArrowRightLeft, Folder } from "lucide-react";

export default function Menu() {
  return (
    <div className="p-3 flex flex-col gap-3 items-center">
      <h1 className="text-2xl font-bold">Menú Principal</h1>
      <p className="text-sm -mt-1">Seleccione una opción para continuar</p>

      <div className="flex flex-col w-full gap-3 items-center lg:flex-row lg:justify-center *:lg:w-70 *:hover:cursor-pointer">
        <div className="card bg-primary w-full shadow-lg">
          <div className="card-body flex flex-row items-center">
            <ArrowRightLeft className="w-10 h-10 flex-1"></ArrowRightLeft>

            <div className="flex-4">
              <h2 className="card-title">Movimientos</h2>
              <p>
                Registrar y consultar ingresos y egresos por proyecto y fecha
              </p>
            </div>
          </div>
        </div>

        <div className="card bg-primary w-full shadow-lg">
          <div className="card-body flex flex-row items-center">
            <Folder className="w-10 h-10 flex-1"></Folder>

            <div className="flex-4">
              <h2 className="card-title">Proyectos</h2>
              <p>Buscar, filtrar y consultar expedientes de los proyectos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
