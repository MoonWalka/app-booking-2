// src/hooks/useIsMobile.js
/**
 * @deprecated Ce hook est déprécié. Veuillez utiliser la propriété isMobile de useResponsive() depuis 
 * '@/hooks/common/useResponsive' à la place. Ce fichier sera supprimé dans une future version.
 */
import { useResponsive } from './common';

export const useIsMobile = (breakpoint = 768) => {
  console.warn(
    'Avertissement: useIsMobile est déprécié. ' +
    'Veuillez utiliser useResponsive().isMobile depuis @/hooks/common à la place.'
  );
  
  const { isMobile } = useResponsive({ breakpoint });
  return isMobile;
};

export default useIsMobile;