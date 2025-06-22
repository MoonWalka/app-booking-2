import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocationIQ } from './useLocationIQ';

/**
 * useAddressSearch - Hook personnalisé consolidé pour gérer la recherche et la sélection d'adresses
 * Utilise l'API LocationIQ pour rechercher des adresses et gérer leur sélection
 * Version consolidée qui fusionne les fonctionnalités des différentes implémentations
 * 
 * @param {Object} options - Options pour le hook
 * @param {Object} options.initialAddress - Adresse initiale (optionnel)
 * @param {Function} options.onAddressChange - Callback appelé quand l'adresse change (optionnel)
 * @param {Object} options.formData - Données du formulaire contenant l'adresse (optionnel)
 * @param {Function} options.updateFormData - Fonction pour mettre à jour les données du formulaire (optionnel)
 * @returns {Object} - État et fonctions pour gérer la recherche et la sélection d'adresses
 */
const useAddressSearch = (options = {}) => {
  const {
    initialAddress = null,
    onAddressChange = null,
    formData = null, 
    updateFormData = null
  } = options;

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

  // État pour indiquer si le champ d'adresse est actif (pour le mode formData)
  const [addressFieldActive, setAddressFieldActive] = useState(false);
  
  // Référence pour le menu déroulant des résultats
  const dropdownRef = useRef(null);
  
  // Référence pour le champ d'adresse
  const addressInputRef = useRef(null);
  
  // Référence pour le délai de debounce
  const searchTimeoutRef = useRef(null);
  
  // Hook pour utiliser l'API LocationIQ
  const { searchAddress, error: apiError } = useLocationIQ();

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

  // Effet pour notifier du changement d'adresse sélectionnée
  useEffect(() => {
    if (onAddressChange && selectedAddress) {
      onAddressChange(selectedAddress);
    }
  }, [selectedAddress, onAddressChange]);

  // ✅ CORRECTION BOUCLE INFINIE: Référence stable pour handleSearch
  const handleSearchRef = useRef();
  
  /**
   * Recherche des adresses via l'API LocationIQ - CORRIGÉ: Sans dépendances circulaires
   */
  handleSearchRef.current = async () => {
    // Détermine le terme de recherche selon le mode d'utilisation
    const query = formData ? formData.adresse : searchTerm;
    
    if (!query || typeof query !== 'string' || query.trim().length < 3) {
      setIsSearching(false);
      return;
    }

    try {
      let results = await searchAddress(query);
      
      // ✅ RECHERCHE PROGRESSIVE: Si aucun résultat avec adresse complète, essayer sans le numéro
      if (results.length === 0 && /^\d+\s+/.test(query)) {
        const queryWithoutNumber = query.replace(/^\d+\s+/, '');
        if (queryWithoutNumber.trim().length >= 3) {
          console.log(`Aucun résultat pour "${query}", essai sans numéro: "${queryWithoutNumber}"`);
          results = await searchAddress(queryWithoutNumber);
        }
      }
      
      setAddressResults(results);
      setShowResults(true);
    } catch (error) {
      console.error("Erreur lors de la recherche d'adresses:", error);
      setAddressResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // ✅ CORRECTION BOUCLE INFINIE: useEffect sans dépendance circulaire
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if ((searchTerm && typeof searchTerm === 'string' && searchTerm.trim().length > 2) || 
        (formData?.adresse && typeof formData.adresse === 'string' && formData.adresse.trim().length > 2 && addressFieldActive)) {
      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(() => {
        handleSearchRef.current();
      }, 500);
    } else {
      setAddressResults([]);
      setIsSearching(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, formData?.adresse, addressFieldActive]); // ✅ CORRIGÉ: handleSearch retiré des dépendances

  /**
   * Sélectionne une adresse dans les résultats
   * @param {Object} address - L'adresse sélectionnée
   */
  const handleSelectAddress = (address) => {
    if (formData && updateFormData) {
      // Mode formulaire: extraction des composants d'adresse et mise à jour du formulaire
      let codePostal = '';
      let ville = '';
      let adresse = '';
      let pays = 'France';
      let departement = '';
      let region = '';
      
      // Extract address components
      if (address.address) {
        // Extract postal code
        codePostal = address.address.postcode || '';
        
        // Extract city
        ville = address.address.city || address.address.town || address.address.village || '';
        
        // Extract country
        pays = address.address.country || pays;
        
        // ✅ AMÉLIORATION: Extraction département et région
        // Extraire le département depuis différents champs possibles
        departement = address.address.county || 
                     address.address.state_district || 
                     address.address.administrative_area_level_2 || '';
        
        // Extraire la région depuis différents champs possibles  
        region = address.address.state || 
                address.address.region || 
                address.address.administrative_area_level_1 || '';
        
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
        pays,
        departement,
        region,
        latitude: address.lat,
        longitude: address.lon
      });
    } else {
      // Mode standard: mise à jour de l'adresse sélectionnée
      setSelectedAddress(address);
      setSearchTerm('');
    }
    
    setShowResults(false);
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

  // ✅ CORRECTION: Fonction handleSearch stable (définie avant les returns)
  const handleSearch = useCallback(() => {
    if (handleSearchRef.current) {
      handleSearchRef.current();
    }
  }, []);

  // Retourne différentes interfaces selon le mode d'utilisation (formulaire ou standard)
  if (formData && updateFormData) {
    return {
      addressResults,
      isSearching,
      addressFieldActive,
      setAddressFieldActive,
      addressInputRef,
      dropdownRef,
      handleSelectAddress,
      apiError
    };
  }

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
    addressInputRef,
    handleSearch,
    handleSelectAddress,
    handleRemoveAddress,
    formatAddress,
    apiError
  };
};

export default useAddressSearch;