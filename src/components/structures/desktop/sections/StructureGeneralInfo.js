import React from 'react';
import styles from './StructureGeneralInfo.module.css';
import { getTypeLabel } from '../utils';

/**
 * Component for displaying general information about a structure
 * 
 * @param {Object} props - Component props
 * @param {Object} props.structure - Structure data
 * @param {Function} props.formatValue - Function to format display values
 */
const StructureGeneralInfo = ({ structure, formatValue }) => {
  if (!structure) return null;
  
  return (
    <div className={styles.detailsCard}>
      <div className={styles.cardHeader}>
        <i className="bi bi-info-circle me-2"></i>
        <h3>Informations de base</h3>
      </div>
      <div className={styles.cardBody}>
        <div className="row">
          <div className="col-md-6">
            <div className={styles.infoGroup}>
              <div className={styles.infoLabel}>Nom</div>
              <div className={styles.infoValue}>{formatValue(structure.nom)}</div>
            </div>
          </div>
          <div className="col-md-6">
            <div className={styles.infoGroup}>
              <div className={styles.infoLabel}>Raison sociale</div>
              <div className={styles.infoValue}>{formatValue(structure.raisonSociale)}</div>
            </div>
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-md-6">
            <div className={styles.infoGroup}>
              <div className={styles.infoLabel}>Type</div>
              <div className={styles.infoValue}>
                {structure.type ? getTypeLabel(structure.type) : 'Non spécifié'}
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className={styles.infoGroup}>
              <div className={styles.infoLabel}>SIRET</div>
              <div className={styles.infoValue}>{formatValue(structure.siret)}</div>
            </div>
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-md-6">
            <div className={styles.infoGroup}>
              <div className={styles.infoLabel}>TVA Intracommunautaire</div>
              <div className={styles.infoValue}>{formatValue(structure.tva)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StructureGeneralInfo;