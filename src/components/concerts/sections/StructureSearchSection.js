import React, { useState } from 'react';
import styles from './StructureSearchSection.module.css';
import SearchDropdown from './SearchDropdown';
import SelectedEntityCard from './SelectedEntityCard';
import CardSection from '@/components/ui/CardSection';

/**
 * StructureSearchSection - Section de recherche et sélection de structure
 * Permet maintenant d'ajouter plusieurs structures comme pour les contacts
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
  // État local pour gérer la liste des structures
  const [structuresList, setStructuresList] = useState(
    selectedStructure ? [selectedStructure] : []
  );
  const [showAddStructure, setShowAddStructure] = useState(structuresList.length === 0);

  // Fonction pour ajouter une structure à la liste
  const handleAddStructureToList = (structure) => {
    if (structure && !structuresList.find(s => s.id === structure.id)) {
      const updatedList = [...structuresList, structure];
      setStructuresList(updatedList);
      setStructureSearchTerm('');
      setShowAddStructure(false);
      
      // Si c'est la première structure, la définir comme principale
      if (structuresList.length === 0) {
        handleSelectStructure(structure);
      }
    }
  };

  // Fonction pour retirer une structure de la liste
  const handleRemoveStructureFromList = (structureId) => {
    const updatedList = structuresList.filter(s => s.id !== structureId);
    setStructuresList(updatedList);
    
    // Si on retire la structure principale
    if (selectedStructure && selectedStructure.id === structureId) {
      if (updatedList.length > 0) {
        handleSelectStructure(updatedList[0]);
      } else {
        handleRemoveStructure();
        setShowAddStructure(true);
      }
    }
  };

  // Modifier les callbacks pour ajouter à la liste au lieu de sélectionner directement
  const handleSelectFromSearch = (structure) => {
    handleAddStructureToList(structure);
    if (handleSelectStructure) handleSelectStructure(structure);
  };

  const handleCreateNew = async () => {
    if (handleCreateStructure) {
      // Passer un callback pour récupérer la structure créée
      await handleCreateStructure((newStructure) => {
        handleAddStructureToList(newStructure);
      });
    }
  };

  const structureSearchProps = {
    searchTerm: structureSearchTerm,
    setSearchTerm: setStructureSearchTerm,
    results: structureResults,
    showResults: showStructureResults,
    setShowResults: setShowStructureResults,
    isSearching: isSearchingStructures,
    placeholder: "Rechercher une structure par nom ou raison sociale...",
    emptyResultsText: "Aucune structure trouvée",
    onSelect: handleSelectFromSearch,
    onCreate: handleCreateNew,
    createButtonText: "Nouvelle structure",
    entityType: "structure"
  };

  return (
    <CardSection
      title="Structure(s)"
      icon={<i className="bi bi-building"></i>}
      isEditing={true}
      hasDropdown={true}
      className="structure-section"
      headerClassName="structure"
    >
      <div className={styles.cardBody} ref={structureDropdownRef}>
        {/* Afficher la liste des structures ajoutées */}
        {structuresList.length > 0 && (
          <>
            <label className={styles.formLabel}>
              {structuresList.length === 1 ? 'Structure sélectionnée' : `${structuresList.length} structures sélectionnées`}
            </label>
            <div className={styles.structuresList}>
              {structuresList.map((structure, index) => (
                <div key={structure.id} className={styles.structureItem}>
                  <SelectedEntityCard
                    entity={structure}
                    entityType="structure"
                    onRemove={() => handleRemoveStructureFromList(structure.id)}
                    primaryField="nom"
                    secondaryFields={[
                      {
                        icon: "bi-card-text",
                        value: structure.siret ? `SIRET: ${structure.siret}` : null
                      },
                      {
                        icon: "bi-geo-alt",
                        value: structure.ville
                      },
                      {
                        icon: "bi-briefcase",
                        value: structure.type
                      }
                    ]}
                    renderCustomInfo={() => (
                      <div className={styles.structureDetails}>
                        {structure.raisonSociale && structure.raisonSociale !== structure.nom && (
                          <div className={styles.raisonSociale}>{structure.raisonSociale}</div>
                        )}
                        {structure.numeroIntracommunautaire && (
                          <div className={styles.tva}>
                            <i className="bi bi-receipt"></i> TVA: {structure.numeroIntracommunautaire}
                          </div>
                        )}
                      </div>
                    )}
                  />
                  {index === 0 && structuresList.length > 1 && (
                    <span className={styles.principalBadge}>Principale</span>
                  )}
                </div>
              ))}
            </div>
            
            {/* Bouton pour ajouter une autre structure */}
            {!showAddStructure && (
              <button
                type="button"
                className={styles.addAnotherButton}
                onClick={() => setShowAddStructure(true)}
              >
                <i className="bi bi-plus-circle"></i>
                Ajouter une autre structure
              </button>
            )}
          </>
        )}
        
        {/* Formulaire de recherche/ajout */}
        {(structuresList.length === 0 || showAddStructure) && (
          <>
            <label className={styles.formLabel}>
              {structuresList.length === 0 ? 'Rechercher une structure' : 'Ajouter une autre structure'}
            </label>
            <SearchDropdown {...structureSearchProps} />
          </>
        )}
        
        <small className={styles.helpText}>
          Associez une ou plusieurs structures juridiques à ce concert (optionnel).
        </small>
      </div>
    </CardSection>
  );
});

export default StructureSearchSection;