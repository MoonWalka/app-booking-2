import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import useAddressSearch from '@/hooks/common/useAddressSearch';
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
 * @param {Object} props.address - Adresse complète sélectionnée (avec tous les détails)
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
  address = null,
  className = '',
}) => {
  // Utiliser le hook pour la recherche d'adresse
  const {
    searchTerm,
    setSearchTerm,
    addressResults,
    showResults,
    isSearching,
    dropdownRef,
    handleSearch,
    handleSelectAddress,
  } = useAddressSearch();

  // État pour suivre si l'input est actif
  const [isActive, setIsActive] = useState(false);

  // Mettre à jour le terme de recherche quand la valeur externe change
  useEffect(() => {
    if (value && !searchTerm && !isActive) {
      setSearchTerm(value);
    }
  }, [value, searchTerm, isActive]);

  // Gérer la sélection d'une adresse
  const handleSelect = (address) => {
    // Extraire les informations d'adresse
    let street = '';
    let postalCode = '';
    let city = '';
    let country = 'France';

    if (address.address) {
      street = address.address.house_number 
        ? `${address.address.house_number} ${address.address.road || ''}` 
        : address.address.road || '';
      postalCode = address.address.postcode || '';
      city = address.address.city || address.address.town || address.address.village || '';
      country = address.address.country || 'France';
    }

    // Mettre à jour l'input avec la rue
    if (onChange) {
      onChange({
        target: {
          name,
          value: street || address.display_name.split(',')[0]
        }
      });
    }

    // Si un callback est fourni, l'appeler avec toutes les informations d'adresse
    if (onAddressSelected) {
      onAddressSelected({
        adresse: street,
        codePostal: postalCode,
        ville: city,
        pays: country,
        latitude: address.lat,
        longitude: address.lon,
        display_name: address.display_name
      });
    }

    // Gérer la sélection via le hook
    handleSelectAddress(address);
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
          onFocus={() => setIsActive(true)}
          onBlur={() => setTimeout(() => setIsActive(false), 200)}
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
      
      <small className="form-text text-muted">
        Commencez à taper pour voir des suggestions d'adresses
      </small>
      
      {/* Suggestions d'adresse */}
      {showResults && addressResults.length > 0 && (
        <div className={styles.suggestions} ref={dropdownRef}>
          {addressResults.map((suggestion, index) => (
            <div
              key={index}
              className={styles.suggestionItem}
              onClick={() => handleSelect(suggestion)}
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
          ))}
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
  address: PropTypes.object,
  className: PropTypes.string,
};

export default AddressInput;