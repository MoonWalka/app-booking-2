import React from 'react';
import VariablesDropdown from './VariablesDropdown';
import styles from './ContratTemplateBodySection.module.css';

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
  insertVariable
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
            onToggle={toggleDropdown}
            onSelectVariable={(variable, targetId) => 
              insertVariable(variable, targetId, setBodyContent, bodyContent)
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
        {/* Dans un cas réel, on utiliserait ReactQuill ici */}
        <textarea
          id="bodyContent"
          className={styles.bodyContentEditor}
          value={bodyContent}
          onChange={(e) => setBodyContent(e.target.value)}
          placeholder="Entrez ici le contenu principal de votre contrat..."
          rows={20}
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