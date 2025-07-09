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

const ContratGenerator = ({ date, contact, artiste, lieu }) => {
  // Support rétrocompatibilité pour l'ancien paramètre 'programmateur'
  const programmateur = contact;
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
    setPdfUrl,
    prepareContractVariables
  } = useContratGenerator(date, contact, artiste, lieu);

  if (loading) {
    return <ContratLoadingSpinner />;
  }

  if (templates.length === 0) {
    return (
      <Card className={`mb-4 ${styles.generatorSection}`}>
        <ContratNoTemplates />
      </Card>
    );
  }

  return (
    <div className={styles.contratGeneratorContainer}>
      <Card 
        className={`mb-4 ${styles.generatorSection}`}
        title="Génération de contrat"
      >
        {/* Affichage des alertes d'erreur/succès */}
        <div className={styles.sectionSpacer}>
          <ContratAlerts 
            showErrorAlert={showErrorAlert}
            errorMessage={errorMessage}
            showSuccessAlert={showSuccessAlert}
            resetAlerts={resetAlerts}
          />
        </div>
        
        {/* Sélecteur de modèle de contrat */}
        <div className={styles.sectionSpacer}>
          <ContratTemplateSelector 
            templates={templates}
            selectedTemplateId={selectedTemplateId}
            handleTemplateChange={handleTemplateChange}
            disabled={generatingPdf}
          />
        </div>
        
        {/* Aperçu du modèle sélectionné */}
        {selectedTemplate && (
          <>
            <div className={styles.sectionSpacer}>
              <ContratTemplatePreview selectedTemplate={selectedTemplate} />
            </div>
            
            {/* Actions pour générer le contrat */}
            <div className={styles.actionsContainer}>
              <ContratGenerationActions 
                validateDataBeforeGeneration={validateDataBeforeGeneration}
                selectedTemplate={selectedTemplate}
                contratId={contratId}
                concert={date}
                programmateur={programmateur}
                artiste={artiste}
                lieu={lieu}
                entrepriseInfo={entrepriseInfo}
                pdfUrl={pdfUrl}
                setPdfUrl={setPdfUrl}
                saveGeneratedContract={saveGeneratedContract}
                showSuccess={showSuccess}
                prepareContractVariables={prepareContractVariables}
              />
            </div>
          </>
        )}
        
        {/* Panel de débogage */}
        <ContratDebugPanel 
          showDebugInfo={showDebugInfo}
          toggleDebugInfo={toggleDebugInfo}
          selectedTemplate={selectedTemplate}
          concert={date}
          programmateur={programmateur}
          artiste={artiste}
          lieu={lieu}
          entrepriseInfo={entrepriseInfo}
        />
      </Card>
    </div>
  );
};

export default ContratGenerator;
