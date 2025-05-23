import React from 'react';
import CollapsibleSection from './CollapsibleSection';
import VariablesDropdown from './VariablesDropdown';
import styles from './ContratTemplateHeaderSection.module.css';

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
  headerVarsOpen,
  headerVarsRef,
  headerFooterVariables,
  toggleDropdown,
  insertVariable
}) => {
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
              <button
                type="button"
                className="btn btn-sm btn-outline-danger"
                onClick={handleRemoveLogo}
              >
                <i className="bi bi-trash me-1"></i>
                Supprimer
              </button>
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
              className="form-control"
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
              className="form-control"
              value={headerBottomMargin}
              onChange={(e) => setHeaderBottomMargin(parseInt(e.target.value) || 0)}
            />
          </div>
        </div>
        
        <div className={styles.editorContainer}>
          <div className={styles.editorHeader}>
            <label htmlFor="headerContent">Contenu de l'en-tête</label>
            <VariablesDropdown
              isOpen={headerVarsOpen}
              variables={headerFooterVariables}
              targetId="headerContent"
              buttonRef={headerVarsRef}
              onToggle={toggleDropdown}
              onSelectVariable={(variable, targetId) => 
                insertVariable(variable, targetId, setHeaderContent, headerContent)
              }
            />
          </div>
          
          {/* Dans un cas réel, on utiliserait ReactQuill ici */}
          <textarea
            id="headerContent"
            className={styles.headerContentInput}
            value={headerContent}
            onChange={(e) => setHeaderContent(e.target.value)}
            placeholder="Contenu de l'en-tête..."
            rows={5}
          />
        </div>
      </div>
    </CollapsibleSection>
  );
};

export default ContratTemplateHeaderSection;