import React, { useEffect, useRef } from 'react';
import VariablesPanel from './VariablesPanel';
import styles from './ContratTemplateBodySection.module.css';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { CompactToolbarModule } from '@/components/contrats/QuillPageBreakModule';

/**
 * Composant pour la section principale (corps) du contrat
 */
const ContratTemplateBodySection = ({
  bodyContent,
  setBodyContent,
  bodyVarsOpen,
  bodyVarsRef,
  bodyVariables,
  toggleDropdown,
  insertVariable,
  previewMode
}) => {
  const quillRef = useRef();

  useEffect(() => {
    if (!previewMode && quillRef.current) {
      const editor = quillRef.current.getEditor();
      if (editor && bodyContent !== editor.root.innerHTML) {
        editor.root.innerHTML = bodyContent || '';
      }
    }
  }, [previewMode, bodyContent]);

  useEffect(() => {
    console.log("🖊️ Render ContratTemplateBodySection, bodyContent =", bodyContent);
  }, [bodyContent]);

  if (!bodyContent) {
    console.warn("⚠️ ATTENTION : bodyContent est vide au rendu");
  }

  return (
    <div className={styles.bodySection}>
      <div className={styles.bodySectionHeader}>
        <h3 className={styles.sectionTitle}>
          Corps du contrat
        </h3>
        <div className={styles.sectionActions}>
          <VariablesPanel
            variables={bodyVariables}
            targetId="bodyContent"
            buttonRef={bodyVarsRef}
            onSelectVariable={(variable, targetId) => 
              insertVariable(variable, targetId)
            }
          />
          <div className={styles.instructionsText}>
            <small>
              <i className="bi bi-info-circle me-1"></i>
              Utilisez <code>[SAUT_DE_PAGE]</code> pour forcer un saut de page
            </small>
          </div>
        </div>
      </div>
      
      <div className={styles.bodyEditorWrapper}>
        <ReactQuill
          ref={quillRef}
          key={previewMode ? 'preview' : 'edit'}
          id="bodyContent"
          className={styles.bodyContentEditor}
          value={bodyContent}
          onChange={setBodyContent}
          modules={CompactToolbarModule}
          placeholder="Entrez ici le contenu principal de votre contrat..."
          theme="snow"
          style={{ minHeight: 300, height: '100%' }}
        />
      </div>
      
      <div className={styles.bodyHelpText}>
        <p>
          <strong>Conseils de rédaction :</strong>
        </p>
        <ul className={styles.helpList}>
          <li>Utilisez des variables entre accolades pour personnaliser automatiquement votre contrat, ex: <code>{'{artiste_nom}'}</code>.</li>
          <li>Structurez votre contrat en articles numérotés pour plus de clarté.</li>
          <li>Ajoutez <code>[SAUT_DE_PAGE]</code> entre les sections principales pour améliorer la lisibilité.</li>
        </ul>
      </div>
    </div>
  );
};

export default ContratTemplateBodySection;