import { useState } from "react";
import {
  MapPin,
  Layers,
  Ruler,
  Bell,
  Share2,
  HelpCircle,
  Maximize,
  Flame,
} from "lucide-react";
import { useMapInstance } from "../context/MapContext";
import LayerMap from "./LayerMap";

import { HelpPanel } from "./HelpPanel";

const Toolbar = ({ showHeatmap, setShowHeatmap }) => {
  const { handleGetUserLocation } = useMapInstance();
  const [activePanel, setActivePanel] = useState(null);

  const togglePanel = (panelId) => {
    setActivePanel((prev) => (prev === panelId ? null : panelId));
  };

  const tools = [
    {
      id: "heatmap",
      icon: <Flame size={18} />,
      label: showHeatmap ? "Ver Mapa Normal" : "Ver Mapa de Calor",
      action: () => setShowHeatmap(!showHeatmap),
      active: showHeatmap,
      activeClass:
        "bg-pink-50 text-pink-600 hover:bg-pink-100 hover:text-pink-700",
    },
    {
      id: "location",
      icon: <MapPin size={18} />,
      label: "Mi Ubicación",
      action: handleGetUserLocation || (() => console.log("Ubicación")),
    },
    {
      id: "layers",
      icon: <Layers size={18} />,
      label: "Capas",
      action: () => togglePanel("layers"),
      active: activePanel === "layers",
      activeClass:
        "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700",
      panel: <LayerMap />,
    },
    {
      id: "measure",
      icon: <Ruler size={18} />,
      label: "Medir Distancia",
      action: () => togglePanel("measure"),
      active: activePanel === "measure",
      panel: (
        <div className="w-52 h-16 bg-white/90 backdrop-blur-md border border-slate-200 rounded-xl shadow-xl p-3 flex items-center">
          Panel de Medición
        </div>
      ),
    },
    {
      id: "alerts",
      icon: <Bell size={18} />,
      label: "Alertas",
      action: () => togglePanel("alerts"),
      active: activePanel === "alerts",
      panel: (
        <div className="w-52 h-16 bg-white/90 backdrop-blur-md border border-slate-200 rounded-xl shadow-xl p-3 flex items-center">
          Panel de Alertas
        </div>
      ),
    },
    {
      id: "share",
      icon: <Share2 size={18} />,
      label: "Compartir",
      action: () => togglePanel("share"),
      active: activePanel === "share",
      panel: (
        <div className="w-52 h-16 bg-white/90 backdrop-blur-md border border-slate-200 rounded-xl shadow-xl p-3 flex items-center">
          Panel de Compartir
        </div>
      ),
    },
    {
      id: "help",
      icon: <HelpCircle size={18} />,
      label: "Ayuda",
      action: () => togglePanel("help"),
      active: activePanel === "help",
      panel: (
        <div className="flex w-auto max-w-xs sm:max-w-sm h-auto min-h-[4rem] bg-white/90 backdrop-blur-md border border-slate-200 rounded-2xl shadow-xl p-3 sm:p-4 items-center transition-all">
          <HelpPanel />
        </div>
      ),
    },
  ];

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error al activar Fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className="absolute top-24 left-4 z-50 flex flex-col gap-2">
      {/* Container principal de la barra */}
      <div className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-xl shadow-xl p-1 sm:p-1.5 flex flex-col gap-1">
        {tools.map((tool) => (
          <div key={tool.id} className="relative flex items-center">
            {/* BOTÓN DE LA HERRAMIENTA */}
            <button
              onClick={tool.action}
              title={tool.label}
              className={`p-1.5 sm:p-2.5 rounded-lg transition-all duration-200 group flex items-center justify-center ${
                tool.active
                  ? tool.activeClass || "bg-slate-100 text-black"
                  : " text-slate-600 hover:bg-slate-100 hover:text-black"
              }`}
            >
              <div className="scale-85 sm:scale-100 flex items-center justify-center">
                {tool.icon}
              </div>

              {/* Tooltip con el nombre */}
              <span className="hidden sm:block absolute left-full ml-3 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-md z-50">
                {tool.label}
              </span>
            </button>

            {/* PANEL ALINEADO AL MISMO NIVEL DEL BOTÓN */}
            {tool.active && tool.panel && (
              <div className="absolute left-full ml-4 z-50 animate-in fade-in slide-in-from-left-2 whitespace-nowrap">
                {tool.panel}
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={toggleFullScreen}
        className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-xl shadow-lg p-2 sm:p-3 text-slate-600 hover:text-black hover:bg-slate-50 transition-colors flex items-center justify-center"
        title="Pantalla Completa"
      >
        <div className="scale-85 sm:scale-100 flex items-center justify-center">
          <Maximize size={18} />
        </div>
      </button>
    </div>
  );
};

export default Toolbar;
