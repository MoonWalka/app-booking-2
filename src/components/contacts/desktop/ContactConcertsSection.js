import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '@/utils/dateUtils';
import Button from '@ui/Button';
import styles from './ContactConcertsSection.module.css';
import Card from '../../../components/ui/Card';

/**
 * Composant pour afficher les concerts associés à un contact
 * @param {Object} props - Propriétés du composant
 * @param {Array} props.concertsAssocies - Liste des concerts associés
 * @param {boolean} props.isEditing - Mode édition ou visualisation
 * @param {boolean} props.showCardWrapper - Indique si la structure de carte doit être affichée
 */
const ContactConcertsSection = ({ 
  contact,
  concertsAssocies = [], 
  isEditMode = false, // Renommé pour cohérence
  showCardWrapper = true 
}) => {
  // Alias pour compatibilité
  const isEditing = isEditMode;
  const hasConcerts = concertsAssocies?.length > 0;
  
  // Trier les concerts par date (les plus récents en premier)
  const sortedConcerts = [...concertsAssocies].sort((a, b) => {
    // Utiliser la date du concert si disponible, sinon utiliser dateCreation
    const dateA = a.dateConcert ? new Date(a.dateConcert) : (a.dateCreation ? new Date(a.dateCreation) : new Date());
    const dateB = b.dateConcert ? new Date(b.dateConcert) : (b.dateCreation ? new Date(b.dateCreation) : new Date());
    return dateB - dateA; // Ordre décroissant
  });

  // Contenu principal de la section
  const sectionContent = (
    <>
      {!hasConcerts && (
        <div className={styles.infoMessage}>
          <i className="bi bi-info-circle me-2"></i>
          Aucun concert associé à ce contact.
        </div>
      )}
      
      {hasConcerts && (
        <div className={styles.concertsList}>
          {sortedConcerts.map((concert) => (
            <div key={concert.id} className={styles.concertItem}>
              <div className={styles.concertInfo}>
                <Link to={`/concerts/${concert.id}`} className={styles.concertName}>
                  {concert.titre || "Concert sans titre"}
                </Link>
                <div className={styles.concertDetails}>
                  {concert.dateConcert && (
                    <span className={styles.concertDate}>
                      <i className="bi bi-calendar-event me-1"></i>
                      {formatDate(concert.dateConcert)}
                    </span>
                  )}
                  {concert.lieu?.nom && (
                    <span className={styles.concertLocation}>
                      <i className="bi bi-geo-alt me-1"></i>
                      {concert.lieu.nom}
                    </span>
                  )}
                  {concert.statut && (
                    <span className={`${styles.statusBadge} ${styles[`status-${concert.statut.toLowerCase()}`]}`}>
                      {concert.statut}
                    </span>
                  )}
                </div>
              </div>
              <div className={styles.concertActions}>
                <Button as={Link} to={`/concerts/${concert.id}`} variant="outline-primary" size="sm">
                  <i className="bi bi-eye me-1"></i>
                  Voir
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isEditing && (
        <div className={styles.addSection}>
          <Button 
            as={Link}
            to="/concerts/nouveau" 
            variant="outline-success"
            size="sm"
          >
            <i className="bi bi-plus-lg me-1"></i>
            Ajouter un concert
          </Button>
        </div>
      )}
    </>
  );

  // Si on ne veut pas le wrapper de carte, on retourne directement le contenu
  if (!showCardWrapper) {
    return sectionContent;
  }

  // Utilisation du composant Card standardisé
  return (
    <Card
      title="Concerts associés"
      icon={<i className="bi bi-calendar-event"></i>}
      className={styles.concertsCard}
      headerActions={
        <span className={styles.badge}>{concertsAssocies.length}</span>
      }
    >
      {sectionContent}
    </Card>
  );
};

export default ContactConcertsSection;