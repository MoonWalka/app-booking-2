/**
 * Configuration centralisée pour l'affichage des entités
 * Définit comment chaque type d'entité doit être affiché dans les vues de détails
 */

// Import des composants personnalisés
import ConcertInfoSection from '../components/concerts/ConcertInfoSection';
import LieuMapSection from '../components/lieux/LieuMapSection';

export const entityConfigurations = {
  // Configuration pour les Artistes
  artiste: {
    title: 'Artiste',
    icon: 'bi-music-note-beamed',
    pluralTitle: 'Artistes',
    
    // Champs principaux à afficher
    mainFields: {
      title: 'nom',
      subtitle: 'style',
      image: 'photo'
    },
    
    // Sections à afficher dans la vue détail
    sections: [
      {
        id: 'info',
        title: 'Informations générales',
        icon: 'bi-info-circle',
        type: 'info',
        fields: [
          { key: 'style', label: 'Style musical', type: 'text' },
          { key: 'pays', label: 'Pays', type: 'text' },
          { key: 'email', label: 'Email', type: 'email' },
          { key: 'telephone', label: 'Téléphone', type: 'phone' },
          { key: 'siteWeb', label: 'Site web', type: 'url' }
        ]
      },
      {
        id: 'bio',
        title: 'Biographie',
        icon: 'bi-file-text',
        type: 'text',
        field: 'biographie'
      },
      {
        id: 'concerts',
        title: 'Concerts',
        icon: 'bi-calendar-event',
        type: 'relations',
        relation: 'concerts',
        displayType: 'cards',
        maxItems: 10,
        emptyMessage: 'Aucun concert associé'
      }
    ],
    
    // Relations à charger
    relations: {
      concerts: { 
        collection: 'concerts', 
        field: 'concertsIds', 
        isArray: true,
        displayName: 'Concerts',
        bidirectional: true,
        inverseField: 'artistesIds'
      }
    }
  },
  
  // Configuration pour les Lieux
  lieu: {
    title: 'Lieu',
    icon: 'bi-geo-alt',
    pluralTitle: 'Lieux',
    
    mainFields: {
      title: 'nom',
      subtitle: (lieu) => lieu.adresse?.ville || lieu.ville || '',
      image: 'photo'
    },
    
    sections: [
      {
        id: 'info',
        title: 'Informations générales',
        icon: 'bi-info-circle',
        type: 'info',
        fields: [
          { key: 'nom', label: 'Nom', type: 'text' },
          { key: 'type', label: 'Type de lieu', type: 'text' },
          { key: 'capacite', label: 'Capacité', type: 'number', suffix: ' personnes' },
          { key: 'email', label: 'Email', type: 'email' },
          { key: 'telephone', label: 'Téléphone', type: 'phone' },
          { key: 'siteWeb', label: 'Site web', type: 'url' },
          { key: 'description', label: 'Description', type: 'text' }
        ]
      },
      {
        id: 'adresse',
        title: 'Adresse',
        icon: 'bi-map',
        type: 'address',
        fields: [
          { key: 'adresse', label: 'Rue', type: 'text' },
          { key: 'codePostal', label: 'Code postal', type: 'text' },
          { key: 'ville', label: 'Ville', type: 'text' },
          { key: 'pays', label: 'Pays', type: 'text' }
        ]
      },
      {
        id: 'map',
        title: 'Carte',
        icon: 'bi-map-fill',
        type: 'custom',
        customRenderer: LieuMapSection
      },
      {
        id: 'description',
        title: 'Description',
        icon: 'bi-file-text',
        type: 'text',
        field: 'presentation', // Le champ principal
        alternativeFields: ['description', 'notes', 'commentaire', 'info'] // Champs alternatifs à essayer
      },
      {
        id: 'contacts',
        title: 'Contacts associés',
        icon: 'bi-people',
        type: 'relations',
        relation: 'contacts',
        displayType: 'cards',
        maxItems: 10,
        emptyMessage: 'Aucun contact associé'
      },
      {
        id: 'concerts',
        title: 'Concerts',
        icon: 'bi-calendar-event',
        type: 'relations',
        relation: 'concerts',
        displayType: 'list',
        maxItems: 20,
        sortBy: 'date',
        sortOrder: 'desc'
      }
    ],
    
    relations: {
      contacts: { 
        collection: 'contacts', 
        field: 'contactIds', 
        isArray: true,
        displayName: 'Contacts',
        bidirectional: true,
        inverseField: 'lieuxIds'
      },
      concerts: { 
        collection: 'concerts', 
        field: 'concertsIds', 
        isArray: true,
        displayName: 'Concerts'
      }
    }
  },
  
  // Configuration pour les Contacts/Contacts
  contact: {
    title: 'Contact',
    icon: 'bi-person',
    pluralTitle: 'Contacts',
    
    mainFields: {
      title: 'nom',
      subtitle: (prog) => prog.structure?.nom || prog.fonction || '',
      image: 'photo'
    },
    
    sections: [
      {
        id: 'info',
        title: 'Informations personnelles',
        icon: 'bi-info-circle',
        type: 'info',
        fields: [
          { key: 'prenom', label: 'Prénom', type: 'text' },
          { key: 'nom', label: 'Nom', type: 'text' },
          { key: 'fonction', label: 'Fonction', type: 'text' },
          { key: 'email', label: 'Email', type: 'email' },
          { key: 'telephone', label: 'Téléphone', type: 'phone' }
        ]
      },
      {
        id: 'structure',
        title: 'Structure',
        icon: 'bi-building',
        type: 'relations',
        relation: 'structure',
        displayType: 'card',
        single: true
      },
      {
        id: 'lieux',
        title: 'Lieux gérés',
        icon: 'bi-geo-alt',
        type: 'relations',
        relation: 'lieux',
        displayType: 'cards',
        maxItems: 10
      },
      {
        id: 'concerts',
        title: 'Concerts organisés',
        icon: 'bi-calendar-event',
        type: 'relations',
        relation: 'concerts',
        displayType: 'list',
        maxItems: 20,
        sortBy: 'date',
        sortOrder: 'desc',
        emptyMessage: 'Aucun concert associé'
      },
      {
        id: 'notes',
        title: 'Notes',
        icon: 'bi-journal-text',
        type: 'text',
        field: 'notes'
      }
    ],
    
    relations: {
      structure: { 
        collection: 'structures', 
        field: 'structureId', 
        isArray: false,
        displayName: 'Structure'
      },
      lieux: { 
        collection: 'lieux', 
        field: 'lieuxIds', 
        isArray: true,
        displayName: 'Lieux',
        bidirectional: true,
        inverseField: 'contactIds'
      },
      concerts: { 
        collection: 'concerts', 
        field: 'concertsIds', 
        isArray: true,
        displayName: 'Concerts',
        bidirectional: true,
        inverseField: 'contactId'
      }
    }
  },
  
  // Configuration pour les Concerts
  concert: {
    title: 'Concert',
    icon: 'bi-calendar-event',
    pluralTitle: 'Concerts',
    
    mainFields: {
      title: 'titre',
      subtitle: (concert) => concert.date ? new Date(concert.date).toLocaleDateString('fr-FR') : '',
      badge: (concert) => concert.statut || 'brouillon'
    },
    
    sections: [
      {
        id: 'info',
        title: 'Informations générales',
        icon: 'bi-info-circle',
        type: 'custom',
        customRenderer: ConcertInfoSection,
        className: 'concertInfo'
      },
      {
        id: 'artistes',
        title: 'Artistes',
        icon: 'bi-music-note-beamed',
        type: 'relations',
        relation: 'artistes',
        displayType: 'cards',
        required: true,
        emptyMessage: 'Aucun artiste sélectionné'
      },
      {
        id: 'lieu',
        title: 'Lieu',
        icon: 'bi-geo-alt',
        type: 'relations',
        relation: 'lieu',
        displayType: 'card',
        single: true,
        required: true
      },
      {
        id: 'contact',
        title: 'Organisateur',
        icon: 'bi-person',
        type: 'relations',
        relation: 'contact',
        displayType: 'card',
        single: true
      },
      {
        id: 'notes',
        title: 'Notes',
        icon: 'bi-journal-text',
        type: 'text',
        field: 'notes'
      }
    ],
    
    relations: {
      artistes: { 
        collection: 'artistes', 
        field: 'artistesIds', 
        isArray: true,
        displayName: 'Artistes'
      },
      lieu: { 
        collection: 'lieux', 
        field: 'lieuId', 
        isArray: false,
        displayName: 'Lieu'
      },
      contact: { 
        collection: 'contacts', 
        field: 'contactId', 
        isArray: false,
        displayName: 'Organisateur',
        bidirectional: true,
        inverseField: 'concertsIds'
      },
      structure: {
        collection: 'structures',
        field: 'structureId',
        isArray: false,
        displayName: 'Structure',
        bidirectional: true,
        inverseField: 'concertsIds'
      }
    }
  },
  
  // Configuration pour les Structures
  structure: {
    title: 'Structure',
    icon: 'bi-building',
    pluralTitle: 'Structures',
    
    mainFields: {
      title: 'nom',
      subtitle: 'type',
      image: 'logo'
    },
    
    sections: [
      {
        id: 'info',
        title: 'Informations générales',
        icon: 'bi-info-circle',
        type: 'info',
        fields: [
          { key: 'type', label: 'Type de structure', type: 'text' },
          { key: 'email', label: 'Email', type: 'email' },
          { key: 'telephone', label: 'Téléphone', type: 'phone' },
          { key: 'siteWeb', label: 'Site web', type: 'url' },
          { key: 'numeroSiret', label: 'SIRET', type: 'text' }
        ]
      },
      {
        id: 'adresse',
        title: 'Adresse',
        icon: 'bi-map',
        type: 'address',
        fields: [
          { key: 'adresse.rue', label: 'Rue', type: 'text' },
          { key: 'adresse.codePostal', label: 'Code postal', type: 'text' },
          { key: 'adresse.ville', label: 'Ville', type: 'text' },
          { key: 'adresse.pays', label: 'Pays', type: 'text' }
        ]
      },
      {
        id: 'contacts',
        title: 'Contacts',
        icon: 'bi-people',
        type: 'relations',
        relation: 'contacts',
        displayType: 'cards',
        maxItems: 20,
        emptyMessage: 'Aucun contact associé'
      },
      {
        id: 'concerts',
        title: 'Concerts',
        icon: 'bi-calendar-event',
        type: 'relations',
        relation: 'concerts',
        displayType: 'list',
        maxItems: 20,
        sortBy: 'date',
        sortOrder: 'desc',
        emptyMessage: 'Aucun concert organisé'
      },
      {
        id: 'description',
        title: 'Description',
        icon: 'bi-file-text',
        type: 'text',
        field: 'description'
      }
    ],
    
    relations: {
      contacts: { 
        collection: 'contacts', 
        field: 'contactsIds', 
        isArray: true,
        displayName: 'Contacts',
        reverseField: 'structureId',
        bidirectional: true
      },
      concerts: {
        collection: 'concerts',
        field: 'concertsIds',
        isArray: true,
        displayName: 'Concerts',
        reverseField: 'structureId',
        bidirectional: true
      }
    }
  }
};

// Helper pour obtenir la configuration d'une entité
export const getEntityConfig = (entityType) => {
  return entityConfigurations[entityType] || null;
};

// Helper pour obtenir la valeur d'un champ imbriqué
export const getNestedValue = (obj, path) => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};