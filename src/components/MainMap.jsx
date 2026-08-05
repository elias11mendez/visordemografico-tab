import { useRef, useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import { useMapInstance } from "../context/MapContext";
import { useMapInitializer } from "../hooks/useMapInitializer";

import SearchBar from "./SearchBar";
import AnalysisPanel from "./AnalysisPanel";
import PolygonsLayer from "./PolygonsLayer";
import DispersedPinsLayer from "./DispersedPinsLayer";
import Toolbar from "./Toolbar";
import HeatmapLayer from "./HeatmapLayer";
import { Legend } from "./Legend";
import { ContextMenu } from "./ContextMenu";
import { ComparisonPanel } from "./ComparisonPanel";
import Coropletas from "./Coropletas";
import plugin from "eslint-plugin-react-hooks";

function MainMap() {
  const mapContainer = useRef(null);
  const { mapRef, setShowCoropletas, showCoropletas } = useMapInstance();

  // 🧠 Estados compartidos
  const [poligonosSet, setPoligonosSet] = useState(new Set());
  const [showHeatmap, setShowHeatmap] = useState(false);
  
  // 1. Inicia en false para que NO cargue ni se muestre al arrancar la app

  // Custom hook para inicializar y destruir el mapa de forma segura
  const isReady = useMapInitializer(mapContainer, mapRef);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-50">
      {/* 🗺️ 1. Lienzo del mapa */}
      <div ref={mapContainer} className="absolute inset-0 w-full h-full z-0" />

{isReady && (
  <>
    {/* 1. Capa de Coropletas Municipales */}
    {/* Se muestra si showCoropletas es true Y no está activo el heatmap */}
    <Coropletas 
      isReady={isReady} 
      visible={showCoropletas && !showHeatmap}
            poligonosSet={poligonosSet}
      onPolygonsLoaded={setPoligonosSet}

    />

    {/* 2. Polígonos adicionales: Comunidades / AGEBs */}
    {/* Se oculta si showHeatmap O showCoropletas están activos */}
    <PolygonsLayer
      isReady={isReady}
      onPolygonsLoaded={setPoligonosSet}
      visible={!showHeatmap && !showCoropletas}
    />

    {/* 3. Marcadores y Pines */}
    {/* Se oculta si showHeatmap O showCoropletas están activos */}
    <DispersedPinsLayer
      isReady={isReady}
      poligonosSet={poligonosSet}
      visible={!showHeatmap && !showCoropletas}
    />

    {/* 4. Capa de mapa de calor */}
    <HeatmapLayer 
      isReady={isReady} 
      visible={showHeatmap} 
    />
  </>
)}


      {/* 🎛️ 3. UI Flotante Interactiva */}
      {isReady && (
        <>
          <SearchBar />
          <ContextMenu setShowCoropletas={setShowCoropletas} />
        </>
      )}

      <AnalysisPanel />
      <ComparisonPanel />

      {/* 3. Pasamos los estados a la Toolbar por si deseas alternar ON/OFF globalmente */}
      <Toolbar 
        showHeatmap={showHeatmap} 
        setShowHeatmap={setShowHeatmap}
        showCoropletas={showCoropletas}
        setShowCoropletas={setShowCoropletas}
      />
      <Legend />
    </div>
  );
}

export default MainMap;