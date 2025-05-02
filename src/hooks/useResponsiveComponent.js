// src/hooks/useResponsiveComponent.js
/**
 * @deprecated Ce hook est déprécié. Veuillez utiliser useResponsive().getResponsiveComponent() depuis 
 * '@/hooks/common/useResponsive' à la place. Ce fichier sera supprimé dans une future version.
 */
import { useResponsive } from './common';

export const useResponsiveComponent = (options) => {
  console.warn(
    'Avertissement: useResponsiveComponent est déprécié. ' +
    'Veuillez utiliser useResponsive().getResponsiveComponent depuis @/hooks/common à la place.'
  );
  
  // Function to maintain backward compatibility while refactoring
  const { getResponsiveComponent } = useResponsive();
  return getResponsiveComponent(options);
};

export default useResponsiveComponent;