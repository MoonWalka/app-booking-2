// ========== HOOKS OPTIMISÉS (RECOMMANDÉS) ==========
// Ces hooks suivent l'approche recommandée et utilisent directement les hooks génériques



// ========== HOOKS DE COMPATIBILITÉ (DÉPRÉCIÉS) ==========
// Ces hooks sont maintenus pour la compatibilité mais seront supprimés en novembre 2025

export { default as useDateForm } from './useDateForm'; // Version moderne avec contactIds

// export { default as useDateDetails } from './useDateDetails'; // Version avec boucles infinies
// export { default as useDateDetails } from './useDateDetailsFixed'; // SUPPRIMÉ


// Supprimer cette exportation redondante

export { default as useDateStatus } from './useDateStatus';



// Exports des autres hooks spécifiques aux dates
export { default as useDateListData } from './useDateListData';
// export { default as useDateFilters } from './useDateFilters'; // SUPPRIMÉ
export { default as useDateActions } from './useDateActions';
// export { default as useDates } from './useDates'; // SUPPRIMÉ
export { default as useDateAssociations } from './useDateAssociations';
export { default as useEntitySearch } from './useEntitySearch';
export { default as useFormSubmission } from './useFormSubmission';

// Exports pour la gestion de la suppression de dates
export { default as useDateDelete } from './useDateDelete';

// export { default as useDateDetailsUltraSimple } from './useDateDetailsUltraSimple'; // Supprimé - Plus nécessaire
export { default as useDateFormWithRelations } from './useDateFormWithRelations';
export { default as useDateFormsManagement } from './useDateFormsManagement';

// Hook simplifié pour la liste
// export { useDateListSimplified } from './useDateListSimplified'; // SUPPRIMÉ
