import React from 'react';
import styles from './ConcertInfoSection.module.css';
import editStyles from './ConcertInfoSectionEdit.module.css';
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
    <Card
      title="Informations principales"
      icon={<i className="bi bi-music-note-beamed"></i>}
      className={editStyles.concertInfoSection}
    >
      <div className={editStyles.editFormGroup}>
        <label htmlFor="titre" className={editStyles.editFormLabel}>Titre du concert</label>
        <input
          type="text"
          className={editStyles.editFormControl}
          id="titre"
          name="titre"
          value={formData.titre || ''}
          onChange={onChange}
          placeholder="Ex: Concert de jazz, Festival d'été, etc."
        />
        <small className={editStyles.editFormHelpText}>
          Un titre descriptif aidera à identifier rapidement ce concert.
        </small>
      </div>

      <div className={editStyles.editFormRow}>
        <div className={editStyles.editFormGroup}>
          <label htmlFor="date" className={editStyles.editFormLabel}>
            Date du concert <span className={editStyles.editRequiredField}>*</span>
          </label>
          <input
            type="date"
            className={editStyles.editFormControl}
            id="date"
            name="date"
            value={formData.date || ''}
            onChange={onChange}
            required
          />
        </div>
        
        <div className={editStyles.editFormGroup}>
          <label htmlFor="montant" className={editStyles.editFormLabel}>
            Montant (€) <span className={editStyles.editRequiredField}>*</span>
          </label>
          <div className={editStyles.editInputGroup}>
            <input
              type="number"
              className={editStyles.editFormControl}
              id="montant"
              name="montant"
              value={formData.montant || ''}
              onChange={onChange}
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
            <span className={editStyles.editInputGroupAddon}>€</span>
          </div>
        </div>
      </div>

      <div className={editStyles.editFormGroup}>
        <label htmlFor="statut" className={editStyles.editFormLabel}>Statut</label>
        <select
          className={editStyles.editFormSelect}
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
    </Card>
  );
};

export default ConcertInfoSection;
