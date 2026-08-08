import { createContext, useContext, useState, useRef, useEffect } from "react";
import { useInitialMapData } from "../hooks/useInitialMapData";
import { useAgesData } from "../hooks/useAgesData";

const MapContext = createContext();

export function MapProvider({ children }) {
  const mapRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [selectedCvegeo, setSelectedCvegeo] = useState(null);
  const [currentBasemap, setBasemap] = useState(null);

  // Modos de comparación
  const [selectedA, setSelectedA] = useState(null);
  const [selectedB, setSelectedB] = useState(null);
  const [compareMode, setCompareMode] = useState(false);
  const [showCoropletas, setShowCoropletas] = useState();

  const [poblacionMap, setPoblacionMap] = useState();

  // Custom Hooks encapsulados
  const {
    communities,
    fullFeatures,
    initialGlobalData,
    selectedData,
    setSelectedData,
    loadingData,
  } = useInitialMapData();

  const {
    selectedAgesData,
    setSelectedAgesData,
    stateAgesData, // 👈 Asegúrate de devolver esto desde tu hook useAgesData si ahí consultas el total estatal
    loadingAges,
    fetchAgesByCvegeo,
  } = useAgesData();

  // Escucha reactiva cuando cambia la selección de comunidad
  useEffect(() => {
    // CASO 1: No hay comunidad seleccionada -> Cargar Totales Estatales
    if (!selectedCvegeo) {
      if (initialGlobalData) setSelectedData(initialGlobalData);
      
      // Si tienes una clave genérica para el estado en Supabase (ej: '27' o '270000000000'), la solicitas:
      fetchAgesByCvegeo("27"); 
      return;
    }

    // CASO 2: Hay comunidad seleccionada -> Cargar datos específicos
    const cvegeoString = String(selectedCvegeo).trim();
    const localMatch = communities.find((c) => c.CVEGEO === cvegeoString);
    setSelectedData(localMatch || initialGlobalData);

    fetchAgesByCvegeo(cvegeoString);
  }, [
    selectedCvegeo,
    communities,
    initialGlobalData,
    fetchAgesByCvegeo,
    setSelectedData,
  ]);

  return (
    <MapContext.Provider
      value={{
        mapRef,
        mapInstance,
        setMapInstance,
        selectedCvegeo,
        setSelectedCvegeo,
        communities,
        fullFeatures,
        selectedData,
        selectedAgesData,
        stateAgesData, // 👈 ¡Ahora sí disponible para PopulationPyramid!
        loadingData,
        loadingAges,
        fetchAgesByCvegeo,
        currentBasemap,
        setBasemap,
        selectedA,
        setSelectedA,
        selectedB,
        setSelectedB,
        compareMode,
        setCompareMode,
        setShowCoropletas,
        showCoropletas,
        poblacionMap,
        setPoblacionMap,
      }}
    >
      {children}
    </MapContext.Provider>
  );
}

export const useMapInstance = () => useContext(MapContext);