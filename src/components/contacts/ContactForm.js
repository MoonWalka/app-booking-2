// src/components/contacts/ContactForm.js
import React from 'react';
import { useResponsive } from '@/hooks/common';

// Imports directs des composants
import ContactDesktopForm from './desktop/ContactForm';
import ContactFormMobile from './mobile/ContactForm';

/**
 * Composant wrapper responsive pour le formulaire de contact
 * Affiche la version desktop ou mobile selon la taille d'écran
 */
function ContactForm(props) {
  const { isMobile } = useResponsive();
  
  // Rendu conditionnel simple
  return isMobile ? (
    <ContactFormMobile {...props} />
  ) : (
    <ContactDesktopForm {...props} />
  );
}

export default ContactForm;
