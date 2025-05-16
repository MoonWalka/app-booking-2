import React from 'react';
import Button from '@/components/ui/Button';
import styles from '../LieuForm.module.css';

const LieuFormActions = ({ loading, id, navigate }) => {
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
