import React, { useRef, useState, useEffect } from 'react';
import styles from './ConcertOrganizerSection.module.css';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

/**
 * Section Programmateur du détail d'un concert
 * Version CORRIGÉE avec gestion d'état local pour affichage immédiat
 */
const ConcertOrganizerSectionFixed = ({
  concertId,
  programmateur,
  isEditMode,
  selectedProgrammateur: propSelectedProgrammateur,
  programmateurSearchTerm: propProgrammateurSearchTerm,
  setProgrammateurSearchTerm: propSetProgrammateurSearchTerm,
  showProgrammateurResults = false,
  programmateurResults = [],
  isSearchingProgrammateurs = false,
  handleSelectProgrammateur = () => {},
  handleRemoveProgrammateur = () => {},
  handleCreateProgrammateur = () => {},
  navigateToProgrammateurDetails
}) => {
  const programmateurDropdownRef = useRef(null);
  
  // État local pour le programmateur sélectionné (affichage immédiat)
  const [localSelectedProgrammateur, setLocalSelectedProgrammateur] = useState(null);
  
  // État local pour le terme de recherche si pas fourni en props
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  
  // Utiliser les props si fournies, sinon l'état local
  const programmateurSearchTerm = propProgrammateurSearchTerm !== undefined ? propProgrammateurSearchTerm : localSearchTerm;
  const setProgrammateurSearchTerm = propSetProgrammateurSearchTerm || setLocalSearchTerm;
  
  // Synchroniser l'état local avec le programmateur depuis les props au chargement initial
  useEffect(() => {
    if (programmateur && !localSelectedProgrammateur) {
      setLocalSelectedProgrammateur(programmateur);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programmateur]);
  
  // Le programmateur à afficher (priorité à l'état local pour l'affichage immédiat)
  const displayedProgrammateur = localSelectedProgrammateur || propSelectedProgrammateur || programmateur;
  
  // Gestionnaire de sélection amélioré
  const handleSelectProgrammateurWithLocalState = (selected) => {
    // Mettre à jour l'état local immédiatement pour l'affichage
    setLocalSelectedProgrammateur(selected);
    // Réinitialiser le terme de recherche
    setProgrammateurSearchTerm('');
    // Appeler le handler parent
    handleSelectProgrammateur(selected);
  };
  
  // Gestionnaire de suppression amélioré
  const handleRemoveProgrammateurWithLocalState = () => {
    // Supprimer de l'état local
    setLocalSelectedProgrammateur(null);
    // Appeler le handler parent
    handleRemoveProgrammateur();
  };
  
  // Déterminer si on est en mode recherche fonctionnel
  const hasSearchFunctionality = !!propSetProgrammateurSearchTerm;

  return (
    <div className="form-card">
      <div className="card-header">
        <i className="bi bi-person-badge"></i>
        <h3>{isEditMode ? 'Programmateur *' : 'Programmateur'}</h3>
        {displayedProgrammateur && !isEditMode && (
          <div className="card-header-action">
            <button
              onClick={() => navigateToProgrammateurDetails(displayedProgrammateur.id)}
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
          <div className={styles.searchContainer} ref={programmateurDropdownRef}>
            {displayedProgrammateur ? (
              // Afficher le programmateur sélectionné
              <div className={styles.selectedEntity}>
                <div className={styles.selectedEntityCard}>
                  <div className={styles.entityInfo}>
                    <h4>{displayedProgrammateur.nom} {displayedProgrammateur.prenom}</h4>
                    {displayedProgrammateur.structure && (
                      <p>
                        <i className="bi bi-building"></i>
                        {displayedProgrammateur.structure.nom || displayedProgrammateur.structureNom}
                      </p>
                    )}
                    {displayedProgrammateur.email && (
                      <p>
                        <i className="bi bi-envelope"></i>
                        {displayedProgrammateur.email}
                      </p>
                    )}
                    {displayedProgrammateur.telephone && (
                      <p>
                        <i className="bi bi-telephone"></i>
                        {displayedProgrammateur.telephone}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={handleRemoveProgrammateurWithLocalState}
                  >
                    <i className="bi bi-x"></i>
                  </Button>
                </div>
              </div>
            ) : (
              // Afficher le champ de recherche
              <>
                <label className="form-label">Rechercher un programmateur</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nom ou prénom..."
                  value={programmateurSearchTerm}
                  onChange={(e) => setProgrammateurSearchTerm(e.target.value)}
                />
                
                {/* Résultats de recherche */}
                {hasSearchFunctionality && programmateurSearchTerm && showProgrammateurResults && (
                  <div className={styles.searchDropdown}>
                    {isSearchingProgrammateurs ? (
                      <div className={styles.dropdownItem}>
                        <i className="bi bi-arrow-repeat spin"></i>
                        Recherche en cours...
                      </div>
                    ) : programmateurResults.length > 0 ? (
                      programmateurResults.map(prog => (
                        <div
                          key={prog.id}
                          className={styles.dropdownItem}
                          onClick={() => handleSelectProgrammateurWithLocalState(prog)}
                        >
                          <div className={styles.dropdownItemContent}>
                            <strong>{prog.nom} {prog.prenom}</strong>
                            {prog.structure && (
                              <small className="text-muted">
                                {prog.structure.nom || prog.structureNom}
                              </small>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className={styles.dropdownItem}>
                          <em>Aucun programmateur trouvé</em>
                        </div>
                        {handleCreateProgrammateur && (
                          <div 
                            className={`${styles.dropdownItem} ${styles.createNew}`}
                            onClick={handleCreateProgrammateur}
                          >
                            <i className="bi bi-plus-circle"></i>
                            Créer un nouveau programmateur
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          // Mode lecture
          displayedProgrammateur ? (
            <div className={styles.readOnlyContent}>
              <h4>{displayedProgrammateur.nom} {displayedProgrammateur.prenom}</h4>
              {displayedProgrammateur.structure && (
                <p className="text-muted">
                  <i className="bi bi-building me-2"></i>
                  {displayedProgrammateur.structure.nom || displayedProgrammateur.structureNom}
                </p>
              )}
              {displayedProgrammateur.email && (
                <p className="text-muted">
                  <i className="bi bi-envelope me-2"></i>
                  {displayedProgrammateur.email}
                </p>
              )}
              {displayedProgrammateur.telephone && (
                <p className="text-muted">
                  <i className="bi bi-telephone me-2"></i>
                  {displayedProgrammateur.telephone}
                </p>
              )}
            </div>
          ) : (
            <Alert variant="info">
              <i className="bi bi-info-circle me-2"></i>
              Aucun programmateur sélectionné
            </Alert>
          )
        )}
      </div>
    </div>
  );
};

export default ConcertOrganizerSectionFixed;