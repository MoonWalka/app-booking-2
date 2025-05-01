import { useState, useEffect } from 'react';
import { useLocationIQ } from '@/hooks/useLocationIQ';

/**
 * Custom hook for address search functionality using LocationIQ API
 */
const useAddressSearch = (formData, handleChange) => {
  const { searchAddress, isSearching } = useLocationIQ();
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [isAddressFieldActive, setAddressFieldActive] = useState(false);

  // Search for addresses when formData.adresse changes
  useEffect(() => {
    const fetchAddressSuggestions = async () => {
      if (!formData.adresse || formData.adresse.length < 3 || !isAddressFieldActive) {
        setAddressSuggestions([]);
        return;
      }
      
      try {
        const suggestions = await searchAddress(formData.adresse);
        setAddressSuggestions(suggestions || []);
      } catch (error) {
        console.error('Erreur lors de la recherche d\'adresses:', error);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchAddressSuggestions();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.adresse, isAddressFieldActive, searchAddress]);

  /**
   * Handle address selection from suggestions
   */
  const handleSelectAddress = (suggestion) => {
    const event = {
      target: {
        name: 'adresse',
        value: suggestion.display_name.split(',')[0]
      }
    };
    handleChange(event);

    // Mettre à jour le code postal si disponible
    if (suggestion.address && suggestion.address.postcode) {
      handleChange({
        target: {
          name: 'codePostal',
          value: suggestion.address.postcode
        }
      });
    }

    // Mettre à jour la ville si disponible
    if (suggestion.address) {
      const city = suggestion.address.city || suggestion.address.town || suggestion.address.village || '';
      if (city) {
        handleChange({
          target: {
            name: 'ville',
            value: city
          }
        });
      }
    }

    // Mettre à jour le pays si disponible
    if (suggestion.address && suggestion.address.country) {
      handleChange({
        target: {
          name: 'pays',
          value: suggestion.address.country
        }
      });
    }

    setAddressSuggestions([]);
  };

  return {
    addressSuggestions,
    isSearchingAddress: isSearching,
    isAddressFieldActive,
    setAddressFieldActive,
    handleSelectAddress
  };
};

export default useAddressSearch;