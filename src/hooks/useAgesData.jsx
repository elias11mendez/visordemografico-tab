import { useState, useRef, useCallback } from "react";
import { supabase } from "../config/supabaseClient";

export function useAgesData() {
  const [selectedAgesData, setSelectedAgesData] = useState(null);
  const [loadingAges, setLoadingAges] = useState(false);
  const agesCache = useRef(new Map());

  const fetchAgesByCvegeo = useCallback(async (cvegeoToFetch) => {
    if (!cvegeoToFetch) {
      setSelectedAgesData(null);
      return;
    }

    const cleanCvegeo = String(cvegeoToFetch).trim();

    if (agesCache.current.has(cleanCvegeo)) {
      setSelectedAgesData(agesCache.current.get(cleanCvegeo));
      return;
    }

    setLoadingAges(true);
    try {
      const ent = Number(cleanCvegeo.substring(0, 2));
      const mun = Number(cleanCvegeo.substring(2, 5));
      const loc = Number(cleanCvegeo.substring(5, 9));

      const { data, error } = await supabase
        .from("edades_comunidades")
        .select("*")
        .eq("ENTIDAD", ent)
        .eq("MUN", mun)
        .eq("LOC", loc)
        .maybeSingle();

      if (error) throw error;

      agesCache.current.set(cleanCvegeo, data || null);
      setSelectedAgesData(data || null);
    } catch (err) {
      console.error(`⚠️ Error al obtener edades para ${cleanCvegeo}:`, err);
      setSelectedAgesData(null);
    } finally {
      setLoadingAges(false);
    }
  }, []);

  return { selectedAgesData, setSelectedAgesData, loadingAges, fetchAgesByCvegeo };
}