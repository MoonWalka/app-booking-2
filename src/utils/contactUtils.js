/**
 * Utilitaires pour la gestion des contacts
 */

// Liste des tags considérés comme des activités
export const ACTIVITY_TAGS = [
  'Diffuseur', 
  'Média', 
  'Organisme / institution', 
  'Disque', 
  'Agent, entrepreneur de spectacles', 
  'Prestataire', 
  'Ressource / Formation', 
  'Artiste'
];

/**
 * Extrait les tags d'activité d'une liste de tags
 * @param {Array} tags - Liste des tags
 * @returns {Array} - Liste des tags d'activité
 */
export const getActivityTags = (tags) => {
  if (!tags || !Array.isArray(tags)) return [];
  return tags.filter(tag => ACTIVITY_TAGS.includes(tag));
};

/**
 * Formate les tags d'activité pour l'affichage
 * @param {Array} tags - Liste des tags
 * @param {string} defaultValue - Valeur par défaut si aucun tag d'activité
 * @returns {string} - Tags formatés ou valeur par défaut
 */
export const formatActivityTags = (tags, defaultValue = '') => {
  const activityTags = getActivityTags(tags);
  return activityTags.length > 0 ? activityTags.join(' / ') : defaultValue;
};

/**
 * Obtient le type d'affichage pour une structure basé sur ses tags
 * @param {Object} data - Données de la structure
 * @returns {string} - Type à afficher
 */
export const getStructureDisplayType = (data) => {
  const tags = data?.tags || data?.qualification?.tags || [];
  return formatActivityTags(tags, 'Structure');
};

/**
 * Obtient le type d'affichage pour une personne basé sur ses tags
 * @param {Object} data - Données de la personne
 * @returns {string} - Type à afficher (tags d'activité ou "Indépendant")
 */
export const getPersonDisplayType = (data) => {
  const tags = data?.tags || data?.qualification?.tags || [];
  return formatActivityTags(tags, 'Indépendant');
};