// src/hooks/common/useGooglePlacesAutocomplete.js
import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Hook pour utiliser Google Places Autocomplete
 * Offre une meilleure précision que LocationIQ, surtout pour les adresses en France
 * 
 * Nécessite une clé API Google avec Places API activée
 * Limite gratuite : 28,500 requêtes par mois pour Autocomplete
 * 
 * @param {Object} options
 * @param {string} options.apiKey - Clé API Google (ou utiliser REACT_APP_GOOGLE_PLACES_API_KEY)
 * @param {string} options.language - Langue des résultats (défaut: 'fr')
 * @param {string} options.country - Pays pour restreindre les résultats (défaut: 'fr')
 * @param {string[]} options.types - Types de lieux à rechercher (défaut: ['address'])
 */
export function useGooglePlacesAutocomplete(options = {}) {
  const {
    apiKey = process.env.REACT_APP_GOOGLE_PLACES_API_KEY || process.env.REACT_APP_FIREBASE_API_KEY,
    language = 'fr',
    country = 'fr',
    types = ['address']
  } = options;

  const [predictions, setPredictions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const autocompleteService = useRef(null);
  const placesService = useRef(null);
  const sessionToken = useRef(null);

  // Initialiser les services Google
  useEffect(() => {
    if (!apiKey) {
      setError('Clé API Google manquante. Ajoutez REACT_APP_GOOGLE_PLACES_API_KEY ou REACT_APP_FIREBASE_API_KEY dans votre .env');
      return;
    }

    // Vérifier si le script est déjà en cours de chargement
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    
    if (existingScript) {
      // Le script existe déjà, attendre qu'il soit chargé
      if (window.google && window.google.maps) {
        initializeServices();
      } else {
        // Attendre le chargement
        existingScript.addEventListener('load', initializeServices);
        return () => {
          existingScript.removeEventListener('load', initializeServices);
        };
      }
    } else if (!window.google) {
      // Charger l'API Google Maps
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=${language}`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initializeServices();
      };
      script.onerror = () => {
        setError('Erreur lors du chargement de Google Maps API');
      };
      document.head.appendChild(script);
    } else {
      // Google est déjà chargé
      initializeServices();
    }
  }, [apiKey, language]);

  const initializeServices = () => {
    try {
      if (window.google && window.google.maps && window.google.maps.places) {
        // Vérifier que les classes sont disponibles
        if (!window.google.maps.places.AutocompleteService || 
            !window.google.maps.places.PlacesService ||
            !window.google.maps.places.AutocompleteSessionToken) {
          console.error('[useGooglePlacesAutocomplete] Classes Google Maps manquantes');
          setError('API Google Maps incomplète');
          return;
        }
        
        autocompleteService.current = new window.google.maps.places.AutocompleteService();
        placesService.current = new window.google.maps.places.PlacesService(
          document.createElement('div')
        );
        // Créer un nouveau token de session pour regrouper les requêtes
        sessionToken.current = new window.google.maps.places.AutocompleteSessionToken();
        
        console.log('[useGooglePlacesAutocomplete] Services Google Maps initialisés avec succès');
      } else {
        console.error('[useGooglePlacesAutocomplete] Google Maps API non disponible');
        setError('Google Maps API non disponible');
      }
    } catch (error) {
      console.error('[useGooglePlacesAutocomplete] Erreur lors de l\'initialisation:', error);
      setError('Erreur lors de l\'initialisation de Google Maps');
    }
  };

  /**
   * Rechercher des prédictions d'adresses
   */
  const searchAddresses = useCallback(async (input) => {
    if (!input || input.length < 3) {
      setPredictions([]);
      return;
    }

    if (!autocompleteService.current) {
      console.warn('[useGooglePlacesAutocomplete] Service non initialisé, tentative de réinitialisation');
      initializeServices();
      if (!autocompleteService.current) {
        setError('Service Google Places non disponible');
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    const request = {
      input,
      componentRestrictions: { country },
      types,
      language,
      sessionToken: sessionToken.current
    };

    try {
      autocompleteService.current.getPlacePredictions(request, (results, status) => {
        setIsLoading(false);
        
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          setPredictions(results);
        } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          setPredictions([]);
        } else {
          setError(`Erreur Google Places: ${status}`);
          setPredictions([]);
        }
      });
    } catch (err) {
      setIsLoading(false);
      setError(err.message);
      setPredictions([]);
    }
  }, [country, types, language]);

  /**
   * Obtenir les détails d'une adresse sélectionnée
   */
  const getPlaceDetails = useCallback(async (placeId) => {
    if (!placesService.current) {
      throw new Error('Service Google Places non initialisé');
    }

    return new Promise((resolve, reject) => {
      const request = {
        placeId,
        fields: [
          'address_components',
          'formatted_address',
          'geometry',
          'name',
          'place_id',
          'types'
        ],
        sessionToken: sessionToken.current
      };

      placesService.current.getDetails(request, (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
          // Créer un nouveau token après avoir utilisé l'ancien
          sessionToken.current = new window.google.maps.places.AutocompleteSessionToken();
          
          // Parser les composants d'adresse
          const addressComponents = parseAddressComponents(place.address_components);
          
          resolve({
            placeId: place.place_id,
            formattedAddress: place.formatted_address,
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng(),
            ...addressComponents
          });
        } else {
          reject(new Error(`Erreur lors de la récupération des détails: ${status}`));
        }
      });
    });
  }, []);

  /**
   * Parser les composants d'adresse Google
   */
  const parseAddressComponents = (components) => {
    const result = {
      streetNumber: '',
      streetName: '',
      city: '',
      postalCode: '',
      department: '',
      region: '',
      country: 'France'
    };

    components.forEach(component => {
      const types = component.types;
      
      if (types.includes('street_number')) {
        result.streetNumber = component.long_name;
      } else if (types.includes('route')) {
        result.streetName = component.long_name;
      } else if (types.includes('locality')) {
        result.city = component.long_name;
      } else if (types.includes('postal_code')) {
        result.postalCode = component.long_name;
      } else if (types.includes('administrative_area_level_2')) {
        result.department = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        result.region = component.long_name;
      } else if (types.includes('country')) {
        result.country = component.long_name;
      }
    });

    // Construire l'adresse complète
    result.fullStreet = result.streetNumber && result.streetName
      ? `${result.streetNumber} ${result.streetName}`
      : result.streetName || '';

    return result;
  };

  /**
   * Réinitialiser les prédictions
   */
  const clearPredictions = useCallback(() => {
    setPredictions([]);
    setError(null);
  }, []);

  return {
    predictions,
    isLoading,
    error,
    searchAddresses,
    getPlaceDetails,
    clearPredictions
  };
}

export default useGooglePlacesAutocomplete;