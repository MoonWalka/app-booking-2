import React from 'react';
import styles from './ValidationSection.module.css';
import FieldValidationRow from './FieldValidationRow';

const ValidationSection = ({
  title,
  headerClass,
  fields,
  existingData,
  formData,
  validatedFields,
  category,
  onValidateField,
  onCopyValue,
  isValidated = false,
  infoText = null,
  structureFieldsMapping = false
}) => {
  // Special case for concert information
  if (!fields && title === "Informations du concert" && existingData) {
    const concert = existingData;
    return (
      <div className={styles.section}>
        <div className={`${styles.header} ${headerClass}`}>
          <h3 className={styles.title}>{title}</h3>
        </div>
        <div className={styles.body}>
          <div className={styles.concertInfoGrid}>
            <div className={styles.infoGroup}>
              <div className={styles.infoLabel}>Date</div>
              <div className={styles.infoValue}>
                {concert.date ? new Date(concert.date.seconds * 1000).toLocaleDateString('fr-FR') : 'Non spécifiée'}
              </div>
            </div>
            <div className={styles.infoGroup}>
              <div className={styles.infoLabel}>Montant</div>
              <div className={styles.infoValue}>
                {concert.montant ? new Intl.NumberFormat('fr-FR', { 
                  style: 'currency', 
                  currency: 'EUR' 
                }).format(concert.montant) : '0,00 €'}
              </div>
            </div>
            <div className={styles.infoGroup}>
              <div className={styles.infoLabel}>Lieu</div>
              <div className={styles.infoValue}>
                {concert.lieuNom || 'Non spécifié'}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!fields || !fields.length) {
    return null;
  }

  return (
    <div className={styles.section}>
      <div className={`${styles.header} ${headerClass}`}>
        <h3 className={styles.title}>{title}</h3>
      </div>
      <div className={styles.body}>
        {infoText && (
          <div className={styles.infoAlert}>
            <div className={styles.infoAlertContent}>
              <i className={`bi bi-info-circle-fill ${styles.infoIcon}`}></i>
              <p className={styles.infoText}>{infoText}</p>
            </div>
          </div>
        )}

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th style={{width: '15%'}}>Champ</th>
                <th style={{width: '25%'}}>Valeur existante</th>
                <th style={{width: '25%'}}>Valeur du formulaire</th>
                <th style={{width: '10%'}}></th>
                <th style={{width: '25%'}}>Valeur finale</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field) => {
                const fieldPath = `${category}.${field.id}`;
                let existingValue = '';
                let formValue = '';
                
                // Adapt field access based on the category
                if (category === 'lieu') {
                  existingValue = existingData ? existingData[field.id] || '' : '';
                  formValue = formData ? formData[field.id] || '' : '';
                } else if (category === 'contact') {
                  existingValue = existingData ? existingData[field.id] || '' : '';
                  formValue = formData ? formData[field.id] || '' : '';
                } else if (category === 'structure' && structureFieldsMapping) {
                  // Special case for structure fields that have different mappings
                  if (field.id === 'raisonSociale') {
                    existingValue = existingData ? existingData.structure || '' : '';
                    formValue = formData ? formData.structure || '' : '';
                  } else if (['type', 'adresse', 'codePostal', 'ville', 'pays'].includes(field.id)) {
                    const fieldKey = `structure${field.id.charAt(0).toUpperCase() + field.id.slice(1)}`;
                    existingValue = existingData ? existingData[fieldKey] || '' : '';
                    formValue = formData ? formData[fieldKey] || formData[field.id] || '' : '';
                  } else {
                    existingValue = existingData ? existingData[field.id] || '' : '';
                    formValue = formData ? formData[field.id] || '' : '';
                  }
                } else {
                  // Default case
                  existingValue = existingData && existingData[field.id] ? existingData[field.id] : '';
                  formValue = formData && formData[field.id] ? formData[field.id] : '';
                }

                return (
                  <FieldValidationRow
                    key={field.id}
                    fieldName={field.label}
                    existingValue={existingValue}
                    formValue={formValue}
                    finalValue={validatedFields[fieldPath] || ''}
                    onCopyValue={(value) => onCopyValue(fieldPath, value)}
                    onValueChange={(value) => onValidateField(category, field.id, value)}
                    isDisabled={isValidated}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ValidationSection;
