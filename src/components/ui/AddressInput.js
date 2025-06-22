import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { useAddressSearch } from '@/hooks/common';
import styles from './AddressInput.module.css';

/**
 * Composant pour la saisie d'adresse avec autocomplétion
 * 
 * @param {Object} props - Propriétés du composant
 * @param {string} props.value - Valeur actuelle du champ
 * @param {Function} props.onChange - Fonction appelée lors du changement de valeur
 * @param {string} props.name - Nom du champ
 * @param {string} props.label - Label du champ
 * @param {boolean} props.required - Indique si le champ est obligatoire
 * @param {string} props.placeholder - Texte d'aide dans le champ
 * @param {Function} props.onAddressSelected - Callback appelé quand une adresse est sélectionnée
 * @param {string} props.className - Classes CSS additionnelles
 */
const AddressInput = ({
  value = '',
  onChange,
  name = 'adresse',
  label = 'Adresse',
  required = false,
  placeholder = 'Commencez à taper pour rechercher une adresse',
  onAddressSelected = null,
  className = '',
}) => {
  // État local pour bloquer temporairement l'affichage des résultats après sélection
  const [isSelecting, setIsSelecting] = useState(false);
  const blockTimeoutRef = useRef(null);
  
  // Utiliser le hook pour la recherche d'adresse
  const {
    searchTerm,
    setSearchTerm,
    addressResults,
    showResults,
    setShowResults,
    isSearching,
    dropdownRef,
  } = useAddressSearch();

  // Mettre à jour le terme de recherche quand la valeur externe change
  useEffect(() => {
    setSearchTerm(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]); // setSearchTerm est stable (useState) - l'ajouter créerait une boucle infinie

  // Nettoyer le timeout au démontage
  useEffect(() => {
    return () => {
      if (blockTimeoutRef.current) {
        clearTimeout(blockTimeoutRef.current);
      }
    };
  }, []);

  // Gérer la sélection d'une adresse
  const handleSelect = (address) => {
    // Fermer immédiatement et bloquer l'affichage
    setShowResults(false);
    setIsSelecting(true);
    
    if (blockTimeoutRef.current) {
      clearTimeout(blockTimeoutRef.current);
    }
    
    blockTimeoutRef.current = setTimeout(() => {
      setIsSelecting(false);
    }, 1000); // Délai plus long pour éviter la réouverture
    
    // Extraire les informations d'adresse
    let street = '';
    let postalCode = '';
    let city = '';
    let country = 'France';
    let department = '';
    let region = '';

    if (address.address) {
      street = address.address.house_number 
        ? `${address.address.house_number} ${address.address.road || ''}` 
        : address.address.road || '';
      postalCode = address.address.postcode || '';
      city = address.address.city || address.address.town || address.address.village || '';
      country = address.address.country || 'France';
      
      // Extraire département et région avec les mêmes champs que useAddressSearch
      department = address.address.county || 
                  address.address.state_district || 
                  address.address.administrative_area_level_2 || '';
      
      region = address.address.state || 
              address.address.region || 
              address.address.administrative_area_level_1 || '';
    }

    // Adresse complète à afficher
    const fullAddress = street || address.display_name.split(',')[0];

    // Mettre à jour l'input avec la rue
    if (onChange) {
      onChange({
        target: {
          name,
          value: fullAddress
        }
      });
    }
    
    // Mettre à jour le terme de recherche local
    setSearchTerm(fullAddress);

    // Ne PAS appeler handleSelectAddress qui pourrait rouvrir le dropdown
    // handleSelectAddress(address);

    // Si un callback est fourni, l'appeler avec toutes les informations d'adresse
    if (onAddressSelected) {
      // Utiliser setTimeout pour s'assurer que le dropdown est fermé avant le callback
      setTimeout(() => {
        onAddressSelected({
          adresse: fullAddress,
          codePostal: postalCode,
          ville: city,
          pays: country,
          departement: department,
          region: region,
          latitude: address.lat,
          longitude: address.lon,
          display_name: address.display_name
        });
      }, 0);
    }
  };

  return (
    <div className={`${styles.container} ${className}`}>
      {label && (
        <label htmlFor={name} className={styles.label}>
          {label} {required && <span className={styles.required}>*</span>}
        </label>
      )}
      
      <div className={styles.inputWrapper}>
        <span className={styles.icon}>
          <i className="bi bi-geo-alt"></i>
        </span>
        
        <input
          type="text"
          id={name}
          className={styles.input}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
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
      
      {/* Suggestions d'adresse */}
      {showResults && !isSelecting && (
        <div className={styles.suggestions} ref={dropdownRef}>
          {addressResults.length > 0 ? (
            addressResults.map((suggestion, index) => (
              <div
                key={index}
                className={styles.suggestionItem}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelect(suggestion);
                }}
                onMouseDown={(e) => {
                  // Empêcher le blur de l'input qui pourrait fermer le dropdown prématurément
                  e.preventDefault();
                }}
              >
                <div className={styles.suggestionIcon}>
                  <i className="bi bi-geo-alt-fill"></i>
                </div>
                <div className={styles.suggestionText}>
                  <div className={styles.suggestionName}>{suggestion.display_name}</div>
                  {suggestion.address && (
                    <div className={styles.suggestionDetails}>
                      {suggestion.address.postcode && suggestion.address.city && (
                        <span>{suggestion.address.postcode} {suggestion.address.city}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            searchTerm && searchTerm.length >= 3 && !isSearching && (
              <div className={styles.noResults}>
                <div className={styles.noResultsIcon}>
                  <i className="bi bi-search"></i>
                </div>
                <div className={styles.noResultsText}>
                  <div className={styles.noResultsMessage}>Aucune adresse trouvée</div>
                  <div className={styles.noResultsHint}>Essayez de modifier votre recherche</div>
                </div>
              </div>
            )
          )}
        </div>
      )}
      
      {/* Indicateur de recherche */}
      {isSearching && (
        <div className={styles.searchingIndicator}>
          <div className="spinner-border spinner-border-sm" role="status">
            <span className="visually-hidden">Recherche en cours...</span>
          </div>
          <span>Recherche d'adresses...</span>
        </div>
      )}
    </div>
  );
};

AddressInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string,
  label: PropTypes.string,
  required: PropTypes.bool,
  placeholder: PropTypes.string,
  onAddressSelected: PropTypes.func,
  className: PropTypes.string,
};

export default AddressInput;