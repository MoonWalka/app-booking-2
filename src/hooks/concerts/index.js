// ========== HOOKS OPTIMISÉS (RECOMMANDÉS) ==========
// Ces hooks suivent l'approche recommandée et utilisent directement les hooks génériques



// ========== HOOKS DE COMPATIBILITÉ (DÉPRÉCIÉS) ==========
// Ces hooks sont maintenus pour la compatibilité mais seront supprimés en novembre 2025

// export { default as useConcertForm } from './useConcertForm'; // Version avec problème d'affichage
export { default as useConcertForm } from './useConcertFormFixed'; // Version corrigée

// export { default as useConcertDetails } from './useConcertDetails'; // Version avec boucles infinies
export { default as useConcertDetails } from './useConcertDetailsFixed'; // Version corrigée


// Supprimer cette exportation redondante

export { default as useConcertStatus } from './useConcertStatus';
export { default as useConcertWatcher } from './useConcertWatcher';



// Exports des autres hooks spécifiques aux concerts
export { default as useConcertListData } from './useConcertListData';
export { default as useConcertFilters } from './useConcertFilters';
export { default as useConcertActions } from './useConcertActions';
export { default as useConcerts } from './useConcerts';
export { default as useConcertAssociations } from './useConcertAssociations';
export { default as useEntitySearch } from './useEntitySearch';
export { default as useFormSubmission } from './useFormSubmission';

// Exports pour la gestion de la suppression de concerts
export { default as useConcertDelete } from './useConcertDelete';

// export { default as useConcertDetailsUltraSimple } from './useConcertDetailsUltraSimple'; // Supprimé - Plus nécessaire
export { default as useConcertFormWithRelations } from './useConcertFormWithRelations';
export { default as useConcertFormsManagement } from './useConcertFormsManagement';

// Hook simplifié pour la liste
export { useConcertListSimplified } from './useConcertListSimplified';
