import React from 'react';
import styles from '../ProgrammateursList.module.css';

const ProgrammateursListEmptyState = ({ hasSearchQuery }) => {
  return (
    <div className={styles.emptyState}>
      <i className="bi bi-person-x display-4 text-muted mb-3"></i>
      <h5 className="text-muted">Aucun programmateur trouvé</h5>
      {hasSearchQuery ? (
        <p className="text-muted">Aucun résultat ne correspond à votre recherche.</p>
      ) : (
        <p className="text-muted">Ajoutez un programmateur pour commencer.</p>
      )}
    </div>
  );
};

export default ProgrammateursListEmptyState; 