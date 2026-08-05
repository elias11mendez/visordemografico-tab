import React, { useEffect, useState, useRef } from "react";
import { useMapInstance } from "../context/MapContext";
import { MapPin, Copy, ArrowLeftRight, Info, Grid2x2 } from "lucide-react";

export function ContextMenu() {
  const context = useMapInstance();
  const mapInstance = context.mapInstance || context.mapRef?.current;
  const {
    setSelectedCvegeo,
    setSelectedB,
    setCompareMode,
    setShowCoropletas,
  } = context;

  const [menuConfig, setMenuConfig] = useState(null);
  const touchTimerRef = useRef(null);

  useEffect(() => {
    if (!mapInstance || typeof mapInstance.on !== "function") return;

    // Función centralizada para abrir el menú
    const triggerMenu = (clientX, clientY, point, lngLat) => {
      const features = mapInstance.queryRenderedFeatures(point);
      const clickedFeature =
        features.length > 0 ? features[0].properties : null;

      setMenuConfig({
        x: clientX,
        y: clientY,
        lng: lngLat.lng.toFixed(5),
        lat: lngLat.lat.toFixed(5),
        feature: clickedFeature,
      });
    };

    // 1. Click Derecho (Desktop)
    const handleContextMenu = (e) => {
      if (e.originalEvent && typeof e.originalEvent.preventDefault === "function") {
        e.originalEvent.preventDefault();
      }

      const point = e.point;
      const lngLat = e.lngLat;
      const clientX = e.originalEvent?.clientX;
      const clientY = e.originalEvent?.clientY;

      triggerMenu(clientX, clientY, point, lngLat);
    };

    // 2. Long Press Nativo (Móvil)
    const handleTouchStart = (e) => {
      // Si hay más de un dedo (ej. haciendo zoom), cancelamos
      if (e.originalEvent?.touches?.length > 1) return;

      const touch = e.originalEvent?.touches?.[0];
      if (!touch) return;

      const point = e.point;
      const lngLat = e.lngLat;
      const clientX = touch.clientX;
      const clientY = touch.clientY;

      // Iniciar temporizador de 500ms para considerar "mantener presionado"
      touchTimerRef.current = setTimeout(() => {
        triggerMenu(clientX, clientY, point, lngLat);
      }, 500);
    };

    // Si el usuario mueve el dedo o lo levanta antes de los 500ms, cancelamos el menú
    const clearTouchTimer = () => {
      if (touchTimerRef.current) {
        clearTimeout(touchTimerRef.current);
        touchTimerRef.current = null;
      }
    };

    const handleCloseMenu = () => {
      clearTouchTimer();
      setMenuConfig(null);
    };

    // Suscripción de eventos Mapbox/MapLibre
    mapInstance.on("contextmenu", handleContextMenu);
    mapInstance.on("touchstart", handleTouchStart);
    mapInstance.on("touchend", clearTouchTimer);
    mapInstance.on("touchmove", clearTouchTimer);

    mapInstance.on("click", handleCloseMenu);
    mapInstance.on("movestart", handleCloseMenu);
    mapInstance.on("zoomstart", handleCloseMenu);

    return () => {
      clearTouchTimer();
      mapInstance.off("contextmenu", handleContextMenu);
      mapInstance.off("touchstart", handleTouchStart);
      mapInstance.off("touchend", clearTouchTimer);
      mapInstance.off("touchmove", clearTouchTimer);
      mapInstance.off("click", handleCloseMenu);
      mapInstance.off("movestart", handleCloseMenu);
      mapInstance.off("zoomstart", handleCloseMenu);
    };
  }, [mapInstance]);

  if (!menuConfig) return null;

  return (
    <div
      className="fixed z-[9999] w-64 bg-white/90 backdrop-blur-md border border-slate-200 rounded-xl shadow-xl py-1 text-xs font-sans text-slate-700 select-none"
      style={{
        top: `${menuConfig.y}px`,
        left: `${menuConfig.x}px`,
      }}
    >
      {/* Header de Coordenadas */}
      <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
        <div className="flex items-center gap-1.5 truncate">
          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="truncate">
            {menuConfig.lat}, {menuConfig.lng}
          </span>
        </div>
        <button
          onClick={() => {
            navigator.clipboard.writeText(
              `${menuConfig.lat},${menuConfig.lng}`
            );
            setMenuConfig(null);
          }}
          className="text-slate-500 hover:text-black font-semibold hover:bg-slate-100 px-1.5 py-0.5 rounded transition-colors flex items-center gap-1"
        >
          <Copy className="w-3 h-3 text-slate-500" />
          Copiar
        </button>
      </div>

      {/* Opciones del Menú */}
      <div className="p-1">
        {menuConfig.feature ? (
          <>
            <div className="px-2.5 py-1 text-[10px] font-black text-slate-400 uppercase tracking-wider truncate">
              {menuConfig.feature.NOM_LOC ||
                menuConfig.feature.NOM_MUN ||
                menuConfig.feature.NOMGEO ||
                "Zona Seleccionada"}
            </div>

            {/* Opción 1: Ver Coropleta */}
            <button
              onClick={() => {
                const feat = menuConfig.feature;
                const cvegeo = feat?.CVEGEO || feat?.cvegeo;

                if (cvegeo && setSelectedCvegeo) {
                  setSelectedCvegeo(cvegeo);
                }

                if (setShowCoropletas) {
                  setShowCoropletas(true);
                }

                setMenuConfig(null);
              }}
              className="w-full text-left px-2.5 py-2 text-slate-600 hover:text-black hover:bg-slate-100 rounded-lg flex items-center gap-2.5 font-medium transition-colors group"
            >
              <Grid2x2 className="w-4 h-4 text-slate-500 group-hover:text-black transition-colors shrink-0" />
              <span className="truncate">Ver coropleta</span>
            </button>

            {/* Opción 2: Comparar con otra zona */}
            <button
              onClick={() => {
                if (setSelectedB) setSelectedB(menuConfig.feature);
                if (setCompareMode) setCompareMode(true);
                if (setShowCoropletas) setShowCoropletas(false);
                setMenuConfig(null);
              }}
              className="w-full text-left px-2.5 py-2 text-slate-600 hover:text-black hover:bg-slate-100 rounded-lg flex items-center gap-2.5 font-medium transition-colors group"
            >
              <ArrowLeftRight className="w-4 h-4 text-slate-500 group-hover:text-black transition-colors shrink-0" />
              <span className="truncate">Comparar con otra zona</span>
            </button>
          </>
        ) : (
          <div className="px-3 py-2 text-slate-400 flex items-center justify-center gap-2 text-[11px]">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Sin datos vectoriales en este punto</span>
          </div>
        )}
      </div>
    </div>
  );
}