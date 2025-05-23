/**
 * Hook optimisé pour la recherche de programmateurs
 * basé sur useGenericEntitySearch
 * 
 * Cette implémentation suit l'approche RECOMMANDÉE pour les nouveaux développements
 * en utilisant directement les hooks génériques.
 */
import { useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGenericEntitySearch } from '@/hooks/common';
import { collection, getDocs, db } from '@/firebaseInit';
import { debugLog } from '@/utils/logUtils';

/**
 * Fonction utilitaire pour accéder aux propriétés imbriquées d'un objet
 * @param {Object} obj - L'objet à explorer
 * @param {string} path - Le chemin de la propriété (ex: "structure.nom")
 * @returns {*} - La valeur trouvée ou une chaîne vide si non trouvée
 */
const getNestedValue = (obj, path) => {
  if (!obj) return '';
  const fieldParts = path.split('.');
  let value = obj;
  for (const part of fieldParts) {
    value = value?.[part];
    if (value === undefined) return '';
  }
  return value || '';
};

/**
 * Hook optimisé pour la recherche et la sélection de programmateurs
 * 
 * @param {Object} options - Options de configuration
 * @param {Function} [options.onSelect=null] - Callback appelé quand un programmateur est sélectionné
 * @param {string} [options.initialSearchTerm=''] - Terme de recherche initial
 * @param {number} [options.maxResults=50] - Nombre maximum de résultats à afficher
 * @returns {Object} API pour la recherche et la sélection de programmateurs
 */
