// src/components/contrats/ContratGenerator.js
import React from 'react';
import Card from '@/components/ui/Card';
import styles from './ContratGenerator.module.css';
import '@styles/index.css';

// Custom hook
import { useContratGenerator } from '@/hooks/contrats';

// Section Components
import ContratTemplateSelector from './sections/ContratTemplateSelector';
import ContratTemplatePreview from './sections/ContratTemplatePreview';
import ContratGenerationActions from './sections/ContratGenerationActions';
import ContratAlerts from './sections/ContratAlerts';
import ContratDebugPanel from './sections/ContratDebugPanel';
import ContratLoadingSpinner from './sections/ContratLoadingSpinner';
import ContratNoTemplates from './sections/ContratNoTemplates';

const ContratGenerator = ({ concert, programmateur, artiste, lieu }) => {
  const {
    // États
    templates,
    selectedTemplateId,
    selectedTemplate,
    loading,
    generatingPdf,
    pdfUrl,
    entrepriseInfo,
    contratId,
    errorMessage,
    showErrorAlert,
    showSuccessAlert,
    showDebugInfo,
    
    // Fonctions
    validateDataBeforeGeneration,
    handleTemplateChange,
    saveGeneratedContract,
    toggleDebugInfo,
    resetAlerts,
    showSuccess,
    setPdfUrl
  } = useContratGenerator(concert, programmateur, artiste, lieu);

  if (loading) {
    return <ContratLoadingSpinner />;
  }

  if (templates.length === 0) {
    return (
      <Card className="mb-4">
        <ContratNoTemplates />
      </Card>
    );
  }

  return (
    <Card 
      className="mb-4"
      title="Génération de contrat"
    >
      {/* Affichage des alertes d'erreur/succès */}
      <ContratAlerts 
        showErrorAlert={showErrorAlert}
        errorMessage={errorMessage}
        showSuccessAlert={showSuccessAlert}
        resetAlerts={resetAlerts}
      />
      
      {/* Sélecteur de modèle de contrat */}
      <ContratTemplateSelector 
        templates={templates}
        selectedTemplateId={selectedTemplateId}
        handleTemplateChange={handleTemplateChange}
        disabled={generatingPdf}
      />
      
      {/* Aperçu du modèle sélectionné */}
      {selectedTemplate && (
        <>
          <ContratTemplatePreview selectedTemplate={selectedTemplate} />
          
          {/* Actions pour générer le contrat */}
          <ContratGenerationActions 
            validateDataBeforeGeneration={validateDataBeforeGeneration}
            selectedTemplate={selectedTemplate}
            contratId={contratId}
            concert={concert}
            programmateur={programmateur}
            artiste={artiste}
            lieu={lieu}
            entrepriseInfo={entrepriseInfo}
            pdfUrl={pdfUrl}
            setPdfUrl={setPdfUrl}
            saveGeneratedContract={saveGeneratedContract}
            showSuccess={showSuccess}
          />
        </>
      )}
      
      {/* Panel de débogage */}
      <ContratDebugPanel 
        showDebugInfo={showDebugInfo}
        toggleDebugInfo={toggleDebugInfo}
        selectedTemplate={selectedTemplate}
        concert={concert}
        programmateur={programmateur}
        artiste={artiste}
        lieu={lieu}
        entrepriseInfo={entrepriseInfo}
      />
    </Card>
  );
};

export default ContratGenerator;
