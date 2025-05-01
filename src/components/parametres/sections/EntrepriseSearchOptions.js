import React from 'react';
import { Button } from 'react-bootstrap';
import styles from './EntrepriseSearchOptions.module.css';

/**
 * Component for company search options (manual/name/SIRET)
 * 
 * @param {Object} props - Component props
 * @param {string} props.searchType - Current search type
 * @param {Function} props.setSearchType - Function to update search type
 */
const EntrepriseSearchOptions = ({ searchType, setSearchType }) => {
  return (
    <div className="mb-4">
      <h5>How would you like to enter your company information?</h5>
      <div className={styles.searchTypeButtons}>
        <Button 
          variant={searchType === 'manual' ? 'primary' : 'outline-primary'} 
          onClick={() => setSearchType('manual')}
        >
          <i className="bi bi-pencil-fill me-2"></i>
          Manual Entry
        </Button>
        <Button 
          variant={searchType === 'name' ? 'primary' : 'outline-primary'} 
          onClick={() => setSearchType('name')}
        >
          <i className="bi bi-search me-2"></i>
          Search by Name
        </Button>
        <Button 
          variant={searchType === 'siret' ? 'primary' : 'outline-primary'} 
          onClick={() => setSearchType('siret')}
        >
          <i className="bi bi-upc-scan me-2"></i>
          Search by SIREN/SIRET
        </Button>
      </div>
    </div>
  );
};

export default EntrepriseSearchOptions;