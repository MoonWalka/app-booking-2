/**
 * Configuration hiérarchique des tags pour les contacts
 * Structure en arborescence avec catégories et sous-catégories
 */

export const TAGS_HIERARCHY = [
  {
    id: 'organisme-institution',
    label: 'Organisme / institution',
    color: '#6f42c1',
    description: 'Organismes publics, institutions culturelles',
    children: [
      { id: 'institution-nationale', label: 'Institution nationale' },
      { id: 'organisme-national', label: 'Organisme national' },
      { id: 'institution-regionale', label: 'Institution régionale' },
      { id: 'organisme-regional', label: 'Organisme régional' },
      { id: 'collectivite-locale', label: 'Collectivité locale' },
      { id: 'mecene-sponsor', label: 'Mécène / sponsor' },
      { id: 'organisme-international', label: 'Organisme international' },
      { id: 'tete-de-reseau', label: 'Tête de réseau' },
      { id: 'institution-departementale', label: 'Institution départementale' },
      { id: 'organisme-departemental', label: 'Organisme départemental' }
    ]
  },
  {
    id: 'disque',
    label: 'Disque',
    color: '#fd7e14',
    description: 'Labels, distributeurs, producteurs musicaux',
    children: [
      { id: 'label-maison-disques', label: 'Label / maison de disques' },
      { id: 'editeur', label: 'Éditeur' },
      { id: 'distributeur', label: 'Distributeur' },
      { id: 'disquaire', label: 'Disquaire' }
    ]
  },
  {
    id: 'ressource-formation',
    label: 'Ressource / Formation',
    color: '#20c997',
    description: 'Centres de formation, ressources pédagogiques',
    children: [
      { id: 'formation', label: 'Formation' },
      { id: 'ressource', label: 'Ressource' },
      { id: 'accompagnement', label: 'Accompagnement' },
      { id: 'studio-repetition', label: 'Studio de répétition' },
      { id: 'residence', label: 'Résidence' }
    ]
  },
  {
    id: 'media',
    label: 'Média',
    color: '#dc3545',
    description: 'Presse, radio, télévision, médias en ligne',
    children: [
      { id: 'agence-presse', label: 'Agence de presse' },
      { id: 'journaliste-animateur', label: 'Journaliste / animateur' },
      {
        id: 'presse-ecrite',
        label: 'Presse écrite',
        children: [
          { id: 'presse-quotidienne-nationale', label: 'Presse quotidienne nationale' },
          { id: 'presse-quotidienne-regionale', label: 'Presse quotidienne régionale' },
          { id: 'magazine-news', label: 'Magazine news' },
          { id: 'presse-culturelle', label: 'Presse culturelle' },
          { id: 'fanzine', label: 'Fanzine' }
        ]
      },
      {
        id: 'radio',
        label: 'Radio',
        children: [
          { id: 'radio-nationale', label: 'Radio nationale' },
          { id: 'radio-locale', label: 'Radio locale' }
        ]
      },
      {
        id: 'television',
        label: 'Télévision',
        children: [
          { id: 'television-nationale', label: 'Télévision nationale' },
          { id: 'television-regionale', label: 'Télévision régionale / locale' }
        ]
      },
      {
        id: 'internet',
        label: 'Internet',
        children: [
          { id: 'presse-en-ligne', label: 'Presse en ligne' },
          { id: 'television-en-ligne', label: 'Télévision en ligne' },
          { id: 'radio-en-ligne', label: 'Radio en ligne' },
          { id: 'plateforme-ecoute', label: 'Plateforme d\'écoute en ligne' },
          { id: 'portail-internet', label: 'Portail Internet' }
        ]
      }
    ]
  },
  {
    id: 'artiste',
    label: 'Artiste',
    color: '#e91e63',
    description: 'Musiciens, groupes, artistes indépendants',
    children: [
      { id: 'artiste-groupe-compagnie', label: 'Artiste / Groupe / Compagnie' },
      { id: 'collectif', label: 'Collectif' }
    ]
  },
  {
    id: 'public',
    label: 'Public',
    color: '#17a2b8',
    description: 'Spectateurs, fans, public général',
    children: []
  },
  {
    id: 'adherent',
    label: 'Adhérent',
    color: '#28a745',
    description: 'Membres adhérents, abonnés',
    children: []
  },
  {
    id: 'personnel',
    label: 'Personnel',
    color: '#6c757d',
    description: 'Employés, collaborateurs internes',
    children: [
      { id: 'equipe-tournee', label: 'Équipe en tournée' },
      { id: 'collaborateur', label: 'Collaborateur' }
    ]
  },
  {
    id: 'diffuseur',
    label: 'Diffuseur',
    color: '#007bff',
    description: 'Salles de concert, festivals, lieux de diffusion',
    children: [
      { id: 'theatre-public', label: 'Théâtre public' },
      { id: 'theatre-prive', label: 'Théâtre privé' },
      { id: 'cafe-culture', label: 'Café-culture' },
      { id: 'club-discotheque', label: 'Club / discothèque' },
      { id: 'scene-musiques-actuelles', label: 'Scène de musiques actuelles' },
      { id: 'scene-envergure-nationale', label: 'Scène d\'envergure nationale' },
      { id: 'centre-culturel', label: 'Centre culturel' },
      { id: 'service-culturel', label: 'Service culturel' },
      { id: 'bibliotheque-mediatheque', label: 'Bibliothèque / Médiathèque' },
      { id: 'diffuseur-occasionnel', label: 'Diffuseur occasionnel' },
      { id: 'festival', label: 'Festival' },
      { id: 'tremplin-concours', label: 'Tremplin, concours et championnats' },
      { id: 'diffuseur-divers', label: 'Diffuseur divers' },
      { id: 'organisateur-sans-lieu', label: 'Organisateur sans lieu' },
      { id: 'musee', label: 'Musée' },
      { id: 'opera', label: 'Opéra' },
      { id: 'salle-spectacles', label: 'Salle de spectacles' }
    ]
  },
  {
    id: 'agent-entrepreneur',
    label: 'Agent, entrepreneur de spectacles',
    color: '#ffc107',
    description: 'Agents artistiques, entrepreneurs de spectacles',
    children: [
      { id: 'producteur-tourneur', label: 'Producteur / Tourneur' },
      { id: 'promoteur-local', label: 'Promoteur local' },
      { id: 'agent', label: 'Agent' },
      { id: 'manager', label: 'Manager' },
      { id: 'evenementiel', label: 'Événementiel' }
    ]
  },
  {
    id: 'prestataire',
    label: 'Prestataire',
    color: '#795548',
    description: 'Fournisseurs de services, prestataires techniques',
    children: [
      { id: 'ingenieur-son-scene', label: 'Ingénieur du son (scène)' },
      { id: 'transport-logistique', label: 'Transport / logistique' },
      { id: 'magasin-instruments', label: 'Magasin d\'instruments' },
      { id: 'hotel', label: 'Hôtel' },
      { id: 'studio-enregistrement', label: 'Studio d\'enregistrement' },
      { id: 'mastering', label: 'Mastering' },
      { id: 'realisateur-artistique', label: 'Réalisateur artistique' },
      { id: 'ingenieur-son-disque', label: 'Ingénieur du son (disque)' },
      { id: 'entreprise-pressage', label: 'Entreprise de pressage' }
    ]
  }
];

