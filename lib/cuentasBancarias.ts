/* Catálogo de cuentas bancarias — TEMPORAL en localStorage.
   Cuando se implemente el backend (ver PLAN CONTROL DE CUENTAS.md), este
   módulo se reemplaza por llamadas a los endpoints /cuentas-bancarias y
   las cuentas por defecto (Banco Nacional, BAC, Mutual) pasan a vivir
   en seed-data.json. */

export type CuentaBancaria = {
  id: string
  nombre: string
}

const STORAGE_KEY = "cuentasBancarias"

const CUENTAS_POR_DEFECTO = ["Banco Nacional", "BAC", "Mutual"]

function leer(): CuentaBancaria[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as CuentaBancaria[]) : null
  } catch {
    return null
  }
}

function escribir(cuentas: CuentaBancaria[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cuentas))
}

/* Primera ejecución: siembra las cuentas por defecto. */
export function listarCuentas(): CuentaBancaria[] {
  const guardadas = leer()
  if (guardadas) return guardadas
  const iniciales = CUENTAS_POR_DEFECTO.map((nombre) => ({
    id: crypto.randomUUID(),
    nombre,
  }))
  escribir(iniciales)
  return iniciales
}

export function crearCuenta(nombre: string): CuentaBancaria {
  const cuenta: CuentaBancaria = { id: crypto.randomUUID(), nombre }
  escribir([...listarCuentas(), cuenta])
  return cuenta
}

export function eliminarCuenta(id: string): void {
  escribir(listarCuentas().filter((c) => c.id !== id))
}
