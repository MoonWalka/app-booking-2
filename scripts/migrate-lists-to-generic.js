#!/usr/bin/env node

/**
 * Script de migration des listes vers ListWithFilters
 * Génère automatiquement les nouvelles versions unifiées
 */

const fs = require('fs');
const path = require('path');

// Configuration des entités à migrer
const entities = [
  {
    name: 'artistes',
    displayName: 'Artistes',
    columns: [
      {
        id: 'nom',
        label: 'Nom',
        field: 'nom',
        sortable: true,
        render: `(item) => (
        <div className={styles.nameCell}>
          <strong>{item.nom}</strong>
          {item.genre && <div className={styles.genre}>{item.genre}</div>}
        </div>
      )`
      },
      {
        id: 'genre',
        label: 'Genre',
        field: 'genre',
        sortable: true
      },
      {
        id: 'contact',
        label: 'Contact',
        render: `(item) => (
        <div className={styles.contactCell}>
          {item.email && <a href={\`mailto:\${item.email}\`}><i className="bi bi-envelope" /> {!isMobile && item.email}</a>}
          {item.telephone && <a href={\`tel:\${item.telephone}\`}><i className="bi bi-telephone" /> {!isMobile && item.telephone}</a>}
        </div>
      )`
      }
    ],
    filters: [
      {
        id: 'genre',
        label: 'Genre',
        field: 'genre',
        type: 'select',
        options: [
          { value: 'rock', label: 'Rock' },
          { value: 'jazz', label: 'Jazz' },
          { value: 'pop', label: 'Pop' },
          { value: 'electronic', label: 'Électronique' }
        ]
      }
    ]
  },
  {
    name: 'lieux',
    displayName: 'Lieux',
    columns: [
      {
        id: 'nom',
        label: 'Nom',
        field: 'nom',
        sortable: true,
        render: `(item) => (
        <div className={styles.nameCell}>
          <strong>{item.nom}</strong>
          {item.type && <div className={styles.type}>{item.type}</div>}
        </div>
      )`
      },
      {
        id: 'ville',
        label: 'Ville',
        field: 'ville',
        sortable: true
      },
      {
        id: 'capacite',
        label: 'Capacité',
        field: 'capacite',
        sortable: true,
        render: `(item) => item.capacite ? \`\${item.capacite} places\` : '-'`
      }
    ],
    filters: [
      {
        id: 'type',
        label: 'Type',
        field: 'type',
        type: 'select',
        options: [
          { value: 'salle', label: 'Salle de concert' },
          { value: 'bar', label: 'Bar' },
          { value: 'festival', label: 'Festival' },
          { value: 'club', label: 'Club' }
        ]
      },
      {
        id: 'ville',
        label: 'Ville',
        field: 'ville',
        type: 'text',
        placeholder: 'Rechercher une ville...'
      }
    ]
  },
  {
    name: 'concerts',
    displayName: 'Concerts',
    columns: [
      {
        id: 'date',
        label: 'Date',
        field: 'date',
        sortable: true,
        render: `(item) => new Date(item.date).toLocaleDateString('fr-FR')`
      },
      {
        id: 'artiste',
        label: 'Artiste',
        field: 'artiste.nom',
        sortable: true,
        render: `(item) => item.artiste?.nom || 'Non défini'`
      },
      {
        id: 'lieu',
        label: 'Lieu',
        field: 'lieu.nom',
        sortable: true,
        render: `(item) => item.lieu?.nom || 'Non défini'`
      },
      {
        id: 'statut',
        label: 'Statut',
        field: 'statut',
        render: `(item) => (
        <span className={\`badge bg-\${item.statut === 'confirme' ? 'success' : 'warning'}\`}>
          {item.statut || 'En attente'}
        </span>
      )`
      }
    ],
    filters: [
      {
        id: 'statut',
        label: 'Statut',
        field: 'statut',
        type: 'select',
        options: [
          { value: 'confirme', label: 'Confirmé' },
          { value: 'en_attente', label: 'En attente' },
          { value: 'annule', label: 'Annulé' }
        ]
      },
      {
        id: 'date',
        label: 'Date',
        field: 'date',
        type: 'date'
      }
    ]
  }
];

