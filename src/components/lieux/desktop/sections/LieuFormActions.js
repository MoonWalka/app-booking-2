import React from 'react';
import Button from '@/components/ui/Button';
import styles from '../LieuForm.module.css';

const LieuFormActions = ({ loading, id, navigate, onDelete, isDeleting }) => {
  const isNewLieu = id === 'nouveau';

  return (
    <div className={styles.formActions}>
      <Button
        type="submit"
        variant="primary"
        disabled={loading}
      >
        <i className="bi bi-check-circle"></i> {isNewLieu ? 'Ajouter le lieu' : 'Enregistrer les modifications'}
      </Button>
      {onDelete && !isNewLieu && (
        <Button
          type="button"
          variant="danger"
          onClick={onDelete}
          disabled={loading || isDeleting}
        >
          {isDeleting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Suppression...
            </>
          ) : (
            <>
              <i className="bi bi-trash me-2"></i>
              Supprimer
            </>
          )}
        </Button>
      )}
      <Button
        type="button"
        variant="outline"
        onClick={() => navigate('/lieux')}
        disabled={loading}
      >
        Annuler
      </Button>
    </div>
  );
};

export default LieuFormActions;