export const useProgrammateurSearch = ({
  onSelect = null,
  initialSearchTerm = '',
  maxResults = 50,
} = {}) => {
  const navigate = useNavigate();
  const [selectedProgrammateur, setSelectedProgrammateur] = useState(null);
  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false);
  const [error, setError] = useState(null);
  const [localResults, setLocalResults] = useState([]);
  
  // États supplémentaires pour la gestion du tri et du filtrage
  const [sortField, setSortField] = useState('nom');
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchFilters, setSearchFilters] = useState([]);
  
  // Utilisation du hook générique avec configuration pour les programmateurs
  const searchHook = useGenericEntitySearch({
    collectionName: 'programmateurs',
    // Champs sur lesquels effectuer la recherche
    searchFields: ['nom', 'prenom', 'email', 'structure', 'telephone'],
    initialSearchTerm,
    limit: maxResults,
    // Permettre la recherche locale pour de meilleures performances
    useLocalSearch: true,
    preloadData: true,
    // Modifier la condition pour accepter aussi les recherches vides (pour le chargement initial)
    searchCondition: () => true,
    // Transformation des résultats pour l'affichage
    transformResult: (programmateur) => ({
      ...programmateur,
      // Format d'affichage standardisé pour les programmateurs
      displayName: programmateur.nom ? 
        `${programmateur.prenom || ''} ${programmateur.nom}${programmateur.structure ? ` (${programmateur.structure})` : ''}` : 
        'Programmateur sans nom',
      // Nom complet pour faciliter l'utilisation
      fullName: `${programmateur.prenom || ''} ${programmateur.nom || ''}`
    })
  });
  
  // Chargement initial des données si nécessaire
  useEffect(() => {
    const loadAllProgrammateurs = async () => {
      if (!hasLoadedInitialData && searchHook.results.length === 0 && !searchHook.isSearching) {
        debugLog('[useProgrammateurSearch] Chargement initial des programmateurs', 'info');
        
        try {
          const snapshot = await getDocs(collection(db, 'programmateurs'));
          const programmateurs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          // Transformer les résultats comme dans le hook générique
          const transformedProgrammateurs = programmateurs.map(programmateur => ({
            ...programmateur,
            displayName: programmateur.nom ? 
              `${programmateur.prenom || ''} ${programmateur.nom}${programmateur.structure ? ` (${programmateur.structure})` : ''}` : 
              'Programmateur sans nom',
            fullName: `${programmateur.prenom || ''} ${programmateur.nom || ''}`
          }));
          
          // Au lieu de définir les résultats via searchHook.setResults qui n'existe pas,
          // nous les stockons dans notre propre état localResults
          setLocalResults(transformedProgrammateurs);
          setHasLoadedInitialData(true);
          
          debugLog(`[useProgrammateurSearch] ${transformedProgrammateurs.length} programmateurs chargés`, 'info');
        } catch (error) {
          debugLog(`[useProgrammateurSearch] Erreur lors du chargement initial: ${error.message}`, 'error');
          setError(error);
        }
      }
    };
    
    loadAllProgrammateurs();
  }, [hasLoadedInitialData, searchHook.results, searchHook.isSearching]);
  
  // Déterminer la source des résultats - utiliser nos résultats locaux ou ceux du hook générique
  const effectiveResults = searchHook.results.length > 0 ? searchHook.results : localResults;
  
  // Fonction pour trier les résultats en fonction de sortField et sortDirection
  const [sortedAndFilteredResults, setSortedAndFilteredResults] = useState([]);
  
  useEffect(() => {
    if (effectiveResults.length > 0) {
      const sortedResults = [...effectiveResults].sort((a, b) => {
        // Utilisation de la fonction utilitaire getNestedValue définie plus haut
        let valA = getNestedValue(a, sortField);
        let valB = getNestedValue(b, sortField);
        
        // Convertir en chaînes pour la comparaison
        valA = String(valA).toLowerCase();
        valB = String(valB).toLowerCase();
        
        // Trier selon la direction
        if (sortDirection === 'asc') {
          return valA.localeCompare(valB);
        } else {
          return valB.localeCompare(valA);
        }
      });
      
      // Log de debug
      debugLog(`[useProgrammateurSearch] Résultats triés par ${sortField} ${sortDirection}`, 'debug', 'search');
      
      // Appliquer les filtres si nécessaire
      let filteredResults = sortedResults;
      if (searchFilters && searchFilters.length > 0) {
        filteredResults = filteredResults.filter(item => {
          return searchFilters.every(filter => {
            const { field, operator, value } = filter;
            const itemValue = getNestedValue(item, field);
            
            switch (operator) {
              case '==': return itemValue === value;
              case '!=': return itemValue !== value;
              case '>': return itemValue > value;
              case '>=': return itemValue >= value;
              case '<': return itemValue < value;
              case '<=': return itemValue <= value;
              case 'contains': return String(itemValue).includes(value);
              case 'startsWith': return String(itemValue).startsWith(value);
              case 'endsWith': return String(itemValue).endsWith(value);
              default: return true;
            }
          });
        });
        
        debugLog(`[useProgrammateurSearch] Résultats filtrés: ${filteredResults.length}`, 'debug', 'search');
      }
      
      // Stocker les résultats triés et filtrés dans notre propre état
      setSortedAndFilteredResults(filteredResults);
    } else {
      setSortedAndFilteredResults([]);
    }
  }, [effectiveResults, sortField, sortDirection, searchFilters]);
  
  // Gestion de la sélection d'un programmateur avec callback
  const handleProgrammateurSelect = useCallback((programmateur) => {
    setSelectedProgrammateur(programmateur);
    searchHook.setSelectedEntity(programmateur);
    
    // Appeler le callback de sélection si fourni
    if (onSelect && typeof onSelect === 'function') {
      onSelect(programmateur);
    }
  }, [onSelect, searchHook]);
  
  // Navigation vers la page de création de programmateur
  const handleCreateProgrammateur = useCallback(() => {
    navigate('/programmateurs/nouveau');
  }, [navigate]);
  
  // Navigation vers la page de détail d'un programmateur
  const navigateToProgrammateurDetails = useCallback((programmateurId) => {
    if (programmateurId) {
      navigate(`/programmateurs/${programmateurId}`);
    }
  }, [navigate]);
  
  // Effacer la sélection
  const clearSelection = useCallback(() => {
    setSelectedProgrammateur(null);
    searchHook.clearSelection();
  }, [searchHook]);

  // Fonction pour gérer la recherche manuelle
  const handleSearch = useCallback(() => {
    searchHook.refreshSearch();
  }, [searchHook]);
  
  return {
    // Propriétés et méthodes du hook générique
    ...searchHook,
    
    // Propriétés spécifiques aux programmateurs pour une meilleure DX
    programmateur: searchHook.selectedEntity || selectedProgrammateur,
    setProgrammateur: handleProgrammateurSelect,
    clearProgrammateur: clearSelection,
    programmateurs: sortedAndFilteredResults, // Utiliser les résultats triés et filtrés
    loading: searchHook.isSearching, // Ajout de l'état loading
    error: error || searchHook.error, // Utiliser notre erreur ou celle du hook générique
    
    // Propriétés et méthodes de tri et filtrage
    sortField,
    setSortField,
    sortDirection, 
    setSortDirection,
    searchFilters,
    setSearchFilters,
    handleSearch,
    
    // Actions spécifiques aux programmateurs
    handleCreateProgrammateur,
    navigateToProgrammateurDetails,
    
    // Aliases pour compatibilité avec le code existant
    searchProgrammateurs: searchHook.refreshSearch,
    resetSearch: searchHook.clearSearch,
    
    // États supplémentaires
    isSearching: searchHook.isSearching,
    searchError: error || searchHook.error
  };
};

export default useProgrammateurSearch;