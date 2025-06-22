import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTabs } from '@/context/TabsContext';
import ContactEntityTable from './ContactEntityTable';
import tableStyles from '@/shared/tableConfigs/datesTableStyles.module.css';

/**
 * Tableau des dates de concerts associées à un contact
 */
const ContactDatesTable = ({ contactId, concerts = [], onAddClick = null }) => {
  const navigate = useNavigate();
  const { openTab, openPreContratTab, openContratTab } = useTabs();

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

  // Fonction pour ouvrir la page de confirmation
  const openConfirmationPage = (item) => {
    openTab({
      id: `confirmation-${item.id}`,
      title: `Confirmation - ${item.artisteNom || item.titre || 'Concert'}`,
      path: `/confirmation?concertId=${item.id}`,
      component: 'ConfirmationPage',
      params: { concertId: item.id },
      icon: 'bi-check-circle'
    });
  };

  // Configuration des colonnes - IDENTIQUE au tableau de bord
  const columns = [
    {
      label: 'Niveau',
      key: 'niveau',
      render: (item) => {
        const niveau = item.niveau || 1;
        return (
          <div className={tableStyles.niveauCell}>
            <div className={tableStyles.niveauIcon}>
              {Array.from({ length: 3 }, (_, index) => (
                <div 
                  key={index}
                  className={`${tableStyles.niveauBar} ${index < niveau ? tableStyles.niveauBarActive : tableStyles.niveauBarInactive}`}
                ></div>
              ))}
            </div>
          </div>
        );
      }
    },
    {
      label: 'Artiste',
      key: 'artisteNom',
      render: (item) => (
        <span className={tableStyles.artisteCell}>
          {item.artisteNom || 'Non spécifié'}
        </span>
      )
    },
    {
      label: 'Projet',
      key: 'projet',
      render: (item) => (
        <span className={tableStyles.projetCell}>
          {item.formule || item.projet || '—'}
        </span>
      )
    },
    {
      label: 'Lieu',
      key: 'lieuNom',
      render: (item) => (
        <div className={tableStyles.lieuCell}>
          <div className={tableStyles.lieuNom}>
            {item.lieuNom || item.lieu?.nom || 'Non spécifié'}
          </div>
          {(item.lieuVille || item.lieu?.ville) && (
            <div className={tableStyles.lieuVille}>
              {item.lieuVille || item.lieu?.ville}
            </div>
          )}
        </div>
      )
    },
    {
      label: 'Prise d\'option',
      key: 'priseOption',
      render: (item) => {
        if (!item.priseOption && !item.datePriseOption) return '—';
        
        const datePriseOption = item.datePriseOption || item.priseOption;
        if (!datePriseOption) return '—';
        
        const date = datePriseOption.toDate ? datePriseOption.toDate() : new Date(datePriseOption);
        return (
          <span className={tableStyles.priseOptionCell}>
            {date.toLocaleDateString('fr-FR')}
          </span>
        );
      }
    },
    {
      label: 'Contrat',
      key: 'contrat',
      render: (item) => {
        const typeContrat = item.typeContrat || item.contratType || 'Aucun';
        const getContratBadge = (type) => {
          switch (type.toLowerCase()) {
            case 'standard':
              return { color: '#007bff', label: 'Standard' };
            case 'premium':
              return { color: '#28a745', label: 'Premium' };
            case 'basic':
              return { color: '#ffc107', label: 'Basic' };
            case 'custom':
            case 'personnalisé':
              return { color: '#6f42c1', label: 'Personnalisé' };
            case 'aucun':
            default:
              return { color: '#6c757d', label: 'Aucun' };
          }
        };
        
        const badgeInfo = getContratBadge(typeContrat);
        
        return (
          <div className={tableStyles.contratTypeCell}>
            <span 
              className={tableStyles.contratTypeBadge}
              style={{ backgroundColor: badgeInfo.color }}
            >
              {badgeInfo.label}
            </span>
          </div>
        );
      }
    },
    {
      label: 'Début',
      key: 'date',
      render: (item) => {
        if (!item.date) return '—';
        const date = item.date.toDate ? item.date.toDate() : new Date(item.date);
        return (
          <span className={tableStyles.dateCell}>
            {date.toLocaleDateString('fr-FR')}
          </span>
        );
      }
    },
    {
      label: 'Fin',
      key: 'dateFin',
      render: (item) => {
        if (!item.dateFin) return '—';
        const date = item.dateFin.toDate ? item.dateFin.toDate() : new Date(item.dateFin);
        return (
          <span className={tableStyles.dateCell}>
            {date.toLocaleDateString('fr-FR')}
          </span>
        );
      }
    },
    {
      label: 'Montant',
      key: 'montant',
      render: (item) => (
        <div className={tableStyles.montantCell}>
          {item.montant ? (
            <span className={tableStyles.montant}>
              {item.montant.toLocaleString('fr-FR')} €
            </span>
          ) : (
            <span className={tableStyles.noMontant}>—</span>
          )}
        </div>
      )
    },
    {
      label: 'Nb. de dates',
      key: 'nbDates',
      render: (item) => (
        <span className={tableStyles.nbDatesCell}>
          {item.nbDates || '1'}
        </span>
      )
    },
    {
      label: 'Devis',
      key: 'devis',
      render: (item) => (
        <div className={tableStyles.devisCell}>
          {item.devisId ? (
            <i 
              className="bi bi-file-earmark-check-fill text-success" 
              title="Voir le devis"
              style={{ cursor: 'pointer' }}
              onClick={() => openTab({
                id: `devis-${item.devisId}`,
                title: `Devis - ${item.artisteNom || item.titre || 'Concert'}`,
                path: `/devis/${item.devisId}`,
                component: 'DevisPage',
                params: { devisId: item.devisId },
                icon: 'bi-file-earmark-check'
              })}
            ></i>
          ) : (
            <i 
              className="bi bi-file-earmark text-muted" 
              title="Créer un devis"
              style={{ cursor: 'pointer' }}
              onClick={() => openTab({
                id: `devis-nouveau-${item.id}`,
                title: `Nouveau devis - ${item.artisteNom || item.titre || 'Concert'}`,
                path: `/devis/nouveau?concertId=${item.id}&structureId=${item.structureId}`,
                component: 'DevisPage',
                params: { concertId: item.id, structureId: item.structureId },
                icon: 'bi-file-earmark-plus'
              })}
            ></i>
          )}
        </div>
      )
    },
    {
      label: 'Pré contrat',
      key: 'preContrat',
      render: (item) => (
        <div className={tableStyles.preContratCell}>
          {item.preContratId ? (
            <i 
              className="bi bi-file-earmark-text-fill text-warning" 
              title="Pré-contrat existant"
              style={{ cursor: 'pointer' }}
              onClick={() => openPreContratTab(item.id, item.artiste || item.artisteNom || 'Concert')}
            ></i>
          ) : (
            <i 
              className="bi bi-file-earmark-text text-muted" 
              title="Créer un pré-contrat"
              style={{ cursor: 'pointer' }}
              onClick={() => openPreContratTab(item.id, item.artiste || item.artisteNom || 'Concert')}
            ></i>
          )}
        </div>
      )
    },
    {
      label: 'Confirmation',
      key: 'confirmation',
      render: (item) => (
        <div 
          className={`${tableStyles.confirmationCell} ${tableStyles.clickable}`}
          onClick={() => openConfirmationPage(item)}
          title="Cliquer pour gérer la confirmation"
        >
          {item.confirmation || item.statut === 'confirme' ? (
            <i className="bi bi-check-circle-fill text-success"></i>
          ) : (
            <i className="bi bi-clock text-warning"></i>
          )}
        </div>
      )
    },
    {
      label: 'Contrat',
      key: 'contratFinal',
      render: (item) => {
        // Déterminer l'état du contrat basé sur contratStatut
        const contratStatut = item.contratStatut;
        const hasContrat = item.contratId || contratStatut;
        
        let iconClass, title, action;
        
        if (contratStatut === 'redige') {
          // Contrat rédigé et terminé - icône verte
          iconClass = "bi bi-file-earmark-check-fill text-success";
          title = "Contrat rédigé - Voir";
          action = () => openContratTab(item.id, item.artisteNom || item.titre || 'Concert');
        } else if (hasContrat) {
          // Contrat en cours de rédaction - icône orange
          iconClass = "bi bi-file-earmark-text-fill text-warning";
          title = "Contrat en cours - Continuer la rédaction";
          action = () => openContratTab(item.id, item.artisteNom || item.titre || 'Concert');
        } else {
          // Aucun contrat - icône grise
          iconClass = "bi bi-file-earmark text-muted";
          title = "Créer un contrat";
          action = () => openContratTab(item.id, item.artisteNom || item.titre || 'Concert');
        }
        
        return (
          <div className={tableStyles.contratFinalCell}>
            <i 
              className={iconClass}
              title={title}
              style={{ cursor: 'pointer' }}
              onClick={action}
            ></i>
          </div>
        );
      }
    },
    {
      label: 'Facture',
      key: 'facture',
      render: (item) => (
        <div className={tableStyles.factureCell}>
          {item.factureId ? (
            <i className="bi bi-receipt-cutoff text-success" title="Facture existante"></i>
          ) : (
            <i className="bi bi-receipt text-muted" title="Pas de facture"></i>
          )}
        </div>
      )
    },
    {
      label: 'Actions',
      key: 'actions',
      render: (item) => (
        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
          {/* Bouton Modifier */}
          <button
            style={{
              padding: '4px 8px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              backgroundColor: '#fd7e14',
              color: 'white',
              fontSize: '12px'
            }}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/concerts/${item.id}/edit`);
            }}
            title="Modifier le concert"
          >
            <i className="bi bi-pencil-square"></i>
          </button>

          {/* Bouton Supprimer */}
          <button
            style={{
              padding: '4px 8px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              backgroundColor: '#dc3545',
              color: 'white',
              fontSize: '12px'
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteConcert(item);
            }}
            title="Supprimer le concert"
          >
            <i className="bi bi-trash"></i>
          </button>
        </div>
      )
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