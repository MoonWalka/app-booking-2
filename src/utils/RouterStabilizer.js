// src/utils/RouterStabilizer.js
import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import useGenericCachedData from '@/hooks/generics/data/useGenericCachedData';

/**
 * Composant qui stabilise le comportement de React Router et empêche les rechargements intempestifs
 * causés par des navigations rapides ou des changements d'URL fréquents
 */
export function RouterStabilizer() {
  const location = useLocation();
  const navigationType = useNavigationType();
  
  // 🚀 NOUVEAU : Utilisation du cache générique pour l'historique de navigation
  const { 
    getCacheData, 
    setCacheData 
  } = useGenericCachedData('router', {
    cacheKey: 'navigation',
    strategy: 'ttl',
    ttl: 5 * 60 * 1000, // 5 minutes
    levels: ['memory', 'session']
  });
  
  // 🎯 SIMPLIFICATION : Détection de boucles simplifiée
  useEffect(() => {
    const now = Date.now();
    const navigationHistory = getCacheData('history') || [];
    
    // Ajouter la navigation actuelle
    const newNavigation = {
      pathname: location.pathname,
      timestamp: now,
      type: navigationType,
    };
    
    navigationHistory.push(newNavigation);
    
    // Ne conserver que les 10 dernières navigations
    const recentHistory = navigationHistory.slice(-10);
    setCacheData('history', recentHistory);
    
    // Détecter les boucles (même chemin > 3 fois en 2 secondes)
    const recentSamePath = recentHistory.filter(
      nav => nav.pathname === location.pathname && now - nav.timestamp < 2000
    );
    
    if (recentSamePath.length > 3) {
      console.warn('🔄 Boucle de navigation détectée:', location.pathname);
      setCacheData('loopDetected', true);
      setCacheData('history', []); // Reset l'historique
    }
  }, [location, navigationType, getCacheData, setCacheData]);
  
  return null;
}

/**
 * Hook custom pour accéder à la configuration de stabilité du routeur
 */
export function useRouterStability() {
  const { getCacheData, setCacheData } = useGenericCachedData('router', {
    cacheKey: 'navigation',
    strategy: 'ttl',
    ttl: 5 * 60 * 1000,
    levels: ['memory', 'session']
  });
  
  const clearDetectedLoop = () => {
    setCacheData('loopDetected', false);
  };
  
  const isLoopDetected = () => {
    return getCacheData('loopDetected') === true;
  };
  
  return {
    isLoopDetected,
    clearDetectedLoop,
  };
}

export default RouterStabilizer;