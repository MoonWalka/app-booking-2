// src/components/artistes/ArtisteDetail.jsx
import React from 'react';
import { useResponsive } from '@/hooks/common/useResponsive';

function ArtisteDetail(props) {
  const { getResponsiveComponent } = useResponsive();
  const ResponsiveComponent = getResponsiveComponent({
    desktopPath: 'artistes/desktop/ArtisteDetail',
    mobilePath: 'artistes/mobile/ArtisteDetail'
  });
  
  return <ResponsiveComponent {...props} />;
}

export default ArtisteDetail;
