import React from 'react';
import { Card, Form, Button, Spinner, ListGroup, Badge } from 'react-bootstrap';
import styles from './ConcertOrganizerSectionMobile.module.css';

/**
 * Section Organisateur (Programmateur) de la fiche concert pour mobile
 * Affiche les informations de l'organisateur et gère l'envoi de formulaire
 */
const ConcertOrganizerSectionMobile = ({
  concertId,
  programmateur,
  isEditMode,
  selectedProgrammateur,
  progSearchTerm,
  setProgSearchTerm,
  showProgResults,
  progResults,
  isSearchingProgs,
  handleSelectProgrammateur,
  handleRemoveProgrammateur,
  handleCreateProgrammateur,
  navigateToProgrammateurDetails,
  formData,
  showFormGenerator,
  setShowFormGenerator,
  generatedFormLink,
  setGeneratedFormLink,
  handleFormGenerated,
  copyToClipboard,
  formatDate,
  concert
}) => {
  // Si on est en mode édition
  if (isEditMode) {
    return (
      <div className={styles.organizerContainer}>
        <Card className={styles.organizerCard}>
          <Card.Body>
            <h3 className={styles.sectionTitle}>Organisateur</h3>

            {/* Recherche de programmateur */}
            <div className={styles.searchContainer}>
              <Form.Group>
                <Form.Label className={styles.formLabel}>
                  Rechercher un organisateur
                </Form.Label>
                <div className={styles.searchInputGroup}>
                  <Form.Control
                    type="text"
                    value={progSearchTerm}
                    onChange={(e) => setProgSearchTerm(e.target.value)}
                    placeholder="Nom de l'organisateur ou structure"
                    className={styles.searchInput}
                  />
                  {selectedProgrammateur && (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={handleRemoveProgrammateur}
                      className={styles.clearButton}
                    >
                      <i className="bi bi-x"></i>
                    </Button>
                  )}
                </div>
              </Form.Group>

              {/* Résultats de recherche */}
              {showProgResults && progSearchTerm.trim() !== '' && (
                <div className={styles.searchResults}>
                  {isSearchingProgs ? (
                    <div className={styles.loadingResults}>
                      <Spinner animation="border" size="sm" /> Recherche...
                    </div>
                  ) : progResults && progResults.length > 0 ? (
                    <ListGroup variant="flush" className={styles.resultsList}>
                      {progResults.map((result) => (
                        <ListGroup.Item
                          key={result.id}
                          action
                          onClick={() => handleSelectProgrammateur(result)}
                          className={styles.resultItem}
                        >
                          <div className={styles.resultName}>{result.nom}</div>
                          {result.structure && (
                            <div className={styles.resultStructure}>
                              {result.structure.nom}
                            </div>
                          )}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  ) : (
                    <div className={styles.noResults}>
                      Aucun organisateur trouvé
                      <Button
                        variant="link"
                        className={styles.createLink}
                        onClick={handleCreateProgrammateur}
                      >
                        Créer un nouvel organisateur
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Organisateur sélectionné */}
              {selectedProgrammateur && (
                <div className={styles.selectedProg}>
                  <Card className={styles.selectedProgCard}>
                    <Card.Body>
                      <h5 className={styles.progName}>{selectedProgrammateur.nom}</h5>
                      {selectedProgrammateur.structure && (
                        <div className={styles.progStructure}>
                          <i className="bi bi-building me-1"></i>
                          {selectedProgrammateur.structure.nom}
                        </div>
                      )}
                      {selectedProgrammateur.email && (
                        <div className={styles.progContact}>
                          <i className="bi bi-envelope me-1"></i>
                          {selectedProgrammateur.email}
                        </div>
                      )}
                      {selectedProgrammateur.telephone && (
                        <div className={styles.progContact}>
                          <i className="bi bi-telephone me-1"></i>
                          {selectedProgrammateur.telephone}
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
    <div className={styles.organizerContainer}>
      <Card className={styles.organizerCard}>
        <Card.Body>
          <h3 className={styles.sectionTitle}>Organisateur</h3>

          {programmateur ? (
            <div className={styles.organizerContent}>
              <div className={styles.organizerHeader}>
                <h4 className={styles.organizerName}>{programmateur.nom}</h4>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => navigateToProgrammateurDetails(programmateur.id)}
                  className={styles.organizerDetailsButton}
                >
                  Voir la fiche
                </Button>
              </div>

              {/* Structure */}
              {programmateur.structure && (
                <div className={styles.organizerDetail}>
                  <i className="bi bi-building me-2"></i>
                  <span>{programmateur.structure.nom}</span>
                </div>
              )}

              {/* Contact */}
              {programmateur.email && (
                <div className={styles.organizerDetail}>
                  <i className="bi bi-envelope me-2"></i>
                  <span>{programmateur.email}</span>
                </div>
              )}
              {programmateur.telephone && (
                <div className={styles.organizerDetail}>
                  <i className="bi bi-telephone me-2"></i>
                  <span>{programmateur.telephone}</span>
                </div>
              )}

              {/* Section formulaire */}
              <div className={styles.formSection}>
                <h5 className={styles.formSectionTitle}>Formulaire</h5>
                
                {formData ? (
                  <div className={styles.formInfo}>
                    <div className={styles.formStatusBadge}>
                      <Badge 
                        bg={formData.status === 'validated' ? 'success' : 'warning'}
                        className={styles.badge}
                      >
                        {formData.status === 'validated' ? (
                          <>
                            <i className="bi bi-check-circle-fill me-1"></i>
                            Validé
                          </>
                        ) : (
                          <>
                            <i className="bi bi-hourglass-split me-1"></i>
                            En attente
                          </>
                        )}
                      </Badge>
                    </div>
                    
                    <div className={styles.formDetail}>
                      <i className="bi bi-calendar-event me-2"></i>
                      <span>Envoyé le {formatDate(formData.dateCreation)}</span>
                    </div>
                    
                    {formData.dateReponse && (
                      <div className={styles.formDetail}>
                        <i className="bi bi-reply me-2"></i>
                        <span>Répondu le {formatDate(formData.dateReponse)}</span>
                      </div>
                    )}
                    
                    {formData.status === 'validated' ? (
                      <div className={styles.formValidated}>
                        <i className="bi bi-check-circle me-1"></i>
                        Formulaire validé et informations intégrées
                      </div>
                    ) : (
                      <Button
                        variant="outline-primary"
                        size="sm"
                        href={`/forms/validate/${concertId}`}
                        className={styles.validateButton}
                      >
                        <i className="bi bi-check2-square me-1"></i>
                        Valider les informations
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className={styles.formActions}>
                    {generatedFormLink ? (
                      <div className={styles.generatedFormContainer}>
                        <div className={styles.formLinkInfo}>
                          <i className="bi bi-link-45deg me-1"></i>
                          Lien de formulaire créé
                        </div>
                        <div className={styles.formLinkActions}>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => copyToClipboard(generatedFormLink)}
                            className={styles.copyButton}
                          >
                            <i className="bi bi-clipboard me-1"></i>
                            Copier le lien
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setShowFormGenerator(true)}
                        className={styles.generateButton}
                      >
                        <i className="bi bi-file-earmark-text me-1"></i>
                        Générer un formulaire
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <i className="bi bi-person"></i>
              <p>Aucun organisateur sélectionné</p>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default ConcertOrganizerSectionMobile;