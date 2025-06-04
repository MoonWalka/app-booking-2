// src/components/contacts/ContactDetailsModern.js
import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useResponsive } from '@/hooks/common';

// Imports directs des composants modernes
import ContactDesktopView from './desktop/ContactViewModern';
import ContactMobileView from './mobile/ContactView';

/**
 * Composant conteneur moderne pour les détails d'un contact
 * Utilise la même architecture que ConcertDetails
 */
const ContactDetailsModern = () => {
  const { id } = useParams();
  const location = useLocation();
  const { isMobile } = useResponsive();

  // Détecter le mode édition
  const isEditMode = location.pathname.includes('/edit');

  // LOG DEBUG : montage du composant ContactDetails
  console.log('[DEBUG][ContactDetailsModern] Montage avec id:', id, '| isMobile:', isMobile, '| isEditMode:', isEditMode);
  
  // Rendu conditionnel optimisé
  if (isMobile) {
    return <ContactMobileView id={id} />;
  }
  
  // Desktop : utiliser la version moderne
  return <ContactDesktopView id={id} />;
};

export default ContactDetailsModern;