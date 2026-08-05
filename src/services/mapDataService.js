import { supabase } from "../config/supabaseClient";

export const safeNum = (val) => {
  if (val === null || val === undefined) return 0;
  const cleaned = String(val).trim();
  const parsed = Number(cleaned);
  return isNaN(parsed) || cleaned === "" ? 0 : parsed;
};

export async function fetchInitialMapData() {
  // 1. Carga de GeoJSON local
  const geoResponse = await fetch("/comunidad_tabasco.geojson");
  const geojson = await geoResponse.json();
  const mapFeatures = geojson.features || [];

  const geojsonCvegeos = new Set(
    mapFeatures
      .map((f) => f.properties?.CVEGEO || f.properties?.cvegeo)
      .filter(Boolean)
      .map(String)
  );

  // 2. Consulta Supabase
  const { data: supabaseData, error: supabaseError } = await supabase
    .from("comunidades")
    .select(`
      CVEGEO, 
      NOM_LOC, 
      AMBITO,
      ALTITUD,
      CVE_CARTA,
      POB_TOTAL, 
      POB_MASCULINA, 
      POB_FEMENINA, 
      "TOTAL DE VIVIENDAS HABITADAS"
    `)
    .range(0, 6000);

  if (supabaseError) throw supabaseError;

  const finalCommunitiesMap = new Map();

  (supabaseData || []).forEach((item) => {
    if (!item.CVEGEO) return;
    const cvegeoKey = String(item.CVEGEO).trim();

    if (finalCommunitiesMap.has(cvegeoKey)) {
      const existing = finalCommunitiesMap.get(cvegeoKey);
      existing.POB_TOTAL += safeNum(item.POB_TOTAL);
      existing.POB_MASCULINA += safeNum(item.POB_MASCULINA);
      existing.POB_FEMENINA += safeNum(item.POB_FEMENINA);
      existing["TOTAL DE VIVIENDAS HABITADAS"] += safeNum(item["TOTAL DE VIVIENDAS HABITADAS"]);
    } else {
      finalCommunitiesMap.set(cvegeoKey, {
        CVEGEO: cvegeoKey,
        NOM_LOC: item.NOM_LOC || "SIN NOMBRE",
        AMBITO: item.AMBITO === "R" ? "RURAL" : item.AMBITO === "U" ? "URBANO" : item.AMBITO,
        ALTITUD: item.ALTITUD || "0 msnm",
        CVE_CARTA: item.CVE_CARTA || "NO ASIGNADA",
        POB_TOTAL: safeNum(item.POB_TOTAL),
        POB_MASCULINA: safeNum(item.POB_MASCULINA),
        POB_FEMENINA: safeNum(item.POB_FEMENINA),
        "TOTAL DE VIVIENDAS HABITADAS": safeNum(item["TOTAL DE VIVIENDAS HABITADAS"]),
        isPoint: !geojsonCvegeos.has(cvegeoKey),
        latitud: null,
        longitud: null,
      });
    }
  });

  // 3. Demografía dispersa local
  const demoResponse = await fetch("/comunidad_demografia.json");
  const demoData = await demoResponse.json();

  (demoData || []).forEach((record) => {
    if (!record.CVEGEO) return;
    const recordCvegeo = String(record.CVEGEO).trim();
    const existing = finalCommunitiesMap.get(recordCvegeo);

    if (existing) {
      existing.latitud = Number(record.LONGITUD || existing.latitud);
      existing.longitud = Number(record.LAT_DECIMAL || existing.longitud);

      if (existing.POB_TOTAL === 0) {
        existing.POB_TOTAL = safeNum(record.POB_TOTAL);
        existing.POB_MASCULINA = safeNum(record.POB_MASCULINA);
        existing.POB_FEMENINA = safeNum(record.POB_FEMENINA);
        existing["TOTAL DE VIVIENDAS HABITADAS"] = safeNum(record["TOTAL DE VIVIENDAS HABITADAS"]);
      }
    } else {
      finalCommunitiesMap.set(recordCvegeo, {
        CVEGEO: recordCvegeo,
        NOM_LOC: record.NOM_LOC || "SIN NOMBRE",
        AMBITO: record.AMBITO === "R" ? "RURAL" : record.AMBITO === "U" ? "URBANO" : record.AMBITO,
        ALTITUD: record.ALTITUD || "0 msnm",
        CVE_CARTA: record.CVE_CARTA || "NO ASIGNADA",
        POB_TOTAL: safeNum(record.POB_TOTAL),
        POB_MASCULINA: safeNum(record.POB_MASCULINA),
        POB_FEMENINA: safeNum(record.POB_FEMENINA),
        "TOTAL DE VIVIENDAS HABITADAS": safeNum(record["TOTAL DE VIVIENDAS HABITADAS"]),
        isPoint: true,
        latitud: Number(record.LONGITUD),
        longitud: Number(record.LAT_DECIMAL),
      });
    }
  });

  const communities = Array.from(finalCommunitiesMap.values());

  // 4. Totales Estatales
  let globalTotals = null;
  if (communities.length > 0) {
    globalTotals = communities.reduce(
      (acc, curr) => {
        acc.POB_TOTAL += curr.POB_TOTAL;
        acc.POB_MASCULINA += curr.POB_MASCULINA;
        acc.POB_FEMENINA += curr.POB_FEMENINA;
        acc["TOTAL DE VIVIENDAS HABITADAS"] += curr["TOTAL DE VIVIENDAS HABITADAS"];
        return acc;
      },
      {
        NOM_LOC: "ESTADO DE TABASCO",
        AMBITO: "ESTADÍSTICA ESTATAL",
        CVE_CARTA: "CONSOLIDADO REGIONAL",
        ALTITUD: "Varía",
        POB_TOTAL: 0,
        POB_MASCULINA: 0,
        POB_FEMENINA: 0,
        "TOTAL DE VIVIENDAS HABITADAS": 0,
      }
    );
  }

  return { mapFeatures, communities, globalTotals };
}