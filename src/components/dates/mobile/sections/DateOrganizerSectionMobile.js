import React from 'react';
import { Card, Form, Button, Spinner, ListGroup, Badge } from 'react-bootstrap';
import styles from './DateOrganizerSectionMobile.module.css';

/**
 * Section Organisateur (Contact) de la fiche date pour mobile
 * Affiche les informations de l'organisateur et gère l'envoi de formulaire
 */
const DateOrganizerSectionMobile = ({
  dateId,
  contact,
  isEditMode,
  selectedContact,
  contactSearchTerm,
  setProgSearchTerm,
  showProgResults,
  contactResults,
  isSearchingProgs,
  handleSelectContact,
  handleRemoveContact,
  handleCreateContact,
  navigateToContactDetails,
  formData,
  formDataStatus,
  showFormGenerator,
  setShowFormGenerator,
  generatedFormLink,
  setGeneratedFormLink,
  handleFormGenerated,
  copyToClipboard,
  formatDate,
  date
}) => {
  // Si on est en mode édition
  if (isEditMode) {
    return (
      <div className={styles.organizerContainer}>
        <Card className={styles.organizerCard}>
          <Card.Body>
            <h3 className={styles.sectionTitle}>Organisateur</h3>

            {/* Recherche de contact */}
            <div className={styles.searchContainer}>
              <Form.Group>
                <Form.Label className={styles.formLabel}>
                  Rechercher un organisateur
                </Form.Label>
                <div className={styles.searchInputGroup}>
                  <Form.Control
                    type="text"
                    value={contactSearchTerm}
                    onChange={(e) => setProgSearchTerm(e.target.value)}
                    placeholder="Nom de l'organisateur ou structure"
                    className={styles.searchInput}
                  />
                  {selectedContact && (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={handleRemoveContact}
                      className={styles.clearButton}
                    >
                      <i className="bi bi-x"></i>
                    </Button>
                  )}
                </div>
              </Form.Group>

              {/* Résultats de recherche */}
              {showProgResults && contactSearchTerm.trim() !== '' && (
                <div className={styles.searchResults}>
                  {isSearchingProgs ? (
                    <div className={styles.loadingResults}>
                      <Spinner animation="border" size="sm" /> Recherche...
                    </div>
                  ) : contactResults && contactResults.length > 0 ? (
                    <ListGroup variant="flush" className={styles.resultsList}>
                      {contactResults.map((result) => (
                        <ListGroup.Item
                          key={result.id}
                          action
                          onClick={() => handleSelectContact(result)}
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
                        onClick={() => handleCreateContact()}
                      >
                        Créer un nouveau contact
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Organisateur sélectionné */}
              {selectedContact && (
                <div className={styles.selectedProg}>
                  <Card className={styles.selectedProgCard}>
                    <Card.Body>
                      <h5 className={styles.progName}>{selectedContact.nom}</h5>
                      {selectedContact.structure && (
                        <div className={styles.progStructure}>
                          <i className="bi bi-building me-1"></i>
                          {selectedContact.structure.nom}
                        </div>
                      )}
                      {selectedContact.email && (
                        <div className={styles.progContact}>
                          <i className="bi bi-envelope me-1"></i>
                          {selectedContact.email}
                        </div>
                      )}
                      {selectedContact.telephone && (
                        <div className={styles.progContact}>
                          <i className="bi bi-telephone me-1"></i>
                          {selectedContact.telephone}
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

          {contact ? (
            <div className={styles.organizerContent}>
              <div className={styles.organizerHeader}>
                <h4 className={styles.organizerName}>{contact.nom}</h4>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => navigateToContactDetails(contact.id)}
                  className={styles.organizerDetailsButton}
                >
                  Voir la fiche
                </Button>
              </div>

              {/* Structure */}
              {contact.structure && (
                <div className={styles.organizerDetail}>
                  <i className="bi bi-building me-2"></i>
                  <span>{contact.structure.nom}</span>
                </div>
              )}

              {/* Contact */}
              {contact.email && (
                <div className={styles.organizerDetail}>
                  <i className="bi bi-envelope me-2"></i>
                  <span>{contact.email}</span>
                </div>
              )}
              {contact.telephone && (
                <div className={styles.organizerDetail}>
                  <i className="bi bi-telephone me-2"></i>
                  <span>{contact.telephone}</span>
                </div>
              )}

              {/* Section formulaire */}
              <div className={styles.formSection}>
                <h5 className={styles.formSectionTitle}>Formulaire</h5>
                
                {formData ? (
                  <div className={styles.formInfo}>
                    <div className={styles.formStatusBadge}>
                      <Badge 
                        bg={formDataStatus?.isValidated || formData.status === 'validated' ? 'success' : formDataStatus?.hasData ? 'warning' : 'secondary'}
                        className={styles.badge}
                      >
                        {formDataStatus?.isValidated || formData.status === 'validated' ? (
                          <>
                            <i className="bi bi-check-circle-fill me-1"></i>
                            Validé
                          </>
                        ) : formDataStatus?.hasData ? (
                          <>
                            <i className="bi bi-hourglass-split me-1"></i>
                            En attente de validation ({formDataStatus.completionRate || 0}%)
                          </>
                        ) : (
                          <>
                            <i className="bi bi-envelope me-1"></i>
                            Envoyé - En attente de réponse
                          </>
                        )}
                      </Badge>
                    </div>
                    
                    <div className={styles.formDetail}>
                      <i className="bi bi-calendar-event me-2"></i>
                      <span>Envoyé le {formatDate(formData.dateCreation || formData.createdAt)}</span>
                    </div>
                    
                    {(formData.dateReponse || formDataStatus?.lastUpdate) && (
                      <div className={styles.formDetail}>
                        <i className="bi bi-reply me-2"></i>
                        <span>Répondu le {formatDate(formData.dateReponse || formDataStatus.lastUpdate)}</span>
                      </div>
                    )}
                    
                    {formDataStatus?.isValidated || formData.status === 'validated' ? (
                      <div className={styles.formValidated}>
                        <i className="bi bi-check-circle me-1"></i>
                        Formulaire validé et informations intégrées
                      </div>
                    ) : formDataStatus?.hasData ? (
                      <Button
                        variant="outline-primary"
                        size="sm"
                        href={`/forms/validate/${dateId}`}
                        className={styles.validateButton}
                      >
                        <i className="bi bi-check2-square me-1"></i>
                        Valider les informations ({formDataStatus.completionRate || 0}% complété)
                      </Button>
                    ) : (
                      <div className={styles.formPending}>
                        <i className="bi bi-clock me-1"></i>
                        En attente de réponse du contact
                      </div>
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

export default DateOrganizerSectionMobile;