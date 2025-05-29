import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ConcertHeader.module.css';
import Button from '@/components/ui/Button';

/**
 * Composant d'en-tête pour la page de détails d'un concert
 * Affiche le titre, le fil d'Ariane et les boutons d'action
 * Adapté de la maquette concertdetail.md
 */
const ConcertHeader = ({ 
  concert, 
  onEdit, 
  onDelete, 
  isEditMode, 
  onSave, 
  onCancel, 
  isSubmitting, 
  canSave, 
  formatDate,
  navigateToList
}) => {
  const navigate = useNavigate();

  return (
    <div className="details-header-container">
      <div className="title-container">
        {/* Breadcrumb navigation - adapté de la maquette */}
        <div className="breadcrumb-container">
          <i className="bi bi-house"></i>
          <span 
            onClick={() => navigate('/dashboard')} 
            style={{ cursor: 'pointer' }}
          >
            Accueil
          </span>
          <i className="bi bi-chevron-right"></i>
          <span 
            onClick={() => navigate('/concerts')} 
            style={{ cursor: 'pointer' }}
          >
            Concerts
          </span>
          <i className="bi bi-chevron-right"></i>
          <span className="text-muted">
            {concert?.titre || `Concert du ${formatDate(concert?.date)}`}
          </span>
        </div>
        
        {/* Titre principal - adapté de la maquette */}
        <h1 className="modern-title">
          {concert?.titre || `Concert du ${formatDate(concert?.date)}`}
        </h1>
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
            
            <button 
              onClick={onCancel} 
              className="tc-btn tc-btn-outline-secondary"
            >
              <i className="bi bi-x-circle"></i>
              <span>Annuler</span>
            </button>
            
            <button 
              onClick={onDelete} 
              className="tc-btn tc-btn-outline-danger"
            >
              <i className="bi bi-trash"></i>
              <span>Supprimer</span>
            </button>
          </>
        ) : (
          <>
            {/* Boutons en mode affichage - selon la maquette */}
            <button 
              onClick={navigateToList || (() => navigate('/concerts'))} 
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

export default ConcertHeader;