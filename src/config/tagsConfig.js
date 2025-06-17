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

// Helper pour obtenir la couleur d'un tag par son label
export const getTagColor = (tagLabel) => {
  const tag = getTagByLabel(tagLabel);
  return tag ? tag.color : '#6c757d'; // Couleur par défaut
};

// Helper pour normaliser un nom de classe CSS à partir d'un label
export const getTagCssClass = (tagLabel) => {
  const tag = getTagByLabel(tagLabel);
  return tag ? tag.id : 'default';
};