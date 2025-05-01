import React from 'react';
import { formatDateFrSlash } from '@/utils/dateUtils';
import styles from './ConcertInfoSection.module.css';

/**
 * Component to display concert information in form pages
 */
const ConcertInfoSection = ({ concert, lieu }) => {
  // Fonction pour formater la date
  const formatDate = (dateValue) => {
    if (!dateValue) return 'Date non spécifiée';
    return formatDateFrSlash(dateValue);
  };

  // Fonction pour formater le montant
  const formatMontant = (montant) => {
    if (!montant) return '0,00 €';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(montant);
  };

  if (!concert) {
    return null;
  }

  return (
    <div className={`${styles.concertInfo} card mb-4`}>
      <div className="card-header">
        <h3>Informations sur le concert</h3>
      </div>
      
      <div className="card-body">
        <div className="row">
          <div className="col-md-4">
            <div className="fw-bold">Date</div>
            <div>{formatDate(concert.date)}</div>
          </div>
          <div className="col-md-4">
            <div className="fw-bold">Lieu</div>
            <div>{lieu?.nom || 'Non spécifié'}</div>
          </div>
          <div className="col-md-4">
            <div className="fw-bold">Montant</div>
            <div>{formatMontant(concert.montant)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConcertInfoSection;