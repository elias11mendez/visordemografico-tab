import { useState, useEffect } from "react";
import { useMapInstance } from "../context/MapContext";

function SearchBar() {
  const { mapRef, setSelectedCvegeo } = useMapInstance();
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [fullGeoJsonFeatures, setFullGeoJsonFeatures] = useState([]);

  useEffect(() => {
    async function fetchCommunities() {
      try {
        // 1. Descargamos el GeoJSON principal de los polígonos
        const response = await fetch("/comunidad_tabasco.geojson");
        const geojsonData = await response.json();
        const features = geojsonData.features || [];

        setFullGeoJsonFeatures(features);

        // 🗺️ Creamos el Set de control con los CVEGEO del GeoJSON en formato String
        const geojsonCvegeos = new Set(
          features
            .map((f) => f.properties?.CVEGEO || f.properties?.cvegeo)
            .filter(Boolean)
            .map(String),
        );

        // 2. Mapeamos la lista inicial de comunidades desde el GeoJSON
        const polygonList = features.map((feature) => ({
          cvegeo: String(feature.properties.CVEGEO),
          nomgeo: feature.properties.NOMGEO || "SIN NOMBRE",
          scope:
            feature.properties.AMBITO === "R"
              ? "RURAL"
              : feature.properties.AMBITO === "U"
                ? "URBANO"
                : feature.properties.AMBITO,
          isPoint: false, // 💡 Bandera útil por si necesitas saber en el buscador si es polígono o punto
        }));

        // 3. Descargamos el JSON de demografía dispersa
        const demoResponse = await fetch("/comunidad_demografia.json");
        const demoData = await demoResponse.json();

        // 4. Filtramos las localidades dispersas para dejar solo las que NO existen en el GeoJSON
        const uniqueDemoList = demoData
          .filter((record) => {
            const recordCvegeo = String(record.CVEGEO).trim();
            return !geojsonCvegeos.has(recordCvegeo);
          })
          .map((record) => ({
            cvegeo: String(record.CVEGEO),
            nomgeo: record.NOM_LOC || "SIN NOMBRE",
            // Homologamos los ámbitos para mantener consistencia en los textos de la barra de búsqueda
            scope:
              record.AMBITO === "R"
                ? "RURAL"
                : record.AMBITO === "U"
                  ? "URBANO"
                  : record.AMBITO,
            isPoint: true, // 💡 Bandera para identificar que es un pin
            // Guardamos las coordenadas para que al dar click en la barra, puedas hacer un flyTo directo
            coordinates: [Number(record.LAT_DECIMAL), Number(record.LONGITUD)], // [lng, lat] normalizado
          }));

        // 5. Unimos ambas listas en un solo array plano para el autocompletado
        const completeSearchList = [...polygonList, ...uniqueDemoList];

        // Ordenamos alfabéticamente por nombre para mejorar la experiencia de usuario en el buscador
        completeSearchList.sort((a, b) => a.nomgeo.localeCompare(b.nomgeo));

        setCommunities(completeSearchList);
      } catch (error) {
        console.error("Error loading communities for the search bar:", error);
      }
    }
    fetchCommunities();
  }, []);
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setResults([]);
      return;
    }

    // 1. Helper para limpiar acentos/tildes y dejar el texto "plano"
    const cleanText = (text) =>
      text
        .toLowerCase()
        .normalize("NFD") // Separa las letras de sus acentos (ej: "á" se vuelve "a" + "´")
        .replace(/[\u0300-\u036f]/g, ""); // Borra todos los acentos sueltos usando Regex

    // 2. Limpiamos la búsqueda del usuario y la dividimos en palabras clave
    const keywords = cleanText(searchQuery).split(" ");

    const filtered = communities.filter((community) => {
      // 3. Limpiamos también el nombre de la comunidad para la comparación
      const flatName = cleanText(community.nomgeo);

      // 4. Evaluamos que cada palabra clave exista en el nombre plano
      return keywords.every((keyword) => flatName.includes(keyword));
    });

    setResults(filtered.slice(0, 5));
  }, [searchQuery, communities]);
  const handleSelect = (community) => {
    setSearchQuery(community.nomgeo.toUpperCase());
    setResults([]);

    if (setSelectedCvegeo) setSelectedCvegeo(community.cvegeo);

    const map = mapRef.current;
    if (!map) return;

    // 📍 CASO 1: Si es una comunidad del nuevo JSON disperso (Punto Fijo)
    if (community.isPoint && community.coordinates) {
      map.flyTo({
        center: community.coordinates, // Ya viene ordenado como [longitud, latitud] desde el fetch
        zoom: 14, // Un zoom un poco más cerrado (14) funciona genial para pines aislados
        essential: true,
        speed: 1.2,
      });

      console.log(
        `🎯 [SEARCH FLYTO] Moved to Point Location: ${community.nomgeo}`,
      );
      return; // Cortamos la ejecución aquí para que no busque polígonos
    }

    // 🗺️ CASO 2: Si es una comunidad con geometría compleja (Polígonos del GeoJSON)
    const targetFeature = fullGeoJsonFeatures.find(
      (f) => String(f.properties.CVEGEO) === String(community.cvegeo),
    );

    if (targetFeature && targetFeature.geometry) {
      const geometry = targetFeature.geometry;
      let targetCenter = null;

      if (geometry.type === "Point") {
        targetCenter = geometry.coordinates;
      } else if (geometry.type === "Polygon") {
        // Tomamos el primer punto del anillo exterior del polígono
        targetCenter = geometry.coordinates[0][0];
      } else if (geometry.type === "MultiPolygon") {
        // Tomamos el primer punto del primer polígono de la colección
        targetCenter = geometry.coordinates[0][0][0];
      }

      if (targetCenter) {
        map.flyTo({
          center: targetCenter, // Le pasamos directamente el par [lng, lat] extraído
          zoom: 13,
          essential: true,
          speed: 1.2,
        });

        console.log(
          `🎯 [SEARCH FLYTO] Moved to Polygon Location: ${community.nomgeo}`,
        );
      }
    } else {
      console.warn(
        `⚠️ No se encontró geometría o datos espaciales para: ${community.nomgeo}`,
      );
    }
  };

  return (
    <>
      {/* 📱 MÓVIL: Centrado, 90% ancho, top-4. 💻 ESCRITORIO: Top-6, Left-6, Ancho Fijo 96 */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 md:top-6 md:left-6 md:translate-x-0 w-[90%] md:w-96 z-999 font-sans">
        {/* Input de Búsqueda Principal estilo Tabasco Travel UI */}
        <div className="relative flex items-center bg-white border border-slate-200/80 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.06)] focus-within:border-blue-600 transition-all duration-150 overflow-hidden">
          {/* Icono Lupa */}
          <div className="pl-4 text-slate-400/90 pointer-events-none">
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Input con texto en mayúsculas sutil mediante tracking */}
          <input
            type="text"
            className="w-full bg-transparent pl-3 pr-4 py-3.5 text-[11px] font-bold tracking-wider text-slate-700 placeholder-slate-400 focus:outline-none uppercase"
            placeholder="BUSCAR DESTINO O COMUNIDAD..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* Botón de limpiar transparente y limpio */}
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="p-1 mr-3 text-slate-400 hover:text-slate-600 rounded transition-colors"
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
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Menú desplegable de resultados */}
        {results.length > 0 && (
          /* 📱 En móviles limitamos la altura un poco más (max-h-48) para dejar espacio al teclado virtual */
          <ul className="mt-1 w-full bg-white border border-slate-200/80 rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.08)] max-h-48 md:max-h-60 overflow-y-auto divide-y divide-slate-100 z-[1000]">
            {results.map((community) => (
              <li key={community.cvegeo}>
                <button
                  onClick={() => handleSelect(community)}
                  className="group w-full text-left px-4 md:px-5 py-3 md:py-3.5 hover:bg-slate-50 transition-colors flex items-center justify-between"
                >
                  <div className="flex flex-col gap-0.5">
                    {/* Nombre de la comunidad en Mayúsculas */}
                    <span className="text-[11px] font-bold tracking-wider text-slate-700 group-hover:text-blue-600 transition-colors">
                      {community.nomgeo.toUpperCase()}
                    </span>
                    {/* Metadata técnica en gris claro tipo etiqueta */}
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                      CVEGEO:{" "}
                      <span className="font-mono text-slate-500 font-semibold">
                        {community.cvegeo}
                      </span>{" "}
                      • {community.scope}
                    </span>
                  </div>

                  {/* Flecha indicadora con el azul eléctrico de tu botón principal */}
                  <div className="text-blue-600 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

export default SearchBar;
