// src/components/contrats/desktop/sections/ContratGenerationActions.js
import React, { useState } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { useNavigate } from 'react-router-dom';
import Button from '@ui/Button';
import Alert from '@ui/Alert';
import styles from './ContratGenerationActions.module.css';
import ContratPDFWrapper from '@/components/pdf/ContratPDFWrapper.js';

const ContratGenerationActions = ({
  validateDataBeforeGeneration,
  selectedTemplate,
  contratId,
  concert,
  programmateur,
  artiste,
  lieu,
  entrepriseInfo,
  pdfUrl,
  setPdfUrl,
  saveGeneratedContract,
  showSuccess,
  prepareContractVariables
}) => {
  const navigate = useNavigate();
  const [showPreview, setShowPreview] = useState(false);
  const [editableContent, setEditableContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [readyToGenerate, setReadyToGenerate] = useState(false);
  
  const isValid = validateDataBeforeGeneration();

  // Fonction pour remplacer les variables dans le template
  const replaceVariables = (content, variables) => {
    if (!content) return '';
    
    let processedContent = content;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\[${key}\\]`, 'g');
      processedContent = processedContent.replace(regex, value || '');
    });
    return processedContent;
  };

  // Générer l'aperçu HTML
  const handleGeneratePreview = () => {
    if (!isValid) return;
    
    const variables = prepareContractVariables ? prepareContractVariables() : {};
    
    // Combiner tous les contenus du template
    let fullContent = '';
    
    if (selectedTemplate.headerContent) {
      fullContent += `<div class="contract-header">${selectedTemplate.headerContent}</div>`;
    }
    
    if (selectedTemplate.titleTemplate) {
      fullContent += `<h1 class="contract-title">${selectedTemplate.titleTemplate}</h1>`;
    }
    
    if (selectedTemplate.dateTemplate) {
      fullContent += `<div class="contract-date">${selectedTemplate.dateTemplate}</div>`;
    }
    
    fullContent += `<div class="contract-body">${selectedTemplate.bodyContent}</div>`;
    
    if (selectedTemplate.signatureTemplate) {
      fullContent += `<div class="contract-signature">${selectedTemplate.signatureTemplate}</div>`;
    }
    
    if (selectedTemplate.footerContent) {
      fullContent += `<div class="contract-footer">${selectedTemplate.footerContent}</div>`;
    }
    
    // Remplacer toutes les variables
    const processedContent = replaceVariables(fullContent, variables);
    setEditableContent(processedContent);
    setShowPreview(true);
  };

  // Activer/désactiver le mode édition
  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  // Préparer pour la génération finale
  const handlePrepareGeneration = () => {
    setReadyToGenerate(true);
  };

  return (
    <div className={styles.actionsContainer}>
      {contratId && (
        <Alert variant="info">
          Un contrat a déjà été généré pour ce concert. Vous pouvez le régénérer avec un nouveau modèle.
        </Alert>
      )}
      
      {/* Étape 1: Générer l'aperçu */}
      {!showPreview && (
        <div className={styles.buttonsContainer}>
          {isValid ? (
            <Button 
              variant="primary"
              onClick={handleGeneratePreview}
            >
              <i className="bi bi-eye me-2"></i>
              Générer l'aperçu
            </Button>
          ) : (
            <Button variant="warning" disabled>
              <i className="bi bi-exclamation-triangle me-2"></i>
              Sélectionnez un modèle pour continuer
            </Button>
          )}
        </div>
      )}

      {/* Étape 2: Aperçu et édition */}
      {showPreview && !readyToGenerate && (
        <div className={styles.previewContainer}>
          <div className={styles.previewHeader}>
            <h5>Aperçu du contrat</h5>
            <div className={styles.previewActions}>
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={toggleEdit}
              >
                <i className={`bi ${isEditing ? 'bi-check' : 'bi-pencil'} me-2`}></i>
                {isEditing ? 'Valider les modifications' : 'Modifier'}
              </Button>
            </div>
          </div>
          
          <div className={styles.previewContent}>
            {isEditing ? (
              <div 
                className={styles.editableContent}
                contentEditable
                dangerouslySetInnerHTML={{ __html: editableContent }}
                onBlur={(e) => setEditableContent(e.currentTarget.innerHTML)}
                suppressContentEditableWarning={true}
              />
            ) : (
              <div 
                className={styles.previewHtml}
                dangerouslySetInnerHTML={{ __html: editableContent }}
              />
            )}
          </div>

          <div className={styles.previewFooter}>
            <Button 
              variant="outline-secondary"
              onClick={() => {
                setShowPreview(false);
                setIsEditing(false);
              }}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Retour au choix du modèle
            </Button>
            
            <Button 
              variant="success"
              onClick={handlePrepareGeneration}
              disabled={isEditing}
            >
              <i className="bi bi-check-circle me-2"></i>
              Valider et générer le PDF
            </Button>
          </div>
        </div>
      )}

      {/* Étape 3: Génération du PDF */}
      {readyToGenerate && (
        <div className={styles.buttonsContainer}>
          <PDFDownloadLink
            document={
              <ContratPDFWrapper 
                template={selectedTemplate}
                contratData={contratId ? { templateSnapshot: selectedTemplate } : null}
                concertData={concert}
                programmateurData={programmateur}
                artisteData={artiste}
                lieuData={lieu}
                entrepriseInfo={entrepriseInfo}
                editedContent={editableContent}
              />
            }
            fileName={`Contrat_${concert.titre || 'Concert'}.pdf`}
            className={styles.pdfDownloadButton}
          >
            {({ blob, url, loading, error }) => {
              if (error) {
                console.error("Erreur lors de la génération du PDF:", error);
                return (
                  <Button variant="danger" disabled>
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    Erreur de génération
                  </Button>
                );
              }
              
              if (loading) {
                return (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Génération du PDF en cours...
                  </>
                );
              }
              
              // Une fois que le PDF est prêt, sauvegarder l'URL
              if (url && url !== pdfUrl) {
                setPdfUrl(url);
                saveGeneratedContract(url)
                  .then(id => {
                    console.log(`Contrat sauvegardé avec l'ID: ${id}`);
                    showSuccess();
                    
                    // Rediriger automatiquement vers la page du contrat après un court délai
                    setTimeout(() => {
                      navigate(`/contrats/${id}`);
                    }, 1500);
                  })
                  .catch(err => {
                    console.error('Erreur de sauvegarde:', err);
                  });
              }
              
              return (
                <>
                  <i className="bi bi-file-pdf me-2"></i>
                  PDF généré avec succès !
                </>
              );
            }}
          </PDFDownloadLink>
        </div>
      )}
    </div>
  );
};

export default ContratGenerationActions;