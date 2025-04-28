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
    // Composant de fallback personnalisable
    fallback = null
  } = options;
  
  const isMobile = useIsMobile(breakpoint);
  const [errorLoading, setErrorLoading] = useState(false);
  
  // Import dynamique avec meilleure gestion des erreurs et chemin corrigé
  const Component = lazy(() => {
    // Corriger le chemin pour qu'il pointe correctement vers les composants
    const path = isMobile ? mobilePath : desktopPath;
    
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
              {/* // Correction : ajout classes Bootstrap */}
              <button className="btn btn-primary" onClick={() => window.location.reload()}>
                Rafraîchir la page
              </button>
            </div>
          )
        };
      });
  });
  
  // Composant enveloppé dans Suspense avec fallback centralisé et unifié
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
};