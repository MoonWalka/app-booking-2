// src/hooks/artistes/index.js

// Export des hooks existants
export { default as useArtisteSearch } from './useArtisteSearch';
export { default as useArtistesList } from './useArtistesList';

// Export du hook original (maintenant un wrapper)
export { default as useArtisteDetails } from './useArtisteDetails';

// Export de la version migrée avec son nom original
export { default as useArtisteDetailsMigrated } from './useArtisteDetailsMigrated';

/**
 * @recommended La version migrée du hook useArtisteDetails basée sur les hooks génériques.
 * À utiliser dans les nouveaux développements.
 */
export { default as useArtisteDetailsV2 } from './useArtisteDetailsMigrated';

// Export de la version migrée du hook de liste d'artistes
export { default as useArtistesListMigrated } from './useArtistesListMigrated';

/**
 * @recommended La version migrée du hook useArtistesList basée sur useGenericEntityList.
 * À utiliser dans les nouveaux développements.
 */
export { default as useArtistesListV2 } from './useArtistesListMigrated';

/**
 * @recommended APPROCHE RECOMMANDÉE - Versions optimisées des hooks pour les artistes
 * utilisant directement les hooks génériques.
 * Ces versions sont conformes au plan de dépréciation qui prévoit la suppression 
 * des hooks spécifiques d'ici novembre 2025.
 */
export { default as useArtisteFormOptimized } from './useArtisteFormOptimized';
export { default as useArtisteDetailsOptimized } from './useArtisteDetailsOptimized';
export { default as useDeleteArtisteOptimized } from './useDeleteArtisteOptimized';
export { default as useArtisteSearchOptimized } from './useArtisteSearchOptimized';
export { default as useArtistesListOptimized } from './useArtistesListOptimized';

// Export des hooks utilitaires supplémentaires
export { default as useHandleDeleteArtist } from './useHandleDeleteArtist';
export { default as useSearchAndFilter } from './useSearchAndFilter';