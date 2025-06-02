// src/components/programmateurs/desktop/ProgrammateurView.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/ui/Card';
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
  console.log('[TRACE-UNIQUE][ProgrammateurView] lieux:', lieux);
  console.log('[TRACE-UNIQUE][ProgrammateurView] concerts:', concerts);
  console.log('[TRACE-UNIQUE][ProgrammateurView] loadingStructure:', loadingStructure);
  console.log('[TRACE-UNIQUE][ProgrammateurView] loadingLieux:', loadingLieux);
  console.log('[TRACE-UNIQUE][ProgrammateurView] loadingConcerts:', loadingConcerts);
  
  // État local pour contrôler l'affichage des sections
  const [sections, setSections] = useState({
    contactVisible: true,
    structureVisible: true,
    lieuxVisible: true,
    concertsVisible: true
  });
  
  // Gestion du toggle des sections - Commenté car non utilisé actuellement
  // const toggleSection = (sectionName) => {
  //   setSections(prev => ({
  //     ...prev,
  //     [sectionName]: !prev[sectionName]
  //   }));
  // };
  
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
        <Card
          title="Informations de contact"
          icon={<i className="bi bi-person-vcard"></i>}
          headerClassName="programmateur"
          collapsible={true}
          defaultCollapsed={!sections.contactVisible}
          onCollapseToggle={(collapsed) => setSections(prev => ({...prev, contactVisible: !collapsed}))}
        >
          <ProgrammateurContactSection
            programmateur={programmateur}
            isEditing={false}
            formatValue={formatValue}
            showCardWrapper={false}
          />
        </Card>
        
        {/* Section Structure - style maquette */}
        <Card
          title="Structure"
          icon={<i className="bi bi-building"></i>}
          headerClassName="programmateur"
          collapsible={true}
          defaultCollapsed={!sections.structureVisible}
          onCollapseToggle={(collapsed) => setSections(prev => ({...prev, structureVisible: !collapsed}))}
        >
          <ProgrammateurStructuresSection 
            programmateur={programmateur}
            structure={structure}
            showCardWrapper={false}
          />
        </Card>
        
        {/* Section Lieux - style maquette */}
        <Card
          title="Lieux associés"
          icon={<i className="bi bi-geo-alt"></i>}
          headerClassName="lieu"
          collapsible={true}
          defaultCollapsed={!sections.lieuxVisible}
          onCollapseToggle={(collapsed) => setSections(prev => ({...prev, lieuxVisible: !collapsed}))}
        >
          <ProgrammateurLieuxSection
            programmateur={programmateur}
            lieux={lieux}
            isEditing={false}
            showCardWrapper={false}
          />
        </Card>

        {/* Section Concerts - style maquette */}
        <Card
          title="Concerts associés"
          icon={<i className="bi bi-calendar-event"></i>}
          headerClassName="info"
          collapsible={true}
          defaultCollapsed={!sections.concertsVisible}
          onCollapseToggle={(collapsed) => setSections(prev => ({...prev, concertsVisible: !collapsed}))}
        >
          <ProgrammateurConcertsSection
            concertsAssocies={concerts || []}
            isEditing={false}
            showCardWrapper={false}
          />
        </Card>
      </div>
    </div>
  );
};

export default ProgrammateurView;