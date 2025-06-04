import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useEntitySearch } from '@/hooks/common';
import styles from './EntitySearchField.module.css';

/**
 * Composant pour la recherche d'entités (contacts, lieux, artistes)
 * 
 * @param {Object} props - Propriétés du composant
 * @param {string} props.entityType - Type d'entité à rechercher ('contact', 'lieu', 'artiste')
 * @param {string} props.placeholder - Texte d'aide dans le champ
 * @param {string} props.label - Label du champ
 * @param {Function} props.onSelect - Callback appelé quand une entité est sélectionnée
 * @param {Function} props.onCreate - Callback appelé pour créer une nouvelle entité
 * @param {Object} props.selectedEntity - Entité actuellement sélectionnée
 * @param {Function} props.onRemove - Callback appelé pour supprimer l'entité sélectionnée
 * @param {string} props.className - Classes CSS additionnelles
 */
const EntitySearchField = ({
  entityType = 'contact',
  placeholder = 'Rechercher...',
  label = 'Rechercher',
  onSelect,
  onCreate,
  selectedEntity = null,
  onRemove,
  className = '',
}) => {
  // Options pour le hook de recherche
  const options = {
    collectionName: entityType + 's', // pluriel pour la collection
  };

  // Utiliser le hook de recherche d'entités
  const {
    searchTerm,
    setSearchTerm,
    results,
    isSearching,
    showResults,
    setShowResults,
    dropdownRef,
    handleSelectEntity,
    handleCreateEntity,
  } = useEntitySearch(options);

  // État pour suivre l'entité sélectionnée localement
  const [localSelectedEntity, setLocalSelectedEntity] = useState(selectedEntity);

  // Mettre à jour l'état local quand l'entité sélectionnée change
  useEffect(() => {
    setLocalSelectedEntity(selectedEntity);
  }, [selectedEntity]);

  // Gérer la sélection d'une entité
  const handleSelect = (entity) => {
    setLocalSelectedEntity(entity);
    
    if (onSelect) {
      onSelect(entity);
    }
    
    handleSelectEntity(entity);
    setSearchTerm('');
  };

  // Gérer la création d'une nouvelle entité
  const handleCreate = () => {
    if (searchTerm.length < 2) {
      alert(`Veuillez saisir au moins 2 caractères pour créer un(e) ${entityType}.`);
      return;
    }
    
    if (onCreate) {
      onCreate(searchTerm);
    } else {
      handleCreateEntity(searchTerm, handleSelect);
    }
  };

  // Gérer la suppression de l'entité sélectionnée
  const handleRemove = () => {
    setLocalSelectedEntity(null);
    
    if (onRemove) {
      onRemove();
    }
  };

  // Obtenir l'icône en fonction du type d'entité
  const getEntityIcon = () => {
    switch (entityType) {
      case 'contact':
        return 'bi-person';
      case 'lieu':
        return 'bi-geo-alt';
      case 'artiste':
        return 'bi-music-note';
      default:
        return 'bi-search';
    }
  };

  return (
    <div className={`${styles.container} ${className}`}>
      {label && <label className={styles.label}>{label}</label>}
      
      {!localSelectedEntity ? (
        <div className={styles.searchContainer}>
          <div className={styles.inputWrapper}>
            <span className={styles.icon}>
              <i className={`bi ${getEntityIcon()}`}></i>
            </span>
            
            <input
              type="text"
              className={styles.input}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={placeholder}
              onFocus={() => searchTerm.length >= 2 && setShowResults(true)}
              autoComplete="off"
            />
            
            {isSearching && (
              <span className={styles.loadingIndicator}>
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Recherche...</span>
                </div>
              </span>
            )}
          </div>
          
          {searchTerm.length >= 2 && (
            <button
              type="button"
              className={styles.createButton}
              onClick={handleCreate}
            >
              <i className="bi bi-plus-circle me-1"></i>
              Créer "{searchTerm}"
            </button>
          )}
          
          {/* Résultats de recherche */}
          {showResults && results.length > 0 && (
            <div className={styles.suggestions} ref={dropdownRef}>
              {results.map((entity) => (
                <div
                  key={entity.id}
                  className={styles.suggestionItem}
                  onClick={() => handleSelect(entity)}
                >
                  <div className={styles.suggestionIcon}>
                    <i className={`bi ${getEntityIcon()}`}></i>
                  </div>
                  <div className={styles.suggestionText}>
                    <div className={styles.suggestionName}>{entity.nom}</div>
                    <div className={styles.suggestionDetails}>
                      {entity.structure && <span className={styles.entityStructure}>{entity.structure}</span>}
                      {entity.email && <span className={styles.entityEmail}>{entity.email}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Message si aucun résultat */}
          {searchTerm.length >= 2 && results.length === 0 && !isSearching && (
            <div className={styles.noResults}>
              Aucun résultat trouvé
            </div>
          )}
        </div>
      ) : (
        <div className={styles.selectedEntity}>
          <div className={styles.entityInfo}>
            <div className={styles.entityIcon}>
              <i className={`bi ${getEntityIcon()}`}></i>
            </div>
            <div className={styles.entityDetails}>
              <div className={styles.entityName}>{localSelectedEntity.nom}</div>
              {localSelectedEntity.structure && (
                <div className={styles.entityStructure}>{localSelectedEntity.structure}</div>
              )}
              <div className={styles.entityContacts}>
                {localSelectedEntity.email && (
                  <span className={styles.entityContact}>
                    <i className="bi bi-envelope me-1"></i> {localSelectedEntity.email}
                  </span>
                )}
                {localSelectedEntity.telephone && (
                  <span className={styles.entityContact}>
                    <i className="bi bi-telephone me-1"></i> {localSelectedEntity.telephone}
                  </span>
                )}
              </div>
            </div>
            <button
              type="button"
              className={styles.removeButton}
              onClick={handleRemove}
              aria-label={`Supprimer ${entityType}`}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

EntitySearchField.propTypes = {
  entityType: PropTypes.oneOf(['contact', 'lieu', 'artiste']),
  placeholder: PropTypes.string,
  label: PropTypes.string,
  onSelect: PropTypes.func,
  onCreate: PropTypes.func,
  selectedEntity: PropTypes.object,
  onRemove: PropTypes.func,
  className: PropTypes.string,
};

export default EntitySearchField;