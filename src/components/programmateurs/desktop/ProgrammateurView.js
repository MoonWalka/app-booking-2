// src/components/programmateurs/desktop/ProgrammateurView.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProgrammateurHeader } from './sections/ProgrammateurHeader';
import ProgrammateurContactSection from './ProgrammateurContactSection';
import ProgrammateurConcertsSection from './ProgrammateurConcertsSection';
import ProgrammateurStructuresSection from './ProgrammateurStructuresSection';
import ProgrammateurLieuxSection from './ProgrammateurLieuxSection';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import styles from './ProgrammateurDetails.module.css';

/**
 * Composant d'affichage des détails d'un programmateur - Version Desktop
 * Adapté du style maquette concert details
 */
const ProgrammateurView = ({
  programmateur,
  structure,
  lieux,
  concerts,
  loading,
  loadingStructure,
  loadingLieux,
  loadingConcerts,
  error,
  handleDelete,
  formatValue
}) => {
  const navigate = useNavigate();
  
  console.log('[TRACE-UNIQUE][ProgrammateurView] loading:', loading);
  console.log('[TRACE-UNIQUE][ProgrammateurView] error:', error);
  console.log('[TRACE-UNIQUE][ProgrammateurView] programmateur:', programmateur);
  console.log('[TRACE-UNIQUE][ProgrammateurView] structure:', structure);
  
  // État local pour contrôler l'affichage des sections
  const [sections, setSections] = useState({
    contactVisible: true,
    structureVisible: true,
    lieuxVisible: true,
    concertsVisible: true
  });
  
  // Gestion du toggle des sections
  const toggleSection = (sectionName) => {
    setSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };
  
  if (loading) {
    return <LoadingSpinner message="Chargement du programmateur..." />;
  }
  
  if (error) {
    console.log('[TRACE-UNIQUE][ProgrammateurView] Affichage de l\'erreur:', error);
    return <ErrorMessage message={error.message || error} />;
  }
  
  if (!programmateur) {
    console.log('[TRACE-UNIQUE][ProgrammateurView] Aucun programmateur trouvé');
    return <ErrorMessage message="Programmateur introuvable" />;
  }
  
  // Fonction pour rediriger vers la page d'édition
  const handleEditClick = () => {
    navigate(`/programmateurs/${programmateur.id}/edit`);
  };
  
  return (
    <div className={styles.programmateurDetails}>
      {/* Header avec ProgrammateurHeader en mode lecture */}
      <ProgrammateurHeader 
        programmateur={programmateur}
        isEditMode={false}
        isNewFromUrl={false}
        onEdit={handleEditClick}
        onSave={() => {}}
        onCancel={() => {}}
        onDelete={() => handleDelete(programmateur.id)}
        isSubmitting={false}
        canSave={false}
        navigateToList={() => navigate('/programmateurs')}
      />
      
      {/* Sections - style maquette concert details */}
      <div>
        {/* Section Contact - style maquette */}
        <div className="form-card">
          <div className="card-header">
            <i className="bi bi-person-vcard"></i>
            <h3>Informations de contact</h3>
            <div className="card-header-action">
              <button 
                className="tc-btn tc-btn-outline-secondary tc-btn-sm" 
                onClick={() => toggleSection('contactVisible')}
              >
                {sections.contactVisible ? (
                  <i className="bi bi-chevron-up"></i>
                ) : (
                  <i className="bi bi-chevron-down"></i>
                )}
              </button>
            </div>
          </div>
          
          {sections.contactVisible && (
            <div className="card-body">
              <ProgrammateurContactSection
                programmateur={programmateur}
                isEditing={false}
                formatValue={formatValue}
                showCardWrapper={false}
              />
            </div>
          )}
        </div>
        
        {/* Section Structure - style maquette */}
        <div className="form-card">
          <div className="card-header">
            <i className="bi bi-building"></i>
            <h3>Structure</h3>
            <div className="card-header-action">
              <button 
                className="tc-btn tc-btn-outline-secondary tc-btn-sm" 
                onClick={() => toggleSection('structureVisible')}
              >
                {sections.structureVisible ? (
                  <i className="bi bi-chevron-up"></i>
                ) : (
                  <i className="bi bi-chevron-down"></i>
                )}
              </button>
            </div>
          </div>
          
          {sections.structureVisible && (
            <div className="card-body">
              <ProgrammateurStructuresSection 
                programmateur={programmateur}
                structure={structure}
                showCardWrapper={false}
              />
            </div>
          )}
        </div>
        
        {/* Section Lieux - style maquette */}
        <div className="form-card">
          <div className="card-header">
            <i className="bi bi-geo-alt"></i>
            <h3>Lieux associés</h3>
            <div className="card-header-action">
              <button 
                className="tc-btn tc-btn-outline-secondary tc-btn-sm" 
                onClick={() => toggleSection('lieuxVisible')}
              >
                {sections.lieuxVisible ? (
                  <i className="bi bi-chevron-up"></i>
                ) : (
                  <i className="bi bi-chevron-down"></i>
                )}
              </button>
            </div>
          </div>
          
          {sections.lieuxVisible && (
            <div className="card-body">
              <ProgrammateurLieuxSection
                programmateur={programmateur}
                lieux={lieux}
                isEditing={false}
                showCardWrapper={false}
              />
            </div>
          )}
        </div>

        {/* Section Concerts - style maquette */}
        <div className="form-card">
          <div className="card-header">
            <i className="bi bi-calendar-event"></i>
            <h3>Concerts associés</h3>
            <div className="card-header-action">
              <button 
                className="tc-btn tc-btn-outline-secondary tc-btn-sm" 
                onClick={() => toggleSection('concertsVisible')}
              >
                {sections.concertsVisible ? (
                  <i className="bi bi-chevron-up"></i>
                ) : (
                  <i className="bi bi-chevron-down"></i>
                )}
              </button>
            </div>
          </div>
          
          {sections.concertsVisible && (
            <div className="card-body">
              <ProgrammateurConcertsSection
                concertsAssocies={concerts || []}
                isEditing={false}
                showCardWrapper={false}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgrammateurView;