import React from 'react';
import styles from './StructureContactSection.module.css';

/**
 * Component for displaying contact information of a structure
 * 
 * @param {Object} props - Component props
 * @param {Object} props.structure - Structure data
 * @param {Function} props.formatValue - Function to format display values
 */
const StructureContactSection = ({ structure, formatValue }) => {
  if (!structure) return null;
  
  // Fonction helper pour formater les valeurs simplement
  const formatSimpleValue = (value) => {
    if (formatValue && typeof formatValue === 'function') {
      // Si formatValue attend 2 paramètres, on utilise le second paramètre
      return formatValue('default', value);
    }
    // Sinon on fait un formatage simple
    return value !== undefined && value !== null && value !== '' ? value : 'Non spécifié';
  };
  
  return (
    <div className={styles.detailsCard}>
      <div className={styles.cardHeader}>
        <i className="bi bi-person me-2"></i>
        <h3>Contact principal</h3>
      </div>
      <div className={styles.cardBody}>
        <div className="row">
          <div className="col-md-6">
            <div className={styles.infoGroup}>
              <div className={styles.infoLabel}>Nom</div>
              <div className={styles.infoValue}>{formatSimpleValue(structure.contact?.nom)}</div>
            </div>
          </div>
          <div className="col-md-6">
            <div className={styles.infoGroup}>
              <div className={styles.infoLabel}>Fonction</div>
              <div className={styles.infoValue}>{formatSimpleValue(structure.contact?.fonction)}</div>
            </div>
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-md-6">
            <div className={styles.infoGroup}>
              <div className={styles.infoLabel}>Téléphone</div>
              <div className={styles.infoValue}>
                {structure.contact?.telephone ? (
                  <a href={`tel:${structure.contact.telephone}`} className={styles.contactLink}>
                    <i className="bi bi-telephone me-1"></i>
                    {structure.contact.telephone}
                  </a>
                ) : (
                  'Non spécifié'
                )}
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className={styles.infoGroup}>
              <div className={styles.infoLabel}>Email</div>
              <div className={styles.infoValue}>
                {structure.contact?.email ? (
                  <a href={`mailto:${structure.contact.email}`} className={styles.contactLink}>
                    <i className="bi bi-envelope me-1"></i>
                    {structure.contact.email}
                  </a>
                ) : (
                  'Non spécifié'
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StructureContactSection;