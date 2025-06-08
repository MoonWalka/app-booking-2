import React from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import styles from './EntrepriseFormFields.module.css';

/**
 * Component for the main enterprise form fields
 * 
 * @param {Object} props - Component props
 * @param {Object} props.formData - Current form data
 * @param {Function} props.handleChange - Function to handle input changes
 * @param {Object} props.addressSearch - Address search and autocomplete props
 */
const EntrepriseFormFields = ({ formData, handleChange, addressSearch }) => {
  const {
    addressSuggestions,
    isSearchingAddress,
    addressFieldActive,
    setAddressFieldActive,
    addressInputRef,
    suggestionsRef,
    handleSelectAddress
  } = addressSearch;
  
  return (
    <>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Company Name</Form.Label>
            <Form.Control
              type="text"
              name="nom"
              value={formData.nom || ''}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Logo (URL)</Form.Label>
            <Form.Control
              type="text"
              name="logo"
              value={formData.logo || ''}
              onChange={handleChange}
              placeholder="https://example.com/logo.png"
            />
            <Form.Text className="text-muted">
              L'URL de votre logo sera utilisée dans les factures
            </Form.Text>
          </Form.Group>
        </Col>
      </Row>
      
      <Form.Group className="mb-3 position-relative">
        <Form.Label>Address</Form.Label>
        <div className="input-group">
          <Form.Control
            type="text"
            name="adresse"
            ref={addressInputRef}
            value={formData.adresse || ''}
            onChange={handleChange}
            placeholder="Start typing an address..."
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
        <Form.Text className="text-muted">
          Start typing to see address suggestions
        </Form.Text>
        
        {/* Address suggestions */}
        {addressFieldActive && addressSuggestions && addressSuggestions.length > 0 && (
          <div ref={suggestionsRef} className={styles.suggestionsList}>
            {addressSuggestions.map((suggestion, index) => (
              <div
                key={index}
                className={styles.suggestionItem}
                onMouseDown={() => handleSelectAddress(suggestion)}
              >
                <div className={styles.suggestionIcon}>
                  <i className="bi bi-geo-alt-fill"></i>
                </div>
                <div className={styles.suggestionContent}>
                  <div className={styles.suggestionTitle}>{suggestion.display_name}</div>
                  {suggestion.address && suggestion.address.postcode && suggestion.address.city && (
                    <div className={styles.suggestionSubtitle}>
                      {suggestion.address.postcode} {suggestion.address.city}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Address search indicator */}
        {addressFieldActive && isSearchingAddress && (
          <div className={styles.searchingIndicator}>
            <div className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">Searching...</span>
            </div>
            <span>Searching addresses...</span>
          </div>
        )}
        
        {/* No results message when field is active but no suggestions */}
        {addressFieldActive && !isSearchingAddress && formData.adresse && formData.adresse.length > 2 && (!addressSuggestions || addressSuggestions.length === 0) && (
          <div className={styles.noResultsMessage}>
            <i className="bi bi-info-circle"></i>
            <span>No address suggestions found. Try a different search term.</span>
          </div>
        )}
      </Form.Group>
      
      <Row>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>Postal Code</Form.Label>
            <Form.Control
              type="text"
              name="codePostal"
              value={formData.codePostal || ''}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
        <Col md={8}>
          <Form.Group className="mb-3">
            <Form.Label>City</Form.Label>
            <Form.Control
              type="text"
              name="ville"
              value={formData.ville || ''}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
      </Row>
    </>
  );
};

export default EntrepriseFormFields;