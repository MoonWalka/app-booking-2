// Registre centralisé des composants disponibles pour le preview
// Ce fichier facilite l'ajout de nouveaux composants sans modifier PreviewWrapper.js

export const componentRegistry = {
  // Artistes
  'ArtisteForm': {
    path: () => import('../artistes/desktop/ArtisteForm'),
    category: 'Artistes',
    description: 'Formulaire de création/édition d\'artiste',
    defaultProps: { mode: 'create', onSubmit: () => console.log('Submit') }
  },
  'ArtisteView': {
    path: () => import('../artistes/desktop/ArtisteView'),
    category: 'Artistes',
    description: 'Vue détaillée d\'un artiste',
    defaultProps: { artisteId: 'demo-id' }
  },
  'ArtistesList': {
    path: () => import('../artistes/desktop/ArtistesList'),
    category: 'Artistes',
    description: 'Liste des artistes',
    defaultProps: { items: [], loading: false }
  },
  
  // Contacts
  'ContactForm': {
    path: () => import('../contacts/desktop/ContactForm'),
    category: 'Contacts',
    description: 'Formulaire de création/édition de contact',
    defaultProps: { mode: 'create', onSubmit: () => console.log('Submit') }
  },
  'ContactView': {
    path: () => import('../contacts/desktop/ContactView'),
    category: 'Contacts',
    description: 'Vue détaillée d\'un contact',
    defaultProps: { contactId: 'demo-id' }
  },
  'ContactsList': {
    path: () => import('../contacts/desktop/ContactsList'),
    category: 'Contacts',
    description: 'Liste des contacts',
    defaultProps: { contacts: [], loading: false }
  },
  
  // Dates
  'DateForm': {
    path: () => import('../dates/desktop/DateForm'),
    category: 'Dates',
    description: 'Formulaire de création/édition de date',
    defaultProps: { mode: 'create', onSubmit: () => console.log('Submit') }
  },
  'DateView': {
    path: () => import('../dates/desktop/DateView'),
    category: 'Dates',
    description: 'Vue détaillée d\'une date',
    defaultProps: { dateId: 'demo-id' }
  },
  'DatesList': {
    path: () => import('../dates/desktop/DatesList'),
    category: 'Dates',
    description: 'Liste des dates',
    defaultProps: { dates: [], loading: false }
  },
  
  // Contrats
  'ContratGenerator': {
    path: () => import('../contrats/desktop/ContratGenerator'),
    category: 'Contrats',
    description: 'Générateur de contrats',
    defaultProps: { dateId: 'demo-id' }
  },
  'ContratGeneratorNew': {
    path: () => import('../contrats/desktop/ContratGeneratorNew'),
    category: 'Contrats',
    description: 'Nouveau générateur de contrats',
    defaultProps: { dateId: 'demo-id' }
  },
  
  // Factures
  'FactureEditor': {
    path: () => import('../factures/FactureEditor'),
    category: 'Factures',
    description: 'Éditeur de factures',
    defaultProps: { dateId: 'demo-id', mode: 'create' }
  },
  'FacturePreview': {
    path: () => import('../factures/FacturePreview'),
    category: 'Factures',
    description: 'Aperçu de facture',
    defaultProps: {}
  },
  
  // Lieux - OBSOLÈTE - Remplacé par Salles et Festivals
  // 'LieuForm': {
  //   path: () => import('../lieux/desktop/LieuForm'),
  //   category: 'Lieux',
  //   description: 'Formulaire de création/édition de lieu',
  //   defaultProps: { mode: 'create', onSubmit: () => console.log('Submit') }
  // },
  // 'LieuView': {
  //   path: () => import('../lieux/desktop/LieuView'),
  //   category: 'Lieux',
  //   description: 'Vue détaillée d\'un lieu',
  //   defaultProps: { lieuId: 'demo-id' }
  // },
  // 'LieuxList': {
  //   path: () => import('../lieux/desktop/LieuxList'),
  //   category: 'Lieux',
  //   description: 'Liste des lieux',
  //   defaultProps: { lieux: [], loading: false }
  // },
  
  // Structures
  'StructureForm': {
    path: () => import('../structures/desktop/StructureForm'),
    category: 'Structures',
    description: 'Formulaire de création/édition de structure',
    defaultProps: { mode: 'create', onSubmit: () => console.log('Submit') }
  },
  'StructureView': {
    path: () => import('../structures/desktop/StructureView'),
    category: 'Structures',
    description: 'Vue détaillée d\'une structure',
    defaultProps: { structureId: 'demo-id' }
  },
  'StructuresList': {
    path: () => import('../structures/desktop/StructuresList'),
    category: 'Structures',
    description: 'Liste des structures',
    defaultProps: { structures: [], loading: false }
  },
  
  // UI Components
  'Button': {
    path: () => import('../ui/Button'),
    category: 'UI',
    description: 'Composant bouton',
    defaultProps: { children: 'Cliquez-moi', variant: 'primary' }
  },
  'Card': {
    path: () => import('../ui/Card'),
    category: 'UI',
    description: 'Composant carte',
    defaultProps: { title: 'Titre de la carte', children: 'Contenu de la carte' }
  },
  'Table': {
    path: () => import('../ui/Table'),
    category: 'UI',
    description: 'Composant tableau',
    defaultProps: { columns: [], data: [] }
  },
  
  // Common
  'TabManager': {
    path: () => import('../tabs/TabManager'),
    category: 'Common',
    description: 'Gestionnaire d\'onglets',
    defaultProps: {}
  },
  'EntityViewTabs': {
    path: () => import('../common/EntityViewTabs'),
    category: 'Common',
    description: 'Onglets pour vue entité',
    defaultProps: {}
  },
  'GenericDetailView': {
    path: () => import('../common/GenericDetailView'),
    category: 'Common',
    description: 'Vue détaillée générique',
    defaultProps: {}
  }
};

// Fonction pour obtenir la liste des composants disponibles
export const getAvailableComponents = () => {
  return Object.entries(componentRegistry).map(([name, config]) => ({
    name,
    category: config.category,
    description: config.description
  }));
};

// Fonction pour obtenir la configuration d'un composant
export const getComponentConfig = (componentName) => {
  return componentRegistry[componentName];
};