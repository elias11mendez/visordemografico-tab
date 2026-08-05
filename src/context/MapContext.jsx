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
    loadingAges,
    fetchAgesByCvegeo,
  } = useAgesData();

  // Escucha reactiva cuando cambia la selección de comunidad
  useEffect(() => {
    if (!selectedCvegeo) {
      if (initialGlobalData) setSelectedData(initialGlobalData);
      setSelectedAgesData(null);
      return;
    }

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
    setSelectedAgesData,
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
