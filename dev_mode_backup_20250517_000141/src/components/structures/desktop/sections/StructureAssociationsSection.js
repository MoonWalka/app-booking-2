import React from 'react';
import { Link } from 'react-router-dom';
import styles from './StructureAssociationsSection.module.css';

/**
 * Component for displaying programmateurs associated with a structure
 * 
 * @param {Object} props - Component props
 * @param {Array} props.programmateurs - List of programmateurs associated with the structure
 * @param {Boolean} props.loadingProgrammateurs - Whether programmateurs are currently loading
 */
const StructureAssociationsSection = ({ programmateurs, loadingProgrammateurs }) => {
  return (
    <div className={styles.detailsCard}>
      <div className={styles.cardHeader}>
        <i className="bi bi-person-badge me-2"></i>
        <h3>Programmateurs associés</h3>
      </div>
      <div className={styles.cardBody}>
        {loadingProgrammateurs ? (
          <div className="text-center p-3">
            <div className={`${styles.spinner} ${styles.spinnerSmall}`} role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
          </div>
        ) : programmateurs.length > 0 ? (
          <div className={styles.programmateursList}>
            {programmateurs.map(prog => (
              <div key={prog.id} className={styles.programmateurCard}>
                <div className={styles.programmateurInfo}>
                  <h4 className={styles.programmateurName}>
                    <i className="bi bi-person-badge me-2"></i>
                    <Link to={`/programmateurs/${prog.id}`}>{prog.nom}</Link>
                  </h4>
                  <div className={styles.programmateurDetails}>
                    {prog.email && (
                      <div className={styles.detailItem}>
                        <i className="bi bi-envelope me-2"></i>
                        <a href={`mailto:${prog.email}`}>{prog.email}</a>
                      </div>
                    )}
                    {prog.telephone && (
                      <div className={styles.detailItem}>
                        <i className="bi bi-telephone me-2"></i>
                        <a href={`tel:${prog.telephone}`}>{prog.telephone}</a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.alertInfo}>
            <i className="bi bi-info-circle me-2"></i>
            Aucun programmateur n'est associé à cette structure.
          </div>
        )}
      </div>
    </div>
  );
};

export default StructureAssociationsSection;