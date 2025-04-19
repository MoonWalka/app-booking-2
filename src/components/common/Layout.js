// src/components/common/Layout.js
import React from 'react';
import { useResponsiveComponent } from '@hooks/useResponsiveComponent';

function Layout() {
  const ResponsiveLayout = useResponsiveComponent({
    desktopPath: 'common/layout/DesktopLayout',
    mobilePath: 'common/layout/MobileLayout',
    breakpoint: 768
  });
  
  return <ResponsiveLayout />;
}

export default Layout;
