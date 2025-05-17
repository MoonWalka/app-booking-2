// src/hooks/index.js
// Re-export des hooks communs spécifiques pour maintenir la compatibilité
export { 
  useAddressSearch,
  useLocationIQ,
  useResponsive,
  useResponsiveComponent
} from './common';

// Note: useIsMobile a été supprimé le 6 mai 2025 dans le cadre de la migration vers useResponsive
// Plus d'informations dans la documentation: /docs/hooks/MIGRATION_USEMOBILE_USERESPONSIVE_COMPLETE.md