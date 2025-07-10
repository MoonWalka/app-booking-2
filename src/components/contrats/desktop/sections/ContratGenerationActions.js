// src/components/contrats/desktop/sections/ContratGenerationActions.js
import React, { useState, useEffect } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { useNavigate } from 'react-router-dom';
import Button from '@ui/Button';
import Alert from '@ui/Alert';
import styles from './ContratGenerationActions.module.css';
import ContratPDFWrapper from '@/components/pdf/ContratPDFWrapper.js';
import DownloadModal from '@/components/common/DownloadModal';

const ContratGenerationActions = ({
  validateDataBeforeGeneration,
  selectedTemplate,
  contratId,
  date,
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
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  const isValid = validateDataBeforeGeneration();

  // Effect pour gérer l'affichage de la modal de téléchargement
  useEffect(() => {
    if (isGeneratingPdf) {
      setShowDownloadModal(true);
    } else {
      // Attendre un délai avant de fermer la modal pour que l'utilisateur voie la réussite
      const timer = setTimeout(() => {
        setShowDownloadModal(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isGeneratingPdf]);

  // Fonction pour remplacer les variables dans le template
  const replaceVariables = (content, variables) => {
    if (!content) return '';
    
    console.log('🔄 Remplacement des variables:', {
      contentLength: content.length,
      variablesCount: Object.keys(variables).length,
      sampleVariables: Object.entries(variables).slice(0, 5)
    });
    
    let processedContent = content;
    let replacementCount = 0;
    
    Object.entries(variables).forEach(([key, value]) => {
      // Support des deux formats : {variable} et [variable]
      // D'abord essayer avec les accolades
      const regexCurly = new RegExp(`\\{${key}\\}`, 'g');
      const beforeCurly = processedContent.length;
      processedContent = processedContent.replace(regexCurly, value || '');
      
      if (beforeCurly !== processedContent.length) {
        replacementCount++;
        console.log(`✅ Remplacé {${key}} par "${value}"`);
      }
      
      // Ensuite essayer avec les crochets (pour compatibilité)
      const regexSquare = new RegExp(`\\[${key}\\]`, 'g');
      const beforeSquare = processedContent.length;
      processedContent = processedContent.replace(regexSquare, value || '');
      
      if (beforeSquare !== processedContent.length) {
        replacementCount++;
        console.log(`✅ Remplacé [${key}] par "${value}"`);
      }
    });
    
    console.log(`📊 Total remplacements: ${replacementCount}`);
    return processedContent;
  };

  // Générer l'aperçu HTML
  const handleGeneratePreview = () => {
    if (!isValid) return;
    
    const variables = prepareContractVariables ? prepareContractVariables() : {};
    console.log('📋 Variables préparées:', variables);
    
    // SYSTÈME UNIFIÉ - Utiliser uniquement bodyContent
    console.log('📄 Contenu brut du template:', {
      bodyContentSample: selectedTemplate.bodyContent?.substring(0, 200),
      hasSquareBrackets: selectedTemplate.bodyContent?.includes('['),
      hasCurlyBraces: selectedTemplate.bodyContent?.includes('{')
    });
    
    // Utiliser uniquement le contenu unifié (bodyContent)
    const fullContent = selectedTemplate.bodyContent || '';
    
    // Remplacer toutes les variables
    const processedContent = replaceVariables(fullContent, variables);
    setEditableContent(processedContent);
    setShowPreview(true);
  };

  // Activer/désactiver le mode édition
  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  // Générer un nom de fichier propre pour le PDF
  const generateFileName = () => {
    const parts = [];
    
    // Date de la date au format YYYYMMDD
    if (date.date) {
      const dateObj = date.date.seconds 
        ? new Date(date.date.seconds * 1000) 
        : new Date(date.date);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      parts.push(`${year}${month}${day}`);
    }
    
    // Nom de l'artiste (nettoyé)
    if (artiste?.nom) {
      const artisteClean = artiste.nom
        .replace(/[^a-zA-Z0-9À-ÿ\s-]/g, '') // Garder lettres, chiffres, accents, espaces, tirets
        .replace(/\s+/g, '_') // Remplacer espaces par underscore
        .substring(0, 30); // Limiter la longueur
      parts.push(artisteClean);
    }
    
    // Lieu (nettoyé)
    if (lieu?.nom) {
      const lieuClean = lieu.nom
        .replace(/[^a-zA-Z0-9À-ÿ\s-]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 20);
      parts.push(lieuClean);
    }
    
    // Type de contrat
    if (selectedTemplate?.templateType) {
      parts.push(selectedTemplate.templateType);
    }
    
    // Si on n'a aucune info, utiliser un nom par défaut
    if (parts.length === 0) {
      return 'Contrat.pdf';
    }
    
    // Joindre avec des tirets et ajouter l'extension
    return `Contrat_${parts.join('-')}.pdf`;
  };

  // Préparer pour la génération finale
  const handlePrepareGeneration = () => {
    setReadyToGenerate(true);
  };

  return (
    <div className={styles.actionsContainer}>
      {contratId && (
        <Alert variant="info">
          Un contrat a déjà été généré pour cette date. Vous pouvez le régénérer avec un nouveau modèle.
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
                className={`${styles.previewHtml} tc-quill-editor-wrapper`}
              >
                <div 
                  className="ql-editor"
                  dangerouslySetInnerHTML={{ __html: editableContent }}
                />
              </div>
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
                dateData={date}
                programmateurData={programmateur}
                artisteData={artiste}
                lieuData={lieu}
                entrepriseInfo={entrepriseInfo}
                editedContent={editableContent}
              />
            }
            fileName={generateFileName()}
            className={styles.pdfDownloadButton}
          >
            {({ blob, url, loading, error }) => {
              // Mettre à jour l'état de génération
              if (loading !== isGeneratingPdf) {
                setIsGeneratingPdf(loading);
              }

              if (error) {
                console.error("Erreur lors de la génération du PDF:", error);
                setIsGeneratingPdf(false);
                return (
                  <Button variant="danger" disabled>
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    Erreur de génération
                  </Button>
                );
              }
              
              if (loading) {
                return (
                  <Button variant="primary" disabled>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Génération du PDF en cours...
                  </Button>
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

      {/* Modal de téléchargement */}
      <DownloadModal 
        show={showDownloadModal}
        title="Génération du contrat"
        message="Veuillez patienter pendant la génération et le téléchargement du contrat PDF..."
      />
    </div>
  );
};

export default ContratGenerationActions;