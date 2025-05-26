// src/utils/RouterStabilizer.js
import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * Composant qui stabilise le comportement de React Router et empêche les rechargements intempestifs
 * causés par des navigations rapides ou des changements d'URL fréquents
 */
export function RouterStabilizer() {
  const location = useLocation();
  const navigationType = useNavigationType();
  
  // 🎯 SIMPLIFICATION RADICALE : Utiliser seulement useRef pour éviter les boucles
  const navigationHistoryRef = useRef([]);
  const loopDetectedRef = useRef(false);
  
  // 🔧 FIX: Détection de boucles ultra-simplifiée
  useEffect(() => {
    const now = Date.now();
    const history = navigationHistoryRef.current;
    
    // Ajouter la navigation actuelle
    const newNavigation = {
      pathname: location.pathname,
      timestamp: now,
      type: navigationType,
    };
    
    history.push(newNavigation);
    
    // Ne conserver que les 10 dernières navigations
    if (history.length > 10) {
      history.splice(0, history.length - 10);
    }
    
    // Détecter les boucles (même chemin > 3 fois en 2 secondes)
    const recentSamePath = history.filter(
      nav => nav.pathname === location.pathname && now - nav.timestamp < 2000
    );
    
    if (recentSamePath.length > 3 && !loopDetectedRef.current) {
      console.warn('🔄 Boucle de navigation détectée:', location.pathname);
      loopDetectedRef.current = true;
      // Reset l'historique
      navigationHistoryRef.current = [];
      
      // Reset le flag après 5 secondes
      setTimeout(() => {
        loopDetectedRef.current = false;
      }, 5000);
    }
  }, [location.pathname, navigationType]); // Dépendances minimales et stables
  
  return null;
}

/**
 * Hook custom pour accéder à la configuration de stabilité du routeur
 */
export function useRouterStability() {
  const loopDetectedRef = useRef(false);
  
  const clearDetectedLoop = () => {
    loopDetectedRef.current = false;
  };
  
  const isLoopDetected = () => {
    return loopDetectedRef.current;
  };
  
  return {
    isLoopDetected,
    clearDetectedLoop,
  };
}

export default RouterStabilizer;