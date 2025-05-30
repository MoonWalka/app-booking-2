import React, { useEffect, useRef } from 'react';
import CollapsibleSection from './CollapsibleSection';
import styles from './ContratTemplateSignatureSection.module.css';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { CompactToolbarModule } from '@/components/contrats/QuillPageBreakModule';

/**
 * Composant pour la configuration de la section de signature du contrat
 */
const ContratTemplateSignatureSection = ({
  signatureTemplate,
  setSignatureTemplate,
  signatureCollapsed,
  toggleCollapse,
  previewMode
}) => {
  const quillRef = useRef();

  useEffect(() => {
    if (!previewMode && quillRef.current) {
      const editor = quillRef.current.getEditor();
      if (editor && signatureTemplate !== editor.root.innerHTML) {
        editor.root.innerHTML = signatureTemplate || '';
      }
    }
  }, [previewMode, signatureTemplate]);

  return (
    <CollapsibleSection
      title="Section de signature"
      isCollapsed={signatureCollapsed}
      toggleCollapse={() => toggleCollapse('signature')}
    >
      <div className={styles.signatureSectionContent}>
        <p className={styles.sectionInfo}>
          Cette section apparaîtra à la fin de votre contrat et contiendra les zones de signature.
        </p>
        
        <div className={styles.editorContainer}>
          <div className={styles.editorHeader}>
            <label htmlFor="signatureTemplate">Format de la section de signature</label>
          </div>
          
          {/* Dans un cas réel, on utiliserait ReactQuill ici */}
          <ReactQuill
            ref={quillRef}
            key={previewMode ? 'preview' : 'edit'}
            id="signatureTemplate"
            className={`${styles.signatureContentInput} ${styles.reactQuillEditor}`}
            value={signatureTemplate}
            onChange={setSignatureTemplate}
            modules={CompactToolbarModule}
            placeholder="Format de la section de signature..."
            theme="snow"
          />
        </div>
        
        <div className={styles.signatureTips}>
          <h5 className={styles.tipsTitle}>Modèle de signature recommandé</h5>
          
          <pre className={styles.signatureExample}>
{`Fait à [lieu], le [date]

Pour l'Organisateur,                    Pour l'Artiste,
[Nom]                                   [Nom]
[Fonction]                              [Fonction]`}
          </pre>
          
          <p className={styles.tipText}>
            <i className="bi bi-lightbulb me-1"></i>
            Conseil : Utilisez des espaces ou des tabulations pour aligner visuellement les deux parties signataires.
          </p>
        </div>
      </div>
    </CollapsibleSection>
  );
};

export default ContratTemplateSignatureSection;