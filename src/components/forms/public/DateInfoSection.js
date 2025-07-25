import React from 'react';
import { formatDateFrSlash } from '@/utils/dateUtils';
import styles from './DateInfoSection.module.css';
import Card from '@/components/ui/Card';

/**
 * Component to display date information in form pages
 */
const DateInfoSection = ({ date, lieu }) => {
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

  if (!date) {
    return null;
  }

  return (
    <Card
      title="Informations sur la date"
      className={`${styles.dateInfo} mb-4`}
    >
      <div className="row">
        <div className="col-md-4">
          <div className="fw-bold">Date</div>
          <div>{formatDate(date.date)}</div>
        </div>
        <div className="col-md-4">
          <div className="fw-bold">Lieu</div>
          <div>{lieu?.nom || 'Non spécifié'}</div>
        </div>
        <div className="col-md-4">
          <div className="fw-bold">Montant</div>
          <div>{formatMontant(date.montant)}</div>
        </div>
      </div>
    </Card>
  );
};

export default DateInfoSection;