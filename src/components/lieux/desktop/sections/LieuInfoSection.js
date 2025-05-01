import React from 'react';
import styles from './LieuInfoSection.module.css';

const LieuInfoSection = ({ lieu, handleChange }) => {
  return (
    <div className={styles.formCard}>
      <div className={styles.cardHeader}>
        <i className="bi bi-building"></i>
        <h3>Informations principales</h3>
      </div>
      <div className={styles.cardBody}>
        <div className="mb-3">
          <label htmlFor="nom" className="form-label">
            Nom du lieu <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            className="form-control"
            id="nom"
            name="nom"
            value={lieu.nom}
            onChange={handleChange}
            required
            placeholder="Ex: Le Café des Artistes"
          />
        </div>
        
        <div className="mb-3">
          <label htmlFor="type" className="form-label">Type de lieu</label>
          <select
            className="form-select"
            id="type"
            name="type"
            value={lieu.type || ''}
            onChange={handleChange}
          >
            <option value="">Sélectionnez un type</option>
            <option value="bar">Bar</option>
            <option value="festival">Festival</option>
            <option value="salle">Salle</option>
            <option value="plateau">Plateau</option>
            <option value="autre">Autre</option>
          </select>
        </div>
        
        <div className="mb-3">
          <label htmlFor="capacite" className="form-label">Capacité</label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            className="form-control"
            id="capacite"
            name="capacite"
            value={lieu.capacite}
            onChange={handleChange}
            placeholder="Nombre maximum de personnes que le lieu peut accueillir"
          />
        </div>
      </div>
    </div>
  );
};

export default LieuInfoSection;
