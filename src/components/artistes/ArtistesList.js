// src/components/artistes/ArtistesList.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ListWithFilters from '@/components/ui/ListWithFilters';
import { useOrganization } from '@/context/OrganizationContext';
import { useResponsive } from '@/hooks/common';
import styles from './ArtistesList.module.css';

/**
 * Liste unifiée des artistes utilisant ListWithFilters
 * Fonctionne en desktop et mobile avec le contexte multi-org
 */
const ArtistesList = () => {
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
          {item.genre && <div className={styles.genre}>{item.genre}</div>}
        </div>
      )
    },
    {
      id: 'genre',
      label: 'Genre',
      field: 'genre',
      sortable: true,
    },
    {
      id: 'contact',
      label: 'Contact',
      render: (item) => (
        <div className={styles.contactCell}>
          {item.email && <a href={`mailto:${item.email}`}><i className="bi bi-envelope" /> {!isMobile && item.email}</a>}
          {item.telephone && <a href={`tel:${item.telephone}`}><i className="bi bi-telephone" /> {!isMobile && item.telephone}</a>}
        </div>
      )
    }
  ];

  // Configuration des filtres
  const filterOptions = [
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
                onClick={() => navigate(`/artistes/${item.id}`)}
              >
                <i className="bi bi-eye me-2" /> Voir
              </button>
            </li>
            <li>
              <button 
                className="dropdown-item"
                onClick={() => navigate(`/artistes/${item.id}/edit`)}
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
          onClick={() => navigate(`/artistes/${item.id}`)}
          title="Voir"
        >
          <i className="bi bi-eye" />
        </button>
        <button 
          className="btn btn-sm btn-light"
          onClick={() => navigate(`/artistes/${item.id}/edit`)}
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
  const entityType = currentOrg ? `artistes_org_${currentOrg.id}` : 'artistes';

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
        title="Artistes"
        columns={columns}
        filterOptions={filterOptions}
        onRowClick={(item) => navigate(`/artistes/${item.id}`)}
        sort={{ field: 'nom', direction: 'asc' }}
        actions={
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/artistes/new')}
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

export default ArtistesList;