/**
 * @fileoverview Hook générique pour la gestion responsive
 * Hook générique créé lors de la Phase 3 - Optimisation et adoption généralisée
 * 
 * @author TourCraft Team
 * @since 2024
 * @phase Phase 3 - Optimisation et adoption généralisée
 * 
 * CORRECTIONS APPLIQUÉES POUR ÉVITER LES BOUCLES DE RE-RENDERS :
 * - Stabilisation de l'état avec useMemo pour éviter les objets instables
 * - Mémoïsation des callbacks avec useCallback
 * - Évitement des mises à jour inutiles avec comparaison d'état
 * - Utilisation de useRef pour les valeurs stables
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
  // ✅ CORRECTION 1: Stabiliser la configuration avec useMemo
  const stableConfig = useMemo(() => ({
    breakpoints: config.breakpoints || {
      mobile: 768,
      tablet: 1024,
      desktop: 1200,
      wide: 1440
    },
    enableOrientation: config.enableOrientation !== false,
    enableDeviceDetection: config.enableDeviceDetection || false,
    forceBreakpoint: config.forceBreakpoint || null
  }), [
    config.breakpoints,
    config.enableOrientation,
    config.enableDeviceDetection,
    config.forceBreakpoint
  ]);

  const stableOptions = useMemo(() => ({
    debounceDelay: options.debounceDelay || 150,
    throttleDelay: options.throttleDelay || 50,
    enablePerformanceMode: options.enablePerformanceMode !== false,
    enableLogging: options.enableLogging || false,
    cacheResults: options.cacheResults !== false
  }), [
    options.debounceDelay,
    options.throttleDelay,
    options.enablePerformanceMode,
    options.enableLogging,
    options.cacheResults
  ]);

  // ✅ CORRECTION 2: Références stables pour les callbacks
  const callbacksRef = useRef({
    onBreakpointChange: config.onBreakpointChange,
    onOrientationChange: config.onOrientationChange
  });

  // Mettre à jour les callbacks uniquement quand nécessaire
  useEffect(() => {
    callbacksRef.current = {
      onBreakpointChange: config.onBreakpointChange,
      onOrientationChange: config.onOrientationChange
    };
  }, [config.onBreakpointChange, config.onOrientationChange]);
  
  // Références pour les timeouts et cache
  const debounceTimeout = useRef(null);
  const throttleTimeout = useRef(null);
  const lastUpdate = useRef(0);
  const cache = useRef({});
  
  // ✅ CORRECTION 3: Fonction pour calculer le breakpoint stable
  const calculateBreakpoint = useCallback((width, breakpointConfig) => {
    const cacheKey = `${width}_${JSON.stringify(breakpointConfig)}`;
    
    if (stableOptions.cacheResults && cache.current[cacheKey]) {
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
    
    if (stableOptions.cacheResults) {
      cache.current[cacheKey] = result;
    }
    
    return result;
  }, [stableOptions.cacheResults]);
  
  // ✅ CORRECTION 4: Fonction pour détecter le type d'appareil stable
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
  
  // ✅ CORRECTION 5: État principal stable
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
      currentBreakpoint: stableConfig.forceBreakpoint || calculateBreakpoint(width, stableConfig.breakpoints),
      orientation: stableConfig.enableOrientation ? (height > width ? 'portrait' : 'landscape') : 'landscape',
      deviceType: stableConfig.enableDeviceDetection ? detectDeviceType() : 'desktop'
    };
  });
  
  // ✅ CORRECTION 6: Fonction de mise à jour avec throttle/debounce stable
  const updateDimensions = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const now = Date.now();
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Throttle pour les performances
    if (stableOptions.enablePerformanceMode && now - lastUpdate.current < stableOptions.throttleDelay) {
      if (throttleTimeout.current) {
        clearTimeout(throttleTimeout.current);
      }
      
      throttleTimeout.current = setTimeout(() => {
        updateDimensions();
      }, stableOptions.throttleDelay);
      
      return;
    }
    
    lastUpdate.current = now;
    
    const newBreakpoint = stableConfig.forceBreakpoint || calculateBreakpoint(width, stableConfig.breakpoints);
    const newOrientation = stableConfig.enableOrientation ? (height > width ? 'portrait' : 'landscape') : 'landscape';
    const newDeviceType = stableConfig.enableDeviceDetection ? detectDeviceType() : 'desktop';
    
    // ✅ CORRECTION 7: Éviter les mises à jour inutiles
    setState(prevState => {
      // Vérifier si quelque chose a vraiment changé
      if (
        prevState.width === width &&
        prevState.height === height &&
        prevState.currentBreakpoint === newBreakpoint &&
        prevState.orientation === newOrientation &&
        prevState.deviceType === newDeviceType
      ) {
        return prevState; // Pas de changement, retourner l'état précédent
      }

      const newState = {
        width,
        height,
        currentBreakpoint: newBreakpoint,
        orientation: newOrientation,
        deviceType: newDeviceType
      };

      // Callbacks pour les changements
      if (prevState.currentBreakpoint !== newBreakpoint && callbacksRef.current.onBreakpointChange) {
        callbacksRef.current.onBreakpointChange(newBreakpoint, prevState.currentBreakpoint);
      }
      
      if (prevState.orientation !== newOrientation && callbacksRef.current.onOrientationChange) {
        callbacksRef.current.onOrientationChange(newOrientation, prevState.orientation);
      }

      return newState;
    });
  }, [
    stableConfig.breakpoints,
    stableConfig.enableOrientation,
    stableConfig.enableDeviceDetection,
    stableConfig.forceBreakpoint,
    stableOptions.enablePerformanceMode,
    stableOptions.throttleDelay,
    calculateBreakpoint,
    detectDeviceType
  ]);
  
  // ✅ CORRECTION 8: Fonction debounced stable
  const debouncedUpdate = useCallback(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    
    debounceTimeout.current = setTimeout(() => {
      updateDimensions();
    }, stableOptions.debounceDelay);
  }, [updateDimensions, stableOptions.debounceDelay]);
  
  // Effet pour l'écoute des événements
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Mise à jour initiale
    updateDimensions();
    
    // Écouter les événements
    window.addEventListener('resize', debouncedUpdate);
    
    if (stableConfig.enableOrientation) {
      window.addEventListener('orientationchange', debouncedUpdate);
    }
    
    // Nettoyage
    return () => {
      window.removeEventListener('resize', debouncedUpdate);
      
      if (stableConfig.enableOrientation) {
        window.removeEventListener('orientationchange', debouncedUpdate);
      }
      
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      
      if (throttleTimeout.current) {
        clearTimeout(throttleTimeout.current);
      }
    };
  }, [debouncedUpdate, stableConfig.enableOrientation, updateDimensions]);
  
  // ✅ CORRECTION 9: Propriétés calculées mémorisées et stables
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
      
      // ✅ CORRECTION 10: Dimensions stables
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
  
  // ✅ CORRECTION 11: Fonctions utilitaires stables
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
    return stableConfig.breakpoints[breakpointName] || 0;
  }, [stableConfig.breakpoints]);
  
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
    breakpoints: stableConfig.breakpoints,
    
    // Métadonnées
    _config: {
      breakpoints: stableConfig.breakpoints,
      enableOrientation: stableConfig.enableOrientation,
      enableDeviceDetection: stableConfig.enableDeviceDetection,
      debounceDelay: stableOptions.debounceDelay,
      throttleDelay: stableOptions.throttleDelay
    }
  };
};

export default useGenericResponsive; 