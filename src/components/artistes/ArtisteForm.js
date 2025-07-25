// src/components/artistes/ArtisteForm.js
import React from 'react';

// Imports directs des composants
import ArtistesDesktopForm from './desktop/ArtisteForm';
// import ArtistesMobileForm from './mobile/ArtisteForm'; // Composant mobile supprimé

/**
 * Composant wrapper responsive pour le formulaire d'artiste
 * Affiche la version desktop ou mobile selon la taille d'écran
 */
function ArtisteForm(props) {
  
  // Rendu conditionnel simple
  // Mobile désactivé temporairement - utilisation du desktop uniquement
  return <ArtistesDesktopForm {...props} />;
  /*
  return isMobile ? (
    <ArtistesMobileForm {...props} />
  ) : (
    <ArtistesDesktopForm {...props} />
  );
  */
}

export default ArtisteForm;