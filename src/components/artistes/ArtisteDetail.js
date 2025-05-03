// src/components/artistes/ArtisteDetail.js
import React from 'react';
import { useParams } from 'react-router-dom';
import { useResponsive } from '@/hooks/common/useResponsive'; // Utilisation du hook recommandé

/**
 * Composant conteneur pour les détails d'un artiste
 * Utilise le hook useResponsive pour afficher soit la version desktop, soit la version mobile
 */
const ArtisteDetail = () => {
  const { id } = useParams();
  const responsive = useResponsive();
  
  // Obtenir le composant approprié selon la taille de l'écran
  const ArtisteView = responsive.getResponsiveComponent({
    desktopPath: 'artistes/desktop/ArtisteView',
    mobilePath: 'artistes/mobile/ArtisteView'
  });
  
  return <ArtisteView id={id} />;
};

export default ArtisteDetail;