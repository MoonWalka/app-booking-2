import React, { useRef } from 'react';
import FlexContainer from '@/components/ui/FlexContainer';
import styles from './ConcertOrganizerSection.module.css';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

/**
 * Composant pour la section Programmateur du détail d'un concert
 * Adapté de la maquette concertdetail.md
 */
const ConcertOrganizerSection = ({
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
  const progDropdownRef = useRef(null);

  return (
    <div className="form-card">
      <div className="card-header">
        <i className="bi bi-person-badge"></i>
        <h3>Programmateur</h3>
        {programmateur && !isEditMode && (
          <div className="card-header-action">
            <button
              onClick={() => navigateToProgrammateurDetails(programmateur.id)}
              className="tc-btn tc-btn-outline-primary tc-btn-sm"
            >
              <i className="bi bi-eye"></i>
              <span>Voir détails</span>
            </button>
          </div>
        )}
      </div>
      <div className="card-body">
        {isEditMode ? (
          <div className={styles.formGroup} ref={progDropdownRef}>
            <label className={styles.formLabel}>Associer un programmateur</label>
            
            {!selectedProgrammateur ? (
              <div className={styles.programmateurSearchContainer}>
                <div className="input-group">
                  <span className="input-group-text"><i className="bi bi-search"></i></span>
                  <input
                    type="text"
                    className={styles.formField}
                    placeholder="Rechercher un programmateur par nom..."
                    value={progSearchTerm}
                    onChange={(e) => setProgSearchTerm(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline-secondary"
                    className="tc-btn-outline-secondary"
                    onClick={() => handleCreateProgrammateur()}
                  >
                    Créer un programmateur
                  </Button>
                </div>
                
                {isSearchingProgs && (
                  <div className="dropdown-menu show w-100">
                    <div className="dropdown-item text-center">
                      <div className="spinner-border spinner-border-sm text-primary" role="status">
                        <span className="visually-hidden">Recherche en cours...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {showProgResults && progResults.length > 0 && (
                  <div className="dropdown-menu show w-100">
                    {progResults.map(prog => (
                      <div 
                        key={prog.id} 
                        className={`dropdown-item ${styles.programmateurItem}`}
                        onClick={() => handleSelectProgrammateur(prog)}
                      >
                        <div className={styles.programmateurName}>{prog.nom}</div>
                        <div className={styles.programmateurDetails}>
                          {prog.structure && <span className={styles.programmateurStructure}>{prog.structure}</span>}
                          {prog.email && <span className={styles.programmateurContactItem}>{prog.email}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {showProgResults && progResults.length === 0 && !isSearchingProgs && progSearchTerm.length >= 2 && (
                  <div className="dropdown-menu show w-100">
                    <div className="dropdown-item text-center text-muted">
                      Aucun programmateur trouvé
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.selectedProgrammateur}>
                <div className={styles.programmateurCard}>
                  <div className={styles.programmateurInfo}>
                    <span className={styles.programmateurName}>{selectedProgrammateur.nom}</span>
                    {selectedProgrammateur.structure && (
                      <span className={styles.programmateurStructure}>{selectedProgrammateur.structure}</span>
                    )}
                    <div className={styles.programmateurContacts}>
                      {selectedProgrammateur.email && (
                        <span className={styles.programmateurContactItem}>
                          <i className="bi bi-envelope"></i> {selectedProgrammateur.email}
                        </span>
                      )}
                      {selectedProgrammateur.telephone && (
                        <span className={styles.programmateurContactItem}>
                          <i className="bi bi-telephone"></i> {selectedProgrammateur.telephone}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline-danger"
                    size="sm"
                    className="tc-btn-outline-danger btn-sm"
                    onClick={handleRemoveProgrammateur}
                    aria-label="Supprimer ce programmateur"
                  >
                    <i className="bi bi-x-lg"></i>
                  </Button>
                </div>
              </div>
            )}
            
            <small className={styles.helpText}>
              Tapez au moins 2 caractères pour rechercher un programmateur par nom.
            </small>
          </div>
        ) : programmateur ? (
          <>
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <div className="fw-bold">Nom:</div>
                  <div>{programmateur.prenom ? `${programmateur.prenom} ${programmateur.nom}` : programmateur.nom}</div>
                </div>
                <div className="mb-3">
                  <div className="fw-bold">Structure:</div>
                  <div>{programmateur.structure || programmateur.structureNom || 'Non spécifiée'}</div>
                </div>
                <div className="mb-3">
                  <div className="fw-bold">Email:</div>
                  <div>
                    {programmateur.email ? (
                      <a href={`mailto:${programmateur.email}`} className="contact-link">
                        <i className="bi bi-envelope"></i>
                        {programmateur.email}
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
                    {programmateur.telephone ? (
                      <a href={`tel:${programmateur.telephone}`} className="contact-link">
                        <i className="bi bi-telephone"></i>
                        {programmateur.telephone}
                      </a>
                    ) : (
                      <span className="text-muted">Non spécifié</span>
                    )}
                  </div>
                </div>
                <div className="mb-3">
                  <div className="fw-bold">Adresse:</div>
                  <div>
                    {programmateur.adresse ? (
                      <>
                        <div>{programmateur.adresse}</div>
                        <div>{programmateur.codePostal} {programmateur.ville}</div>
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
                      Envoyez un formulaire au programmateur pour recueillir les informations nécessaires.
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

                      {formData.status !== 'validated' && formData.programmateurData && (
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
            Aucun programmateur n'est associé à ce concert.
          </Alert>
        )}
      </div>
    </div>
  );
};

export default ConcertOrganizerSection;