import React from 'react';
import VariablesDropdown from './VariablesDropdown';
import styles from './ContratTemplateBodySection.module.css';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

/**
 * Composant pour la section principale (corps) du contrat
 */
const ContratTemplateBodySection = ({
  bodyContent,
  setBodyContent,
  bodyVarsOpen,
  bodyVarsRef,
  bodyVariables,
  toggleVariablesMenu,
  insertVariable,
  editorModules
}) => {
  return (
    <div className={styles.bodySection}>
      <div className={styles.bodySectionHeader}>
        <h3 className={styles.sectionTitle}>
          Corps du contrat
        </h3>
        <div className={styles.sectionActions}>
          <VariablesDropdown
            isOpen={bodyVarsOpen}
            variables={bodyVariables}
            targetId="bodyContent"
            buttonRef={bodyVarsRef}
            onToggle={() => toggleVariablesMenu('bodyContent')}
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
          id="bodyContent"
          className={styles.bodyContentEditor}
          value={bodyContent || ''}
          onChange={setBodyContent}
          modules={editorModules || { toolbar: [['bold', 'italic', 'underline'], [{ list: 'ordered' }, { list: 'bullet' }], ['clean']] }}
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