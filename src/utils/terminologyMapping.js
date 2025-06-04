/**
 * Système de mapping terminologique - Phase 1
 * Permet de changer "contact" → "contact" dans l'UI sans impact sur la logique
 * 
 * Usage: import { mapTerm } from '@/utils/terminologyMapping'
 * Puis: mapTerm("contact") → "contact"
 */

// Mapping des termes singuliers
const SINGULAR_MAPPING = {
  'contact': 'contact',
  'Contact': 'Contact',
  'CONTACT': 'CONTACT'
};

// Mapping des termes pluriels
const PLURAL_MAPPING = {
  'contacts': 'contacts',
  'Contacts': 'Contacts', 
  'CONTACTS': 'CONTACTS'
};

// Mapping des expressions complètes
const EXPRESSION_MAPPING = {
  // Navigation et titres
  'Liste des contacts': 'Liste des contacts',
  'Tous les contacts': 'Tous les contacts',
  'Aucun contact': 'Aucun contact',
  'Nouveau contact': 'Nouveau contact',
  'Créer un contact': 'Ajouter un contact',
  'Modifier le contact': 'Modifier le contact',
  'Supprimer le contact': 'Supprimer le contact',
  'Détails du contact': 'Détails du contact',
  
  // Actions et boutons
  'Ajouter un contact': 'Ajouter un contact',
  'Rechercher un contact': 'Rechercher un contact',
  'Sélectionner un contact': 'Sélectionner un contact',
  'Associer un contact': 'Associer un contact',
  'Choisir un contact': 'Choisir un contact',
  
  // Messages et notifications
  'Le contact a été': 'Le contact a été',
  'Ce contact': 'Ce contact',
  'Aucun contact trouvé': 'Aucun contact trouvé',
  'Contact introuvable': 'Contact introuvable',
  'Contact non trouvé': 'Contact non trouvé',
  'Erreur lors du chargement du contact': 'Erreur lors du chargement du contact',
  
  // Formulaires
  'Nom du contact': 'Nom du contact',
  'Email du contact': 'Email du contact',
  'Téléphone du contact': 'Téléphone du contact',
  'Informations du contact': 'Informations du contact',
  'Données du contact': 'Données du contact',
  
  // Relations
  'associé à ce contact': 'associé à ce contact',
  'contact associé': 'contact associé',
  'du contact': 'du contact',
  'au contact': 'au contact',
  'le contact': 'le contact',
  'un contact': 'un contact',
  
  // Spécifiques métier - garder la nuance
  'Responsable programmation': 'Responsable programmation', // garder tel quel
  'Chargé de programmation': 'Chargé de programmation', // garder tel quel
  'Service programmation': 'Service programmation' // garder tel quel
};

/**
 * Fonction principale de mapping d'un terme
 * @param {string} term - Le terme à mapper
 * @returns {string} - Le terme mappé ou original si pas de mapping
 */
export const mapTerm = (term) => {
  if (!term || typeof term !== 'string') return term;
  
  // 1. Essayer d'abord le mapping des expressions complètes
  if (EXPRESSION_MAPPING[term]) {
    return EXPRESSION_MAPPING[term];
  }
  
  // 2. Ensuite le mapping exact (singulier/pluriel)
  if (SINGULAR_MAPPING[term]) {
    return SINGULAR_MAPPING[term];
  }
  
  if (PLURAL_MAPPING[term]) {
    return PLURAL_MAPPING[term];
  }
  
  // 3. Mapping intelligent pour les expressions contenant les termes
  let mappedTerm = term;
  
  // Remplacer dans l'ordre: expressions > pluriels > singuliers
  Object.entries(EXPRESSION_MAPPING).forEach(([original, mapped]) => {
    if (mappedTerm.includes(original)) {
      mappedTerm = mappedTerm.replace(new RegExp(original, 'g'), mapped);
    }
  });
  
  Object.entries(PLURAL_MAPPING).forEach(([original, mapped]) => {
    if (mappedTerm.includes(original)) {
      mappedTerm = mappedTerm.replace(new RegExp(original, 'g'), mapped);
    }
  });
  
  Object.entries(SINGULAR_MAPPING).forEach(([original, mapped]) => {
    if (mappedTerm.includes(original)) {
      mappedTerm = mappedTerm.replace(new RegExp(original, 'g'), mapped);
    }
  });
  
  return mappedTerm;
};

/**
 * Hook React pour mapper automatiquement les termes
 * @param {string} term - Le terme à mapper
 * @returns {string} - Le terme mappé
 */
export const useMappedTerm = (term) => {
  return mapTerm(term);
};

/**
 * Composant wrapper pour mapper automatiquement les enfants texte
 */
export const MappedText = ({ children }) => {
  if (typeof children === 'string') {
    return mapTerm(children);
  }
  return children;
};

/**
 * Utilitaire pour mapper les propriétés d'un objet (ex: labels de formulaire)
 * @param {object} obj - Objet avec des propriétés texte à mapper
 * @returns {object} - Objet avec les textes mappés
 */
export const mapObjectTerms = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const mapped = {};
  Object.entries(obj).forEach(([key, value]) => {
    if (typeof value === 'string') {
      mapped[key] = mapTerm(value);
    } else if (typeof value === 'object') {
      mapped[key] = mapObjectTerms(value);
    } else {
      mapped[key] = value;
    }
  });
  
  return mapped;
};

// Export par défaut pour faciliter l'import
export default mapTerm;