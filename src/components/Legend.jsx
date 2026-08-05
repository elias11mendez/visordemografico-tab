import React from "react";
import { useMapInstance } from "../context/MapContext";

// Rangos estandarizados de población de Tabasco
const COROPLETA_RANGOS = [
  { label: "< 50k", color: "bg-blue-100 border-blue-200", text: "< 50 mil hab." },
  { label: "50k - 100k", color: "bg-blue-300 border-blue-400", text: "50k - 100k hab." },
  { label: "100k - 200k", color: "bg-blue-500 border-blue-600", text: "100k - 200k hab." },
  { label: "> 200k", color: "bg-indigo-900 border-indigo-950", text: "> 200 mil hab. (Centro)" },
];

export const Legend = () => {
  const { showCoropletas } = useMapInstance();

  return (
    <div className="absolute bottom-6 left-4 z-40 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-xl shadow-slate-900/10 p-3.5 min-w-[220px] transition-all duration-300">
      {showCoropletas ? (
        /* 📊 VISTA 2: Coropletas por Rangos Reales (Clasificación Discreta) */
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-100">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Población por Municipio
            </h4>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
          </div>

          {/* Bloques de color clasificados */}
          <div className="space-y-1.5">
            {COROPLETA_RANGOS.map((rango, idx) => (
              <div key={idx} className="flex items-center gap-2.5 group cursor-default">
                <div className={`w-3.5 h-3.5 rounded-[4px] border ${rango.color} shadow-xs shrink-0 transition-transform group-hover:scale-110`} />
                <span className="text-[11px] font-semibold text-slate-700 group-hover:text-slate-900">
                  {rango.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* 🔹 VISTA 1: Simbología Base */
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
            Simbología
          </h4>

          <div className="flex flex-col gap-2">
            {/* Ítem 1: Áreas urbanas densas */}
            <div className="flex items-center gap-2.5 group cursor-default">
              <div className="w-4 h-4 rounded-[5px] border-[1.5px] border-amber-500/80 bg-amber-100/60 shadow-xs shrink-0 transition-transform group-hover:scale-110" />
              <span className="text-xs font-semibold text-slate-700 transition-colors group-hover:text-slate-900 whitespace-nowrap">
                Áreas urbanas densas
              </span>
            </div>

            {/* Ítem 2: Áreas urbanas dispersas */}
            <div className="flex items-center gap-2.5 group cursor-default">
              <div className="w-4 h-4 rounded-full bg-emerald-400/80 shadow-xs shrink-0 transition-transform group-hover:scale-110" />
              <span className="text-xs font-semibold text-slate-700 transition-colors group-hover:text-slate-900 whitespace-nowrap">
                Áreas urbanas dispersas
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};