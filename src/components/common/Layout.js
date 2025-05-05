// src/components/common/Layout.js
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useResponsive } from '@/hooks/common/useResponsive';

// Import direct du DesktopLayout pour forcer son utilisation
import DesktopLayout from './layout/DesktopLayout';

function Layout() {
  const [layoutError, setLayoutError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  // TODO: Réactiver le mode mobile plus tard.
  // Pour l'instant, on utilise directement le DesktopLayout au lieu de passer par useResponsive
  
  /* Code mis à jour commenté pour référence future
  // Charger le composant de mise en page responsive avec un fallback personnalisé
  // qui sera utilisé à la place du fallback par défaut dans useResponsive
  const { getResponsiveComponent } = useResponsive();
  const ResponsiveLayout = getResponsiveComponent({
    desktopPath: 'common/layout/DesktopLayout',
    mobilePath: 'common/layout/MobileLayout',
    breakpoint: 768,
    // Pas de fallback ici - on utilisera celui par défaut du hook
    // pour éviter les doublons de spinner
  });
  */
  
  // Gestion des erreurs de chargement
  useEffect(() => {
    // Si une erreur se produit et que nous n'avons pas encore essayé trop de fois
    if (layoutError && retryCount < 2) {
      const timer = setTimeout(() => {
        console.log(`Tentative de rechargement du layout (${retryCount + 1}/2)...`);
        setRetryCount(prev => prev + 1);
        setLayoutError(false);
        // Force un rechargement des chunks
        window.location.reload();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [layoutError, retryCount]);
  
  // Fonction pour capturer les erreurs
  const handleLayoutError = (error) => {
    console.error("Erreur lors du chargement du layout:", error);
    setLayoutError(true);
  };
  
  // Afficher un fallback en cas d'erreur persistante
  if (layoutError && retryCount >= 2) {
    return (
      <div className="error-container d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <h2>Problème de chargement</h2>
          <p>Nous rencontrons des difficultés à charger l'interface de l'application.</p>
          <button 
            className="btn btn-primary mt-3"
            onClick={() => window.location.reload()}
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }
  
  // Utiliser un try-catch pour gérer les erreurs de rendu
  try {
    // Utilisation directe du DesktopLayout au lieu du composant responsif
    return (
      <DesktopLayout>
        <Outlet />
      </DesktopLayout>
    );
  } catch (error) {
    handleLayoutError(error);
    return null; // Le fallback s'affichera après le setState
  }
}

export default Layout;
