// src/components/contrats/sections/ContratHeader.js
import React from 'react';
import styles from '@/pages/ContratDetailsPage.module.css';
import { formatDateFr } from '@/utils/dateUtils';

/**
 * Header component for contract details page with title and metadata
 */
const ContratHeader = ({ contrat, concert, artiste, lieu }) => {
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
    </div>
  );
};

export default ContratHeader;