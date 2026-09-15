import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    "Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en las variables de entorno (backend/.env)"
  );
}

// El backend usa la service_role key: es un servidor de confianza, se salta
// RLS a proposito porque el control de roles ya lo hace esta capa de Express.
export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);