// src/hooks/concerts/index.js

// Export du hook original (maintenant un wrapper)
export { default as useConcertDetails } from './useConcertDetails';

// Export de la version migrée avec son nom original
export { default as useConcertDetailsMigrated } from './useConcertDetailsMigrated';

/**
 * @recommended La version migrée du hook useConcertDetails basée sur les hooks génériques.
 * À utiliser dans les nouveaux développements.
 */
export { default as useConcertDetailsV2 } from './useConcertDetailsMigrated';

// Exports des autres hooks spécifiques aux concerts
export { default as useConcertForm } from './useConcertForm';
export { default as useConcertStatus } from './useConcertStatus';
export { default as useConcertListData } from './useConcertListData';
export { default as useConcertFilters } from './useConcertFilters';
export { default as useConcertActions } from './useConcertActions';
