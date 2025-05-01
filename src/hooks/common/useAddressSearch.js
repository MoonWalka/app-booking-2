import { useState, useEffect, useRef } from 'react';
import useLocationIQ from './useLocationIQ';

/**
 * useAddressSearch - Hook personnalisé pour gérer la recherche et la sélection d'adresses
 * Utilise l'API LocationIQ pour rechercher des adresses et gérer leur sélection
 * 
 * @param {Object} initialAddress - Adresse initiale (optionnel)
 * @param {Function} onAddressChange - Callback appelé quand l'adresse sélectionnée change (optionnel)
 * @returns {Object} - État et fonctions pour gérer la recherche et la sélection d'adresses
 */
const useAddressSearch = (initialAddress = null, onAddressChange = null) => {
  // État pour le terme de recherche
  const [searchTerm, setSearchTerm] = useState('');
  
  // État pour l'adresse sélectionnée
  const [selectedAddress, setSelectedAddress] = useState(initialAddress);
  
  // État pour les résultats de recherche
  const [addressResults, setAddressResults] = useState([]);
  
  // État pour l'affichage des résultats
  const [showResults, setShowResults] = useState(false);
  
  // État pour indiquer si une recherche est en cours
  const [isSearching, setIsSearching] = useState(false);
  
  // Référence pour le menu déroulant des résultats
  const dropdownRef = useRef(null);
  
  // Hook pour utiliser l'API LocationIQ
  const { searchAddress } = useLocationIQ();

  // Effet pour gérer les clics en dehors du menu déroulant
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  // Effet pour déclencher la recherche lorsque le terme de recherche change
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.trim().length > 2) {
        handleSearch();
      } else if (searchTerm.trim().length === 0) {
        setAddressResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  // Effet pour notifier du changement d'adresse sélectionnée
  useEffect(() => {
    if (onAddressChange && selectedAddress) {
      onAddressChange(selectedAddress);
    }
  }, [selectedAddress, onAddressChange]);

  /**
   * Recherche des adresses via l'API LocationIQ
   */
  const handleSearch = async () => {
    if (searchTerm.trim().length < 3) return;

    setIsSearching(true);
    try {
      const results = await searchAddress(searchTerm);
      setAddressResults(results);
      setShowResults(true);
    } catch (error) {
      console.error("Erreur lors de la recherche d'adresses:", error);
      setAddressResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  /**
   * Sélectionne une adresse dans les résultats
   * @param {Object} address - L'adresse sélectionnée
   */
  const handleSelectAddress = (address) => {
    setSelectedAddress(address);
    setShowResults(false);
    setSearchTerm('');
  };

  /**
   * Supprime l'adresse sélectionnée
   */
  const handleRemoveAddress = () => {
    setSelectedAddress(null);
  };

  /**
   * Formate une adresse sous forme de texte
   * @param {Object} address - L'adresse à formater
   * @returns {string} - L'adresse formatée
   */
  const formatAddress = (address) => {
    if (!address) return '';
    
    const parts = [];
    
    if (address.address) {
      // Format standard de LocationIQ
      const { road, house_number, postcode, city, state, country } = address.address;
      
      if (road) {
        parts.push(`${house_number ? house_number + ' ' : ''}${road}`);
      }
      
      if (postcode || city) {
        parts.push(`${postcode ? postcode + ' ' : ''}${city || ''}`);
      }
      
      if (state) {
        parts.push(state);
      }
      
      if (country) {
        parts.push(country);
      }
    } else {
      // Format alternatif ou personnalisé
      if (address.street) {
        parts.push(address.street);
      }
      
      if (address.postalCode || address.city) {
        parts.push(`${address.postalCode ? address.postalCode + ' ' : ''}${address.city || ''}`);
      }
      
      if (address.region) {
        parts.push(address.region);
      }
      
      if (address.country) {
        parts.push(address.country);
      }
    }
    
    return parts.join(', ');
  };

  return {
    searchTerm,
    setSearchTerm,
    selectedAddress,
    setSelectedAddress,
    addressResults,
    showResults,
    setShowResults,
    isSearching,
    dropdownRef,
    handleSearch,
    handleSelectAddress,
    handleRemoveAddress,
    formatAddress
  };
};

export default useAddressSearch;