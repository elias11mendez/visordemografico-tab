import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    "Error: Las variables de entorno de Supabase no están definidas. " +
    "Revisa tu configuración en Netlify o tu archivo .env local."
  );
}

export const supabase = createClient(
  SUPABASE_URL || "https://placeholder.supabase.co", 
  SUPABASE_ANON_KEY || "placeholder-key"
);