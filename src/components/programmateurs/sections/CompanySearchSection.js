import React from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';
import Card from '@components/ui/Card';
import styles from './CompanySearchSection.module.css';

/**
 * CompanySearchSection - Section de recherche d'entreprise
 * Permet de rechercher une entreprise par son SIRET ou sa raison sociale
 */
const CompanySearchSection = ({ 
  searchType,
  setSearchType,
  searchTerm,
  setSearchTerm,
  searchResults,
  isSearchingCompany,
  handleSelectCompany,
  searchCompany
}) => {
  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (searchTerm && searchTerm.trim()) {
      searchCompany();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <Card
      title="Rechercher une structure existante"
      icon={<i className="bi bi-search"></i>}
      variant="primary"
      className={styles.sectionCard}
    >
      <div>
        <div className={styles.searchContainer}>
          <Form.Group className={styles.searchTypeGroup}>
            <Form.Check
              type="radio"
              id="search-siret"
              label="SIRET"
              name="searchType"
              value="siret"
              checked={searchType === 'siret'}
              onChange={() => setSearchType('siret')}
              className={styles.searchTypeOption}
            />
            <Form.Check
              type="radio"
              id="search-name"
              label="Raison sociale"
              name="searchType"
              value="name"
              checked={searchType === 'name'}
              onChange={() => setSearchType('name')}
              className={styles.searchTypeOption}
            />
          </Form.Group>

          <div className={styles.searchInputGroup}>
            <Form.Control
              type="text"
              placeholder={searchType === 'siret' ? "Entrez un numéro SIRET" : "Entrez une raison sociale"}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className={styles.searchInput}
            />
            <Button 
              type="button"
              variant="primary"
              onClick={handleSearch}
              disabled={isSearchingCompany || !searchTerm || !searchTerm.trim()}
              className={styles.searchButton}
            >
              {isSearchingCompany ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <i className="bi bi-search"></i>
              )}
            </Button>
          </div>
        </div>
      </div>

      {searchResults && searchResults.length > 0 && (
        <div className={styles.resultsContainer}>
          <h4 className={styles.resultsTitle}>Résultats de recherche</h4>
          <ul className={styles.resultsList}>
            {searchResults.map((company) => (
              <li key={company.siret} className={styles.resultItem}>
                <div className={styles.resultInfo}>
                  <h5 className={styles.companyName}>{company.nom}</h5>
                  <p className={styles.companyDetails}>
                    {company.siret} - {company.statutJuridique}
                  </p>
                  <p className={styles.companyAddress}>
                    {company.adresse}, {company.codePostal} {company.ville}
                  </p>
                </div>
                <Button 
                  variant="outline-primary"
                  onClick={() => handleSelectCompany(company)}
                  className={styles.selectButton}
                >
                  Sélectionner
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
};

export default CompanySearchSection;
