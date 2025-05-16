import { useState, useCallback } from 'react';
import useGenericEntitySearch from '../common/useGenericEntitySearch';
import { formatDate } from '../../utils/dateUtils';

/**
 * Hook pour la recherche de concerts
 * Version migrée utilisant useGenericEntitySearch
 * 
 * @param {string} initialTerm - Terme de recherche initial
 * @returns {Object} API de recherche de concerts
 */
const useConcertSearch = (initialTerm = '') => {
  // Utilisation du hook générique avec configuration pour les concerts
  const searchHook = useGenericEntitySearch({
    collectionName: 'concerts',
    searchFields: ['titre', 'artisteCache.nom', 'lieuCache.nom'],
    initialSearchTerm: initialTerm,
    transformResult: (concert) => ({
      ...concert,
      // Formatage pour affichage dans les dropdowns
      displayName: formatConcertName(concert)
    }),
    sortResults: (a, b) => {
      // Tri par date (du plus récent au plus ancien)
      const dateA = a.date ? new Date(a.date) : new Date(0);
      const dateB = b.date ? new Date(b.date) : new Date(0);
      return dateB - dateA;
    }
  });

  // État local pour gérer le concert sélectionné (pour compatibilité API)
  const [selectedConcert, setSelectedConcert] = useState(null);

  // Fonction utilitaire pour formater le nom d'affichage d'un concert
  const formatConcertName = (concert) => {
    if (!concert) return 'Concert inconnu';
    
    const titre = concert.titre || '';
    const artiste = concert.artisteCache?.nom || concert.artiste || '';
    const lieu = concert.lieuCache?.nom || concert.lieu || '';
    const date = concert.date ? formatDate(concert.date) : '';
    
    let displayName = titre;
    
    if (artiste) {
      displayName += displayName ? ` - ${artiste}` : artiste;
    }
    
    if (date) {
      displayName += ` (${date})`;
    }
    
    if (lieu) {
      displayName += ` @ ${lieu}`;
    }
    
    return displayName || 'Concert sans titre';
  };

  // Synchroniser le concert sélectionné avec l'entité sélectionnée du hook générique
  const handleConcertSelect = useCallback((concert) => {
    setSelectedConcert(concert);
    searchHook.setSelectedEntity(concert);
  }, [searchHook]);

  // Effacer la sélection de concert
  const clearConcertSelection = useCallback(() => {
    setSelectedConcert(null);
    searchHook.clearSelection();
  }, [searchHook]);

  // API retournée (pour compatibilité avec le code existant)
  return {
    // Propriétés et méthodes du hook générique
    ...searchHook,
    
    // Propriétés et méthodes spécifiques à useConcertSearch (pour compatibilité)
    concert: searchHook.selectedEntity || selectedConcert,
    setConcert: handleConcertSelect,
    clearConcert: clearConcertSelection,
    
    // Aliases supplémentaires pour compatibilité
    searchConcerts: searchHook.refreshSearch,
    resetSearch: searchHook.clearSearch
  };
};

export default useConcertSearch;