// src/hooks/common/index.js
export { default as useAddressSearch } from './useAddressSearch';
export { default as useCompanySearch } from './useCompanySearch';
export { default as useEntitySearch } from './useEntitySearch';
export { default as useLocationIQ } from './useLocationIQ';
export { default as useResponsive } from './useResponsive';
export { default as useTheme } from './useTheme';
// Add an alias for useResponsiveComponent to maintain backward compatibility during transition
export { default as useResponsiveComponent } from './useResponsive';
export { default as useGenericEntityForm } from './useGenericEntityForm';
export { useGenericEntityForm as useEntityForm } from './useGenericEntityForm';

// Import du nouveau hook générique de recherche
export { default as useGenericEntitySearch } from './useGenericEntitySearch';

// Import du nouveau hook générique de détails d'entité
export { default as useGenericEntityDetails } from './useGenericEntityDetails';

// Import du nouveau hook générique de liste d'entités
export { default as useGenericEntityList } from './useGenericEntityList';

// Import du hook générique de recherche et filtrage
export { default as useSearchAndFilter } from './useSearchAndFilter';

// Import du nouveau hook générique de suppression d'entité
export { default as useGenericEntityDelete } from './useGenericEntityDelete';