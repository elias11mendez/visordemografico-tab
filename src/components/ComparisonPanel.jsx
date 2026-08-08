import React, { useEffect, useState } from "react";
import { useMapInstance } from "../context/MapContext";
import { supabase } from "../config/supabaseClient";
import { X, Users, Info, Home, ArrowRightLeft, Sparkles } from "lucide-react";

export function ComparisonPanel() {
  const {
    selectedA,
    setSelectedA,
    selectedB,
    setSelectedB,
    setCompareMode,
    selectedData,
  } = useMapInstance();

  const [dataA, setDataA] = useState(null);
  const [dataB, setDataB] = useState(null);
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);

  // ⚡ ESCUCHAR EL CLIC DEL MAPA:
  useEffect(() => {
    if (selectedData) {
      setSelectedA(selectedData);
    }
  }, [selectedData, setSelectedA]);

  // 🔄 Fetch Demografía Zona A
  useEffect(() => {
    if (!selectedA) {
      setDataA(null);
      return;
    }

    if (selectedA.POB_TOTAL !== undefined || selectedA.pob_total !== undefined) {
      setDataA(selectedA);
      return;
    }

    const fetchDemografiaA = async () => {
      const cvegeo = selectedA.CVEGEO || selectedA.cvegeo;
      if (!cvegeo) return;

      setLoadingA(true);
      const { data, error } = await supabase
        .from("comunidades")
        .select("*")
        .eq("CVEGEO", cvegeo)
        .maybeSingle();

      if (data && !error) {
        setDataA({ ...selectedA, ...data });
      } else {
        setDataA(selectedA);
      }
      setLoadingA(false);
    };

    fetchDemografiaA();
  }, [selectedA]);

  // 🔄 Fetch Demografía Zona B
  useEffect(() => {
    if (!selectedB) {
      setDataB(null);
      return;
    }

    if (selectedB.POB_TOTAL !== undefined || selectedB.pob_total !== undefined) {
      setDataB(selectedB);
      return;
    }

    const fetchDemografiaB = async () => {
      const cvegeo = selectedB.CVEGEO || selectedB.cvegeo;
      if (!cvegeo) return;

      setLoadingB(true);
      const { data, error } = await supabase
        .from("comunidades")
        .select("*")
        .eq("CVEGEO", cvegeo)
        .maybeSingle();

      if (data && !error) {
        setDataB({ ...selectedB, ...data });
      } else {
        setDataB(selectedB);
      }
      setLoadingB(false);
    };

    fetchDemografiaB();
  }, [selectedB]);

  // Helpers de parsing
  const getNombre = (data) => {
    if (!data) return "";
    return data.NOMGEO || data.NOM_LOC || data.NOM_MUN || data.nombre || "Zona sin nombre";
  };

  const getNumero = (data, possibleKeys) => {
    if (!data) return 0;
    for (const key of possibleKeys) {
      if (data[key] !== undefined && data[key] !== null && data[key] !== "") {
        const cleanVal = String(data[key]).replace(/,/g, "").trim();
        const val = Number(cleanVal);
        if (!isNaN(val)) return val;
      }
    }
    return 0;
  };

  const keysTotal = ["POB_TOTAL", "pob_total", "POBTOT", "pobtot", "poblacion", "POBLACION"];
  const keysHombres = ["POB_MASCULINA", "pob_masculina", "POBHOG", "pobmas", "hombres", "HOMBRES"];
  const keysMujeres = ["POB_FEMENINA", "pob_femenina", "POBFEB", "pobmuj", "mujeres", "MUJERES"];
  const keysViviendas = ["TOTAL DE VIVIENDAS HABITADAS", "TVIVHAB", "viviendas", "VIVIENDAS"];

  const totalA = getNumero(dataA, keysTotal);
  const hombresA = getNumero(dataA, keysHombres);
  const mujeresA = getNumero(dataA, keysMujeres);
  const vivA = getNumero(dataA, keysViviendas);

  const totalB = getNumero(dataB, keysTotal);
  const hombresB = getNumero(dataB, keysHombres);
  const mujeresB = getNumero(dataB, keysMujeres);
  const vivB = getNumero(dataB, keysViviendas);

  const diffPoblacion = totalA - totalB;
  const porcentajeMayor =
    Math.min(totalA, totalB) > 0
      ? (Math.abs(diffPoblacion) / Math.min(totalA, totalB)) * 100
      : 0;

  const isLoading = loadingA || loadingB;

  // Cálculo de porcentajes
  const pctHombresA = totalA > 0 ? ((hombresA / totalA) * 100).toFixed(1) : "0.0";
  const pctMujeresA = totalA > 0 ? ((mujeresA / totalA) * 100).toFixed(1) : "0.0";
  const pctHombresB = totalB > 0 ? ((hombresB / totalB) * 100).toFixed(1) : "0.0";
  const pctMujeresB = totalB > 0 ? ((mujeresB / totalB) * 100).toFixed(1) : "0.0";

  return (
    <div className="w-full h-full font-sans flex flex-col bg-slate-50/40">
      {/* 1. CABECERA AL ESTILO DE LA IMAGEN */}
      <div className="p-5 bg-white border-b border-slate-100 shrink-0 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
              Análisis Comparativo
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Frente a Frente
            </span>
          </div>

          <button
            onClick={() => {
              setSelectedB(null);
              setCompareMode(false);
            }}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Cerrar Comparación"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">
            Comparativa de Zonas
          </h2>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 pt-1 text-xs text-blue-600 font-medium animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            Actualizando datos de regiones...
          </div>
        )}
      </div>

      {/* 2. CONTENIDO PRINCIPAL */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* TARJETA DE BRECHA POBLACIONAL / DIFERENCIA */}
        {selectedA && selectedB ? (
          <div className="bg-white p-4 rounded-[22px] border border-slate-100 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Diferencia Poblacional
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-50 text-blue-600">
                {diffPoblacion === 0 ? "0%" : `+${porcentajeMayor.toFixed(1)}%`}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                {Math.abs(diffPoblacion).toLocaleString("es-MX")}
              </span>
              <span className="text-xs font-semibold text-slate-400">Habitantes de brecha</span>
            </div>

            <p className="text-xs text-slate-500 font-medium leading-relaxed pt-1">
              {diffPoblacion === 0 ? (
                "Ambas regiones registran la misma cantidad de población."
              ) : (
                <>
                  <strong className="text-slate-800 font-bold">
                    {diffPoblacion > 0 ? getNombre(selectedA) : getNombre(selectedB)}
                  </strong>{" "}
                  concentra mayor densidad poblacional.
                </>
              )}
            </p>
          </div>
        ) : (
          <div className="p-3.5 bg-amber-50/70 border border-amber-200/50 rounded-2xl text-xs text-amber-800 flex items-center gap-3">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-medium">
              {!selectedA
                ? "Selecciona la primera zona en el mapa."
                : "Haz clic en otra zona para activar la comparación frente a frente."}
            </span>
          </div>
        )}

        {/* COMPARACIÓN FRENTE A FRENTE (ZONA A vs ZONA B) */}
        <div className="grid grid-cols-2 gap-3">

          {/* TARJETA ZONA A */}
          <div className="bg-white p-3.5 rounded-[22px] border border-slate-100 shadow-sm flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 font-black text-[10px] uppercase tracking-wider">
                  Zona A
                </span>
                {selectedA && (
                  <button
                    onClick={() => setSelectedA(null)}
                    className="text-[10px] text-slate-400 hover:text-slate-600 font-medium"
                  >
                    Limpiar
                  </button>
                )}
              </div>

              <h3 className="text-xs font-black text-slate-800 uppercase line-clamp-2 min-h-[2.2rem] leading-tight">
                {selectedA ? getNombre(selectedA) : "Sin Selección"}
              </h3>
            </div>

            {selectedA ? (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                {/* Población Total */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Población Total
                  </span>
                  <span className="text-lg font-black text-slate-900 tracking-tight">
                    {totalA.toLocaleString("es-MX")}
                  </span>
                </div>

                {/* Desglose Género */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Distribución
                  </span>

                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <div style={{ width: `${pctHombresA}%` }} className="bg-blue-600 h-full" />
                    <div style={{ width: `${pctMujeresA}%` }} className="bg-pink-500 h-full" />
                  </div>

                  {/* Cajas Hombres y Mujeres estilo Píldora */}
                  <div className="space-y-1.5">
                    <div className="bg-slate-50 p-2 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-600" />
                        <span className="text-[10px] font-bold text-slate-700">Hombres</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-slate-800 block">
                          {hombresA.toLocaleString("es-MX")}
                        </span>
                        <span className="text-[9px] text-slate-400 font-medium">{pctHombresA}%</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-2 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-pink-500" />
                        <span className="text-[10px] font-bold text-slate-700">Mujeres</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-slate-800 block">
                          {mujeresA.toLocaleString("es-MX")}
                        </span>
                        <span className="text-[9px] text-slate-400 font-medium">{pctMujeresA}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Viviendas */}
                {vivA > 0 && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Home className="w-3 h-3 text-slate-400" /> Viviendas
                    </span>
                    <span className="text-xs font-extrabold text-slate-800">
                      {vivA.toLocaleString("es-MX")}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-[11px] text-slate-400 italic">
                Selecciona la zona A
              </div>
            )}
          </div>

          {/* TARJETA ZONA B */}
          <div className="bg-white p-3.5 rounded-[22px] border border-slate-100 shadow-sm flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-black text-[10px] uppercase tracking-wider">
                  Zona B
                </span>
                {selectedB && (
                  <button
                    onClick={() => setSelectedB(null)}
                    className="text-[10px] text-slate-400 hover:text-slate-600 font-medium"
                  >
                    Limpiar
                  </button>
                )}
              </div>

              <h3 className="text-xs font-black text-slate-800 uppercase line-clamp-2 min-h-[2.2rem] leading-tight">
                {selectedB ? getNombre(selectedB) : "Sin Selección"}
              </h3>
            </div>

            {selectedB ? (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                {/* Población Total */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Población Total
                  </span>
                  <span className="text-lg font-black text-slate-900 tracking-tight">
                    {totalB.toLocaleString("es-MX")}
                  </span>
                </div>

                {/* Desglose Género */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Distribución
                  </span>

                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <div style={{ width: `${pctHombresB}%` }} className="bg-blue-600 h-full" />
                    <div style={{ width: `${pctMujeresB}%` }} className="bg-pink-500 h-full" />
                  </div>

                  {/* Cajas Hombres y Mujeres estilo Píldora */}
                  <div className="space-y-1.5">
                    <div className="bg-slate-50 p-2 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-600" />
                        <span className="text-[10px] font-bold text-slate-700">Hombres</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-slate-800 block">
                          {hombresB.toLocaleString("es-MX")}
                        </span>
                        <span className="text-[9px] text-slate-400 font-medium">{pctHombresB}%</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-2 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-pink-500" />
                        <span className="text-[10px] font-bold text-slate-700">Mujeres</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-slate-800 block">
                          {mujeresB.toLocaleString("es-MX")}
                        </span>
                        <span className="text-[9px] text-slate-400 font-medium">{pctMujeresB}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Viviendas */}
                {vivB > 0 && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Home className="w-3 h-3 text-slate-400" /> Viviendas
                    </span>
                    <span className="text-xs font-extrabold text-slate-800">
                      {vivB.toLocaleString("es-MX")}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-[11px] text-slate-400 italic">
                Selecciona la zona B
              </div>
            )}
          </div>

        </div>

      </div>

      {/* 3. PIE DE PÁGINA IDÉNTICO AL ORIGINAL */}
      <div className="p-3 bg-white border-t border-slate-100 text-center shrink-0">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          TABASCO GEOGRÁFICO • SISTEMA DE ANÁLISIS
        </span>
      </div>
    </div>
  );
}