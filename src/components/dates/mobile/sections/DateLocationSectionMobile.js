import React from 'react';
import { Card, Form, Button, Spinner, ListGroup } from 'react-bootstrap';
import styles from './DateLocationSectionMobile.module.css';

/**
 * Section Lieu de la fiche date pour mobile
 * Affiche les informations du lieu ou permet de les modifier
 */
const DateLocationSectionMobile = ({
  dateId,
  lieu,
  isEditMode,
  selectedLieu,
  lieuSearchTerm,
  setLieuSearchTerm,
  showLieuResults,
  lieuResults,
  isSearchingLieux,
  handleSelectLieu,
  handleRemoveLieu,
  handleCreateLieu,
  navigateToLieuDetails
}) => {
  // Si on est en mode édition
  if (isEditMode) {
    return (
      <div className={styles.lieuContainer}>
        <Card className={styles.lieuCard}>
          <Card.Body>
            <h3 className={styles.sectionTitle}>Lieu</h3>

            {/* Recherche de lieu */}
            <div className={styles.searchContainer}>
              <Form.Group>
                <Form.Label className={styles.formLabel}>
                  Rechercher un lieu
                </Form.Label>
                <div className={styles.searchInputGroup}>
                  <Form.Control
                    type="text"
                    value={lieuSearchTerm}
                    onChange={(e) => setLieuSearchTerm(e.target.value)}
                    placeholder="Nom du lieu"
                    className={styles.searchInput}
                  />
                  {selectedLieu && (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={handleRemoveLieu}
                      className={styles.clearButton}
                    >
                      <i className="bi bi-x"></i>
                    </Button>
                  )}
                </div>
              </Form.Group>

              {/* Résultats de recherche */}
              {showLieuResults && lieuSearchTerm.trim() !== '' && (
                <div className={styles.searchResults}>
                  {isSearchingLieux ? (
                    <div className={styles.loadingResults}>
                      <Spinner animation="border" size="sm" /> Recherche...
                    </div>
                  ) : lieuResults && lieuResults.length > 0 ? (
                    <ListGroup variant="flush" className={styles.resultsList}>
                      {lieuResults.map((result) => (
                        <ListGroup.Item
                          key={result.id}
                          action
                          onClick={() => handleSelectLieu(result)}
                          className={styles.resultItem}
                        >
                          <div className={styles.resultName}>{result.nom}</div>
                          <div className={styles.resultAddress}>
                            {result.ville && result.codePostal ? 
                              `${result.ville}, ${result.codePostal}` :
                              (result.adresse && typeof result.adresse === 'string' ? 
                                result.adresse : 
                                'Adresse non spécifiée'
                              )
                            }
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  ) : (
                    <div className={styles.noResults}>
                      Aucun lieu trouvé
                      <Button
                        type="button"
                        variant="outline-secondary"
                        className="tc-btn-outline-secondary"
                        onClick={() => handleCreateLieu()}
                      >
                        Créer un lieu
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Lieu sélectionné */}
              {selectedLieu && (
                <div className={styles.selectedLieu}>
                  <Card className={styles.selectedLieuCard}>
                    <Card.Body>
                      <h5 className={styles.lieuName}>{selectedLieu.nom}</h5>
                      <div className={styles.lieuAddress}>
                        {selectedLieu.adresse && typeof selectedLieu.adresse === 'string' && (
                          <div>{selectedLieu.adresse}</div>
                        )}
                        {selectedLieu.codePostal && selectedLieu.ville && (
                          <div>
                            {selectedLieu.codePostal} {selectedLieu.ville}
                          </div>
                        )}
                      </div>
                      {selectedLieu.capacite && (
                        <div className={styles.lieuCapacity}>
                          <i className="bi bi-person me-1"></i> {selectedLieu.capacite} places
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </div>
              )}
            </div>
          </Card.Body>
        </Card>
      </div>
    );
  }

  // Mode affichage
  return (
    <div className={styles.lieuContainer}>
      <Card className={styles.lieuCard}>
        <Card.Body>
          <h3 className={styles.sectionTitle}>Lieu</h3>

          {lieu ? (
            <div className={styles.lieuContent}>
              <div className={styles.lieuHeader}>
                <h4 className={styles.lieuName}>{lieu.nom}</h4>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => navigateToLieuDetails(lieu.id)}
                  className={styles.lieuDetailsButton}
                >
                  Voir la fiche
                </Button>
              </div>

              {/* Adresse */}
              {lieu.adresse && (
                <div className={styles.lieuAddress}>
                  <i className="bi bi-geo-alt me-2"></i>
                  <div>
                    {typeof lieu.adresse === 'string' && <div>{lieu.adresse}</div>}
                    {lieu.codePostal && lieu.ville && (
                      <div>
                        {lieu.codePostal} {lieu.ville}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Capacité */}
              {lieu.capacite && (
                <div className={styles.lieuDetail}>
                  <i className="bi bi-person me-2"></i>
                  <span>{lieu.capacite} places</span>
                </div>
              )}

              {/* Contact du lieu */}
              {lieu.contact && (
                <div className={styles.lieuContact}>
                  <h5 className={styles.contactTitle}>Contact</h5>
                  {lieu.contact.nom && (
                    <div className={styles.contactDetail}>
                      <i className="bi bi-person-badge me-2"></i>
                      <span>{lieu.contact.nom}</span>
                    </div>
                  )}
                  {lieu.contact.email && (
                    <div className={styles.contactDetail}>
                      <i className="bi bi-envelope me-2"></i>
                      <span>{lieu.contact.email}</span>
                    </div>
                  )}
                  {lieu.contact.telephone && (
                    <div className={styles.contactDetail}>
                      <i className="bi bi-telephone me-2"></i>
                      <span>{lieu.contact.telephone}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <i className="bi bi-geo-alt"></i>
              <p>Aucun lieu sélectionné</p>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default DateLocationSectionMobile;