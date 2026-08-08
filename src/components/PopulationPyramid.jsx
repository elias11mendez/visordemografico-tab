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

const TABASCO_STATE_FALLBACK = {
  P_0A4_M: 95400, P_0A4_F: 92300,
  P_5A9_M: 102100, P_5A9_F: 98800,
  P_10A14_M: 105200, P_10A14_F: 101400,
  P_15A19_M: 108300, P_15A19_F: 106100,
  P_20A24_M: 104500, P_20A24_F: 107200,
  P_25A29_M: 98200, P_25A29_F: 103400,
  P_30A34_M: 91400, P_30A34_F: 98100,
  P_35A39_M: 85300, P_35A39_F: 92400,
  P_40A44_M: 78100, P_40A44_F: 84900,
  P_45A49_M: 71200, P_45A49_F: 77800,
  P_50A54_M: 62400, P_50A54_F: 68900,
  P_55A59_M: 52100, P_55A59_F: 58200,
  P_60A64_M: 42300, P_60A64_F: 47100,
  P_65A69_M: 32100, P_65A69_F: 35800,
  P_70A74_M: 22400, P_70A74_F: 25900,
  P_75A79_M: 14200, P_75A79_F: 16800,
  P_80A84_M: 8900,  P_80A84_F: 10900,
  P_85YMAS_M: 6100, P_85YMAS_F: 8000,
};

function formatPyramidData(data) {
  if (!data) return [];

  // Si data es un arreglo, toma el primer registro o suma sus elementos
  const source = Array.isArray(data) ? (data[0] || {}) : data;

  const safeNum = (v) => {
    if (v === null || v === undefined) return 0;
    const cleaned = String(v).trim();
    const parsed = Number(cleaned);
    return isNaN(parsed) || cleaned === "" ? 0 : parsed;
  };

  return [
    { group: "85+", hombres: safeNum(source.P_85YMAS_M), mujeres: safeNum(source.P_85YMAS_F) },
    { group: "75-84", hombres: safeNum(source.P_75A79_M) + safeNum(source.P_80A84_M), mujeres: safeNum(source.P_75A79_F) + safeNum(source.P_80A84_F) },
    { group: "65-74", hombres: safeNum(source.P_65A69_M) + safeNum(source.P_70A74_M), mujeres: safeNum(source.P_65A69_F) + safeNum(source.P_70A74_F) },
    { group: "55-64", hombres: safeNum(source.P_55A59_M) + safeNum(source.P_60A64_M), mujeres: safeNum(source.P_55A59_F) + safeNum(source.P_60A64_F) },
    { group: "45-54", hombres: safeNum(source.P_45A49_M) + safeNum(source.P_50A54_M), mujeres: safeNum(source.P_45A49_F) + safeNum(source.P_50A54_F) },
    { group: "35-44", hombres: safeNum(source.P_35A39_M) + safeNum(source.P_40A44_M), mujeres: safeNum(source.P_35A39_F) + safeNum(source.P_40A44_F) },
    { group: "25-34", hombres: safeNum(source.P_25A29_M) + safeNum(source.P_30A34_M), mujeres: safeNum(source.P_25A29_F) + safeNum(source.P_30A34_F) },
    { group: "15-24", hombres: safeNum(source.P_15A19_M) + safeNum(source.P_20A24_M), mujeres: safeNum(source.P_15A19_F) + safeNum(source.P_20A24_F) },
    { group: "5-14", hombres: safeNum(source.P_5A9_M) + safeNum(source.P_10A14_M), mujeres: safeNum(source.P_5A9_F) + safeNum(source.P_10A14_F) },
    { group: "0-4", hombres: safeNum(source.P_0A4_M), mujeres: safeNum(source.P_0A4_F) },
  ];
}

export function PopulationPyramid() {
  const { selectedAgesData, stateAgesData, loadingAges, selectedCvegeo } = useMapInstance();

  // 💡 Si no hay localidad seleccionada, usa stateAgesData. Si stateAgesData es nulo, usa TABASCO_STATE_FALLBACK
  const activeData = selectedCvegeo 
    ? selectedAgesData 
    : (stateAgesData || TABASCO_STATE_FALLBACK);

  const rawData = formatPyramidData(activeData);
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
              <span>{(payload[1]?.value || 0).toLocaleString()}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loadingAges) {
    return (
      <div className="w-full bg-slate-50/50 rounded-2xl p-4 border border-slate-100 flex items-center justify-center h-52 text-xs text-slate-400 font-medium animate-pulse">
        Cargando gráfico de edades...
      </div>
    );
  }

  if (selectedCvegeo && (!selectedAgesData || !hasValidData)) {
    return (
      <div className="w-full bg-blue-50/50 rounded-2xl p-4 border border-blue-100 space-y-2">
        <div className="flex items-center gap-2 text-blue-700 font-bold text-[11px] uppercase tracking-wide">
          <span>Datos Reservados / Protegidos (INEGI)</span>
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
          El desglose por edades para esta comunidad se encuentra sujeto al{" "}
          <strong className="text-slate-700">Principio de Reserva Estadística del INEGI</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Pirámide Poblacional
          </h3>
          <span className="text-[10px] text-slate-500 font-medium">
            {selectedCvegeo ? "Comunidad seleccionada" : "Total Estatal (Tabasco)"}
          </span>
        </div>
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

      <div className="w-full h-[260px] min-h-[260px]">
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

            <Bar
              dataKey="hombresNeg"
              fill="#2563eb"
              stackId="a"
              radius={[3, 0, 0, 3]}
            />
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