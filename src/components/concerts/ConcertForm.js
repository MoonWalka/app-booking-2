// src/components/concerts/ConcertForm.js
import React from 'react';
import { useResponsiveComponent } from '@/hooks/useResponsiveComponent';

function ConcertForm(props) {
  const ResponsiveComponent = useResponsiveComponent({
    desktopPath: 'concerts/desktop/ConcertForm',
    mobilePath: 'concerts/mobile/ConcertForm'
  });
  
  return <ResponsiveComponent {...props} />;
}

export default ConcertForm;
