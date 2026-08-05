import React from "react";
import { Info, ExternalLink } from "lucide-react";

export const HelpPanel = () => {
  return (
    <div className="w-full max-w-sm  rounded-2xl p-5 text-slate-700 space-y-4">
      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
        <div className="p-2  text-blue-600 rounded-xl shrink-0">
          <Info className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-slate-800 leading-tight">
            Acerca del Proyecto
          </h3>
          <p className="text-[11px] text-slate-400 font-medium">
            Información y Créditos
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          Desarrollado por
        </span>
        <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
          <span>Elias Mendez</span>
        </div>

        <div className="flex flex-col gap-1.5 pt-1">
          <a
            href="https://www.linkedin.com/in/eliasgeodev"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-2 rounded-lg  hover:bg-blue-50/80 hover:text-blue-600 text-xs text-slate-600 font-medium transition-colors group"
          >
            <span>LinkedIn</span>
            <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0" />
          </a>

          <a
            href="https://eliasgeodev.sinekasur.site/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-2 rounded-lg hover:bg-emerald-50/80 hover:text-emerald-600 text-xs text-slate-600 font-medium transition-colors group"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="truncate">Portafolio / Sitio Web</span>
            </div>
            <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 transition-colors shrink-0" />
          </a>
        </div>
      </div>

      {/* Disclaimer con wrapping forzado */}
      <div className="p-3  rounded-xl space-y-1.5 text-xs text-slate-600 w-full">
        <div className="flex items-center gap-1.5 font-semibold text-slate-700">
          <span>Aviso sobre los datos</span>
        </div>
        <p className="text-[11px] leading-normal text-slate-500 whitespace-normal break-words block w-full">
          Esta plataforma fue creada únicamente como una <strong className="font-semibold text-slate-700">herramienta de aporte a la visualización de datos</strong>. Los datos presentados son públicos y pertenecen al <strong className="font-semibold text-slate-700">INEGI</strong>; no soy propietario de la información.
        </p>
      </div>
    </div>
  );
};