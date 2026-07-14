import { ERROR_CODES } from "./errorCodes";
import { getErrorMessage } from "./errorMessages";

export class AppError extends Error {
  /**
   * Error controlado de la aplicación.
   *
   * @param {string} code Código definido en ERROR_CODES.
   * @param {object} options Información adicional del error.
   * @param {string|null} options.field Campo relacionado con el error.
   * @param {string|null} options.message Mensaje personalizado.
   * @param {object|null} options.details Detalles técnicos adicionales.
   */
  constructor(
    code = ERROR_CODES.UNKNOWN_ERROR,
    {
      field = null,
      message = null,
      details = null,
    } = {}
  ) {
    super(message || getErrorMessage(code));

    this.name = "AppError";
    this.code = code;
    this.field = field;
    this.details = details;
    this.isOperational = true;
  }
}