// src/hooks/useResponsiveComponent.js
import React, { lazy, Suspense, useState, useEffect } from 'react';
import { useIsMobile } from './useIsMobile.js';

export const useResponsiveComponent = (options) => {
  const {
    // Chemins des composants
    desktopPath, 
    mobilePath,
    // Breakpoint personnalisable
    breakpoint = 768,
    // Composant de fallback
    fallback = <div className="loading-placeholder">Chargement...</div>
  } = options;
  
  const isMobile = useIsMobile(breakpoint);
  const [errorLoading, setErrorLoading] = useState(false);
  
  // Import dynamique avec meilleure gestion des erreurs et chemin corrigé
  const Component = lazy(() => {
    // Corriger le chemin pour qu'il pointe correctement vers les composants
    // Au lieu d'utiliser un chemin relatif ../components/, utiliser un import direct depuis src
    const path = isMobile ? mobilePath : desktopPath;
    
    // Utiliser un import direct depuis le répertoire src/components avec @ qui est un alias vers src
    return import(/* webpackChunkName: "[request]" */ `@components/${path}`)
      .then(module => {
        // Réinitialiser l'état d'erreur si le chargement réussit
        setErrorLoading(false);
        // Beaucoup de modules ES6 contiennent leur export par défaut dans module.default
        return { default: module.default || module };
      })
      .catch(error => {
        console.error(`Erreur lors du chargement du composant ${path}:`, error);
        console.error(`Tentative de chargement depuis: @components/${path}`);
        setErrorLoading(true);
        
        // Retourner un composant de secours en cas d'erreur
        return { 
          default: (props) => (
            <div className="component-error">
              <h3>Impossible de charger le composant</h3>
              <p>Une erreur est survenue lors du chargement de l'interface.</p>
              <p className="error-path">Chemin: @components/{path}</p>
              <button onClick={() => window.location.reload()}>
                Rafraîchir la page
              </button>
            </div>
          )
        };
      });
  });
  
  // Composant enveloppé dans Suspense avec meilleur fallback
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
    
    return (
      <Suspense fallback={
        <div className="loading-placeholder">
          <div className="loading-spinner"></div>
          <p>Chargement de l'interface...</p>
        </div>
      }>
        <Component {...props} />
      </Suspense>
    );
  };
  
  return ResponsiveComponent;
};