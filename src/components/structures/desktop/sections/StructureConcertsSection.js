import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Card from '@/components/ui/Card';
import styles from './StructureConcertsSection.module.css';

/**
 * Component for displaying concerts associated with a structure
 * 
 * @param {Object} props - Component props
 * @param {Array} props.concerts - List of concerts associated with the structure
 * @param {Boolean} props.loadingConcerts - Whether concerts are currently loading
 */
const StructureConcertsSection = ({ concerts, loadingConcerts }) => {
  // Debug temporaire pour analyser les données reçues
  console.log('[DEBUG StructureConcertsSection] Données reçues:', {
    concerts,
    loadingConcerts,
    nombreConcerts: concerts?.length || 0
  });
  const formatDate = (date) => {
    if (!date) return 'Date non définie';
    try {
      const dateObj = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
      return format(dateObj, 'dd MMMM yyyy', { locale: fr });
    } catch (error) {
      return 'Date invalide';
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'planifié': { class: 'badge-primary', icon: 'bi-calendar' },
      'confirmé': { class: 'badge-success', icon: 'bi-check-circle' },
      'annulé': { class: 'badge-danger', icon: 'bi-x-circle' },
      'reporté': { class: 'badge-warning', icon: 'bi-arrow-clockwise' },
      'passé': { class: 'badge-secondary', icon: 'bi-clock-history' }
    };
    
    const config = statusConfig[status] || { class: 'badge-secondary', icon: 'bi-question-circle' };
    
    return (
      <span className={`${styles.statusBadge} ${styles[config.class]}`}>
        <i className={`bi ${config.icon} me-1`}></i>
        {status || 'Non défini'}
      </span>
    );
  };

  return (
    <Card
      title={
        <span>
          Concerts associés
          {/* Debug temporaire : afficher le nombre */}
          <small style={{ marginLeft: '10px', color: '#666' }}>
            ({concerts?.length || 0} trouvé{concerts?.length > 1 ? 's' : ''})
          </small>
        </span>
      }
      icon={<i className="bi bi-music-note-list"></i>}
    >
        {loadingConcerts ? (
          <div className="text-center p-3">
            <div className={`${styles.spinner} ${styles.spinnerSmall}`} role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
          </div>
        ) : concerts && concerts.length > 0 ? (
          <div className={styles.concertsList}>
            {concerts.map(concert => (
              <div key={concert.id} className={styles.concertCard}>
                <div className={styles.concertHeader}>
                  <h4 className={styles.concertTitle}>
                    <Link to={`/concerts/${concert.id}`}>
                      {concert.titre || 'Concert sans titre'}
                    </Link>
                  </h4>
                  {getStatusBadge(concert.statut)}
                </div>
                
                <div className={styles.concertDetails}>
                  <div className={styles.detailItem}>
                    <i className="bi bi-calendar-event me-2"></i>
                    {formatDate(concert.date)}
                  </div>
                  
                  {concert.lieu && (
                    <div className={styles.detailItem}>
                      <i className="bi bi-geo-alt me-2"></i>
                      {concert.lieu.nom || concert.lieuNom}
                      {concert.lieu.ville && ` - ${concert.lieu.ville}`}
                    </div>
                  )}
                  
                  {concert.artiste && (
                    <div className={styles.detailItem}>
                      <i className="bi bi-mic me-2"></i>
                      {concert.artiste.nom || concert.artisteNom}
                    </div>
                  )}
                  
                  {concert.montant && (
                    <div className={styles.detailItem}>
                      <i className="bi bi-currency-euro me-2"></i>
                      {new Intl.NumberFormat('fr-FR', { 
                        style: 'currency', 
                        currency: 'EUR' 
                      }).format(concert.montant)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.alertInfo}>
            <i className="bi bi-info-circle me-2"></i>
            Aucun concert n'est associé à cette structure.
          </div>
        )}
    </Card>
  );
};

export default StructureConcertsSection; 