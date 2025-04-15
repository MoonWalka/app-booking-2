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
  }, [isEmulator]);
  
    // Fonction pour générer un identifiant de cache
    const getCacheKey = useCallback((query) => {
        const timestamp = Math.floor(Date.now() / (30 * 1000)); // Change toutes les 30 secondes
        return `${query}_${timestamp}`;
      }, []);
      
      // Fonction pour chercher des adresses
      const searchAddress = useCallback(async (query) => {
        if (!query || query.length < 3 || !apiKey) {
          return [];
        }
        
        try {
          // Vérifier le cache
          const cacheKey = getCacheKey(query);
          if (requestCache[cacheKey]) {
            return requestCache[cacheKey];
          }
          
          // Effectuer la requête si pas en cache
          const response = await fetch(
            `https://api.locationiq.com/v1/autocomplete.php?key=${apiKey}&q=${encodeURIComponent(query)}&limit=5&countrycodes=fr&tag=place:city,place:town,place:village,place:hamlet,amenity,building,highway&dedupe=1&accept-language=fr`
          );
          
          if (!response.ok) {
            throw new Error(`Erreur API (${response.status}): ${response.statusText}`);
          }
          
          const data = await response.json();
          
          // Mettre en cache
          setRequestCache(prev => ({
            ...prev,
            [cacheKey]: data
          }));
          
          return data;
        } catch (err) {
          console.error("Erreur lors de la recherche d'adresse:", err);
          return [];
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
    