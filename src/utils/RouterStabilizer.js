// src/utils/RouterStabilizer.js
import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * Composant qui stabilise le comportement de React Router et empêche les rechargements intempestifs
 * causés par des navigations rapides ou des changements d'URL fréquents
 */
export function RouterStabilizer() {
  const location = useLocation();
  const navigationType = useNavigationType();
  
  // Garde une trace des dernières navigations pour détecter les navigations en boucle
  useEffect(() => {
    // Variables pour suivre l'activité de navigation
    const navigationHistory = JSON.parse(sessionStorage.getItem('navigationHistory') || '[]');
    const now = Date.now();
    
    // Ajouter la navigation actuelle à l'historique
    navigationHistory.push({
      pathname: location.pathname,
      timestamp: now,
      type: navigationType,
    });
    
    // Ne conserver que les 10 dernières navigations
    if (navigationHistory.length > 10) {
      navigationHistory.shift();
    }
    
    // Enregistrer l'historique mis à jour
    sessionStorage.setItem('navigationHistory', JSON.stringify(navigationHistory));
    
    // Détecter les boucles de navigation (même chemin visité plus de 3 fois en 2 secondes)
    const recentNavigations = navigationHistory.filter(
      nav => nav.pathname === location.pathname && now - nav.timestamp < 2000
    );
    
    if (recentNavigations.length > 3) {
      console.warn(
        'Boucle de navigation détectée! Même chemin visité plusieurs fois en peu de temps:',
        location.pathname
      );
      
      // Si une boucle est détectée, on enregistre cette information
      // pour que d'autres parties de l'application puissent réagir
      sessionStorage.setItem('routerLoopDetected', 'true');
      
      // Nettoyer l'historique pour éviter de déclencher cette alerte en continu
      sessionStorage.setItem('navigationHistory', JSON.stringify([]));
    }
  }, [location, navigationType]);
  
  return null; // Ce composant ne rend rien visuellement
}

/**
 * Hook custom pour accéder à la configuration de stabilité du routeur
 */
export function useRouterStability() {
  const clearDetectedLoop = () => {
    sessionStorage.removeItem('routerLoopDetected');
  };
  
  const isLoopDetected = () => {
    return sessionStorage.getItem('routerLoopDetected') === 'true';
  };
  
  return {
    isLoopDetected,
    clearDetectedLoop,
  };
}

export default RouterStabilizer;