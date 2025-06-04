import React from 'react';
import Button from '@ui/Button';
import styles from './SearchDropdown.module.css';

/**
 * SearchDropdown - Composant réutilisable pour les champs de recherche avec dropdown
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {string} props.searchTerm - Le terme de recherche actuel
 * @param {Function} props.setSearchTerm - Fonction pour mettre à jour le terme de recherche
 * @param {Array} props.results - Les résultats de la recherche
 * @param {boolean} props.showResults - Indique si les résultats doivent être affichés
 * @param {Function} props.setShowResults - Fonction pour contrôler l'affichage des résultats
 * @param {boolean} props.isSearching - Indique si une recherche est en cours
 * @param {string} props.placeholder - Le texte d'indication dans l'input
 * @param {Function} props.onSelect - Fonction appelée lors de la sélection d'un résultat
 * @param {Function} props.onCreate - Fonction appelée pour créer une nouvelle entité
 * @param {string} props.createButtonText - Texte du bouton de création
 * @param {string} props.emptyResultsText - Texte à afficher lorsqu'il n'y a pas de résultats
 * @param {string} props.entityType - Type d'entité recherchée (lieu, contact, artiste)
 * @param {Function} props.onFocus - Fonction appelée lorsque l'input obtient le focus
 */
const SearchDropdown = ({
  searchTerm,
  setSearchTerm,
  results,
  showResults,
  setShowResults,
  isSearching,
  placeholder,
  onSelect,
  onCreate,
  createButtonText,
  emptyResultsText,
  entityType,
  onFocus
}) => {
  return (
    <div className={styles.searchContainer}>
      <div className={styles.inputGroup}>
        <span className={styles.inputGroupText}>
          <i className="bi bi-search"></i>
        </span>
        <input
          type="text"
          className={`${styles.formField} ${styles.searchInput}`}
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={onFocus}
        />
        <Button
          type="button"
          variant="outline-secondary"
          className={styles.createButton}
          onClick={onCreate}
          aria-label={`Créer un nouveau ${entityType}`}
        >
          <i className="bi bi-plus-lg"></i>
          {createButtonText || `Créer ${entityType}`}
        </Button>
      </div>
      
      {/* Dropdown des résultats */}
      {showResults && (
        <div className={styles.resultsDropdown}>
          {/* Bouton de fermeture du dropdown */}
          <div className={styles.dropdownHeader}>
            <span className={styles.dropdownTitle}>
              Résultats de recherche ({results.length})
            </span>
            {setShowResults && (
              <Button
                type="button"
                variant="link"
                size="sm"
                className={styles.closeDropdownButton}
                onClick={() => setShowResults(false)}
                aria-label="Fermer les résultats"
              >
                <i className="bi bi-x-lg"></i>
              </Button>
            )}
          </div>
          
          {/* État de chargement */}
          {isSearching && (
            <div className={styles.loadingContainer}>
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">Recherche en cours...</span>
              </div>
              <span className={styles.loadingText}>Recherche en cours...</span>
            </div>
          )}
          
          {/* Résultats */}
          {!isSearching && results.length > 0 && (
            <div className={styles.resultsList}>
              {results.map(item => (
                <div 
                  key={item.id} 
                  className={styles.resultItem}
                  onClick={() => onSelect(item)}
                >
                  <div className={styles.itemName}>{item.nom}</div>
                  {item.structure && <div className={styles.itemDetail}>{item.structure}</div>}
                  {item.email && <div className={styles.itemDetail}>{item.email}</div>}
                  {item.genre && <div className={styles.itemDetail}>{item.genre}</div>}
                  {item.adresse && (
                    <div className={styles.itemDetail}>
                      {item.adresse}
                      {item.codePostal && item.ville && (
                        <span>, {item.codePostal} {item.ville}</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Pas de résultats */}
          {!isSearching && results.length === 0 && searchTerm.length >= 2 && (
            <div className={styles.noResultsContainer}>
              <div className={styles.noResultsMessage}>
                {emptyResultsText || `Aucun ${entityType} trouvé`}
              </div>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={onCreate}
              >
                <i className="bi bi-plus-circle me-1"></i>
                {createButtonText || `Créer un nouveau ${entityType}`}
              </Button>
            </div>
          )}
          
          {/* Message pour longueur de recherche insuffisante */}
          {!isSearching && searchTerm.length < 2 && (
            <div className={styles.tipContainer}>
              <i className="bi bi-info-circle me-1"></i>
              Tapez au moins 2 caractères pour lancer la recherche
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchDropdown;
