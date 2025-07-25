import React from 'react';
import styles from './DateInfoSection.module.css';
import CardSection from '@/components/ui/CardSection';

/**
 * DateInfoSection - Composant pour les informations principales du date
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {Object} props.formData - Les données du formulaire
 * @param {Function} props.onChange - Fonction pour gérer les changements de valeur
 */
const DateInfoSection = React.memo(({ formData, onChange, formErrors }) => {
  // LOG pour vérifier les re-renders de cette section
  console.log('[DateInfoSection] Rendered. formData.titre:', formData?.titre);

  // Handler to update only 'titre'
  const handleTitreChange = (e) => {
    onChange({ target: { name: 'titre', value: e.target.value } });
  };
  return (
    <CardSection
      title="Informations principales"
      icon={<i className="bi bi-music-note-beamed"></i>}
      isEditing={true}
    >
      <div className={styles.formGroup}>
        <label htmlFor="titre" className={styles.formLabel}>Titre du date <span className={styles.required}>*</span></label>
        <input
          type="text"
          className={styles.formControl}
          id="titre"
          name="titre"
          value={formData.titre || ''}
          onChange={handleTitreChange}
          placeholder="Ex: Date de jazz, Festival d'été, etc."
          required
        />
        <small className={styles.formHelpText}>
          Un titre descriptif aidera à identifier rapidement ce date.
        </small>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="date" className={styles.formLabel}>
            Date du date <span className={styles.required}>*</span>
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
            Montant (€) <span className={styles.required}>*</span>
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
        <label htmlFor="niveau" className={styles.formLabel}>Niveau de la date</label>
        <select
          className={styles.formSelect}
          id="niveau"
          name="niveau"
          value={formData.niveau || 'incomplete'}
          onChange={onChange}
        >
          <option value="incomplete">Incomplète</option>
          <option value="interet">Intérêt</option>
          <option value="option">Option</option>
          <option value="confirme">Confirmé</option>
          <option value="annule">Annulé</option>
          <option value="reporte">Reporté</option>
        </select>
        <small className={styles.formHelpText}>
          Niveau d'avancement de la date
        </small>
      </div>
    </CardSection>
  );
});

export default DateInfoSection;
