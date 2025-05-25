// src/utils/OptimizedRouteWrapper.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import LoadingSpinner from '@/components/common/Spinner';

/**
 * Version optimisée du wrapper de route qui:
 * 1. Utilise React.memo pour éviter les re-rendus inutiles
 * 2. Applique useCallback pour stabiliser les fonctions
 * 3. Gère mieux les timeouts avec useRef pour éviter les fuites de mémoire
 * 4. Effectue une transition plus fluide lors des changements de route
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {React.ReactNode} props.children - Les composants enfants à stabiliser
 * @param {number} props.delay - Le délai de stabilisation en ms (défaut: 100ms)
 * @param {boolean} props.showSpinner - Si true, affiche un spinner pendant le délai (défaut: true)
 * @param {string} props.spinnerMessage - Message à afficher avec le spinner (optionnel)
 * @returns {React.ReactElement}
 */
const OptimizedRouteWrapper = ({ 
  children, 
  delay = 100, 
  showSpinner = true, 
  spinnerMessage = "Chargement en cours..." 
}) => {
  const location = useLocation();
  const [isStable, setIsStable] = useState(false);
  const [isReady, setIsReady] = useState(false);
  
  // Utilisation de refs pour suivre l'état sans déclencher de re-rendus
  const lastPathRef = useRef(location.pathname);
  const timersRef = useRef({
    stabilize: null,
    ready: null
  });
  
  // Log d'entrée dans le wrapper
  
  // Fonction de nettoyage des timers (utilisée dans useEffect et cleanup)
  const clearAllTimers = useCallback(() => {
    Object.values(timersRef.current).forEach(timer => {
      if (timer !== null) {
        clearTimeout(timer);
      }
    });
    timersRef.current = { stabilize: null, ready: null };
  }, []);
  
  // Fonction pour vérifier si le changement de route est majeur
  // Un changement est considéré majeur si le segment principal de l'URL change
  const isMajorRouteChange = useCallback((oldPath, newPath) => {
    // Comparer les segments principaux des chemins (avant les paramètres)
    const oldSegments = oldPath.split('/').filter(Boolean);
    const newSegments = newPath.split('/').filter(Boolean);
    
    // Si les longueurs sont différentes ou le premier segment change, c'est un changement majeur
    return oldSegments.length !== newSegments.length || 
           oldSegments[0] !== newSegments[0];
  }, []);
  
  // Effet pour gérer les transitions de route
  useEffect(() => {
    const currentPath = location.pathname;
    const previousPath = lastPathRef.current;
    
    // Ne réinitialiser que si le chemin a réellement changé de manière significative
    const shouldResetComponent = 
      currentPath !== previousPath && 
      isMajorRouteChange(previousPath, currentPath);
    
    // Mettre à jour la référence du chemin actuel
    lastPathRef.current = currentPath;
    
    if (shouldResetComponent) {
      
      // Réinitialiser les états
      setIsStable(false);
      setIsReady(false);
      
      // Nettoyer les timers existants
      clearAllTimers();
      
      // Nouvelle séquence de stabilisation
      
      // Premier délai pour la stabilisation
      timersRef.current.stabilize = setTimeout(() => {
        setIsStable(true);
        
        // Délai supplémentaire pour permettre aux hooks d'effet de s'exécuter
        timersRef.current.ready = setTimeout(() => {
          setIsReady(true);
        }, Math.min(30, delay * 0.3)); // Proportionnel au délai principal mais plafonné
        
      }, delay);
    }
    
    // Nettoyer les timers lors du démontage
    return clearAllTimers;
  }, [location.pathname, delay, clearAllTimers, isMajorRouteChange]);
  
  // Si la route n'est pas encore stable, afficher un indicateur de chargement
  if (!isStable) {
    return showSpinner ? (
      <div className="route-transition">
        <LoadingSpinner message={spinnerMessage} contentOnly={true} />
      </div>
    ) : null;
  }
  
  // Une fois stable, rendre les enfants avec une classe pour les transitions CSS
  return (
    <div className={`optimized-route-container ${isReady ? 'route-ready' : 'route-stabilizing'}`}>
      {children}
    </div>
  );
};

// Utiliser React.memo pour éviter les re-rendus inutiles
export default React.memo(OptimizedRouteWrapper);