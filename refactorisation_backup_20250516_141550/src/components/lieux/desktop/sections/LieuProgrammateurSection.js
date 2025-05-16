import React from 'react';
import Button from '@/components/ui/Button';
import styles from '../LieuForm.module.css';

const LieuProgrammateurSection = ({ programmateurSearch }) => {
  const {
    query,
    setQuery,
    programmateurs,
    isLoading,
    handleSearch,
    selectProgrammateur,
    removeProgrammateur
  } = programmateurSearch;

  return (
    <div className={styles.formSection}>
      <h3 className={styles.sectionTitle}>Programmateur associé</h3>
      
      <div className={styles.searchContainer}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Rechercher un programmateur..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            handleSearch(e.target.value);
          }}
        />
        {isLoading && <div className={styles.spinner}></div>}
        
        {programmateurs.length > 0 && (
          <ul className={styles.searchSuggestions}>
            {programmateurs.map(programmateur => (
              <li 
                key={programmateur.id}
                onClick={() => selectProgrammateur(programmateur)}
                className={styles.suggestionItem}
              >
                {programmateur.nom}
                <span className={styles.suggestionSubtext}>
                  {programmateur.structure || 'Aucune structure'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {programmateurSearch.programmateurId && (
        <div className={styles.selectedProgrammateur}>
          <div className={styles.selectedProgrammateurInfo}>
            <h4>{programmateurSearch.programmateurNom}</h4>
          </div>
          <Button 
            type="button"
            variant="danger"
            size="small"
            onClick={removeProgrammateur}
          >
            <i className="bi bi-x-circle"></i> Retirer
          </Button>
        </div>
      )}
    </div>
  );
};

export default LieuProgrammateurSection;
