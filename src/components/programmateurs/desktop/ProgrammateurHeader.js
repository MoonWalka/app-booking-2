import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './ProgrammateurHeader.module.css';

const ProgrammateurHeader = ({ 
  programmateur, 
  isEditing, 
  setIsEditing,
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
          <span className={styles.breadcrumbItem}>{programmateur?.nom}</span>
        </div>
        <h2 className={styles.headerTitle}>
          {programmateur?.nom}
          {programmateur?.structure && <span className="badge bg-light text-dark ms-2 fs-6">{programmateur.structure}</span>}
        </h2>
      </div>
      
      <div className={styles.headerActions}>
        {isEditing ? (
          <>
            {/* Buttons in edit mode */}
            <button 
              onClick={handleSubmit} 
              className="btn btn-primary d-flex align-items-center"
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
            </button>
            
            <button 
              onClick={() => setIsEditing(false)} 
              className="btn btn-outline-secondary d-flex align-items-center"
            >
              <i className="bi bi-x-circle me-2"></i>
              <span>Annuler</span>
            </button>
            
            <button 
              onClick={handleDelete} 
              className="btn btn-outline-danger d-flex align-items-center"
            >
              <i className="bi bi-trash me-2"></i>
              <span>Supprimer</span>
            </button>
          </>
        ) : (
          <>
            {/* Buttons in view mode */}
            <Link to="/programmateurs" className="btn btn-outline-secondary d-flex align-items-center">
              <i className="bi bi-arrow-left me-2"></i>
              <span>Retour</span>
            </Link>
            
            <button 
              onClick={() => setIsEditing(true)} 
              className="btn btn-outline-primary d-flex align-items-center"
            >
              <i className="bi bi-pencil me-2"></i>
              <span>Modifier</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProgrammateurHeader;
