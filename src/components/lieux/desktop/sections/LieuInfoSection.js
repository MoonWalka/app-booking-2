import React from 'react';
import styles from '../LieuForm.module.css';

const LieuInfoSection = ({ lieu, handleChange }) => {
  const typeOptions = [
    { value: '', label: 'Sélectionner un type' },
    { value: 'salle', label: 'Salle de concert' },
    { value: 'bar', label: 'Bar' },
    { value: 'plein_air', label: 'Plein air' },
    { value: 'theatre', label: 'Théâtre' },
    { value: 'mjo', label: 'MJO/MJC' },
    { value: 'autre', label: 'Autre' }
  ];

  return (
    <div className={styles.formSection}>
      <h3 className={styles.sectionTitle}>Informations générales</h3>
      
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label htmlFor="nom" className={styles.formLabel}>Nom du lieu *</label>
          <input
            id="nom"
            className={styles.formInput}
            name="nom"
            value={lieu.nom}
            onChange={handleChange}
            placeholder="Nom du lieu"
            required
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="type" className={styles.formLabel}>Type de lieu</label>
          <select
            id="type"
            className={styles.formInput}
            name="type"
            value={lieu.type}
            onChange={handleChange}
          >
            {typeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="capacite" className={styles.formLabel}>Capacité</label>
          <input
            id="capacite"
            className={styles.formInput}
            name="capacite"
            value={lieu.capacite}
            onChange={handleChange}
            placeholder="Nombre de personnes"
            type="number"
          />
        </div>
      </div>
    </div>
  );
};

export default LieuInfoSection;
