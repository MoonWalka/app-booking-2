/**
 * @fileoverview Hook générique pour la gestion responsive
 * Hook générique créé lors de la Phase 3 - Optimisation et adoption généralisée
 * 
 * @author TourCraft Team
 * @since 2024
 * @phase Phase 3 - Optimisation et adoption généralisée
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

/**
 * Hook générique pour la gestion responsive avancée
 * 
 * @description
 * Fonctionnalités supportées :
 * - responsive_detection: Détection multi-breakpoints avec cache
 * - responsive_orientation: Gestion de l'orientation (portrait/landscape)
 * - responsive_performance: Optimisations avec debounce et throttle
 * - responsive_presets: Configurations prédéfinies (mobile, tablet, desktop)
 * - responsive_hooks: Callbacks pour les changements de breakpoint
 * 
 * @param {Object} config - Configuration du hook
 * @param {Object} options - Options additionnelles
 * 
 * @returns {Object} Interface du hook générique
 * @returns {boolean} returns.isMobile - Indique si l'écran est mobile
 * @returns {boolean} returns.isTablet - Indique si l'écran est tablette
 * @returns {boolean} returns.isDesktop - Indique si l'écran est desktop
 * @returns {string} returns.currentBreakpoint - Breakpoint actuel
 * @returns {Object} returns.dimensions - Dimensions de l'écran
 * @returns {string} returns.orientation - Orientation de l'écran
 * @returns {Function} returns.matchBreakpoint - Vérifier un breakpoint
 * 
 * @example
 * ```javascript
 * // Configuration basique
 * const { isMobile, isDesktop, currentBreakpoint } = useGenericResponsive();
 * 
 * // Configuration avancée
 * const responsive = useGenericResponsive({
 *   breakpoints: {
 *     mobile: 768,
 *     tablet: 1024,
 *     desktop: 1200
 *   },
 *   enableOrientation: true,
 *   onBreakpointChange: (breakpoint) => {
 *     console.log('Nouveau breakpoint:', breakpoint);
 *   }
 * }, {
 *   debounceDelay: 100,
 *   enablePerformanceMode: true
 * });
 * ```
 * 
 * @complexity MEDIUM
 * @businessCritical false
 * @generic true
 * @replaces useResponsive
 */
