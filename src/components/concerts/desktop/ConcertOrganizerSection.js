import React, { useRef } from 'react';
import FlexContainer from '@/components/ui/FlexContainer';
import styles from './ConcertOrganizerSection.module.css';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import Card from '@/components/ui/Card';

/**
 * Composant pour la section Contact du détail d'un concert
 * Adapté de la maquette concertdetail.md
 */
const ConcertOrganizerSection = ({
  concertId,
  contact,
  isEditMode,
  selectedContact,
  contactSearchTerm,
  setContactSearchTerm,
  showContactResults,
  contactResults,
  isSearchingContacts,
  handleSelectContact,
  handleRemoveContact,
  handleCreateContact,
  navigateToContactDetails,
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
  const contactDropdownRef = useRef(null);


  return (
    <Card
      title="Contact"
      icon={<i className="bi bi-person-badge"></i>}
      headerActions={contact && !isEditMode && (
        <button
          onClick={() => navigateToContactDetails(contact.id)}
          className="tc-btn tc-btn-outline-primary tc-btn-sm"
        >
          <i className="bi bi-eye"></i>
          <span>Voir détails</span>
        </button>
      )}
    >
        {isEditMode ? (
          <div className={styles.formGroup} ref={contactDropdownRef}>
            <label className={styles.formLabel}>Associer un contact</label>
            
            {!selectedContact ? (
              <div className={styles.contactSearchContainer}>
                <div className="input-group">
                  <span className="input-group-text"><i className="bi bi-search"></i></span>
                  <input
                    type="text"
                    className={styles.formField}
                    placeholder="Rechercher un contact par nom..."
                    value={contactSearchTerm}
                    onChange={(e) => setContactSearchTerm(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline-secondary"
                    className="tc-btn-outline-secondary"
                    onClick={() => handleCreateContact()}
                  >
                    Créer un contact
                  </Button>
                </div>
                
                {isSearchingContacts && (
                  <div className="dropdown-menu show w-100">
                    <div className="dropdown-item text-center">
                      <div className="spinner-border spinner-border-sm text-primary" role="status">
                        <span className="visually-hidden">Recherche en cours...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {showContactResults && contactResults.length > 0 && (
                  <div className="dropdown-menu show w-100">
                    {contactResults.map(prog => (
                      <div 
                        key={prog.id} 
                        className={`dropdown-item ${styles.contactItem}`}
                        onClick={() => handleSelectContact(prog)}
                      >
                        <div className={styles.contactName}>{prog.nom}</div>
                        <div className={styles.contactDetails}>
                          {(prog.structures?.[0]?.nom || prog.structure) && <span className={styles.contactStructure}>{prog.structures?.[0]?.nom || prog.structure}</span>}
                          {prog.email && <span className={styles.contactContactItem}>{prog.email}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {showContactResults && contactResults.length === 0 && !isSearchingContacts && contactSearchTerm.length >= 2 && (
                  <div className="dropdown-menu show w-100">
                    <div className="dropdown-item text-center text-muted">
                      Aucun contact trouvé
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.selectedContact}>
                <div className={styles.contactCard}>
                  <div className={styles.contactInfo}>
                    <span className={styles.contactName}>{selectedContact.nom}</span>
                    {(selectedContact.structures?.[0]?.nom || selectedContact.structure) && (
                      <span className={styles.contactStructure}>{selectedContact.structures?.[0]?.nom || selectedContact.structure}</span>
                    )}
                    <div className={styles.contactContacts}>
                      {selectedContact.email && (
                        <span className={styles.contactContactItem}>
                          <i className="bi bi-envelope"></i> {selectedContact.email}
                        </span>
                      )}
                      {selectedContact.telephone && (
                        <span className={styles.contactContactItem}>
                          <i className="bi bi-telephone"></i> {selectedContact.telephone}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline-danger"
                    size="sm"
                    className="tc-btn-outline-danger btn-sm"
                    onClick={handleRemoveContact}
                    aria-label="Supprimer ce contact"
                  >
                    <i className="bi bi-x-lg"></i>
                  </Button>
                </div>
              </div>
            )}
            
            <small className={styles.helpText}>
              Tapez au moins 2 caractères pour rechercher un contact par nom.
            </small>
          </div>
        ) : contact ? (
          <>
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <div className="fw-bold">Nom:</div>
                  <div>{contact.prenom ? `${contact.prenom} ${contact.nom}` : contact.nom}</div>
                </div>
                <div className="mb-3">
                  <div className="fw-bold">Structure:</div>
                  <div>{contact.structures?.[0]?.nom || contact.structure || contact.structureNom || 'Non spécifiée'}</div>
                </div>
                <div className="mb-3">
                  <div className="fw-bold">Email:</div>
                  <div>
                    {contact.email ? (
                      <a href={`mailto:${contact.email}`} className="contact-link">
                        <i className="bi bi-envelope"></i>
                        {contact.email}
                      </a>
                    ) : (
                      <span className="text-muted">Non spécifié</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <div className="fw-bold">Téléphone:</div>
                  <div>
                    {contact.telephone ? (
                      <a href={`tel:${contact.telephone}`} className="contact-link">
                        <i className="bi bi-telephone"></i>
                        {contact.telephone}
                      </a>
                    ) : (
                      <span className="text-muted">Non spécifié</span>
                    )}
                  </div>
                </div>
                <div className="mb-3">
                  <div className="fw-bold">Adresse:</div>
                  <div>
                    {contact.adresse || contact.structures?.[0]?.adresse || contact.structureAdresse ? (
                      <>
                        {typeof contact.adresse === 'string' ? (
                          <>
                            <div>{contact.adresse}</div>
                            <div>{contact.codePostal} {contact.ville}</div>
                          </>
                        ) : contact.structures?.[0]?.adresse ? (
                          <>
                            <div>{contact.structures[0].adresse}</div>
                            <div>{contact.structures[0].codePostal} {contact.structures[0].ville}</div>
                          </>
                        ) : contact.structureAdresse ? (
                          <>
                            <div>{contact.structureAdresse}</div>
                            <div>{contact.codePostal} {contact.ville}</div>
                          </>
                        ) : (
                          <span className="text-muted">Non spécifiée</span>
                        )}
                      </>
                    ) : (
                      <span className="text-muted">Non spécifiée</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Zone pour le formulaire */}
            {concert?.statut === 'contact' && (
              <div className="mt-3 pt-3 border-top">
                <h5>Formulaire</h5>
                {!formData ? (
                  <div className="mb-3">
                    <Button
                      onClick={() => setShowFormGenerator(true)}
                      variant="outline-primary"
                      className="tc-btn-outline-primary"
                    >
                      <i className="bi bi-file-earmark-text me-1"></i>
                      Générer un formulaire
                    </Button>
                    <p className="text-muted small mt-2">
                      Envoyez un formulaire au contact pour recueillir les informations nécessaires.
                    </p>
                  </div>
                ) : (
                  <div className="mb-3">
                    <Alert variant="info">
                      <FlexContainer justify="space-between" align="center">
                        <div>
                          Formulaire créé le {formatDate(formData.createdAt)}
                        </div>
                        {formData.status && (
                          <span className={`badge ${
                            formData.status === 'validated' ? 'bg-success' :
                            formData.status === 'pending' ? 'bg-warning' :
                            'bg-info'
                          } ms-2`}>
                            {formData.status === 'validated' ? 'Validé' :
                             formData.status === 'pending' ? 'En attente' :
                             'Complété'}
                          </span>
                        )}
                      </FlexContainer>
                    </Alert>

                    <div className={styles.formSharingOptions}>
                      <Button
                        onClick={() => copyToClipboard(formData.publicUrl || formData.url)}
                        size="sm"
                        variant="outline-primary"
                        className="tc-btn-sm tc-btn-outline-primary"
                      >
                        <i className="bi bi-clipboard me-1"></i>
                        Copier le lien
                      </Button>

                      <a
                        href={formData.publicUrl || formData.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="tc-btn-sm tc-btn-outline-info"
                      >
                        <i className="bi bi-box-arrow-up-right me-1"></i>
                        Ouvrir
                      </a>

                      {formData.status !== 'validated' && formData.contactData && (
                        <Button
                          className="tc-btn-sm tc-btn-outline-success"
                          size="sm"
                          variant="outline-success"
                        >
                          <i className="bi bi-check-circle me-1"></i>
                          Valider les informations
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <Alert variant="warning">
            Aucun contact n'est associé à ce concert.
          </Alert>
        )}
    </Card>
  );
};

export default ConcertOrganizerSection;