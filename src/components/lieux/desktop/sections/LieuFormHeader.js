import React from 'react';
import { Badge } from 'react-bootstrap';
import Button from '@/components/ui/Button';
import styles from './LieuFormHeader.module.css';

const LieuFormHeader = ({ id, lieuNom, navigate, lieu, isSubmitting, onSave, onDelete, canSave = true }) => {
  const isNewLieu = id === 'nouveau';
  const title = isNewLieu ? 'Nouveau lieu' : (lieuNom || 'Lieu');

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
          <span className={`${styles.breadcrumbItem} ${styles.active}`}>
            {isNewLieu ? 'Nouveau' : title}
          </span>
        </div>
        <h2 className={styles.modernTitle}>
          {title}
          {lieu?.type && (
            <Badge bg="secondary" className={styles.typeBadge}>
              {lieu.type}
            </Badge>
          )}
        </h2>
      </div>
      
      <div className={styles.actionButtons}>
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
            isNewLieu ? 'Créer' : 'Enregistrer'
          )}
        </Button>
        
        {!isNewLieu && onDelete && (
          <Button 
            onClick={onDelete} 
            variant="danger"
            className={styles.actionBtn}
            disabled={isSubmitting}
            icon={<i className="bi bi-trash"></i>}
          >
            Supprimer
          </Button>
        )}
        
        <Button 
          onClick={() => navigate(isNewLieu ? '/lieux' : `/lieux/${id}`)} 
          variant="secondary"
          className={styles.actionBtn}
          disabled={isSubmitting}
          icon={<i className="bi bi-x-circle"></i>}
        >
          Annuler
        </Button>
      </div>
    </div>
  );
};

export default LieuFormHeader;
