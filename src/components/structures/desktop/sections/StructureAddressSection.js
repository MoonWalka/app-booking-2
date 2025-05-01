import React from 'react';
import styles from './StructureAddressSection.module.css';

/**
 * Component for displaying address information of a structure
 * 
 * @param {Object} props - Component props
 * @param {Object} props.structure - Structure data
 * @param {Function} props.formatValue - Function to format display values
 */
const StructureAddressSection = ({ structure, formatValue }) => {
  if (!structure) return null;
  
  return (
    <div className={styles.detailsCard}>
      <div className={styles.cardHeader}>
        <i className="bi bi-geo-alt me-2"></i>
        <h3>Coordonnées</h3>
      </div>
      <div className={styles.cardBody}>
        <div className="row">
          <div className="col-md-12">
            <div className={styles.infoGroup}>
              <div className={styles.infoLabel}>Adresse</div>
              <div className={styles.infoValue}>{formatValue(structure.adresse)}</div>
            </div>
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-md-4">
            <div className={styles.infoGroup}>
              <div className={styles.infoLabel}>Code postal</div>
              <div className={styles.infoValue}>{formatValue(structure.codePostal)}</div>
            </div>
          </div>
          <div className="col-md-4">
            <div className={styles.infoGroup}>
              <div className={styles.infoLabel}>Ville</div>
              <div className={styles.infoValue}>{formatValue(structure.ville)}</div>
            </div>
          </div>
          <div className="col-md-4">
            <div className={styles.infoGroup}>
              <div className={styles.infoLabel}>Pays</div>
              <div className={styles.infoValue}>{formatValue(structure.pays)}</div>
            </div>
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-md-4">
            <div className={styles.infoGroup}>
              <div className={styles.infoLabel}>Téléphone</div>
              <div className={styles.infoValue}>
                {structure.telephone ? (
                  <a href={`tel:${structure.telephone}`} className={styles.contactLink}>
                    <i className="bi bi-telephone me-1"></i>
                    {structure.telephone}
                  </a>
                ) : (
                  'Non spécifié'
                )}
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className={styles.infoGroup}>
              <div className={styles.infoLabel}>Email</div>
              <div className={styles.infoValue}>
                {structure.email ? (
                  <a href={`mailto:${structure.email}`} className={styles.contactLink}>
                    <i className="bi bi-envelope me-1"></i>
                    {structure.email}
                  </a>
                ) : (
                  'Non spécifié'
                )}
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className={styles.infoGroup}>
              <div className={styles.infoLabel}>Site web</div>
              <div className={styles.infoValue}>
                {structure.siteWeb ? (
                  <a href={structure.siteWeb} target="_blank" rel="noopener noreferrer" className={styles.contactLink}>
                    <i className="bi bi-globe me-1"></i>
                    {structure.siteWeb}
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

export default StructureAddressSection;