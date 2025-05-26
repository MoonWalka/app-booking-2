import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from 'react-bootstrap';
import Button from '@/components/ui/Button';
import styles from './LieuHeader.module.css';

/**
 * Type badge component for a venue
 */
const TypeBadge = ({ type }) => {
  if (!type) return null;
  
  let variant = 'secondary';
  
  switch (type.toLowerCase()) {
    case 'bar':
      variant = 'info';
      break;
    case 'festival':
      variant = 'danger';
      break;
    case 'salle':
      variant = 'success';
      break;
    case 'plateau':
      variant = 'warning';
      break;
    default:
      variant = 'secondary';
  }
  
  return <Badge bg={variant} className={styles.typeBadge}>{type}</Badge>;
};

/**
 * Header component for venue details
 * Adapté pour le nouveau système d'édition basé sur la navigation
 */
const LieuHeader = ({ 
  lieu, 
  isEditMode, 
  isSubmitting, 
  onEdit, 
  onSave, 
  onCancel, 
  onDelete,
  canSave = true,
  navigateToList
}) => {
  const navigate = useNavigate();

  const handleNavigateToList = () => {
    if (navigateToList) {
      navigateToList();
    } else {
      navigate('/lieux');
    }
  };

  return (
    <div className={styles.detailsHeaderContainer}>
      <div className={styles.titleContainer}>
        <div className={styles.breadcrumbContainer}>
          <span 
            className={styles.breadcrumbItem} 
            onClick={handleNavigateToList} 
            role="button" 
            tabIndex={0}
          >
            Lieux
          </span>
          <i className="bi bi-chevron-right"></i>
          <span className={`${styles.breadcrumbItem} ${styles.active}`}>
            {lieu?.nom || 'Lieu'}
            {isEditMode && ' (Édition)'}
          </span>
        </div>
        <h2 className={styles.modernTitle}>
          {lieu?.nom || 'Lieu'}
          {lieu?.type && <TypeBadge type={lieu.type} />}
          {isEditMode && (
            <Badge bg="warning" className="ms-2">
              <i className="bi bi-pencil me-1"></i>
              Édition
            </Badge>
          )}
        </h2>
      </div>
      
      <div className={styles.actionButtons}>
        {isEditMode ? (
          <>
            <Button 
              onClick={onSave} 
              variant="success"
              className={styles.actionBtn}
              disabled={isSubmitting || !canSave}
              icon={<i className="bi bi-check-circle"></i>}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Enregistrement...
                </>
              ) : (
                'Enregistrer'
              )}
            </Button>
            
            <Button 
              onClick={onCancel} 
              variant="secondary"
              className={styles.actionBtn}
              disabled={isSubmitting}
              icon={<i className="bi bi-x-circle"></i>}
            >
              Annuler
            </Button>
            
            <Button 
              onClick={onDelete} 
              variant="danger"
              className={styles.actionBtn}
              disabled={isSubmitting}
              icon={<i className="bi bi-trash"></i>}
            >
              Supprimer
            </Button>
          </>
        ) : (
          <>
            <Button 
              onClick={handleNavigateToList} 
              variant="secondary"
              className={styles.actionBtn}
              icon={<i className="bi bi-arrow-left"></i>}
            >
              Retour
            </Button>
            
            <Button 
              onClick={onEdit} 
              variant="outline-primary"
              className={styles.actionBtn}
              icon={<i className="bi bi-pencil"></i>}
            >
              Modifier
            </Button>
            
            <Button 
              onClick={onDelete} 
              variant="outline-danger"
              className={styles.actionBtn}
              icon={<i className="bi bi-trash"></i>}
            >
              Supprimer
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export { LieuHeader, TypeBadge };