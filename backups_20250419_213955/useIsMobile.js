// src/hooks/useIsMobile.js
import { useState, useEffect } from 'react';

// Fonction debounce pour limiter les appels lors du redimensionnement
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const useIsMobile = (breakpoint = 768) => {
  // Initialiser à false pour éviter les erreurs au SSR
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Fonction pour vérifier la taille de l'écran
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Wrapper la fonction avec debounce
    const debouncedCheckMobile = debounce(checkMobile, 150);

    // Vérifier immédiatement au montage
    checkMobile();

    // Ajouter l'écouteur d'événement
    window.addEventListener('resize', debouncedCheckMobile);

    // Nettoyer l'écouteur d'événement
    return () => window.removeEventListener('resize', debouncedCheckMobile);
  }, [breakpoint]);

  return isMobile;
};