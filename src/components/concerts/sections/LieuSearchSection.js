import React from 'react';
import styles from './LieuSearchSection.module.css';
import SearchDropdown from './SearchDropdown';
import SelectedEntityCard from './SelectedEntityCard';
import CardSection from '@/components/ui/CardSection';

/**
 * LieuSearchSection - Section de recherche et sélection de lieu(x)
 * Permet d'ajouter plusieurs lieux sous forme de liste
 */
const LieuSearchSection = React.memo(({ 
  lieuSearchTerm, 
  setLieuSearchTerm,
  lieuResults,
  showLieuResults,
  setShowLieuResults,
  isSearchingLieux,
  lieuDropdownRef,
  selectedLieu,
  lieuxList: externalLieuxList,
  setLieuxList: externalSetLieuxList,
  handleSelectLieu,
  handleRemoveLieu,
  handleCreateLieu
}) => {
  // État local pour gérer la liste des lieux (ou utiliser externe si fourni)
  const [internalLieuxList, setInternalLieuxList] = React.useState([]);
  const [showAddLieu, setShowAddLieu] = React.useState(true);
  
  // Utiliser la liste externe si fournie, sinon la liste interne
  const lieuxList = externalLieuxList !== undefined ? externalLieuxList : internalLieuxList;
  const setLieuxList = externalSetLieuxList || setInternalLieuxList;
  
  // Synchroniser avec le lieu sélectionné passé en prop (seulement si pas de liste externe)
  React.useEffect(() => {
    if (externalLieuxList === undefined && selectedLieu && !internalLieuxList.find(l => l.id === selectedLieu.id)) {
      setInternalLieuxList([selectedLieu]);
      setShowAddLieu(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLieu?.id, externalLieuxList]);
  
  // Gérer l'état d'affichage du formulaire d'ajout selon la liste active
  React.useEffect(() => {
    setShowAddLieu(lieuxList.length === 0);
  }, [lieuxList.length]);
  
  // Fonction pour ajouter un lieu à la liste
  const handleAddLieuToList = (lieu) => {
    if (lieu && !lieuxList.find(l => l.id === lieu.id)) {
      setLieuxList([...lieuxList, lieu]);
      setLieuSearchTerm('');
      setShowAddLieu(false);
      // Toujours garder le premier lieu comme selectedLieu pour la compatibilité
      if (lieuxList.length === 0) {
        handleSelectLieu(lieu);
      }
    }
  };
  
  // Fonction pour retirer un lieu de la liste
  const handleRemoveLieuFromList = (lieuId) => {
    const updatedList = lieuxList.filter(l => l.id !== lieuId);
    setLieuxList(updatedList);
    // Si on retire le lieu principal, mettre à jour
    if (selectedLieu && selectedLieu.id === lieuId) {
      if (updatedList.length > 0) {
        handleSelectLieu(updatedList[0]);
      } else {
        // Appeler handleRemoveLieu avec l'ID si la fonction le supporte
        if (handleRemoveLieu.length > 0) {
          handleRemoveLieu(lieuId);
        } else {
          handleRemoveLieu();
        }
        setShowAddLieu(true);
      }
    } else {
      // Si ce n'est pas le lieu principal, appeler directement avec l'ID
      if (handleRemoveLieu.length > 0) {
        handleRemoveLieu(lieuId);
      }
    }
  };
  
  return (
    <CardSection
      title="Lieu(x)"
      icon={<i className="bi bi-geo-alt"></i>}
      isEditing={true}
      hasDropdown={true}
      className="lieu-section"
      headerClassName="lieu required"
    >
      <div className={styles.cardBody} ref={lieuDropdownRef}>
        {/* Afficher la liste des lieux ajoutés */}
        {lieuxList.length > 0 && (
          <>
            <label className={styles.formLabel}>
              {lieuxList.length === 1 ? 'Lieu sélectionné' : `${lieuxList.length} lieux sélectionnés`}
            </label>
            <div className={styles.lieuxList}>
              {lieuxList.map((lieu, index) => (
                <div key={lieu.id} className={styles.lieuItem}>
                  <SelectedEntityCard
                    entity={lieu}
                    entityType="lieu"
                    onRemove={() => handleRemoveLieuFromList(lieu.id)}
                    primaryField="nom"
                    secondaryFields={[
                      { 
                        icon: "bi-geo-alt-fill", 
                        value: lieu.adresse, 
                        suffix: lieu.codePostal && lieu.ville
                          ? `, ${lieu.codePostal} ${lieu.ville}`
                          : ''
                      },
                      { 
                        icon: "bi-people-fill", 
                        prefix: "Capacité: ", 
                        value: lieu.capacite || 'Non spécifiée',
                        suffix: lieu.capacite ? " personnes" : ""
                      }
                    ]}
                  />
                  {index === 0 && lieuxList.length > 1 && (
                    <span className={styles.principalBadge}>Principal</span>
                  )}
                </div>
              ))}
            </div>
            
            {/* Bouton pour ajouter un autre lieu */}
            {!showAddLieu && (
              <button
                type="button"
                className={styles.addAnotherButton}
                onClick={() => setShowAddLieu(true)}
              >
                <i className="bi bi-plus-circle"></i>
                Ajouter un autre lieu
              </button>
            )}
          </>
        )}
        
        {/* Formulaire de recherche/ajout */}
        {(lieuxList.length === 0 || showAddLieu) && (
          <>
            <label className={styles.formLabel}>
              {lieuxList.length === 0 ? 'Rechercher un lieu' : 'Ajouter un autre lieu'}
            </label>
            <SearchDropdown
              searchTerm={lieuSearchTerm}
              setSearchTerm={setLieuSearchTerm}
              results={lieuResults}
              showResults={showLieuResults}
              setShowResults={setShowLieuResults}
              isSearching={isSearchingLieux}
              placeholder="Rechercher un lieu par nom..."
              onSelect={handleAddLieuToList}
              onCreate={() => handleCreateLieu(handleAddLieuToList)}
              createButtonText="Nouveau lieu"
              emptyResultsText="Aucun lieu trouvé"
              entityType="lieu"
            />
            <small className={styles.formHelpText}>
              Tapez au moins 2 caractères pour rechercher un lieu par nom.
            </small>
            
            {showAddLieu && lieuxList.length > 0 && (
              <button
                type="button"
                className={styles.cancelAddButton}
                onClick={() => {
                  setShowAddLieu(false);
                  setLieuSearchTerm('');
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
});

export default LieuSearchSection;
