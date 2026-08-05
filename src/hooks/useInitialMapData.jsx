import { useState, useEffect } from "react";
import { fetchInitialMapData } from "../services/mapDataService";

export function useInitialMapData() {
  const [communities, setCommunities] = useState([]);
  const [fullFeatures, setFullFeatures] = useState([]);
  const [initialGlobalData, setInitialGlobalData] = useState(null);
  const [selectedData, setSelectedData] = useState(null);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    async function init() {
      setLoadingData(true);
      try {
        const { mapFeatures, communities, globalTotals } = await fetchInitialMapData();
        setFullFeatures(mapFeatures);
        setCommunities(communities);
        setInitialGlobalData(globalTotals);
        setSelectedData(globalTotals);
      } catch (error) {
        console.error(" Error inicializando datos:", error);
      } finally {
        setLoadingData(false);
      }
    }
    init();
  }, []);

  return {
    communities,
    fullFeatures,
    initialGlobalData,
    selectedData,
    setSelectedData,
    loadingData,
  };
}