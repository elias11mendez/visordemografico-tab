import { useEffect, useRef, useCallback } from "react";
import { useMapInstance } from "../context/MapContext";

export default function DispersedPinsLayer({ isReady, poligonosSet, visible }) {
  const { mapRef, communities, setSelectedCvegeo } = useMapInstance();

  const visibleRef = useRef(visible);

  useEffect(() => {
    visibleRef.current = visible;
  }, [visible]);

  // Función para construir el GeoJSON
  const buildGeoJSON = useCallback(() => {
    if (!communities.length || !poligonosSet.size) {
      return { type: "FeatureCollection", features: [] };
    }

    const puntosUnicos = communities.filter(
      (c) =>
        c.latitud &&
        c.longitud &&
        !poligonosSet.has(String(c.CVEGEO).trim())
    );

    return {
      type: "FeatureCollection",
      features: puntosUnicos.map((c) => ({
        type: "Feature",
        id: c.CVEGEO,
        properties: {
          cvegeo: c.CVEGEO,
          nom_loc: c.NOM_LOC,
          pob_total: c.POB_TOTAL,
        },
        geometry: { type: "Point", coordinates: [c.longitud, c.latitud] },
      })),
    };
  }, [communities, poligonosSet]);

  // Función principal para asegurar que la fuente y capa existan
  const setupLayer = useCallback(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const SOURCE_ID = "datos-pines-dispersos";
    const LAYER_ID = "capa-pines-puntos";

    // 1. Si no existe la fuente en el estilo actual, la creamos con los datos
    if (!map.getSource(SOURCE_ID)) {
      map.addSource(SOURCE_ID, {
        type: "geojson",
        data: buildGeoJSON(),
      });
    }

    // 2. Si no existe la capa en el estilo actual, la creamos
    if (!map.getLayer(LAYER_ID)) {
      map.addLayer({
        id: LAYER_ID,
        type: "circle",
        source: SOURCE_ID,
        paint: {
          "circle-radius": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            7,
            4.5,
          ],
          "circle-color": "#90EE90",
          "circle-stroke-width": 0.5,
          "circle-stroke-color": "#90EE90",
        },
        layout: {
          visibility: visibleRef.current ? "visible" : "none",
        },
      });
    }
  }, [buildGeoJSON, mapRef]);

  // 📡 EFECTO 1: Montar Capa y Escuchar Cambios de Estilo del Mapa Base (ej. OpenStreetMap)
  useEffect(() => {
    if (!isReady || !mapRef.current) return;
    const map = mapRef.current;

    // Ejecución inicial de montaje
    setupLayer();

    let hoveredId = null;
    const SOURCE_ID = "datos-pines-dispersos";
    const LAYER_ID = "capa-pines-puntos";

    // Re-montar automáticamente cuando cambie cualquier estilo (ESRI -> OSM -> CARTO)
    const handleStyleData = () => {
      setupLayer();
    };

    map.on("styledata", handleStyleData);

    // --- EVENTOS DE INTERACCIÓN ---
    const handleMouseMove = (e) => {
      if (!visibleRef.current) return;
      if (!e.features.length) return;

      map.getCanvas().style.cursor = "pointer";
      const feat = e.features[0];

      if (hoveredId) {
        map.setFeatureState(
          { source: SOURCE_ID, id: hoveredId },
          { hover: false }
        );
      }
      hoveredId = feat.properties.cvegeo;
      map.setFeatureState(
        { source: SOURCE_ID, id: hoveredId },
        { hover: true }
      );

      map.popup
        ?.setLngLat(e.lngLat)
        .setHTML(
          `<div class="p-1 font-bold text-xs">${String(
            feat.properties.nom_loc
          ).toUpperCase()}</div>`
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
      setSelectedCvegeo(feat.properties.cvegeo);
      map.flyTo({
        center: feat.geometry.coordinates,
        zoom: 14,
        duration: 1000,
      });
    };

    map.on("mousemove", LAYER_ID, handleMouseMove);
    map.on("mouseleave", LAYER_ID, handleMouseLeave);
    map.on("click", LAYER_ID, handleClick);

    return () => {
      map.off("styledata", handleStyleData);
      map.off("mousemove", LAYER_ID, handleMouseMove);
      map.off("mouseleave", LAYER_ID, handleMouseLeave);
      map.off("click", LAYER_ID, handleClick);
    };
  }, [isReady, setupLayer]);

  // 📡 EFECTO 2: Actualización de datos si cambian las comunidades
  useEffect(() => {
    if (!isReady || !mapRef.current) return;

    const source = mapRef.current.getSource("datos-pines-dispersos");
    if (source) {
      source.setData(buildGeoJSON());
    }
  }, [communities, poligonosSet, isReady, buildGeoJSON]);

  // 📡 EFECTO 3: Control de Visibilidad
  useEffect(() => {
    if (!isReady || !mapRef.current) return;
    const map = mapRef.current;

    if (map.getLayer("capa-pines-puntos")) {
      map.setLayoutProperty(
        "capa-pines-puntos",
        "visibility",
        visible ? "visible" : "none"
      );
    }

    if (!visible) {
      map.getCanvas().style.cursor = "";
      if (map.popup) map.popup.remove();
    }
  }, [visible, isReady]);

  return null;
}