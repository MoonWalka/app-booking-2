import React from 'react';
import styles from './NotesSection.module.css';
import CardSection from '@/components/ui/CardSection';

/**
 * NotesSection - Section pour les notes du date (formulaire ou détails)
 *
 * @param {Object} props - Les propriétés du composant
 * @param {string} props.notes - Le contenu des notes
 * @param {Function} [props.onChange] - Fonction appelée lors du changement des notes (mode édition)
 * @param {boolean} [props.isEditMode] - Affiche le textarea si true, sinon affiche en lecture seule
 */
const NotesSection = ({ notes, onChange, isEditMode }) => {
  // Si onChange est fourni ou isEditMode true, mode édition (textarea), sinon lecture seule
  const editing = typeof onChange === 'function' || isEditMode;

  return (
    <CardSection
      title="Notes"
      icon={<i className="bi bi-journal-text"></i>}
      isEditing={editing}
    >
      {editing ? (
        <>
          <label htmlFor="notes" className={styles.formLabel}>
            Notes additionnelles (optionnel)
          </label>
          <textarea
            id="notes"
            name="notes"
            className={`${styles.formField} ${styles.notesTextarea}`}
            value={notes || ''}
            onChange={e => onChange && onChange(e.target.value)}
            placeholder="Ajoutez ici toutes les informations complémentaires concernant ce date..."
            rows={5}
          />
        </>
      ) : (
        <div className={styles.notesContent}>
          {notes && notes.trim() ? (
            notes.split('\n').map((line, idx) => <p key={idx}>{line}</p>)
          ) : (
            <span className={styles.emptyNotes}>Aucune note</span>
          )}
        </div>
      )}
    </CardSection>
  );
};

export default NotesSection;
