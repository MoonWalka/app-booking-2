import React, { useRef } from 'react';
import CollapsibleSection from './CollapsibleSection';
import styles from './ContratTemplateTitleSection.module.css';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { CompactToolbarModule } from '@/components/contrats/QuillPageBreakModule';

/**
 * Composant pour la configuration du titre du contrat
 */
const ContratTemplateTitleSection = ({
  titleTemplate,
  setTitleTemplate,
  titleCollapsed,
  toggleCollapse
}) => {
  const quillRef = useRef();

  return (
    <CollapsibleSection
      title="Titre du contrat"
      isCollapsed={titleCollapsed}
      toggleCollapse={() => toggleCollapse('title')}
    >
      <div className={styles.titleSectionContent}>
        <p className={styles.sectionInfo}>
          Le titre du contrat apparaîtra en haut de la première page.
        </p>
        
        <div className={styles.formGroup}>
          <div className={styles.inputActions}>
            <label htmlFor="titleTemplate">Format du titre</label>
          </div>
          
          <ReactQuill
            ref={quillRef}
            id="titleTemplate"
            className={styles.titleInput}
            value={titleTemplate}
            onChange={setTitleTemplate}
            modules={CompactToolbarModule}
            placeholder="Ex: Contrat de prestation"
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