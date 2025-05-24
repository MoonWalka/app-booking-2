// src/hooks/common/useResponsive.js
import { useState, useEffect, useCallback } from 'react';
import { debugLog } from '@/utils/logUtils';

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

/**
 * Hook useResponsive simplifié - détection de taille d'écran uniquement
 * 
 * @param {Object} options - Options du hook
 * @param {number} options.breakpoint - Seuil en pixels pour considérer un affichage mobile (défaut: 768px)
 * @param {boolean} options.forceDesktop - Force l'affichage desktop même sur mobile (défaut: false)
 * @param {number} options.transitionDelay - Délai en ms pour la transition entre modes (défaut: 150ms)
 * @returns {Object} - État et fonctions liées à la responsivité
 */
const useResponsive = (options = {}) => {
  debugLog('Hook useResponsive exécuté', 'trace', 'useResponsive');
  
  const {
    breakpoint = 768,
    forceDesktop = false,
    transitionDelay = 150
  } = options;

  // État pour stocker si on est sur mobile
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    if (forceDesktop) return false;
    return window.innerWidth < breakpoint;
  });
  
  // État pour stocker les dimensions de l'écran
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

  // Fonction pour vérifier si une largeur d'écran est considérée comme mobile
  const checkIsMobile = useCallback((width) => {
    if (forceDesktop) return false;
    return width < breakpoint;
  }, [breakpoint, forceDesktop]);

  // Mettre à jour les dimensions de la fenêtre
  const updateDimensions = useCallback(() => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setDimensions({ width, height });
      setIsMobile(forceDesktop ? false : width < breakpoint);
    }
  }, [breakpoint, forceDesktop]);

  // Effet pour mettre à jour les dimensions lors du redimensionnement
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Fonction pour vérifier la taille de l'écran
    const checkMobile = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setDimensions({ width, height });
      setIsMobile(forceDesktop ? false : width < breakpoint);
    };

    // Wrapper la fonction avec debounce
    const debouncedCheckMobile = debounce(checkMobile, transitionDelay);

    // Vérifier immédiatement au montage
    checkMobile();

    // Ajouter l'écouteur d'événement
    window.addEventListener('resize', debouncedCheckMobile);

    // Nettoyer l'écouteur d'événement
    return () => {
      window.removeEventListener('resize', debouncedCheckMobile);
    };
  }, [breakpoint, forceDesktop, transitionDelay]);

  return {
    // Propriétés principales
    isMobile,
    isDesktop: !isMobile,
    
    // Dimensions
    dimensions,
    screenWidth: dimensions.width,
    screenHeight: dimensions.height,
    
    // Fonctions utilitaires
    checkIsMobile,
    updateDimensions
  };
};

export default useResponsive;