// src/components/programmateurs/ProgrammateursList.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ListWithFilters from '@/components/ui/ListWithFilters';
import { useOrganization } from '@/context/OrganizationContext';
import { getOrgCollection } from '@/services/firebase-service';
import { useResponsive } from '@/hooks/common';
import Alert from '@/components/ui/Alert';
import styles from './ProgrammateursList.module.css';

/**
 * Liste unifiée des programmateurs utilisant ListWithFilters
 * Fonctionne en desktop et mobile avec les hooks multi-org
 */
const ProgrammateursList = () => {
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
          <strong>
            {item.nom} {item.prenom}
          </strong>
          {item.fonction && (
            <div className={styles.fonction}>{item.fonction}</div>
          )}
        </div>
      )
    },
    {
      id: 'structure',
      label: 'Structure',
      field: 'structure.nom',
      sortable: true,
      render: (item) => (
        item.structure?.nom || <span className="text-muted">Non spécifiée</span>
      )
    },
    {
      id: 'contact',
      label: isMobile ? 'Contact' : 'Email / Téléphone',
      sortable: false,
      render: (item) => (
        <div className={styles.contactCell}>
          {item.email && (
            <a href={`mailto:${item.email}`} className={styles.contactLink}>
              <i className="bi bi-envelope" /> {!isMobile && item.email}
            </a>
          )}
          {item.telephone && (
            <a href={`tel:${item.telephone}`} className={styles.contactLink}>
              <i className="bi bi-telephone" /> {!isMobile && item.telephone}
            </a>
          )}
          {!item.email && !item.telephone && (
            <span className="text-muted">Non renseigné</span>
          )}
        </div>
      )
    }
  ];

  // Configuration des filtres
  const filterOptions = [
    {
      id: 'actif',
      label: 'Statut',
      field: 'actif',
      type: 'select',
      options: [
        { value: 'true', label: 'Actifs' },
        { value: 'false', label: 'Inactifs' }
      ]
    },
    {
      id: 'fonction',
      label: 'Fonction',
      field: 'fonction',
      type: 'text',
      placeholder: 'Ex: Directeur, Manager...'
    },
    {
      id: 'hasEmail',
      label: 'Email',
      field: 'email',
      type: 'select',
      options: [
        { value: 'exists', label: 'Avec email' },
        { value: 'empty', label: 'Sans email' }
      ]
    }
  ];

  // Actions avec menu dropdown pour mobile
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
                onClick={() => navigate(`/programmateurs/${item.id}`)}
              >
                <i className="bi bi-eye me-2" /> Voir
              </button>
            </li>
            <li>
              <button 
                className="dropdown-item"
                onClick={() => navigate(`/programmateurs/${item.id}/edit`)}
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

    // Actions desktop
    return (
      <div className={styles.actionButtons}>
        <button 
          className="btn btn-sm btn-light"
          onClick={() => navigate(`/programmateurs/${item.id}`)}
          title="Voir les détails"
        >
          <i className="bi bi-eye" />
        </button>
        <button 
          className="btn btn-sm btn-light"
          onClick={() => navigate(`/programmateurs/${item.id}/edit`)}
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
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce programmateur ?')) {
      try {
        // TODO: Implémenter la suppression avec le contexte organisation
        console.log('Delete:', id);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  // Configuration pour mobile
  const mobileConfig = isMobile ? {
    pageSize: 20,
    columns: columns.filter(col => ['nom', 'contact'].includes(col.id))
  } : {
    pageSize: 50
  };

  // Utiliser l'entityType avec le contexte organisation
  const entityType = currentOrg ? `programmateurs_org_${currentOrg.id}` : 'programmateurs';

  return (
    <div className={styles.container}>
      <ListWithFilters
        entityType={entityType}
        title="Programmateurs"
        columns={columns}
        filterOptions={filterOptions}
        onRowClick={(item) => navigate(`/programmateurs/${item.id}`)}
        sort={{ field: 'nom', direction: 'asc' }}
        actions={
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/programmateurs/new')}
          >
            <i className="bi bi-plus-circle me-2" />
            Nouveau programmateur
          </button>
        }
        renderActions={renderActions}
        {...mobileConfig}
      />
    </div>
  );
};

export default ProgrammateursList;
