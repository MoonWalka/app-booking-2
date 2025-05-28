import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '@ui/Button';
import Alert from '@ui/Alert';
import Card from '@/components/ui/Card';
import { useProgrammateurSearch } from '@/hooks/programmateurs/useProgrammateurSearch';
import styles from './LieuOrganizerSection.module.css';

/**
 * Organizer section component for venue details
 * Adapté pour le nouveau système d'édition basé sur la navigation
 */
const LieuOrganizerSection = ({ 
  isEditMode,
  programmateur,
  loadingProgrammateur,
  lieu,
  formData = {},
  onChange,
  onProgrammateurChange
}) => {
  const dropdownRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Sécuriser l'accès aux données
  const safeLieu = lieu || {};
  const selectedProgrammateur = programmateur;

  // Hook de recherche de programmateurs
  const {
    programmateurs: searchResults,
    loading: isSearching,
    handleSearch,
    resetSearch,
    handleCreateProgrammateur
  } = useProgrammateurSearch({
    onSelect: (prog) => {
      handleSelectProgrammateur(prog);
    },
    maxResults: 10
  });

  // Gestionnaire de clic extérieur pour fermer la liste déroulante
  useEffect(() => {
    if (!isEditMode) return;
    
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
        setSearchTerm('');
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditMode]);

  // Fonction pour gérer la sélection d'un programmateur
  const handleSelectProgrammateur = (prog) => {
    if (onProgrammateurChange) {
      onProgrammateurChange(prog);
    }
    setSearchTerm('');
    setShowDropdown(false);
    resetSearch();
  };

  // Fonction pour supprimer le programmateur
  const handleRemoveProgrammateur = () => {
    if (onProgrammateurChange) {
      onProgrammateurChange(null);
    }
  };

  // Effet pour la recherche de programmateurs
  useEffect(() => {
    if (!isEditMode || searchTerm.length < 2) {
      setShowDropdown(false);
      return;
    }

    // Déclencher la recherche
    handleSearch(searchTerm);
    setShowDropdown(true);
  }, [searchTerm, isEditMode, handleSearch]);

  // Gestionnaire de changement du terme de recherche
  const handleSearchTermChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.length < 2) {
      setShowDropdown(false);
    }
  };

  return (
    <Card title="Programmateur" icon={<i className="bi bi-person-badge"></i>}>
      <div className={styles.cardBody}>
        {isEditMode ? (
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Associer un programmateur</label>
            
            {!selectedProgrammateur ? (
              <div className={styles.programmateurSearchContainer} ref={dropdownRef}>
                <div className="input-group">
                  <span className="input-group-text"><i className="bi bi-search"></i></span>
                  <input
                    type="text"
                    className={styles.formField}
                    placeholder="Rechercher un programmateur par nom..."
                    value={searchTerm}
                    onChange={handleSearchTermChange}
                  />
                  <Button
                    type="button"
                    variant="outline-secondary"
                    onClick={handleCreateProgrammateur}
                  >
                    Créer un programmateur
                  </Button>
                </div>
                
                {isSearching && showDropdown && (
                  <div className={`dropdown-menu show w-100 ${styles.dropdownMenu}`}>
                    <div className="dropdown-item text-center">
                      <div className="spinner-border spinner-border-sm text-primary" role="status">
                        <span className="visually-hidden">Recherche en cours...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {showDropdown && searchResults && searchResults.length > 0 && !isSearching && (
                  <div className={`dropdown-menu show w-100 ${styles.dropdownMenu}`}>
                    {searchResults.map(prog => (
                      <div 
                        key={prog.id} 
                        className={`dropdown-item ${styles.programmateurItem}`}
                        onClick={() => handleSelectProgrammateur(prog)}
                      >
                        <div className={styles.programmateurName}>
                          {prog.prenom} {prog.nom}
                        </div>
                        <div className={styles.programmateurDetails}>
                          {prog.structure && (
                            <span className={styles.programmateurStructure}>
                              {typeof prog.structure === 'object' ? prog.structure.nom : prog.structure}
                            </span>
                          )}
                          {prog.email && <span className="programmateur-email">{prog.email}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {showDropdown && searchTerm.length >= 2 && (!searchResults || searchResults.length === 0) && !isSearching && (
                  <div className={`dropdown-menu show w-100 ${styles.dropdownMenu}`}>
                    <div className="dropdown-item text-center text-muted">
                      Aucun programmateur trouvé
                    </div>
                    <div className="dropdown-divider"></div>
                    <div 
                      className={`dropdown-item ${styles.createOption}`}
                      onClick={handleCreateProgrammateur}
                    >
                      <i className="bi bi-plus-circle me-2"></i>
                      Créer un nouveau programmateur
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.selectedProgrammateur}>
                <div className={styles.programmateurCard}>
                  <div className={styles.programmateurInfo}>
                    <span className={styles.programmateurName}>
                      {selectedProgrammateur.prenom} {selectedProgrammateur.nom}
                    </span>
                    {selectedProgrammateur.structure && (
                      <span className={styles.programmateurStructure}>
                        {typeof selectedProgrammateur.structure === 'object' ? 
                          selectedProgrammateur.structure.nom : 
                          selectedProgrammateur.structure}
                      </span>
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
                    onClick={handleRemoveProgrammateur}
                    aria-label="Supprimer ce programmateur"
                  >
                    <i className="bi bi-x-lg"></i>
                  </Button>
                </div>
              </div>
            )}
            
            <small className={styles.helpText}>
              Tapez au moins 2 caractères pour rechercher un programmateur par nom.
            </small>
          </div>
        ) : (
          <>
            {safeLieu.programmateurId ? (
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
                        {programmateur.prenom} {programmateur.nom}
                      </Link>
                    </div>
                  </div>
                  
                  {programmateur.structure && (
                    <div className={styles.infoRow}>
                      <div className={styles.infoLabel}>
                        <i className="bi bi-building text-primary"></i>
                        Structure
                      </div>
                      <div className={styles.infoValue}>
                        {typeof programmateur.structure === 'object' ? 
                          programmateur.structure.nom : 
                          programmateur.structure}
                      </div>
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
                <Alert variant="warning">
                  Le programmateur associé (ID: {String(safeLieu.programmateurId || 'inconnu')}) n'a pas pu être chargé ou n'existe plus.
                </Alert>
              )
            ) : (
              <div className={styles.textEmpty}>Aucun programmateur associé à ce lieu.</div>
            )}
          </>
        )}
      </div>
    </Card>
  );
};

export default LieuOrganizerSection;