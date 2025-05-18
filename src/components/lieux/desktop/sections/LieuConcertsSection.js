import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '@/firebaseInit';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import styles from './LieuConcertsSection.module.css';

/**
 * Concert item component
 */
const ConcertItem = ({ concert }) => {
  const navigate = useNavigate();
  
  const formatDate = (date) => {
    if (!date) return 'Date non spécifiée';
    
    if (date.seconds) {
      return new Date(date.seconds * 1000).toLocaleDateString('fr-FR');
    }
    
    try {
      return new Date(date).toLocaleDateString('fr-FR');
    } catch (e) {
      return 'Date invalide';
    }
  };
  
  const handleClick = () => {
    navigate(`/concerts/${concert.id}`);
  };
  
  return (
    <div className={styles.concertItem} onClick={handleClick}>
      <div className={styles.concertDetails}>
        <div className={styles.concertHeader}>
          <Link to={`/concerts/${concert.id}`} className={styles.concertTitle} onClick={(e) => e.stopPropagation()}>
            {concert.titre || 'Concert sans titre'}
          </Link>
          <div className={styles.concertDate}>
            <i className="bi bi-calendar-event me-1"></i>
            {formatDate(concert.date)}
          </div>
        </div>
        
        {concert.artistes && concert.artistes.length > 0 && (
          <div className={styles.concertArtistes}>
            <i className="bi bi-music-note-list me-1"></i>
            {concert.artistes.map(a => a.nom).join(', ')}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Concerts section component for venue details
 */
const LieuConcertsSection = ({ lieu, isEditing }) => {
  const navigate = useNavigate();
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchConcerts = async () => {
      if (!lieu || !lieu.id) return;
      
      try {
        const q = query(
          collection(db, 'concerts'),
          where('lieuId', '==', lieu.id),
          limit(5)
        );
        
        const querySnapshot = await getDocs(q);
        const concertsData = [];
        
        querySnapshot.forEach((doc) => {
          concertsData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        // Tri par date (du plus récent au plus ancien)
        concertsData.sort((a, b) => {
          const dateA = a.date?.seconds || 0;
          const dateB = b.date?.seconds || 0;
          return dateB - dateA;
        });
        
        setConcerts(concertsData);
      } catch (err) {
        console.error('Erreur lors du chargement des concerts:', err);
        setError('Impossible de charger les concerts associés à ce lieu.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchConcerts();
  }, [lieu]);
  
  const handleCreateConcert = () => {
    navigate('/concerts/nouveau', { 
      state: { 
        preselectedLieu: {
          id: lieu.id,
          nom: lieu.nom
        }
      }
    });
  };
  
  return (
    <div className={styles.formCard}>
      <div className={styles.cardHeader}>
        <div>
          <i className="bi bi-calendar-event"></i>
          <h3>Concerts associés</h3>
        </div>
        
        {!isEditing && (
          <div className={styles.headerActions}>
            <button 
              onClick={() => navigate('/concerts', { state: { filterLieuId: lieu.id } })}
              className="btn btn-sm btn-outline-secondary"
              title="Voir tous les concerts"
            >
              <i className="bi bi-list"></i>
              <span className="d-none d-sm-inline ms-1">Tout voir</span>
            </button>
            <button 
              onClick={handleCreateConcert}
              className="btn btn-sm btn-outline-primary"
              title="Ajouter un concert à ce lieu"
            >
              <i className="bi bi-plus-lg"></i>
              <span className="d-none d-sm-inline ms-1">Ajouter</span>
            </button>
          </div>
        )}
      </div>
      <div className={styles.cardBody}>
        {loading ? (
          <div className={`${styles.concertItem} ${styles.loading}`}>
            <div className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">Chargement des concerts...</span>
            </div>
          </div>
        ) : error ? (
          <div className={`${styles.concertItem} ${styles.error}`}>
            <div className="alert alert-warning m-0 p-3">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </div>
          </div>
        ) : concerts.length > 0 ? (
          <div className={styles.concertsListContainer}>
            {concerts.map(concert => (
              <ConcertItem key={concert.id} concert={concert} />
            ))}
            
            {concerts.length >= 5 && (
              <div className="text-center mt-2">
                <button 
                  className="btn btn-link" 
                  onClick={() => navigate('/concerts', { state: { filterLieuId: lieu.id } })}
                >
                  Voir tous les concerts ({lieu.concertsCount || '?'})
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className={styles.textEmpty}>Aucun concert associé à ce lieu.</div>
        )}
      </div>
    </div>
  );
};

export { ConcertItem, LieuConcertsSection };
