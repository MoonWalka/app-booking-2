import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ResponsiveList from '@/components/ui/ResponsiveList';
import { useDeleteStructure } from '@/hooks/structures';
import { formatDate } from '@/utils/formatters';
import styles from './StructuresListUnified.module.css';

/**
 * Liste des structures utilisant le nouveau composant ResponsiveList unifié
 * Remplace les versions desktop/mobile séparées
 */
const StructuresListUnified = () => {
  const navigate = useNavigate();
  const { deleteStructure } = useDeleteStructure();

  // Configuration des colonnes
  const columns = [
    {
      id: 'nom',
      label: 'Nom',
      field: 'nom',
      sortable: true,
      render: (item) => (
        <div className={styles.nameCell}>
          <strong>{item.nom || item.raisonSociale || 'Sans nom'}</strong>
          {item.type && (
            <span className={`${styles.typeBadge} ${styles[`type${item.type}`]}`}>
              {item.type}
            </span>
          )}
        </div>
      )
    },
    {
      id: 'ville',
      label: 'Ville',
      field: 'adresse.ville',
      render: (item) => item.adresse?.ville || '-'
    },
    {
      id: 'contact',
      label: 'Contact',
      field: 'contact.nom',
      render: (item) => item.contact?.nom || '-'
    },
    {
      id: 'updatedAt',
      label: 'Modifié le',
      field: 'updatedAt',
      sortable: true,
      render: (item) => formatDate(item.updatedAt)
    }
  ];

  // Configuration des filtres
  const filterOptions = [
    {
      id: 'type',
      field: 'type',
      label: 'Type',
      type: 'select',
      options: [
        { value: '', label: 'Tous les types' },
        { value: 'association', label: 'Association' },
        { value: 'entreprise', label: 'Entreprise' },
        { value: 'administration', label: 'Administration' },
        { value: 'collectivite', label: 'Collectivité' },
        { value: 'autre', label: 'Autre' }
      ]
    }
  ];

  // Navigation vers le détail
  const handleRowClick = useCallback((structure) => {
    navigate(`/structures/${structure.id}`);
  }, [navigate]);

  // Navigation vers l'ajout
  const handleAdd = useCallback(() => {
    navigate('/structures/nouveau');
  }, [navigate]);

  // Actions par ligne
  const renderActions = useCallback((structure) => {
    const handleEdit = (e) => {
      e.stopPropagation();
      navigate(`/structures/${structure.id}/edit`);
    };

    const handleDelete = async (e) => {
      e.stopPropagation();
      
      if (window.confirm(`Êtes-vous sûr de vouloir supprimer la structure "${structure.nom || structure.raisonSociale}" ?`)) {
        try {
          await deleteStructure(structure.id);
        } catch (error) {
          console.error('Erreur lors de la suppression:', error);
          alert('Impossible de supprimer cette structure. Elle est peut-être utilisée par des programmateurs.');
        }
      }
    };

    return (
      <div className={styles.actions}>
        <button
          className={`${styles.actionButton} ${styles.actionButtonEdit}`}
          onClick={handleEdit}
          title="Modifier"
        >
          <i className="bi bi-pencil"></i>
        </button>
        <button
          className={`${styles.actionButton} ${styles.actionButtonDelete}`}
          onClick={handleDelete}
          title="Supprimer"
        >
          <i className="bi bi-trash"></i>
        </button>
      </div>
    );
  }, [navigate, deleteStructure]);

  return (
    <ResponsiveList
      entityType="structures"
      title="Structures"
      columns={columns}
      filterOptions={filterOptions}
      searchPlaceholder="Rechercher par nom, ville, SIRET..."
      onRowClick={handleRowClick}
      onAdd={handleAdd}
      renderActions={renderActions}
      initialSort={{ field: 'nom', direction: 'asc' }}
      showStats={true}
      emptyMessage="Aucune structure enregistrée"
      className={styles.structuresList}
    />
  );
};

export default StructuresListUnified;