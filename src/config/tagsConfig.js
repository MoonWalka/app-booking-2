/**
 * Configuration centralisée des tags pour les contacts
 * Définit les tags disponibles et leurs propriétés visuelles
 */

export const CONTACT_TAGS = [
  {
    id: 'organisme-institution',
    label: 'Organisme / institution',
    color: '#6f42c1', // Purple
    description: 'Organismes publics, institutions culturelles'
  },
  {
    id: 'disque',
    label: 'Disque',
    color: '#fd7e14', // Orange
    description: 'Labels, distributeurs, producteurs musicaux'
  },
  {
    id: 'ressource-formation',
    label: 'Ressource / Formation',
    color: '#20c997', // Teal
    description: 'Centres de formation, ressources pédagogiques'
  },
  {
    id: 'media',
    label: 'Média',
    color: '#dc3545', // Red
    description: 'Presse, radio, télévision, médias en ligne'
  },
  {
    id: 'artiste',
    label: 'Artiste',
    color: '#e91e63', // Pink
    description: 'Musiciens, groupes, artistes indépendants'
  },
  {
    id: 'public',
    label: 'Public',
    color: '#17a2b8', // Info blue
    description: 'Spectateurs, fans, public général'
  },
  {
    id: 'adherent',
    label: 'Adhérent',
    color: '#28a745', // Success green
    description: 'Membres adhérents, abonnés'
  },
  {
    id: 'personnel',
    label: 'Personnel',
    color: '#6c757d', // Secondary gray
    description: 'Employés, collaborateurs internes'
  },
  {
    id: 'diffuseur',
    label: 'Diffuseur',
    color: '#007bff', // Primary blue
    description: 'Salles de concert, festivals, lieux de diffusion'
  },
  {
    id: 'agent-entrepreneur',
    label: 'Agent, entrepreneur de spectacles',
    color: '#ffc107', // Warning yellow
    description: 'Agents artistiques, entrepreneurs de spectacles'
  },
  {
    id: 'prestataire',
    label: 'Prestataire',
    color: '#795548', // Brown
    description: 'Fournisseurs de services, prestataires techniques'
  }
];

// Helper pour obtenir un tag par son ID
export const getTagById = (tagId) => {
  return CONTACT_TAGS.find(tag => tag.id === tagId);
};

// Helper pour obtenir un tag par son label
export const getTagByLabel = (tagLabel) => {
  return CONTACT_TAGS.find(tag => tag.label === tagLabel);
};

// Helper pour obtenir la liste des labels uniquement
export const getTagLabels = () => {
  return CONTACT_TAGS.map(tag => tag.label);
};

// Helper pour chercher un tag dans toutes les hiérarchies
const findTagInHierarchy = (tagLabel, hierarchy) => {
  for (const item of hierarchy) {
    if (item.label === tagLabel) {
      return item;
    }
    if (item.children) {
      const found = findTagInHierarchy(tagLabel, item.children);
      if (found) {
        // Si c'est un enfant sans couleur, prendre la couleur du parent
        return found.color ? found : { ...found, color: item.color };
      }
    }
  }
  return null;
};

// Helper pour obtenir la couleur d'un tag par son label
export const getTagColor = (tagLabel) => {
  // D'abord chercher dans les tags de base
  const tag = getTagByLabel(tagLabel);
  if (tag) return tag.color;
  
  // Ensuite chercher dans les hiérarchies
  try {
    const { TAGS_HIERARCHY, GENRES_HIERARCHY, RESEAUX_HIERARCHY, MOTS_CLES_HIERARCHY } = require('./tagsHierarchy');
    const hierarchies = [TAGS_HIERARCHY, GENRES_HIERARCHY, RESEAUX_HIERARCHY, MOTS_CLES_HIERARCHY];
    
    for (const hierarchy of hierarchies) {
      const found = findTagInHierarchy(tagLabel, hierarchy);
      if (found && found.color) {
        return found.color;
      }
    }
  } catch (error) {
    // Silently fail in non-React environments
    console.warn('Hiérarchies de tags non disponibles');
  }
  
  return '#6c757d'; // Couleur par défaut
};

// Helper pour normaliser un nom de classe CSS à partir d'un label
export const getTagCssClass = (tagLabel) => {
  // D'abord chercher dans les tags de base
  const tag = getTagByLabel(tagLabel);
  if (tag) return tag.id;
  
  // Ensuite chercher dans les hiérarchies
  try {
    const { TAGS_HIERARCHY, GENRES_HIERARCHY, RESEAUX_HIERARCHY, MOTS_CLES_HIERARCHY } = require('./tagsHierarchy');
    const hierarchies = [TAGS_HIERARCHY, GENRES_HIERARCHY, RESEAUX_HIERARCHY, MOTS_CLES_HIERARCHY];
    
    for (const hierarchy of hierarchies) {
      const found = findTagInHierarchy(tagLabel, hierarchy);
      if (found) {
        return found.id;
      }
    }
  } catch (error) {
    // Silently fail in non-React environments
    console.warn('Hiérarchies de tags non disponibles');
  }
  
  return 'default';
};