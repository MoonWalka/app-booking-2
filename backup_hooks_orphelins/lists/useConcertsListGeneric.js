/**
 * @fileoverview Hook de gestion de la liste des concerts - VERSION MIGRÉE
 * Migration vers useGenericEntityList avec configuration spécialisée pour les concerts
 * 
 * @author TourCraft Team
 * @since 2024
 * @phase Phase 2 - Généralisation - Migration useConcertsList
 */

import { useCallback, useMemo } from 'react';
import { formatDate } from '@/utils/dateUtils';
import { concertService } from '@/services/firestoreService.js';
import useGenericEntityList from '../generics/lists/useGenericEntityList';

/**
 * Hook de gestion complète de la liste des concerts - VERSION MIGRÉE
 * 
 * @description
 * Version migrée utilisant useGenericEntityList avec configuration spécialisée
 * pour maintenir la compatibilité avec l'interface existante tout en bénéficiant
 * des fonctionnalités avancées du hook générique.
 * 
 * Fonctionnalités conservées :
 * - Récupération paginée des concerts (20 par page)
 * - Gestion des statuts de concert avec détails visuels
 * - Recherche multi-critères (titre, lieu, programmateur, date)
 * - Filtres par statut avec compteurs
 * - Détection des formulaires associés
 * - Chargement progressif avec pagination infinie
 * - Interface compatible avec l'ancien hook
 * 
 * Améliorations apportées :
 * - Cache intelligent avec invalidation
 * - Retry automatique en cas d'erreur
 * - Sélection multiple (optionnelle)
 * - Statistiques avancées
 * - Auto-refresh configurable
 * - Performance optimisée
 * 
 * @param {Object} options - Options de configuration
 * @param {boolean} options.enableSelection - Activer la sélection multiple
 * @param {boolean} options.enableAutoRefresh - Activer le rafraîchissement automatique
 * @param {number} options.refreshInterval - Intervalle de rafraîchissement (ms)
 * 
 * @returns {Object} Interface complète de gestion des concerts (compatible)
 * @returns {Array} returns.concerts - Liste des concerts chargés
 * @returns {boolean} returns.loading - État de chargement en cours
 * @returns {string|null} returns.error - Message d'erreur éventuel
 * @returns {boolean} returns.hasMore - Indique s'il y a plus de concerts à charger
 * @returns {Function} returns.fetchConcerts - Fonction de chargement des concerts
 * @returns {Array} returns.searchFields - Configuration des champs de recherche
 * @returns {Array} returns.filterOptions - Options de filtrage par statut
 * @returns {Function} returns.getStatusDetails - Fonction d'obtention des détails de statut
 * @returns {Function} returns.hasForm - Fonction de vérification de formulaire associé
 * 
 * @example
 * ```javascript
 * // Utilisation identique à l'ancien hook
 * const {
 *   concerts,
 *   loading,
 *   error,
 *   hasMore,
 *   fetchConcerts,
 *   getStatusDetails,
 *   hasForm
 * } = useConcertsListGeneric();
 * 
 * // Avec fonctionnalités avancées
 * const {
 *   concerts,
 *   selectedItems,
 *   toggleSelection,
 *   stats
 * } = useConcertsListGeneric({
 *   enableSelection: true,
 *   enableAutoRefresh: true
 * });
 * ```
 * 
 * @complexity HIGH
 * @businessCritical true
 * @generic false
 * @replaces useConcertsList
 * @migration COMPLETE - Interface compatible maintenue
 */
