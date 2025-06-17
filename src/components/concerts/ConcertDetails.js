// src/components/concerts/ConcertDetails.js
import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useResponsive } from '@/hooks/common';
import { useConcertWatcher } from '@/hooks/concerts/useConcertWatcher';

// Imports directs des composants
import ConcertsDesktopView from './desktop/ConcertViewWithRelances';
import ConcertsMobileView from './mobile/ConcertView';

/**
 * Composant conteneur pour les détails d'un concert
 * Utilise le hook useResponsive pour afficher soit la version desktop, soit la version mobile
 * VERSION CORRIGÉE : Le problème de boucle infinie a été résolu dans useConcertDetailsFixed
 */
const ConcertDetails = ({ id: propId }) => {
  const { id: paramId } = useParams();
  const location = useLocation();
  const { isMobile } = useResponsive();

  // Utiliser l'ID passé en prop ou celui des params de l'URL
  const id = propId || paramId;

  // Détecter le mode édition
  const isEditMode = location.pathname.includes('/edit');

  // LOG DEBUG : montage du composant ConcertDetails
  console.log('[DEBUG][ConcertDetails] Montage avec id:', id, '| propId:', propId, '| paramId:', paramId, '| isMobile:', isMobile, '| isEditMode:', isEditMode);
  
  // Vérifier qu'on a un ID valide
  if (!id) {
    return (
      <div className="p-4">
        <div className="alert alert-danger">
          <h4>Erreur</h4>
          <p>Aucun ID de concert fourni. Impossible d'afficher les détails.</p>
        </div>
      </div>
    );
  }

  // Surveiller les changements du concert pour déclencher les relances automatiques
  useConcertWatcher(id, { enabled: !isEditMode });
  
  // Rendu conditionnel optimisé
  if (isMobile) {
    return <ConcertsMobileView id={id} />;
  }
  
  // Desktop : utiliser la version normale (problème de boucle infinie résolu)
  return <ConcertsDesktopView id={id} />;
};

export default ConcertDetails;
