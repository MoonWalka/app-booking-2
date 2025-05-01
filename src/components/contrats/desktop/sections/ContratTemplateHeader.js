import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ContratTemplateHeader.module.css';

/**
 * Composant d'en-tête pour l'éditeur de modèle de contrat
 */
const ContratTemplateHeader = ({ 
  template, 
  isModalContext, 
  previewMode, 
  showGuide, 
  onToggleGuide, 
  onTogglePreview, 
  onCancel, 
  onSave 
}) => {
  const navigate = useNavigate();

  // Pour le mode page complète (non modal)
  if (!isModalContext) {
    return (
      <div className={styles.editorHeader}>
        <div className={styles.breadcrumbContainer}>
          <span 
            className={styles.breadcrumbItem} 
            onClick={() => navigate('/parametres/contrats')} 
            role="button"
            tabIndex={0}
          >
            Modèles de contrats
          </span>
          <i className="bi bi-chevron-right"></i>
          <span className={styles.breadcrumbItemActive}>
            {template?.id ? template.name : 'Nouveau modèle'}
          </span>
        </div>
        
        <h2 className={styles.editorTitle}>
          {template?.id ? 'Modifier le modèle' : 'Créer un nouveau modèle'}
        </h2>
        
        <div className={styles.editorActions}>
          <button 
            className="btn btn-outline-info d-flex align-items-center gap-2"
            onClick={onToggleGuide}
          >
            <i className="bi bi-question-circle me-1"></i>
            {showGuide ? 'Masquer l\'aide' : 'Aide'}
          </button>
          
          <button 
            className="btn btn-outline-secondary d-flex align-items-center gap-2"
            onClick={onCancel}
          >
            <i className="bi bi-x-circle me-1"></i>
            Annuler
          </button>
          
          <button 
            className="btn btn-outline-primary d-flex align-items-center gap-2"
            onClick={onTogglePreview}
          >
            <i className={`bi bi-${previewMode ? 'pencil' : 'eye'} me-1`}></i>
            {previewMode ? 'Éditer' : 'Aperçu'}
          </button>
          
          <button 
            className="btn btn-primary d-flex align-items-center gap-2"
            onClick={onSave}
          >
            <i className="bi bi-check-circle me-1"></i>
            Enregistrer
          </button>
        </div>
      </div>
    );
  }
  
  // Pour le mode modal
  return (
    <div className={styles.modalHeader}>
      <h3 className={styles.modalTitle}>
        {template?.id ? 'Modifier le modèle' : 'Créer un nouveau modèle'}
      </h3>
      <div className={styles.modalActions}>
        <button 
          className="btn btn-sm btn-outline-info" 
          onClick={onToggleGuide}
        >
          <i className="bi bi-question-circle me-1"></i>
          {showGuide ? 'Masquer l\'aide' : 'Aide'}
        </button>
        <button 
          className={styles.modalClose} 
          onClick={onCancel}
        >
          <i className="bi bi-x-lg"></i>
        </button>
      </div>
    </div>
  );
};

export default ContratTemplateHeader;