import React from "react";
import { useMapInstance } from "../context/MapContext";

export const BASEMAPS = [
  {
    id: "osm",
    name: "OpenStreetMap",
    preview: "https://a.tile.openstreetmap.org/10/512/384.png",
    style: {
      version: 8,
      sources: {
        "osm-tiles": {
          type: "raster",
          tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
          tileSize: 256,
          attribution: "&copy; OpenStreetMap contributors",
        },
      },
      layers: [{ id: "osm-layer", type: "raster", source: "osm-tiles" }],
    },
  },
  {
    id: "esri",
    name: "Esri Satelital",
    preview: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/10/384/512",
    style: {
      version: 8,
      sources: {
        "esri-tiles": {
          type: "raster",
          tiles: [
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          ],
          tileSize: 256,
          attribution: "Tiles &copy; Esri",
        },
      },
      layers: [{ id: "esri-layer", type: "raster", source: "esri-tiles" }],
    },
  },
  {
    id: "cartoDark",
    name: "CARTO Dark",
    preview: "https://a.basemaps.cartocdn.com/dark_all/10/512/384.png",
    style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  },
  {
    id: "cartoVoyager",
    name: "CARTO Voyager",
    preview: "https://a.basemaps.cartocdn.com/rastertiles/voyager/10/512/384.png",
    style: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
  },
];

const LayerMap = () => {
  const { currentBasemap, setBasemap } = useMapInstance();

  return (
    <div className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-xl shadow-xl p-2 flex items-center gap-2">
      {BASEMAPS.map((map) => {
        const isActive = currentBasemap === map.style;

        return (
          <button
            key={map.id}
            onClick={() => setBasemap(map.style)} // 👈 Pasa la URL o el Objeto completo de estilo
            title={map.name}
            className={`relative w-10 h-10 rounded-lg overflow-hidden border-2 transition-all cursor-pointer group/item ${
              isActive
                ? "border-indigo-600 scale-105 shadow-md"
                : "border-slate-200 opacity-80 hover:opacity-100 hover:border-slate-400"
            }`}
          >
            <img
              src={map.preview}
              alt={map.name}
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-1.5 py-0.5 bg-slate-800 text-white text-[9px] rounded opacity-0 group-hover/item:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
              {map.name}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default LayerMap;