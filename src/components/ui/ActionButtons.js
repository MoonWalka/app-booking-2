import React from 'react';
import styles from './ActionButtons.module.css';

/**
 * Composant pour les boutons d'action standardisés
 */
export const ActionButtons = ({ onView, onEdit, onDelete, disabled = false }) => {
  return (
    <div className={styles.actionButtons}>
      {onView && (
        <button
          className={`${styles.actionButton} ${styles.primary}`}
          onClick={onView}
          title="Voir les détails"
          disabled={disabled}
        >
          <i className="bi bi-eye"></i>
        </button>
      )}
      {onEdit && (
        <button
          className={`${styles.actionButton} ${styles.secondary}`}
          onClick={onEdit}
          title="Modifier"
          disabled={disabled}
        >
          <i className="bi bi-pencil"></i>
        </button>
      )}
      {onDelete && (
        <button
          className={`${styles.actionButton} ${styles.danger}`}
          onClick={onDelete}
          title="Supprimer"
          disabled={disabled}
        >
          <i className="bi bi-trash"></i>
        </button>
      )}
    </div>
  );
};

/**
 * Bouton d'ajout standardisé
 */
export const AddButton = ({ onClick, label, icon = "bi-plus" }) => {
  return (
    <button className={styles.addButton} onClick={onClick}>
      <i className={`bi ${icon}`}></i>
      <span>{label}</span>
    </button>
  );
};

export default ActionButtons;