import React, { useRef } from 'react';
import styles from './ConcertOrganizerSection.module.css';
import Button from '@/components/ui/Button';
import CardSection from '@/components/ui/CardSection';

/**
 * Composant pour la section Programmateur du détail d'un concert
 * Affiche les informations du programmateur et permet de les modifier en mode édition
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
    <CardSection
      title="Programmateur"
      icon={<i className="bi bi-person-badge"></i>}
      headerActions={programmateur && !isEditMode ? (
        <Button
          onClick={() => navigateToProgrammateurDetails(programmateur.id)}
          variant="outline-primary"
          size="sm"
          className={`tc-btn-outline-primary btn-sm ${styles.cardHeaderAction}`}
        >
          <i className="bi bi-eye"></i>
          <span>Voir détails</span>
        </Button>
      ) : null}
      className={styles.formCard}
    >
      <div className={styles.cardBody}>
        {isEditMode ? (
          <div className={styles.formGroup} ref={progDropdownRef}>
            <label className={styles.formLabel}>Associer un programmateur</label>
            
            {!selectedProgrammateur ? (
              <div className={styles.programmateurSearchContainer}>
                <div className="input-group">
                  <span className="input-group-text"><i className="bi bi-search"></i></span>
                  <input
                    type="text"
                    className="form-control"
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
            
            <small className="form-text text-muted">
              Tapez au moins 2 caractères pour rechercher un programmateur par nom.
            </small>
          </div>
        ) : programmateur ? (
          <>
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <div className="fw-bold">Nom:</div>
                  <div>{programmateur.nom}</div>
                </div>
                {programmateur.structure && (
                  <div className="mb-3">
                    <div className="fw-bold">Structure:</div>
                    <div>{programmateur.structure}</div>
                  </div>
                )}
              </div>
              <div className="col-md-6">
                {programmateur.email && (
                  <div className="mb-3">
                    <div className="fw-bold">Email:</div>
                    <div>
                      <a href={`mailto:${programmateur.email}`} className={styles.contactLink}>
                        <i className="bi bi-envelope me-1"></i>
                        {programmateur.email}
                      </a>
                    </div>
                  </div>
                )}
                {programmateur.telephone && (
                  <div className="mb-3">
                    <div className="fw-bold">Téléphone:</div>
                    <div>
                      <a href={`tel:${programmateur.telephone}`} className={styles.contactLink}>
                        <i className="bi bi-telephone me-1"></i>
                        {programmateur.telephone}
                      </a>
                    </div>
                  </div>
                )}
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
                    <div className="alert alert-info">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <i className="bi bi-info-circle me-2"></i>
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
                      </div>
                    </div>

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
          <div className="alert alert-warning">
            <i className="bi bi-exclamation-triangle me-2"></i>
            Aucun programmateur n'est associé à ce concert.
          </div>
        )}
      </div>
    </CardSection>
  );
};

export default ConcertOrganizerSection;