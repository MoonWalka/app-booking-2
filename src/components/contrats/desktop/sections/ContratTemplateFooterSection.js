import React, { useEffect, useRef } from 'react';
import CollapsibleSection from './CollapsibleSection';
import styles from './ContratTemplateFooterSection.module.css';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { CompactToolbarModule } from '@/components/contrats/QuillPageBreakModule';

/**
 * Composant pour la configuration du pied de page du contrat
 */
const ContratTemplateFooterSection = ({
  footerContent,
  setFooterContent,
  footerHeight,
  setFooterHeight,
  footerTopMargin,
  setFooterTopMargin,
  footerCollapsed,
  toggleCollapse,
  previewMode
}) => {
  const quillRef = useRef();

  useEffect(() => {
    if (!previewMode && quillRef.current) {
      const editor = quillRef.current.getEditor();
      if (editor && footerContent !== editor.root.innerHTML) {
        editor.root.innerHTML = footerContent || '';
      }
    }
  }, [previewMode, footerContent]);

  return (
    <CollapsibleSection
      title="Pied de page du contrat"
      isCollapsed={footerCollapsed}
      toggleCollapse={() => toggleCollapse('footer')}
    >
      <div className={styles.footerSectionContent}>
        <p className={styles.sectionInfo}>
          Le pied de page apparaîtra en bas de chaque page du contrat. 
          Vous pouvez y insérer les informations de contact, mentions légales, etc.
        </p>

        <div className={styles.dimensionsContainer}>
          <div className={styles.dimensionField}>
            <label htmlFor="footerHeight">Hauteur du pied de page (mm)</label>
            <input
              type="number"
              id="footerHeight"
              min="10"
              max="50"
              className={styles.formField}
              value={footerHeight}
              onChange={(e) => setFooterHeight(parseInt(e.target.value) || 0)}
            />
          </div>
          <div className={styles.dimensionField}>
            <label htmlFor="footerTopMargin">Marge supérieure (mm)</label>
            <input
              type="number"
              id="footerTopMargin"
              min="0"
              max="30"
              className={styles.formField}
              value={footerTopMargin}
              onChange={(e) => setFooterTopMargin(parseInt(e.target.value) || 0)}
            />
          </div>
        </div>
        
        <div className={styles.editorContainer}>
          <div className={styles.editorHeader}>
            <label htmlFor="footerContent">Contenu du pied de page</label>
          </div>
          
          {/* Dans un cas réel, on utiliserait ReactQuill ici */}
          <ReactQuill
            ref={quillRef}
            key={previewMode ? 'preview' : 'edit'}
            id="footerContent"
            className={`${styles.footerContentInput} ${styles.reactQuillEditor}`}
            value={footerContent}
            onChange={setFooterContent}
            modules={CompactToolbarModule}
            placeholder="Contenu du pied de page..."
            theme="snow"
          />
          
          <div className={styles.exampleFooter}>
            <small className={styles.exampleLabel}>Exemple de pied de page:</small>
            <div className={styles.exampleContent}>
              Association Music Events - SIRET: 123 456 789 00012 - 
              123 rue de la Musique, 75001 Paris - Tel: 01 23 45 67 89
            </div>
          </div>
        </div>
      </div>
    </CollapsibleSection>
  );
};

export default ContratTemplateFooterSection;