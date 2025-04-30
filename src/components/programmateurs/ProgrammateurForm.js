// src/components/forms/ProgrammateurForm.js
import React from 'react';
import { useResponsiveComponent } from '@/hooks/useResponsiveComponent';

function ProgrammateurForm(props) {
  const ResponsiveComponent = useResponsiveComponent({
    desktopPath: 'programmateurs/desktop/ProgrammateurForm',
    mobilePath: 'programmateurs/mobile/ProgrammateurForm'
  });
  
  return <ResponsiveComponent {...props} />;
}

export default ProgrammateurForm;
