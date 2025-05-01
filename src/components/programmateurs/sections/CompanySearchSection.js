import React, { useState } from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';
import styles from './CompanySearchSection.module.css';

/**
 * CompanySearchSection - Section de recherche d'entreprise
 * Permet de rechercher une entreprise par son SIRET ou sa raison sociale
 */
const CompanySearchSection = ({ 
  searchCompany, 
  companyResults, 
  isSearching, 
  selectedCompany, 
  setSelectedCompany 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('siret');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      searchCompany(searchTerm, searchType);
    }
  };

  const handleSelectCompany = (company) => {
    setSelectedCompany(company);
  };

  return (
    <div className={styles.formCard}>
      <div className={styles.cardHeader}>
        <div className={styles.cardIcon}>
          <i className="bi bi-search"></i>
        </div>
        <h3>Rechercher une structure existante</h3>
      </div>
      <div className={styles.cardBody}>
        {!selectedCompany && (
          <>
            <Form onSubmit={handleSearch}>
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
                    className={styles.searchInput}
                  />
                  <Button 
                    type="submit" 
                    variant="primary"
                    disabled={isSearching || !searchTerm.trim()}
                    className={styles.searchButton}
                  >
                    {isSearching ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      <i className="bi bi-search"></i>
                    )}
                  </Button>
                </div>
              </div>
            </Form>

            {companyResults.length > 0 && (
              <div className={styles.resultsContainer}>
                <h4 className={styles.resultsTitle}>Résultats de recherche</h4>
                <ul className={styles.resultsList}>
                  {companyResults.map((company) => (
                    <li key={company.siret} className={styles.resultItem}>
                      <div className={styles.resultInfo}>
                        <h5 className={styles.companyName}>{company.nom_raison_sociale}</h5>
                        <p className={styles.companyDetails}>
                          {company.siret} - {company.forme_juridique}
                        </p>
                        <p className={styles.companyAddress}>
                          {`${company.siege.numero_voie || ''} ${company.siege.type_voie || ''} ${company.siege.libelle_voie || ''}, ${company.siege.code_postal || ''} ${company.siege.libelle_commune || ''}`}
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
          </>
        )}
      </div>
    </div>
  );
};

export default CompanySearchSection;
