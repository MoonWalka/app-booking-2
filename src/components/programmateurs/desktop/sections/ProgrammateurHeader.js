import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * ProgrammateurHeader - En-tête du programmateur
 * Adapté du style maquette concert details (sans breadcrumb)
 */
export const ProgrammateurHeader = ({
  programmateur,
  isEditMode,
  isNewFromUrl,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  isSubmitting,
  canSave,
  navigateToList
}) => {
  const navigate = useNavigate();

  const getTitle = () => {
    if (isNewFromUrl) {
      return 'Nouveau programmateur';
    }
    
    if (programmateur?.nom && programmateur?.prenom) {
      return `${programmateur.prenom} ${programmateur.nom}`;
    }
    
    return 'Programmateur';
  };

  const getSubtitle = () => {
    if (programmateur?.fonction) {
      return programmateur.fonction;
    }
    return null;
  };

  return (
    <div className="details-header-container">
      <div className="title-container">
        {/* Titre principal - adapté de la maquette */}
        <h1 className="modern-title">
          {getTitle()}
        </h1>
        {getSubtitle() && (
          <p style={{ 
            color: 'var(--tc-text-secondary)', 
            fontSize: 'var(--tc-font-size-lg)',
            margin: 0,
            marginTop: 'var(--tc-space-1)'
          }}>
            {getSubtitle()}
          </p>
        )}
      </div>

      {/* Boutons d'action - adapté de la maquette */}
      <div className="action-buttons">
        {isEditMode ? (
          <>
            {/* Boutons en mode édition */}
            <button
              type="button"
              className="tc-btn tc-btn-primary"
              onClick={onSave}
              disabled={isSubmitting || !canSave}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle"></i>
                  <span>Enregistrer</span>
                </>
              )}
            </button>

            {/* Bouton Supprimer (seulement si ce n'est pas un nouveau programmateur) */}
            {!isNewFromUrl && (
              <button
                className="tc-btn tc-btn-outline-danger"
                onClick={onDelete}
                disabled={isSubmitting}
              >
                <i className="bi bi-trash"></i>
                <span>Supprimer</span>
              </button>
            )}

            <button
              className="tc-btn tc-btn-outline-secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              <i className="bi bi-x-circle"></i>
              <span>Annuler</span>
            </button>
          </>
        ) : (
          <>
            {/* Boutons en mode lecture - selon la maquette */}
            <button 
              onClick={navigateToList || (() => navigate('/programmateurs'))} 
              className="tc-btn tc-btn-outline-secondary"
            >
              <i className="bi bi-arrow-left"></i>
              <span>Retour</span>
            </button>

            <button
              onClick={onEdit}
              className="tc-btn tc-btn-outline-primary"
            >
              <i className="bi bi-pencil"></i>
              <span>Modifier</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}; 