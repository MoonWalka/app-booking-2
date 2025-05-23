// src/hooks/artistes/index.js

// Export des hooks existants
export { default as useArtisteSearch } from './useArtisteSearch';
export { default as useArtistesList } from './useArtistesList';

// Export du hook original (maintenant un wrapper)
export { default as useArtisteDetails } from './useArtisteDetails';

// Export de la version migrée avec son nom original

/**
 * @recommended La version migrée du hook useArtisteDetails basée sur les hooks génériques.
 * À utiliser dans les nouveaux développements.
 */

// Export de la version migrée du hook de liste d'artistes

/**
 * @recommended La version migrée du hook useArtistesList basée sur useGenericEntityList.
 * À utiliser dans les nouveaux développements.
 */

/**
 * @recommended APPROCHE RECOMMANDÉE - Versions optimisées des hooks pour les artistes
 * utilisant directement les hooks génériques.
 * Ces versions sont conformes au plan de dépréciation qui prévoit la suppression 
 * des hooks spécifiques d'ici novembre 2025.
 */
export { default as useArtisteForm } from './useArtisteForm';
export { default as useDeleteArtiste } from './useDeleteArtiste';

// Export des hooks utilitaires supplémentaires
export { default as useHandleDeleteArtist } from './useHandleDeleteArtist';
export { default as useSearchAndFilter } from './useSearchAndFilter';