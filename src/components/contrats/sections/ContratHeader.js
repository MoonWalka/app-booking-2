// src/components/contrats/sections/ContratHeader.js
import React from 'react';
import styles from '@/pages/ContratDetailsPage.module.css';
import { formatDateFr } from '@/utils/dateUtils';

/**
 * Header component for contract details page with title, metadata and status badge
 */
const ContratHeader = ({ contrat, concert, artiste, lieu }) => {
  const getStatusBadge = () => {
    if (!contrat) return null;
    
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
    
    const config = statusConfig[contrat.status] || { 
      class: 'generated', 
      icon: 'bi-question-circle', 
      label: 'Inconnu' 
    };
    
    return (
      <div className={`${styles.statusBadge} ${styles[config.class]}`}>
        <i className={`bi ${config.icon}`}></i>
        {config.label}
      </div>
    );
  };

  // Formater la date de création
  const creationDate = contrat?.dateGeneration 
    ? formatDateFr(contrat.dateGeneration) 
    : 'Date inconnue';

  // Construire le titre du contrat
  const contractTitle = concert?.titre 
    ? `Contrat de Spectacle - ${concert.titre}`
    : 'Contrat de Spectacle';

  return (
    <div className={styles.contratHeader}>
      <div className={styles.contratTitleSection}>
        <h1 className={styles.contratTitle}>{contractTitle}</h1>
        <div className={styles.contratMeta}>
          <span>
            <i className="bi bi-calendar3"></i>
            Créé le {creationDate}
          </span>
          {artiste?.nom && (
            <span>
              <i className="bi bi-person"></i>
              {artiste.nom}
            </span>
          )}
          {lieu?.nom && (
            <span>
              <i className="bi bi-geo-alt"></i>
              {lieu.nom}
            </span>
          )}
        </div>
      </div>
      {getStatusBadge()}
    </div>
  );
};

export default ContratHeader;