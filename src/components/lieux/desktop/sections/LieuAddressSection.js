import React, { useState, useRef, useEffect } from 'react';
import styles from './LieuAddressSection.module.css';
import Spinner from '@/components/common/Spinner';

/**
 * Address section component for venue details
 */
const LieuAddressSection = ({ 
  lieu, 
  formData, 
  isEditing, 
  handleChange, 
  addressSuggestions,
  isSearchingAddress,
  handleSelectAddress,
  setAddressFieldActive
}) => {
  const addressInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Gestionnaire de clic extérieur pour fermer les suggestions d'adresse
  useEffect(() => {
    if (!isEditing) return; // Ne rien faire si on n'est pas en mode édition
    
    const handleClickOutsideAddressSuggestions = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) && 
          addressInputRef.current && !addressInputRef.current.contains(event.target)) {
        // Cette action est réalisée au niveau parent via setAddressFieldActive(false)
      }
    };
    
    document.addEventListener('mousedown', handleClickOutsideAddressSuggestions);
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideAddressSuggestions);
    };
  }, [isEditing]);

  return (
    <div className={styles.formCard}>
      <div className={styles.cardHeader}>
        <i className="bi bi-geo-alt"></i>
        <h3>Adresse</h3>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.formGroup}>
          <label htmlFor="adresse" className={styles.formLabel}>
            Adresse {isEditing && <span className={styles.required}>*</span>}
          </label>
          {isEditing ? (
            <div className={styles.addressSearchContainer}>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  id="adresse"
                  name="adresse"
                  ref={addressInputRef}
                  value={formData.adresse}
                  onChange={handleChange}
                  required
                  placeholder="Commencez à taper une adresse..."
                  autoComplete="off"
                  onFocus={() => setAddressFieldActive(true)}
                  onBlur={() => {
                    // Délai pour permettre le clic sur une suggestion
                    setTimeout(() => setAddressFieldActive(false), 200);
                  }}
                />
                <span className="input-group-text">
                  <i className="bi bi-geo-alt"></i>
                </span>
              </div>
              <small className="form-text text-muted">
                Commencez à taper pour voir des suggestions d'adresses
              </small>
              
              {/* Suggestions d'adresse */}
              {addressSuggestions && addressSuggestions.length > 0 && (
                <div className={styles.addressSuggestions} ref={suggestionsRef}>
                  {addressSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className={styles.addressSuggestionItem}
                      onClick={() => handleSelectAddress(suggestion)}
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
              {isSearchingAddress && (
                <div className={styles.addressSearching}>
                  <Spinner 
                    size="sm" 
                    variant="primary" 
                    message="Recherche d'adresses..." 
                    transparent={true}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className={styles.formControlStatic}>{lieu.adresse}</div>
          )}
        </div>

        <div className="row">
          <div className="col-md-4">
            <div className={styles.formGroup}>
              <label htmlFor="codePostal" className={styles.formLabel}>
                Code postal {isEditing && <span className={styles.required}>*</span>}
              </label>
              {isEditing ? (
                <input
                  type="text"
                  className="form-control"
                  id="codePostal"
                  name="codePostal"
                  value={formData.codePostal}
                  onChange={handleChange}
                  required
                  placeholder="Ex: 75001"
                />                     
              ) : (
                <div className={styles.formControlStatic}>{lieu.codePostal}</div>
              )}
            </div>
          </div>
          <div className="col-md-8">
            <div className={styles.formGroup}>
              <label htmlFor="ville" className={styles.formLabel}>
                Ville {isEditing && <span className={styles.required}>*</span>}
              </label>
              {isEditing ? (
                <input
                  type="text"
                  className="form-control"
                  id="ville"
                  name="ville"
                  value={formData.ville}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Paris"
                />
              ) : (
                <div className={styles.formControlStatic}>{lieu.ville}</div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="pays" className={styles.formLabel}>
            Pays {isEditing && <span className={styles.required}>*</span>}
          </label>
          {isEditing ? (
            <input
              type="text"
              className="form-control"
              id="pays"
              name="pays"
              value={formData.pays}
              onChange={handleChange}
              required
            />
          ) : (
            <div className={styles.formControlStatic}>{lieu.pays}</div>
          )}
        </div>
        
        {/* Affichage de la carte uniquement en mode visualisation */}
        {!isEditing && lieu.adresse && (
          <div className={`${styles.mapPreview} mt-4`}>
            <div className={`${styles.mapContainer} mb-3`}>
              <iframe 
                src={`https://maps.google.com/maps?q=${encodeURIComponent(`${lieu.adresse}, ${lieu.codePostal} ${lieu.ville}`)}&z=14&output=embed`}
                width="100%" 
                height="300" 
                style={{border: '1px solid #ddd', borderRadius: '8px'}}
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Carte du lieu"
              ></iframe>
            </div>
            <div className="text-center">
              <a 
                href={`https://maps.google.com/maps?q=${encodeURIComponent(`${lieu.adresse}, ${lieu.codePostal} ${lieu.ville}`)}`}
                target="_blank"
                rel="noopener noreferrer" 
                className="btn btn-sm btn-outline-primary"
              >
                <i className="bi bi-map me-2"></i>
                Voir sur Google Maps
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LieuAddressSection;