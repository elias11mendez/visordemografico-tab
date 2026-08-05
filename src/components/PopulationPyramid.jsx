import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { useMapInstance } from "../context/MapContext";

function formatPyramidData(data) {
  if (!data) return [];

  const safeNum = (v) => {
    if (v === null || v === undefined) return 0;
    const cleaned = String(v).trim();
    const parsed = Number(cleaned);
    return isNaN(parsed) || cleaned === "" ? 0 : parsed;
  };

  return [
    { group: "85+", hombres: safeNum(data.P_85YMAS_M), mujeres: safeNum(data.P_85YMAS_F) },
    { group: "75-84", hombres: safeNum(data.P_75A79_M) + safeNum(data.P_80A84_M), mujeres: safeNum(data.P_75A79_F) + safeNum(data.P_80A84_F) },
    { group: "65-74", hombres: safeNum(data.P_65A69_M) + safeNum(data.P_70A74_M), mujeres: safeNum(data.P_65A69_F) + safeNum(data.P_70A74_F) },
    { group: "55-64", hombres: safeNum(data.P_55A59_M) + safeNum(data.P_60A64_M), mujeres: safeNum(data.P_55A59_F) + safeNum(data.P_60A64_F) },
    { group: "45-54", hombres: safeNum(data.P_45A49_M) + safeNum(data.P_50A54_M), mujeres: safeNum(data.P_45A49_F) + safeNum(data.P_50A54_F) },
    { group: "35-44", hombres: safeNum(data.P_35A39_M) + safeNum(data.P_40A44_M), mujeres: safeNum(data.P_35A39_F) + safeNum(data.P_40A44_F) },
    { group: "25-34", hombres: safeNum(data.P_25A29_M) + safeNum(data.P_30A34_M), mujeres: safeNum(data.P_25A29_F) + safeNum(data.P_30A34_F) },
    { group: "15-24", hombres: safeNum(data.P_15A19_M) + safeNum(data.P_20A24_M), mujeres: safeNum(data.P_15A19_F) + safeNum(data.P_20A24_F) },
    { group: "5-14", hombres: safeNum(data.P_5A9_M) + safeNum(data.P_10A14_M), mujeres: safeNum(data.P_5A9_F) + safeNum(data.P_10A14_F) },
    { group: "0-4", hombres: safeNum(data.P_0A4_M), mujeres: safeNum(data.P_0A4_F) },
  ];
}

export function PopulationPyramid() {
  const { selectedAgesData, loadingAges, selectedCvegeo } = useMapInstance();

  const rawData = formatPyramidData(selectedAgesData);
  
  // Verificamos si realmente existen datos mayores a 0 para graficar
  const hasValidData = rawData.some((d) => d.hombres > 0 || d.mujeres > 0);

  const data = rawData.map((item) => ({
    ...item,
    hombresNeg: -item.hombres,
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 p-2.5 rounded-lg text-xs shadow-md text-slate-800">
          <p className="font-bold border-b border-slate-100 pb-1 mb-1 text-slate-500 uppercase tracking-wider text-[10px]">
            Edad: {label} años
          </p>
          <div className="space-y-1">
            <p className="font-semibold text-blue-600 flex justify-between gap-4">
              <span>Hombres:</span>
              <span>{Math.abs(payload[0]?.value || 0).toLocaleString()}</span>
            </p>
            <p className="font-semibold text-pink-500 flex justify-between gap-4">
              <span>Mujeres:</span>
              <span>{payload[1]?.value?.toLocaleString() || 0}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // ESTADO: Cargando
  if (loadingAges) {
    return (
      <div className="w-full bg-slate-50/50 rounded-2xl p-4 border border-slate-100 flex items-center justify-center h-52 text-xs text-slate-400 font-medium animate-pulse">
        Cargando gráfico de edades...
      </div>
    );
  }

  // ESTADO: No se ha seleccionado localidad
  if (!selectedCvegeo) {
    return (
      <div className="w-full bg-slate-50/50 rounded-2xl p-4 border border-slate-100 flex items-center justify-center h-52 text-xs text-slate-400 font-medium text-center">
        Selecciona una localidad en el mapa para ver su pirámide poblacional
      </div>
    );
  }

  // ESTADO: Localidad seleccionada PERO sin datos / reservada por INEGI
  if (!selectedAgesData || !hasValidData) {
    return (
      <div className="w-full bg-blue-50/50 rounded-2xl p-4 border border-blue-100 space-y-2">
        <div className="flex items-center gap-2 text-blue-700 font-bold text-[11px] uppercase tracking-wide">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span>Datos Reservados / Protegidos (INEGI)</span>
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
          El desglose por edades para esta comunidad se encuentra sujeto al{" "}
          <strong className="text-slate-700">Principio de Reserva Estadística del INEGI</strong>.
        </p>
        <p className="text-[10px] text-slate-500 leading-normal">
          En localidades muy pequeñas o con pocos habitantes, la información por grupos quinquenales se omite de los censos públicos para proteger la privacidad e identidad de los pobladores.
        </p>
      </div>
    );
  }

  // ESTADO: Con datos válidos para desplegar
  return (
    <div className="w-full bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Pirámide Poblacional
        </h3>
        <div className="flex items-center gap-3 text-[11px] font-semibold">
          <span className="flex items-center gap-1.5 text-blue-600">
            <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
            Hombres
          </span>
          <span className="flex items-center gap-1.5 text-pink-500">
            <span className="w-2 h-2 rounded-full bg-pink-500 inline-block" />
            Mujeres
          </span>
        </div>
      </div>

      {/* Gráfico */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            stackOffset="sign"
            margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
          >
            <XAxis type="number" hide />
            <YAxis
              dataKey="group"
              type="category"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500 }}
              width={45}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
            <ReferenceLine x={0} stroke="#cbd5e1" strokeWidth={1} />

            {/* Barras Hombres */}
            <Bar
              dataKey="hombresNeg"
              fill="#2563eb"
              stackId="a"
              radius={[3, 0, 0, 3]}
            />
            {/* Barras Mujeres */}
            <Bar
              dataKey="mujeres"
              fill="#ec4899"
              stackId="a"
              radius={[0, 3, 3, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}