const useGenericResponsive = (config = {}, options = {}) => {
  const {
    breakpoints = {
      mobile: 768,
      tablet: 1024,
      desktop: 1200,
      wide: 1440
    },
    enableOrientation = true,
    enableDeviceDetection = false,
    onBreakpointChange = null,
    onOrientationChange = null,
    forceBreakpoint = null // Pour les tests ou cas spéciaux
  } = config;
  
  const {
    debounceDelay = 150,
    throttleDelay = 50,
    enablePerformanceMode = true,
    enableLogging = false,
    cacheResults = true
  } = options;
  
  // Références pour les timeouts et cache
  const debounceTimeout = useRef(null);
  const throttleTimeout = useRef(null);
  const lastUpdate = useRef(0);
  const cache = useRef({});
  
  // Fonction pour calculer le breakpoint (définie avant utilisation)
  const calculateBreakpoint = useCallback((width, breakpointConfig) => {
    const cacheKey = `${width}_${JSON.stringify(breakpointConfig)}`;
    
    if (cacheResults && cache.current[cacheKey]) {
      return cache.current[cacheKey];
    }
    
    let result = 'mobile';
    
    if (width >= breakpointConfig.wide) {
      result = 'wide';
    } else if (width >= breakpointConfig.desktop) {
      result = 'desktop';
    } else if (width >= breakpointConfig.tablet) {
      result = 'tablet';
    } else {
      result = 'mobile';
    }
    
    if (cacheResults) {
      cache.current[cacheKey] = result;
    }
    
    return result;
  }, [cacheResults]);
  
  // Fonction pour détecter le type d'appareil
  const detectDeviceType = useCallback(() => {
    if (typeof window === 'undefined') return 'desktop';
    
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
      return 'mobile';
    } else if (/tablet|ipad/i.test(userAgent)) {
      return 'tablet';
    } else {
      return 'desktop';
    }
  }, []);
  
  // État principal
  const [state, setState] = useState(() => {
    if (typeof window === 'undefined') {
      return {
        width: 0,
        height: 0,
        currentBreakpoint: 'desktop',
        orientation: 'landscape',
        deviceType: 'desktop'
      };
    }
    
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    return {
      width,
      height,
      currentBreakpoint: forceBreakpoint || calculateBreakpoint(width, breakpoints),
      orientation: enableOrientation ? (height > width ? 'portrait' : 'landscape') : 'landscape',
      deviceType: enableDeviceDetection ? detectDeviceType() : 'desktop'
    };
  });
  
  // Fonction de mise à jour avec throttle/debounce
  const updateDimensions = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const now = Date.now();
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Throttle pour les performances
    if (enablePerformanceMode && now - lastUpdate.current < throttleDelay) {
      if (throttleTimeout.current) {
        clearTimeout(throttleTimeout.current);
      }
      
      throttleTimeout.current = setTimeout(() => {
        updateDimensions();
      }, throttleDelay);
      
      return;
    }
    
    lastUpdate.current = now;
    
    const newBreakpoint = forceBreakpoint || calculateBreakpoint(width, breakpoints);
    const newOrientation = enableOrientation ? (height > width ? 'portrait' : 'landscape') : 'landscape';
    const newDeviceType = enableDeviceDetection ? detectDeviceType() : 'desktop';
    
    const newState = {
      width,
      height,
      currentBreakpoint: newBreakpoint,
      orientation: newOrientation,
      deviceType: newDeviceType
    };
    
    // Vérifier les changements pour les callbacks
    const breakpointChanged = newBreakpoint !== state.currentBreakpoint;
    const orientationChanged = newOrientation !== state.orientation;
    
    setState(newState);
    
    // Callbacks
    if (breakpointChanged && onBreakpointChange) {
      onBreakpointChange(newBreakpoint, state.currentBreakpoint);
    }
    
    if (orientationChanged && onOrientationChange) {
      onOrientationChange(newOrientation, state.orientation);
    }
    
    if (enableLogging) {
      console.log('[useGenericResponsive] État mis à jour:', newState);
    }
  }, [
    breakpoints, 
    enableOrientation, 
    enableDeviceDetection, 
    enablePerformanceMode,
    throttleDelay,
    forceBreakpoint,
    calculateBreakpoint,
    detectDeviceType,
    onBreakpointChange,
    onOrientationChange,
    state.currentBreakpoint,
    state.orientation,
    enableLogging
  ]);
  
  // Fonction debounced pour les événements resize
  const debouncedUpdate = useCallback(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    
    debounceTimeout.current = setTimeout(() => {
      updateDimensions();
    }, debounceDelay);
  }, [updateDimensions, debounceDelay]);
  
  // Effet pour l'écoute des événements
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Mise à jour initiale
    updateDimensions();
    
    // Écouter les événements
    window.addEventListener('resize', debouncedUpdate);
    
    if (enableOrientation) {
      window.addEventListener('orientationchange', debouncedUpdate);
    }
    
    // Nettoyage
    return () => {
      window.removeEventListener('resize', debouncedUpdate);
      
      if (enableOrientation) {
        window.removeEventListener('orientationchange', debouncedUpdate);
      }
      
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      
      if (throttleTimeout.current) {
        clearTimeout(throttleTimeout.current);
      }
    };
  }, [debouncedUpdate, enableOrientation, updateDimensions]);
  
  // Propriétés calculées mémorisées
  const computedProperties = useMemo(() => {
    const { currentBreakpoint, width, height, orientation, deviceType } = state;
    
    return {
      // Breakpoints booléens
      isMobile: currentBreakpoint === 'mobile',
      isTablet: currentBreakpoint === 'tablet',
      isDesktop: currentBreakpoint === 'desktop',
      isWide: currentBreakpoint === 'wide',
      
      // Orientations booléennes
      isPortrait: orientation === 'portrait',
      isLandscape: orientation === 'landscape',
      
      // Types d'appareils booléens
      isMobileDevice: deviceType === 'mobile',
      isTabletDevice: deviceType === 'tablet',
      isDesktopDevice: deviceType === 'desktop',
      
      // Dimensions
      dimensions: { width, height },
      screenWidth: width,
      screenHeight: height,
      aspectRatio: width > 0 ? width / height : 1,
      
      // Métadonnées
      currentBreakpoint,
      orientation,
      deviceType
    };
  }, [state]);
  
  // Fonctions utilitaires
  const matchBreakpoint = useCallback((breakpointName) => {
    return state.currentBreakpoint === breakpointName;
  }, [state.currentBreakpoint]);
  
  const isBreakpointUp = useCallback((breakpointName) => {
    const breakpointOrder = ['mobile', 'tablet', 'desktop', 'wide'];
    const currentIndex = breakpointOrder.indexOf(state.currentBreakpoint);
    const targetIndex = breakpointOrder.indexOf(breakpointName);
    
    return currentIndex >= targetIndex;
  }, [state.currentBreakpoint]);
  
  const isBreakpointDown = useCallback((breakpointName) => {
    const breakpointOrder = ['mobile', 'tablet', 'desktop', 'wide'];
    const currentIndex = breakpointOrder.indexOf(state.currentBreakpoint);
    const targetIndex = breakpointOrder.indexOf(breakpointName);
    
    return currentIndex <= targetIndex;
  }, [state.currentBreakpoint]);
  
  const getBreakpointValue = useCallback((breakpointName) => {
    return breakpoints[breakpointName] || 0;
  }, [breakpoints]);
  
  // Fonction pour forcer une mise à jour
  const forceUpdate = useCallback(() => {
    updateDimensions();
  }, [updateDimensions]);
  
  // Fonction pour nettoyer le cache
  const clearCache = useCallback(() => {
    cache.current = {};
  }, []);
  
  return {
    // Propriétés principales
    ...computedProperties,
    
    // Fonctions utilitaires
    matchBreakpoint,
    isBreakpointUp,
    isBreakpointDown,
    getBreakpointValue,
    forceUpdate,
    clearCache,
    
    // Configuration
    breakpoints,
    
    // Métadonnées
    _config: {
      breakpoints,
      enableOrientation,
      enableDeviceDetection,
      debounceDelay,
      throttleDelay
    }
  };
};

export default useGenericResponsive; 