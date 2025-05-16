import React from 'react';
import Button from '@/components/ui/Button';
import styles from '../LieuForm.module.css';

const LieuFormHeader = ({ id, lieuNom, navigate }) => {
  const isNewLieu = id === 'nouveau';
  const title = isNewLieu ? 'Ajouter un lieu' : `Modifier ${lieuNom || 'le lieu'}`;

  return (
    <div className={styles.formHeader}>
      <div className={styles.headerTitleContainer}>
        <h2 className={styles.formTitle}>{title}</h2>
      </div>
      <Button 
        type="button"
        variant="outline"
        onClick={() => navigate('/lieux')}
        icon="arrow-left"
      >
        Retour
      </Button>
    </div>
  );
};

export default LieuFormHeader;
