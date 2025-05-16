/**
 * Template pour créer un hook de liste optimisé basé sur useGenericEntityList
 * 
 * ⚠️ NOTE IMPORTANTE - APPROCHE RECOMMANDÉE ⚠️
 * Ce template représente l'approche RECOMMANDÉE pour les nouveaux développements.
 * Il utilise DIRECTEMENT les hooks génériques plutôt que de passer par des wrappers
 * ou des hooks "Migrated/V2", conformément au plan de dépréciation officiel
 * (PLAN_DEPRECIATION_HOOKS.md) qui prévoit la suppression de tous les hooks 
 * spécifiques d'ici novembre 2025.
 * 
 * Instructions:
 * 1. Copiez ce fichier et renommez-le (ex: useEntitesList.js)
 * 2. Remplacez les occurrences de "entite", "Entite", "ENTITE" par votre type d'entité
 * 3. Personnalisez les filtres et les fonctions spécifiques
 * 4. Exportez le hook dans le fichier index.js de votre module
 */

import { useGenericEntityList } from '@/hooks/common';
import { useState, useCallback, useMemo } from 'react';

/**
 * Hook optimisé pour gérer les listes d'entités avec filtres
 * Utilise directement useGenericEntityList comme recommandé
 * 
 * @param {Object} options - Options de configuration (pageSize, etc.)
 * @returns {Object} - États et fonctions pour gérer la liste d'entités
 */
export const useEntitesList = (options = {}) => {
  const { pageSize = 20 } = options;
  const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'list'
  const [selectedEntite, setSelectedEntite] = useState(null);
  
  // Configuration des filtres spécifiques à l'entité
  const filterConfig = {
    type: { type: 'equals' }, // Filtre par égalité exacte
    actif: { type: 'boolean' }, // Filtre booléen
    dateCreation: { type: 'range' }, // Filtre par plage de dates
    region: { type: 'contains' }, // Filtre contient
    tags: { type: 'array-contains' } // Filtre sur tableau
  };
  
  // Utilisation directe du hook générique avec configuration spécifique
  const listHook = useGenericEntityList({
    collectionName: 'entites',
    searchFields: ['nom', 'description', 'reference'], // Champs pour la recherche
    initialSortField: 'nom',
    initialSortDirection: 'asc',
    pageSize,
    filterConfig,
    transformItems: (items) => {
      // Transformer chaque élément pour l'affichage
      return items.map(entite => ({
        ...entite,
        // Propriétés calculées ou formatées
        nomFormate: entite.nom.toUpperCase(),
        statutClass: entite.actif ? 'active-entity' : 'inactive-entity',
        dateCreationFormatee: entite.dateCreation 
          ? new Date(entite.dateCreation.seconds * 1000).toLocaleDateString('fr-FR') 
          : 'N/A',
      }));
    }
  });

  // Regrouper les entités par catégorie ou autre critère
  const entitesGroupedByType = useMemo(() => {
    const grouped = {};
    listHook.items.forEach(entite => {
      const type = entite.type || 'Autre';
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(entite);
    });
    return grouped;
  }, [listHook.items]);

  // Statistiques par type d'entité
  const statisticsPerType = useMemo(() => {
    return Object.entries(entitesGroupedByType).map(([type, entites]) => ({
      type,
      count: entites.length,
      actifs: entites.filter(e => e.actif).length,
      inactifs: entites.filter(e => !e.actif).length
    }));
  }, [entitesGroupedByType]);

  // Fonction pour appliquer des filtres avancés spécifiques
  const applyAdvancedFilters = useCallback((filters) => {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        listHook.setFilter(key, value);
      } else {
        listHook.clearFilter(key);
      }
    });
  }, [listHook]);

  // Sélectionner une entité
  const handleSelectEntite = useCallback((entite) => {
    setSelectedEntite(entite);
  }, []);

  // Retourner le hook générique enrichi de fonctionnalités spécifiques
  return {
    ...listHook, // Toutes les fonctionnalités du hook générique
    // Propriétés et méthodes spécifiques
    viewMode,
    setViewMode,
    selectedEntite,
    handleSelectEntite,
    entitesGroupedByType,
    statisticsPerType,
    applyAdvancedFilters,
    // Raccourcis pour une meilleure DX
    entites: listHook.items,
    isLoading: listHook.loading
  };
};

export default useEntitesList;