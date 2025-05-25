import React, { useRef } from 'react';
import styles from './ConcertStructureSection.module.css';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import CardSection from '@/components/ui/CardSection';

/**
 * Composant pour la section Structure du détail d'un concert
 * Affiche les informations de la structure et permet de les modifier en mode édition
 */
const ConcertStructureSection = ({
  concertId,
  structure,
  isEditMode,
  selectedStructure,
  structureSearchTerm,
  setStructureSearchTerm,
  showStructureResults,
  structureResults,
  isSearchingStructures,
  handleSelectStructure,
  handleRemoveStructure,
  handleCreateStructure,
  navigateToStructureDetails
}) => {
  const structureDropdownRef = useRef(null);

  return (
    <CardSection
      title="Structure"
      icon={<i className="bi bi-building"></i>}
      headerActions={structure && !isEditMode ? (
        <Button
          onClick={() => navigateToStructureDetails(structure.id)}
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
          <div className={styles.formGroup} ref={structureDropdownRef}>
            <label className={styles.formLabel}>Associer une structure</label>
            
            {!selectedStructure ? (
              <div className={styles.structureSearchContainer}>
                <div className="input-group">
                  <span className="input-group-text"><i className="bi bi-search"></i></span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Rechercher une structure par nom ou raison sociale..."
                    value={structureSearchTerm}
                    onChange={(e) => setStructureSearchTerm(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline-secondary"
                    className="tc-btn-outline-secondary"
                    onClick={() => handleCreateStructure()}
                  >
                    Créer une structure
                  </Button>
                </div>
                
                {isSearchingStructures && (
                  <div className="dropdown-menu show w-100">
                    <div className="dropdown-item text-center">
                      <div className="spinner-border spinner-border-sm text-primary" role="status">
                        <span className="visually-hidden">Recherche en cours...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {showStructureResults && structureResults.length > 0 && (
                  <div className="dropdown-menu show w-100">
                    {structureResults.map(struct => (
                      <div 
                        key={struct.id} 
                        className={`dropdown-item ${styles.structureItem}`}
                        onClick={() => handleSelectStructure(struct)}
                      >
                        <div className={styles.structureName}>
                          {struct.nom || struct.raisonSociale || 'Sans nom'}
                        </div>
                        <div className={styles.structureDetails}>
                          {struct.type && <span className={styles.structureType}>{struct.type}</span>}
                          {struct.ville && <span className={styles.structureLocation}>{struct.ville}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {showStructureResults && structureResults.length === 0 && 
                  !isSearchingStructures && structureSearchTerm.length >= 2 && (
                  <div className="dropdown-menu show w-100">
                    <div className="dropdown-item text-center text-muted">
                      Aucune structure trouvée
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.selectedStructure}>
                <div className={styles.structureCard}>
                  <div className={styles.structureInfo}>
                    <span className={styles.structureName}>
                      {selectedStructure.nom || selectedStructure.raisonSociale || 'Sans nom'}
                    </span>
                    {selectedStructure.type && (
                      <span className={styles.structureType}>{selectedStructure.type}</span>
                    )}
                    <div className={styles.structureDetails}>
                      {selectedStructure.ville && (
                        <span className={styles.structureLocation}>
                          <i className="bi bi-geo-alt"></i> {selectedStructure.ville}
                        </span>
                      )}
                      {selectedStructure.siret && (
                        <span className={styles.structureSiret}>
                          <i className="bi bi-card-text"></i> SIRET: {selectedStructure.siret}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline-danger"
                    size="sm"
                    className="tc-btn-outline-danger btn-sm"
                    onClick={handleRemoveStructure}
                    aria-label="Supprimer cette structure"
                  >
                    <i className="bi bi-x-lg"></i>
                  </Button>
                </div>
              </div>
            )}
            
            <small className="form-text text-muted">
              Tapez au moins 2 caractères pour rechercher une structure par nom ou raison sociale.
            </small>
          </div>
        ) : structure ? (
          <>
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <div className="fw-bold">Nom:</div>
                  <div>{structure.nom || structure.raisonSociale || 'Sans nom'}</div>
                </div>
                {structure.type && (
                  <div className="mb-3">
                    <div className="fw-bold">Type:</div>
                    <div>{structure.type}</div>
                  </div>
                )}
                {structure.siret && (
                  <div className="mb-3">
                    <div className="fw-bold">SIRET:</div>
                    <div>{structure.siret}</div>
                  </div>
                )}
              </div>
              <div className="col-md-6">
                {structure.adresse && (
                  <div className="mb-3">
                    <div className="fw-bold">Adresse:</div>
                    <div>
                      {structure.adresse}
                      {structure.codePostal || structure.ville ? (
                        <div>
                          {[structure.codePostal, structure.ville]
                            .filter(Boolean)
                            .join(' ')}
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}
                {structure.email && (
                  <div className="mb-3">
                    <div className="fw-bold">Email:</div>
                    <div>
                      <a href={`mailto:${structure.email}`} className={styles.contactLink}>
                        <i className="bi bi-envelope me-1"></i>
                        {structure.email}
                      </a>
                    </div>
                  </div>
                )}
                {structure.telephone && (
                  <div className="mb-3">
                    <div className="fw-bold">Téléphone:</div>
                    <div>
                      <a href={`tel:${structure.telephone}`} className={styles.contactLink}>
                        <i className="bi bi-telephone me-1"></i>
                        {structure.telephone}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <Alert variant="info">
            Aucune structure n'est associée directement à ce concert.
          </Alert>
        )}
      </div>
    </CardSection>
  );
};

export default ConcertStructureSection;