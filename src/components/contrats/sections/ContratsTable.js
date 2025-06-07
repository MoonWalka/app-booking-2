import React from 'react';
import { useNavigate } from 'react-router-dom';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import styles from './ContratsTable.module.css';

/**
 * Table component to display contracts list
 * Harmonisé avec la maquette TourCraft
 */
const ContratsTable = ({ contrats }) => {
  const navigate = useNavigate();

  const formatDate = (dateValue) => {
    if (!dateValue) return '-';
    
    try {
      if (dateValue.seconds) {
        return new Date(dateValue.seconds * 1000).toLocaleDateString('fr-FR');
      }
      
      return new Date(dateValue).toLocaleDateString('fr-FR');
    } catch (error) {
      console.error('Erreur de formatage de date:', error);
      return '-';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'signed':
        return <Badge variant="green">Signé</Badge>;
      case 'sent':
        return <Badge variant="blue">Envoyé</Badge>;
      case 'generated':
        return <Badge variant="yellow">Généré</Badge>;
      default:
        return <Badge variant="gray">Inconnu</Badge>;
    }
  };

  // Colonnes pour le composant Table commun
  const columns = [
    {
      label: 'Date',
      key: 'dateGeneration',
      sortable: true,
      render: (contrat) => (
        <span className={styles.dateText}>
          {formatDate(contrat.dateGeneration)}
        </span>
      )
    },
    {
      label: 'Concert',
      key: 'concert.titre',
      sortable: true,
      render: (contrat) => (
        <div className={styles.concertInfo}>
          <div className={styles.concertTitle}>
            {contrat.concert?.titre || 'N/A'}
          </div>
          {contrat.concert?.artisteNom && (
            <div className={styles.artistName}>
              {contrat.concert.artisteNom}
            </div>
          )}
        </div>
      )
    },
    {
      label: 'Lieu',
      key: 'concert.lieuNom',
      sortable: true,
      render: (contrat) => (
        <div className={styles.locationInfo}>
          <i className="bi bi-geo-alt me-2"></i>
          {contrat.concert?.lieuNom || 'N/A'}
        </div>
      )
    },
    {
      label: 'Contact',
      key: 'concert.programmateurNom',
      sortable: true,
      render: (contrat) => (
        <div className={styles.programmateurInfo}>
          <i className="bi bi-person me-2"></i>
          {contrat.concert?.contactNom || contrat.concert?.programmateurNom || 'N/A'}
        </div>
      )
    },
    {
      label: 'Statut',
      key: 'status',
      sortable: true,
      render: (contrat) => getStatusBadge(contrat.status)
    }
  ];

  // Actions par ligne
  const renderActions = (contrat) => (
    <div className={styles.actionButtons} onClick={e => e.stopPropagation()}>
      <button 
        className={styles.actionButton}
        onClick={() => navigate(`/contrats/${contrat.id}`)} 
        title="Voir le contrat"
      >
        <i className="bi bi-eye"></i>
      </button>
      <button 
        className={styles.actionButton}
        onClick={() => navigate(`/contrats/${contrat.id}?preview=web`)} 
        title="Aperçu web"
      >
        <i className="bi bi-globe"></i>
      </button>
      <button 
        className={styles.actionButton}
        onClick={() => navigate(`/contrats/${contrat.id}/edit`)} 
        title="Éditer le contrat"
      >
        <i className="bi bi-pencil"></i>
      </button>
      <button 
        className={styles.actionButton}
        onClick={() => window.open(`/contrats/${contrat.id}/download`, '_blank')} 
        title="Télécharger"
      >
        <i className="bi bi-download"></i>
      </button>
    </div>
  );

  // Gestion du clic sur une ligne
  const handleRowClick = (contratId) => {
    navigate(`/contrats/${contratId}`);
  };

  return (
    <div className={styles.tableContainer}>
      <Table
        columns={columns}
        data={contrats}
        renderActions={renderActions}
        onRowClick={handleRowClick}
      />
    </div>
  );
};

export default ContratsTable; 