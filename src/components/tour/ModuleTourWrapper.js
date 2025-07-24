import React from 'react';
import { useModuleTour } from '@/hooks/useModuleTour';

/**
 * Wrapper component qui active les tours contextuels par module
 */
const ModuleTourWrapper = ({ children }) => {
  // Active le hook qui détecte les changements de route et lance les tours
  useModuleTour();
  
  return <>{children}</>;
};

export default ModuleTourWrapper;