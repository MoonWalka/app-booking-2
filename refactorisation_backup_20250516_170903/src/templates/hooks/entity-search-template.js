/**
 * Template pour créer un hook de recherche optimisé basé sur useGenericEntitySearch
 * 
 * ⚠️ NOTE IMPORTANTE - APPROCHE RECOMMANDÉE ⚠️
 * Ce template représente l'approche RECOMMANDÉE pour les nouveaux développements.
 * Il utilise DIRECTEMENT les hooks génériques plutôt que de passer par des wrappers
 * ou des hooks "Migrated/V2", conformément au plan de dépréciation officiel
 * (PLAN_DEPRECIATION_HOOKS.md) qui prévoit la suppression de tous les hooks 
 * spécifiques d'ici novembre 2025.
 * 
 * Instructions:
 * 1. Copiez ce fichier et renommez-le (ex: useEntiteSearch.js)
 * 2. Remplacez les occurrences de "entite", "Entite", "ENTITE" par votre type d'entité
 * 3. Personnalisez les champs de recherche et les fonctions spécifiques
 * 4. Exportez le hook dans le fichier index.js de votre module
 */

import { useGenericEntitySearch } from '@/hooks/common';
import { useState, useCallback } from 'react';

/**
 * Hook optimisé pour la recherche d'entités
 * Utilise directement useGenericEntitySearch comme recommandé
 * 
 * @param {Object} options - Options de configuration (onSelect, etc.)
 * @returns {Object} - États et fonctions pour gérer la recherche d'entités
 */
export const useEntiteSearch = (options = {}) => {
  const { onSelect } = options;
  const [selectedFilters, setSelectedFilters] = useState({
    type: 'tous', // Filtre spécifique à l'entité
    region: null   // Autre exemple de filtre spécifique
  });
  
  // Utilisation directe du hook générique avec configuration spécifique
  const searchHook = useGenericEntitySearch({
    collectionName: 'entites',
    searchFields: ['nom', 'description', 'code'], // Champs sur lesquels effectuer la recherche
    initialFilters: { actif: true }, // Filtres par défaut
    limit: 20, // Limite de résultats
    onSelect: (entite) => {
      if (onSelect) onSelect(entite);
    },
    sortField: 'nom',
    sortDirection: 'asc',
    transformResults: (results) => {
      // Transformer chaque résultat pour l'affichage ou d'autres besoins
      return results.map(entite => ({
        ...entite,
        // Exemples de transformations :
        affichageComplet: `${entite.nom} - ${entite.code || 'Sans code'}`,
        statutTexte: entite.actif ? 'Actif' : 'Inactif'
      }));
    }
  });

  // Fonction pour appliquer des filtres spécifiques à l'entité
  const applyEntiteFilter = useCallback((filterType, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: value
    }));

    // Appliquer le filtre via le hook générique
    if (filterType === 'type' && value !== 'tous') {
      searchHook.setFilter('type', value);
    } else if (filterType === 'type' && value === 'tous') {
      searchHook.clearFilter('type');
    }

    if (filterType === 'region' && value) {
      searchHook.setFilter('region', value);
    } else if (filterType === 'region' && !value) {
      searchHook.clearFilter('region');
    }
  }, [searchHook]);

  // Fonction pour réinitialiser tous les filtres
  const resetAllFilters = useCallback(() => {
    setSelectedFilters({
      type: 'tous',
      region: null
    });
    searchHook.clearAllFilters();
  }, [searchHook]);

  // Retourner le hook générique enrichi de fonctionnalités spécifiques
  return {
    ...searchHook, // Toutes les fonctionnalités du hook générique
    // Propriétés et méthodes spécifiques à l'entité
    selectedFilters,
    applyEntiteFilter,
    resetAllFilters,
    // Raccourcis pour une meilleure DX
    entites: searchHook.searchResults
  };
};

export default useEntiteSearch;