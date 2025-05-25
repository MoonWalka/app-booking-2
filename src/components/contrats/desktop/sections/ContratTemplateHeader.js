import React from 'react';
import { useNavigate } from 'react-router-dom';
import FlexContainer from '@/components/ui/FlexContainer';
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
            className="tc-btn tc-btn-outline-info"
            onClick={onToggleGuide}
          >
            <FlexContainer align="center" gap="sm" inline>
              <i className="bi bi-question-circle me-1"></i>
              {showGuide ? 'Masquer l\'aide' : 'Aide'}
            </FlexContainer>
          </button>
          
          <button 
            className="tc-btn tc-btn-outline-secondary"
            onClick={onCancel}
          >
            <FlexContainer align="center" gap="sm" inline>
              <i className="bi bi-x-circle me-1"></i>
              Annuler
            </FlexContainer>
          </button>
          
          <button 
            className="tc-btn tc-btn-outline-primary"
            onClick={onTogglePreview}
          >
            <FlexContainer align="center" gap="sm" inline>
              <i className={`bi bi-${previewMode ? 'pencil' : 'eye'} me-1`}></i>
              {previewMode ? 'Éditer' : 'Aperçu'}
            </FlexContainer>
          </button>
          
          <button 
            className="tc-btn tc-btn-primary"
            onClick={onSave}
          >
            <FlexContainer align="center" gap="sm" inline>
              <i className="bi bi-check-circle me-1"></i>
              Enregistrer
            </FlexContainer>
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
          className="tc-btn tc-btn-sm tc-btn-outline-info" 
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