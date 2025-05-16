import React from 'react';
import styles from './ConcertInfoSection.module.css';
import Card from '@/components/ui/Card';

/**
 * ConcertInfoSection - Composant pour les informations principales du concert
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {Object} props.formData - Les données du formulaire
 * @param {Function} props.onChange - Fonction pour gérer les changements de valeur
 */
const ConcertInfoSection = ({ formData, onChange }) => {
  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <div className={styles.cardHeader}>
          <div className={styles.cardIcon}>
            <i className="bi bi-music-note-beamed"></i>
          </div>
          <h3 className={styles.cardTitle}>Informations principales</h3>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.formGroup}>
            <label htmlFor="titre" className={styles.formLabel}>Titre du concert</label>
            <input
              type="text"
              className={styles.formControl}
              id="titre"
              name="titre"
              value={formData.titre || ''}
              onChange={onChange}
              placeholder="Ex: Concert de jazz, Festival d'été, etc."
            />
            <small className={styles.formHelpText}>
              Un titre descriptif aidera à identifier rapidement ce concert.
            </small>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="date" className={styles.formLabel}>
                Date du concert <span className={styles.requiredField}>*</span>
              </label>
              <input
                type="date"
                className={styles.formControl}
                id="date"
                name="date"
                value={formData.date || ''}
                onChange={onChange}
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="montant" className={styles.formLabel}>
                Montant (€) <span className={styles.requiredField}>*</span>
              </label>
              <div className={styles.inputGroup}>
                <input
                  type="number"
                  className={styles.formControl}
                  id="montant"
                  name="montant"
                  value={formData.montant || ''}
                  onChange={onChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
                <span className={styles.inputGroupAddon}>€</span>
              </div>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="statut" className={styles.formLabel}>Statut</label>
            <select
              className={styles.formSelect}
              id="statut"
              name="statut"
              value={formData.statut || 'En attente'}
              onChange={onChange}
            >
              <option value="En attente">En attente</option>
              <option value="Confirmé">Confirmé</option>
              <option value="Annulé">Annulé</option>
              <option value="Terminé">Terminé</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConcertInfoSection;
