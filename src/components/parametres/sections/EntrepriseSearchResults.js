import React from 'react';
import Alert from '@/components/ui/Alert';
import styles from './EntrepriseSearchResults.module.css';
import { Form } from 'react-bootstrap';

/**
 * Component for displaying company search results and input field
 * 
 * @param {Object} props - Component props
 * @param {string} props.searchType - Current search type
 * @param {string} props.searchTerm - Current search term
 * @param {Function} props.setSearchTerm - Function to update search term
 * @param {Array} props.searchResults - Array of search results
 * @param {boolean} props.isSearching - Whether a search is in progress
 * @param {Function} props.handleSelectCompany - Function to handle company selection
 * @param {Object} props.searchResultsRef - Ref for the search results container
 */
const EntrepriseSearchResults = ({
  searchType,
  searchTerm,
  setSearchTerm,
  searchResults,
  isSearching,
  handleSelectCompany,
  searchResultsRef
}) => {
  if (searchType === 'manual') {
    return null;
  }

  return (
    <div className={styles.searchBox}>
      <div className="input-group">
        <span className="input-group-text">
          <i className={`bi ${searchType === 'name' ? 'bi-building' : 'bi-upc'}`}></i>
        </span>
        <Form.Control
          type="text"
          placeholder={searchType === 'name' 
            ? "Enter company name..." 
            : "Enter SIREN or SIRET number..."
          }
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {isSearching && (
          <span className="input-group-text">
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">Searching...</span>
            </div>
          </span>
        )}
      </div>
      <small className="form-text text-muted">
        {searchType === 'name' 
          ? "Enter at least 3 characters to start searching" 
          : "Enter a SIREN (9 digits) or SIRET (14 digits) number"
        }
      </small>
      
      {/* Search results */}
      {searchResults.length > 0 && (
        <div ref={searchResultsRef} className={styles.suggestionsList}>
          {searchResults.map((company, index) => (
            <div
              key={index}
              className={styles.suggestionItem}
              onClick={() => handleSelectCompany(company)}
            >
              <div className={styles.suggestionIcon}>
                <i className="bi bi-building-fill"></i>
              </div>
              <div className={styles.suggestionContent}>
                <div className={styles.suggestionTitle}>{company.nom}</div>
                <div className={styles.suggestionSubtitle}>
                  {company.adresse && `${company.adresse}, `}{company.codePostal} {company.ville}
                </div>
                <div className={styles.suggestionDetails}>
                  {company.siren && `SIREN: ${company.siren} • `}
                  {company.siret && `SIRET: ${company.siret} • `}
                  {company.codeAPE && `APE: ${company.codeAPE} `}
                  {company.libelleAPE && `(${company.libelleAPE}) • `}
                  {company.statutJuridique}
                </div>
              </div>
              {company.active ? (
                <span className="badge bg-success">Active</span>
              ) : (
                <span className="badge bg-danger">Closed</span>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* No results message */}
      {searchTerm.length >= 3 && searchResults.length === 0 && !isSearching && (
        <Alert variant="info" className={styles.noResultsAlert}>
          No company found. Check your search or try different terms.
        </Alert>
      )}
    </div>
  );
};

export default EntrepriseSearchResults;