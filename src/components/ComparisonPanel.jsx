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
    selectedData, // 👈 Se consume los datos globales de la zona seleccionada con clic en el mapa
  } = useMapInstance();

  const [dataA, setDataA] = useState(null);
  const [dataB, setDataB] = useState(null);
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);

  // ⚡ ESCUCHAR EL CLIC DEL MAPA:
  // Cada vez que cambia selectedData por un clic izquierdo en el mapa, actualizamos Zona A
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

  // Cálculo inline de porcentajes visuales de género
  const pctHombresA = totalA > 0 ? (hombresA / totalA) * 100 : 0;
  const pctMujeresA = totalA > 0 ? (mujeresA / totalA) * 100 : 0;
  const pctHombresB = totalB > 0 ? (hombresB / totalB) * 100 : 0;
  const pctMujeresB = totalB > 0 ? (mujeresB / totalB) * 100 : 0;

  return (
    <div className="w-full h-full font-sans flex flex-col bg-slate-50/50">
      {/* 1. CABECERA PREMIUM */}
      <div className="p-4 bg-white border-b border-slate-200/80 shrink-0 space-y-1 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="p-1 bg-indigo-50 text-indigo-600 rounded-md">
              <ArrowRightLeft className="w-4 h-4" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
              Modo Comparativa
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
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
            Análisis Frente a Frente
          </h2>
          <p className="text-xs text-slate-500">
            Compara indicadores demográficos en tiempo real
          </p>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 pt-1 text-xs text-indigo-500 font-medium animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            Consultando base de datos...
          </div>
        )}
      </div>

      {/* 2. CONTENIDO PRINCIPAL */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* RESUMEN DE BRECHA POBLACIONAL */}
        {selectedA && selectedB ? (
          <div className="p-3.5  to-slate-900 text-black rounded-2xl  space-y-2">
            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
              Diferencia Demográfica
            </span>
            
            <div className="flex items-baseline justify-between ">
              <span className="text-2xl font-black font-mono tracking-tight">
                {Math.abs(diffPoblacion).toLocaleString("es-MX")}
                <span className="text-xs font-normal text-slate-700 ml-1">hab.</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold text-slate-700">
                {diffPoblacion === 0 ? "0%" : `+${porcentajeMayor.toFixed(1)}%`}
              </span>
            </div>

            <p className="text-xs text-slate-700  t-2">
              {diffPoblacion === 0 ? (
                "Ambas regiones presentan exactamente la misma población."
              ) : (
                <>
                  <strong className="text-slate-700 font-semibold">
                    {diffPoblacion > 0 ? getNombre(selectedA) : getNombre(selectedB)}
                  </strong>{" "}
                  supera en población a la otra demarcación.
                </>
              )}
            </p>
          </div>
        ) : (
          <div className="p-3 bg-amber-50 border border-amber-200/60 rounded-xl text-xs text-amber-800 flex items-center gap-2.5">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              {!selectedA
                ? "Selecciona la primera zona en el mapa."
                : "Mantén presionado o da clic derecho en otra zona para compararla."}
            </span>
          </div>
        )}

        {/* COMPARACIÓN FRENTE A FRENTE (GRID 2 COLUMNAS) */}
        <div className="grid grid-cols-2 gap-3">
          
          {/* ZONA A */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 font-black text-[11px]">
                  Zona A
                </span>
                {selectedA && (
                  <button
                    onClick={() => setSelectedA(null)}
                    className="text-[10px] text-slate-400 hover:text-slate-600 hover:underline"
                  >
                    Limpiar
                  </button>
                )}
              </div>

              <h3 className="text-xs font-bold text-slate-800 uppercase line-clamp-2 min-h-[2rem]">
                {selectedA ? getNombre(selectedA) : "Sin Selección"}
              </h3>
            </div>

            {selectedA ? (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                {/* Total */}
                <div>
                  <span className="text-[10px] font-medium text-slate-400 uppercase block">Total</span>
                  <span className="text-sm font-extrabold font-mono text-slate-900">
                    {totalA.toLocaleString("es-MX")}
                  </span>
                </div>

                {/* Barra Desglose Género */}
                <div className="space-y-1">
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <div style={{ width: `${pctHombresA}%` }} className="bg-sky-500 h-full" />
                    <div style={{ width: `${pctMujeresA}%` }} className="bg-pink-500 h-full" />
                  </div>

                  <div className="space-y-1 pt-1">
                    {/* Hombres */}
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-sky-600 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-500" /> Homb.
                      </span>
                      <span className="font-mono font-bold text-slate-700">
                        {hombresA.toLocaleString("es-MX")}
                      </span>
                    </div>

                    {/* Mujeres */}
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-pink-600 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-pink-500" /> Muj.
                      </span>
                      <span className="font-mono font-bold text-slate-700">
                        {mujeresA.toLocaleString("es-MX")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Viviendas */}
                {vivA > 0 && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Home className="w-3 h-3" /> Viv.
                    </span>
                    <span className="font-mono font-semibold text-slate-700">
                      {vivA.toLocaleString("es-MX")}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-[11px] text-slate-400 italic">
                Toca una zona en el mapa
              </div>
            )}
          </div>

          {/* ZONA B */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-black text-[11px]">
                  Zona B
                </span>
                {selectedB && (
                  <button
                    onClick={() => setSelectedB(null)}
                    className="text-[10px] text-slate-400 hover:text-slate-600 hover:underline"
                  >
                    Limpiar
                  </button>
                )}
              </div>

              <h3 className="text-xs font-bold text-slate-800 uppercase line-clamp-2 min-h-[2rem]">
                {selectedB ? getNombre(selectedB) : "Sin Selección"}
              </h3>
            </div>

            {selectedB ? (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                {/* Total */}
                <div>
                  <span className="text-[10px] font-medium text-slate-400 uppercase block">Total</span>
                  <span className="text-sm font-extrabold font-mono text-slate-900">
                    {totalB.toLocaleString("es-MX")}
                  </span>
                </div>

                {/* Barra Desglose Género */}
                <div className="space-y-1">
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <div style={{ width: `${pctHombresB}%` }} className="bg-sky-500 h-full" />
                    <div style={{ width: `${pctMujeresB}%` }} className="bg-pink-500 h-full" />
                  </div>

                  <div className="space-y-1 pt-1">
                    {/* Hombres */}
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-sky-600 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-500" /> Homb.
                      </span>
                      <span className="font-mono font-bold text-slate-700">
                        {hombresB.toLocaleString("es-MX")}
                      </span>
                    </div>

                    {/* Mujeres */}
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-pink-600 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-pink-500" /> Muj.
                      </span>
                      <span className="font-mono font-bold text-slate-700">
                        {mujeresB.toLocaleString("es-MX")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Viviendas */}
                {vivB > 0 && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Home className="w-3 h-3" /> Viv.
                    </span>
                    <span className="font-mono font-semibold text-slate-700">
                      {vivB.toLocaleString("es-MX")}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-[11px] text-slate-400 italic">
                Selecciona con menú contextual
              </div>
            )}
          </div>

        </div>

      </div>

      {/* 3. PIE DE PÁGINA */}
      <div className="p-3 bg-white border-t border-slate-200/80 text-center shrink-0">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
          Visor Demográfico • Tabasco
        </span>
      </div>
    </div>
  );
}