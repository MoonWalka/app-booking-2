import { useState, useRef, useEffect } from 'react';
import { useLocationIQ } from '@/hooks/useLocationIQ';

/**
 * Custom hook to handle address search and suggestions
 * @param {Object} formData - The form data containing the address
 * @param {Function} updateFormData - Function to update the form data
 * @returns {Object} Functions and state for address search and suggestions
 */
export const useAddressSearch = (formData, updateFormData) => {
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [addressFieldActive, setAddressFieldActive] = useState(false);
  
  const addressTimeoutRef = useRef(null);
  const addressInputRef = useRef(null);
  const suggestionsRef = useRef(null);
  
  // Use LocationIQ hook
  const { isLoading: isApiLoading, error: apiError, searchAddress } = useLocationIQ();
  
  // Effect for address search
  useEffect(() => {
    // Clear previous timeout
    if (addressTimeoutRef.current) {
      clearTimeout(addressTimeoutRef.current);
    }
    
    const handleSearch = async () => {
      if (!formData.adresse || formData.adresse.length < 3 || isApiLoading) {
        setAddressSuggestions([]);
        return;
      }
      
      setIsSearchingAddress(true);
      
      try {
        // Call the hook function
        const results = await searchAddress(formData.adresse);
        setAddressSuggestions(results || []);
      } catch (error) {
        console.error("Error during address search:", error);
        setAddressSuggestions([]);
      } finally {
        setIsSearchingAddress(false);
      }
    };
    
    // Only perform the search if the field is active, address has at least 3 characters and not loading
    if (addressFieldActive && formData.adresse && formData.adresse.length >= 3 && !isApiLoading) {
      addressTimeoutRef.current = setTimeout(handleSearch, 300);
    } else {
      setAddressSuggestions([]);
    }
    
    return () => {
      if (addressTimeoutRef.current) {
        clearTimeout(addressTimeoutRef.current);
      }
    };
  }, [formData.adresse, isApiLoading, searchAddress, addressFieldActive]);

  /**
   * Handle selection of an address from suggestions
   * @param {Object} address - The selected address
   */
  const handleSelectAddress = (address) => {
    let codePostal = '';
    let ville = '';
    let adresse = '';
    
    // Extract address components
    if (address.address) {
      // Extract postal code
      codePostal = address.address.postcode || '';
      
      // Extract city
      ville = address.address.city || address.address.town || address.address.village || '';
      
      // Build street address
      const houseNumber = address.address.house_number || '';
      const road = address.address.road || '';
      adresse = `${houseNumber} ${road}`.trim();
    }
    
    // Update form with address information
    updateFormData({
      adresse: adresse || address.display_name.split(',')[0],
      codePostal,
      ville,
      latitude: address.lat,
      longitude: address.lon
    });
    
    // Close suggestions
    setAddressSuggestions([]);
  };

  return {
    addressSuggestions,
    isSearchingAddress,
    addressFieldActive,
    setAddressFieldActive,
    addressInputRef,
    suggestionsRef,
    handleSelectAddress,
    apiError
  };
};

export default useAddressSearch;