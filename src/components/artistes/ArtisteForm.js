// src/components/artistes/ArtisteForm.js
import React from 'react';
import { useResponsive } from '@/hooks/common/useResponsive';

function ArtisteForm(props) {
  const { getResponsiveComponent } = useResponsive();
  const ResponsiveComponent = getResponsiveComponent({
    desktopPath: 'artistes/desktop/ArtisteForm',
    mobilePath: 'artistes/mobile/ArtisteForm'
  });
  
  return <ResponsiveComponent {...props} />;
}

export default ArtisteForm;