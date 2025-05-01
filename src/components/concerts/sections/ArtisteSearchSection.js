import React from 'react';
import styles from './ArtisteSearchSection.module.css';
import SearchDropdown from './SearchDropdown';
import SelectedEntityCard from './SelectedEntityCard';

/**
 * ArtisteSearchSection - Section de recherche et sélection d'artiste
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {string} props.artisteSearchTerm - Terme de recherche pour l'artiste
 * @param {Function} props.setArtisteSearchTerm - Fonction pour mettre à jour le terme de recherche
 * @param {Array} props.artisteResults - Résultats de la recherche d'artistes
 * @param {boolean} props.showArtisteResults - Indique si les résultats doivent être affichés
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
  isSearchingArtistes,
  artisteDropdownRef,
  selectedArtiste,
  handleSelectArtiste,
  handleRemoveArtiste,
  handleCreateArtiste
}) => {
  return (
    <div className={styles.formCard}>
      <div className={styles.cardHeader}>
        <div className={styles.cardIcon}>
          <i className="bi bi-music-note-beamed"></i>
        </div>
        <h3 className={styles.cardTitle}>Artiste</h3>
      </div>
      
      <div className={styles.cardBody}>
        <div className={styles.searchContainer} ref={artisteDropdownRef}>
          {!selectedArtiste ? (
            <>
              <label className={styles.formLabel}>Rechercher un artiste</label>
              <SearchDropdown
                searchTerm={artisteSearchTerm}
                setSearchTerm={setArtisteSearchTerm}
                results={artisteResults}
                showResults={showArtisteResults}
                isSearching={isSearchingArtistes}
                placeholder="Rechercher un artiste par nom..."
                onSelect={handleSelectArtiste}
                onCreate={() => handleCreateArtiste(artisteSearchTerm, handleSelectArtiste)}
                createButtonText="Nouvel artiste"
                emptyResultsText="Aucun artiste trouvé"
                entityType="artiste"
              />
              <small className={styles.formHelpText}>
                Tapez au moins 2 caractères pour rechercher un artiste par nom.
              </small>
            </>
          ) : (
            <>
              <label className={styles.formLabel}>Artiste sélectionné</label>
              <SelectedEntityCard
                entity={selectedArtiste}
                entityType="artiste"
                onRemove={handleRemoveArtiste}
                primaryField="nom"
                secondaryFields={[
                  { 
                    icon: "bi-music-note", 
                    value: selectedArtiste.genre 
                  },
                  { 
                    icon: "bi-people", 
                    value: selectedArtiste.nbMembres,
                    prefix: "Membres: ",
                    suffix: selectedArtiste.nbMembres > 1 ? " personnes" : " personne"
                  },
                  { 
                    icon: "bi-envelope", 
                    value: selectedArtiste.email
                  }
                ]}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtisteSearchSection;
