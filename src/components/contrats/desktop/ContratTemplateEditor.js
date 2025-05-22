// components/contrats/desktop/ContratTemplateEditor.js
import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'react-quill/dist/quill.snow.css';
import styles from './ContratTemplateEditor.module.css';

// Import des hooks personnalisés
import { 
  useContratTemplateEditor, 
  useContratTemplatePreview 
} from '@/hooks/contrats';

// Import des sous-composants
import ContratTemplateHeader from './sections/ContratTemplateHeader';
import ContratTemplateInfoSection from './sections/ContratTemplateInfoSection';
import ContratTemplateTitleSection from './sections/ContratTemplateTitleSection';
import ContratTemplateBodySection from './sections/ContratTemplateBodySection';
import ContratTemplateSignatureSection from './sections/ContratTemplateSignatureSection';
import ContratTemplateHeaderSection from './sections/ContratTemplateHeaderSection';
import ContratTemplateFooterSection from './sections/ContratTemplateFooterSection';
import ContratTemplatePreview from './sections/ContratTemplatePreview';
import UserGuide from './sections/UserGuide';

const ContratTemplateEditor = ({ template, onSave, isModalContext, onClose }) => {
  console.log("============ CONTRAT TEMPLATE EDITOR CHARGÉ ============");
  console.log("Template reçu:", template);
  console.log("Est en contexte modal:", isModalContext);
  
  const navigate = useNavigate();
  
  // Références pour les éditeurs quill
  const bodyEditorRef = useRef();
  const headerEditorRef = useRef();
  const footerEditorRef = useRef();
  
  // Utiliser le hook personnalisé pour gérer l'état et la logique
  const editor = useContratTemplateEditor(template, onSave, isModalContext, onClose, navigate);
  
  // Préparer les données pour le prévisualiseur
  const previewData = {
    bodyContent: editor.bodyContent,
    headerContent: editor.headerContent,
    headerHeight: editor.headerHeight,
    headerBottomMargin: editor.headerBottomMargin,
    footerContent: editor.footerContent,
    footerHeight: editor.footerHeight,
    footerTopMargin: editor.footerTopMargin,
    titleTemplate: editor.titleTemplate,
    signatureTemplate: editor.signatureTemplate,
    logoUrl: editor.logoUrl
  };
  
  // Utiliser le hook de prévisualisation
  const preview = useContratTemplatePreview(previewData);

  useEffect(() => {
    console.log("🟢 ContratTemplateEditor monté avec template :", template);
    return () => console.log("🔴 ContratTemplateEditor démonté");
  }, []);

  return (
    <div className={styles.templateEditorContainer}>
      {/* En-tête avec boutons d'action */}
      {isModalContext ? (
        <div className={styles.tcModalHeader}>
          <h3 className={styles.modalTitle}>
            {template?.id ? 'Modifier le modèle' : 'Créer un nouveau modèle'}
          </h3>
          <div className={styles.modalActions}>
            <button
              className={styles.modalClose}
              onClick={onClose}
              aria-label="Fermer la modale"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
        </div>
      ) : (
        <ContratTemplateHeader 
          template={template}
          isModalContext={isModalContext}
          name={editor.name}
          showGuide={editor.showGuide}
          previewMode={editor.previewMode}
          setShowGuide={editor.setShowGuide}
          setPreviewMode={editor.setPreviewMode}
          handleCancel={editor.handleCancel}
          handleSave={editor.handleSave}
          navigate={navigate}
        />
      )}
      
      {/* Corps principal */}
      <div className={isModalContext ? styles.tcModalBody : ""}>
        {/* Contenu défilable */}
        <div className={isModalContext ? styles.tcModalScrollableContent : ""}>
          {/* Guide d'utilisation */}
          {editor.showGuide && <UserGuide setShowGuide={editor.setShowGuide} />}
          
          <div className={styles.editorContent}>
            {editor.previewMode ? (
              <ContratTemplatePreview 
                selectedTemplate={{
                  bodyContent: editor.bodyContent,
                  headerContent: editor.headerContent,
                  footerContent: editor.footerContent,
                  titleTemplate: editor.titleTemplate,
                  signatureTemplate: editor.signatureTemplate,
                  logoUrl: editor.logoUrl
                }}
              />
            ) : (
              <>
                {/* Informations générales */}
                <ContratTemplateInfoSection
                  name={editor.name}
                  setName={editor.setName}
                  templateType={editor.templateType}
                  setTemplateType={editor.setTemplateType}
                  isDefault={editor.isDefault}
                  setIsDefault={editor.setIsDefault}
                  templateTypes={editor.templateTypes}
                />
                
                {/* Titre du document */}
                <ContratTemplateTitleSection
                  titleTemplate={editor.titleTemplate}
                  setTitleTemplate={editor.setTitleTemplate}
                  titleCollapsed={editor.titleCollapsed}
                  toggleCollapse={editor.toggleCollapse}
                />
                
                {/* Corps du contrat */}
                <ContratTemplateBodySection
                  bodyContent={editor.bodyContent}
                  setBodyContent={editor.setBodyContent}
                  bodyVarsOpen={editor.bodyVarsOpen}
                  bodyVariables={editor.bodyVariables}
                  bodyVarsRef={editor.bodyVarsRef}
                  toggleVariablesMenu={editor.toggleVariablesMenu}
                  insertVariable={editor.insertVariable}
                  editorModules={editor.editorModules}
                  editorRef={bodyEditorRef}
                />
                
                {/* Zone de signature */}
                <ContratTemplateSignatureSection
                  signatureTemplate={editor.signatureTemplate}
                  setSignatureTemplate={editor.setSignatureTemplate}
                  signatureCollapsed={editor.signatureCollapsed}
                  toggleCollapse={editor.toggleCollapse}
                  signatureVarsOpen={editor.signatureVarsOpen}
                  signatureVariables={editor.signatureVariables}
                  signatureVarsRef={editor.signatureVarsRef}
                  toggleVariablesMenu={editor.toggleVariablesMenu}
                  insertVariable={editor.insertVariable}
                />
                
                {/* En-tête du contrat */}
                <ContratTemplateHeaderSection
                  headerHeight={editor.headerHeight}
                  setHeaderHeight={editor.setHeaderHeight}
                  headerBottomMargin={editor.headerBottomMargin}
                  setHeaderBottomMargin={editor.setHeaderBottomMargin}
                  logoUrl={editor.logoUrl}
                  handleLogoUpload={editor.handleLogoUpload}
                  handleRemoveLogo={editor.handleRemoveLogo}
                  headerContent={editor.headerContent}
                  setHeaderContent={editor.setHeaderContent}
                  headerCollapsed={editor.headerCollapsed}
                  toggleCollapse={editor.toggleCollapse}
                  headerVarsOpen={editor.headerVarsOpen}
                  headerFooterVariables={editor.headerFooterVariables}
                  headerVarsRef={editor.headerVarsRef}
                  toggleVariablesMenu={editor.toggleVariablesMenu}
                  insertVariable={editor.insertVariable}
                  editorModules={editor.editorModules}
                  editorRef={headerEditorRef}
                />
                
                {/* Pied de page du contrat */}
                <ContratTemplateFooterSection
                  footerHeight={editor.footerHeight}
                  setFooterHeight={editor.setFooterHeight}
                  footerTopMargin={editor.footerTopMargin}
                  setFooterTopMargin={editor.setFooterTopMargin}
                  footerContent={editor.footerContent}
                  setFooterContent={editor.setFooterContent}
                  footerCollapsed={editor.footerCollapsed}
                  toggleCollapse={editor.toggleCollapse}
                  footerVarsOpen={editor.footerVarsOpen}
                  headerFooterVariables={editor.headerFooterVariables}
                  footerVarsRef={editor.footerVarsRef}
                  toggleVariablesMenu={editor.toggleVariablesMenu}
                  insertVariable={editor.insertVariable}
                  editorModules={editor.editorModules}
                  editorRef={footerEditorRef}
                />
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Pied de page en mode modal */}
      {isModalContext && (
        <div className={styles.tcModalFooter}>
          <div className={styles.modalFooter}>
            <button 
              className="btn btn-outline-secondary" 
              onClick={onClose}
            >
              <i className="bi bi-x-circle me-2"></i>Annuler
            </button>
            <button 
              className="btn btn-outline-primary" 
              onClick={() => editor.setPreviewMode(!editor.previewMode)}
            >
              <i className={`bi bi-${editor.previewMode ? 'pencil' : 'eye'} me-2`}></i>
              {editor.previewMode ? 'Éditer' : 'Aperçu'}
            </button>
            <button 
              className="btn btn-primary" 
              onClick={editor.handleSave}
            >
              <i className="bi bi-check-circle me-2"></i>Enregistrer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContratTemplateEditor;
