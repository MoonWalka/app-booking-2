// src/components/contrats/sections/ContratInfoCard.js
import React from 'react';
import styles from '@/pages/ContratDetailsPage.module.css';
import { formatDateFr } from '@/utils/dateUtils';

/**
 * Component displaying contract and concert information
 */
const ContratInfoCard = ({ contrat, concert, template, lieu, artiste, programmateur }) => {
  // Logs de debug pour voir les données reçues
  console.log('[DEBUG ContratInfoCard] Props reçues:', {
    contrat,
    concert,
    template,
    lieu,
    artiste,
    programmateur
  });

  // Obtenir le montant formaté
  const montant = concert?.montant 
    ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(concert.montant)
    : 'Non spécifié';

  console.log('[DEBUG ContratInfoCard] Montant calculé:', montant, 'concert?.montant:', concert?.montant);

  // Formatage de la date et heure du spectacle
  const dateSpectacle = concert?.date && concert?.heure
    ? `${formatDateFr(concert.date)} à ${concert.heure}`
    : concert?.date 
    ? formatDateFr(concert.date)
    : 'Non spécifiée';

  console.log('[DEBUG ContratInfoCard] Date spectacle calculée:', dateSpectacle, 'concert?.date:', concert?.date, 'concert?.heure:', concert?.heure);

  // Lieu complet avec ville si disponible
  const lieuComplet = lieu?.nom && lieu?.ville
    ? `${lieu.nom} - ${lieu.ville}`
    : lieu?.nom || concert?.lieuNom || 'Non spécifié';

  console.log('[DEBUG ContratInfoCard] Lieu complet calculé:', lieuComplet, 'lieu:', lieu, 'concert?.lieuNom:', concert?.lieuNom);

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

  // Formatage du contact avec nom complet et structure
  const formatProgrammateur = () => {
    console.log('[DEBUG ContratInfoCard] formatProgrammateur - programmateur:', programmateur, 'concert?.programmateurNom:', concert?.programmateurNom);
    
    if (!programmateur && !concert?.programmateurNom) {
      return 'Non spécifié';
    }

    // Si on a les données complètes du contact
    if (programmateur) {
      const nomComplet = programmateur.prenom && programmateur.nom 
        ? `${programmateur.prenom} ${programmateur.nom}`
        : programmateur.nom || 'Nom non spécifié';

      // Chercher la structure dans différents endroits possibles
      const structure = programmateur.structureCache?.raisonSociale 
        || programmateur.structure?.nom 
        || programmateur.structure 
        || null;

      console.log('[DEBUG ContratInfoCard] nomComplet:', nomComplet, 'structure:', structure);

      if (structure) {
        return `${nomComplet} (${structure})`;
      } else {
        return nomComplet;
      }
    }

    // Fallback sur les données du concert
    return concert.programmateurNom;
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
            <div className={styles.infoValue}>{formatProgrammateur()}</div>
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