// src/components/common/Layout.js
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useResponsiveComponent } from '@hooks/useResponsiveComponent';

function Layout() {
  const [layoutError, setLayoutError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  // Charger le composant de mise en page responsive
  const ResponsiveLayout = useResponsiveComponent({
    desktopPath: 'common/layout/DesktopLayout',
    mobilePath: 'common/layout/MobileLayout',
    breakpoint: 768
  });
  
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
      <div className="error-container">
        <h2>Problème de chargement</h2>
        <p>Nous rencontrons des difficultés à charger l'interface de l'application.</p>
        <button 
          className="retry-button"
          onClick={() => window.location.reload()}
        >
          Réessayer
        </button>
      </div>
    );
  }
  
  // Utiliser un try-catch pour gérer les erreurs de rendu
  try {
    return (
      <ResponsiveLayout>
        <Outlet />
      </ResponsiveLayout>
    );
  } catch (error) {
    handleLayoutError(error);
    return (
      <div className="loading-placeholder">
        <div className="loading-spinner"></div>
        <p>Chargement de l'interface...</p>
      </div>
    );
  }
}

export default Layout;
