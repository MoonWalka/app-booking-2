// src/components/concerts/ConcertsList.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ListWithFilters from '@/components/ui/ListWithFilters';
import { useOrganization } from '@/context/OrganizationContext';
import { useResponsive } from '@/hooks/common';
import styles from './ConcertsList.module.css';

/**
 * Liste unifiée des concerts utilisant ListWithFilters
 * Fonctionne en desktop et mobile avec le contexte multi-org
 */
const ConcertsList = () => {
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  const { currentOrg } = useOrganization();

  // Configuration des colonnes responsive
  const columns = [
    {
      id: 'date',
      label: 'Date',
      field: 'date',
      sortable: true,
      render: (item) => {
        const date = item.date?.toDate ? item.date.toDate() : new Date(item.date);
        return date.toLocaleDateString('fr-FR');
      }
    },
    {
      id: 'artiste',
      label: 'Artiste',
      field: 'artiste.nom',
      sortable: true,
      render: (item) => item.artiste?.nom || 'Non défini'
    },
    {
      id: 'lieu',
      label: 'Lieu',
      field: 'lieu.nom',
      sortable: true,
      render: (item) => item.lieu?.nom || 'Non défini'
    },
    {
      id: 'statut',
      label: 'Statut',
      field: 'statut',
      render: (item) => (
        <span className={`badge bg-${item.statut === 'confirme' ? 'success' : 'warning'}`}>
          {item.statut || 'En attente'}
        </span>
      )
    }
  ];

  // Configuration des filtres
  const filterOptions = [
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
                onClick={() => navigate(`/concerts/${item.id}`)}
              >
                <i className="bi bi-eye me-2" /> Voir
              </button>
            </li>
            <li>
              <button 
                className="dropdown-item"
                onClick={() => navigate(`/concerts/${item.id}/edit`)}
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
          onClick={() => navigate(`/concerts/${item.id}`)}
          title="Voir"
        >
          <i className="bi bi-eye" />
        </button>
        <button 
          className="btn btn-sm btn-light"
          onClick={() => navigate(`/concerts/${item.id}/edit`)}
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
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce concert ?')) {
      try {
        // TODO: Implémenter la suppression avec le contexte organisation
        console.log('Delete:', id);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  // Utiliser l'entityType avec le contexte organisation
  const entityType = currentOrg ? `concerts_org_${currentOrg.id}` : 'concerts';

  const mobileConfig = isMobile ? {
    pageSize: 20,
    columns: columns.slice(0, 3) // Date, Artiste et Lieu sur mobile
  } : {
    pageSize: 50
  };

  return (
    <div className={styles.container}>
      <ListWithFilters
        entityType={entityType}
        title="Concerts"
        columns={columns}
        filterOptions={filterOptions}
        onRowClick={(item) => navigate(`/concerts/${item.id}`)}
        sort={{ field: 'date', direction: 'desc' }}
        actions={
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/concerts/new')}
          >
            <i className="bi bi-plus-circle me-2" />
            Nouveau concert
          </button>
        }
        renderActions={renderActions}
        {...mobileConfig}
      />
    </div>
  );
};

export default ConcertsList;
