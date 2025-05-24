// src/components/common/Layout.js
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import useResponsive from '../../hooks/common/useResponsive';

// Import des deux layouts selon l'architecture responsive prévue
import DesktopLayout from './layout/DesktopLayout';
import MobileLayout from './layout/MobileLayout';

function Layout() {
  const { isMobile } = useResponsive();
  const [layoutError, setLayoutError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
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
            className="tc-btn tc-btn-primary mt-3"
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
    // Architecture responsive selon recommandation #1 : 
    // "Unifier les implémentations desktop/mobile avec approche responsive"
    return isMobile ? (
      <MobileLayout>
        <Outlet />
      </MobileLayout>
    ) : (
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
