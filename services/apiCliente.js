const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Función general para comunicarse con el backend.
 *
 * @param {string} endpoint Ruta del endpoint, por ejemplo: "/projects".
 * @param {RequestInit} options Configuración de fetch.
 * @returns {Promise<any>} Datos devueltos por el backend.
 */
export async function apiFetch(endpoint, options = {}) {
  if (!API_URL) {
    throw new Error(
      "La variable NEXT_PUBLIC_API_URL no está configurada."
    );
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      `Error del servidor: ${response.status}`;

    throw new Error(message);
  }

  return data;
}