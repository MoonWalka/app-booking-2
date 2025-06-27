// Configuration partagée des colonnes pour les tableaux de dates/concerts
// Extraite du TableauDeBordPage pour réutilisation

/**
 * Configuration des colonnes du tableau de dates avancé
 * @param {Object} hooks - Hooks et fonctions nécessaires
 * @param {Function} hooks.openTab - Fonction pour ouvrir un onglet
 * @param {Function} hooks.openPreContratTab - Fonction pour ouvrir un pré-contrat
 * @param {Function} hooks.openContratTab - Fonction pour ouvrir un contrat
 * @param {Object} styles - Classes CSS pour le styling
 */
export const createDatesTableColumns = (hooks = {}, styles = {}) => {
  const { openTab, openPreContratTab, openContratTab } = hooks;

  // Fonction pour ouvrir la page de confirmation
  const openConfirmationPage = (item) => {
    if (openTab) {
      openTab({
        id: `confirmation-${item.id}`,
        title: `Confirmation - ${item.artisteNom || item.titre || 'Concert'}`,
        path: `/confirmation?concertId=${item.id}`,
        component: 'ConfirmationPage',
        params: { concertId: item.id },
        icon: 'bi-check-circle'
      });
    }
  };

  return [
    {
      label: 'Niveau',
      key: 'niveau',
      sortable: true,
      render: (item) => {
        const niveau = item.niveau || 1;
        return (
          <div className={styles.niveauCell}>
            <div className={styles.niveauIcon}>
              {Array.from({ length: 3 }, (_, index) => (
                <div 
                  key={index}
                  className={`${styles.niveauBar} ${index < niveau ? styles.niveauBarActive : styles.niveauBarInactive}`}
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
      sortable: true,
      render: (item) => (
        <span className={styles.artisteCell}>
          {item.artisteNom || 'Non spécifié'}
        </span>
      )
    },
    {
      label: 'Projet',
      key: 'projet',
      sortable: true,
      render: (item) => (
        <span className={styles.projetCell}>
          {item.formule || item.projet || '—'}
        </span>
      )
    },
    {
      label: 'Lieu',
      key: 'lieuNom',
      sortable: true,
      render: (item) => (
        <div className={styles.lieuCell}>
          <div className={styles.lieuNom}>
            {item.lieuNom || item.lieu?.nom || 'Non spécifié'}
          </div>
          {(item.lieuVille || item.lieu?.ville) && (
            <div className={styles.lieuVille}>
              {item.lieuVille || item.lieu?.ville}
            </div>
          )}
        </div>
      )
    },
    {
      label: 'Prise d\'option',
      key: 'priseOption',
      sortable: true,
      render: (item) => {
        if (!item.priseOption && !item.datePriseOption) return '—';
        
        const datePriseOption = item.datePriseOption || item.priseOption;
        if (!datePriseOption) return '—';
        
        const date = datePriseOption.toDate ? datePriseOption.toDate() : new Date(datePriseOption);
        return (
          <span className={styles.priseOptionCell}>
            {date.toLocaleDateString('fr-FR')}
          </span>
        );
      }
    },
    {
      label: 'Contrat',
      key: 'contrat',
      sortable: true,
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
          <div className={styles.contratTypeCell}>
            <span 
              className={styles.contratTypeBadge}
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
      sortable: true,
      render: (item) => {
        if (!item.date) return '—';
        const date = item.date.toDate ? item.date.toDate() : new Date(item.date);
        return (
          <span className={styles.dateCell}>
            {date.toLocaleDateString('fr-FR')}
          </span>
        );
      }
    },
    {
      label: 'Fin',
      key: 'dateFin',
      sortable: true,
      render: (item) => {
        if (!item.dateFin) return '—';
        const date = item.dateFin.toDate ? item.dateFin.toDate() : new Date(item.dateFin);
        return (
          <span className={styles.dateCell}>
            {date.toLocaleDateString('fr-FR')}
          </span>
        );
      }
    },
    {
      label: 'Montant',
      key: 'montant',
      sortable: true,
      render: (item) => (
        <div className={styles.montantCell}>
          {item.montant ? (
            <span className={styles.montant}>
              {item.montant.toLocaleString('fr-FR')} €
            </span>
          ) : (
            <span className={styles.noMontant}>—</span>
          )}
        </div>
      )
    },
    {
      label: 'Nb. de dates',
      key: 'nbDates',
      sortable: true,
      render: (item) => (
        <span className={styles.nbDatesCell}>
          {item.nbDates || '1'}
        </span>
      )
    },
    {
      label: 'Devis',
      key: 'devis',
      sortable: false,
      render: (item) => (
        <div className={styles.devisCell}>
          {item.devisId ? (
            <i 
              className="bi bi-file-earmark-check-fill text-success" 
              title="Voir le devis"
              style={{ cursor: 'pointer' }}
              onClick={() => openTab && openTab({
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
              onClick={() => openTab && openTab({
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
      sortable: false,
      render: (item) => (
        <div className={styles.preContratCell}>
          {item.preContratId ? (
            <i 
              className="bi bi-file-earmark-text-fill text-warning" 
              title="Pré-contrat existant"
              style={{ cursor: 'pointer' }}
              onClick={() => openPreContratTab && openPreContratTab(item.id, item.artiste?.nom || item.artisteNom || 'Concert')}
            ></i>
          ) : (
            <i 
              className="bi bi-file-earmark-text text-muted" 
              title="Créer un pré-contrat"
              style={{ cursor: 'pointer' }}
              onClick={() => openPreContratTab && openPreContratTab(item.id, item.artiste?.nom || item.artisteNom || 'Concert')}
            ></i>
          )}
        </div>
      )
    },
    {
      label: 'Confirmation',
      key: 'confirmation',
      sortable: false,
      render: (item) => (
        <div 
          className={`${styles.confirmationCell} ${styles.clickable}`}
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
      sortable: false,
      render: (item) => {
        // Utiliser le statut du contrat pour déterminer l'état
        const hasContrat = item.contratId;
        const contratStatus = item.contratStatus;
        
        let iconClass, title, action;
        
        if (contratStatus === 'finalized' || contratStatus === 'sent' || contratStatus === 'signed') {
          // Contrat finalisé - icône verte
          iconClass = "bi bi-file-earmark-check-fill text-success";
          title = "Contrat finalisé - Voir";
          action = () => openContratTab && openContratTab(item.id, item.artisteNom || item.titre || 'Concert');
        } else if (contratStatus === 'generated' || contratStatus === 'draft') {
          // Contrat en cours - icône orange
          iconClass = "bi bi-file-earmark-text-fill text-warning";
          title = "Contrat en cours - Continuer";
          action = () => openContratTab && openContratTab(item.id, item.artisteNom || item.titre || 'Concert');
        } else if (hasContrat) {
          // Contrat existant mais statut inconnu - icône orange
          iconClass = "bi bi-file-earmark-text-fill text-warning";
          title = "Voir le contrat";
          action = () => openContratTab && openContratTab(item.id, item.artisteNom || item.titre || 'Concert');
        } else {
          // Aucun contrat - icône grise
          iconClass = "bi bi-file-earmark text-muted";
          title = "Créer un contrat";
          action = () => openContratTab && openContratTab(item.id, item.artisteNom || item.titre || 'Concert');
        }
        
        return (
          <div className={styles.contratFinalCell}>
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
      sortable: false,
      render: (item) => (
        <div className={styles.factureCell}>
          {item.factureId ? (
            <i className="bi bi-receipt-cutoff text-success" title="Facture existante"></i>
          ) : (
            <i className="bi bi-receipt text-muted" title="Pas de facture"></i>
          )}
        </div>
      )
    }
  ];
};