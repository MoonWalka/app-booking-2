import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import Card from '@/components/ui/Card';
import Alert from '@ui/Alert';
import { mapTerm } from '@/utils/terminologyMapping';
import styles from './LieuOrganizerSection.module.css';

/**
 * Organizer section component for venue details
 * Version restaurée : lit programmateursAssocies du lieu (tableau d'objets)
 */
const LieuOrganizerSection = ({ isEditMode, lieu }) => {
  const [programmateurs, setProgrammateurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProgrammateurs = async () => {
      if (!lieu || !lieu.programmateursAssocies || !Array.isArray(lieu.programmateursAssocies) || lieu.programmateursAssocies.length === 0) {
        setProgrammateurs([]);
        setLoading(false);
        setError(null);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        // Extraire les IDs du tableau d'objets
        const ids = lieu.programmateursAssocies.map(p => typeof p === 'string' ? p : p.id).filter(Boolean);
        // Charger tous les documents programmateur
        const progs = [];
        for (const id of ids) {
          const docSnap = await getDoc(doc(db, 'programmateurs', id));
          if (docSnap.exists()) {
            progs.push({ id: docSnap.id, ...docSnap.data() });
          }
        }
        setProgrammateurs(progs);
      } catch (err) {
        setError('Impossible de charger les programmateurs associés à ce lieu.');
        setProgrammateurs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProgrammateurs();
  }, [lieu]);

  return (
    <Card title={mapTerm("Programmateur(s)")} icon={<i className="bi bi-person-badge"></i>}>
      <div className={styles.cardBody}>
        {loading ? (
          <div className="text-center py-3">
            <div className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">Chargement des programmateurs...</span>
            </div>
          </div>
        ) : error ? (
          <Alert variant="warning">{error}</Alert>
        ) : programmateurs.length > 0 ? (
          <div>
            {programmateurs.map(prog => (
              <div key={prog.id} className={styles.infoRow}>
                <div className={styles.infoLabel}>
                  <i className="bi bi-person text-primary"></i>
                  Nom
                </div>
                <div className={`${styles.infoValue} ${styles.highlight}`}>
                  <Link to={`/programmateurs/${prog.id}`} className={styles.programmateurLink}>
                    {prog.prenom} {prog.nom}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.textEmpty}>Aucun programmateur associé à ce lieu.</div>
        )}
      </div>
    </Card>
  );
};

export default LieuOrganizerSection;