/**
 * Utilitaire pour suivre et diagnostiquer les boucles de re-renders
 */
import { useRef, useEffect } from 'react';

/**
 * Hook pour suivre les renders d'un composant
 * @param {string} componentName - Nom du composant à suivre
 * @param {number} warningThreshold - Seuil d'alerte (nombre de renders)
 * @param {Object} props - Props du composant pour le diagnostic
 * @returns {number} Nombre actuel de renders
 */
export const useRenderTracker = (componentName, warningThreshold = 10, props = {}) => {
  const renderCount = useRef(0);
  const previousProps = useRef(props);
  
  // Incrémenter le compteur à chaque render
  renderCount.current += 1;
  
  useEffect(() => {
    // Alerte si trop de renders
    if (renderCount.current > warningThreshold) {
      console.warn(`🚨 [RENDER_LOOP] ${componentName} a eu ${renderCount.current} renders`);
    }
    
    // Log normal pour le suivi
    console.log(`🔄 [RENDER] ${componentName}: ${renderCount.current}`);
    
    // Détecter les props qui ont changé
    if (props && Object.keys(props).length > 0) {
      const changedProps = [];
      
      Object.keys(props).forEach(key => {
        if (props[key] !== previousProps.current[key]) {
          changedProps.push(key);
        }
      });
      
      if (changedProps.length > 0) {
        console.log(`🔍 [PROPS_CHANGED] ${componentName}: ${changedProps.join(', ')}`);
      }
      
      // Mettre à jour les props précédentes
      previousProps.current = { ...props };
    }
  });
  
  return renderCount.current;
};

/**
 * HOC pour suivre les renders d'un composant
 * @param {React.Component} Component - Composant à suivre
 * @param {string} displayName - Nom d'affichage du composant
 * @param {number} warningThreshold - Seuil d'alerte (nombre de renders)
 * @returns {React.Component} Composant avec suivi des renders
 */
export const withRenderTracker = (Component, displayName, warningThreshold = 10) => {
  const WrappedComponent = (props) => {
    useRenderTracker(displayName || Component.displayName || Component.name, warningThreshold, props);
    return <Component {...props} />;
  };
  
  WrappedComponent.displayName = `WithRenderTracker(${displayName || Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

export default useRenderTracker;
