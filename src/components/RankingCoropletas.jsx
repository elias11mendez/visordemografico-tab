import React from "react";
import { useMapInstance } from "../context/MapContext";
import { Trophy, Users, X, MapPin } from "lucide-react";
import { MUNICIPIOS_AREA, TOTAL_TABASCO_KM2 } from "../services/municipiosArea";

export const RankingCoropletas = () => {
  const { poblacionMap, setSelectedCvegeo, setShowCoropletas } = useMapInstance();

  const handleClose = () => {
    if (setSelectedCvegeo) setSelectedCvegeo(null);
    if (setShowCoropletas) setShowCoropletas(false);
  };

  // 1. Obtener total general del estado (Población)
  const totalPoblacionEntidad = React.useMemo(() => {
    if (!poblacionMap) return 0;
    const estadoItem = Object.entries(poblacionMap).find(
      ([cve, datos]) =>
        cve === "27000" ||
        cve === "27" ||
        String(datos?.nombre).toLowerCase().includes("total")
    );
    if (estadoItem) return Number(estadoItem[1]?.poblacion) || 0;

    return Object.entries(poblacionMap)
      .filter(([cve]) => cve !== "27000" && cve !== "27")
      .reduce((acc, [, datos]) => acc + (Number(datos?.poblacion) || 0), 0);
  }, [poblacionMap]);

  // 2. CONCATENAR Ranking de Población + Superficie (km²) por CVEGEO
  const rankingUnificado = React.useMemo(() => {
    if (!poblacionMap || typeof poblacionMap !== "object") return [];

    return Object.entries(poblacionMap)
      .filter(
        ([cvegeo, datos]) =>
          cvegeo !== "27000" &&
          cvegeo !== "27" &&
          !String(datos?.nombre).toLowerCase().includes("total")
      )
      .map(([cvegeo, datos]) => {
        const poblacion = Number(datos?.poblacion) || 0;
        const infoArea = MUNICIPIOS_AREA[cvegeo] || {};
        const km2 = Number(infoArea.km2) || 0;
        const densidad = km2 > 0 ? (poblacion / km2).toFixed(1) : 0;

        return {
          cvegeo,
          nombre: String(datos?.nombre || infoArea.nombre || "Municipio no identificado"),
          poblacion,
          km2,
          densidad,
        };
      })
      .sort((a, b) => b.poblacion - a.poblacion); // Ordenado por mayor población
  }, [poblacionMap]);

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-white text-slate-800 p-4 overflow-y-auto">
      {/* Header del Panel */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-slate-600 shrink-0" />
          <h2 className="font-bold text-sm text-slate-800 uppercase tracking-wide">
            Ranking Municipal
          </h2>
        </div>

        <button
          type="button"
          onClick={handleClose}
          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          title="Cerrar panel"
          aria-label="Cerrar panel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {rankingUnificado.length > 0 ? (
        <div className="space-y-3">
          {/* 📊 TARJETA DE TOTAL GENERAL DEL ESTADO */}
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
            <div>
              <span className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                Entidad
              </span>
              <span className="text-xs font-bold text-slate-800">
                ESTADO DE TABASCO
              </span>
            </div>

            <div className="text-right">
              <div className="flex items-center justify-end gap-1 font-mono text-xs font-bold text-slate-700">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>{totalPoblacionEntidad.toLocaleString("es-MX")} hab.</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">
                {TOTAL_TABASCO_KM2 ? TOTAL_TABASCO_KM2.toLocaleString("es-MX") : "24,738"} km²
              </span>
            </div>
          </div>

          {/* 🏆 LISTA CONCATENADA */}
          <div className="space-y-2">
            {rankingUnificado.map((item, index) => {
              const posicion = index + 1;

              return (
                <div
                  key={item.cvegeo}
                  onClick={() => setSelectedCvegeo && setSelectedCvegeo(item.cvegeo)}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all cursor-pointer group"
                >
                  {/* Posición y Nombre del Municipio */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                        posicion === 1
                          ? "bg-amber-100 text-amber-700 border border-amber-300"
                          : posicion === 2
                          ? "bg-slate-200 text-slate-700"
                          : posicion === 3
                          ? "bg-amber-800/10 text-amber-900"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {posicion}
                    </span>

                    <div className="truncate">
                      <span className="block text-xs font-semibold text-slate-700 group-hover:text-blue-600 truncate">
                        {item.nombre}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {item.densidad} hab/km²
                      </span>
                    </div>
                  </div>

                  {/* Datos Concatenados: Población y Superficie */}
                  <div className="text-right shrink-0">
                    <div className="flex items-center justify-end gap-1 text-xs font-bold text-slate-800">
                      <Users className="w-3 h-3 text-slate-400" />
                      <span>{item.poblacion.toLocaleString("es-MX")}</span>
                    </div>
                    <div className="flex items-center justify-end gap-1 text-[10px] font-medium text-slate-400">
                      <MapPin className="w-2.5 h-2.5 text-slate-400" />
                      <span>{item.km2.toLocaleString("es-MX")} km²</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-xs text-slate-400">
          Cargando datos de municipios...
        </div>
      )}
    </div>
  );
};