import React from 'react';
import Card from '@/components/ui/Card';
import styles from '../LieuForm.module.css';
import localStyles from './LieuGeneralInfo.module.css';
import { TypeBadge } from './LieuHeader';

/**
 * General information section for a venue
 * Adapté pour le nouveau système d'édition basé sur la navigation
 */
const LieuGeneralInfo = ({ lieu, formData = {}, isEditMode, onChange }) => {
  // Sécuriser l'accès aux données
  const safeFormData = formData || {};
  const safeLieu = lieu || {};

  return (
    <Card
      title="Informations principales"
      icon={<i className="bi bi-building"></i>}
      isEditing={isEditMode}
      isHoverable={!isEditMode}
    >
      <div className={styles.formGroup}>
        <label htmlFor="nom" className={styles.formLabel}>
          Nom du lieu {isEditMode && <span className={localStyles.required}>*</span>}
        </label>
        {isEditMode ? (
          <input
            type="text"
            className={styles.formInput}
            id="nom"
            name="nom"
            value={safeFormData.nom || ''}
            onChange={onChange}
            required
            placeholder="Ex: Le Café des Artistes"
          />
        ) : (
          <div className={localStyles.formControlStatic}>{safeLieu.nom || 'Non spécifié'}</div>
        )}
      </div>
      
      <div className={styles.formGroup}>
        <label htmlFor="type" className={styles.formLabel}>Type de lieu</label>
        {isEditMode ? (
          <select
            className={styles.formInput}
            id="type"
            name="type"
            value={safeFormData.type || ''}
            onChange={onChange}
          >
            <option value="">Sélectionnez un type</option>
            <option value="bar">Bar</option>
            <option value="festival">Festival</option>
            <option value="salle">Salle</option>
            <option value="plateau">Plateau</option>
            <option value="autre">Autre</option>
          </select>
        ) : (
          <div className={localStyles.formControlStatic}>
            {safeLieu.type ? 
              <TypeBadge type={safeLieu.type} /> : 
              <span className={localStyles.textEmpty}>Non spécifié</span>
            }
          </div>
        )}
      </div>
      
      <div className={styles.formGroup}>
        <label htmlFor="capacite" className={styles.formLabel}>Capacité</label>
        {isEditMode ? (
          <>
            <input
              type="number"
              className={styles.formInput}
              id="capacite"
              name="capacite"
              value={safeFormData.capacite || ''}
              onChange={onChange}
              placeholder="Nombre maximum de personnes que le lieu peut accueillir"
            />
            <small className={localStyles.helpText}>
              Nombre maximum de personnes que le lieu peut accueillir
            </small>
          </>
        ) : (
          <div className={localStyles.formControlStatic}>
            {safeLieu.capacite ? 
              `${safeLieu.capacite} personnes` : 
              <span className={localStyles.textEmpty}>Non spécifiée</span>
            }
          </div>
        )}
      </div>
    </Card>
  );
};

export default LieuGeneralInfo;