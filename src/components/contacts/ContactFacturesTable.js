import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useContactFactures } from '@/hooks/contacts/useContactFactures';
import ContactEntityTable from './ContactEntityTable';
import styles from './ContactDatesTable.module.css';

/**
 * Tableau des factures associées à un contact
 */
const ContactFacturesTable = ({ contactId }) => {
  const navigate = useNavigate();
  const { factures, loading, error } = useContactFactures(contactId);

  // Fonction pour formater le statut
  const getStatusInfo = (status) => {
    const statusMap = {
      'generated': { label: 'Générée', color: '#6f42c1' },
      'sent': { label: 'Envoyée', color: '#fd7e14' },
      'paid': { label: 'Payée', color: '#28a745' },
      'cancelled': { label: 'Annulée', color: '#dc3545' },
      'overdue': { label: 'En retard', color: '#dc3545' }
    };
    return statusMap[status] || { label: status || 'Inconnu', color: '#6c757d' };
  };

  // Fonction pour formater le montant
  const formatMontant = (montant) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(montant || 0);
  };

  // Fonction pour formater le type de facture
  const getTypeInfo = (type) => {
    const typeMap = {
      'service': { label: 'Service', color: '#007bff' },
      'acompte': { label: 'Acompte', color: '#17a2b8' },
      'avoir': { label: 'Avoir', color: '#6c757d' },
      'proforma': { label: 'Pro forma', color: '#ffc107' }
    };
    return typeMap[type] || { label: type || 'Service', color: '#007bff' };
  };

  // Configuration des colonnes
  const columns = [
    {
      key: 'numeroFacture',
      label: 'N° Facture',
      width: '15%',
      className: styles.concertCell,
      render: (facture) => (
        <div className={styles.concertTitle}>
          {facture.numeroFacture || facture.id}
        </div>
      )
    },
    {
      key: 'dateFacture',
      label: 'Date',
      width: '15%',
      className: styles.dateCell,
      render: (facture) => (
        <div className={styles.dateDisplay}>
          <span className={styles.dateMain}>
            {facture.dateFacture ? 
              (facture.dateFacture.toDate?.() || new Date(facture.dateFacture)).toLocaleDateString('fr-FR') : 
              'Non définie'
            }
          </span>
          {facture.dateEcheance && (
            <span className={styles.dateDay}>
              Échéance: {(facture.dateEcheance.toDate?.() || new Date(facture.dateEcheance)).toLocaleDateString('fr-FR')}
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
      render: (facture) => (
        <div>
          <div className={styles.concertTitle}>
            {facture.concert?.titre || 'Concert sans titre'}
          </div>
          {facture.concert?.date && (
            <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
              {new Date(facture.concert.date).toLocaleDateString('fr-FR')}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'typeFacture',
      label: 'Type',
      width: '10%',
      render: (facture) => {
        const typeInfo = getTypeInfo(facture.typeFacture);
        return (
          <span 
            className={styles.statusBadge} 
            style={{ backgroundColor: typeInfo.color + '20', color: typeInfo.color }}
          >
            {typeInfo.label}
          </span>
        );
      }
    },
    {
      key: 'montantTTC',
      label: 'Montant TTC',
      width: '15%',
      render: (facture) => (
        <span style={{ fontWeight: '600', color: '#28a745' }}>
          {formatMontant(facture.montantTTC)}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Statut',
      width: '10%',
      render: (facture) => {
        const statusInfo = getStatusInfo(facture.status);
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
      render: (facture) => (
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            className={styles.actionBtn}
            onClick={() => navigate(`/factures/${facture.id}`)}
            title="Voir la facture"
          >
            <i className="bi bi-eye"></i>
          </button>
          <button
            className={styles.actionBtn}
            onClick={() => navigate(`/concerts/${facture.concert?.id}`)}
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
      title="Factures"
      icon="bi bi-receipt"
      iconColor="#ffc107"
      data={factures}
      loading={loading}
      error={error}
      columns={columns}
      emptyMessage="Ce contact n'a pas encore de factures générées."
      emptyIcon="bi-receipt"
      contactId={contactId}
      fullWidth={true}
      showHeader={true}
      itemsPerPage={5}
      addButtonLabel="Nouvelle facture"
    />
  );
};

export default ContactFacturesTable;