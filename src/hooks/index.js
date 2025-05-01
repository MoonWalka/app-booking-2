// src/hooks/index.js
// Re-export all common hooks to maintain backward compatibility
export { 
  useAddressSearch,
  useLocationIQ,
  useResponsive,
  useResponsiveComponent
} from './common';

// Re-export useIsMobile from its own file to maintain the force desktop override
export { useIsMobile } from './useIsMobile';