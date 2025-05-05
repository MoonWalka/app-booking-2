// src/components/lieux/LieuxList.js
import React from 'react';
import { useResponsive } from '@/hooks/common/useResponsive';
import Spinner from '@/components/common/Spinner';

/**
 * LieuxList - Responsive component for listing venues
 * Will render either desktop or mobile version based on screen size
 */
function LieuxList(props) {
  // Create a custom fallback with our standardized Spinner component
  const customFallback = <Spinner message="Chargement de la liste des lieux..." contentOnly={true} />;
  
  const { getResponsiveComponent } = useResponsive();
  const ResponsiveComponent = getResponsiveComponent({
    desktopPath: 'lieux/desktop/LieuxList',
    mobilePath: 'lieux/mobile/LieuxList',
    fallback: customFallback // Use our standardized spinner as fallback
  });
  
  return <ResponsiveComponent {...props} />;
}

export default LieuxList;
