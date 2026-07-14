import { AppError } from "./AppError";
import { ERROR_CODES } from "./errorCodes";
import { getErrorMessage } from "./errorMessages";

/**
 * Crea una respuesta exitosa uniforme.
 *
 * @param {any} data Datos de la operación.
 * @param {string} message Mensaje de éxito.
 * @returns {object}
 */
export function createSuccessResponse(
  data = null,
  message = "Operación realizada correctamente."
) {
  return {
    success: true,
    message,
    data,
  };
}

/**
 * Crea una respuesta de error uniforme.
 *
 * @param {Error} error Error recibido.
 * @returns {object}
 */
export function createErrorResponse(error) {
  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        field: error.field,
        details: error.details,
      },
    };
  }

  console.error("Error inesperado:", error);

  return {
    success: false,
    error: {
      code: ERROR_CODES.UNKNOWN_ERROR,
      message: getErrorMessage(ERROR_CODES.UNKNOWN_ERROR),
      field: null,
      details: null,
    },
  };
}