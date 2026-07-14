export function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
// ejemplo 39db43ac-8438-4395-a774-b047010c7299. No dependeremos de números consecutivos porque, cuando exista la base de datos, será ella quien genere los IDs.