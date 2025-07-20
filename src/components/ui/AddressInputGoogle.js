import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { useGooglePlacesAutocomplete } from '@/hooks/common/useGooglePlacesAutocomplete';
import styles from './AddressInput.module.css';

/**
 * Composant pour la saisie d'adresse avec autocomplétion Google Places
 * Version améliorée avec une meilleure précision des adresses
 */
const AddressInputGoogle = ({
  label,
  value,
  onChange,
  onAddressSelected,
  placeholder = "Commencez à taper pour rechercher une adresse...",
  name = 'address',
  disabled = false,
  required = false,
  error = null,
  className = '',
  inputClassName = '',
  dropdownClassName = ''
}) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [hasJustSelected, setHasJustSelected] = useState(false);
  
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const wrapperRef = useRef(null);
  const lastSearchedValue = useRef('');
  
  const {
    predictions,
    isLoading,
    error: apiError,
    searchAddresses,
    getPlaceDetails,
    clearPredictions
  } = useGooglePlacesAutocomplete();

  // Synchroniser avec la valeur externe
  useEffect(() => {
    console.log('🔄 [AddressInputGoogle] Sync from parent - value:', value, 'hasJustSelected:', hasJustSelected);
    setInputValue(value || '');
  }, [value]);

  // Rechercher les adresses avec debounce
  useEffect(() => {
    console.log('🔍 [AddressInputGoogle] Search effect triggered - inputValue:', inputValue, 'hasJustSelected:', hasJustSelected, 'lastSearched:', lastSearchedValue.current);
    
    // Si on vient de sélectionner, ne pas rechercher
    if (hasJustSelected) {
      console.log('⏭️ [AddressInputGoogle] Skipping search because hasJustSelected is true');
      setHasJustSelected(false);
      return;
    }
    
    // Si c'est la même valeur qu'on a déjà cherché, ne pas rechercher
    if (inputValue === lastSearchedValue.current && inputValue.length >= 3) {
      console.log('🔁 [AddressInputGoogle] Skipping search - already searched for:', inputValue);
      return;
    }
    
    const timer = setTimeout(() => {
      console.log('⏱️ [AddressInputGoogle] Debounce timer fired - inputValue:', inputValue);
      if (inputValue && inputValue.length >= 3) {
        // Vérifier encore une fois au cas où
        if (inputValue === lastSearchedValue.current) {
          console.log('🔁 [AddressInputGoogle] Skipping search in timer - already searched for:', inputValue);
          return;
        }
        console.log('🚀 [AddressInputGoogle] Starting search for:', inputValue);
        lastSearchedValue.current = inputValue; // Mémoriser la valeur recherchée
        searchAddresses(inputValue);
        setShowDropdown(true);
      } else {
        console.log('🚫 [AddressInputGoogle] Not searching - input too short or empty');
        clearPredictions();
        setShowDropdown(false);
        lastSearchedValue.current = ''; // Réinitialiser si input trop court
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, hasJustSelected]); // Retirer searchAddresses et clearPredictions des dépendances

  // Gérer les clics en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    console.log('⌨️ [AddressInputGoogle] User typing - newValue:', newValue);
    
    // Si l'utilisateur efface du texte, réinitialiser lastSearchedValue
    // pour permettre une nouvelle recherche
    if (newValue.length < inputValue.length) {
      lastSearchedValue.current = '';
    }
    
    setInputValue(newValue);
    
    // Appeler onChange pour mettre à jour la valeur parente
    if (onChange) {
      onChange(e);
    }
  };

  const handleSelectAddress = async (prediction) => {
    console.log('🎯 [AddressInputGoogle] Address selected - prediction:', prediction.description);
    try {
      // Fermer immédiatement le dropdown
      console.log('📦 [AddressInputGoogle] Closing dropdown and clearing predictions');
      setShowDropdown(false);
      clearPredictions();
      
      // Marquer qu'on vient de sélectionner
      console.log('🚩 [AddressInputGoogle] Setting hasJustSelected to true');
      setHasJustSelected(true);
      
      // Obtenir les détails complets de l'adresse
      console.log('📍 [AddressInputGoogle] Getting place details for:', prediction.place_id);
      const placeDetails = await getPlaceDetails(prediction.place_id);
      
      // Mettre à jour l'input avec l'adresse formatée
      const formattedAddress = placeDetails.fullStreet || prediction.description;
      console.log('✏️ [AddressInputGoogle] Setting inputValue to:', formattedAddress);
      setInputValue(formattedAddress);
      
      // Appeler onChange
      if (onChange) {
        console.log('📤 [AddressInputGoogle] Calling onChange with:', formattedAddress);
        onChange({
          target: {
            name,
            value: formattedAddress
          }
        });
      }
      
      // Appeler onAddressSelected avec toutes les données
      if (onAddressSelected) {
        console.log('📊 [AddressInputGoogle] Calling onAddressSelected with full data');
        onAddressSelected({
          adresse: placeDetails.fullStreet,
          codePostal: placeDetails.postalCode,
          ville: placeDetails.city,
          departement: placeDetails.department,
          region: placeDetails.region,
          pays: placeDetails.country,
          latitude: placeDetails.latitude,
          longitude: placeDetails.longitude,
          placeId: placeDetails.placeId,
          formattedAddress: placeDetails.formattedAddress
        });
      }
      console.log('✅ [AddressInputGoogle] Selection complete');
    } catch (error) {
      console.error('❌ [AddressInputGoogle] Error selecting address:', error);
    }
  };

  const handleKeyDown = (e) => {
    if (!showDropdown || predictions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < predictions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < predictions.length) {
          handleSelectAddress(predictions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        break;
    }
  };

  return (
    <div className={`${styles.addressInputWrapper} ${className}`} ref={wrapperRef}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      
      <div className={styles.inputContainer}>
        <input
          ref={inputRef}
          type="text"
          name={name}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => predictions.length > 0 && setShowDropdown(true)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`${styles.input} ${inputClassName} ${error ? styles.inputError : ''}`}
          autoComplete="off"
        />
        
        {isLoading && (
          <div className={styles.loadingIndicator}>
            <span className="spinner-border spinner-border-sm" />
          </div>
        )}
      </div>

      {(error || apiError) && (
        <div className={styles.errorMessage}>
          {error || apiError}
        </div>
      )}

      {showDropdown && predictions.length > 0 && (
        <div 
          ref={dropdownRef}
          className={`${styles.dropdown} ${dropdownClassName}`}
        >
          {predictions.map((prediction, index) => (
            <div
              key={prediction.place_id}
              className={`${styles.dropdownItem} ${
                index === selectedIndex ? styles.dropdownItemSelected : ''
              }`}
              onClick={() => handleSelectAddress(prediction)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className={styles.mainText}>
                {prediction.structured_formatting?.main_text || prediction.description.split(',')[0]}
              </div>
              <div className={styles.secondaryText}>
                {prediction.structured_formatting?.secondary_text || prediction.description.split(',').slice(1).join(',')}
              </div>
            </div>
          ))}
        </div>
      )}

      {!apiError && predictions.length === 0 && inputValue.length >= 3 && !isLoading && showDropdown && (
        <div className={`${styles.dropdown} ${dropdownClassName}`}>
          <div className={styles.noResults}>
            Aucune adresse trouvée
          </div>
        </div>
      )}
    </div>
  );
};

AddressInputGoogle.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  onAddressSelected: PropTypes.func,
  placeholder: PropTypes.string,
  name: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  error: PropTypes.string,
  className: PropTypes.string,
  inputClassName: PropTypes.string,
  dropdownClassName: PropTypes.string
};

export default AddressInputGoogle;