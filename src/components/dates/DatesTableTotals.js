import React from 'react';
import styles from './DatesTableTotals.module.css';

/**
 * Bandeau des totaux pour afficher les montants sélectionnés
 */
const DatesTableTotals = ({ selectedDates = [] }) => {
  // Calculer les totaux
  const totals = React.useMemo(() => {
    if (selectedDates.length === 0) {
      return {
        count: 0,
        montant: 0,
        montantHT: 0
      };
    }

    const montant = selectedDates.reduce((sum, date) => {
      const amount = date.montant || date.montantTotal || 0;
      return sum + amount;
    }, 0);

    // Pour le montant HT, on pourrait appliquer un calcul de TVA
    // Pour l'instant on met 0 comme dans l'exemple
    const montantHT = 0;

    return {
      count: selectedDates.length,
      montant,
      montantHT
    };
  }, [selectedDates]);

  if (selectedDates.length === 0) {
    return (
      <div className={styles.totalsContainer}>
        <span className={styles.emptyState}>
          Sélectionnez des lignes pour voir les totaux
        </span>
      </div>
    );
  }

  return (
    <div className={styles.totalsContainer}>
      <div className={styles.selectionInfo}>
        <span className={styles.totalsLabel}>Totaux de la sélection:</span>
        <span className={styles.selectedCount}>
          {totals.count} ligne{totals.count > 1 ? 's' : ''} sélectionnée{totals.count > 1 ? 's' : ''}
        </span>
      </div>

      <div className={styles.totalsGrid}>
        <div className={styles.totalItem}>
          <span className={styles.totalLabel}>Montant:</span>
          <span className={`${styles.totalValue} ${styles.highlight}`}>
            {totals.montant.toLocaleString('fr-FR', { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            })}
          </span>
        </div>

        <div className={styles.totalItem}>
          <span className={styles.totalLabel}>Montant consolidé HT:</span>
          <span className={styles.totalValue}>
            {totals.montantHT.toLocaleString('fr-FR', { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DatesTableTotals;