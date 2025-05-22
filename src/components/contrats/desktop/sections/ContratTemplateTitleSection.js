import React, { useRef, useEffect } from 'react';
import CollapsibleSection from './CollapsibleSection';
import VariablesDropdown from './VariablesDropdown';
import styles from './ContratTemplateTitleSection.module.css';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

/**
 * Composant pour la configuration du titre du contrat
 */
const ContratTemplateTitleSection = ({
  titleTemplate,
  setTitleTemplate,
  titleCollapsed,
  toggleCollapse,
  signatureVariables,
  signatureVarsOpen,
  signatureVarsRef,
  toggleDropdown,
  insertVariable
}) => {
  const quillRef = useRef();

  useEffect(() => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      if (editor && titleTemplate !== editor.root.innerHTML) {
        editor.root.innerHTML = titleTemplate || '';
      }
    }
  }, [titleTemplate]);

  return (
    <CollapsibleSection
      title="Titre du contrat"
      isCollapsed={titleCollapsed}
      toggleCollapse={() => toggleCollapse('title')}
    >
      <div className={styles.titleSectionContent}>
        <p className={styles.sectionInfo}>
          Le titre du contrat apparaîtra en haut de la première page. 
          Vous pouvez utiliser des variables pour personnaliser le titre automatiquement.
        </p>
        
        <div className={styles.formGroup}>
          <div className={styles.inputActions}>
            <label htmlFor="titleTemplate">Format du titre</label>
            <VariablesDropdown
              isOpen={signatureVarsOpen}
              variables={signatureVariables}
              targetId="titleTemplate"
              buttonRef={signatureVarsRef}
              onToggle={toggleDropdown}
              onSelectVariable={(variable, targetId) => 
                insertVariable(variable, targetId, setTitleTemplate, titleTemplate)
              }
            />
          </div>
          
          <ReactQuill
            ref={quillRef}
            id="titleTemplate"
            className={styles.titleInput}
            value={titleTemplate}
            onChange={setTitleTemplate}
            modules={{ toolbar: [['bold', 'italic', 'underline'], ['clean']] }}
            placeholder="Ex: Contrat de prestation - {concert_titre}"
            theme="snow"
          />
          
          <div className={styles.examplePreview}>
            <small className={styles.exampleLabel}>Aperçu:</small>
            <div className={styles.exampleContent}>
              Contrat de prestation - Concert de printemps
            </div>
          </div>
        </div>
      </div>
    </CollapsibleSection>
  );
};

export default ContratTemplateTitleSection;