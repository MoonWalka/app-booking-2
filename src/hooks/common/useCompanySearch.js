import { useState, useRef, useEffect } from 'react';

/**
 * Hook personnalisé pour la recherche d'entreprises via l'API Entreprise
 * Permet de rechercher des entreprises par SIRET ou par nom
 * 
 * @param {Function} onCompanySelect - Callback appelé quand une entreprise est sélectionnée (optionnel)
 * @returns {Object} - État et fonctions pour gérer la recherche d'entreprises
 */
const useCompanySearch = (onCompanySelect = null) => {
  // Type de recherche: 'siret' ou 'name'
  const [searchType, setSearchType] = useState('manual');
  // Terme de recherche
  const [searchTerm, setSearchTerm] = useState('');
  // Résultats de recherche
  const [searchResults, setSearchResults] = useState([]);
  // État de chargement
  const [isSearchingCompany, setIsSearchingCompany] = useState(false);
  // Référence pour le cache des requêtes
  const requestCache = useRef({});
  // Référence pour le délai de debounce
  const searchTimeoutRef = useRef(null);

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
  }, [searchTerm, searchType]);

  // Fonction de recherche d'entreprise
  const searchCompany = async () => {
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
        apiUrl = `https://recherche-entreprises.api.gouv.fr/search?q=${encodeURIComponent(searchTerm)}&per_page=5`;
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
  };

  /**
   * Sélectionner une entreprise parmi les résultats
   * @param {Object} company - L'entreprise sélectionnée
   */
  const handleSelectCompany = (company) => {
    if (onCompanySelect) {
      onCompanySelect(company);
    }
    
    setSearchTerm('');
    setSearchResults([]);
  };

  return {
    searchType,
    setSearchType,
    searchTerm,
    setSearchTerm,
    searchResults,
    isSearchingCompany,
    handleSelectCompany,
    searchCompany
  };
};

export default useCompanySearch;