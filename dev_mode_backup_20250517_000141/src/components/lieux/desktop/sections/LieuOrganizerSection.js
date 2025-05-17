import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './LieuOrganizerSection.module.css';

/**
 * Organizer section component for venue details
 */
const LieuOrganizerSection = ({ 
  isEditing,
  programmateur,
  loadingProgrammateur,
  selectedProgrammateur,
  lieu,
  searchTerm,
  setSearchTerm,
  searchResults,
  isSearching,
  handleSelectProgrammateur,
  handleRemoveProgrammateur,
  handleCreateProgrammateur
}) => {
  const dropdownRef = useRef(null);

  // Gestionnaire de clic extérieur pour fermer la liste déroulante
  useEffect(() => {
    if (!isEditing) return;
    
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // Fermera le dropdown si on clique en dehors - géré par le parent
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditing]);

  return (
    <div className={styles.formCard}>
      <div className={styles.cardHeader}>
        <i className="bi bi-person-badge"></i>
        <h3>Programmateur</h3>
      </div>
      <div className={styles.cardBody}>
        {isEditing ? (
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Associer un programmateur</label>
            
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
        ) : (
          <>
            {lieu.programmateurId ? (
              loadingProgrammateur ? (
                <div className="text-center py-3">
                  <div className="spinner-border spinner-border-sm text-primary" role="status">
                    <span className="visually-hidden">Chargement du programmateur...</span>
                  </div>
                </div>
              ) : programmateur ? (
                <div className={styles.programmateurDisplay}>
                  <div className={styles.infoRow}>
                    <div className={styles.infoLabel}>
                      <i className="bi bi-person text-primary"></i>
                      Nom
                    </div>
                    <div className={`${styles.infoValue} ${styles.highlight}`}>
                      <Link to={`/programmateurs/${programmateur.id}`} className={styles.programmateurLink}>
                        {programmateur.nom}
                      </Link>
                    </div>
                  </div>
                  
                  {programmateur.structure && (
                    <div className={styles.infoRow}>
                      <div className={styles.infoLabel}>
                        <i className="bi bi-building text-primary"></i>
                        Structure
                      </div>
                      <div className={styles.infoValue}>{programmateur.structure}</div>
                    </div>
                  )}
                  
                  {programmateur.telephone && (
                    <div className={styles.infoRow}>
                      <div className={styles.infoLabel}>
                        <i className="bi bi-telephone text-primary"></i>
                        Téléphone
                      </div>
                      <div className={styles.infoValue}>
                        <a href={`tel:${programmateur.telephone}`} className={styles.contactLink}>
                          {programmateur.telephone}
                        </a>
                      </div>
                    </div>
                  )}
                  {programmateur.email && (
                    <div className={styles.infoRow}>
                      <div className={styles.infoLabel}>
                        <i className="bi bi-envelope text-primary"></i>
                        Email
                      </div>
                      <div className={styles.infoValue}>
                        <a href={`mailto:${programmateur.email}`} className={styles.contactLink}>
                          {programmateur.email}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="alert alert-warning">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Le programmateur associé (ID: {lieu.programmateurId}) n'a pas pu être chargé ou n'existe plus.
                </div>
              )
            ) : (
              <div className={styles.textEmpty}>Aucun programmateur associé à ce lieu.</div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LieuOrganizerSection;