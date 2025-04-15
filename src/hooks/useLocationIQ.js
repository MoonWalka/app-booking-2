// src/hooks/useLocationIQ.js
import { useState, useEffect, useCallback } from 'react';

// Hook personnalisé pour utiliser l'API Adresse du gouvernement français
export function useLocationIQ() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Cache des requêtes
  const [requestCache, setRequestCache] = useState({});
  
  // Initialisation
  useEffect(() => {
    console.log("API Adresse du gouvernement français initialisée");
    setIsLoading(false);
  }, []);
  
  // Fonction pour générer un identifiant de cache
  const getCacheKey = useCallback((query) => {
    const timestamp = Math.floor(Date.now() / (30 * 1000)); // Change toutes les 30 secondes
    return `${query}_${timestamp}`;
  }, []);
  
  // Fonction pour rechercher des adresses
  const searchAddress = useCallback(async (query) => {
    console.log("searchAddress appelée avec:", query);
    
    if (!query || query.length < 3) {
      console.log("Requête trop courte");
      return [];
    }
    
    try {
      // Vérifier le cache
      const cacheKey = getCacheKey(query);
      if (requestCache[cacheKey]) {
        console.log("Résultats trouvés en cache");
        return requestCache[cacheKey];
      }
      
      setIsLoading(true);
      
      // Utiliser l'API Adresse du gouvernement français (pas besoin de clé API)
      console.log("Recherche d'adresse via API-Adresse");
      const response = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`
      );
      
      if (!response.ok) {
        throw new Error(`Erreur API (${response.status}): ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Résultats bruts:", data);
      
      // Transformer les résultats au format attendu par votre application
      const transformedResults = data.features.map(feature => ({
        place_id: feature.properties.id,
        display_name: feature.properties.label,
        lat: feature.geometry.coordinates[1],
        lon: feature.geometry.coordinates[0],
        address: {
          house_number: feature.properties.housenumber || '',
          road: feature.properties.street || '',
          postcode: feature.properties.postcode || '',
          city: feature.properties.city || '',
          country: 'France'
        }
      }));
      
      console.log("Résultats transformés:", transformedResults.length);
      
      // Mettre en cache
      setRequestCache(prev => ({
        ...prev,
        [cacheKey]: transformedResults
      }));
      
      return transformedResults;
    } catch (err) {
      console.error("Erreur lors de la recherche d'adresse:", err);
      setError(err.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [getCacheKey, requestCache]);
  
  // Fonction pour obtenir une URL de carte statique
  const getStaticMapUrl = useCallback((lat, lon, zoom = 15, width = 600, height = 300) => {
    // Utiliser une carte statique gratuite (OpenStreetMap via Stadia Maps)
    return `https://tiles.stadiamaps.com/static/osm_bright/${zoom}/${lat}/${lon}/${width}x${height}@2x.png?api_key=63b63f0e-cf35-4ff9-b2fc-ce00c49b5974`;
    
    // Autres options gratuites :
    // return `https://static-maps.yandex.ru/1.x/?lang=fr_FR&ll=${lon},${lat}&z=${zoom}&size=${width},${height}&l=map&pt=${lon},${lat},comma`;
    // return `https://www.mapquestapi.com/staticmap/v5/map?key=KEY&center=${lat},${lon}&zoom=${zoom}&size=${width},${height}`;
  }, []);
  
  return {
    isLoading,
    error,
    searchAddress,
    getStaticMapUrl
  };
}
