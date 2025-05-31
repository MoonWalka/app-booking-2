import React, { useRef, useState, useEffect } from 'react';
import styles from './ConcertLocationSection.module.css';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

/**
 * Composant pour la section Lieu du détail d'un concert
 * Version CORRIGÉE avec gestion d'état local pour affichage immédiat
 */
const ConcertLocationSectionFixed = ({
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
  
  // État local pour le lieu sélectionné (affichage immédiat)
  const [localSelectedLieu, setLocalSelectedLieu] = useState(null);
  
  // État local pour le terme de recherche si pas fourni en props
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  
  // Utiliser les props si fournies, sinon l'état local
  const lieuSearchTerm = propLieuSearchTerm !== undefined ? propLieuSearchTerm : localSearchTerm;
  const setLieuSearchTerm = propSetLieuSearchTerm || setLocalSearchTerm;
  
  // Synchroniser l'état local avec le lieu depuis les props au chargement initial
  useEffect(() => {
    if (lieu && !localSelectedLieu) {
      setLocalSelectedLieu(lieu);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lieu]);
  
  // Le lieu à afficher (priorité à l'état local pour l'affichage immédiat)
  const displayedLieu = localSelectedLieu || propSelectedLieu || lieu;
  
  // Gestionnaire de sélection de lieu amélioré
  const handleSelectLieuWithLocalState = (selectedLieu) => {
    // Mettre à jour l'état local immédiatement pour l'affichage
    setLocalSelectedLieu(selectedLieu);
    // Réinitialiser le terme de recherche
    setLieuSearchTerm('');
    // Appeler le handler parent
    handleSelectLieu(selectedLieu);
  };
  
  // Gestionnaire de suppression de lieu amélioré
  const handleRemoveLieuWithLocalState = () => {
    // Supprimer de l'état local
    setLocalSelectedLieu(null);
    // Appeler le handler parent
    handleRemoveLieu();
  };
  
  // Déterminer si on est en mode recherche fonctionnel
  const hasSearchFunctionality = !!propSetLieuSearchTerm;

  return (
    <div className="form-card">
      <div className="card-header">
        <i className="bi bi-geo-alt"></i>
        <h3>{isEditMode ? 'Lieu *' : 'Lieu'}</h3>
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
                    onClick={handleRemoveLieuWithLocalState}
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
                  onChange={(e) => setLieuSearchTerm(e.target.value)}
                />
                
                {/* Résultats de recherche */}
                {hasSearchFunctionality && lieuSearchTerm && showLieuResults && (
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
                          onClick={() => handleSelectLieuWithLocalState(lieu)}
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

export default ConcertLocationSectionFixed;