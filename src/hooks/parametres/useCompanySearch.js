import { useState, useRef, useEffect } from 'react';

/**
 * Custom hook to handle company search using the French enterprise API
 * @returns {Object} Functions and state for company search
 */
export const useCompanySearch = () => {
  const [searchType, setSearchType] = useState('manual'); // 'manual', 'name', 'siret'
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef(null);
  const searchResultsRef = useRef(null);

  // Effect for company search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    const searchCompany = async () => {
      if (!searchTerm || searchTerm.length < 3) {
        setSearchResults([]);
        return;
      }
      
      setIsSearching(true);
      
      try {
        // Use the public French business search API
        let apiUrl;
        
        if (searchType === 'name') {
          // Search by name (q is the text search parameter)
          apiUrl = `https://recherche-entreprises.api.gouv.fr/search?q=${encodeURIComponent(searchTerm)}&per_page=10`;
        } else if (searchType === 'siret') {
          // Search by SIRET
          apiUrl = `https://recherche-entreprises.api.gouv.fr/search?q=${encodeURIComponent(searchTerm)}&per_page=5`;
        }
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error(`Error while searching: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Transform data to expected format
        const formattedResults = data.results ? data.results.map(company => {
          // Extract full address
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
        
        setSearchResults(formattedResults);
      } catch (error) {
        console.error("Error during company search:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };
    
    if (searchTerm.length >= 3 && (searchType === 'name' || searchType === 'siret')) {
      searchTimeoutRef.current = setTimeout(searchCompany, 500);
    } else {
      setSearchResults([]);
    }
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, searchType]);

  return {
    searchType,
    setSearchType,
    searchTerm,
    setSearchTerm,
    searchResults,
    isSearching,
    searchResultsRef
  };
};

export default useCompanySearch;