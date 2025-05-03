import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebaseInit';
import styles from './ProgrammateurStructuresSection.module.css';

// Composant pour afficher la structure associée à un programmateur
const ProgrammateurStructuresSection = ({ programmateur }) => {
  const [loading, setLoading] = useState(true);
  const [structure, setStructure] = useState(null);

  useEffect(() => {
    const fetchStructure = async () => {
      if (!programmateur || !programmateur.structureId) {
        setLoading(false);
        return;
      }

      try {
        const structureDoc = await getDoc(doc(db, 'structures', programmateur.structureId));
        if (structureDoc.exists()) {
          setStructure({
            id: structureDoc.id,
            ...structureDoc.data()
          });
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la structure associée:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStructure();
  }, [programmateur]);

  return (
    <div className={styles.sectionContainer}>
      <h3 className={styles.sectionTitle}>
        <i className="bi bi-building me-2"></i>
        Structure associée
      </h3>
      
      <div className={styles.contentContainer}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Chargement de la structure...
          </div>
        ) : structure ? (
          <div className={styles.structureItem}>
            <div className={styles.structureInfo}>
              <Link to={`/structures/${structure.id}`} className={styles.structureName}>
                {structure.nom || structure.raisonSociale}
              </Link>
              <div className={styles.structureDetails}>
                {structure.type && (
                  <span className={styles.typeBadge}>{structure.type}</span>
                )}
                {structure.ville && (
                  <span className={styles.structureLocation}>
                    <i className="bi bi-geo-alt me-1"></i>
                    {structure.ville}
                  </span>
                )}
              </div>
            </div>
            <div className={styles.structureActions}>
              <Link to={`/structures/${structure.id}`} className="btn btn-sm btn-outline-primary">
                <i className="bi bi-eye me-1"></i>
                Voir
              </Link>
            </div>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <i className="bi bi-exclamation-circle mb-2"></i>
            <p>Aucune structure associée à ce programmateur</p>
            <Link 
              to="/structures/nouvelle" 
              state={{ 
                returnTo: `/programmateurs/${programmateur?.id}`,
                programmateurId: programmateur?.id
              }}
              className="btn btn-sm btn-outline-primary mt-2"
            >
              <i className="bi bi-plus-lg me-1"></i>
              Associer une structure
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgrammateurStructuresSection;