// src/components/contacts/ContactDetails.js
import React from 'react';
import { useParams } from 'react-router-dom';
import { useResponsive } from '@/hooks/common';

// Imports directs des composants
import ContactsDesktopView from './desktop/ContactView';
// import ContactsMobileView from './mobile/ContactView'; // Composant mobile supprimé

/**
 * Composant conteneur pour les détails d'un contact
 * Utilise le hook useResponsive pour afficher soit la version desktop, soit la version mobile
 * Architecture moderne alignée avec DateDetails et LieuDetails
 */
const ContactDetails = () => {
  const { id } = useParams();
  const { isMobile } = useResponsive();

  // LOG DEBUG : montage du composant ContactDetails
  console.log('[DEBUG][ContactDetails] Montage avec id:', id, '| isMobile:', isMobile);
  
  // Rendu conditionnel optimisé
  // Mobile désactivé temporairement - utilisation du desktop uniquement
  return <ContactsDesktopView id={id} />;
  /*
  if (isMobile) {
    return <ContactsMobileView id={id} />;
  }
  
  // Desktop : utiliser la version normale
  return <ContactsDesktopView id={id} />;
  */
};

export default ContactDetails;
