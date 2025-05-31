import React, { useRef, useState, useEffect } from 'react';
import styles from './ConcertLocationSection.module.css';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

/**
 * Version de débogage avec logs pour comprendre le problème
 */
const ConcertLocationSectionDebug = ({
  concertId,
  lieu,
  isEditMode,
  selectedLieu: propSelectedLieu,
  lieuSearchTerm: propLieuSearchTerm,
  setLieuSearchTerm: propSetLieuSearchTerm,
  showLieuResults = false,
  lieuResults = [],
  isSearchingLieux = false,
  handleSelectLieu = () => {},
  handleRemoveLieu = () => {},
  handleCreateLieu = () => {},
  navigateToLieuDetails
}) => {
  const lieuDropdownRef = useRef(null);
  
  // État local pour le lieu sélectionné
  const [localSelectedLieu, setLocalSelectedLieu] = useState(null);
  
  // État local pour le terme de recherche si pas fourni en props
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  
  // Utiliser les props si fournies, sinon l'état local
  const lieuSearchTerm = propLieuSearchTerm !== undefined ? propLieuSearchTerm : localSearchTerm;
  const setLieuSearchTerm = propSetLieuSearchTerm || setLocalSearchTerm;
  
  // Synchroniser l'état local avec le lieu depuis les props
  useEffect(() => {
    console.log('[ConcertLocationSectionDebug] Props lieu changed:', lieu);
    if (lieu && !localSelectedLieu) {
      console.log('[ConcertLocationSectionDebug] Setting localSelectedLieu from props');
      setLocalSelectedLieu(lieu);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lieu]);
  
  // Le lieu à afficher
  const displayedLieu = localSelectedLieu || propSelectedLieu || lieu;
  
  console.log('[ConcertLocationSectionDebug] Render state:', {
    isEditMode,
    lieu,
    propSelectedLieu,
    localSelectedLieu,
    displayedLieu,
    lieuSearchTerm,
    showLieuResults,
    lieuResults: lieuResults?.length || 0,
    handleSelectLieu: typeof handleSelectLieu
  });
  
  // Gestionnaire de sélection de lieu avec logs
  const handleSelectLieuWithDebug = (selectedLieu) => {
    console.log('[ConcertLocationSectionDebug] Lieu selected:', selectedLieu);
    
    // Mettre à jour l'état local immédiatement
    setLocalSelectedLieu(selectedLieu);
    
    // Réinitialiser le terme de recherche
    setLieuSearchTerm('');
    
    // Appeler le handler parent
    console.log('[ConcertLocationSectionDebug] Calling handleSelectLieu');
    try {
      handleSelectLieu(selectedLieu);
    } catch (error) {
      console.error('[ConcertLocationSectionDebug] Error calling handleSelectLieu:', error);
    }
  };
  
  // Gestionnaire de suppression avec logs
  const handleRemoveLieuWithDebug = () => {
    console.log('[ConcertLocationSectionDebug] Removing lieu');
    
    // Supprimer de l'état local
    setLocalSelectedLieu(null);
    
    // Appeler le handler parent
    console.log('[ConcertLocationSectionDebug] Calling handleRemoveLieu');
    try {
      handleRemoveLieu();
    } catch (error) {
      console.error('[ConcertLocationSectionDebug] Error calling handleRemoveLieu:', error);
    }
  };

  return (
    <div className="form-card">
      <div className="card-header">
        <i className="bi bi-geo-alt"></i>
        <h3>{isEditMode ? 'Lieu * (DEBUG)' : 'Lieu (DEBUG)'}</h3>
        {displayedLieu && !isEditMode && (
          <div className="card-header-action">
            <button
              onClick={() => navigateToLieuDetails(displayedLieu.id)}
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
          <div className={styles.searchContainer} ref={lieuDropdownRef}>
            {displayedLieu ? (
              // Afficher le lieu sélectionné
              <div className={styles.selectedEntity}>
                <div className={styles.selectedEntityCard}>
                  <div className={styles.entityInfo}>
                    <h4>{displayedLieu.nom}</h4>
                    <p>
                      <i className="bi bi-geo-alt"></i>
                      {displayedLieu.adresse}, {displayedLieu.ville}
                    </p>
                    {displayedLieu.capacite && (
                      <p>
                        <i className="bi bi-people"></i>
                        Capacité: {displayedLieu.capacite} personnes
                      </p>
                    )}
                  </div>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={handleRemoveLieuWithDebug}
                  >
                    <i className="bi bi-x"></i>
                  </Button>
                </div>
              </div>
            ) : (
              // Afficher le champ de recherche
              <>
                <label className="form-label">Rechercher un lieu</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nom du lieu..."
                  value={lieuSearchTerm}
                  onChange={(e) => {
                    console.log('[ConcertLocationSectionDebug] Search term changed:', e.target.value);
                    setLieuSearchTerm(e.target.value);
                  }}
                />
                
                {/* Résultats de recherche */}
                {lieuSearchTerm && showLieuResults && (
                  <div className={styles.searchDropdown}>
                    {isSearchingLieux ? (
                      <div className={styles.dropdownItem}>
                        <i className="bi bi-arrow-repeat spin"></i>
                        Recherche en cours...
                      </div>
                    ) : lieuResults.length > 0 ? (
                      lieuResults.map(lieu => (
                        <div
                          key={lieu.id}
                          className={styles.dropdownItem}
                          onClick={() => handleSelectLieuWithDebug(lieu)}
                        >
                          <div className={styles.dropdownItemContent}>
                            <strong>{lieu.nom}</strong>
                            <small className="text-muted">
                              {lieu.adresse}, {lieu.ville}
                            </small>
                          </div>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className={styles.dropdownItem}>
                          <em>Aucun lieu trouvé</em>
                        </div>
                        {handleCreateLieu && (
                          <div 
                            className={`${styles.dropdownItem} ${styles.createNew}`}
                            onClick={handleCreateLieu}
                          >
                            <i className="bi bi-plus-circle"></i>
                            Créer un nouveau lieu
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
          displayedLieu ? (
            <div className={styles.readOnlyContent}>
              <h4>{displayedLieu.nom}</h4>
              <p className="text-muted">
                <i className="bi bi-geo-alt me-2"></i>
                {displayedLieu.adresse}, {displayedLieu.ville}
              </p>
              {displayedLieu.capacite && (
                <p className="text-muted">
                  <i className="bi bi-people me-2"></i>
                  Capacité: {displayedLieu.capacite} personnes
                </p>
              )}
            </div>
          ) : (
            <Alert variant="info">
              <i className="bi bi-info-circle me-2"></i>
              Aucun lieu sélectionné
            </Alert>
          )
        )}
      </div>
    </div>
  );
};

export default ConcertLocationSectionDebug;