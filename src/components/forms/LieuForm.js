// src/components/forms/LieuForm.js
import React from 'react';
import { useResponsiveComponent } from '@/hooks/useResponsiveComponent';

function LieuForm(props) {
  const ResponsiveComponent = useResponsiveComponent({
    desktopPath: 'forms/desktop/LieuForm',
    mobilePath: 'forms/mobile/LieuForm'
  });
  
  return <ResponsiveComponent {...props} />;
}

export default LieuForm;
