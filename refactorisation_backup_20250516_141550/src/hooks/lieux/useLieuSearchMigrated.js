// src/hooks/lieux/useLieuSearchMigrated.js
import { useNavigate } from 'react-router-dom';
import { useGenericEntitySearch } from '@/hooks/common';
import { debugLog } from '@/utils/logUtils';

/**
 * Hook migré pour la recherche de lieux
 * Utilise le hook générique useGenericEntitySearch avec une configuration optimisée
 * 
 * @param {Object} options - Options de configuration
 * @param {Function} options.onSelect - Callback appelé quand un lieu est sélectionné (optionnel)
 * @param {number} options.maxResults - Nombre maximum de résultats (optionnel, défaut: 10)
 * @param {boolean} options.includeDetails - Inclure les détails complets pour chaque lieu (optionnel, défaut: false)
 * @returns {Object} API pour gérer la recherche et la sélection de lieux
 */
const useLieuSearchMigrated = (options = {}) => {
  const {
    onSelect = null,
    maxResults = 10,
    includeDetails = false
  } = options;
  
  const navigate = useNavigate();
  
  debugLog('Hook useLieuSearchMigrated instancié', 'debug', 'useLieuSearchMigrated');
  
  // Utiliser le hook générique avec la configuration optimisée pour les lieux
  const searchHook = useGenericEntitySearch({
    // Configuration de base
    entityType: 'lieu',
    collectionName: 'lieux',
    idField: 'id',
    
    // Configuration de la recherche
    searchFields: ['nom', 'ville', 'codePostal', 'adresse'],
    primarySearchField: 'nom',
    displayField: 'nom',
    secondaryDisplayField: 'ville',
    maxResults,
    
    // Fonctionnalités avancées
    initialResults: [],
    includeDetails,
    cacheResults: true,
    cacheTTL: 5 * 60 * 1000, // 5 minutes
    
    // Callbacks
    onSelect,
    onError: (error) => {
      debugLog(`Erreur lors de la recherche de lieux: ${error.message}`, 'error', 'useLieuSearchMigrated');
    }
  });
  
  /**
   * Fonction pour créer un nouveau lieu et naviguer vers la page de création
   * @param {string} initialName - Nom initial du lieu (optionnel)
   */
  const handleCreateLieu = (initialName = '') => {
    let navigationState = {};
    
    if (initialName) {
      navigationState = { initialName };
    }
    
    navigate('/lieux/nouveau', { state: navigationState });
  };
  
  return {
    ...searchHook,
    handleCreateLieu
  };
};

export default useLieuSearchMigrated;