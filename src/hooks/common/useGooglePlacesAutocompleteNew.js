// src/hooks/common/useGooglePlacesAutocompleteNew.js
import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Hook pour utiliser la nouvelle API Google Places (Autocomplete Suggestion)
 * Utilise les APIs recommandées par Google pour 2025+
 * 
 * @param {Object} options
 * @param {string} options.apiKey - Clé API Google
 * @param {string} options.language - Langue des résultats (défaut: 'fr')
 * @param {string} options.country - Pays pour restreindre les résultats (défaut: 'fr')
 * @param {string[]} options.types - Types de lieux à rechercher (défaut: ['address'])
 */
export function useGooglePlacesAutocompleteNew(options = {}) {
  const {
    apiKey = process.env.REACT_APP_GOOGLE_PLACES_API_KEY || process.env.REACT_APP_FIREBASE_API_KEY,
    language = 'fr',
    country = 'fr',
    types = ['address']
  } = options;

  const [predictions, setPredictions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiLoaded, setApiLoaded] = useState(false);
  
  const autocompleteToken = useRef(null);

  // Charger l'API Google Maps avec la nouvelle méthode
  useEffect(() => {
    if (!apiKey) {
      setError('Clé API Google manquante. Ajoutez REACT_APP_GOOGLE_PLACES_API_KEY ou REACT_APP_FIREBASE_API_KEY dans votre .env');
      return;
    }

    // Vérifier si l'API est déjà chargée
    if (window.google && window.google.maps && window.google.maps.places) {
      setApiLoaded(true);
      return;
    }

    // Créer le callback global pour l'initialisation
    window.initGooglePlaces = () => {
      setApiLoaded(true);
      delete window.initGooglePlaces;
    };

    // Charger l'API avec async et callback
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=${language}&callback=initGooglePlaces&loading=async`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      setError('Erreur lors du chargement de Google Maps API');
      delete window.initGooglePlaces;
    };
    
    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (window.initGooglePlaces) {
        delete window.initGooglePlaces;
      }
    };
  }, [apiKey, language]);

  /**
   * Rechercher des prédictions d'adresses avec la nouvelle API
   */
  const searchAddresses = useCallback(async (input) => {
    if (!input || input.length < 3) {
      setPredictions([]);
      return;
    }

    if (!apiLoaded) {
      setError('API Google Maps non encore chargée');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Créer un nouveau token de session si nécessaire
      if (!autocompleteToken.current) {
        autocompleteToken.current = new google.maps.places.AutocompleteSessionToken();
      }

      // Utiliser l'API REST directement (plus stable)
      const url = new URL('https://places.googleapis.com/v1/places:autocomplete');
      
      const requestBody = {
        input,
        sessionToken: autocompleteToken.current.toString(),
        languageCode: language,
        regionCode: country.toUpperCase(),
        includedPrimaryTypes: types
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'suggestions.placePrediction.place,suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transformer les suggestions en format compatible
      const formattedPredictions = (data.suggestions || []).map(suggestion => ({
        place_id: suggestion.placePrediction.placeId,
        description: suggestion.placePrediction.text.text,
        structured_formatting: {
          main_text: suggestion.placePrediction.structuredFormat?.mainText?.text || suggestion.placePrediction.text.text.split(',')[0],
          secondary_text: suggestion.placePrediction.structuredFormat?.secondaryText?.text || suggestion.placePrediction.text.text.split(',').slice(1).join(',')
        }
      }));

      setPredictions(formattedPredictions);
      setIsLoading(false);
    } catch (err) {
      console.error('Erreur recherche adresses:', err);
      setError(err.message);
      setPredictions([]);
      setIsLoading(false);
    }
  }, [apiLoaded, apiKey, country, language, types]);

  /**
   * Obtenir les détails d'une adresse avec la nouvelle API
   */
  const getPlaceDetails = useCallback(async (placeId) => {
    if (!apiLoaded) {
      throw new Error('API Google Maps non chargée');
    }

    try {
      // Utiliser l'API REST pour les détails
      const url = `https://places.googleapis.com/v1/places/${placeId}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'id,displayName,formattedAddress,location,addressComponents'
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
      }

      const place = await response.json();
      
      // Réinitialiser le token après utilisation
      autocompleteToken.current = null;
      
      // Parser les composants d'adresse
      const addressComponents = parseAddressComponents(place.addressComponents || []);
      
      return {
        placeId: place.id,
        formattedAddress: place.formattedAddress,
        latitude: place.location?.latitude,
        longitude: place.location?.longitude,
        ...addressComponents
      };
    } catch (err) {
      console.error('Erreur détails lieu:', err);
      throw err;
    }
  }, [apiLoaded, apiKey]);

  /**
   * Parser les composants d'adresse du nouveau format
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
      const types = component.types || [];
      const text = component.longText || component.shortText || '';
      
      if (types.includes('street_number')) {
        result.streetNumber = text;
      } else if (types.includes('route')) {
        result.streetName = text;
      } else if (types.includes('locality')) {
        result.city = text;
      } else if (types.includes('postal_code')) {
        result.postalCode = text;
      } else if (types.includes('administrative_area_level_2')) {
        result.department = text;
      } else if (types.includes('administrative_area_level_1')) {
        result.region = text;
      } else if (types.includes('country')) {
        result.country = text;
      }
    });

    // Construire l'adresse complète
    result.fullStreet = result.streetNumber && result.streetName
      ? `${result.streetNumber} ${result.streetName}`
      : result.streetName || '';

    return result;
  };

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
    clearPredictions,
    apiLoaded
  };
}

export default useGooglePlacesAutocompleteNew;