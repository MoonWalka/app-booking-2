// src/hooks/contacts/index.js
// Re-export hooks specific to contacts
export { default as useAddressSearch } from './useAddressSearch';
// export { default as useContactDetails } from './useContactDetails'; // SUPPRIMÉ
export { default as useContactSearch } from './useContactSearch';
export { useContactContrats } from './useContactContrats';
export { useContactFactures } from './useContactFactures';

// Exporter les hooks migrés avec un nom explicite (pour la transition progressive)


// Exporter le hook de recherche migré


// Exports des hooks de formulaire
// export { default as useContactForm } from './useContactForm'; // SUPPRIMÉ


// Add alias for migrated details hook

// Exports des autres hooks spécifiques aux contacts
// export { default as useAdresseValidation } from './useAdresseValidation'; // SUPPRIMÉ
export { default as useLieuSearch } from './useLieuSearch';
export { default as useCompanySearch } from './useCompanySearch';
// export { default as useConcertSearch } from './useConcertSearch'; // SUPPRIMÉ
export { default as useFormSubmission } from './useFormSubmission';
export { default as useDeleteContact } from './useDeleteContact';
export { default as useDeleteContactRelational } from './useDeleteContactRelational';
export { default as useHistoriqueEchanges } from './useHistoriqueEchanges';