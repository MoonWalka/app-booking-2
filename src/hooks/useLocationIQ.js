// src/hooks/useLocationIQ.js
import { useState, useEffect, useCallback } from 'react';
import { getRemoteConfig, getValue } from "firebase/remote-config";
import { initializeRemoteConfig } from '../firebase';

// Hook personnalisé pour utiliser l'API LocationIQ
export function useLocationIQ() {
  const [apiKey, setApiKey] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Cache des requêtes
  const [requestCache, setRequestCache] = useState({});
  
  // Détecter l'environnement
  const isEmulator = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';
  
  // Initialiser Remote Config et récupérer la clé API
  useEffect(() => {
    const loadApiKey = async () => {
      try {
        setIsLoading(true);
        
        if (isEmulator) {
          // En développement, utiliser la clé de l'environnement local
          console.log("Mode développement: utilisation de la clé API locale");
          const devKey = process.env.REACT_APP_LOCATIONIQ_API_KEY;
          if (devKey) {
            setApiKey(devKey);
            console.log("Clé API développement définie avec succès");
          } else {
            throw new Error("Clé API LocationIQ non définie en développement");
          }
        } else {
          // En production, utiliser Remote Config
          const remoteConfig = await initializeRemoteConfig();
          
          if (remoteConfig) {
            const key = getValue(remoteConfig, "locationiq_api_key").asString();
            if (key) {
              setApiKey(key);
            } else {
              throw new Error("Clé API non trouvée dans Remote Config");
            }
          } else {
            throw new Error("Impossible d'initialiser Remote Config");
          }
        }
      } catch (err) {
        console.error("Erreur de chargement de la clé API:", err);
        setError(err.message);
        
        // Essayer d'utiliser la clé de secours
        const backupKey = process.env.REACT_APP_LOCATIONIQ_API_KEY;
        if (backupKey) {
          console.log("Utilisation de la clé API de secours");
          setApiKey(backupKey);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadApiKey();
  
    // Log supplémentaire pour vérifier l'état
    console.log("useLocationIQ hook initialisé, isEmulator:", isEmulator);
  }, [isEmulator]);
  
  // Fonction pour générer un identifiant de cache
  const getCacheKey = useCallback((query) => {
    const timestamp = Math.floor(Date.now() / (30 * 1000)); // Change toutes les 30 secondes
    return `${query}_${timestamp}`;
  }, []);
  
  // Fonction pour chercher des adresses
  const searchAddress = useCallback(async (query) => {
    console.log("searchAddress appelée avec:", query, "apiKey présente:", !!apiKey);
    
    if (!query || query.length < 3 || !apiKey) {
      console.log("Conditions non remplies pour la recherche:", {
        queryLength: query?.length || 0,
        apiKeyPresente: !!apiKey
      });
      return [];
    }
    
    try {
      // Vérifier le cache
      const cacheKey = getCacheKey(query);
      if (requestCache[cacheKey]) {
        console.log("Résultats trouvés en cache pour:", query);
        return requestCache[cacheKey];
      }
      
      // Log de l'URL complète (masquer la clé)
      const maskedKey = apiKey.substring(0, 6) + "..." + apiKey.substring(apiKey.length - 4);
      console.log("URL de requête:", `https://api.locationiq.com/v1/autocomplete.php?key=${maskedKey}&q=${encodeURIComponent(query)}&limit=5&countrycodes=fr...`);
      
      // Effectuer la requête si pas en cache
      const response = await fetch(
        `https://api.locationiq.com/v1/autocomplete.php?key=${apiKey}&q=${encodeURIComponent(query)}&limit=5&countrycodes=fr&tag=place:city,place:town,place:village,place:hamlet,amenity,building,highway&dedupe=1&accept-language=fr`
      );
      
      console.log("Statut de la réponse:", response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`Erreur API (${response.status}): ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Nombre de résultats obtenus:", Array.isArray(data) ? data.length : "Réponse non-array");
      
      // Vérifier la structure des données
      if (!Array.isArray(data)) {
        console.warn("Réponse inattendue de l'API:", data);
        return [];
      }
      
      // Mettre en cache
      setRequestCache(prev => ({
        ...prev,
        [cacheKey]: data
      }));
      
      return data;
    } catch (err) {
      console.error("Erreur lors de la recherche d'adresse:", err);
      
      // Essayons une autre méthode en cas d'échec (API Adresse du Gouvernement français)
      try {
        console.log("Tentative avec API-Adresse comme fallback");
        const fallbackResponse = await fetch(
          `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`
        );
        
        if (!fallbackResponse.ok) {
          throw new Error("Fallback API également en échec");
        }
        
        const govData = await fallbackResponse.json();
        console.log("Fallback API réussie, résultats:", govData.features?.length || 0);
        
        // Transformer le format pour correspondre à LocationIQ
        const transformedResults = govData.features.map(feature => ({
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
        
        return transformedResults;
      } catch (fallbackErr) {
        console.error("Erreur également avec l'API de fallback:", fallbackErr);
        return [];
      }
    }
  }, [apiKey, requestCache, getCacheKey]);
  
  
  // Fonction pour obtenir une URL de carte statique
  const getStaticMapUrl = useCallback((lat, lon, zoom = 15, width = 600, height = 300) => {
    if (!apiKey || !lat || !lon) return null;
    
    return `https://maps.locationiq.com/v3/staticmap?key=${apiKey}&center=${lat},${lon}&zoom=${zoom}&size=${width}x${height}&format=png&markers=icon:large-red-cutout|${lat},${lon}`;
  }, [apiKey]);
  
  return {
    isLoading,
    error,
    searchAddress,
    getStaticMapUrl
  };
}