export function useConcertsListGeneric(options = {}) {
  const {
    enableSelection = false,
    enableAutoRefresh = false,
    refreshInterval = 30000,
    enableCache = true,
    enableRealTime = false
  } = options;

  // Configuration des statuts de concerts
  const statusConfig = useMemo(() => ({
    contact: {
      icon: '📞',
      label: 'Contact établi',
      variant: 'info',
      tooltip: 'Premier contact établi avec le programmateur',
      step: 1
    },
    preaccord: {
      icon: '✅',
      label: 'Pré-accord',
      variant: 'primary',
      tooltip: 'Accord verbal obtenu, en attente de confirmation',
      step: 2
    },
    contrat: {
      icon: '📄',
      label: 'Contrat signé',
      variant: 'success',
      tooltip: 'Contrat signé par toutes les parties',
      step: 3
    },
    acompte: {
      icon: '💸',
      label: 'Acompte facturé',
      variant: 'warning',
      tooltip: 'Acompte facturé, en attente de paiement',
      step: 4
    },
    solde: {
      icon: '🔁',
      label: 'Solde facturé',
      variant: 'secondary',
      tooltip: 'Solde facturé, concert terminé',
      step: 5
    },
    annule: {
      icon: '❌',
      label: 'Annulé',
      variant: 'danger',
      tooltip: 'Concert annulé',
      step: 0
    }
  }), []);

  // Configuration des filtres basée sur les statuts
  const filtersConfig = useMemo(() => ({
    statut: {
      type: 'select',
      options: Object.keys(statusConfig),
      label: 'Statut',
      getOptionLabel: (value) => statusConfig[value]?.label || value,
      getOptionIcon: (value) => statusConfig[value]?.icon
    },
    hasForm: {
      type: 'select',
      options: ['true', 'false'],
      label: 'Avec formulaire',
      getOptionLabel: (value) => value === 'true' ? 'Avec formulaire' : 'Sans formulaire'
    }
  }), [statusConfig]);

  // Transformation des données pour enrichir les concerts
  const transformConcert = useCallback((concert) => {
    return {
      ...concert,
      // Ajouter des champs calculés
      dateFormatted: formatDate(concert.date),
      statusDetails: statusConfig[concert.statut] || {
        icon: '❓',
        label: concert.statut || 'Non défini',
        variant: 'light',
        tooltip: 'Statut non défini',
        step: 0
      },
      // Indicateur de formulaire (sera enrichi par hasForm)
      hasFormulaire: concert.formId !== undefined || concert.formLinkId !== undefined
    };
  }, [statusConfig]);

  // Configuration du hook générique
  const listConfig = {
    pageSize: 20,
    defaultSort: { field: 'date', direction: 'desc' },
    defaultFilters: {},
    enableSelection,
    enableFilters: true,
    enableSearch: true,
    searchFields: ['titre', 'lieuNom', 'programmateurNom', 'dateFormatted'],
    filters: filtersConfig,
    transformItem: transformConcert,
    onItemsChange: (concerts) => {
      // Callback pour traitement supplémentaire si nécessaire
      console.log(`📊 ${concerts.length} concerts chargés`);
    }
  };

  const listOptions = {
    paginationType: 'infinite', // Compatible avec l'ancien comportement
    enableCache,
    enableRealTime,
    enableBulkActions: enableSelection,
    autoRefresh: enableAutoRefresh,
    refreshInterval
  };

  // Utilisation du hook générique
  const {
    items: concerts,
    loading,
    error,
    pagination,
    hasMore,
    loadMore,
    selectedItems,
    toggleSelection,
    selectAll,
    clearSelection,
    searchInList,
    setFilter,
    refetch,
    stats
  } = useGenericEntityList('concerts', listConfig, listOptions);

  // Fonction pour obtenir les détails du statut (compatible)
  const getStatusDetails = useCallback((statut) => {
    return statusConfig[statut] || {
      icon: '❓',
      label: statut || 'Non défini',
      variant: 'light',
      tooltip: 'Statut non défini',
      step: 0
    };
  }, [statusConfig]);

  // Fonction pour vérifier si un concert a un formulaire associé (compatible)
  const hasForm = useCallback((concertId) => {
    const concert = concerts.find(c => c.id === concertId);
    return concert?.hasFormulaire || 
           concert?.formId !== undefined || 
           concert?.formLinkId !== undefined;
  }, [concerts]);

  // Fonction de chargement compatible avec l'ancien hook
  const fetchConcerts = useCallback(async (reset = false) => {
    if (reset) {
      // Pour un reset, on recharge complètement
      refetch();
    } else {
      // Pour charger plus, on utilise loadMore
      loadMore();
    }
  }, [refetch, loadMore]);

  // Configuration des champs de recherche (compatible)
  const searchFields = useMemo(() => [
    { 
      accessor: (item) => item.titre,
      label: 'Titre'
    },
    { 
      accessor: (item) => item.lieuNom,
      label: 'Lieu'
    },
    { 
      accessor: (item) => item.programmateurNom,
      label: 'Programmateur'
    },
    { 
      accessor: (item) => item.dateFormatted,
      label: 'Date'
    }
  ], []);

  // Configuration des options de filtre (compatible)
  const filterOptions = useMemo(() => 
    Object.entries(statusConfig).map(([value, config]) => ({
      value,
      label: config.label,
      icon: config.icon,
      filterFn: (item) => item.statut === value
    }))
  , [statusConfig]);

  // Fonctions de recherche et filtrage
  const searchConcerts = useCallback((searchTerm) => {
    searchInList(searchTerm);
  }, [searchInList]);

  const filterByStatus = useCallback((status) => {
    setFilter('statut', status);
  }, [setFilter]);

  const filterByForm = useCallback((hasFormulaire) => {
    setFilter('hasForm', hasFormulaire.toString());
  }, [setFilter]);

  // Interface de retour compatible avec l'ancien hook + nouvelles fonctionnalités
  return {
    // Interface compatible (OBLIGATOIRE)
    concerts,
    loading,
    error,
    hasMore,
    fetchConcerts,
    searchFields,
    filterOptions,
    getStatusDetails,
    hasForm,

    // Nouvelles fonctionnalités du hook générique (OPTIONNELLES)
    ...(enableSelection && {
      selectedItems,
      toggleSelection,
      selectAll,
      clearSelection
    }),

    // Fonctionnalités de recherche et filtrage avancées
    searchConcerts,
    filterByStatus,
    filterByForm,
    
    // Pagination avancée
    pagination,
    loadMore,
    
    // Utilitaires
    refetch,
    stats,
    
    // Métadonnées
    totalConcerts: stats.totalItems,
    selectedCount: stats.selectedCount,
    
    // Actions avancées (si sélection activée)
    ...(enableSelection && {
      bulkActions: {
        deleteSelected: async () => {
          console.log('🗑️ Suppression en lot de', selectedItems.length, 'concerts');
          // TODO: Implémenter la suppression en lot
        },
        exportSelected: (format = 'json') => {
          console.log('📤 Export de', selectedItems.length, 'concerts en', format);
          // TODO: Implémenter l'export
        }
      }
    })
  };
}

// Export par défaut pour compatibilité
export default useConcertsListGeneric; 