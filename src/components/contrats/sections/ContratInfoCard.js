// src/components/contrats/sections/ContratInfoCard.js
import React from 'react';
import styles from '@/pages/ContratDetailsPage.module.css';
import { formatDateFr } from '@/utils/dateUtils';

/**
 * Component displaying contract and concert information
 */
const ContratInfoCard = ({ contrat, concert, template, lieu, artiste, programmateur }) => {
  // Obtenir le montant formaté
  const montant = concert?.montant 
    ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(concert.montant)
    : 'Non spécifié';

  // Formatage de la date et heure du spectacle
  const dateSpectacle = concert?.date && concert?.heure
    ? `${formatDateFr(concert.date)} à ${concert.heure}`
    : concert?.date 
    ? formatDateFr(concert.date)
    : 'Non spécifiée';

  // Lieu complet avec ville si disponible
  const lieuComplet = lieu?.nom && lieu?.ville
    ? `${lieu.nom} - ${lieu.ville}`
    : lieu?.nom || concert?.lieuNom || 'Non spécifié';

  // Badge de statut intégré
  const getStatusBadge = () => {
    const statusConfig = {
      signed: { 
        class: 'signed', 
        icon: 'bi-check-circle', 
        label: 'Signé' 
      },
      sent: { 
        class: 'sent', 
        icon: 'bi-send', 
        label: 'Envoyé' 
      },
      generated: { 
        class: 'generated', 
        icon: 'bi-file-earmark-text', 
        label: 'Généré' 
      }
    };
    
    const config = statusConfig[contrat?.status] || { 
      class: 'generated', 
      icon: 'bi-question-circle', 
      label: 'Inconnu' 
    };
    
    return (
      <span className={`${styles.statusBadge} ${styles[config.class]}`}>
        <i className={`bi ${config.icon}`}></i>
        {config.label}
      </span>
    );
  };

  return (
    <div className={styles.infoCard}>
      <div className={styles.cardHeader}>
        <i className="bi bi-info-circle"></i>
        <h3>Informations du contrat</h3>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <div className={styles.infoLabel}>Template utilisé</div>
            <div className={styles.infoValue}>{template?.name || 'Non spécifié'}</div>
          </div>
          <div className={styles.infoItem}>
            <div className={styles.infoLabel}>Concert</div>
            <div className={styles.infoValue}>{concert?.titre || 'Concert sans titre'}</div>
          </div>
          <div className={styles.infoItem}>
            <div className={styles.infoLabel}>Date du spectacle</div>
            <div className={styles.infoValue}>{dateSpectacle}</div>
          </div>
          <div className={styles.infoItem}>
            <div className={styles.infoLabel}>Lieu</div>
            <div className={styles.infoValue}>{lieuComplet}</div>
          </div>
          <div className={styles.infoItem}>
            <div className={styles.infoLabel}>Artiste</div>
            <div className={styles.infoValue}>{artiste?.nom || concert?.artisteNom || 'Non spécifié'}</div>
          </div>
          <div className={styles.infoItem}>
            <div className={styles.infoLabel}>Programmateur</div>
            <div className={styles.infoValue}>
              {programmateur?.structure || programmateur?.nom || concert?.programmateurNom || 'Non spécifié'}
            </div>
          </div>
          <div className={styles.infoItem}>
            <div className={styles.infoLabel}>Montant</div>
            <div className={styles.infoValue}>{montant}</div>
          </div>
          <div className={styles.infoItem}>
            <div className={styles.infoLabel}>Statut</div>
            <div className={styles.infoValue}>{getStatusBadge()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContratInfoCard;