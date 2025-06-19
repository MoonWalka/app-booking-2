// src/components/componentMapping.js
/**
 * Ce fichier sert de registre central pour tous les composants qui peuvent être chargés dynamiquement.
 * Il permet de désactiver le lazy loading en fournissant un accès direct aux composants.
 * 
 * Structure: Le chemin relatif depuis src/components/ est utilisé comme clé
 */

// Import des composants desktop
import ArtistesDesktopList from './artistes/desktop/ArtistesList';
import ArtistesDesktopView from './artistes/desktop/ArtisteView';
import ArtistesDesktopForm from './artistes/desktop/ArtisteForm';

import ConcertsDesktopList from './concerts/desktop/ConcertsList';
import ConcertsDesktopView from './concerts/desktop/ConcertView';
import ConcertsDesktopForm from './concerts/desktop/ConcertForm';

import LieuxDesktopList from './lieux/desktop/LieuxList';
import LieuxDesktopView from './lieux/desktop/LieuView';
import LieuxDesktopForm from './lieux/desktop/LieuForm';

import ContactsDesktopList from './contacts/desktop/ContactsList';
import ContactsDesktopView from './contacts/desktop/ContactView';
import ContactsDesktopForm from './contacts/desktop/ContactForm';

import StructuresDesktopList from './structures/desktop/StructuresList';
// Les composants suivants n'existent pas, utilisez les composants Details à la place
import StructuresDesktopDetails from './structures/desktop/StructureDetails';

import FormsDesktopValidationInterface from './forms/desktop/FormValidationInterface';

// Import des composants mobile
import ArtistesMobileList from './artistes/mobile/ArtistesList';
import ArtistesMobileView from './artistes/mobile/ArtisteView';
import ArtistesMobileForm from './artistes/mobile/ArtisteForm';

import ConcertsMobileList from './concerts/mobile/ConcertsList';
import ConcertsMobileView from './concerts/mobile/ConcertView';
import ConcertsMobileForm from './concerts/mobile/ConcertForm';

// Le composant LieuxMobileList n'existe pas
// Le composant LieuMobileForm n'existe pas
// Utilisons seulement le composant LieuView qui existe
import LieuxMobileView from './lieux/mobile/LieuView';

import ContactsMobileList from './contacts/mobile/ContactsList';
import ContactsMobileView from './contacts/mobile/ContactView';
import ContactsMobileForm from './contacts/mobile/ContactForm';

import StructuresMobileList from './structures/mobile/StructuresList';
// Le composant StructureMobileView n'existe pas, utilisons le Details à la place
import StructuresMobileDetails from './structures/mobile/StructureDetails';
import StructuresMobileForm from './structures/mobile/StructureForm';

import FormsMobileValidationInterface from './forms/mobile/FormValidationInterface';

// Import des pages
import ContratRedactionPage from '../pages/ContratRedactionPage';

// Mapping des chemins vers les composants réels
export const componentMapping = {
  // Artistes
  'artistes/desktop/ArtistesList': ArtistesDesktopList,
  'artistes/desktop/ArtisteView': ArtistesDesktopView,
  'artistes/desktop/ArtisteForm': ArtistesDesktopForm,
  'artistes/mobile/ArtistesList': ArtistesMobileList,
  'artistes/mobile/ArtisteView': ArtistesMobileView,
  'artistes/mobile/ArtisteForm': ArtistesMobileForm,

  // Concerts
  'concerts/desktop/ConcertsList': ConcertsDesktopList,
  'concerts/desktop/ConcertView': ConcertsDesktopView,
  'concerts/desktop/ConcertForm': ConcertsDesktopForm,
  'concerts/mobile/ConcertsList': ConcertsMobileList,
  'concerts/mobile/ConcertView': ConcertsMobileView,
  'concerts/mobile/ConcertForm': ConcertsMobileForm,

  // Lieux
  'lieux/desktop/LieuxList': LieuxDesktopList,
  'lieux/desktop/LieuView': LieuxDesktopView,
  'lieux/desktop/LieuForm': LieuxDesktopForm,
  // Remplacer les composants manquants par leurs équivalents ou par null
  'lieux/mobile/LieuxList': null,
  'lieux/mobile/LieuView': LieuxMobileView,
  'lieux/mobile/LieuForm': null,

  // Contacts
  'contacts/desktop/ContactsList': ContactsDesktopList,
  'contacts/desktop/ContactView': ContactsDesktopView,
  'contacts/desktop/ContactForm': ContactsDesktopForm,
  'contacts/mobile/ContactsList': ContactsMobileList,
  'contacts/mobile/ContactView': ContactsMobileView,
  'contacts/mobile/ContactForm': ContactsMobileForm,

  // Structures
  'structures/desktop/StructuresList': StructuresDesktopList,
  // Remplacer StructureView par StructureDetails
  'structures/desktop/StructureView': StructuresDesktopDetails,
  'structures/desktop/StructureForm': null,
  'structures/mobile/StructuresList': StructuresMobileList,
  // Remplacer StructureView par StructureDetails
  'structures/mobile/StructureView': StructuresMobileDetails,
  'structures/mobile/StructureForm': StructuresMobileForm,

  // Pour assurer la compatibilité avec les composants Details existants
  'structures/desktop/StructureDetails': StructuresDesktopDetails,
  'structures/mobile/StructureDetails': StructuresMobileDetails,

  // Formulaires
  'forms/desktop/FormValidationInterface': FormsDesktopValidationInterface,
  'forms/mobile/FormValidationInterface': FormsMobileValidationInterface,

  // Pages
  'ContratRedactionPage': ContratRedactionPage,
};

/**
 * Fonction utilitaire pour obtenir un composant par son chemin
 * @param {string} path - Le chemin du composant (ex: 'concerts/desktop/ConcertView')
 * @returns {React.Component|null} - Le composant correspondant ou null si non trouvé
 */
export const getComponentByPath = (path) => {
  if (componentMapping[path]) {
    return componentMapping[path];
  }
  
  console.error(`[ERREUR] Composant non trouvé dans le mapping: ${path}`);
  return null;
};

export default componentMapping;