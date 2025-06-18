import React from 'react';
import { useNavigate } from 'react-router-dom';
import ContactEntityTable from './ContactEntityTable';
import styles from './ContactDatesTable.module.css';

/**
 * Tableau des dates de concerts associées à un contact
 */
const ContactDatesTable = ({ contactId, concerts = [], onAddClick = null }) => {
  const navigate = useNavigate();

  // Fonction pour supprimer un concert
  const handleDeleteConcert = (concert) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le concert "${concert.titre || 'sans titre'}" ?`)) {
      // TODO: Implémenter la suppression via un service
      console.log('Suppression du concert:', concert.id);
      // Ici il faudrait appeler un service de suppression
    }
  };

  // Version simplifiée des boutons d'actions
  // Pour une version complète avec vérification des statuts,
  // il faudrait charger les données de formulaires/contrats/factures
  // spécifiquement pour ces concerts

  // Configuration des colonnes
  const columns = [
    {
      key: 'artisteNom',
      label: 'Artiste',
      width: '13%'
    },
    {
      key: 'formule',
      label: 'Projet',
      width: '12%',
      className: styles.concertCell,
      render: (concert) => (
        <div className={styles.concertTitle}>
          {concert.formule || ''}
        </div>
      )
    },
    {
      key: 'lieuNom',
      label: 'Lieu',
      width: '13%'
    },
    {
      key: 'lieuVille',
      label: 'Ville',
      width: '10%'
    },
    {
      key: 'statut',
      label: 'Prise d\'option',
      width: '10%',
      render: (concert) => (
        <span className={`${styles.statusBadge} ${styles[`status${concert.statut || 'contact'}`]}`}>
          {concert.statut || 'Contact'}
        </span>
      )
    },
    {
      key: 'date',
      label: 'Début',
      width: '9%',
      className: styles.dateCell,
      render: (concert) => (
        <div className={styles.dateDisplay}>
          <span className={styles.dateMain}>
            {concert.date ? new Date(concert.date).toLocaleDateString('fr-FR') : 'Non définie'}
          </span>
        </div>
      )
    },
    {
      key: 'dateFin',
      label: 'Fin',
      width: '9%',
      className: styles.dateCell,
      render: (concert) => (
        <div className={styles.dateDisplay}>
          <span className={styles.dateMain}>
            {concert.dateFin ? new Date(concert.dateFin).toLocaleDateString('fr-FR') : '—'}
          </span>
        </div>
      )
    },
    {
      key: 'montant',
      label: 'Montant',
      width: '9%',
      render: (concert) => (
        <span style={{ fontWeight: '600' }}>
          {concert.montant ? `${concert.montant.toLocaleString('fr-FR')} €` : '—'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '15%',
      render: (concert) => {
        return (
          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
            {/* Bouton Formulaire */}
            <button
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                backgroundColor: '#007bff',
                color: 'white',
                fontSize: '12px'
              }}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/concerts/${concert.id}/form`);
              }}
              title="Gérer le formulaire"
            >
              <i className="bi bi-envelope"></i>
            </button>

            {/* Bouton Contrat */}
            <button
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                backgroundColor: '#6f42c1',
                color: 'white',
                fontSize: '12px'
              }}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/contrats/generate/${concert.id}`);
              }}
              title="Gérer le contrat"
            >
              <i className="bi bi-file-earmark-text"></i>
            </button>

            {/* Bouton Facture */}
            <button
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                backgroundColor: '#28a745',
                color: 'white',
                fontSize: '12px'
              }}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/factures/generate/${concert.id}`);
              }}
              title="Gérer la facture"
            >
              <i className="bi bi-receipt"></i>
            </button>

            {/* Bouton Modifier */}
            <button
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                backgroundColor: '#fd7e14',
                color: 'white',
                fontSize: '12px'
              }}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/concerts/${concert.id}/edit`);
              }}
              title="Modifier le concert"
            >
              <i className="bi bi-pencil-square"></i>
            </button>

            {/* Bouton Supprimer */}
            <button
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                backgroundColor: '#dc3545',
                color: 'white',
                fontSize: '12px'
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteConcert(concert);
              }}
              title="Supprimer le concert"
            >
              <i className="bi bi-trash"></i>
            </button>
          </div>
        );
      }
    }
  ];

  return (
    <ContactEntityTable
      title="Dates de concerts"
      icon="bi bi-calendar-event"
      iconColor="#dc3545"
      data={concerts}
      columns={columns}
      emptyMessage="Ce contact n'a pas encore de concerts associés."
      emptyIcon="bi-calendar-x"
      contactId={contactId}
      fullWidth={true}
      showHeader={true}
      itemsPerPage={5}
      addButtonLabel="Nouvelle date"
      onAddClick={onAddClick}
    />
  );
};

export default ContactDatesTable;