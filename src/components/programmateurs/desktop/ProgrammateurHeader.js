import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '@ui/Button';
import FlexContainer from '@/components/ui/FlexContainer';
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
              disabled={isSubmitting}
            >
              <FlexContainer align="center" inline>
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
              </FlexContainer>
            </Button>
            
            <Button 
              onClick={toggleEditMode}
              variant="outline-secondary"
              title="Annuler les modifications (avec nettoyage intelligent)"
            >
              <FlexContainer align="center" inline>
                <i className="bi bi-x-circle me-2"></i>
                <span>Annuler</span>
              </FlexContainer>
            </Button>
            
            <Button 
              onClick={handleDelete} 
              variant="outline-danger"
            >
              <FlexContainer align="center" inline>
                <i className="bi bi-trash me-2"></i>
                <span>Supprimer</span>
              </FlexContainer>
            </Button>
          </>
        ) : (
          <>
            {/* Buttons in view mode */}
            <Button 
              onClick={() => navigate('/programmateurs')}
              variant="outline-secondary"
            >
              <FlexContainer align="center" inline>
                <i className="bi bi-arrow-left me-2"></i>
                <span>Retour</span>
              </FlexContainer>
            </Button>
            
            <Button 
              onClick={toggleEditMode}
              variant="outline-primary"
              title="Modifier (avec préparation intelligente du formulaire)"
            >
              <FlexContainer align="center" inline>
                <i className="bi bi-pencil me-2"></i>
                <span>Modifier</span>
              </FlexContainer>
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProgrammateurHeader;
