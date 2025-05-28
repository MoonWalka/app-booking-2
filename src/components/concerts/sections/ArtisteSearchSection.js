import React from 'react';
import styles from './ArtisteSearchSection.module.css';
import SearchDropdown from './SearchDropdown';
import SelectedEntityCard from './SelectedEntityCard';
import CardSection from '@/components/ui/CardSection';

/**
 * ArtisteSearchSection - Section de recherche et sélection d'artiste(s)
 * Permet d'ajouter plusieurs artistes sous forme de liste
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {string} props.artisteSearchTerm - Terme de recherche pour l'artiste
 * @param {Function} props.setArtisteSearchTerm - Fonction pour mettre à jour le terme de recherche
 * @param {Array} props.artisteResults - Résultats de la recherche d'artistes
 * @param {boolean} props.showArtisteResults - Indique si les résultats doivent être affichés
 * @param {Function} props.setShowArtisteResults - Fonction pour contrôler l'affichage des résultats
 * @param {boolean} props.isSearchingArtistes - Indique si une recherche est en cours
 * @param {Object} props.artisteDropdownRef - Référence pour gérer le clic en dehors du dropdown
 * @param {Object} props.selectedArtiste - Artiste sélectionné
 * @param {Function} props.handleSelectArtiste - Fonction pour sélectionner un artiste
 * @param {Function} props.handleRemoveArtiste - Fonction pour désélectionner l'artiste
 * @param {Function} props.handleCreateArtiste - Fonction pour créer un nouvel artiste
 */
const ArtisteSearchSection = ({ 
  artisteSearchTerm, 
  setArtisteSearchTerm,
  artisteResults,
  showArtisteResults,
  setShowArtisteResults,
  isSearchingArtistes,
  artisteDropdownRef,
  selectedArtiste,
  handleSelectArtiste,
  handleRemoveArtiste,
  handleCreateArtiste
}) => {
  // État local pour gérer la liste des artistes
  const [artistesList, setArtistesList] = React.useState([]);
  const [showAddArtiste, setShowAddArtiste] = React.useState(true);
  
  // Fonction pour ajouter un artiste à la liste
  const handleAddArtisteToList = (artiste) => {
    if (artiste && !artistesList.find(a => a.id === artiste.id)) {
      setArtistesList([...artistesList, artiste]);
      setArtisteSearchTerm('');
      setShowAddArtiste(false);
      // Toujours garder le premier artiste comme selectedArtiste pour la compatibilité
      if (artistesList.length === 0) {
        handleSelectArtiste(artiste);
      }
    }
  };
  
  // Fonction pour retirer un artiste de la liste
  const handleRemoveArtisteFromList = (artisteId) => {
    const updatedList = artistesList.filter(a => a.id !== artisteId);
    setArtistesList(updatedList);
    // Si on retire l'artiste principal, mettre à jour
    if (selectedArtiste && selectedArtiste.id === artisteId) {
      if (updatedList.length > 0) {
        handleSelectArtiste(updatedList[0]);
      } else {
        handleRemoveArtiste();
        setShowAddArtiste(true);
      }
    }
  };
  
  return (
    <CardSection
      title="Artiste(s)"
      icon={<i className="bi bi-music-note-beamed"></i>}
      isEditing={true}
      hasDropdown={true}
      className="artiste-section"
      headerClassName="artiste required"
    >
      <div className={styles.cardBody} ref={artisteDropdownRef}>
        {/* Afficher la liste des artistes ajoutés */}
        {artistesList.length > 0 && (
          <>
            <label className={styles.formLabel}>
              {artistesList.length === 1 ? 'Artiste sélectionné' : `${artistesList.length} artistes sélectionnés`}
            </label>
            <div className={styles.artistesList}>
              {artistesList.map((artiste, index) => (
                <div key={artiste.id} className={styles.artisteItem}>
                  <SelectedEntityCard
                    entity={artiste}
                    entityType="artiste"
                    onRemove={() => handleRemoveArtisteFromList(artiste.id)}
                    primaryField="nom"
                    secondaryFields={[
                      { 
                        icon: "bi-music-note", 
                        value: artiste.genre 
                      },
                      { 
                        icon: "bi-people", 
                        value: artiste.nbMembres,
                        prefix: "Membres: ",
                        suffix: artiste.nbMembres > 1 ? " personnes" : " personne"
                      },
                      { 
                        icon: "bi-envelope", 
                        value: artiste.email
                      }
                    ]}
                  />
                  {index === 0 && artistesList.length > 1 && (
                    <span className={styles.principalBadge}>Principal</span>
                  )}
                </div>
              ))}
            </div>
            
            {/* Bouton pour ajouter un autre artiste */}
            {!showAddArtiste && (
              <button
                type="button"
                className={styles.addAnotherButton}
                onClick={() => setShowAddArtiste(true)}
              >
                <i className="bi bi-plus-circle"></i>
                Ajouter un autre artiste
              </button>
            )}
          </>
        )}
        
        {/* Formulaire de recherche/ajout */}
        {(artistesList.length === 0 || showAddArtiste) && (
          <>
            <label className={styles.formLabel}>
              {artistesList.length === 0 ? 'Rechercher un artiste' : 'Ajouter un autre artiste'}
            </label>
            <SearchDropdown
              searchTerm={artisteSearchTerm}
              setSearchTerm={setArtisteSearchTerm}
              results={artisteResults}
              showResults={showArtisteResults}
              setShowResults={setShowArtisteResults}
              isSearching={isSearchingArtistes}
              placeholder="Rechercher un artiste par nom..."
              onSelect={handleAddArtisteToList}
              onCreate={() => handleCreateArtiste(handleAddArtisteToList)}
              createButtonText="Nouvel artiste"
              emptyResultsText="Aucun artiste trouvé"
              entityType="artiste"
            />
            <small className={styles.formHelpText}>
              Tapez au moins 2 caractères pour rechercher un artiste par nom.
            </small>
            
            {showAddArtiste && artistesList.length > 0 && (
              <button
                type="button"
                className={styles.cancelAddButton}
                onClick={() => {
                  setShowAddArtiste(false);
                  setArtisteSearchTerm('');
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

export default ArtisteSearchSection;
