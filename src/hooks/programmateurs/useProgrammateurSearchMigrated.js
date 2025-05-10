// src/hooks/programmateurs/useProgrammateurSearchMigrated.js
import { useNavigate } from 'react-router-dom';
import { useGenericEntitySearch } from '@/hooks/common';
import { debugLog } from '@/utils/logUtils';

/**
 * Hook migré pour la recherche de programmateurs
 * Utilise le hook générique useGenericEntitySearch avec une configuration optimisée
 * 
 * @param {Object} options - Options de configuration
 * @param {Function} options.onSelect - Callback appelé quand un programmateur est sélectionné (optionnel)
 * @param {string} options.lieuId - ID du lieu pour charger le programmateur associé (optionnel)
 * @param {number} options.maxResults - Nombre maximum de résultats (optionnel, défaut: 10)
 * @param {boolean} options.includeDetails - Inclure les détails complets (optionnel, défaut: false)
 * @returns {Object} API pour gérer la recherche et la sélection de programmateurs
 */
const useProgrammateurSearchMigrated = (options = {}) => {
  const {
    onSelect = null,
    lieuId = null,
    maxResults = 10,
    includeDetails = false
  } = typeof options === 'string' ? { lieuId: options } : options;
  
  const navigate = useNavigate();
  
  debugLog('Hook useProgrammateurSearchMigrated instancié', 'debug', 'useProgrammateurSearchMigrated');
  
  // Utiliser le hook générique avec la configuration optimisée pour les programmateurs
  const searchHook = useGenericEntitySearch({
    // Configuration de base
    entityType: 'programmateur',
    collectionName: 'programmateurs',
    idField: 'id',
    
    // Configuration de la recherche
    searchFields: ['nom', 'structure', 'email'],
    primarySearchField: 'nom',
    displayField: 'nom',
    secondaryDisplayField: 'structure',
    maxResults,
    
    // Fonctionnalités avancées
    initialResults: [],
    includeDetails,
    cacheResults: true,
    cacheTTL: 5 * 60 * 1000, // 5 minutes
    
    // Configuration pour le chargement par lieuId
    relatedEntity: lieuId ? {
      type: 'lieu',
      id: lieuId,
      relationField: 'programmateurId'
    } : null,
    
    // Callbacks
    onSelect,
    onError: (error) => {
      debugLog(`Erreur lors de la recherche de programmateurs: ${error.message}`, 'error', 'useProgrammateurSearchMigrated');
    }
  });
  
  /**
   * Fonction pour créer un nouveau programmateur et naviguer vers la page de création
   * @param {string} returnTo - URL de retour après la création (optionnel)
   */
  const handleCreateProgrammateur = (returnTo = null) => {
    const navigationOptions = returnTo ? { state: { returnTo } } : {};
    navigate('/programmateurs/nouveau', navigationOptions);
  };
  
  return {
    ...searchHook,
    handleCreateProgrammateur
  };
};

export default useProgrammateurSearchMigrated;