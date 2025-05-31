// src/components/lieux/LieuxList.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ListWithFilters from '@/components/ui/ListWithFilters';
import { useOrganization } from '@/context/OrganizationContext';
import { useResponsive } from '@/hooks/common';
import styles from './LieuxList.module.css';

/**
 * Liste unifiée des lieux utilisant ListWithFilters
 * Fonctionne en desktop et mobile avec le contexte multi-org
 */
const LieuxList = () => {
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  const { currentOrg } = useOrganization();

  // Configuration des colonnes responsive
  const columns = [
    {
      id: 'nom',
      label: 'Nom',
      field: 'nom',
      sortable: true,
      render: (item) => (
        <div className={styles.nameCell}>
          <strong>{item.nom}</strong>
          {item.type && <div className={styles.type}>{item.type}</div>}
        </div>
      )
    },
    {
      id: 'ville',
      label: 'Ville',
      field: 'ville',
      sortable: true,
    },
    {
      id: 'capacite',
      label: 'Capacité',
      field: 'capacite',
      sortable: true,
      render: (item) => item.capacite ? `${item.capacite} places` : '-'
    }
  ];

  // Configuration des filtres
  const filterOptions = [
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
                onClick={() => navigate(`/lieux/${item.id}`)}
              >
                <i className="bi bi-eye me-2" /> Voir
              </button>
            </li>
            <li>
              <button 
                className="dropdown-item"
                onClick={() => navigate(`/lieux/${item.id}/edit`)}
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
          onClick={() => navigate(`/lieux/${item.id}`)}
          title="Voir"
        >
          <i className="bi bi-eye" />
        </button>
        <button 
          className="btn btn-sm btn-light"
          onClick={() => navigate(`/lieux/${item.id}/edit`)}
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
  const entityType = currentOrg ? `lieux_org_${currentOrg.id}` : 'lieux';

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
        title="Lieux"
        columns={columns}
        filterOptions={filterOptions}
        onRowClick={(item) => navigate(`/lieux/${item.id}`)}
        sort={{ field: 'nom', direction: 'asc' }}
        actions={
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/lieux/new')}
          >
            <i className="bi bi-plus-circle me-2" />
            Nouveau lieu
          </button>
        }
        renderActions={renderActions}
        {...mobileConfig}
      />
    </div>
  );
};

export default LieuxList;
