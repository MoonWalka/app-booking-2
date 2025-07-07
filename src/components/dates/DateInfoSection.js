import React from 'react';
import { Link } from 'react-router-dom';
import styles from './DateInfoSection.module.css';

/**
 * Section d'informations pour les dates - layout 2 colonnes
 */
const DateInfoSection = ({ entity, section }) => {
  console.log('🎭 DateInfoSection Debug:', {
    entity,
    artistes: entity?.artistes,
    artistesIds: entity?.artistesIds,
    artisteNom: entity?.artisteNom,
    keys: entity ? Object.keys(entity) : []
  });

  const formatDate = (date) => {
    if (!date) return 'Non définie';
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatMontant = (montant) => {
    if (!montant) return 'Non défini';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(montant);
  };

  const isDatePassed = (date) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  const getStatusBadgeClass = (statut) => {
    switch (statut) {
      case 'incomplete': return 'secondary';
      case 'interet': return 'info';
      case 'option': return 'warning';
      case 'confirme': return 'success';
      case 'annule': return 'danger';
      case 'reporte': return 'primary';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (statut) => {
    switch (statut) {
      case 'incomplete': return 'Incomplète';
      case 'interet': return 'Intérêt';
      case 'option': return 'Option';
      case 'confirme': return 'Confirmé';
      case 'annule': return 'Annulé';
      case 'reporte': return 'Reporté';
      default: return statut || 'Non défini';
    }
  };

  // Récupérer l'artiste (premier dans la liste)
  const artiste = entity.artistes && entity.artistes.length > 0 ? entity.artistes[0] : null;

  return (
    <div className={styles.infoContainer}>
      <div className={styles.row}>
        {/* Colonne gauche */}
        <div className={styles.column}>
          <div className={styles.infoItem}>
            <div className={styles.label}>Titre:</div>
            <div className={styles.value}>{entity?.titre || "Sans titre"}</div>
          </div>
          
          <div className={styles.infoItem}>
            <div className={styles.label}>Date:</div>
            <div className={`${styles.value} ${isDatePassed(entity?.date) ? styles.textMuted : ''}`}>
              {formatDate(entity?.date)}
              {isDatePassed(entity?.date) && (
                <span className={styles.passedBadge}>Passé</span>
              )}
            </div>
          </div>
          
          <div className={styles.infoItem}>
            <div className={styles.label}>Montant:</div>
            <div className={styles.value}>{formatMontant(entity?.montant)}</div>
          </div>
        </div>

        {/* Colonne droite */}
        <div className={styles.column}>
          <div className={styles.infoItem}>
            <div className={styles.label}>Artiste:</div>
            <div className={styles.value}>
              {artiste ? (
                <Link to={`/artistes/${artiste.id}`} className={styles.artisteLink}>
                  <i className="bi bi-music-note"></i>
                  {artiste.nom}
                </Link>
              ) : (
                entity?.artisteNom ? entity.artisteNom : <span className={styles.textMuted}>Non spécifié</span>
              )}
            </div>
          </div>
          
          <div className={styles.infoItem}>
            <div className={styles.label}>Niveau:</div>
            <div className={styles.value}>
              <span className={`${styles.statusBadge} ${styles[getStatusBadgeClass(entity?.niveau)]}`}>
                {getStatusLabel(entity?.niveau)}
              </span>
            </div>
          </div>
          
          <div className={styles.infoItem}>
            <div className={styles.label}>Formulaire:</div>
            <div className={styles.value}>
              {!entity?.formDataStatus ? (
                <span className={`${styles.statusBadge} ${styles.warning}`}>
                  <i className="bi bi-exclamation-triangle"></i> Non envoyé
                </span>
              ) : entity.formDataStatus === 'validated' ? (
                <span className={`${styles.statusBadge} ${styles.success}`}>
                  <i className="bi bi-check-circle"></i> Formulaire validé
                </span>
              ) : entity.formDataStatus === 'filled' ? (
                <span className={`${styles.statusBadge} ${styles.info}`}>
                  <i className="bi bi-hourglass-split"></i> Formulaire rempli, à valider
                </span>
              ) : (
                <span className={`${styles.statusBadge} ${styles.primary}`}>
                  <i className="bi bi-envelope"></i> Formulaire envoyé
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {entity?.notes && (
        <div className={styles.notesSection}>
          <div className={styles.label}>Notes:</div>
          <div className={styles.notesContent}>{entity.notes}</div>
        </div>
      )}
    </div>
  );
};

export default DateInfoSection;