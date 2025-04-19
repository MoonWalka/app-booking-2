// src/components/lieux/LieuDetails.js
import React from 'react';
import { useResponsiveComponent } from '@hooks/useResponsiveComponent';

function LieuDetails(props) {
  const ResponsiveComponent = useResponsiveComponent({
    desktopPath: 'lieux/desktop/LieuDetails',
    mobilePath: 'lieux/mobile/LieuDetails'
  });
  
  return <ResponsiveComponent {...props} />;
}

export default LieuDetails;
