import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from 'react-bootstrap';
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
 */
const LieuHeader = ({ 
  lieu, 
  isEditing, 
  isSubmitting, 
  onEdit, 
  onSave, 
  onCancel, 
  onDelete 
}) => {
  const navigate = useNavigate();

  return (
    <div className={styles.detailsHeaderContainer}>
      <div className={styles.titleContainer}>
        <div className={styles.breadcrumbContainer}>
          <span 
            className={styles.breadcrumbItem} 
            onClick={() => navigate('/lieux')} 
            role="button" 
            tabIndex={0}
          >
            Lieux
          </span>
          <i className="bi bi-chevron-right"></i>
          <span className={`${styles.breadcrumbItem} ${styles.active}`}>{lieu.nom}</span>
        </div>
        <h2 className={styles.modernTitle}>
          {lieu.nom}
          {lieu.type && <TypeBadge type={lieu.type} />}
        </h2>
      </div>
      
      <div className={styles.actionButtons}>
        {isEditing ? (
          <>
            <button 
              onClick={onSave} 
              className={`btn btn-success ${styles.actionBtn}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  <span className="btn-text">Enregistrement...</span>
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle"></i>
                  <span className="btn-text">Enregistrer</span>
                </>
              )}
            </button>
            
            <button 
              onClick={onCancel} 
              className={`btn btn-danger ${styles.actionBtn}`}
              disabled={isSubmitting}
            >
              <i className="bi bi-x-circle"></i>
              <span className="btn-text">Annuler</span>
            </button>
            
            <button 
              onClick={onDelete} 
              className={`btn btn-danger ${styles.actionBtn}`}
              disabled={isSubmitting}
            >
              <i className="bi bi-trash"></i>
              <span className="btn-text">Supprimer</span>
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={() => navigate('/lieux')} 
              className={`btn btn-secondary ${styles.actionBtn}`}
            >
              <i className="bi bi-arrow-left"></i>
              <span className="btn-text">Retour</span>
            </button>
            
            <button 
              onClick={onEdit} 
              className={`btn btn-outline-primary ${styles.actionBtn}`}
            >
              <i className="bi bi-pencil"></i>
              <span className="btn-text">Modifier</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export { LieuHeader, TypeBadge };