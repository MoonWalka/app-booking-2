/**
 * @fileoverview Index des hooks génériques
 * Exports centralisés pour tous les hooks génériques de TourCraft
 * 
 * @author TourCraft Team
 * @since 2024 - Phase 2 Généralisation
 */

// Hooks d'actions génériques
export { default as useGenericAction } from './actions/useGenericAction';
export { default as useGenericFormAction } from './actions/useGenericFormAction';

// Hooks de recherche génériques  
export { default as useGenericSearch } from './search/useGenericSearch';
export { default as useGenericFilteredSearch } from './search/useGenericFilteredSearch';

// Hooks de listes génériques (Semaine 2)
// export { default as useGenericEntityList } from './lists/useGenericEntityList';

// Hooks de formulaires génériques (Semaine 3)
// export { default as useGenericEntityForm } from './forms/useGenericEntityForm';
// export { default as useGenericValidation } from './validation/useGenericValidation';

// Hooks de données génériques (Semaine 2)
// export { default as useGenericDataFetcher } from './data/useGenericDataFetcher';
