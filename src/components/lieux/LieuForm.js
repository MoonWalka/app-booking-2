// src/components/forms/LieuForm.js
import React from 'react';
import { useResponsiveComponent } from '@/hooks/useResponsiveComponent';
import Spinner from '@/components/common/Spinner';

function LieuForm(props) {
  // Créer un fallback personnalisé avec notre composant Spinner standardisé
  const customFallback = <Spinner message="Chargement du formulaire..." contentOnly={true} />;
  
  const ResponsiveComponent = useResponsiveComponent({
    desktopPath: 'lieux/desktop/LieuForm',
    mobilePath: 'lieux/mobile/LieuForm',
    fallback: customFallback // Utiliser notre spinner standardisé comme fallback
  });
  
  return <ResponsiveComponent {...props} />;
}

export default LieuForm;
