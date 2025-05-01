// src/hooks/useResponsiveComponent.js
import useResponsive from './common/useResponsive';

/**
 * @deprecated Use useResponsive().getResponsiveComponent() from './common/useResponsive' instead
 */
export const useResponsiveComponent = (options) => {
  // Function to maintain backward compatibility while refactoring
  const { getResponsiveComponent } = useResponsive();
  return getResponsiveComponent(options);
};

export default useResponsiveComponent;