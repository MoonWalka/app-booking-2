import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useContactContrats } from '@/hooks/contacts/useContactContrats';
import ContactEntityTable from './ContactEntityTable';
import styles from './ContactDatesTable.module.css';

/**
 * Tableau des contrats associés à un contact
 */
const ContactContratsTable = ({ contactId }) => {
  const navigate = useNavigate();
  const { contrats, loading, error } = useContactContrats(contactId);

  // Fonction pour formater le statut
  const getStatusInfo = (status) => {
    const statusMap = {
      'generated': { label: 'Généré', color: '#6f42c1' },
      'sent': { label: 'Envoyé', color: '#fd7e14' },
      'signed': { label: 'Signé', color: '#28a745' },
      'cancelled': { label: 'Annulé', color: '#dc3545' }
    };
    return statusMap[status] || { label: status || 'Inconnu', color: '#6c757d' };
  };

  // Configuration des colonnes
  const columns = [
    {
      key: 'dateGeneration',
      label: 'Date génération',
      width: '15%',
      className: styles.dateCell,
      render: (contrat) => (
        <div className={styles.dateDisplay}>
          <span className={styles.dateMain}>
            {contrat.dateGeneration ? 
              (contrat.dateGeneration.toDate?.() || new Date(contrat.dateGeneration)).toLocaleDateString('fr-FR') : 
              'Non définie'
            }
          </span>
          {contrat.dateGeneration && (
            <span className={styles.dateDay}>
              {(contrat.dateGeneration.toDate?.() || new Date(contrat.dateGeneration)).toLocaleDateString('fr-FR', { weekday: 'short' })}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'concert.titre',
      label: 'Concert',
      width: '25%',
      className: styles.concertCell,
      render: (contrat) => (
        <div>
          <div className={styles.concertTitle}>
            {contrat.concert?.titre || 'Concert sans titre'}
          </div>
          {contrat.concert?.artisteNom && (
            <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
              {contrat.concert.artisteNom}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'concert.lieuNom',
      label: 'Lieu',
      width: '20%'
    },
    {
      key: 'concert.date',
      label: 'Date concert',
      width: '15%',
      render: (contrat) => 
        contrat.concert?.date ? 
          new Date(contrat.concert.date).toLocaleDateString('fr-FR') : 
          'Non définie'
    },
    {
      key: 'status',
      label: 'Statut',
      width: '15%',
      render: (contrat) => {
        const statusInfo = getStatusInfo(contrat.status);
        return (
          <span 
            className={styles.statusBadge} 
            style={{ backgroundColor: statusInfo.color + '20', color: statusInfo.color }}
          >
            {statusInfo.label}
          </span>
        );
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '10%',
      render: (contrat) => (
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            className={styles.actionBtn}
            onClick={() => navigate(`/contrats/${contrat.id}`)}
            title="Voir le contrat"
          >
            <i className="bi bi-eye"></i>
          </button>
          <button
            className={styles.actionBtn}
            onClick={() => navigate(`/concerts/${contrat.concert?.id}`)}
            title="Voir le concert"
            style={{ backgroundColor: '#28a745' }}
          >
            <i className="bi bi-calendar-event"></i>
          </button>
        </div>
      )
    }
  ];

  return (
    <ContactEntityTable
      title="Contrats"
      icon="bi bi-file-earmark-text"
      iconColor="#6f42c1"
      data={contrats}
      loading={loading}
      error={error}
      columns={columns}
      emptyMessage="Ce contact n'a pas encore de contrats générés."
      emptyIcon="bi-file-earmark-text"
      contactId={contactId}
      fullWidth={true}
      showHeader={true}
      itemsPerPage={5}
      addButtonLabel="Nouveau contrat"
    />
  );
};

export default ContactContratsTable;