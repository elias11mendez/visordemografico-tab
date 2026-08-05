import { useMapInstance } from "../context/MapContext";
import { useState, useEffect } from "react";
import { motion, useDragControls } from "framer-motion";
import { DemographyPanel } from "./DemographyPanel";
import { ComparisonPanel } from "./ComparisonPanel";
import { RankingCoropletas } from "./RankingCoropletas";

function AnalysisPanel() {
  const { compareMode, selectedB, setShowCoropletas, showCoropletas } =
    useMapInstance();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const dragControls = useDragControls();

  const startDrag = (event) => {
    if (isMobile) {
      dragControls.start(event);
    }
  };

  // Determinamos si el usuario activó la comparativa
  const isComparing = compareMode || Boolean(selectedB);

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-[999] w-full h-[75vh] md:h-screen md:top-0 md:right-0 md:left-auto md:w-96 bg-white border-t md:border-t-0 md:border-l border-slate-200/90 shadow-[-10px_0_30px_rgba(15,23,42,0.15)] font-sans flex flex-col rounded-t-3xl md:rounded-t-none overflow-hidden"
      animate={isMobile ? (isExpanded ? "expanded" : "collapsed") : "desktop"}
      variants={{
        collapsed: { y: "calc(100% - 220px)" },
        expanded: { y: "0%" },
        desktop: { y: "0%" },
      }}
      transition={{ type: "spring", damping: 25, stiffness: 250 }}
      drag={isMobile ? "y" : false}
      dragControls={dragControls}
      dragListener={false}
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.05}
      onDragEnd={(_, info) => {
        if (!isMobile) return;
        if (info.offset.y > 30 || info.velocity.y > 150) {
          setIsExpanded(false);
        } else if (info.offset.y < -30 || info.velocity.y < -150) {
          setIsExpanded(true);
        }
      }}
    >
      {/* 📱 HANDLE DE ARRASTRE PARA MÓVIL */}
      <div
        onPointerDown={startDrag}
        className="select-none touch-none md:touch-auto cursor-grab active:cursor-grabbing md:cursor-default bg-white rounded-t-3xl border-b border-slate-100 shrink-0"
      >
        <div
          className="flex md:hidden items-center justify-center py-2.5 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
        </div>
      </div>

      <div className="flex-1 min-h-0 relative flex flex-col">
        {isComparing ? (
          <ComparisonPanel />
        ) : showCoropletas ? (
          <RankingCoropletas />
        ) : (
          <DemographyPanel />
        )}
      </div>
    </motion.div>
  );
}

export default AnalysisPanel;
