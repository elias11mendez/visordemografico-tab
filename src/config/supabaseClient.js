import { createClient } from "@supabase/supabase-js";

// 🔐 Extraemos las variables de entorno de forma segura
const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL 
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY

// Validamos que existan las credenciales para evitar errores silenciosos en consola
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    "❌ Error: Las variables de entorno de Supabase no están definidas. " +
    "Revisa tu archivo .env y asegúrate de reiniciar el servidor."
  );
}

// Inicializamos la instancia única del cliente
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);