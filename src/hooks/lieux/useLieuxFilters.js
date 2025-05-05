import { useCallback, useMemo } from 'react';
import useGenericEntityList from '../common/useGenericEntityList';

/**
 * Hook pour la gestion des lieux avec filtres
 * Version migrée utilisant useGenericEntityList
 * 
 * @param {Array} lieux - Liste initiale des lieux (facultatif)
 * @returns {Object} API pour la gestion des listes de lieux
 */
const useLieuxFilters = (lieux = []) => {
  // Configuration des filtres pour les lieux
  const filterConfig = {
    ville: {
      type: 'equals',
      firestoreOperator: '=='
    },
    type: {
      type: 'equals',
      firestoreOperator: '=='
    },
    capaciteMin: {
      type: 'range',
      firestoreOperator: {
        min: '>='
      }
    },
    capaciteMax: {
      type: 'range',
      firestoreOperator: {
        max: '<='
      }
    },
    actif: {
      type: 'boolean',
      firestoreOperator: '=='
    }
  };

  // Fonction de filtrage personnalisée pour les lieux fournis en entrée
  const filterLieux = useCallback((items, filters, searchTerm) => {
    // S'assurer que items est un tableau
    if (!Array.isArray(items)) return [];
    
    // Utiliser lieux si fourni, sinon utiliser items
    const lieuxToFilter = lieux?.length ? lieux : items;
    
    if (!lieuxToFilter?.length) return [];
    
    return lieuxToFilter.filter(lieu => {
      // Vérifier que lieu n'est pas null ou undefined
      if (!lieu) return false;
      
      // Filtre par type si défini
      if (filters?.type && lieu.type !== filters.type) {
        return false;
      }
      
      // Filtre par ville si défini
      if (filters?.ville && lieu.ville !== filters.ville) {
        return false;
      }
      
      // Filtre par capacité min si défini
      if (filters?.capaciteMin && (!lieu.capacite || lieu.capacite < parseInt(filters.capaciteMin))) {
        return false;
      }
      
      // Filtre par capacité max si défini
      if (filters?.capaciteMax && (!lieu.capacite || lieu.capacite > parseInt(filters.capaciteMax))) {
        return false;
      }
      
      // Filtre par terme de recherche
      if (searchTerm && searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase().trim();
        const nomMatch = lieu.nom && lieu.nom.toLowerCase().includes(term);
        const villeMatch = lieu.ville && lieu.ville.toLowerCase().includes(term);
        const adresseMatch = lieu.adresse && lieu.adresse.toLowerCase().includes(term);
        
        if (!nomMatch && !villeMatch && !adresseMatch) {
          return false;
        }
      }
      
      return true;
    });
  }, [lieux]);

  // Fonction utilitaire pour formater le nom d'un lieu
  const formatLieuName = (lieu) => {
    if (!lieu) return 'Lieu inconnu';
    
    const nom = lieu.nom || '';
    const ville = lieu.ville ? `(${lieu.ville})` : '';
    const capacite = lieu.capacite ? `- ${lieu.capacite} places` : '';
    
    return `${nom} ${ville} ${capacite}`.trim();
  };

  // Utiliser le hook générique avec la configuration spécifique aux lieux
  const listHook = useGenericEntityList({
    collectionName: 'lieux',
    filterConfig,
    searchFields: ['nom', 'ville', 'adresse'],
    initialSortField: 'nom',
    initialSortDirection: 'asc',
    transformItem: (lieu) => ({
      ...lieu,
      // Format pour l'affichage dans les listes
      displayName: formatLieuName(lieu)
    }),
    // Par défaut, n'inclure que les lieux actifs
    defaultFilters: { actif: true },
    // Pagination avec 20 éléments par page
    pageSize: 20,
    // Si des lieux ont été fournis directement, utiliser le mode pagination client
    paginationMode: Array.isArray(lieux) && lieux.length > 0 ? 'client' : 'server',
    // Fonction personnalisée pour le filtrage client quand lieux est fourni
    customFiltering: Array.isArray(lieux) && lieux.length > 0 ? filterLieux : null
  });
  
  // Extraire les types uniques pour les options de filtre
  const typesOptions = useMemo(() => {
    if (!Array.isArray(lieux) || !lieux.length) return [];
    
    const types = new Set(lieux
      .filter(lieu => lieu && lieu.type)
      .map(lieu => lieu.type));
    
    return Array.from(types);
  }, [lieux]);
  
  // Extraire les villes uniques pour les options de filtre
  const villesOptions = useMemo(() => {
    if (!Array.isArray(lieux) || !lieux.length) return [];
    
    const villes = new Set(lieux
      .filter(lieu => lieu && lieu.ville)
      .map(lieu => lieu.ville));
    
    return Array.from(villes);
  }, [lieux]);

  // Adapter l'API pour maintenir la compatibilité avec le code existant
  // qui utilise useLieuxFilters
  return {
    // Les données principales - IMPORTANT : assurer la compatibilité avec LieuxList
    lieux: listHook.items || [],
    filteredLieux: listHook.items || [], // Cette propriété attendue par LieuxList
    loading: listHook.loading || false,
    error: listHook.error || null,
    
    // Filtres et recherche
    filterType: listHook.filters?.type || 'tous',
    setFilterType: (type) => listHook.setFilter?.('type', type === 'tous' ? '' : type),
    searchTerm: listHook.searchTerm || '',
    setSearchTerm: listHook.setSearchTerm || (() => {}),
    sortOption: listHook.sortField || 'nom',
    setSortOption: (option) => listHook.setSorting?.(option),
    
    // Options de filtre basées sur les données disponibles
    typesOptions,
    villesOptions,
    filters: listHook.filters || {},
    
    // Pagination
    hasMore: listHook.hasMore || false,
    loadMore: listHook.loadMore || (() => {}),
    currentPage: listHook.currentPage || 1,
    setPage: listHook.setPage || (() => {}),
    
    // Tri
    sortField: listHook.sortField || 'nom',
    sortDirection: listHook.sortDirection || 'asc',
    setSorting: listHook.setSorting || (() => {}),
    
    // Actions générales
    refresh: listHook.refresh || (() => {}),
    
    // Exposer également l'API complète du hook générique pour les cas où
    // des fonctionnalités supplémentaires seraient nécessaires
    genericListHook: listHook || {}
  };
};

export default useLieuxFilters;