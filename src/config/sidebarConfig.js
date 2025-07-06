// Configuration hiérarchique de la sidebar
export const sidebarConfig = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'bi-speedometer2',
    path: '/',
    type: 'single'
  },
  {
    id: 'booking',
    label: 'Booking',
    icon: 'bi-ticket-perforated',
    type: 'section',
    items: [
      {
        id: 'dates',
        label: 'Dates',
        icon: 'bi-music-note-list',
        path: '/dates'
      },
      {
        id: 'contrats',
        label: 'Contrats',
        icon: 'bi-file-earmark-text',
        path: '/contrats'
      },
      {
        id: 'factures',
        label: 'Factures',
        icon: 'bi-receipt',
        path: '/factures'
      },
      {
        id: 'booking-tools',
        label: 'Outils',
        icon: 'bi-tools',
        type: 'subsection',
        items: [
          {
            id: 'debug-booking',
            label: 'Debug Booking',
            icon: 'bi-bug',
            path: '/debug-tools'
          }
        ]
      }
    ]
  },
  {
    id: 'contacts-management',
    label: 'Gestion Contacts',
    icon: 'bi-people',
    type: 'section',
    items: [
      {
        id: 'contacts',
        label: 'Contacts',
        icon: 'bi-person-lines-fill',
        path: '/contacts'
      },
      {
        id: 'structures',
        label: 'Structures',
        icon: 'bi-building',
        path: '/structures'
      },
      {
        id: 'lieux',
        label: 'Lieux',
        icon: 'bi-geo-alt-fill',
        path: '/lieux'
      },
      {
        id: 'artistes',
        label: 'Artistes',
        icon: 'bi-music-note-beamed',
        path: '/artistes'
      }
    ]
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: 'bi-shield-lock',
    type: 'section',
    items: [
      {
        id: 'parametres',
        label: 'Paramètres',
        icon: 'bi-gear',
        path: '/parametres'
      },
      {
        id: 'migration',
        label: 'Migration',
        icon: 'bi-arrow-repeat',
        path: '/admin/migration',
        adminOnly: true
      },
      {
        id: 'admin-tools',
        label: 'Outils',
        icon: 'bi-tools',
        type: 'subsection',
        items: [
          {
            id: 'debug-admin',
            label: 'Debug Admin',
            icon: 'bi-terminal',
            path: '/debug-tools'
          },
          {
            id: 'tabs-test',
            label: 'Test Onglets',
            icon: 'bi-layout-text-sidebar',
            path: '/tabs-test'
          }
        ]
      }
    ]
  }
];

// Fonction utilitaire pour vérifier si un élément de menu est actif
export const isMenuItemActive = (path, currentPath) => {
  if (path === '/') {
    return currentPath === '/';
  }
  return currentPath.includes(path);
};

// Fonction utilitaire pour obtenir tous les chemins de menu
export const getAllMenuPaths = () => {
  const paths = [];
  
  const extractPaths = (items) => {
    items.forEach(item => {
      if (item.path) {
        paths.push(item.path);
      }
      if (item.items) {
        extractPaths(item.items);
      }
    });
  };
  
  extractPaths(sidebarConfig);
  return paths;
};