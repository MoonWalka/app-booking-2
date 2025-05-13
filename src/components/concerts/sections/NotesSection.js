import React from 'react';
import styles from './NotesSection.module.css';
import Card from '@/components/ui/Card';

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
    <Card
      title="Notes"
      icon={<i className="bi bi-journal-text"></i>}
      className={styles.notesSection}
    >
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
    </Card>
  );
};

export default NotesSection;
