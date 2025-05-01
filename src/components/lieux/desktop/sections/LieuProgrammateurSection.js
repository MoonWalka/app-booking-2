import React from 'react';
import styles from './LieuProgrammateurSection.module.css';

const LieuProgrammateurSection = ({ programmateurSearch }) => {
  const {
    searchTerm,
    setSearchTerm,
    searchResults,
    isSearching,
    selectedProgrammateur,
    dropdownRef,
    handleSelectProgrammateur,
    handleRemoveProgrammateur,
    handleCreateProgrammateur
  } = programmateurSearch;

  return (
    <div className={styles.formCard}>
      <div className={styles.cardHeader}>
        <i className="bi bi-person-badge"></i>
        <h3>Programmateur</h3>
      </div>
      <div className={styles.cardBody}>
        <div className="mb-3">
          <label className="form-label">Associer un programmateur</label>
          
          {!selectedProgrammateur ? (
            <div className={styles.programmateurSearchContainer} ref={dropdownRef}>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-search"></i></span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Rechercher un programmateur par nom..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={handleCreateProgrammateur}
                >
                  Créer un programmateur
                </button>
              </div>
              
              {isSearching && (
                <div className={`dropdown-menu show w-100 ${styles.dropdownMenu}`}>
                  <div className="dropdown-item text-center">
                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                      <span className="visually-hidden">Recherche en cours...</span>
                    </div>
                  </div>
                </div>
              )}
              
              {searchResults.length > 0 && (
                <div className={`dropdown-menu show w-100 ${styles.dropdownMenu}`}>
                  {searchResults.map(prog => (
                    <div 
                      key={prog.id} 
                      className={`dropdown-item ${styles.programmateurItem}`}
                      onClick={() => handleSelectProgrammateur(prog)}
                    >
                      <div className={styles.programmateurName}>{prog.nom}</div>
                      <div className={styles.programmateurDetails}>
                        {prog.structure && <span className={styles.programmateurStructure}>{prog.structure}</span>}
                        {prog.email && <span className="programmateur-email">{prog.email}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {searchTerm.length >= 2 && searchResults.length === 0 && !isSearching && (
                <div className={`dropdown-menu show w-100 ${styles.dropdownMenu}`}>
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
                <button 
                  type="button" 
                  className="btn btn-sm btn-outline-danger" 
                  onClick={handleRemoveProgrammateur}
                  aria-label="Supprimer ce programmateur"
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
            </div>
          )}
          
          <small className="form-text text-muted">
            Tapez au moins 2 caractères pour rechercher un programmateur par nom.
          </small>
        </div>
      </div>
    </div>
  );
};

export default LieuProgrammateurSection;
