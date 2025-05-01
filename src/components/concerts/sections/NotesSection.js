import React from 'react';
import styles from './NotesSection.module.css';

/**
 * NotesSection - Section pour les notes du concert
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {string} props.notes - Le contenu des notes
 * @param {Function} props.onChange - Fonction appelée lors du changement des notes
 */
const NotesSection = ({ notes, onChange }) => {
  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div className={styles.formCard}>
      <div className={styles.cardHeader}>
        <div className={styles.cardIcon}>
          <i className="bi bi-journal-text"></i>
        </div>
        <h3 className={styles.cardTitle}>Notes</h3>
      </div>
      
      <div className={styles.cardBody}>
        <label htmlFor="notes" className={styles.formLabel}>
          Notes additionnelles (optionnel)
        </label>
        <textarea
          id="notes"
          name="notes"
          className={`form-control ${styles.notesTextarea}`}
          value={notes || ''}
          onChange={handleChange}
          placeholder="Ajoutez ici toutes les informations complémentaires concernant ce concert..."
          rows={5}
        ></textarea>
      </div>
    </div>
  );
};

export default NotesSection;
