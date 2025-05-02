import React from 'react';
import Card from '@/components/ui/Card';
import styles from './LieuGeneralInfo.module.css';
import { TypeBadge } from './LieuHeader';

/**
 * General information section for a venue
 */
const LieuGeneralInfo = ({ lieu, formData, isEditing, handleChange }) => {
  return (
    <Card
      title="Informations principales"
      icon={<i className="bi bi-building"></i>}
      isEditing={isEditing}
      isHoverable={!isEditing}
    >
      <div className={styles.formGroup}>
        <label htmlFor="nom" className={styles.formLabel}>
          Nom du lieu {isEditing && <span className={styles.required}>*</span>}
        </label>
        {isEditing ? (
          <input
            type="text"
            className="form-control"
            id="nom"
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            required
            placeholder="Ex: Le Café des Artistes"
          />
        ) : (
          <div className={styles.formControlStatic}>{lieu.nom}</div>
        )}
      </div>
      
      <div className={styles.formGroup}>
        <label htmlFor="type" className={styles.formLabel}>Type de lieu</label>
        {isEditing ? (
          <select
            className="form-select"
            id="type"
            name="type"
            value={formData.type || ''}
            onChange={handleChange}
          >
            <option value="">Sélectionnez un type</option>
            <option value="bar">Bar</option>
            <option value="festival">Festival</option>
            <option value="salle">Salle</option>
            <option value="plateau">Plateau</option>
            <option value="autre">Autre</option>
          </select>
        ) : (
          <div className={styles.formControlStatic}>
            {lieu.type ? 
              <TypeBadge type={lieu.type} /> : 
              <span className={styles.textEmpty}>Non spécifié</span>
            }
          </div>
        )}
      </div>
      
      <div className={styles.formGroup}>
        <label htmlFor="capacite" className={styles.formLabel}>Capacité</label>
        {isEditing ? (
          <>
            <input
              type="number"
              className="form-control"
              id="capacite"
              name="capacite"
              value={formData.capacite}
              onChange={handleChange}
              placeholder="Nombre maximum de personnes que le lieu peut accueillir"
            />
            <small className="form-text text-muted">
              Nombre maximum de personnes que le lieu peut accueillir
            </small>
          </>
        ) : (
          <div className={styles.formControlStatic}>
            {lieu.capacite ? 
              `${lieu.capacite} personnes` : 
              <span className={styles.textEmpty}>Non spécifiée</span>
            }
          </div>
        )}
      </div>
    </Card>
  );
};

export default LieuGeneralInfo;