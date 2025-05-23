
// ========== HOOKS OPTIMISÉS (RECOMMANDÉS) ==========
// Ces hooks suivent l'approche recommandée et utilisent directement les hooks génériques



// ========== HOOKS DE COMPATIBILITÉ (DÉPRÉCIÉS) ==========
// Ces hooks sont maintenus pour la compatibilité mais seront supprimés en novembre 2025

export { default as useConcertForm } from './useConcertForm';

export { default as useConcertDetails } from './useConcertDetails';


// Supprimer cette exportation redondante

export { default as useConcertStatus } from './useConcertStatus';

export { default as useConcertStatusMigrated } from './useConcertStatusMigrated';

export { default as useConcertStatusV2 } from './useConcertStatusMigrated';

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
