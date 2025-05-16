// src/components/common/Layout.js
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useResponsive } from '@/hooks/common';

// Import direct du DesktopLayout pour forcer son utilisation
import DesktopLayout from './layout/DesktopLayout';
import layoutStyles from '@/components/layout/Layout.module.css'; // Import du module CSS existant

function Layout() {
  const [layoutError, setLayoutError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const location = useLocation();
  
  // État pour gérer les transitions de page
  const [isNavigating, setIsNavigating] = useState(false);
  const [prevOutlet, setPrevOutlet] = useState(null);
  
  // Détecter les changements de route pour la transition
  useEffect(() => {
    // Au changement de route, marquer comme en navigation
    setIsNavigating(true);
    
    // Stocker l'outlet précédent
    setPrevOutlet(<Outlet />);
    
    // Réinitialiser après un court délai pour permettre au nouvel outlet de se charger
    const timer = setTimeout(() => {
      setIsNavigating(false);
      setPrevOutlet(null);
    }, 300); // Délai court mais suffisant pour la transition
    
    return () => clearTimeout(timer);
  }, [location.pathname]);
  
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
    // Utilisation directe du DesktopLayout avec gestion de la transition
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
