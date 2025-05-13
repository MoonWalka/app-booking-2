import React from 'react';
import styles from './ProgrammateurSearchSection.module.css';
import SearchDropdown from './SearchDropdown';
import SelectedEntityCard from './SelectedEntityCard';
import Card from '@/components/ui/Card';

/**
 * ProgrammateurSearchSection - Section de recherche et sélection de programmateur
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {string} props.progSearchTerm - Terme de recherche pour le programmateur
 * @param {Function} props.setProgSearchTerm - Fonction pour mettre à jour le terme de recherche
 * @param {Array} props.progResults - Résultats de la recherche de programmateurs
 * @param {boolean} props.showProgResults - Indique si les résultats doivent être affichés
 * @param {boolean} props.isSearchingProgs - Indique si une recherche est en cours
 * @param {Object} props.progDropdownRef - Référence pour gérer le clic en dehors du dropdown
 * @param {Object} props.selectedProgrammateur - Programmateur sélectionné
 * @param {Function} props.handleSelectProgrammateur - Fonction pour sélectionner un programmateur
 * @param {Function} props.handleRemoveProgrammateur - Fonction pour désélectionner le programmateur
 * @param {Function} props.handleCreateProgrammateur - Fonction pour créer un nouveau programmateur
 */
const ProgrammateurSearchSection = ({ 
  progSearchTerm, 
  setProgSearchTerm,
  progResults,
  showProgResults,
  isSearchingProgs,
  progDropdownRef,
  selectedProgrammateur,
  handleSelectProgrammateur,
  handleRemoveProgrammateur,
  handleCreateProgrammateur
}) => {
  return (
    <Card
      title="Programmateur"
      icon={<i className="bi bi-person"></i>}
      className={styles.programmateurSearchSection}
    >
      <div className={styles.searchContainer} ref={progDropdownRef}>
        {!selectedProgrammateur ? (
          <>
            <label className={styles.formLabel}>Rechercher un programmateur</label>
            <SearchDropdown
              searchTerm={progSearchTerm}
              setSearchTerm={setProgSearchTerm}
              results={progResults}
              showResults={showProgResults}
              isSearching={isSearchingProgs}
              placeholder="Rechercher un programmateur par nom..."
              onSelect={handleSelectProgrammateur}
              onCreate={() => handleCreateProgrammateur(progSearchTerm, handleSelectProgrammateur)}
              createButtonText="Nouveau programmateur"
              emptyResultsText="Aucun programmateur trouvé"
              entityType="programmateur"
            />
            <small className={styles.formHelpText}>
              Tapez au moins 2 caractères pour rechercher un programmateur par nom.
            </small>
          </>
        ) : (
          <>
            <label className={styles.formLabel}>Programmateur sélectionné</label>
            <SelectedEntityCard
              entity={selectedProgrammateur}
              entityType="programmateur"
              onRemove={handleRemoveProgrammateur}
              primaryField="nom"
              secondaryFields={[
                { 
                  icon: "bi-building", 
                  value: selectedProgrammateur.structure 
                },
                { 
                  icon: "bi-envelope", 
                  value: selectedProgrammateur.email 
                },
                { 
                  icon: "bi-telephone", 
                  value: selectedProgrammateur.telephone 
                }
              ]}
            />
          </>
        )}
      </div>
    </Card>
  );
};

export default ProgrammateurSearchSection;
