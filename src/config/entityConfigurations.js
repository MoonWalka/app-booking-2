/**
 * Configuration centralisée pour l'affichage des entités
 * Définit comment chaque type d'entité doit être affiché dans les vues de détails
 */

// Import des composants personnalisés
import DateInfoSection from '../components/dates/sections/DateInfoSection';
// import LieuMapSection from '../components/lieux/LieuMapSection'; // OBSOLÈTE

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
        id: 'dates',
        title: 'Dates',
        icon: 'bi-calendar-event',
        type: 'relations',
        relation: 'dates',
        displayType: 'cards',
        maxItems: 10,
        emptyMessage: 'Aucun date associé'
      }
    ],
    
    // Relations à charger
    relations: {
      dates: { 
        collection: 'dates', 
        field: 'datesIds', 
        isArray: true,
        displayName: 'Dates',
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
        // customRenderer: LieuMapSection // OBSOLÈTE
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
        id: 'dates',
        title: 'Dates',
        icon: 'bi-calendar-event',
        type: 'relations',
        relation: 'dates',
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
      dates: { 
        collection: 'dates', 
        field: 'datesIds', 
        isArray: true,
        displayName: 'Dates'
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
        id: 'dates',
        title: 'Dates organisés',
        icon: 'bi-calendar-event',
        type: 'relations',
        relation: 'dates',
        displayType: 'list',
        maxItems: 20,
        sortBy: 'date',
        sortOrder: 'desc',
        emptyMessage: 'Aucun date associé'
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
        displayName: 'Structure',
        bidirectional: true,
        inverseField: 'contactIds' // Harmonisé de contactsIds à contactIds
      },
      lieux: { 
        collection: 'lieux', 
        field: 'lieuxIds', 
        isArray: true,
        displayName: 'Lieux',
        bidirectional: true,
        inverseField: 'contactIds'
      },
      dates: { 
        collection: 'dates', 
        field: 'datesIds', 
        isArray: true,
        displayName: 'Dates',
        bidirectional: true,
        inverseField: 'contactIds'
      }
    }
  },
  
  // Configuration pour les Dates
  date: {
    title: 'Date',
    icon: 'bi-calendar-event',
    pluralTitle: 'Dates',
    
    mainFields: {
      title: 'titre',
      subtitle: (date) => date.date ? new Date(date.date).toLocaleDateString('fr-FR') : '',
      badge: (date) => date.statut || 'brouillon'
    },
    
    sections: [
      {
        id: 'info',
        title: 'Informations générales',
        icon: 'bi-info-circle',
        type: 'custom',
        customRenderer: DateInfoSection,
        className: 'dateInfo'
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
        title: 'Contacts', // Changé au pluriel pour cohérence future
        icon: 'bi-person',
        type: 'relations',
        relation: 'contact',
        displayType: 'cards', // Changé de 'card' à 'cards' pour multi-contacts
        single: false        // Changé de true à false pour multi-contacts
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
        field: 'artisteId',  // Changé de artistesIds à artisteId car un date n'a qu'un artiste principal
        isArray: false,
        displayName: 'Artiste',
        bidirectional: true,
        inverseField: 'datesIds'
      },
      lieu: { 
        collection: 'lieux', 
        field: 'lieuId', 
        isArray: false,
        displayName: 'Lieu',
        bidirectional: true,
        inverseField: 'datesIds'
      },
      contact: { 
        collection: 'contacts', 
        field: 'contactIds', // Changé de contactId à contactIds pour migration future
        isArray: true,      // Changé à true pour supporter plusieurs contacts
        displayName: 'Contacts',
        bidirectional: true,
        inverseField: 'datesIds'
      },
      structure: {
        collection: 'structures',
        field: 'structureId',
        isArray: false,
        displayName: 'Structure',
        bidirectional: true,
        inverseField: 'datesIds'
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
        id: 'dates',
        title: 'Dates',
        icon: 'bi-calendar-event',
        type: 'relations',
        relation: 'dates',
        displayType: 'list',
        maxItems: 20,
        sortBy: 'date',
        sortOrder: 'desc',
        emptyMessage: 'Aucun date organisé'
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
        field: 'contactIds', // Harmonisé de contactsIds à contactIds
        isArray: true,
        displayName: 'Contacts',
        inverseField: 'structureId',
        bidirectional: true
      },
      dates: {
        collection: 'dates',
        field: 'datesIds',
        isArray: true,
        displayName: 'Dates',
        inverseField: 'structureId',
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