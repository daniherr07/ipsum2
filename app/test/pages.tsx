"use client";

import { useEffect } from "react";

import { AppError } from "@/utils/errors/AppError";
import { ERROR_CODES } from "@/utils/errors/errorCodes";
import { createErrorResponse } from "@/utils/errors/errorResponse";

export default function TestPage() {

  useEffect(() => {

    console.log(
      createErrorResponse(
        new AppError(
          ERROR_CODES.INVALID_AMOUNT,
          {
            field: "amount",
          }
        )
      )
    );

  }, []);

  return (
    <div style={{ padding: 30 }}>
      <h1>Prueba Backend</h1>
      <p>Abre la consola (F12).</p>
    </div>
  );
}