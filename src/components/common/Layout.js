// src/components/common/Layout.js
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import styles from './Layout.module.css';

// Import du layout selon l'architecture responsive prévue
import DesktopLayout from './layout/DesktopLayout';

function Layout() {
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
  
  // Gestion des états d'erreur
  if (layoutError) {
    // Si trop de tentatives, afficher l'erreur persistante
    if (retryCount >= 2) {
      return (
        <div className={styles.errorContainer}>
          <div className={styles.errorContent}>
            <h2 className={styles.errorTitle}>Problème de chargement</h2>
            <p className={styles.errorMessage}>Nous rencontrons des difficultés à charger l'interface de l'application.</p>
            <button 
              className={styles.retryButton}
              onClick={() => window.location.reload()}
            >
              Réessayer
            </button>
          </div>
        </div>
      );
    }
    // Sinon, afficher un fallback temporaire pendant la tentative de rechargement
    return null;
  }

  // Architecture responsive selon recommandation #1 : 
  // "Unifier les implémentations desktop/mobile avec approche responsive"
  // Pour l'instant, utilisons toujours le DesktopLayout en attendant l'implémentation responsive
  return (
    <DesktopLayout>
      <Outlet />
    </DesktopLayout>
  );
}

export default Layout;
