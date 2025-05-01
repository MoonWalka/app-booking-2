import React from 'react';
import styles from './LieuAddressSection.module.css';
import LieuMapDisplay from './LieuMapDisplay';

const LieuAddressSection = ({ lieu, handleChange, addressSearch }) => {
  const {
    addressSuggestions,
    isSearchingAddress,
    addressFieldActive,
    setAddressFieldActive,
    addressInputRef,
    suggestionsRef,
    handleSelectAddress
  } = addressSearch;

  // Check if we should show the map
  const showMap = lieu.latitude && lieu.longitude;

  return (
    <div className={styles.formCard}>
      <div className={styles.cardHeader}>
        <i className="bi bi-geo-alt"></i>
        <h3>Adresse</h3>
      </div>
      <div className={styles.cardBody}>
        <div className="mb-3 address-search-container">
          <label htmlFor="adresse" className="form-label">
            Adresse <span className={styles.required}>*</span>
          </label>
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              id="adresse"
              name="adresse"
              ref={addressInputRef}
              value={lieu.adresse}
              onChange={handleChange}
              required
              placeholder="Commencez à taper une adresse..."
              autoComplete="off"
              onFocus={() => setAddressFieldActive(true)}
              onBlur={() => {
                // Delay to allow clicking on a suggestion
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
          
          {/* Address suggestions */}
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
          
          {/* Search indicator */}
          {isSearchingAddress && (
            <div className={styles.addressSearching}>
              <div className="spinner-border spinner-border-sm text-primary" role="status">
                <span className="visually-hidden">Recherche en cours...</span>
              </div>
              <span className="searching-text">Recherche d'adresses...</span>
            </div>
          )}
        </div>

        <div className="row mb-3">
          <div className="col-md-4">
            <div className="mb-md-0">
              <label htmlFor="codePostal" className="form-label">
                Code postal <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                className="form-control"
                id="codePostal"
                name="codePostal"
                value={lieu.codePostal}
                onChange={handleChange}
                required
                placeholder="Ex: 75001"
              />
            </div>
          </div>
          <div className="col-md-8">
            <div className="mb-md-0">
              <label htmlFor="ville" className="form-label">
                Ville <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                className="form-control"
                id="ville"
                name="ville"
                value={lieu.ville}
                onChange={handleChange}
                required
                placeholder="Ex: Paris"
              />
            </div>
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="pays" className="form-label">
            Pays <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            className="form-control"
            id="pays"
            name="pays"
            value={lieu.pays}
            onChange={handleChange}
            required
          />
        </div>
        
        {/* Display map when coordinates are available */}
        {showMap && (
          <LieuMapDisplay
            lieu={lieu}
            setLieu={lieu => {}} // This will be filled in with proper function
          />
        )}
      </div>
    </div>
  );
};

export default LieuAddressSection;
