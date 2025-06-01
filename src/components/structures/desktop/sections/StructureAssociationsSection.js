import React from 'react';
import { Link } from 'react-router-dom';
import Card from '@/components/ui/Card';
import styles from './StructureAssociationsSection.module.css';

/**
 * Component for displaying programmateurs associated with a structure
 * 
 * @param {Object} props - Component props
 * @param {Array} props.programmateurs - List of programmateurs associated with the structure
 * @param {Boolean} props.loadingProgrammateurs - Whether programmateurs are currently loading
 */
const StructureAssociationsSection = ({ programmateurs, loadingProgrammateurs }) => {
  // Debug temporaire pour analyser les données reçues
  console.log('[DEBUG StructureAssociationsSection] Données reçues:', {
    programmateurs,
    loadingProgrammateurs,
    nombreProgrammateurs: programmateurs?.length || 0
  });

  return (
    <Card
      title={
        <span>
          Programmateurs associés
          {/* Debug temporaire : afficher le nombre */}
          <small style={{ marginLeft: '10px', color: '#666' }}>
            ({programmateurs?.length || 0} trouvé{programmateurs?.length > 1 ? 's' : ''})
          </small>
        </span>
      }
      icon={<i className="bi bi-person-badge"></i>}
    >
        {loadingProgrammateurs ? (
          <div className="text-center p-3">
            <div className={`${styles.spinner} ${styles.spinnerSmall}`} role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
          </div>
        ) : programmateurs.length > 0 ? (
          <div className={styles.programmateursList}>
            {programmateurs.map(prog => {
              // Gérer les différentes structures de données possibles
              const nom = prog.nom || prog.contact?.nom || 'Nom non renseigné';
              const prenom = prog.prenom || prog.contact?.prenom || '';
              const email = prog.email || prog.contact?.email || '';
              const telephone = prog.telephone || prog.contact?.telephone || '';
              const fonction = prog.fonction || prog.contact?.fonction || '';
              
              const fullName = prenom ? `${prenom} ${nom}` : nom;
              
              return (
                <div key={prog.id} className={styles.programmateurCard}>
                  <div className={styles.programmateurInfo}>
                    <h4 className={styles.programmateurName}>
                      <i className="bi bi-person-badge me-2"></i>
                      <Link to={`/programmateurs/${prog.id}`}>{fullName}</Link>
                    </h4>
                    {fonction && (
                      <div className={styles.programmateurFunction}>
                        <i className="bi bi-briefcase me-2"></i>
                        {fonction}
                      </div>
                    )}
                    <div className={styles.programmateurDetails}>
                      {email && (
                        <div className={styles.detailItem}>
                          <i className="bi bi-envelope me-2"></i>
                          <a href={`mailto:${email}`}>{email}</a>
                        </div>
                      )}
                      {telephone && (
                        <div className={styles.detailItem}>
                          <i className="bi bi-telephone me-2"></i>
                          <a href={`tel:${telephone}`}>{telephone}</a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={styles.alertInfo}>
            <i className="bi bi-info-circle me-2"></i>
            Aucun programmateur n'est associé à cette structure.
          </div>
        )}
    </Card>
  );
};

export default StructureAssociationsSection;