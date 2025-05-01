import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../../../firebaseInit';
import styles from './LieuConcertsSection.module.css';

/**
 * Component to display an associated concert item
 */
const ConcertItem = ({ concertId, lieuId, onConcertRemoved }) => {
  const [concert, setConcert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConcert = async () => {
      try {
        const concertDoc = await getDoc(doc(db, 'concerts', concertId));
        if (concertDoc.exists()) {
          setConcert({
            id: concertDoc.id,
            ...concertDoc.data()
          });
        }
      } catch (error) {
        console.error(`Erreur lors du chargement du concert ${concertId}:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchConcert();
  }, [concertId]);

  if (loading) {
    return (
      <div className={`${styles.concertItem} loading`}>
        <div className="spinner-border spinner-border-sm" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  if (!concert) {
    return (
      <div className={`${styles.concertItem} error`}>
        <div className="alert alert-warning mb-0">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Ce concert n'existe plus ou n'a pas pu être chargé.
        </div>
      </div>
    );
  }

  // Formater la date du concert
  const formatDate = (date) => {
    if (!date) return 'Date non spécifiée';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={styles.concertItem}>
      <div className={styles.concertDetails}>
        <div className={styles.concertHeader}>
          <Link to={`/concerts/${concert.id}`} className={styles.concertTitle} onClick={(e) => e.stopPropagation()}>
            {concert.titre || 'Concert sans titre'}
          </Link>
          <span className={styles.concertDate}>
            <i className="bi bi-calendar3 me-1"></i>
            {formatDate(concert.date)}
          </span>
        </div>
        {concert.artistes && concert.artistes.length > 0 && (
          <div className={styles.concertArtistes}>
            <i className="bi bi-music-note-beamed me-1"></i>
            {concert.artistes.map(artiste => artiste.nom).join(', ')}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Section component for associated concerts
 */
const LieuConcertsSection = ({ lieu, isEditing }) => {
  const handleConcertRemoved = (concertId) => {
    // Cette fonction sera invoquée si on implémente la suppression des concerts depuis cette vue
  };

  return (
    <div className={styles.formCard}>
      <div className={styles.cardHeader}>
        <div className="d-flex align-items-center">
          <i className="bi bi-calendar-event"></i>
          <h3>Concerts associés</h3>
        </div>
        {!isEditing && (
          <div className={styles.headerActions}>
            <Link 
              to={`/concerts/nouveau?lieuId=${lieu.id}&lieuNom=${encodeURIComponent(lieu.nom)}`} 
              className="btn btn-sm btn-outline-primary"
            >
              <i className="bi bi-plus-circle me-1"></i>
              Ajouter un concert
            </Link>
          </div>
        )}
      </div>
      <div className={styles.cardBody}>
        {!isEditing ? (
          <>
            {lieu.concertsAssocies && lieu.concertsAssocies.length > 0 ? (
              <div className={styles.concertsListContainer}>
                {lieu.concertsAssocies.map(concertId => (
                  <ConcertItem 
                    key={concertId} 
                    concertId={concertId}
                    lieuId={lieu.id}
                    onConcertRemoved={handleConcertRemoved}
                  />
                ))}
              </div>
            ) : (
              <div className={styles.textEmpty}>
                Aucun concert n'est associé à ce lieu.
              </div>
            )}
          </>
        ) : (
          <div className="alert alert-info">
            <i className="bi bi-info-circle me-2"></i>
            Pour associer des concerts à ce lieu, utilisez la page de détails du lieu après avoir enregistré les modifications.
          </div>
        )}
      </div>
    </div>
  );
};

export { LieuConcertsSection, ConcertItem };