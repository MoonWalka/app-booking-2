import React from 'react';
import styles from './ProgrammateurSearchSection.module.css';
import SearchDropdown from './SearchDropdown';
import SelectedEntityCard from './SelectedEntityCard';
import CardSection from '@/components/ui/CardSection';

/**
 * ProgrammateurSearchSection - Section de recherche et sélection de programmateur(s)
 * Permet d'ajouter plusieurs programmateurs sous forme de liste
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {string} props.progSearchTerm - Terme de recherche pour le programmateur
 * @param {Function} props.setProgSearchTerm - Fonction pour mettre à jour le terme de recherche
 * @param {Array} props.progResults - Résultats de la recherche de programmateurs
 * @param {boolean} props.showProgResults - Indique si les résultats doivent être affichés
 * @param {Function} props.setShowProgResults - Fonction pour contrôler l'affichage des résultats
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
  setShowProgResults,
  isSearchingProgs,
  progDropdownRef,
  selectedProgrammateur,
  handleSelectProgrammateur,
  handleRemoveProgrammateur,
  handleCreateProgrammateur
}) => {
  // État local pour gérer la liste des programmateurs
  const [programmateursList, setProgrammateursList] = React.useState([]);
  const [showAddProgrammateur, setShowAddProgrammateur] = React.useState(true);
  
  // Fonction pour ajouter un programmateur à la liste
  const handleAddProgrammateurToList = (programmateur) => {
    if (programmateur && !programmateursList.find(p => p.id === programmateur.id)) {
      setProgrammateursList([...programmateursList, programmateur]);
      setProgSearchTerm('');
      setShowAddProgrammateur(false);
      // Toujours garder le premier programmateur comme selectedProgrammateur pour la compatibilité
      if (programmateursList.length === 0) {
        handleSelectProgrammateur(programmateur);
      }
    }
  };
  
  // Fonction pour retirer un programmateur de la liste
  const handleRemoveProgrammateurFromList = (programmateurId) => {
    const updatedList = programmateursList.filter(p => p.id !== programmateurId);
    setProgrammateursList(updatedList);
    // Si on retire le programmateur principal, mettre à jour
    if (selectedProgrammateur && selectedProgrammateur.id === programmateurId) {
      if (updatedList.length > 0) {
        handleSelectProgrammateur(updatedList[0]);
      } else {
        handleRemoveProgrammateur();
        setShowAddProgrammateur(true);
      }
    }
  };
  
  return (
    <CardSection
      title="Programmateur(s)"
      icon={<i className="bi bi-person"></i>}
      isEditing={true}
      hasDropdown={true}
      className="programmateur-section"
      headerClassName="programmateur"
    >
      <div className={styles.cardBody} ref={progDropdownRef}>
        {/* Afficher la liste des programmateurs ajoutés */}
        {programmateursList.length > 0 && (
          <>
            <label className={styles.formLabel}>
              {programmateursList.length === 1 ? 'Programmateur sélectionné' : `${programmateursList.length} programmateurs sélectionnés`}
            </label>
            <div className={styles.programmateursList}>
              {programmateursList.map((programmateur, index) => (
                <div key={programmateur.id} className={styles.programmateurItem}>
                  <SelectedEntityCard
                    entity={programmateur}
                    entityType="programmateur"
                    onRemove={() => handleRemoveProgrammateurFromList(programmateur.id)}
                    primaryField="nom"
                    secondaryFields={[
                      { 
                        icon: "bi-building", 
                        value: programmateur.structure 
                      },
                      { 
                        icon: "bi-envelope", 
                        value: programmateur.email 
                      },
                      { 
                        icon: "bi-telephone", 
                        value: programmateur.telephone 
                      }
                    ]}
                  />
                  {index === 0 && programmateursList.length > 1 && (
                    <span className={styles.principalBadge}>Principal</span>
                  )}
                </div>
              ))}
            </div>
            
            {/* Bouton pour ajouter un autre programmateur */}
            {!showAddProgrammateur && (
              <button
                type="button"
                className={styles.addAnotherButton}
                onClick={() => setShowAddProgrammateur(true)}
              >
                <i className="bi bi-plus-circle"></i>
                Ajouter un autre programmateur
              </button>
            )}
          </>
        )}
        
        {/* Formulaire de recherche/ajout */}
        {(programmateursList.length === 0 || showAddProgrammateur) && (
          <>
            <label className={styles.formLabel}>
              {programmateursList.length === 0 ? 'Rechercher un programmateur' : 'Ajouter un autre programmateur'}
            </label>
            <SearchDropdown
              searchTerm={progSearchTerm}
              setSearchTerm={setProgSearchTerm}
              results={progResults}
              showResults={showProgResults}
              setShowResults={setShowProgResults}
              isSearching={isSearchingProgs}
              placeholder="Rechercher un programmateur par nom..."
              onSelect={handleAddProgrammateurToList}
              onCreate={() => handleCreateProgrammateur(handleAddProgrammateurToList)}
              createButtonText="Nouveau programmateur"
              emptyResultsText="Aucun programmateur trouvé"
              entityType="programmateur"
            />
            <small className={styles.formHelpText}>
              Tapez au moins 2 caractères pour rechercher un programmateur par nom.
            </small>
            
            {showAddProgrammateur && programmateursList.length > 0 && (
              <button
                type="button"
                className={styles.cancelAddButton}
                onClick={() => {
                  setShowAddProgrammateur(false);
                  setProgSearchTerm('');
                }}
              >
                Annuler
              </button>
            )}
          </>
        )}
      </div>
    </CardSection>
  );
};

export default ProgrammateurSearchSection;
