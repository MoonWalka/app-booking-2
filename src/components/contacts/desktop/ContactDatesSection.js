import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '@/utils/dateUtils';
import Button from '@ui/Button';
import styles from './ContactDatesSection.module.css';
import Card from '@ui/Card';

/**
 * Composant pour afficher les dates associées à un contact
 * @param {Object} props - Propriétés du composant
 * @param {Array} props.datesAssocies - Liste des dates associées
 * @param {boolean} props.isEditing - Mode édition ou visualisation
 * @param {boolean} props.showCardWrapper - Indique si la structure de carte doit être affichée
 */
const ContactDatesSection = ({ 
  contact,
  datesAssocies = [], 
  isEditMode = false, // Renommé pour cohérence
  showCardWrapper = true 
}) => {
  // Alias pour compatibilité
  const isEditing = isEditMode;
  const hasDates = datesAssocies?.length > 0;
  
  // Trier les dates par date (les plus récentes en premier)
  const sortedDates = [...datesAssocies].sort((a, b) => {
    // Utiliser la date du date si disponible, sinon utiliser dateCreation
    const dateA = a.dateDate ? new Date(a.dateDate) : (a.dateCreation ? new Date(a.dateCreation) : new Date());
    const dateB = b.dateDate ? new Date(b.dateDate) : (b.dateCreation ? new Date(b.dateCreation) : new Date());
    return dateB - dateA; // Ordre décroissant
  });

  // Contenu principal de la section
  const sectionContent = (
    <>
      {!hasDates && (
        <div className={styles.infoMessage}>
          <i className="bi bi-info-circle me-2"></i>
          Aucune date associée à ce contact.
        </div>
      )}
      
      {hasDates && (
        <div className={styles.datesList}>
          {sortedDates.map((date) => (
            <div key={date.id} className={styles.dateItem}>
              <div className={styles.dateInfo}>
                <Link to={`/dates/${date.id}`} className={styles.dateName}>
                  {date.titre || "Date sans titre"}
                </Link>
                <div className={styles.dateDetails}>
                  {date.dateDate && (
                    <span className={styles.dateDate}>
                      <i className="bi bi-calendar-event me-1"></i>
                      {formatDate(date.dateDate)}
                    </span>
                  )}
                  {date.lieu?.nom && (
                    <span className={styles.dateLocation}>
                      <i className="bi bi-geo-alt me-1"></i>
                      {date.lieu.nom}
                    </span>
                  )}
                  {date.statut && (
                    <span className={`${styles.statusBadge} ${styles[`status-${date.statut.toLowerCase()}`]}`}>
                      {date.statut}
                    </span>
                  )}
                </div>
              </div>
              <div className={styles.dateActions}>
                <Button as={Link} to={`/dates/${date.id}`} variant="outline-primary" size="sm">
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
            to="/dates/nouveau" 
            variant="outline-success"
            size="sm"
          >
            <i className="bi bi-plus-lg me-1"></i>
            Ajouter une date
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
      title="Dates associés"
      icon={<i className="bi bi-calendar-event"></i>}
      className={styles.datesCard}
      headerActions={
        <span className={styles.badge}>{datesAssocies.length}</span>
      }
    >
      {sectionContent}
    </Card>
  );
};

export default ContactDatesSection;