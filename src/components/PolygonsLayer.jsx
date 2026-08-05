import { useEffect, useRef, useCallback } from "react";
import maplibregl from "maplibre-gl";
import { useMapInstance } from "../context/MapContext";

export default function PolygonsLayer({ isReady, onPolygonsLoaded, visible }) {
  const { mapRef, setSelectedCvegeo } = useMapInstance();

  // Ref para controlar visibilidad sin re-crear eventos
  const visibleRef = useRef(visible);
  useEffect(() => {
    visibleRef.current = visible;
  }, [visible]);

  // Ref para cachear el GeoJSON y evitar hacer fetch() múltiples veces
  const geojsonRef = useRef(null);

  // 1. Cargar el GeoJSON (solo una vez)
  const fetchGeoJSON = useCallback(async () => {
    if (geojsonRef.current) return geojsonRef.current;

    try {
      const res = await fetch("/comunidad_tabasco.geojson");
      const geojson = await res.json();
      geojsonRef.current = geojson;

      if (onPolygonsLoaded) {
        const cvegeoSet = new Set(
          (geojson.features || [])
            .map((f) =>
              String(f.properties?.CVEGEO || f.properties?.cvegeo).trim()
            )
            .filter(Boolean)
        );
        onPolygonsLoaded(cvegeoSet);
      }

      return geojson;
    } catch (error) {
      console.error("Error al cargar polígonos:", error);
      return null;
    }
  }, [onPolygonsLoaded]);

  // 2. Función imperativa para montar fuente y capas
  const setupLayer = useCallback(async () => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const SOURCE_ID = "datos-locales";
    const FILL_LAYER = "capa-locales-relleno";
    const BORDER_LAYER = "capa-locales-borde";

    const data = await fetchGeoJSON();
    if (!data) return;

    // A. Re-crear fuente si fue destruida por un cambio de mapa base
    if (!map.getSource(SOURCE_ID)) {
      map.addSource(SOURCE_ID, {
        type: "geojson",
        data: data,
        promoteId: "CVEGEO",
      });
    }

    // B. Re-crear capa de Relleno
    if (!map.getLayer(FILL_LAYER)) {
      map.addLayer({
        id: FILL_LAYER,
        type: "fill",
        source: SOURCE_ID,
        layout: {
          visibility: visibleRef.current ? "visible" : "none",
        },
        paint: {
          "fill-color": "#FFA500",
          "fill-opacity": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            0.6,
            0.1,
          ],
        },
      });
    }

    // C. Re-crear capa de Borde
    if (!map.getLayer(BORDER_LAYER)) {
      map.addLayer({
        id: BORDER_LAYER,
        type: "line",
        source: SOURCE_ID,
        layout: {
          visibility: visibleRef.current ? "visible" : "none",
        },
        paint: {
          "line-color": "#FFA500",
          "line-width": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            2.5,
            1,
          ],
        },
      });
    }
  }, [fetchGeoJSON, mapRef]);

  // 📡 EFECTO 1: Montaje + Listener 'styledata' para cambio de mapas base
  useEffect(() => {
    if (!isReady || !mapRef.current) return;
    const map = mapRef.current;

    const SOURCE_ID = "datos-locales";
    const FILL_LAYER = "capa-locales-relleno";

    // Inicializar capa
    setupLayer();

    let hoveredId = null;

    // Listener para re-montar automáticamente si se cambia el basemap
    const handleStyleData = () => {
      setupLayer();
    };

    map.on("styledata", handleStyleData);

    // --- EVENTOS DEL RATÓN ---
    const handleMouseMove = (e) => {
      if (!visibleRef.current) return;
      if (!e.features.length) return;

      map.getCanvas().style.cursor = "pointer";
      const feat = e.features[0];
      const cvegeo = feat.properties.CVEGEO || feat.properties.cvegeo;
      const nomgeo = feat.properties.NOMGEO || feat.properties.nom_loc;

      if (hoveredId) {
        map.setFeatureState(
          { source: SOURCE_ID, id: hoveredId },
          { hover: false }
        );
      }
      hoveredId = cvegeo;
      map.setFeatureState({ source: SOURCE_ID, id: hoveredId }, { hover: true });

      map.popup
        ?.setLngLat(e.lngLat)
        .setHTML(
          `<div class="p-1 font-bold text-xs">${String(nomgeo).toUpperCase()}</div>`
        )
        .addTo(map);
    };

    const handleMouseLeave = () => {
      if (!visibleRef.current) return;
      map.getCanvas().style.cursor = "";
      if (hoveredId) {
        map.setFeatureState(
          { source: SOURCE_ID, id: hoveredId },
          { hover: false }
        );
      }
      hoveredId = null;
      if (map.popup) map.popup.remove();
    };

    const handleClick = (e) => {
      if (!visibleRef.current) return;
      if (!e.features.length) return;

      const feat = e.features[0];
      setSelectedCvegeo(feat.properties.CVEGEO || feat.properties.cvegeo);

      const geom = feat.geometry;
      let coords =
        geom.type === "Polygon"
          ? geom.coordinates[0]
          : geom.coordinates.flatMap((p) => p[0]);

      if (coords.length > 0) {
        const bounds = coords.reduce(
          (acc, coord) => acc.extend(coord),
          new maplibregl.LngLatBounds(coords[0], coords[0])
        );
        map.fitBounds(bounds, { padding: 80, duration: 1000 });
      }
    };

    map.on("mousemove", FILL_LAYER, handleMouseMove);
    map.on("mouseleave", FILL_LAYER, handleMouseLeave);
    map.on("click", FILL_LAYER, handleClick);

    // Limpieza al desmontar
    return () => {
      map.off("styledata", handleStyleData);
      map.off("mousemove", FILL_LAYER, handleMouseMove);
      map.off("mouseleave", FILL_LAYER, handleMouseLeave);
      map.off("click", FILL_LAYER, handleClick);
    };
  }, [isReady, setupLayer, setSelectedCvegeo]);

  // 📡 EFECTO 2: Control de Visibilidad (Toggle On/Off)
  useEffect(() => {
    if (!isReady || !mapRef.current) return;
    const map = mapRef.current;

    const visibilidad = visible ? "visible" : "none";

    if (map.getLayer("capa-locales-relleno")) {
      map.setLayoutProperty("capa-locales-relleno", "visibility", visibilidad);
    }
    if (map.getLayer("capa-locales-borde")) {
      map.setLayoutProperty("capa-locales-borde", "visibility", visibilidad);
    }

    if (!visible) {
      map.getCanvas().style.cursor = "";
      if (map.popup) map.popup.remove();
    }
  }, [visible, isReady]);

  return null;
}