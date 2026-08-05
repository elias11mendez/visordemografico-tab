import { useEffect, useRef, useCallback } from "react";
import { useMapInstance } from "../context/MapContext";
import { supabase } from "../config/supabaseClient";

export default function Coropletas({ isReady, visible = false, beforeId }) {
  const { mapRef, poblacionMap, setPoblacionMap } = useMapInstance();
  const visibleRef = useRef(visible);

  // Mantener la visibilidad sincronizada sin re-disparar hooks
  useEffect(() => {
    visibleRef.current = visible;
  }, [visible]);

  // 1. Cargar datos de Supabase SOLO cuando visible === true
  useEffect(() => {
    if (!visible || poblacionMap) return;

    async function fetchTotalesMunicipales() {
      try {
        const { data, error } = await supabase
          .from("edades_comunidades")
          .select("ENTIDAD, MUN, POBTOT, NOM_MUN")
          .eq("LOC", "0000");

        if (error) throw error;

        const mapa = {};
        data.forEach((row) => {
          const ent = String(row.ENTIDAD).padStart(2, "0");
          const mun = String(row.MUN).padStart(3, "0");
          const cvegeo = `${ent}${mun}`;

          mapa[cvegeo] = {
            poblacion: Number(row.POBTOT) || 0,
            nombre: row.NOM_MUN || "Sin nombre",
          };
        });

        setPoblacionMap(mapa);
      } catch (err) {
        console.error("Error al obtener datos de Supabase:", err.message);
      }
    }

    fetchTotalesMunicipales();
  }, [visible, poblacionMap, setPoblacionMap]);

  // 2. Función de Renderizado Reutilizable (Setup Layer)
  const setupCoropletas = useCallback(async () => {
    if (!mapRef.current || !poblacionMap) return;
    const map = mapRef.current;

    const SOURCE_ID = "tabasco-municipios-source";
    const FILL_LAYER = "tabasco-municipios-fill";
    const BORDER_LAYER = "tabasco-municipios-line";
    const LABEL_LAYER = "tabasco-municipios-label";

    try {
      // Reutilizamos datos si la fuente ya existe en memoria local
      let data = null;
      if (!map.getSource(SOURCE_ID)) {
        const res = await fetch("/tabasco_municipios.geojson");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        data = await res.json();
      }

      if (!mapRef.current) return;

      // Construcción de la expresión de color basada en la población
      const colorExpression = ["match", ["get", "CVEGEO"]];

      Object.entries(poblacionMap).forEach(([cvegeo, info]) => {
        const total = info.poblacion || 0;

        let color = "#eff6ff";
        if (total > 200000) color = "#1e3a8a"; // Centro / Cárdenas
        else if (total > 120000) color = "#1d4ed8";
        else if (total > 70000) color = "#3b82f6";
        else if (total > 40000) color = "#60a5fa";
        else color = "#93c5fd";

        colorExpression.push(cvegeo, color);
      });

      colorExpression.push("#cbd5e1"); // Color default si no hace match

      // A. Agregar Fuente GeoJSON
      if (!map.getSource(SOURCE_ID) && data) {
        map.addSource(SOURCE_ID, {
          type: "geojson",
          data: data,
          promoteId: "CVEGEO",
        });
      }

      // Visibilidad según la prop actual
      const visibilityState = visibleRef.current ? "visible" : "none";

      // B. Capa de Relleno (Coropleta)
      if (!map.getLayer(FILL_LAYER)) {
        map.addLayer(
          {
            id: FILL_LAYER,
            type: "fill",
            source: SOURCE_ID,
            layout: { visibility: visibilityState },
            paint: {
              "fill-color": colorExpression,
              "fill-opacity": 0.75,
            },
          },
          beforeId
        );
      } else {
        map.setPaintProperty(FILL_LAYER, "fill-color", colorExpression);
      }

      // C. Capa de Borde
      if (!map.getLayer(BORDER_LAYER)) {
        map.addLayer(
          {
            id: BORDER_LAYER,
            type: "line",
            source: SOURCE_ID,
            layout: { visibility: visibilityState },
            paint: {
              "line-color": "#1e293b",
              "line-width": 1.2,
            },
          },
          beforeId
        );
      }

      // D. Capa de Texto/Etiquetas
      if (!map.getLayer(LABEL_LAYER)) {
        map.addLayer({
          id: LABEL_LAYER,
          type: "symbol",
          source: SOURCE_ID,
          layout: {
            visibility: visibilityState,
            "text-field": [
              "coalesce",
              ["get", "NOMGEO"],
              ["get", "NOM_MUN"],
              ["get", "NOM_LOC"],
              "",
            ],
            "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
            "text-size": 11,
            "text-transform": "uppercase",
            "text-allow-overlap": true,
            "text-ignore-placement": false,
          },
          paint: {
            "text-color": "#ffffff",
            "text-halo-color": "#0f172a",
            "text-halo-width": 1.5,
          },
        });
      }
    } catch (error) {
      console.error("Error cargando coropleta:", error);
    }
  }, [mapRef, poblacionMap, beforeId]);

  // 3. Montaje Inicial + Listener persistent `styledata` para cambios de Basemap
  useEffect(() => {
    if (!isReady || !mapRef.current || !poblacionMap) return;
    const map = mapRef.current;

    // Ejecución inicial de renderizado
    setupCoropletas();

    // Evento que se ejecuta al cambiar la capa base (ESRI -> OSM -> CARTO)
    const handleStyleData = () => {
      setupCoropletas();
    };

    map.on("styledata", handleStyleData);

    return () => {
      map.off("styledata", handleStyleData);
    };
  }, [isReady, poblacionMap, setupCoropletas, mapRef]);

  // 4. Conmutador rápido de visibilidad ON/OFF
  useEffect(() => {
    if (!isReady || !mapRef.current) return;
    const map = mapRef.current;
    const estadoVisibilidad = visible ? "visible" : "none";

    const capas = [
      "tabasco-municipios-fill",
      "tabasco-municipios-line",
      "tabasco-municipios-label",
    ];

    capas.forEach((layerId) => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, "visibility", estadoVisibilidad);
      }
    });
  }, [visible, isReady, mapRef]);

  return null;
}