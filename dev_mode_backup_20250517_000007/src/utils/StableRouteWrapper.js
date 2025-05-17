// src/utils/StableRouteWrapper.js
import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import LoadingSpinner from '@/components/common/Spinner';

/**
 * Composant qui enveloppe les routes pour les stabiliser et éviter les cycles
 * de montage/démontage rapides qui peuvent causer des problèmes de chargement de données.
 * 
 * Ce wrapper:
 * 1. Introduit un court délai avant de monter les composants enfants pour laisser React Router se stabiliser
 * 2. Une fois monté, il maintient ses enfants montés même en cas de changements mineurs d'URL
 * 3. Affiche un spinner de chargement pendant la période de stabilisation
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {React.ReactNode} props.children - Les composants enfants à stabiliser
 * @param {number} props.delay - Le délai de stabilisation en ms (défaut: 50ms)
 * @param {boolean} props.showSpinner - Si true, affiche un spinner pendant le délai (défaut: true)
 * @param {string} props.spinnerMessage - Message à afficher avec le spinner (optionnel)
 * @returns {React.ReactElement}
 */
const StableRouteWrapper = ({ 
  children, 
  delay = 50, 
  showSpinner = true, 
  spinnerMessage = "Chargement en cours..."
}) => {
  const location = useLocation();
  const [isStable, setIsStable] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const mountCountRef = useRef(0);
  const lastPathRef = useRef(location.pathname);
  const timerRef = useRef(null);
  
  // Effet pour la détection du montage initial et le délai de stabilisation
  useEffect(() => {
    // Incrémenter le compteur de montage
    mountCountRef.current += 1;
    
    // Si c'est le premier montage ou un changement de route majeur
    if (mountCountRef.current === 1 || location.pathname !== lastPathRef.current) {
      // Mettre à jour le chemin actuel
      lastPathRef.current = location.pathname;
      
      // Réinitialiser les états
      setIsStable(false);
      setIsReady(false);
      
      // Nettoyer tout timer précédent
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      
      // Attendre un peu pour laisser React Router terminer ses navigations
      timerRef.current = setTimeout(() => {
        setIsStable(true);
        
        // Attendre un peu plus avant de considérer que le composant est vraiment prêt
        // pour permettre aux hooks d'effet de s'exécuter
        setTimeout(() => {
          setIsReady(true);
        }, 30);
      }, delay);
    }
    
    return () => {
      // Nettoyer le timer si le composant est démonté
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [location.pathname, delay]);
  
  // Si la route n'est pas encore stable, afficher un indicateur de chargement
  if (!isStable) {
    return showSpinner ? (
      <div className="stabilizing-route">
        <LoadingSpinner message={spinnerMessage} contentOnly={true} />
      </div>
    ) : null;
  }
  
  // Une fois stable, rendre les enfants
  return (
    <div className={`stable-route-container ${isReady ? 'ready' : ''}`}>
      {children}
    </div>
  );
};

export default StableRouteWrapper;