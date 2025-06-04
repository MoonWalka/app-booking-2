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
 * Version restaurée : lit contactsAssocies du lieu (tableau d'objets)
 */
const LieuOrganizerSection = ({ isEditMode, lieu }) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContacts = async () => {
      if (!lieu || !lieu.contactsAssocies || !Array.isArray(lieu.contactsAssocies) || lieu.contactsAssocies.length === 0) {
        setContacts([]);
        setLoading(false);
        setError(null);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        // Extraire les IDs du tableau d'objets
        const ids = lieu.contactsAssocies.map(p => typeof p === 'string' ? p : p.id).filter(Boolean);
        // Charger tous les documents contact
        const progs = [];
        for (const id of ids) {
          const docSnap = await getDoc(doc(db, 'contacts', id));
          if (docSnap.exists()) {
            progs.push({ id: docSnap.id, ...docSnap.data() });
          }
        }
        setContacts(progs);
      } catch (err) {
        setError('Impossible de charger les contacts associés à ce lieu.');
        setContacts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, [lieu]);

  return (
    <Card title={mapTerm("Contact(s)")} icon={<i className="bi bi-person-badge"></i>}>
      <div className={styles.cardBody}>
        {loading ? (
          <div className="text-center py-3">
            <div className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">Chargement des contacts...</span>
            </div>
          </div>
        ) : error ? (
          <Alert variant="warning">{error}</Alert>
        ) : contacts.length > 0 ? (
          <div>
            {contacts.map(prog => (
              <div key={prog.id} className={styles.infoRow}>
                <div className={styles.infoLabel}>
                  <i className="bi bi-person text-primary"></i>
                  Nom
                </div>
                <div className={`${styles.infoValue} ${styles.highlight}`}>
                  <Link to={`/contacts/${prog.id}`} className={styles.contactLink}>
                    {prog.prenom} {prog.nom}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.textEmpty}>Aucun contact associé à ce lieu.</div>
        )}
      </div>
    </Card>
  );
};

export default LieuOrganizerSection;