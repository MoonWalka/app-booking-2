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

// Hiérarchie pour les genres
export const GENRES_HIERARCHY = [
  {
    id: 'musique',
    label: 'Musique',
    color: '#e91e63',
    description: 'Genres musicaux',
    children: [
      { id: 'musique-classique', label: 'Musique classique' },
      {
        id: 'musiques-actuelles',
        label: 'Musiques actuelles',
        children: [
          { id: 'traditionnel-world', label: 'Traditionnel et world' },
          { id: 'jazz-blues', label: 'Jazz & blues' },
          { id: 'musiques-electroniques', label: 'Musiques électroniques' },
          { id: 'reggae-ska-dub', label: 'Reggae, ska, dub' },
          { id: 'hip-hop-rnb', label: 'Hip-Hop, R&B' },
          { id: 'rock', label: 'Rock' },
          { id: 'pop', label: 'Pop' },
          { id: 'chanson', label: 'Chanson' },
          { id: 'dj-mix', label: 'DJ, Mix' },
          { id: 'soul-funk', label: 'Soul, funk' }
        ]
      }
    ]
  },
  {
    id: 'arts-vivants',
    label: 'Arts vivants',
    color: '#9c27b0',
    description: 'Spectacles vivants',
    children: [
      { id: 'arts-de-rue', label: 'Arts de rue' },
      { id: 'burlesque', label: 'Burlesque' },
      { id: 'cirque', label: 'Cirque' },
      { id: 'clown', label: 'Clown' },
      { id: 'conte', label: 'Conte' },
      { id: 'danse', label: 'Danse' },
      { id: 'humour', label: 'Humour' },
      { id: 'litterature-poesie', label: 'Littérature, poésie' },
      { id: 'marionnettes', label: 'Marionnettes' },
      { id: 'theatre', label: 'Théâtre' }
    ]
  },
  {
    id: 'pluridisciplinaire',
    label: 'Pluridisciplinaire',
    color: '#00bcd4',
    description: 'Mélange de disciplines',
    children: []
  },
  {
    id: 'arts-plastiques',
    label: 'Arts plastiques',
    color: '#ff9800',
    description: 'Arts visuels',
    children: []
  },
  {
    id: 'cinema',
    label: 'Cinéma',
    color: '#f44336',
    description: 'Œuvres cinématographiques',
    children: []
  },
  {
    id: 'expositions',
    label: 'Expositions',
    color: '#795548',
    description: 'Événements d\'exposition',
    children: []
  },
  {
    id: 'video-arts-numeriques',
    label: 'Vidéo et arts numériques',
    color: '#607d8b',
    description: 'Arts digitaux et vidéo',
    children: []
  },
  {
    id: 'jeune-public',
    label: 'Jeune public',
    color: '#4caf50',
    description: 'Destiné aux enfants et adolescents',
    children: []
  }
];
// Hiérarchie pour les réseaux
export const RESEAUX_HIERARCHY = [
  { id: 'actes-if', label: 'Actes IF', color: '#2196f3' },
  { id: 'ajc-jazze-croise', label: 'AJC – Jazzé Croisé', color: '#2196f3' },
  { id: 'apresmmai', label: 'AprèsMai', color: '#2196f3' },
  { id: 'atp', label: 'ATP', color: '#2196f3' },
  { id: 'avant-mardi', label: 'Avant-Mardi', color: '#2196f3' },
  { id: 'bretagne-en-scene', label: 'Bretagne en Scène', color: '#2196f3' },
  { id: 'ccr', label: 'CCR', color: '#2196f3' },
  { id: 'centre-choregraphique-national', label: 'Centre Chorégraphique National', color: '#2196f3' },
  { id: 'centre-developpement-choregraphique', label: 'Centre de Développement Chorégraphique', color: '#2196f3' },
  { id: 'centre-dramatique-national', label: 'Centre Dramatique National', color: '#2196f3' },
  { id: 'centre-dramatique-regional', label: 'Centre Dramatique Régional', color: '#2196f3' },
  { id: 'centre-national-creation', label: 'Centre National de Création', color: '#2196f3' },
  { id: 'centre-national-arts-rue', label: 'Centre National des Arts de la rue', color: '#2196f3' },
  { id: 'chainon', label: 'Chaînon', color: '#2196f3' },
  { id: 'combo95', label: 'Combo95', color: '#2196f3' },
  { id: 'creatyve', label: 'Créat\'Yve', color: '#2196f3' },
  { id: 'crous', label: 'CROUS', color: '#2196f3' },
  { id: 'cry-78', label: 'CRY (78)', color: '#2196f3' },
  { id: 'culture-bar-bars', label: 'Culture Bar-Bars', color: '#2196f3' },
  { id: 'efwmf', label: 'EFWMF', color: '#2196f3' },
  { id: 'fedelima', label: 'Fedelima', color: '#2196f3' },
  { id: 'federation-petites-scenes-paris', label: 'Fédération des Petites Scènes de Paris', color: '#2196f3' },
  { id: 'federation-scenes-jazz-impro', label: 'Fédération des Scènes de Jazz et Musiques Impro', color: '#2196f3' },
  { id: 'federation-nationale-arts-rue', label: 'Fédération Nationale des Arts de la Rue', color: '#2196f3' },
  { id: 'fepra', label: 'Fepra', color: '#2196f3' },
  { id: 'festival-musical-grands-crus-bourgogne', label: 'Festival Musical des Grands Crus de Bourgogne', color: '#2196f3' },
  { id: 'festival-off-avignon', label: 'Festival Off d\'Avignon', color: '#2196f3' },
  { id: 'fneijma', label: 'FNEIJMA', color: '#2196f3' },
  { id: 'fracama', label: 'Fracama', color: '#2196f3' },
  { id: 'france-festival', label: 'France festival', color: '#2196f3' },
  { id: 'g19', label: 'G19', color: '#2196f3' },
  { id: 'gral', label: 'Gral', color: '#2196f3' },
  { id: 'grand-bureau', label: 'Grand Bureau', color: '#2196f3' },
  { id: 'groupe-20-ile-france', label: 'Groupe des 20 Île-de-France', color: '#2196f3' },
  { id: 'groupe-20-rhone-alpes', label: 'Groupe des 20 Rhône-Alpes', color: '#2196f3' },
  { id: 'jazz-ra', label: 'Jazz(s)RA', color: '#2196f3' },
  { id: 'la-deferlante', label: 'La Déferlante', color: '#2196f3' },
  { id: 'collectif-festivals', label: 'Le Collectif des Festivals', color: '#2196f3' },
  { id: 'pole-pays-loire', label: 'Le Pôle – Pays de la Loire', color: '#2196f3' },
  { id: 'lieux-missionnes-compagnonnage-marionnette', label: 'Lieux missionnés compagnonnage Marionnette', color: '#2196f3' },
  { id: 'maad-93', label: 'MAAD 93', color: '#2196f3' },
  { id: 'mael', label: 'MAEL', color: '#2196f3' },
  { id: 'map-paris', label: 'MAP (Réseau des Musiques Actuelles de Paris)', color: '#2196f3' },
  { id: 'mjc-mpt', label: 'MJC – MPT', color: '#2196f3' },
  { id: 'musiques-94', label: 'Musiques 94', color: '#2196f3' },
  { id: 'paris-jazz-club', label: 'Paris Jazz Club', color: '#2196f3' },
  { id: 'patch', label: 'Patch', color: '#2196f3' },
  { id: 'phonopaca', label: 'PhonoPaca', color: '#2196f3' },
  { id: 'pince-oreilles-77', label: 'Pince-Oreilles (77)', color: '#2196f3' },
  { id: 'polca', label: 'Polca', color: '#2196f3' },
  { id: 'pole-national-arts-cirque', label: 'Pôle National des Arts du Cirque', color: '#2196f3' },
  { id: 'raoul', label: 'Raoul', color: '#2196f3' },
  { id: 'rca', label: 'RCA', color: '#2196f3' },
  { id: 'renar', label: 'RENAR', color: '#2196f3' },
  { id: 'reseau-printemps', label: 'Réseau Printemps', color: '#2196f3' },
  { id: 'reseau-ressource', label: 'Réseau Ressource', color: '#2196f3' },
  { id: 'reseau92', label: 'Reseau92', color: '#2196f3' },
  { id: 'reunion-operas-france', label: 'Réunion des Opéras de France', color: '#2196f3' },
  { id: 'rezone-91', label: 'REZONE 91', color: '#2196f3' },
  { id: 'rif', label: 'RIF', color: '#2196f3' },
  { id: 'rim', label: 'RIM', color: '#2196f3' },
  { id: 'rman-normandie', label: 'RMAN – Réseau des Musiques Actuelles en Normandie', color: '#2196f3' },
  { id: 's2m', label: 'S2M', color: '#2196f3' },
  { id: 'scene-conventionnee', label: 'Scène Conventionnée', color: '#2196f3' },
  { id: 'scene-nationale', label: 'Scène Nationale', color: '#2196f3' },
  { id: 'smac', label: 'SMAC', color: '#2196f3' },
  { id: 'territoires-cirque', label: 'Territoires de Cirque', color: '#2196f3' },
  { id: 'theatre-departemental', label: 'Théâtre Départemental', color: '#2196f3' },
  { id: 'theatre-national', label: 'Théâtre National', color: '#2196f3' },
  { id: 'theatre-parisiens-associes', label: 'Théâtre Parisiens Associés', color: '#2196f3' },
  { id: 'theatre-regional', label: 'Théâtre Régional', color: '#2196f3' },
  { id: 'tras', label: 'TRAS', color: '#2196f3' },
  { id: 'yourope', label: 'Yourope', color: '#2196f3' },
  { id: 'zenith', label: 'Zénith', color: '#2196f3' },
  { id: 'zone-franche', label: 'Zone Franche', color: '#2196f3' }
];
// Hiérarchie pour les mots-clés (gérée par l'utilisateur)
export const MOTS_CLES_HIERARCHY = [
  {
    id: 'mots-cles-utilisateur',
    label: 'Mots-clés personnalisés',
    color: '#9c27b0',
    description: 'Mots-clés définis par l\'utilisateur',
    children: []
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