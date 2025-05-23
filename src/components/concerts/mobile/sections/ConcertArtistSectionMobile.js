import React from 'react';
import { Card, Form, Button, Spinner, ListGroup, Badge } from 'react-bootstrap';
import styles from './ConcertArtistSectionMobile.module.css';

/**
 * Section Artiste de la fiche concert pour mobile
 * Affiche les informations de l'artiste ou permet de les modifier
 */
const ConcertArtistSectionMobile = ({
  concertId,
  artiste,
  isEditMode,
  selectedArtiste,
  artisteSearchTerm,
  setArtisteSearchTerm,
  showArtisteResults,
  artisteResults,
  isSearchingArtistes,
  handleSelectArtiste,
  handleRemoveArtiste,
  handleCreateArtiste,
  navigateToArtisteDetails
}) => {
  // Si on est en mode édition
  if (isEditMode) {
    return (
      <div className={styles.artisteContainer}>
        <Card className={styles.artisteCard}>
          <Card.Body>
            <h3 className={styles.sectionTitle}>Artiste</h3>

            {/* Recherche d'artiste */}
            <div className={styles.searchContainer}>
              <Form.Group>
                <Form.Label className={styles.formLabel}>
                  Rechercher un artiste
                </Form.Label>
                <div className={styles.searchInputGroup}>
                  <Form.Control
                    type="text"
                    value={artisteSearchTerm}
                    onChange={(e) => setArtisteSearchTerm(e.target.value)}
                    placeholder="Nom de l'artiste"
                    className={styles.searchInput}
                  />
                  {selectedArtiste && (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={handleRemoveArtiste}
                      className={styles.clearButton}
                    >
                      <i className="bi bi-x"></i>
                    </Button>
                  )}
                </div>
              </Form.Group>

              {/* Résultats de recherche */}
              {showArtisteResults && artisteSearchTerm.trim() !== '' && (
                <div className={styles.searchResults}>
                  {isSearchingArtistes ? (
                    <div className={styles.loadingResults}>
                      <Spinner animation="border" size="sm" /> Recherche...
                    </div>
                  ) : artisteResults && artisteResults.length > 0 ? (
                    <ListGroup variant="flush" className={styles.resultsList}>
                      {artisteResults.map((result) => (
                        <ListGroup.Item
                          key={result.id}
                          action
                          onClick={() => handleSelectArtiste(result)}
                          className={styles.resultItem}
                        >
                          <div className={styles.resultName}>{result.nom}</div>
                          {result.genre && (
                            <div className={styles.resultGenre}>
                              {result.genre}
                            </div>
                          )}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  ) : (
                    <div className={styles.noResults}>
                      Aucun artiste trouvé
                      <Button
                        variant="link"
                        className={styles.createLink}
                        onClick={() => handleCreateArtiste()}
                      >
                        Créer un nouvel artiste
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Artiste sélectionné */}
              {selectedArtiste && (
                <div className={styles.selectedArtiste}>
                  <Card className={styles.selectedArtisteCard}>
                    <Card.Body>
                      <h5 className={styles.artisteName}>{selectedArtiste.nom}</h5>
                      {selectedArtiste.genre && (
                        <div className={styles.artisteGenre}>
                          <i className="bi bi-music-note-beamed me-1"></i>
                          {selectedArtiste.genre}
                        </div>
                      )}
                      {selectedArtiste.description && (
                        <div className={styles.artisteDescription}>
                          {selectedArtiste.description.length > 100 
                            ? `${selectedArtiste.description.substring(0, 100)}...` 
                            : selectedArtiste.description}
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
    <div className={styles.artisteContainer}>
      <Card className={styles.artisteCard}>
        <Card.Body>
          <h3 className={styles.sectionTitle}>Artiste</h3>

          {artiste ? (
            <div className={styles.artisteContent}>
              <div className={styles.artisteHeader}>
                <h4 className={styles.artisteName}>{artiste.nom}</h4>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => navigateToArtisteDetails(artiste.id)}
                  className={styles.artisteDetailsButton}
                >
                  Voir la fiche
                </Button>
              </div>

              {/* Genre */}
              {artiste.genre && (
                <div className={styles.artisteDetail}>
                  <i className="bi bi-music-note-beamed me-2"></i>
                  <span>{artiste.genre}</span>
                </div>
              )}

              {/* Description */}
              {artiste.description && (
                <div className={styles.artisteBio}>
                  <h5 className={styles.bioTitle}>Biographie</h5>
                  <div className={styles.bioText}>{artiste.description}</div>
                </div>
              )}

              {/* Contact */}
              {(artiste.email || artiste.telephone || artiste.siteWeb) && (
                <div className={styles.artisteContact}>
                  <h5 className={styles.contactTitle}>Contact</h5>
                  
                  {artiste.email && (
                    <div className={styles.contactDetail}>
                      <i className="bi bi-envelope me-2"></i>
                      <span>{artiste.email}</span>
                    </div>
                  )}
                  
                  {artiste.telephone && (
                    <div className={styles.contactDetail}>
                      <i className="bi bi-telephone me-2"></i>
                      <span>{artiste.telephone}</span>
                    </div>
                  )}
                  
                  {artiste.siteWeb && (
                    <div className={styles.contactDetail}>
                      <i className="bi bi-globe me-2"></i>
                      <span>{artiste.siteWeb}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <i className="bi bi-music-note-beamed"></i>
              <p>Aucun artiste sélectionné</p>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default ConcertArtistSectionMobile;