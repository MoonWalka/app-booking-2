import React from 'react';
import styles from '../LieuForm.module.css';

const LieuContactSection = ({ contact, handleChange }) => {
  return (
    <div className={styles.formSection}>
      <h3 className={styles.sectionTitle}>Contact</h3>
      
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label htmlFor="contact.nom" className={styles.formLabel}>Nom du contact</label>
          <input
            id="contact.nom"
            className={styles.formInput}
            name="contact.nom"
            value={contact?.nom || ''}
            onChange={handleChange}
            placeholder="Nom complet"
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="contact.telephone" className={styles.formLabel}>Téléphone</label>
          <input
            id="contact.telephone"
            className={styles.formInput}
            name="contact.telephone"
            value={contact?.telephone || ''}
            onChange={handleChange}
            placeholder="Numéro de téléphone"
            type="tel"
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="contact.email" className={styles.formLabel}>Email</label>
          <input
            id="contact.email"
            className={styles.formInput}
            name="contact.email"
            value={contact?.email || ''}
            onChange={handleChange}
            placeholder="Adresse email"
            type="email"
          />
        </div>
      </div>
    </div>
  );
};

export default LieuContactSection;
