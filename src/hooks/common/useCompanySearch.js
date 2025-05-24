import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Hook personnalisé consolidé pour la recherche d'entreprises via l'API Entreprise
 * Permet de rechercher des entreprises par SIRET ou par nom
 * 
 * @param {Object} options - Options pour le hook
 * @param {Function} options.onCompanySelect - Callback appelé quand une entreprise est sélectionnée (optionnel)
 * @param {Object} options.initialData - Données initiales pour l'entreprise (optionnel)
 * @returns {Object} - État et fonctions pour gérer la recherche d'entreprises
 */
const useCompanySearch = (options = {}) => {
  const { onCompanySelect = null, initialData = null } = options;

  // Type de recherche: 'manual', 'siret' ou 'name'
  const [searchType, setSearchType] = useState('manual');
  // Terme de recherche
  const [searchTerm, setSearchTerm] = useState('');
  // Résultats de recherche
  const [searchResults, setSearchResults] = useState([]);
  // Entreprise sélectionnée
  const [selectedCompany, setSelectedCompany] = useState(initialData);
  // État de chargement
  const [isSearchingCompany, setIsSearchingCompany] = useState(false);
  // Référence pour le cache des requêtes
  const requestCache = useRef({});
  // Référence pour le délai de debounce
  const searchTimeoutRef = useRef(null);
  // Référence pour le menu déroulant des résultats
  const searchResultsRef = useRef(null);

  /**
   * Fonction de recherche d'entreprise - NOUVEAU: Mémorisée pour optimisation
   */
  const searchCompany = useCallback(async () => {
    try {
      // Construire la clé de cache
      const cacheKey = `${searchType}_${searchTerm}`;
      
      // Vérifier le cache
      if (requestCache.current[cacheKey]) {
        setSearchResults(requestCache.current[cacheKey]);
        setIsSearchingCompany(false);
        return;
      }
      
      let apiUrl;
      
      if (searchType === 'siret') {
        // Recherche par SIRET
        apiUrl = `https://recherche-entreprises.api.gouv.fr/search?q=${encodeURIComponent(searchTerm)}&per_page=5`;
      } else {
        // Recherche par nom
        apiUrl = `https://recherche-entreprises.api.gouv.fr/search?q=${encodeURIComponent(searchTerm)}&per_page=10`;
      }
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`Erreur lors de la recherche: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transformer les données au format attendu
      const formattedResults = data.results ? data.results.map(company => {
        // Extraire l'adresse complète
        const siege = company.siege;
        const adresseComplete = siege 
          ? `${siege.numero_voie || ''} ${siege.type_voie || ''} ${siege.libelle_voie || ''}`
          : '';
        
        return {
          siret: company.siege?.siret || '',
          siren: company.siren || '',
          nom: company.nom_complet || company.nom_raison_sociale || '',
          adresse: adresseComplete.trim(),
          codePostal: siege?.code_postal || '',
          ville: siege?.libelle_commune || '',
          codeAPE: company.activite_principale?.code || '',
          libelleAPE: company.activite_principale?.libelle || '',
          statutJuridique: company.nature_juridique?.libelle || '',
          active: company.etat_administratif === 'A'
        };
      }) : [];
      
      // Mettre en cache les résultats
      requestCache.current[cacheKey] = formattedResults;
      
      setSearchResults(formattedResults);
    } catch (error) {
      console.error("Erreur lors de la recherche d'entreprise:", error);
      setSearchResults([]);
    } finally {
      setIsSearchingCompany(false);
    }
  }, [searchType, searchTerm]); // NOUVEAU: Dépendances stabilisées

  // Effet pour gérer la recherche avec debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (searchTerm.length >= 3 && (searchType === 'name' || searchType === 'siret')) {
      setIsSearchingCompany(true);
      
      searchTimeoutRef.current = setTimeout(() => {
        searchCompany();
      }, 500);
    } else {
      setSearchResults([]);
      setIsSearchingCompany(false);
    }
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, searchType, searchCompany]); // NOUVEAU: Dépendance corrigée

  // Effet pour gérer les clics en dehors du menu déroulant
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchResultsRef.current && !searchResultsRef.current.contains(event.target)) {
        setSearchResults([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Notification de l'entreprise sélectionnée
  useEffect(() => {
    if (onCompanySelect && selectedCompany) {
      onCompanySelect(selectedCompany);
    }
  }, [selectedCompany, onCompanySelect]);

  /**
   * Sélectionner une entreprise parmi les résultats
   * @param {Object} company - L'entreprise sélectionnée
   */
  const handleSelectCompany = (company) => {
    setSelectedCompany(company);
    
    if (onCompanySelect) {
      onCompanySelect(company);
    }
    
    setSearchTerm('');
    setSearchResults([]);
  };

  /**
   * Réinitialiser la recherche et l'entreprise sélectionnée
   */
  const resetSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setSelectedCompany(null);
    setSearchType('manual');
  };

  /**
   * Formate les informations d'une entreprise pour l'affichage
   * @param {Object} company - L'entreprise à formater
   * @returns {Object} - Informations formatées
   */
  const formatCompanyInfo = (company) => {
    if (!company) return null;
    
    return {
      displayName: company.nom,
      address: `${company.adresse}, ${company.codePostal} ${company.ville}`.trim(),
      siretFormatted: company.siret ? company.siret.replace(/(\d{3})(?=\d)/g, '$1 ') : '',
      apeInfo: company.codeAPE ? `${company.codeAPE} - ${company.libelleAPE}` : '',
      statusClass: company.active ? 'text-success' : 'text-danger',
      statusLabel: company.active ? 'Active' : 'Inactive'
    };
  };

  return {
    searchType,
    setSearchType,
    searchTerm,
    setSearchTerm,
    searchResults,
    isSearchingCompany,
    selectedCompany,
    setSelectedCompany,
    searchResultsRef,
    handleSelectCompany,
    searchCompany,
    resetSearch,
    formatCompanyInfo
  };
};

export default useCompanySearch;