import { ERROR_CODES } from "./errorCodes";

export const ERROR_MESSAGES = {
  [ERROR_CODES.REQUIRED_FIELD]: "Este campo es obligatorio.",
  [ERROR_CODES.INVALID_NUMBER]: "Debe ingresar un número válido.",
  [ERROR_CODES.INVALID_AMOUNT]: "El monto debe ser mayor que cero.",
  [ERROR_CODES.INVALID_DATE]: "La fecha ingresada no es válida.",
  [ERROR_CODES.INVALID_TEXT]: "El texto ingresado no es válido.",
  [ERROR_CODES.INVALID_OPTION]: "Debe seleccionar una opción válida.",

  [ERROR_CODES.RECORD_NOT_FOUND]: "El registro solicitado no existe.",
  [ERROR_CODES.DUPLICATE_RECORD]: "Ya existe un registro con esos datos.",
  [ERROR_CODES.DELETE_NOT_ALLOWED]:
    "No se puede eliminar este registro porque está siendo utilizado.",

  [ERROR_CODES.INVALID_MOVEMENT_TYPE]:
    "El tipo de movimiento seleccionado no es válido.",
  [ERROR_CODES.PROJECT_REQUIRED]:
    "Debe seleccionar un proyecto.",
  [ERROR_CODES.CATEGORY_REQUIRED]:
    "Debe seleccionar una categoría.",
  [ERROR_CODES.LIMIT_EXCEEDED]:
    "El monto ingresado supera el límite permitido.",

  [ERROR_CODES.STORAGE_READ_ERROR]:
    "No fue posible leer la información guardada.",
  [ERROR_CODES.STORAGE_WRITE_ERROR]:
    "No fue posible guardar la información.",
  [ERROR_CODES.INVALID_STORED_DATA]:
    "La información guardada tiene un formato inválido.",

  [ERROR_CODES.UNKNOWN_ERROR]:
    "Ocurrió un error inesperado. Intente nuevamente.",
};

/**
 * Obtiene el mensaje asociado con un código.
 *
 * @param {string} code Código del error.
 * @returns {string} Mensaje para mostrar al usuario.
 */
export function getErrorMessage(code) {
  return ERROR_MESSAGES[code] || ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR];
}