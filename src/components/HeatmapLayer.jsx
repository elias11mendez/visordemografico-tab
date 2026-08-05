import { useEffect, useRef, useCallback } from "react";
import { useMapInstance } from "../context/MapContext";

export default function HeatmapLayer({ isReady, visible }) {
  const { mapRef, communities } = useMapInstance();

  // Mantenemos una referencia actualizada de la visibilidad para el listener
  const visibleRef = useRef(visible);
  useEffect(() => {
    visibleRef.current = visible;
  }, [visible]);

  // 1. Construye el GeoJSON siempre actualizado
  const buildGeoJSON = useCallback(() => {
    if (!communities || !communities.length) {
      return { type: "FeatureCollection", features: [] };
    }

    const localidadesConCoordenadas = communities.filter(
      (c) => c.latitud && c.longitud
    );

    return {
      type: "FeatureCollection",
      features: localidadesConCoordenadas.map((c) => ({
        type: "Feature",
        id: c.CVEGEO,
        properties: { pob_total: Number(c.POB_TOTAL || 0) },
        geometry: { type: "Point", coordinates: [c.longitud, c.latitud] },
      })),
    };
  }, [communities]);

  // 2. Función imperativa para asegurar que la fuente y capa existan
  const setupLayer = useCallback(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const SOURCE_ID = "datos-calor";
    const LAYER_ID = "capa-poblacion-calor";

    // Re-crear fuente si no existe
    if (!map.getSource(SOURCE_ID)) {
      map.addSource(SOURCE_ID, {
        type: "geojson",
        data: buildGeoJSON(),
      });
    }

    // Re-crear capa si no existe
    if (!map.getLayer(LAYER_ID)) {
      map.addLayer({
        id: LAYER_ID,
        type: "heatmap",
        source: SOURCE_ID,
        layout: {
          visibility: visibleRef.current ? "visible" : "none",
        },
        paint: {
          "heatmap-weight": [
            "interpolate",
            ["linear"],
            ["get", "pob_total"],
            0, 0,
            100, 0.4,
            500, 0.8,
            1000, 1.5,
            5000, 3.0,
          ],
          "heatmap-intensity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            0, 1,
            15, 3,
          ],
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0, "rgba(0, 0, 255, 0)",
            0.15, "rgba(0, 40, 255, 0.6)",
            0.3, "rgb(0, 190, 255)",
            0.45, "rgb(0, 230, 120)",
            0.6, "rgb(255, 235, 0)",
            0.75, "rgb(255, 120, 0)",
            0.9, "rgb(235, 0, 0)",
            1, "rgb(180, 0, 100)",
          ],
          "heatmap-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            0, 3,
            6, 12,
            11, 28,
            15, 50,
          ],
          "heatmap-opacity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            7, 0.95,
            15, 0.5,
          ],
        },
      });
    }
  }, [buildGeoJSON, mapRef]);

  // 📡 EFECTO 1: Montaje inicial + Escucha del evento 'styledata'
  useEffect(() => {
    if (!isReady || !mapRef.current) return;
    const map = mapRef.current;

    // Inicializar capa al cargar
    setupLayer();

    // Escuchar cambios de estilo para que la capa no desaparezca al cambiar de mapa base
    const handleStyleData = () => {
      setupLayer();
    };

    map.on("styledata", handleStyleData);

    return () => {
      map.off("styledata", handleStyleData);
    };
  }, [isReady, setupLayer]);

  // 📡 EFECTO 2: Inyección reactiva de datos al cargar 'communities'
  useEffect(() => {
    if (!isReady || !mapRef.current) return;

    const source = mapRef.current.getSource("datos-calor");
    if (source) {
      source.setData(buildGeoJSON());
    } else {
      // Si el source aún no existía cuando llegaron las comunidades, aseguramos crearlo
      setupLayer();
    }
  }, [communities, isReady, buildGeoJSON, setupLayer]);

  // 📡 EFECTO 3: Control de Visibilidad (Toggle On/Off)
  useEffect(() => {
    if (!isReady || !mapRef.current) return;
    const map = mapRef.current;

    if (map.getLayer("capa-poblacion-calor")) {
      map.setLayoutProperty(
        "capa-poblacion-calor",
        "visibility",
        visible ? "visible" : "none"
      );
    }
  }, [visible, isReady]);

  return null;
}