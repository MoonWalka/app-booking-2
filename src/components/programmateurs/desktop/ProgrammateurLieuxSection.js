import React from 'react';
import { Link } from 'react-router-dom';
import styles from './ProgrammateurLieuxSection.module.css';
import { useLieuSearchV2 } from '@/hooks/lieux';

const ProgrammateurLieuxSection = ({ programmateur, isEditing }) => {
  const{
    showConcertSearch,
    concertSearchTerm,
    concertResults,
    showConcertResults,
    isSearchingConcerts,
    concertSearchRef,
    setConcertSearchTerm,
    setShowConcertResults,
    toggleConcertSearch,
    handleSelectConcert,
    handleCreateConcert
  } = useLieuSearchV2(programmateur);
  
  return (
    <div className={styles.cardWrapper}>
      <div className={styles.cardHeader}>
        <i className="bi bi-music-note-list text-primary"></i>
        <h5 className="mb-0">Concerts associés</h5>
      </div>
      <div className={styles.cardBody}>
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">
              {programmateur?.concertsAssocies?.length > 0 
                ? `Concerts associés (${programmateur.concertsAssocies.length})` 
                : 'Aucun concert associé'}
            </h5>
            
            {!isEditing && (
              <button 
                className="btn btn-sm btn-outline-primary"
                onClick={toggleConcertSearch}
              >
                {showConcertSearch ? (
                  <><i className="bi bi-x-lg me-1"></i> Annuler</>
                ) : (
                  <><i className="bi bi-plus-circle me-1"></i> Associer un concert</>
                )}
              </button>
            )}
          </div>
          
          {/* Section de recherche de concerts */}
          {showConcertSearch && !isEditing && (
            <div className={styles.searchSection} ref={concertSearchRef}>
              <div className="input-group mb-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Rechercher un concert par titre, lieu ou date..."
                  value={concertSearchTerm}
                  onChange={(e) => setConcertSearchTerm(e.target.value)}
                  onFocus={() => concertSearchTerm.length >= 2 && setShowConcertResults(true)}
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={handleCreateConcert}
                >
                  <i className="bi bi-plus-lg me-1"></i>
                  Créer un concert
                </button>
              </div>
              
              {/* Résultats de recherche pour les concerts */}
              {showConcertResults && (
                <div className={styles.dropdownMenu}>
                  {isSearchingConcerts ? (
                    <div className={styles.dropdownItem}>
                      <div className="spinner-border spinner-border-sm me-2" role="status">
                        <span className="visually-hidden">Recherche en cours...</span>
                      </div>
                      Recherche en cours...
                    </div>
                  ) : concertResults.length > 0 ? (
                    concertResults.map(concert => (
                      <div 
                        key={concert.id} 
                        className={styles.dropdownItem}
                        onClick={() => handleSelectConcert(concert)}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <div className="fw-bold">{concert.titre || `Concert du ${concert.date}`}</div>
                            <div className="small text-muted">
                              {concert.date && (
                                <span className="me-2">
                                  <i className="bi bi-calendar-event me-1"></i>
                                  {new Date(concert.date).toLocaleDateString('fr-FR')}
                                </span>
                              )}
                              {concert.lieuNom && (
                                <span>
                                  <i className="bi bi-geo-alt me-1"></i>
                                  {concert.lieuNom}
                                </span>
                              )}
                            </div>
                          </div>
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectConcert(concert);
                            }}
                          >
                            <i className="bi bi-plus-lg"></i>
                          </button>
                        </div>
                      </div>
                    ))
                  ) : concertSearchTerm.length >= 2 ? (
                    <div className={styles.dropdownItem}>Aucun concert trouvé</div>
                  ) : (
                    <div className={styles.dropdownItem}>Commencez à taper pour rechercher</div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Liste des concerts associés */}
          {programmateur?.concertsAssocies?.length > 0 ? (
            <div className={styles.listGroup}>
              {programmateur.concertsAssocies.map(concert => (
                <div key={concert.id} className={styles.listGroupItem}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-1">
                        <i className="bi bi-music-note me-2"></i>
                        <Link to={`/concerts/${concert.id}`} className="text-decoration-none">{concert.titre}</Link>
                      </h6>
                      <div className="d-flex gap-3 text-muted small">
                        {concert.date && (
                          <span>
                            <i className="bi bi-calendar-event me-1"></i>
                            {typeof concert.date === 'object' && concert.date.seconds
                              ? new Date(concert.date.seconds * 1000).toLocaleDateString('fr-FR')
                              : concert.date}
                          </span>
                        )}
                        {concert.lieu && (
                          <span>
                            <i className="bi bi-geo-alt me-1"></i>
                            {concert.lieu}
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
              <p className="mb-0">Aucun concert n'est associé à ce programmateur.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgrammateurLieuxSection;
