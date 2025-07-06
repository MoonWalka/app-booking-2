import React from 'react';
import styles from './StructureSearchSection.module.css';
import SearchDropdown from '../../dates/sections/SearchDropdown';
import SelectedEntityCard from '../../dates/sections/SelectedEntityCard';
import CardSection from '@/components/ui/CardSection';

/**
 * StructureSearchSection - Section de recherche et sélection de structure
 * Basée sur le pattern ArtisteSearchSection pour la cohérence UI
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {string} props.structureSearchTerm - Terme de recherche pour la structure
 * @param {Function} props.setStructureSearchTerm - Fonction pour mettre à jour le terme de recherche
 * @param {Array} props.structureResults - Résultats de la recherche de structures
 * @param {boolean} props.showStructureResults - Indique si les résultats doivent être affichés
 * @param {Function} props.setShowStructureResults - Fonction pour contrôler l'affichage des résultats
 * @param {boolean} props.isSearchingStructures - Indique si une recherche est en cours
 * @param {Object} props.structureDropdownRef - Référence pour gérer le clic en dehors du dropdown
 * @param {Object} props.selectedStructure - Structure sélectionnée
 * @param {Function} props.handleSelectStructure - Fonction pour sélectionner une structure
 * @param {Function} props.handleRemoveStructure - Fonction pour désélectionner la structure
 * @param {Function} props.handleCreateStructure - Fonction pour créer une nouvelle structure
 */
const StructureSearchSection = ({ 
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
  const [showAddStructure, setShowAddStructure] = React.useState(true);
  
  // Synchroniser l'état d'affichage avec la structure sélectionnée
  React.useEffect(() => {
    if (selectedStructure && selectedStructure.id) {
      setShowAddStructure(false);
    } else {
      setShowAddStructure(true);
    }
  }, [selectedStructure]);
  
  // Fonction pour ajouter une structure
  const handleAddStructure = React.useCallback((structure) => {
    if (structure) {
      handleSelectStructure(structure);
      setStructureSearchTerm('');
      setShowAddStructure(false);
    }
  }, [handleSelectStructure, setStructureSearchTerm]);
  
  // Fonction pour retirer la structure
  const handleRemoveStructureLocal = React.useCallback(() => {
    handleRemoveStructure();
    setShowAddStructure(true);
  }, [handleRemoveStructure]);
  
  return (
    <CardSection
      title="Structure"
      icon={<i className="bi bi-building"></i>}
      isEditing={true}
      hasDropdown={showAddStructure}
      className="structure-section"
      headerClassName="structure"
    >
      <div className={styles.cardBody} ref={structureDropdownRef}>
        {/* Afficher la structure sélectionnée */}
        {selectedStructure && selectedStructure.id && (
          <>
            <label className={styles.formLabel}>
              Structure sélectionnée
            </label>
            <div className={styles.structureItem}>
              <SelectedEntityCard
                entity={selectedStructure}
                entityType="structure"
                onRemove={handleRemoveStructureLocal}
                primaryField="nom"
                secondaryFields={[
                  { 
                    icon: "bi-card-text", 
                    value: selectedStructure.type 
                  },
                  { 
                    icon: "bi-building", 
                    value: selectedStructure.siret,
                    prefix: "SIRET: "
                  },
                  { 
                    icon: "bi-geo-alt", 
                    value: selectedStructure.ville
                  },
                  { 
                    icon: "bi-envelope", 
                    value: selectedStructure.email
                  }
                ]}
              />
            </div>
          </>
        )}
        
        {/* Section de recherche/ajout */}
        {showAddStructure && (
          <>
            <label className={styles.formLabel}>
              {selectedStructure ? 'Changer de structure' : 'Ajouter une structure'}
            </label>
            
            <SearchDropdown
              searchTerm={structureSearchTerm}
              setSearchTerm={setStructureSearchTerm}
              results={structureResults}
              showResults={showStructureResults}
              setShowResults={setShowStructureResults}
              isSearching={isSearchingStructures}
              placeholder="Rechercher une structure par nom..."
              onSelectResult={handleAddStructure}
              onCreateNew={handleCreateStructure}
              entityType="structure"
              primaryField="nom"
              secondaryFields={[
                { key: 'type', icon: 'bi-card-text' },
                { key: 'siret', icon: 'bi-building', prefix: 'SIRET: ' },
                { key: 'ville', icon: 'bi-geo-alt' }
              ]}
              createNewText="Créer une nouvelle structure"
            />
          </>
        )}
        
        {/* Bouton pour changer de structure si une est déjà sélectionnée */}
        {selectedStructure && selectedStructure.id && !showAddStructure && (
          <button
            type="button"
            className={styles.changeButton}
            onClick={() => setShowAddStructure(true)}
          >
            <i className="bi bi-arrow-repeat"></i>
            Changer de structure
          </button>
        )}
      </div>
    </CardSection>
  );
};

export default StructureSearchSection;