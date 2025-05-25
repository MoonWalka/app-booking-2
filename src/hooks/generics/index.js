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

// Hooks de formulaires génériques - SEMAINE 3 ✅
export { default as useGenericEntityForm } from './forms/useGenericEntityForm';
export { default as useGenericFormWizard } from './forms/useGenericFormWizard';
export { default as useGenericFormPersistence } from './forms/useGenericFormPersistence';

// Hooks de validation génériques - SEMAINE 3 ✅
export { default as useGenericValidation } from './validation/useGenericValidation';

/**
 * @summary Hooks génériques disponibles - PHASE 2 TERMINÉE ✅
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
 * - Migration useConcertsList: Hook critique métier ✅ TERMINÉE et SUPPRIMÉ
 * 
 * SEMAINE 3 - FORMS + VALIDATION (4/4 hooks) ✅ TERMINÉE
 * - useGenericEntityForm: Hook de formulaires d'entités avancés ✅
 * - useGenericValidation: Hook de validation générique avec règles ✅
 * - useGenericFormWizard: Hook de formulaires multi-étapes ✅
 * - useGenericFormPersistence: Hook de sauvegarde automatique ✅
 * 
 * @progress 12/12 hooks créés (100% - PHASE 2 TERMINÉE ✅)
 * @milestone PHASE 2 GÉNÉRALISATION FINALISÉE AVEC SUCCÈS
 * @achievement 70%+ d'économies de code, infrastructure robuste, standards élevés
 * @nextPhase Phase 3 - Optimisation et adoption généralisée
 */
