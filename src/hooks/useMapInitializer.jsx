import { useEffect, useState } from "react";
import maplibregl from "maplibre-gl";
import { useMapInstance } from "../context/MapContext";

export function useMapInitializer(mapContainer, mapRef) {
  const [isReady, setIsReady] = useState(false);
  const { currentBasemap } = useMapInstance();

  // 1. Inicialización inicial del mapa
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    mapRef.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          "esri-tiles": {
            type: "raster",
            tiles: [
              "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            ],
            tileSize: 256,
            attribution: "Tiles © Esri",
          },
        },
        layers: [
          { id: "esri-tiles-layer", type: "raster", source: "esri-tiles" },
        ],
      },
      center: [-92.518, 17.989],
      zoom: 7.8,
    });

    mapRef.current.popup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
    });

    mapRef.current.on("load", () => setIsReady(true));

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        setIsReady(false);
      }
    };
  }, [mapContainer, mapRef]);

  // 2. Cambio directo de estilo de mapa base
  useEffect(() => {
    if (!isReady || !mapRef.current || !currentBasemap) return;

    const isValidStyle =
      typeof currentBasemap === "object" ||
      (typeof currentBasemap === "string" && currentBasemap.startsWith("http"));

    if (isValidStyle) {
      mapRef.current.setStyle(currentBasemap);
    }
  }, [currentBasemap, isReady, mapRef]);

  return isReady;
}