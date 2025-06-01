import React from 'react';
import styles from './StructureSearchSection.module.css';
import SearchDropdown from './SearchDropdown';
import SelectedEntityCard from './SelectedEntityCard';
import CardSection from '@/components/ui/CardSection';

/**
 * StructureSearchSection - Section de recherche et sélection de structure
 */
const StructureSearchSection = React.memo(({ 
  structureSearchTerm, 
  setStructureSearchTerm,
  structureResults,
  showStructureResults,
  setShowStructureResults,
  isSearchingStructures,
  structureDropdownRef,
  selectedStructure,
  handleSelectStructure,
  handleRemoveStructure,
  handleCreateStructure
}) => {

  const structureSearchProps = {
    searchTerm: structureSearchTerm,
    setSearchTerm: setStructureSearchTerm,
    results: structureResults,
    showResults: showStructureResults,
    setShowResults: setShowStructureResults,
    isSearching: isSearchingStructures,
    dropdownRef: structureDropdownRef,
    placeholder: "Rechercher une structure par nom ou raison sociale...",
    emptyMessage: "Aucune structure trouvée",
    onResultSelect: handleSelectStructure,
    onCreateNew: handleCreateStructure,
    createNewText: "Créer une structure",
    minSearchLength: 2,
    renderResult: (structure) => (
      <div className={styles.structureResult}>
        <div className={styles.structureName}>
          {structure.nom || structure.raisonSociale || 'Sans nom'}
        </div>
        <div className={styles.structureDetails}>
          {structure.type && <span className={styles.structureType}>{structure.type}</span>}
          {structure.ville && <span className={styles.structureLocation}>{structure.ville}</span>}
          {structure.siret && <span className={styles.structureSiret}>SIRET: {structure.siret}</span>}
        </div>
      </div>
    )
  };

  const selectedEntityCardProps = selectedStructure ? {
    entity: selectedStructure,
    onRemove: handleRemoveStructure,
    entityType: "structure",
    renderEntityInfo: (structure) => (
      <div className={styles.selectedStructureInfo}>
        <div className={styles.structureName}>
          {structure.nom || structure.raisonSociale || 'Sans nom'}
        </div>
        <div className={styles.structureDetails}>
          {structure.type && <div className={styles.structureType}>{structure.type}</div>}
          {structure.ville && (
            <div className={styles.structureLocation}>
              <i className="bi bi-geo-alt"></i> {structure.ville}
            </div>
          )}
          {structure.siret && (
            <div className={styles.structureSiret}>
              <i className="bi bi-card-text"></i> SIRET: {structure.siret}
            </div>
          )}
          {structure.numeroIntracommunautaire && (
            <div className={styles.structureTva}>
              <i className="bi bi-briefcase"></i> TVA: {structure.numeroIntracommunautaire}
            </div>
          )}
        </div>
      </div>
    )
  } : null;

  return (
    <CardSection
      title="Structure"
      icon={<i className="bi bi-building"></i>}
      isEditing={true}
    >
      <div className={styles.structureSection}>
        {selectedStructure ? (
          <SelectedEntityCard {...selectedEntityCardProps} />
        ) : (
          <SearchDropdown {...structureSearchProps} />
        )}
        
        <small className={styles.helpText}>
          Associez une structure juridique à ce concert (optionnel).
        </small>
      </div>
    </CardSection>
  );
});

export default StructureSearchSection;