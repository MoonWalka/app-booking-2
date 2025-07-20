import React, { useRef } from 'react';
import styles from './DateStructureSection.module.css';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import Card from '@/components/ui/Card';

/**
 * Composant pour la section Structure du détail d'un date
 * Adapté de la maquette datedetail.md
 */
const DateStructureSection = ({
  dateId,
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
    <Card
      title="Structure"
      icon={<i className="bi bi-building"></i>}
      headerActions={
        structure && !isEditMode && (
          <button
            onClick={() => navigateToStructureDetails(structure.id)}
            className="tc-btn tc-btn-outline-primary tc-btn-sm"
          >
            <i className="bi bi-eye"></i>
            <span>Voir détails</span>
          </button>
        )
      }
    >
        {isEditMode ? (
          <div className={styles.formGroup} ref={structureDropdownRef}>
            <label className={styles.formLabel}>Associer une structure</label>
            
            {!selectedStructure ? (
              <div className={styles.structureSearchContainer}>
                <div className="input-group">
                  <span className="input-group-text"><i className="bi bi-search"></i></span>
                  <input
                    type="text"
                    className={styles.formField}
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
                      {selectedStructure.numeroIntracommunautaire && (
                        <span className={styles.structureTva}>
                          <i className="bi bi-briefcase"></i> TVA: {selectedStructure.numeroIntracommunautaire}
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
            
            <small className={styles.helpText}>
              Tapez au moins 2 caractères pour rechercher une structure par nom ou raison sociale.
            </small>
          </div>
        ) : structure ? (
          <>
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <div className="fw-bold">Nom:</div>
                  <div>{structure.raisonSociale || 'Sans nom'}</div>
                </div>
                <div className="mb-3">
                  <div className="fw-bold">Type:</div>
                  <div>{structure.type || 'Non spécifié'}</div>
                </div>
                <div className="mb-3">
                  <div className="fw-bold">SIRET:</div>
                  <div>{structure.siret || 'Non spécifié'}</div>
                </div>
                <div className="mb-3">
                  <div className="fw-bold">N° TVA Intracommunautaire:</div>
                  <div>{structure.numeroIntracommunautaire || 'Non spécifié'}</div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <div className="fw-bold">Adresse:</div>
                  <div>
                    {structure.adresse || structure.adresseLieu ? (
                      <>
                        {typeof structure.adresse === 'string' ? (
                          <>
                            <div>{structure.adresse}</div>
                            <div>
                              {[structure.codePostal, structure.ville]
                                .filter(Boolean)
                                .join(' ')}
                            </div>
                          </>
                        ) : structure.adresseLieu && typeof structure.adresseLieu === 'object' ? (
                          <>
                            <div>{structure.adresseLieu.adresse || ''}</div>
                            <div>
                              {[structure.adresseLieu.codePostal, structure.adresseLieu.ville]
                                .filter(Boolean)
                                .join(' ')}
                            </div>
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
                <div className="mb-3">
                  <div className="fw-bold">Email:</div>
                  <div>
                    {structure.email ? (
                      <a href={`mailto:${structure.email}`} className="contact-link">
                        <i className="bi bi-envelope"></i>
                        {structure.email}
                      </a>
                    ) : (
                      <span className="text-muted">Non spécifié</span>
                    )}
                  </div>
                </div>
                <div className="mb-3">
                  <div className="fw-bold">Téléphone:</div>
                  <div>
                    {structure.telephone ? (
                      <a href={`tel:${structure.telephone}`} className="contact-link">
                        <i className="bi bi-telephone"></i>
                        {structure.telephone}
                      </a>
                    ) : (
                      <span className="text-muted">Non spécifié</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <Alert variant="info">
            Aucune structure n'est associée directement à ce date.
          </Alert>
        )}
    </Card>
  );
};

export default DateStructureSection;