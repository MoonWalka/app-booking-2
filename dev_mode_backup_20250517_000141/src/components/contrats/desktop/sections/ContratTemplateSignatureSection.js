import React from 'react';
import CollapsibleSection from './CollapsibleSection';
import VariablesDropdown from './VariablesDropdown';
import styles from './ContratTemplateSignatureSection.module.css';

/**
 * Composant pour la configuration de la section de signature du contrat
 */
const ContratTemplateSignatureSection = ({
  signatureTemplate,
  setSignatureTemplate,
  signatureCollapsed,
  toggleCollapse,
  signatureVariables,
  signatureVarsOpen,
  signatureVarsRef,
  toggleDropdown,
  insertVariable
}) => {
  return (
    <CollapsibleSection
      title="Section de signature"
      isCollapsed={signatureCollapsed}
      toggleCollapse={() => toggleCollapse('signature')}
    >
      <div className={styles.signatureSectionContent}>
        <p className={styles.sectionInfo}>
          Cette section apparaîtra à la fin de votre contrat et contiendra les zones de signature.
          Utilisez les variables pour personnaliser automatiquement les noms et fonctions des signataires.
        </p>
        
        <div className={styles.editorContainer}>
          <div className={styles.editorHeader}>
            <label htmlFor="signatureTemplate">Format de la section de signature</label>
            <VariablesDropdown
              isOpen={signatureVarsOpen}
              variables={signatureVariables}
              targetId="signatureTemplate"
              buttonRef={signatureVarsRef}
              onToggle={toggleDropdown}
              onSelectVariable={(variable, targetId) => 
                insertVariable(variable, targetId, setSignatureTemplate, signatureTemplate)
              }
            />
          </div>
          
          {/* Dans un cas réel, on utiliserait ReactQuill ici */}
          <textarea
            id="signatureTemplate"
            className={styles.signatureContentInput}
            value={signatureTemplate}
            onChange={(e) => setSignatureTemplate(e.target.value)}
            placeholder="Format de la section de signature..."
            rows={8}
          />
        </div>
        
        <div className={styles.signatureTips}>
          <h5 className={styles.tipsTitle}>Modèle de signature recommandé</h5>
          
          <pre className={styles.signatureExample}>
{`Fait à {lieu_nom}, le {date_signature}

Pour {programmateur_structure_nom},               Pour {artiste_structure_nom},
{programmateur_nom}                               {artiste_representant}
{programmateur_fonction}                          {artiste_representant_fonction}`}
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