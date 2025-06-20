import React, { useEffect, useRef } from 'react';
import CollapsibleSection from './CollapsibleSection';
import Button from '@ui/Button';
import styles from './ContratTemplateHeaderSection.module.css';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { CompactToolbarModule } from '@/components/contrats/QuillPageBreakModule';

/**
 * Composant pour la configuration de l'en-tête du contrat
 */
const ContratTemplateHeaderSection = ({
  headerContent,
  setHeaderContent,
  headerHeight,
  setHeaderHeight,
  headerBottomMargin,
  setHeaderBottomMargin,
  logoUrl,
  handleLogoUpload,
  handleRemoveLogo,
  headerCollapsed,
  toggleCollapse,
  previewMode
}) => {
  const quillRef = useRef();

  useEffect(() => {
    if (!previewMode && quillRef.current) {
      const editor = quillRef.current.getEditor();
      if (editor && headerContent !== editor.root.innerHTML) {
        editor.root.innerHTML = headerContent || '';
      }
    }
  }, [previewMode, headerContent]);

  return (
    <CollapsibleSection
      title="En-tête du contrat"
      isCollapsed={headerCollapsed}
      toggleCollapse={() => toggleCollapse('header')}
    >
      <div className={styles.headerSectionContent}>
        <p className={styles.sectionInfo}>
          L'en-tête apparaîtra en haut de chaque page du contrat. 
          Vous pouvez y insérer votre logo et les informations de base.
        </p>
        
        <div className={styles.logoSection}>
          <label className={styles.sectionLabel}>Logo</label>
          
          {logoUrl ? (
            <div className={styles.logoPreviewContainer}>
              <img
                src={logoUrl}
                alt="Logo aperçu"
                className={styles.logoPreview}
              />
              <Button
                type="button"
                variant="outline-danger"
                size="sm"
                onClick={handleRemoveLogo}
              >
                <i className="bi bi-trash me-1"></i>
                Supprimer
              </Button>
            </div>
          ) : (
            <div className={styles.logoUpload}>
              <label htmlFor="logoUpload" className={styles.logoUploadLabel}>
                <i className="bi bi-cloud-arrow-up me-2"></i>
                Choisir un logo
              </label>
              <input
                type="file"
                id="logoUpload"
                className={styles.logoUploadInput}
                accept="image/*"
                onChange={handleLogoUpload}
              />
            </div>
          )}
        </div>
        
        <div className={styles.dimensionsContainer}>
          <div className={styles.dimensionField}>
            <label htmlFor="headerHeight">Hauteur de l'en-tête (mm)</label>
            <input
              type="number"
              id="headerHeight"
              min="10"
              max="50"
              className={styles.formField}
              value={headerHeight}
              onChange={(e) => setHeaderHeight(parseInt(e.target.value) || 0)}
            />
          </div>
          <div className={styles.dimensionField}>
            <label htmlFor="headerBottomMargin">Marge inférieure (mm)</label>
            <input
              type="number"
              id="headerBottomMargin"
              min="0"
              max="30"
              className={styles.formField}
              value={headerBottomMargin}
              onChange={(e) => setHeaderBottomMargin(parseInt(e.target.value) || 0)}
            />
          </div>
        </div>
        
        <div className={styles.editorContainer}>
          <div className={styles.editorHeader}>
            <label htmlFor="headerContent">Contenu de l'en-tête</label>
          </div>
          
          {/* Dans un cas réel, on utiliserait ReactQuill ici */}
          <ReactQuill
            ref={quillRef}
            key={previewMode ? 'preview' : 'edit'}
            id="headerContent"
            className={`${styles.headerContentInput} ${styles.reactQuillEditor}`}
            value={headerContent}
            onChange={setHeaderContent}
            modules={CompactToolbarModule}
            placeholder="Contenu de l'en-tête..."
            theme="snow"
          />
        </div>
      </div>
    </CollapsibleSection>
  );
};

export default ContratTemplateHeaderSection;