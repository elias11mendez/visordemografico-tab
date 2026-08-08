import React from 'react';
import { useMapInstance } from "../context/MapContext";
import { PopulationPyramid } from "./PopulationPyramid";

export const DemographyPanel = () => {
  const { selectedData, loadingData, selectedCvegeo, setSelectedCvegeo } = useMapInstance();

  const total = Number(selectedData?.POB_TOTAL || 0);
  const hombres = Number(selectedData?.POB_MASCULINA || 0);
  const mujeres = Number(selectedData?.POB_FEMENINA || 0);
  const viviendas = Number(selectedData?.["TOTAL DE VIVIENDAS HABITADAS"] || 0);

  const pctMasculina = total > 0 ? Number(((hombres / total) * 100).toFixed(1)) : 0;
  const pctFemenina = total > 0 ? Number(((mujeres / total) * 100).toFixed(1)) : 0;

  return (
    <div className="w-full h-full font-sans flex flex-col bg-white">
      {/* 📌 CABECERA INFORMATIVA ESTÁTICA */}
      <div className="bg-white border-b border-slate-100 shrink-0 px-5 pb-3 pt-3 md:p-6">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1 pr-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100">
                {selectedData?.AMBITO || "ESTATAL"}
              </span>
              {selectedCvegeo ? (
                <span className="text-[9px] font-mono font-bold text-slate-400">
                  CVE: <span className="text-slate-600">{selectedCvegeo}</span>
                </span>
              ) : (
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  Consolidado
                </span>
              )}
            </div>

            <h2 className="text-base md:text-lg font-black tracking-tight text-slate-800 uppercase leading-snug">
              {loadingData
                ? "Cargando información..."
                : selectedData?.NOM_LOC || "Estado de Tabasco"}
            </h2>
          </div>

          {/* Botón Reset */}
          {selectedCvegeo && (
            <button
              onClick={() => setSelectedCvegeo(null)}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all duration-200 shrink-0"
              title="Restablecer a visión estatal"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* 📜 CONTENIDO PRINCIPAL (Con scroll interno nativo) */}
      <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-5 custom-scrollbar overscroll-contain">
        {loadingData ? (
          <div className="h-64 flex flex-col items-center justify-center gap-3 text-slate-400">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">
              Sincronizando Supabase...
            </span>
          </div>
        ) : selectedData ? (
          <>
            {/* 📊 KPI CARD: POBLACIÓN TOTAL */}
            <div className=" p-5 rounded-2xl text-white shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 block mb-0.5">
                  Población Total
                </span>
                <span className="text-3xl font-black tracking-tight text-black">
                  {total.toLocaleString("es-MX")}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">
                  Habitantes censados
                </span>
              </div>
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm text-blue-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>

            {/* 🚻 SECCIÓN GÉNERO */}
            <div className="bg-slate-50/70 border border-slate-100 p-4 rounded-2xl space-y-3">
              <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Distribución por Género
                </span>
                <span className="text-[10px] font-semibold text-slate-500">
                  {total > 0 ? "100%" : "0%"}
                </span>
              </div>

              {/* Barra Proporcional Segmentada */}
              <div className="w-full h-3 bg-slate-200/80 rounded-full overflow-hidden flex p-0.5 gap-0.5">
                <div
                  className="h-full bg-blue-600 rounded-l-full transition-all duration-500"
                  style={{ width: `${pctMasculina}%` }}
                />
                <div
                  className="h-full bg-pink-500 rounded-r-full transition-all duration-500"
                  style={{ width: `${pctFemenina}%` }}
                />
              </div>

              {/* Leyendas */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    <span className="text-[11px] font-bold text-slate-600">
                      Hombres
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-800 font-mono block leading-none">
                      {hombres.toLocaleString("es-MX")}
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium">
                      {pctMasculina}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-pink-500" />
                    <span className="text-[11px] font-bold text-slate-600">
                      Mujeres
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-800 font-mono block leading-none">
                      {mujeres.toLocaleString("es-MX")}
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium">
                      {pctFemenina}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 🔺 PIRÁMIDE DE POBLACIÓN */}
            <PopulationPyramid />

            {/* 🏔️ METADATOS TÉCNICOS */}
            <div className="space-y-3 pt-1">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block border-b border-slate-100 pb-2">
                Infraestructura e Indicadores
              </span>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 border border-slate-100 rounded-xl bg-slate-50/50">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">
                    Viviendas Habitadas
                  </span>
                  <span className="text-xs font-black text-slate-700 tracking-wide block mt-1">
                    {viviendas.toLocaleString("es-MX")}{" "}
                    <span className="text-[10px] text-slate-400 font-normal">hab.</span>
                  </span>
                </div>

                <div className="p-3 border border-slate-100 rounded-xl bg-slate-50/50">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">
                    Altitud Relativa
                  </span>
                  <span className="text-xs font-black text-slate-700 tracking-wide block mt-1">
                    {selectedData?.ALTITUD
                      ? typeof selectedData.ALTITUD === "number"
                        ? `${selectedData.ALTITUD} msnm`
                        : selectedData.ALTITUD
                      : "Variable"}
                  </span>
                </div>

                <div className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 col-span-2 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">
                      Clave Carta INEGI
                    </span>
                    <span className="text-xs font-mono font-bold text-blue-600 tracking-wide block mt-0.5">
                      {selectedData?.CVE_CARTA || "CONSOLIDADO REGIONAL"}
                    </span>
                  </div>
                  <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div>
           
          </div>
        )}
      </div>

      <div className="p-3 md:p-4 bg-slate-50/80 border-t border-slate-100 text-center shrink-0">
        <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">
          Tabasco Geográfico • Sistema de Análisis
        </span>
      </div>
    </div>
  );
};