/**
 * @fileoverview Index des hooks génériques
 * Exports centralisés pour tous les hooks génériques de TourCraft
 * 
 * @author TourCraft Team
 * @since 2024 - Phase 2 Généralisation
 */

// Hooks d'actions génériques - SEMAINE 1 ✅
export { default as useGenericAction } from './actions/useGenericAction';
export { default as useGenericFormAction } from './actions/useGenericFormAction';

// Hooks de recherche génériques - SEMAINE 1 ✅
export { default as useGenericSearch } from './search/useGenericSearch';
export { default as useGenericFilteredSearch } from './search/useGenericFilteredSearch';

// Hooks de données génériques - SEMAINE 2 ✅
export { default as useGenericDataFetcher } from './data/useGenericDataFetcher';
export { default as useGenericCachedData } from './data/useGenericCachedData';

// Hooks de listes génériques - SEMAINE 2 ✅
export { default as useGenericEntityList } from './lists/useGenericEntityList';

// Hooks de formulaires génériques (Semaine 3) - ⏳ PLANIFIÉ
// export { default as useGenericEntityForm } from './forms/useGenericEntityForm';
// export { default as useGenericValidation } from './validation/useGenericValidation';

/**
 * @summary Hooks génériques disponibles
 * 
 * SEMAINE 1 - ACTIONS + SEARCH (4/4 hooks) ✅ TERMINÉE
 * - useGenericAction: Hook CRUD générique pour toutes les entités
 * - useGenericFormAction: Hook de formulaires avec validation et auto-save
 * - useGenericSearch: Hook de recherche avec cache et suggestions
 * - useGenericFilteredSearch: Hook de recherche avancée avec filtres
 * 
 * SEMAINE 2 - LISTS + DATA (4/4 hooks) ✅ TERMINÉE
 * - useGenericDataFetcher: Hook de récupération de données optimisé ✅
 * - useGenericCachedData: Hook de cache multi-niveaux avancé ✅
 * - useGenericEntityList: Hook de listes avec pagination et sélection ✅
 * - Migration useConcertsList: Hook critique métier ✅ TERMINÉE
 * 
 * SEMAINE 3 - FORM + VALIDATION (0/4 hooks) ⏳ PLANIFIÉE
 * - useGenericEntityForm: Hook de formulaires d'entités
 * - useGenericValidation: Hook de validation générique
 * - + 2 autres hooks de formulaires
 * 
 * @progress 8/12 hooks créés (67% - Semaine 2 TERMINÉE ✅)
 * @milestone SEMAINE 2 FINALISÉE AVEC SUCCÈS
 * @nextPhase Semaine 3 - Hooks de formulaires et validation
 */