// Template pour générer le composant
const generateListComponent = (entity) => {
  const componentName = entity.name.charAt(0).toUpperCase() + entity.name.slice(1) + 'List';
  
  return `// src/components/${entity.name}/${componentName}.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ListWithFilters from '@/components/ui/ListWithFilters';
import { useOrganization } from '@/context/OrganizationContext';
import { useResponsive } from '@/hooks/common';
import styles from './${componentName}.module.css';

/**
 * Liste unifiée des ${entity.name} utilisant ListWithFilters
 * Fonctionne en desktop et mobile avec le contexte multi-org
 */
const ${componentName} = () => {
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  const { currentOrg } = useOrganization();

  // Configuration des colonnes responsive
  const columns = [
${entity.columns.map(col => `    {
      id: '${col.id}',
      label: '${col.label}',
      ${col.field ? `field: '${col.field}',` : ''}
      ${col.sortable ? 'sortable: true,' : ''}
      ${col.render ? `render: ${col.render}` : ''}
    }`).join(',\n')}
  ];

  // Configuration des filtres
  const filterOptions = [
${entity.filters.map(filter => `    {
      id: '${filter.id}',
      label: '${filter.label}',
      field: '${filter.field}',
      type: '${filter.type}',
      ${filter.placeholder ? `placeholder: '${filter.placeholder}',` : ''}
      ${filter.options ? `options: ${JSON.stringify(filter.options, null, 8).split('\n').join('\n      ')}` : ''}
    }`).join(',\n')}
  ];

  // Actions responsive
  const renderActions = (item) => {
    if (isMobile) {
      return (
        <div className="dropdown">
          <button 
            className="btn btn-sm btn-light dropdown-toggle" 
            data-bs-toggle="dropdown"
          >
            <i className="bi bi-three-dots-vertical" />
          </button>
          <ul className="dropdown-menu">
            <li>
              <button 
                className="dropdown-item"
                onClick={() => navigate(\`/${entity.name}/\${item.id}\`)}
              >
                <i className="bi bi-eye me-2" /> Voir
              </button>
            </li>
            <li>
              <button 
                className="dropdown-item"
                onClick={() => navigate(\`/${entity.name}/\${item.id}/edit\`)}
              >
                <i className="bi bi-pencil me-2" /> Modifier
              </button>
            </li>
            <li><hr className="dropdown-divider" /></li>
            <li>
              <button 
                className="dropdown-item text-danger"
                onClick={() => handleDelete(item.id)}
              >
                <i className="bi bi-trash me-2" /> Supprimer
              </button>
            </li>
          </ul>
        </div>
      );
    }

    return (
      <div className={styles.actionButtons}>
        <button 
          className="btn btn-sm btn-light"
          onClick={() => navigate(\`/${entity.name}/\${item.id}\`)}
          title="Voir"
        >
          <i className="bi bi-eye" />
        </button>
        <button 
          className="btn btn-sm btn-light"
          onClick={() => navigate(\`/${entity.name}/\${item.id}/edit\`)}
          title="Modifier"
        >
          <i className="bi bi-pencil" />
        </button>
        <button 
          className="btn btn-sm btn-danger"
          onClick={() => handleDelete(item.id)}
          title="Supprimer"
        >
          <i className="bi bi-trash" />
        </button>
      </div>
    );
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      try {
        // TODO: Implémenter la suppression avec le contexte organisation
        console.log('Delete:', id);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  // Utiliser l'entityType avec le contexte organisation
  const entityType = currentOrg ? \`${entity.name}_org_\${currentOrg.id}\` : '${entity.name}';

  const mobileConfig = isMobile ? {
    pageSize: 20,
    columns: columns.slice(0, 2) // Afficher seulement les 2 premières colonnes sur mobile
  } : {
    pageSize: 50
  };

  return (
    <div className={styles.container}>
      <ListWithFilters
        entityType={entityType}
        title="${entity.displayName}"
        columns={columns}
        filterOptions={filterOptions}
        onRowClick={(item) => navigate(\`/${entity.name}/\${item.id}\`)}
        sort={{ field: '${entity.columns[0].field || entity.columns[0].id}', direction: 'asc' }}
        actions={
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/${entity.name}/new')}
          >
            <i className="bi bi-plus-circle me-2" />
            Nouveau
          </button>
        }
        renderActions={renderActions}
        {...mobileConfig}
      />
    </div>
  );
};

export default ${componentName};`;
};

// Template pour le CSS
const generateCSSModule = () => {
  return `.container {
  padding: 1rem;
}

.nameCell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.genre,
.type,
.fonction {
  font-size: 0.875rem;
  color: var(--text-muted, #6c757d);
}

.contactCell {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.contactCell a {
  color: var(--primary-color, #007bff);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.contactCell a:hover {
  text-decoration: underline;
}

.actionButtons {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .container {
    padding: 0.5rem;
  }
  
  .contactCell {
    flex-direction: row;
    gap: 1rem;
  }
}`;
};

// Générer les fichiers
entities.forEach(entity => {
  const componentName = entity.name.charAt(0).toUpperCase() + entity.name.slice(1) + 'List';
  const componentDir = path.join('src', 'components', entity.name);
  const componentPath = path.join(componentDir, `${componentName}.js`);
  const cssPath = path.join(componentDir, `${componentName}.module.css`);
  
  // Créer le composant
  const componentContent = generateListComponent(entity);
  console.log(`\n📝 Fichier généré : ${componentPath}`);
  console.log('-------------------------------------------');
  console.log(componentContent);
  
  // Créer le CSS
  const cssContent = generateCSSModule();
  console.log(`\n🎨 Fichier CSS : ${cssPath}`);
  console.log('-------------------------------------------');
  console.log(cssContent);
  
  console.log('\n');
});

console.log(`
✅ Migration générée pour ${entities.length} entités

📋 Prochaines étapes :
1. Copier le code généré dans les fichiers correspondants
2. Supprimer les versions desktop/mobile
3. Adapter selon les besoins spécifiques de chaque entité
4. Tester chaque liste
`); 