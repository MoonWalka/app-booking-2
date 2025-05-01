import { useState, useEffect, useRef } from 'react';
import { useLocationIQ } from '@/hooks/common/useLocationIQ';

/**
 * Hook to handle address search and selection
 */
export const useAddressSearch = (lieu, setLieu) => {
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [addressFieldActive, setAddressFieldActive] = useState(false);
  const addressTimeoutRef = useRef(null);
  const addressInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Use LocationIQ API
  const { isLoading, error, searchAddress } = useLocationIQ();

  // Log to verify hook is loaded
  useEffect(() => {
    console.log("useAddressSearch - hook LocationIQ chargé:", {
      isLoading,
      hasError: !!error,
      searchAddressFn: !!searchAddress
    });
    
    if (error) {
      console.error("Erreur hook LocationIQ:", error);
    }
  }, [isLoading, error, searchAddress]);

  // Effect for address search
  useEffect(() => {
    // Clear previous timeout
    if (addressTimeoutRef.current) {
      clearTimeout(addressTimeoutRef.current);
    }
    
    const handleSearch = async () => {
      console.log("handleSearch - état actuel:", {
        adresse: lieu.adresse,
        adresseLength: lieu.adresse?.length || 0,
        isLoading,
        isSearchingAddress,
        addressFieldActive
      });
      
      if (!lieu.adresse || lieu.adresse.length < 3 || isLoading) {
        console.log("Conditions non remplies pour la recherche");
        setAddressSuggestions([]);
        return;
      }
      
      setIsSearchingAddress(true);
      console.log("Recherche démarrée pour:", lieu.adresse);
      
      try {
        // Call the hook function
        const results = await searchAddress(lieu.adresse);
        console.log("Résultats de recherche reçus:", results?.length || 0);
        setAddressSuggestions(results || []);
      } catch (error) {
        console.error("Erreur lors de la recherche:", error);
        setAddressSuggestions([]);
      } finally {
        setIsSearchingAddress(false);
      }
    };
    
    // Only search if address field is active and address has at least 3 characters
    if (addressFieldActive && lieu.adresse && lieu.adresse.length >= 3 && !isLoading) {
      console.log("Planification de la recherche après délai");
      addressTimeoutRef.current = setTimeout(handleSearch, 300);
    } else {
      setAddressSuggestions([]);
    }
    
    return () => {
      if (addressTimeoutRef.current) {
        clearTimeout(addressTimeoutRef.current);
      }
    };
  }, [lieu.adresse, isLoading, searchAddress, addressFieldActive]);
  
  // Log to check suggestion state
  useEffect(() => {
    console.log("État des suggestions:", {
      count: addressSuggestions?.length || 0,
      isSearching: isSearchingAddress
    });
  }, [addressSuggestions, isSearchingAddress]);

  // Handle clicks outside address suggestion list
  useEffect(() => {
    const handleClickOutsideAddressSuggestions = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) && 
          addressInputRef.current && !addressInputRef.current.contains(event.target)) {
        setAddressSuggestions([]);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutsideAddressSuggestions);
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideAddressSuggestions);
    };
  }, []);

  // Select an address from suggestions
  const handleSelectAddress = (address) => {
    console.log("Adresse sélectionnée:", address);
    
    let codePostal = '';
    let ville = '';
    let pays = 'France';
    let adresse = '';
    
    // Extract address components
    if (address.address) {
      // Extract postal code
      codePostal = address.address.postcode || '';
      
      // Extract city
      ville = address.address.city || address.address.town || address.address.village || '';
      
      // Extract country
      pays = address.address.country || 'France';
      
      // Build street address
      const houseNumber = address.address.house_number || '';
      const road = address.address.road || '';
      adresse = `${houseNumber} ${road}`.trim();
    }
    
    // Update state with address information
    setLieu(prev => ({
      ...prev,
      adresse: adresse || address.display_name.split(',')[0],
      codePostal,
      ville,
      pays,
      latitude: address.lat,
      longitude: address.lon,
      display_name: address.display_name
    }));
    
    console.log("État du lieu mis à jour avec les coordonnées:", {
      lat: address.lat, 
      lon: address.lon
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
    handleSelectAddress
  };
};

export default useAddressSearch;
