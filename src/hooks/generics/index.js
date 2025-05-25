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

// Hooks de listes génériques (Semaine 2) - ⏳ PLANIFIÉ
// export { default as useGenericEntityList } from './lists/useGenericEntityList';
// export { default as useGenericDataFetcher } from './data/useGenericDataFetcher';

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
 * SEMAINE 2 - LISTS + DATA (0/4 hooks) ⏳ PLANIFIÉE
 * - useGenericEntityList: Hook de listes avec pagination
 * - useGenericDataFetcher: Hook de récupération de données
 * - + 2 autres hooks de données
 * 
 * SEMAINE 3 - FORM + VALIDATION (0/4 hooks) ⏳ PLANIFIÉE
 * - useGenericEntityForm: Hook de formulaires d'entités
 * - useGenericValidation: Hook de validation générique
 * - + 2 autres hooks de formulaires
 * 
 * @progress 4/12 hooks créés (33% - Semaine 1 terminée)
 * @nextMilestone Semaine 2 - Hooks de listes et données
 */
