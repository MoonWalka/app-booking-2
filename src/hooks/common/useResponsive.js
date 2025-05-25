/**
 * @fileoverview Hook pour la gestion responsive
 * 
 * @deprecated Utilisez useGenericResponsive directement pour les nouveaux développements
 * @migrationDate 2025-01-XX
 * @replaces Wrapper autour de useGenericResponsive pour maintenir la compatibilité
 * 
 * Ce hook est maintenant un wrapper autour de useGenericResponsive.
 * Il maintient l'API existante pour la compatibilité avec le code existant,
 * mais utilise la logique générique en arrière-plan.
 * 
 * @author TourCraft Team
 * @since 2024
 * @phase Phase 3 - Migration vers hooks génériques utilitaires
 */

import { useMemo } from 'react';
import useGenericResponsive from '@/hooks/generics/utils/useGenericResponsive';

/**
 * Hook migré pour la gestion responsive
 * 
 * @deprecated Utilisez useGenericResponsive directement pour les nouveaux développements
 * 
 * Ce hook maintient l'API existante pour la compatibilité avec le code existant,
 * mais utilise useGenericResponsive en arrière-plan pour bénéficier des améliorations.
 * 
 * @param {Object} options - Options de configuration (optionnel)
 * @returns {Object} Interface du hook responsive
 * 
 * @example
 * ```javascript
 * // Utilisation existante (maintenue pour compatibilité)
 * const { isMobile, isDesktop, dimensions } = useResponsive();
 * 
 * // RECOMMANDÉ pour nouveaux développements :
 * import useGenericResponsive from '@/hooks/generics/utils/useGenericResponsive';
 * const { isMobile, isDesktop, dimensions } = useGenericResponsive();
 * ```
 */
const useResponsive = (options = {}) => {
  // Configuration pour maintenir la compatibilité avec l'ancienne API
  const responsiveConfig = useMemo(() => ({
    breakpoints: {
      mobile: options.breakpoint || 768,
      tablet: 1024,
      desktop: 1200,
      wide: 1440
    },
    enableOrientation: false, // Désactivé par défaut pour compatibilité
    enableDeviceDetection: false,
    forceBreakpoint: options.forceDesktop ? 'desktop' : null
  }), [options.breakpoint, options.forceDesktop]);
  
  // Options pour maintenir la compatibilité
  const responsiveOptions = useMemo(() => ({
    debounceDelay: options.transitionDelay || 150,
    enablePerformanceMode: true,
    enableLogging: false,
    cacheResults: true
  }), [options.transitionDelay]);
  
  // Utiliser le hook générique avec la configuration de compatibilité
  const genericHook = useGenericResponsive(responsiveConfig, responsiveOptions);
  
  // Fonction pour vérifier si une largeur est mobile (compatibilité)
  const checkIsMobile = useMemo(() => {
    return (width) => {
      if (options.forceDesktop) return false;
      return width < (options.breakpoint || 768);
    };
  }, [options.forceDesktop, options.breakpoint]);
  
  // Fonction pour mettre à jour les dimensions (compatibilité)
  const updateDimensions = genericHook.forceUpdate;
  
  // Retourner l'interface compatible avec l'ancienne API
  return {
    // API existante maintenue
    isMobile: genericHook.isMobile,
    isDesktop: genericHook.isDesktop,
    dimensions: genericHook.dimensions,
    screenWidth: genericHook.screenWidth,
    screenHeight: genericHook.screenHeight,
    
    // Fonctions de compatibilité
    checkIsMobile,
    updateDimensions,
    
    // Nouvelles fonctionnalités disponibles via le hook générique
    isTablet: genericHook.isTablet,
    isWide: genericHook.isWide,
    currentBreakpoint: genericHook.currentBreakpoint,
    aspectRatio: genericHook.aspectRatio,
    matchBreakpoint: genericHook.matchBreakpoint,
    isBreakpointUp: genericHook.isBreakpointUp,
    isBreakpointDown: genericHook.isBreakpointDown,
    
    // Informations de migration
    _migrationInfo: {
      isWrapper: true,
      originalHook: 'useResponsive',
      genericHook: 'useGenericResponsive',
      migrationDate: '2025-01-XX',
      phase: 'Phase 3'
    }
  };
};

export default useResponsive;