import React from 'react';
import Button from '@ui/Button';
import styles from './SelectedEntityCard.module.css';

/**
 * SelectedEntityCard - Composant pour afficher une entité sélectionnée
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {Object} props.entity - L'entité sélectionnée (lieu, programmateur, artiste)
 * @param {string} props.entityType - Type d'entité (lieu, programmateur, artiste)
 * @param {Function} props.onRemove - Fonction pour supprimer l'entité sélectionnée
 * @param {string} props.primaryField - Champ principal à afficher (nom par défaut)
 * @param {Array} props.secondaryFields - Liste des champs secondaires à afficher
 */
const SelectedEntityCard = ({ 
  entity, 
  entityType, 
  onRemove, 
  primaryField = 'nom',
  secondaryFields = []
}) => {
  const [showNewBadge, setShowNewBadge] = React.useState(false);
  const [prevEntityId, setPrevEntityId] = React.useState(null);
  
  // Effet pour afficher le badge "Nouveau" lors de l'ajout d'une nouvelle entité
  React.useEffect(() => {
    if (entity && entity.id !== prevEntityId) {
      // Vérifier si l'entité a été créée récemment (dans les 2 dernières minutes)
      const createdAt = entity.createdAt;
      const isNewEntity = createdAt && 
        (createdAt.seconds ? 
          // Format Firestore Timestamp
          (Date.now() - createdAt.seconds * 1000) < 120000 :
          // Format Date
          (Date.now() - new Date(createdAt).getTime()) < 120000
        );
      
      if (isNewEntity) {
        setShowNewBadge(true);
        // Masquer le badge après 5 secondes
        const timer = setTimeout(() => {
          setShowNewBadge(false);
        }, 5000);
        
        return () => clearTimeout(timer);
      }
      
      setPrevEntityId(entity.id);
    }
  }, [entity, prevEntityId]);
  
  if (!entity) return null;
  
  // Déterminer l'icône en fonction du type d'entité
  let entityIcon = 'bi-box';
  if (entityType === 'lieu') entityIcon = 'bi-geo-alt-fill';
  if (entityType === 'programmateur') entityIcon = 'bi-person-fill';
  if (entityType === 'artiste') entityIcon = 'bi-music-note-beamed';

  return (
    <div className={`${styles.entityCard} ${styles[`entityCard--${entityType}`]}`}>
      <div className={styles.entityHeader}>
        <div className={styles.entityTitle}>
          <div className={`${styles.entityIcon} ${styles[`entityIcon--${entityType}`]}`}>
            <i className={`bi ${entityIcon}`}></i>
          </div>
          <h4 className={styles.entityName}>
            {entity[primaryField]}
            {showNewBadge && (
              <span className={`${styles.newBadge} ${styles[`newBadge--${entityType}`]}`}>Nouveau</span>
            )}
          </h4>
        </div>
        
        <button
          type="button"
          className={styles.removeButton}
          onClick={() => {
            console.log('[SelectedEntityCard] Bouton remove activé pour', entityType, entity?.id || entity?.nom);
            onRemove();
          }}
          aria-label={`Supprimer ce ${entityType}`}
        >
          <i className="bi bi-x-lg"></i>
        </button>
      </div>
      
      <div className={styles.entityDetails}>
        {/* Afficher les champs secondaires configurables */}
        {secondaryFields.map((field, index) => {
          // Skip si la valeur est vide
          if (!field.value && field.value !== 0) return null;
          
          return (
            <div key={index} className={styles.detailRow}>
              {field.icon && (
                <i className={`bi ${field.icon} ${styles.detailIcon}`}></i>
              )}
              <span className={styles.detailContent}>
                {field.prefix}{field.value}{field.suffix}
              </span>
            </div>
          );
        })}
        
        {/* Afficher d'autres détails basés sur l'entité si secondaryFields est vide */}
        {secondaryFields.length === 0 && (
          <>
            {entityType === 'lieu' && entity.adresse && (
              <div className={styles.detailRow}>
                <i className="bi bi-geo-alt-fill"></i>
                <span>{entity.adresse}, {entity.codePostal} {entity.ville}</span>
              </div>
            )}
            
            {entityType === 'programmateur' && entity.structure && (
              <div className={styles.detailRow}>
                <i className="bi bi-building"></i>
                <span>{entity.structure}</span>
              </div>
            )}
            
            {entityType === 'programmateur' && entity.email && (
              <div className={styles.detailRow}>
                <i className="bi bi-envelope-fill"></i>
                <span>{entity.email}</span>
              </div>
            )}
            
            {entityType === 'artiste' && entity.genre && (
              <div className={styles.detailRow}>
                <i className="bi bi-music-note"></i>
                <span>{entity.genre}</span>
              </div>
            )}
          </>
        )}
        
        {/* Bouton pour éditer cette entité */}
        <div className={styles.entityActions}>
          <Button 
            type="button" 
            variant="outline-secondary"
            size="sm"
            className={styles.editButton}
            onClick={() => window.open(`/${entityType}s/${entity.id}`, '_blank')}
          >
            <i className="bi bi-pencil me-1"></i>
            Éditer {entityType === 'lieu' ? 'ce' : (entityType === 'programmateur' ? 'ce' : 'cet')} {entityType}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SelectedEntityCard;
