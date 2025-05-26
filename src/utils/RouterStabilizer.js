// src/utils/RouterStabilizer.js
import { useEffect, useRef } from 'react';
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
  const cacheHook = useGenericCachedData('router', {
    cacheKey: 'navigation',
    strategy: 'ttl',
    ttl: 5 * 60 * 1000, // 5 minutes
    levels: ['memory', 'session']
  });

  // 🔧 FIX: Utiliser useRef pour stabiliser l'accès aux fonctions du cache
  const cacheRef = useRef(cacheHook);
  cacheRef.current = cacheHook;
  
  // 🎯 SIMPLIFICATION : Détection de boucles simplifiée
  useEffect(() => {
    const now = Date.now();
    const navigationHistory = cacheRef.current.getCacheData('history') || [];
    
    // Ajouter la navigation actuelle
    const newNavigation = {
      pathname: location.pathname,
      timestamp: now,
      type: navigationType,
    };
    
    navigationHistory.push(newNavigation);
    
    // Ne conserver que les 10 dernières navigations
    const recentHistory = navigationHistory.slice(-10);
    cacheRef.current.setCacheData('history', recentHistory);
    
    // Détecter les boucles (même chemin > 3 fois en 2 secondes)
    const recentSamePath = recentHistory.filter(
      nav => nav.pathname === location.pathname && now - nav.timestamp < 2000
    );
    
    if (recentSamePath.length > 3) {
      console.warn('🔄 Boucle de navigation détectée:', location.pathname);
      cacheRef.current.setCacheData('loopDetected', true);
      cacheRef.current.setCacheData('history', []); // Reset l'historique
    }
  }, [location, navigationType]); // 🔧 FIX: Supprimer les dépendances instables
  
  return null;
}

/**
 * Hook custom pour accéder à la configuration de stabilité du routeur
 */
export function useRouterStability() {
  const cacheHook = useGenericCachedData('router', {
    cacheKey: 'navigation',
    strategy: 'ttl',
    ttl: 5 * 60 * 1000,
    levels: ['memory', 'session']
  });

  // 🔧 FIX: Utiliser useRef pour stabiliser l'accès
  const cacheRef = useRef(cacheHook);
  cacheRef.current = cacheHook;
  
  const clearDetectedLoop = () => {
    cacheRef.current.setCacheData('loopDetected', false);
  };
  
  const isLoopDetected = () => {
    return cacheRef.current.getCacheData('loopDetected') === true;
  };
  
  return {
    isLoopDetected,
    clearDetectedLoop,
  };
}

export default RouterStabilizer;