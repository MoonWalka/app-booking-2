import React from 'react';
import { Form, Button, Spinner, ButtonGroup } from 'react-bootstrap';
import Card from '@components/ui/Card';
import styles from './CompanySearchSection.module.css';

/**
 * CompanySearchSection - Section de recherche d'entreprise
 * Permet de choisir entre recherche automatique ou saisie manuelle
 */
const CompanySearchSection = ({ 
  searchType,
  setSearchType,
  searchTerm,
  setSearchTerm,
  searchResults,
  isSearchingCompany,
  handleSelectCompany,
  searchCompany,
  // Nouveau : mode de saisie
  inputMode = 'search', // 'search' ou 'manual'
  onInputModeChange = () => {},
  // Pour afficher l'entreprise sélectionnée
  selectedCompany = null
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

  const handleModeChange = (mode) => {
    onInputModeChange(mode);
    // Réinitialiser la recherche si on change de mode
    if (mode === 'manual') {
      setSearchTerm('');
    }
  };

  return (
    <Card
      title="Structure de programmation"
      icon={<i className="bi bi-building"></i>}
      variant="primary"
      className={styles.sectionCard}
    >
      {/* Choix du mode de saisie */}
      <div className={styles.modeSelector}>
        <Form.Label>Comment voulez-vous renseigner la structure ?</Form.Label>
        <ButtonGroup className={styles.modeButtons}>
          <Button 
            variant={inputMode === 'search' ? 'primary' : 'outline-primary'}
            onClick={() => handleModeChange('search')}
            className={styles.modeButton}
          >
            <i className="bi bi-search me-2"></i>
            Rechercher dans la base SIRENE
          </Button>
          <Button 
            variant={inputMode === 'manual' ? 'primary' : 'outline-primary'}
            onClick={() => handleModeChange('manual')}
            className={styles.modeButton}
          >
            <i className="bi bi-pencil me-2"></i>
            Saisir manuellement
          </Button>
        </ButtonGroup>
      </div>

      {/* Mode recherche */}
      {inputMode === 'search' && (
        <div className={styles.searchMode}>
          {!selectedCompany ? (
            <>
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
            </>
          ) : (
            // Affichage de l'entreprise sélectionnée
            <div className={styles.selectedCompany}>
              <div className={styles.selectedHeader}>
                <i className="bi bi-check-circle-fill text-success me-2"></i>
                <strong>Structure sélectionnée :</strong>
              </div>
              <div className={styles.selectedDetails}>
                <h5>{selectedCompany.nom}</h5>
                <p>{selectedCompany.siret} - {selectedCompany.statutJuridique}</p>
                <p>{selectedCompany.adresse}, {selectedCompany.codePostal} {selectedCompany.ville}</p>
              </div>
              <Button 
                variant="outline-secondary"
                size="sm"
                onClick={() => handleSelectCompany(null)}
                className={styles.changeButton}
              >
                <i className="bi bi-arrow-left me-1"></i>
                Changer de structure
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Mode manuel */}
      {inputMode === 'manual' && (
        <div className={styles.manualMode}>
          <p className={styles.manualModeText}>
            <i className="bi bi-info-circle me-2"></i>
            Vous pouvez saisir les informations de structure dans les champs ci-dessous.
          </p>
        </div>
      )}
    </Card>
  );
};

export default CompanySearchSection;
