import React from 'react';
import styles from './StructureAddressSection.module.css';
import useStructureAddressSection from '../../core/useStructureAddressSection';

/**
 * Component for displaying address information of a structure
 * 
 * @param {Object} props - Component props
 * @param {Object} props.structure - Structure data
 * @param {Function} props.formatValue - Function to format display values
 */
const StructureAddressSection = ({ structure, formatValue }) => {
  // Utiliser le hook partagé pour obtenir les données et la logique
  const { hasData, addressData, contactLinks } = useStructureAddressSection({ 
    structure, 
    formatValue 
  });
  
  if (!hasData) return null;
  
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
              <div className={styles.infoValue}>{addressData.adresse}</div>
            </div>
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-md-4">
            <div className={styles.infoGroup}>
              <div className={styles.infoLabel}>Code postal</div>
              <div className={styles.infoValue}>{addressData.codePostal}</div>
            </div>
          </div>
          <div className="col-md-4">
            <div className={styles.infoGroup}>
              <div className={styles.infoLabel}>Ville</div>
              <div className={styles.infoValue}>{addressData.ville}</div>
            </div>
          </div>
          <div className="col-md-4">
            <div className={styles.infoGroup}>
              <div className={styles.infoLabel}>Pays</div>
              <div className={styles.infoValue}>{addressData.pays}</div>
            </div>
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-md-4">
            <div className={styles.infoGroup}>
              <div className={styles.infoLabel}>Téléphone</div>
              <div className={styles.infoValue}>
                {contactLinks.telephone ? (
                  <a href={contactLinks.telephone.href} className={styles.contactLink}>
                    <i className={`bi bi-${contactLinks.telephone.icon} me-1`}></i>
                    {contactLinks.telephone.value}
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
                {contactLinks.email ? (
                  <a href={contactLinks.email.href} className={styles.contactLink}>
                    <i className={`bi bi-${contactLinks.email.icon} me-1`}></i>
                    {contactLinks.email.value}
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
                {contactLinks.siteWeb ? (
                  <a 
                    href={contactLinks.siteWeb.href} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={styles.contactLink}
                  >
                    <i className={`bi bi-${contactLinks.siteWeb.icon} me-1`}></i>
                    {contactLinks.siteWeb.value}
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