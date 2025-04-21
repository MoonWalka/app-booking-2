// src/hooks/useLocationIQ.js
import { useState, useEffect, useCallback } from 'react';
import { query, limit } from '@/firebase';


/**
 * Hook personnalisé pour la géolocalisation et l'autocomplétion d'adresse
 * Utilise l'API Adresse du gouvernement français (sans clé API)
 * et OpenStreetMap pour les cartes (sans clé API)
 */
export function useLocationIQ() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Cache des requêtes
  const [requestCache, setRequestCache] = useState({});
  
  // Initialisation
  useEffect(() => {
    console.log("Hook de géolocalisation initialisé");
    setIsLoading(false);
  }, []);
  
  // Fonction pour générer un identifiant de cache
  const getCacheKey = useCallback((query) => {
    const timestamp = Math.floor(Date.now() / (30 * 1000)); // Change toutes les 30 secondes
    return `${query}_${timestamp}`;
  }, []);
  
  /**
   * Recherche des adresses à partir d'un texte
   * Utilise l'API Adresse du gouvernement français
   * Ne nécessite pas de clé API
   */
  const searchAddress = useCallback(async (query) => {
    console.log("Recherche d'adresse pour:", query);
    
    if (!query || query.length < 3) {
      console.log("Requête trop courte");
      return [];
    }
    
    try {
      // Vérifier le cache pour éviter des requêtes inutiles
      const cacheKey = getCacheKey(query);
      if (requestCache[cacheKey]) {
        console.log("Utilisation des résultats en cache");
        return requestCache[cacheKey];
      }
      
      // Important: Ne pas modifier l'état isLoading ici pour éviter le sursaut de l'interface
      
      // Appel à l'API Adresse du gouvernement français
      const response = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`
      );
      
      if (!response.ok) {
        throw new Error(`Erreur API (${response.status}): ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Transformer les résultats au format attendu par l'application
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
      
      console.log(`${transformedResults.length} résultats trouvés`);
      
      // Mettre en cache les résultats
      setRequestCache(prev => ({
        ...prev,
        [cacheKey]: transformedResults
      }));
      
      return transformedResults;
    } catch (err) {
      console.error("Erreur lors de la recherche d'adresse:", err);
      setError(err.message);
      return [];
    }
  }, [getCacheKey, requestCache]);
  
  /**
   * Génère une URL pour afficher une carte statique d'OpenStreetMap
   * Ne nécessite pas de clé API
   */
  const getStaticMapUrl = useCallback((lat, lon, zoom = 15, width = 600, height = 300) => {
    // Solution sans clé API avec OpenStreetMap
    return `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lon}&zoom=${zoom}&size=${width}x${height}&markers=${lat},${lon}`;
  }, []);
  
  /**
   * Génère une URL pour un iframe OpenStreetMap
   * Ne nécessite pas de clé API
   */
  const getMapEmbedUrl = useCallback((lat, lon, zoom = 15) => {
    // URL pour intégrer OpenStreetMap dans un iframe
    return `https://www.openstreetmap.org/export/embed.html?bbox=${lon-0.01},${lat-0.01},${lon+0.01},${lat+0.01}&layer=mapnik&marker=${lat},${lon}`;
  }, []);
  
  /**
   * Génère une URL pour ouvrir OpenStreetMap dans un nouvel onglet
   * Ne nécessite pas de clé API
   */
  const getMapLinkUrl = useCallback((lat, lon, zoom = 15) => {
    return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=${zoom}/${lat}/${lon}`;
  }, []);
  
  return {
    isLoading,
    error,
    searchAddress,
    getStaticMapUrl,
    getMapEmbedUrl,
    getMapLinkUrl
  };
}
