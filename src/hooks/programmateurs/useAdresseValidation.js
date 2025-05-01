import { useState, useEffect } from 'react';
import { useLocationIQ } from '@/hooks/useLocationIQ';

const useAdresseValidation = (adresseData) => {
  const [isValidating, setIsValidating] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [validationMessage, setValidationMessage] = useState('');
  const { searchAddress } = useLocationIQ();

  // Monitor address changes to reset validation state
  useEffect(() => {
    if (adresseData) {
      // Reset validation state when address changes
      setSelectedSuggestion(null);
      setValidationMessage('');
    }
  }, [adresseData]);

  // Function to validate an address
  const validateAdresse = async (address, codePostal, ville, pays = 'France') => {
    setIsValidating(true);
    try {
      // Construct query from address components
      const query = `${address} ${codePostal} ${ville} ${pays}`.trim();
      if (!query || query.length < 5) {
        setSuggestions([]);
        setValidationMessage('Adresse incomplète');
        return false;
      }

      // Use LocationIQ to search for address
      const results = await searchAddress(query);
      
      if (results && results.length > 0) {
        setSuggestions(results);
        setValidationMessage('');
        return true;
      } else {
        setSuggestions([]);
        setValidationMessage('Aucune adresse trouvée. Veuillez vérifier l\'orthographe.');
        return false;
      }
    } catch (error) {
      console.error('Erreur lors de la validation de l\'adresse:', error);
      setSuggestions([]);
      setValidationMessage('Erreur lors de la validation de l\'adresse');
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  // Function to select a suggested address
  const selectSuggestion = (suggestion) => {
    setSelectedSuggestion(suggestion);
    
    // Extract address components
    return {
      adresse: suggestion.address?.road || suggestion.address?.pedestrian || '',
      codePostal: suggestion.address?.postcode || '',
      ville: suggestion.address?.city || suggestion.address?.town || suggestion.address?.village || '',
      pays: suggestion.address?.country || 'France',
      coordonnees: {
        lat: parseFloat(suggestion.lat) || 0,
        lng: parseFloat(suggestion.lon) || 0
      }
    };
  };

  // Function to format a full address
  const formatFullAddress = (adresseObj) => {
    if (!adresseObj) return '';
    
    const { adresse, codePostal, ville, pays } = adresseObj;
    return [
      adresse,
      `${codePostal} ${ville}`,
      pays !== 'France' ? pays : ''
    ].filter(Boolean).join(', ');
  };

  return {
    isValidating,
    suggestions,
    selectedSuggestion,
    validationMessage,
    validateAdresse,
    selectSuggestion,
    formatFullAddress
  };
};

export default useAdresseValidation;