// Helper pour obtenir tous les tags de façon plate (pour la compatibilité)
export const getAllTags = () => {
  const flatTags = [];
  
  const addTags = (items, parentPath = '') => {
    items.forEach(item => {
      const fullPath = parentPath ? `${parentPath} > ${item.label}` : item.label;
      
      if (item.children && item.children.length > 0) {
        // Ajouter le parent
        flatTags.push({
          id: item.id,
          label: item.label,
          color: item.color,
          fullPath: fullPath,
          isParent: true
        });
        
        // Ajouter les enfants récursivement
        addTags(item.children, fullPath);
      } else {
        flatTags.push({
          id: item.id,
          label: item.label,
          color: item.color || '#6c757d',
          fullPath: fullPath,
          isParent: false
        });
      }
    });
  };
  
  addTags(TAGS_HIERARCHY);
  return flatTags;
};

// Helper pour obtenir un tag par son ID dans la hiérarchie
export const getTagById = (tagId) => {
  const findTag = (items) => {
    for (const item of items) {
      if (item.id === tagId) {
        return item;
      }
      if (item.children) {
        const found = findTag(item.children);
        if (found) return found;
      }
    }
    return null;
  };
  
  return findTag(TAGS_HIERARCHY);
};

// Helper pour obtenir le chemin complet d'un tag
export const getTagPath = (tagId) => {
  const findPath = (items, path = []) => {
    for (const item of items) {
      const currentPath = [...path, item.label];
      
      if (item.id === tagId) {
        return currentPath;
      }
      
      if (item.children) {
        const found = findPath(item.children, currentPath);
        if (found) return found;
      }
    }
    return null;
  };
  
  return findPath(TAGS_HIERARCHY);
};

// Helper pour obtenir les enfants directs d'un tag
export const getTagChildren = (tagId) => {
  const tag = getTagById(tagId);
  return tag ? tag.children || [] : [];
};

// Helper pour vérifier si un tag a des enfants
export const hasChildren = (tagId) => {
  const tag = getTagById(tagId);
  return tag && tag.children && tag.children.length > 0;
};