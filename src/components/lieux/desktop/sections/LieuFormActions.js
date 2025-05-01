import React from 'react';
import styles from './LieuFormActions.module.css';

const LieuFormActions = ({ loading, id, navigate }) => {
  return (
    <div className={styles.formActions}>
      <button
        type="button"
        className="btn btn-outline-secondary"
        onClick={() => navigate('/lieux')}
      >
        <i className="bi bi-x-circle me-2"></i>
        Annuler
      </button>
      <button
        type="submit"
        className="btn btn-primary"
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Enregistrement...
          </>
        ) : (
          <>
            <i className="bi bi-check-circle me-2"></i>
            {id === 'nouveau' ? 'Créer le lieu' : 'Enregistrer les modifications'}
          </>
        )}
      </button>
    </div>
  );
};

export default LieuFormActions;
