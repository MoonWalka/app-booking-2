import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Dropdown } from 'react-bootstrap';
import { useContactFactures } from '@/hooks/contacts/useContactFactures';
import ContactEntityTable from './ContactEntityTable';
import Badge from '@/components/ui/Badge';
import styles from './ContactDatesTable.module.css';

/**
 * Tableau des factures associées à un contact ou une structure
 * Colonnes selon spécifications exactes
 */
const ContactFacturesTable = ({ contactId, entityType = 'contact' }) => {
  const navigate = useNavigate();
  const { factures, loading, error } = useContactFactures(contactId, entityType);
  const [selectedRows, setSelectedRows] = useState(new Set());

  // Fonction pour formater le statut
  const getStatusInfo = (status) => {
    const statusMap = {
      'draft': { label: 'Brouillon', color: '#6c757d' },
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
    if (!montant) return '0,00';
    return parseFloat(montant).toLocaleString('fr-FR', { minimumFractionDigits: 2 });
  };

  // Fonction pour formater une date
  const formatDate = (dateValue) => {
    if (!dateValue) return '—';
    try {
      const date = dateValue.seconds ? new Date(dateValue.seconds * 1000) : 
                   dateValue.toDate ? dateValue.toDate() : new Date(dateValue);
      return date.toLocaleDateString('fr-FR');
    } catch (error) {
      return '—';
    }
  };

  // Actions sur les factures
  const handleToggleEnvoye = (factureId) => {
    // TODO: Implémenter la logique pour marquer comme envoyée
    console.log('Marquer comme envoyée:', factureId);
  };

  const handleTogglePaye = (factureId) => {
    // TODO: Implémenter la logique pour marquer comme payée
    console.log('Marquer comme payée:', factureId);
  };

  const handleDelete = (factureId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
      // TODO: Implémenter la suppression
      console.log('Supprimer:', factureId);
    }
  };

  const handlePDF = (factureId) => {
    // TODO: Implémenter la génération/téléchargement PDF
    console.log('PDF:', factureId);
  };

  // Configuration des colonnes selon spécifications exactes
  const columns = [
    // 1. REF
    {
      label: 'Ref',
      key: 'numeroFacture',
      sortable: true,
      render: (facture) => (
        <span>{facture.numeroFacture || facture.reference || 'En attente'}</span>
      )
    },
    
    // 2. NATURE
    {
      label: 'Nature',
      key: 'nature',
      sortable: true,
      render: (facture) => (
        <span style={{ textTransform: 'capitalize' }}>
          {facture.type || facture.nature || 'facture'}
        </span>
      )
    },
    
    // 3. ÉMETTEUR
    {
      label: 'Émetteur',
      key: 'emetteur',
      sortable: true,
      render: (facture) => (
        <span>{facture.emetteurNom || facture.organisationNom || '—'}</span>
      )
    },
    
    // 4. DESTINATAIRE
    {
      label: 'Destinataire',
      key: 'destinataire',
      sortable: true,
      render: (facture) => (
        <span>{facture.structureNom || '—'}</span>
      )
    },
    
    // 5. PROJET
    {
      label: 'Projet',
      key: 'projet',
      sortable: true,
      render: (facture) => (
        <span>{facture.concert?.artisteNom || facture.artisteNom || facture.projet || '—'}</span>
      )
    },
    
    // 6. DATE (représentation)
    {
      label: 'Date',
      key: 'dateRepresentation',
      sortable: true,
      render: (facture) => (
        <span>{formatDate(facture.concert?.date || facture.dateEvenement)}</span>
      )
    },
    
    // 7. FACTURATION
    {
      label: 'Facturation',
      key: 'dateFacture',
      sortable: true,
      render: (facture) => (
        <span>{formatDate(facture.dateFacture)}</span>
      )
    },
    
    // 8. ÉCHÉANCE
    {
      label: 'Échéance',
      key: 'echeance',
      sortable: true,
      render: (facture) => (
        <span>{formatDate(facture.dateEcheance || facture.echeance)}</span>
      )
    },
    
    // 9. TTC
    {
      label: 'TTC',
      key: 'montantTTC',
      sortable: true,
      render: (facture) => (
        <span style={{ fontWeight: '600' }}>
          {formatMontant(facture.montantTTC || 0)}
        </span>
      )
    },
    
    // 10. DEVISE
    {
      label: 'Devise',
      key: 'devise',
      sortable: true,
      render: (facture) => (
        <span>{facture.devise || 'EUR'}</span>
      )
    },
    
    // 11. ÉTAT
    {
      label: 'État',
      key: 'etat',
      sortable: true,
      render: (facture) => {
        const statusInfo = getStatusInfo(facture.status);
        return (
          <span 
            className={styles.statusBadge} 
            style={{ 
              backgroundColor: statusInfo.color + '20', 
              color: statusInfo.color,
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '0.85rem'
            }}
          >
            {statusInfo.label}
          </span>
        );
      }
    },
    
    // 12. ENVOYÉE
    {
      label: 'Envoyée',
      key: 'envoye',
      sortable: true,
      render: (facture) => (
        facture.status === 'sent' || facture.envoye ? (
          <span style={{ fontSize: '1.2rem' }}>✔️</span>
        ) : (
          <Dropdown>
            <Dropdown.Toggle 
              variant="link" 
              id={`dropdown-envoye-${facture.id}`}
              className={styles.dropdownToggle}
              style={{ padding: 0, border: 'none', background: 'none' }}
            >
              <span style={{ fontSize: '1.2rem', cursor: 'pointer' }}>❌</span>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item 
                onClick={() => handleToggleEnvoye(facture.id)}
                className={styles.dropdownItem}
              >
                <i className="bi bi-check-circle text-success me-2"></i>
                Marquer comme envoyée
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        )
      )
    },
    
    // 13. PAYÉ
    {
      label: 'Payé',
      key: 'paye',
      sortable: true,
      render: (facture) => (
        facture.status === 'paid' || facture.paye ? (
          <span style={{ fontSize: '1.2rem' }}>✔️</span>
        ) : (
          <Dropdown>
            <Dropdown.Toggle 
              variant="link" 
              id={`dropdown-paye-${facture.id}`}
              className={styles.dropdownToggle}
              style={{ padding: 0, border: 'none', background: 'none' }}
            >
              <span style={{ fontSize: '1.2rem', cursor: 'pointer' }}>❌</span>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item 
                onClick={() => handleTogglePaye(facture.id)}
                className={styles.dropdownItem}
              >
                <i className="bi bi-check-circle text-success me-2"></i>
                Marquer comme payée
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        )
      )
    },
    
    // 14. DATE PAIEMENT
    {
      label: 'Date paiement',
      key: 'datePaiement',
      sortable: true,
      render: (facture) => (
        <span>{formatDate(facture.datePaiement) || '—'}</span>
      )
    },
    
    // 15. EXPORT COMPTA
    {
      label: 'Export compta',
      key: 'exportCompta',
      sortable: false,
      render: (facture) => (
        <i 
          className="bi bi-file-earmark-spreadsheet" 
          style={{ 
            color: facture.exportCompta ? '#28a745' : '#6c757d',
            fontSize: '1.2rem'
          }}
          title={facture.exportCompta ? 'Exporté' : 'Non exporté'}
        />
      )
    },
    
    // 16. MONTANT PAYÉ
    {
      label: 'Montant payé',
      key: 'montantPaye',
      sortable: true,
      render: (facture) => (
        <span>{formatMontant(facture.montantPaye || 0)}</span>
      )
    },
    
    // 17. RESTE DÛ
    {
      label: 'Reste dû',
      key: 'resteDu',
      sortable: true,
      render: (facture) => {
        const resteDu = (facture.montantTTC || 0) - (facture.montantPaye || 0);
        return (
          <span style={{ 
            fontWeight: '600',
            color: resteDu > 0 ? '#dc3545' : '#28a745'
          }}>
            {formatMontant(resteDu)}
          </span>
        );
      }
    },
    
    // 18. ACTIONS
    {
      label: 'Actions',
      key: 'actions',
      sortable: false,
      render: (facture) => (
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            className={styles.actionBtn}
            onClick={() => navigate(`/factures/${facture.id}/edit`)}
            title="Modifier"
            style={{ padding: '4px 8px', fontSize: '0.85rem' }}
          >
            M
          </button>
          <button
            className={styles.actionBtn}
            onClick={() => handleDelete(facture.id)}
            title="Supprimer"
            style={{ padding: '4px 8px', color: '#dc3545' }}
          >
            <i className="bi bi-trash"></i>
          </button>
          <button
            className={styles.actionBtn}
            onClick={() => handlePDF(facture.id)}
            title="Télécharger PDF"
            style={{ padding: '4px 8px' }}
          >
            <i className="bi bi-file-pdf"></i>
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
      itemsPerPage={20}
      addButtonLabel="Nouvelle facture"
    />
  );
};

export default ContactFacturesTable;