import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '@ui/Button';
import styles from './ProgrammateurHeader.module.css';

const ProgrammateurHeader = ({ 
  programmateur, 
  isEditing, 
  handleSubmit,
  handleDelete,
  isSubmitting,
  toggleEditMode
}) => {
  const navigate = useNavigate();

  return (
    <div className={styles.detailsHeaderContainer}>
      <div className={styles.titleContainer}>
        <div className={styles.breadcrumb}>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/programmateurs'); }} className={styles.breadcrumbItem}>Programmateurs</a>
          <i className={`bi bi-chevron-right ${styles.breadcrumbDivider}`}></i>
          <span className={styles.breadcrumbItem}>Détails</span>
        </div>
        <h2 className={styles.headerTitle}>
          Fiche Programmateur
          {/* Nom du programmateur supprimé car informations déjà présentes dans les fiches ci-dessous */}
        </h2>
      </div>
      
      <div className={styles.headerActions}>
        {isEditing ? (
          <>
            {/* Buttons in edit mode */}
            <Button 
              onClick={handleSubmit} 
              variant="primary"
              className="d-flex align-items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle me-2"></i>
                  <span>Enregistrer</span>
                </>
              )}
            </Button>
            
            <Button 
              onClick={toggleEditMode}
              variant="outline-secondary"
              className="d-flex align-items-center"
              title="Annuler les modifications (avec nettoyage intelligent)"
            >
              <i className="bi bi-x-circle me-2"></i>
              <span>Annuler</span>
            </Button>
            
            <Button 
              onClick={handleDelete} 
              variant="outline-danger"
              className="d-flex align-items-center"
            >
              <i className="bi bi-trash me-2"></i>
              <span>Supprimer</span>
            </Button>
          </>
        ) : (
          <>
            {/* Buttons in view mode */}
            <Button 
              onClick={() => navigate('/programmateurs')}
              variant="outline-secondary"
              className="d-flex align-items-center"
            >
              <i className="bi bi-arrow-left me-2"></i>
              <span>Retour</span>
            </Button>
            
            <Button 
              onClick={toggleEditMode}
              variant="outline-primary"
              className="d-flex align-items-center"
              title="Modifier (avec préparation intelligente du formulaire)"
            >
              <i className="bi bi-pencil me-2"></i>
              <span>Modifier</span>
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProgrammateurHeader;
