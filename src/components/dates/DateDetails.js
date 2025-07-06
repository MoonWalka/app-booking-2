// src/components/dates/DateDetails.js
import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useResponsive } from '@/hooks/common';
// Imports directs des composants
import DatesDesktopView from './desktop/DateView';
import DatesMobileView from './mobile/DateView';

/**
 * Composant conteneur pour les détails d'un date
 * Utilise le hook useResponsive pour afficher soit la version desktop, soit la version mobile
 * VERSION CORRIGÉE : Le problème de boucle infinie a été résolu dans useDateDetailsFixed
 */
const DateDetails = ({ id: propId }) => {
  const { id: paramId } = useParams();
  const location = useLocation();
  const { isMobile } = useResponsive();

  // Utiliser l'ID passé en prop ou celui des params de l'URL
  const id = propId || paramId;

  // Détecter le mode édition
  const isEditMode = location.pathname.includes('/edit');

  // LOG DEBUG : montage du composant DateDetails
  console.log('[DEBUG][DateDetails] Montage avec id:', id, '| propId:', propId, '| paramId:', paramId, '| isMobile:', isMobile, '| isEditMode:', isEditMode);
  
  // Vérifier qu'on a un ID valide
  if (!id) {
    return (
      <div className="p-4">
        <div className="alert alert-danger">
          <h4>Erreur</h4>
          <p>Aucun ID de date fourni. Impossible d'afficher les détails.</p>
        </div>
      </div>
    );
  }
  
  // Rendu conditionnel optimisé
  if (isMobile) {
    return <DatesMobileView id={id} />;
  }
  
  // Desktop : utiliser la version normale (problème de boucle infinie résolu)
  return <DatesDesktopView id={id} />;
};

export default DateDetails;
