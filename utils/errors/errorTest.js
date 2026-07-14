import { AppError } from "./AppError";
import { ERROR_CODES } from "./errorCodes";
import {
  createErrorResponse,
  createSuccessResponse,
} from "./errorResponse";

export function testErrorHandling() {
  const success = createSuccessResponse(
    {
      id: 1,
      name: "Movimiento de prueba",
    },
    "Registro creado correctamente."
  );

  console.log("Respuesta exitosa:", success);

  const error = new AppError(
    ERROR_CODES.INVALID_AMOUNT,
    {
      field: "amount",
    }
  );

  console.log(
    "Respuesta de error:",
    createErrorResponse(error)
  );
}