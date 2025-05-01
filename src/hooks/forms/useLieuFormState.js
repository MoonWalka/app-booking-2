import { useState, useEffect, useRef } from 'react';
import { useLocationIQ } from '@/hooks/useLocationIQ';

/**
 * Hook to manage lieu (venue) form state with address autocompletion
 */
export const useLieuFormState = (initialLieu = null) => {
  const [lieuFormData, setLieuFormData] = useState({
    nom: '',
    adresse: '',
    codePostal: '',
    ville: '',
    capacite: ''
  });
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const addressTimeoutRef = useRef(null);
  const addressInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Utilisation du hook LocationIQ pour l'autocomplétion d'adresse
  const { isLoading: isApiLoading, searchAddress } = useLocationIQ();

  // Initialiser les données du lieu quand elles sont chargées
  useEffect(() => {
    if (initialLieu) {
      setLieuFormData({
        nom: initialLieu.nom || '',
        adresse: initialLieu.adresse || '',
        codePostal: initialLieu.codePostal || '',
        ville: initialLieu.ville || '',
        capacite: initialLieu.capacite || ''
      });
    }
  }, [initialLieu]);

  // Effet pour la recherche d'adresse
  useEffect(() => {
    // Nettoyer le timeout précédent
    if (addressTimeoutRef.current) {
      clearTimeout(addressTimeoutRef.current);
    }
    
    const handleSearch = async () => {
      if (!lieuFormData.adresse || lieuFormData.adresse.length < 3 || isApiLoading) {
        setAddressSuggestions([]);
        return;
      }
      
      setIsSearchingAddress(true);
      
      try {
        // Appeler la fonction du hook
        const results = await searchAddress(lieuFormData.adresse);
        setAddressSuggestions(results || []);
      } catch (error) {
        console.error("Erreur lors de la recherche:", error);
        setAddressSuggestions([]);
      } finally {
        setIsSearchingAddress(false);
      }
    };
    
    // N'effectuer la recherche que si l'adresse a au moins 3 caractères
    if (lieuFormData.adresse && lieuFormData.adresse.length >= 3 && !isApiLoading) {
      addressTimeoutRef.current = setTimeout(handleSearch, 300);
    } else {
      setAddressSuggestions([]);
    }
    
    return () => {
      if (addressTimeoutRef.current) {
        clearTimeout(addressTimeoutRef.current);
      }
    };
  }, [lieuFormData.adresse, isApiLoading, searchAddress]);

  // Handler pour mettre à jour le formulaire
  const handleLieuChange = (e) => {
    const { name, value } = e.target;
    setLieuFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Sélectionner une adresse parmi les suggestions
  const handleSelectAddress = (address) => {
    let codePostal = '';
    let ville = '';
    let adresse = '';
    
    // Extraire les composants d'adresse
    if (address.address) {
      // Extraire le code postal
      codePostal = address.address.postcode || '';
      
      // Extraire la ville
      ville = address.address.city || address.address.town || address.address.village || '';
      
      // Construire l'adresse de rue
      const houseNumber = address.address.house_number || '';
      const road = address.address.road || '';
      adresse = `${houseNumber} ${road}`.trim();
    }
    
    // Mettre à jour le formulaire du lieu avec les informations d'adresse
    setLieuFormData(prev => ({
      ...prev,
      adresse: adresse || address.display_name.split(',')[0],
      codePostal,
      ville
    }));
    
    // Fermer les suggestions
    setAddressSuggestions([]);
  };

  // Fonction pour sauvegarder les modifications du lieu
  const saveLieuChanges = (lieu) => {
    // Créer un nouvel objet lieu avec les nouvelles valeurs
    return {
      ...lieu,
      ...lieuFormData,
      // Assurez-vous que capacite est un nombre
      capacite: lieuFormData.capacite ? parseInt(lieuFormData.capacite, 10) : null
    };
  };

  // Hook pour gérer le clic en dehors des suggestions
  const setupOutsideClickHandler = () => {
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) && 
            addressInputRef.current && !addressInputRef.current.contains(event.target)) {
          setAddressSuggestions([]);
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);
  };

  return {
    lieuFormData,
    setLieuFormData,
    handleLieuChange,
    addressSuggestions,
    isSearchingAddress,
    handleSelectAddress,
    saveLieuChanges,
    addressInputRef,
    suggestionsRef,
    setupOutsideClickHandler
  };
};

export default useLieuFormState;