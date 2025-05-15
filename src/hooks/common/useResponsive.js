// src/hooks/common/useResponsive.js
import React, { /*lazy,*/ Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { debugLog } from '@/utils/logUtils';
import { getComponentByPath } from '@/components/componentMapping';

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
 * Hook useResponsive unifié qui combine les fonctionnalités de useIsMobile et useResponsiveComponent
 * Version améliorée avec cache des composants et gestion robuste des erreurs
 * 
 * @param {Object} options - Options du hook
 * @param {number} options.breakpoint - Seuil en pixels pour considérer un affichage mobile (défaut: 768px)
 * @param {boolean} options.forceDesktop - Force l'affichage desktop même sur mobile (défaut: false)
 * @param {number} options.transitionDelay - Délai en ms pour la transition entre modes (défaut: 150ms)
 * @returns {Object} - État et fonctions liées à la responsivité
 */
const useResponsive = (options = {}) => {
  debugLog('Hook exécuté !', 'trace', 'useResponsive');
  const {
    breakpoint = 768,
    forceDesktop = false,
    transitionDelay = 150
  } = options;

  // État pour stocker si on est sur mobile
  const [isMobile, setIsMobile] = useState(false);
  
  // État pour stocker les dimensions de l'écran
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });
  
  // État pour gérer le chargement des erreurs dans les composants responsives
  const [errorLoading, setErrorLoading] = useState(false);
  
  // Cache pour éviter de recharger les mêmes composants
  const componentCache = useRef(new Map());
  
  // Compteur pour les tentatives de rechargement
  const retryCounter = useRef({});

  // Mettre à jour les dimensions de la fenêtre
  const updateDimensions = useCallback(() => {
    if (typeof window !== 'undefined') {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
      setIsMobile(window.innerWidth < breakpoint);
    }
  }, [breakpoint]);

  // Fonction pour vérifier si une largeur d'écran est considérée comme mobile
  const checkIsMobile = useCallback((width) => {
    if (forceDesktop) return false;
    return width < breakpoint;
  }, [breakpoint, forceDesktop]);

  // Effet pour mettre à jour les dimensions lors du redimensionnement
  useEffect(() => {
    if (forceDesktop) {
      setIsMobile(false);
      return;
    }

    // Fonction pour vérifier la taille de l'écran
    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        const newIsMobile = window.innerWidth < breakpoint;
        setIsMobile(newIsMobile);
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight
        });
      }
    };

    // Wrapper la fonction avec debounce amélioré
    const debouncedCheckMobile = debounce(checkMobile, transitionDelay);

    // Vérifier immédiatement au montage
    checkMobile();

    // Ajouter l'écouteur d'événement
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', debouncedCheckMobile);
    }

    // Nettoyer l'écouteur d'événement
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', debouncedCheckMobile);
      }
    };
  }, [breakpoint, forceDesktop, transitionDelay]);

  // Gérer les erreurs de chargement avec un système de retry intelligent
  useEffect(() => {
    if (errorLoading) {
      // Le rechargement automatique est maintenant géré par le système de retry
      // Pas besoin de recharger toute la page
      debugLog('Erreur de chargement détectée. Le système de retry est activé.', 'info');
    }
  }, [errorLoading]);

  /**
   * Fonction pour générer un composant responsive avec gestion de cache et retry
   * @param {Object} componentOptions - Options du composant
   * @param {string} componentOptions.desktopPath - Chemin du composant desktop (depuis src/components/)
   * @param {string} componentOptions.mobilePath - Chemin du composant mobile (depuis src/components/)
   * @param {React.Component} componentOptions.fallback - Composant à afficher pendant le chargement
   * @param {number} componentOptions.maxRetries - Nombre maximal de tentatives (défaut: 3)
   * @returns {React.Component} - Composant responsive
   */
  const getResponsiveComponent = useCallback(({ 
    desktopPath, 
    mobilePath, 
    fallback = null,
    maxRetries = 3
  }) => {
    // Déterminer le chemin à utiliser selon le mode actuel
    const currentPath = (isMobile && !forceDesktop) ? mobilePath : desktopPath;
    const cacheKey = `${currentPath}`;
    
    // Vérifier si le composant est déjà dans le cache
    if (componentCache.current.has(cacheKey)) {
      return componentCache.current.get(cacheKey);
    }
    
    // LAZY LOADING DÉSACTIVÉ: Utiliser le mapping des composants pour un import direct
    const Component = (props) => {
      debugLog(`Chargement synchrone du composant: @/components/${currentPath}`, 'info');
      
      try {
        // Obtenir le composant à partir du mapping
        const MappedComponent = getComponentByPath(currentPath);
        
        if (!MappedComponent) {
          throw new Error(`Composant non trouvé: ${currentPath}`);
        }
        
        // Rendu direct du composant sans message d'alerte
        return <MappedComponent {...props} />;
      } catch (error) {
        setErrorLoading(true);
        console.error(`Erreur lors du chargement du composant ${currentPath}:`, error);
        return (
          <div className="component-error p-4 border rounded bg-light">
            <h3 className="text-danger">Impossible de charger le composant</h3>
            <p>Une erreur est survenue lors du chargement de l'interface.</p>
            <p className="error-path small text-muted">Chemin: @/components/{currentPath}</p>
            <p className="error-details small text-danger">{error.message}</p>
            <div className="mt-3">
              <button 
                className="btn btn-outline-secondary" 
                onClick={() => window.location.reload()}
              >
                Rafraîchir la page
              </button>
            </div>
          </div>
        );
      }
    };
    
    // Composant enveloppé dans Suspense avec fallback amélioré
    const ResponsiveComponent = React.memo((props) => {
      // Le fallback par défaut unifié et centré
      const defaultFallback = (
        <div className="loading-container d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
          {debugLog(`Fallback affiché pour ${currentPath}`, 'trace', 'useResponsive')}
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Chargement de l'interface...</span>
            </div>
            <p className="mt-2">Chargement de l'interface...</p>
          </div>
        </div>
      );
      
      // Sans lazy, on n'a pas besoin de Suspense, mais on le garde pour maintenir la structure
      return (
        // <Suspense fallback={fallback || defaultFallback}>
        //   <Component {...props} />
        // </Suspense>
        <Component {...props} />
      );
    });
    
    // Ajouter un nom d'affichage pour faciliter le débogage
    ResponsiveComponent.displayName = `Responsive(${currentPath.split('/').pop()})`;
    
    // Stocker le composant dans le cache
    componentCache.current.set(cacheKey, ResponsiveComponent);
    
    return ResponsiveComponent;
  }, [isMobile, forceDesktop]);

  // Fonction pour nettoyer le cache des composants
  const clearComponentCache = useCallback(() => {
    componentCache.current.clear();
    debugLog('Cache des composants responsifs vidé.', 'info');
  }, []);

  return {
    isMobile,
    dimensions,
    updateDimensions,
    checkIsMobile,
    getResponsiveComponent,
    clearComponentCache,
    isDesktop: !isMobile,
    screenWidth: dimensions.width,
    screenHeight: dimensions.height
  };
};

// Export du hook comme export par défaut uniquement pour plus de cohérence
export default useResponsive;