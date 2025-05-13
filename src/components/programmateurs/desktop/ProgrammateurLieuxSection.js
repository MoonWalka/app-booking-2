import React from 'react';
import { Link } from 'react-router-dom';
import styles from './ProgrammateurLieuxSection.module.css';
// MIGRATION: Utilisation du hook optimisé au lieu du hook V2
import { useLieuSearchOptimized } from '@/hooks/lieux';

const ProgrammateurLieuxSection = ({ programmateur, isEditing }) => {
  const {
    searchTerm,
    results,
    showDropdown,
    isSearching,
    setSearchTerm,
    setShowDropdown,
    handleInputChange,
    handleResultClick,
    handleCreateLieu
  } = useLieuSearchOptimized({
    // Configuration du hook pour la recherche de lieux
    maxResults: 10,
    includeDetails: true,
    onSelect: (lieu) => {
      // Cette fonction serait à implémenter pour associer un lieu au programmateur
      console.log("Lieu sélectionné:", lieu);
      // Logique d'association du lieu au programmateur
    }
  });
  
  // Gestionnaire pour basculer l'affichage de la recherche
  const toggleLieuSearch = () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown) {
      setSearchTerm('');
    }
  };
  
  return (
    <div className={styles.cardWrapper}>
      <div className={styles.cardHeader}>
        <i className="bi bi-geo-alt text-primary"></i>
        <h5 className="mb-0">Lieux associés</h5>
      </div>
      <div className={styles.cardBody}>
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">
              {programmateur?.lieuxAssocies?.length > 0 
                ? `Lieux associés (${programmateur.lieuxAssocies?.length})` 
                : 'Aucun lieu associé'}
            </h5>
            
            {!isEditing && (
              <button 
                className="btn btn-sm btn-outline-primary"
                onClick={toggleLieuSearch}
              >
                {showDropdown ? (
                  <><i className="bi bi-x-lg me-1"></i> Annuler</>
                ) : (
                  <><i className="bi bi-plus-circle me-1"></i> Associer un lieu</>
                )}
              </button>
            )}
          </div>
          
          {/* Section de recherche de lieux */}
          {showDropdown && !isEditing && (
            <div className={styles.searchSection}>
              <div className="input-group mb-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Rechercher un lieu par nom, ville ou adresse..."
                  value={searchTerm}
                  onChange={handleInputChange}
                  onFocus={() => searchTerm.length >= 2 && setShowDropdown(true)}
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={handleCreateLieu}
                >
                  <i className="bi bi-plus-lg me-1"></i>
                  Créer un lieu
                </button>
              </div>
              
              {/* Résultats de recherche pour les lieux */}
              {showDropdown && (
                <div className={styles.dropdownMenu}>
                  {isSearching ? (
                    <div className={styles.dropdownItem}>
                      <div className="spinner-border spinner-border-sm me-2" role="status">
                        <span className="visually-hidden">Recherche en cours...</span>
                      </div>
                      Recherche en cours...
                    </div>
                  ) : results.length > 0 ? (
                    results.map(lieu => (
                      <div 
                        key={lieu.id} 
                        className={styles.dropdownItem}
                        onClick={() => handleResultClick(lieu)}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <div className="fw-bold">{lieu.nom}</div>
                            <div className="small text-muted">
                              {lieu.ville && (
                                <span className="me-2">
                                  <i className="bi bi-geo-alt me-1"></i>
                                  {lieu.ville}
                                </span>
                              )}
                              {lieu.codePostal && (
                                <span>
                                  <i className="bi bi-map me-1"></i>
                                  {lieu.codePostal}
                                </span>
                              )}
                            </div>
                          </div>
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleResultClick(lieu);
                            }}
                          >
                            <i className="bi bi-plus-lg"></i>
                          </button>
                        </div>
                      </div>
                    ))
                  ) : searchTerm.length >= 2 ? (
                    <div className={styles.dropdownItem}>Aucun lieu trouvé</div>
                  ) : (
                    <div className={styles.dropdownItem}>Commencez à taper pour rechercher</div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Liste des lieux associés */}
          {programmateur?.lieuxAssocies?.length > 0 ? (
            <div className={styles.listGroup}>
              {programmateur.lieuxAssocies.map(lieu => (
                <div key={lieu.id} className={styles.listGroupItem}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-1">
                        <i className="bi bi-geo-alt me-2"></i>
                        <Link to={`/lieux/${lieu.id}`} className="text-decoration-none">{lieu.nom}</Link>
                      </h6>
                      <div className="d-flex gap-3 text-muted small">
                        {lieu.ville && (
                          <span>
                            <i className="bi bi-building me-1"></i>
                            {lieu.ville}
                          </span>
                        )}
                        {lieu.type && (
                          <span>
                            <i className="bi bi-tags me-1"></i>
                            {lieu.type}
                          </span>
                        )}
                        {lieu.jauge && (
                          <span>
                            <i className="bi bi-people me-1"></i>
                            Jauge: {lieu.jauge}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.alertWrapper}>
              <i className={`bi bi-info-circle ${styles.alertIcon}`}></i>
              <p className="mb-0">Aucun lieu n'est associé à ce programmateur.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgrammateurLieuxSection;
