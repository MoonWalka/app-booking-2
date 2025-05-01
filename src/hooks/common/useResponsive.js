// src/hooks/common/useResponsive.js
import React, { lazy, Suspense, useState, useEffect, useCallback } from 'react';

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
 * @param {Object} options - Options du hook
 * @param {number} options.breakpoint - Seuil en pixels pour considérer un affichage mobile (défaut: 768px)
 * @param {boolean} options.forceDesktop - Force l'affichage desktop même sur mobile (défaut: false)
 * @returns {Object} - État et fonctions liées à la responsivité
 */
export const useResponsive = (options = {}) => {
  const {
    breakpoint = 768,
    forceDesktop = false
  } = options;

  // État pour stocker si on est sur mobile
  const [isMobile, setIsMobile] = useState(false);
  // État pour stocker les dimensions de l'écran
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

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

    // Wrapper la fonction avec debounce
    const debouncedCheckMobile = debounce(checkMobile, 150);

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
  }, [breakpoint, forceDesktop]);

  /**
   * Fonction pour générer un composant responsive
   * @param {Object} componentOptions - Options du composant
   * @param {string} componentOptions.desktopPath - Chemin du composant desktop (depuis src/components/)
   * @param {string} componentOptions.mobilePath - Chemin du composant mobile (depuis src/components/)
   * @param {React.Component} componentOptions.fallback - Composant à afficher pendant le chargement
   * @returns {React.Component} - Composant responsive
   */
  const getResponsiveComponent = useCallback(({ desktopPath, mobilePath, fallback = null }) => {
    const [errorLoading, setErrorLoading] = useState(false);
    
    // Import dynamique avec meilleure gestion des erreurs
    const Component = lazy(() => {
      // Utiliser le chemin mobile ou desktop selon l'état isMobile
      const path = (isMobile && !forceDesktop) ? mobilePath : desktopPath;
      
      // Utiliser un import direct depuis le répertoire src/components avec @ qui est un alias vers src
      return import(/* webpackChunkName: "[request]" */ `@/components/${path}`)
        .then(module => {
          // Réinitialiser l'état d'erreur si le chargement réussit
          setErrorLoading(false);
          // Beaucoup de modules ES6 contiennent leur export par défaut dans module.default
          return { default: module.default || module };
        })
        .catch(error => {
          console.error(`Erreur lors du chargement du composant ${path}:`, error);
          console.error(`Tentative de chargement depuis: @/components/${path}`);
          setErrorLoading(true);
          
          // Retourner un composant de secours en cas d'erreur
          return { 
            default: (props) => (
              <div className="component-error">
                <h3>Impossible de charger le composant</h3>
                <p>Une erreur est survenue lors du chargement de l'interface.</p>
                <p className="error-path">Chemin: @/components/{path}</p>
                <button className="btn btn-primary" onClick={() => window.location.reload()}>
                  Rafraîchir la page
                </button>
              </div>
            )
          };
        });
    });
    
    // Composant enveloppé dans Suspense avec fallback
    const ResponsiveComponent = (props) => {
      // Utiliser un effet pour réessayer le chargement en cas d'erreur
      useEffect(() => {
        if (errorLoading) {
          const timer = setTimeout(() => {
            window.location.reload();
          }, 5000); // Tentative de rechargement après 5 secondes
          
          return () => clearTimeout(timer);
        }
      }, [errorLoading]);
      
      // Le fallback par défaut unifié et centré
      const defaultFallback = (
        <div className="loading-container d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Chargement de l'interface...</span>
            </div>
            <p className="mt-2">Chargement de l'interface...</p>
          </div>
        </div>
      );
      
      return (
        <Suspense fallback={fallback || defaultFallback}>
          <Component {...props} />
        </Suspense>
      );
    };
    
    return ResponsiveComponent;
  }, [isMobile, forceDesktop]);

  return {
    isMobile,
    dimensions,
    updateDimensions,
    checkIsMobile,
    getResponsiveComponent,
    isDesktop: !isMobile,
    screenWidth: dimensions.width,
    screenHeight: dimensions.height
  };
};

export default useResponsive;