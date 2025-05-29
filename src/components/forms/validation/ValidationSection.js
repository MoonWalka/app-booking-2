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
                <th className={styles.columnField}>Champ</th>
                <th className={styles.columnExisting}>Valeur existante</th>
                <th className={styles.columnForm}>Valeur du formulaire</th>
                <th className={styles.columnAction}>
                  {/* Bouton pour copier toutes les valeurs */}
                  {onCopyValue && !isValidated && (
                    <button
                      className={styles.copyAllButton}
                      onClick={() => {
                        fields.forEach(field => {
                          const fieldPath = `${category}.${field.id}`;
                          let formValue = '';
                          
                          // Utiliser la même logique que dans le map ci-dessous
                          if (category === 'lieu') {
                            formValue = formData ? formData[field.id] || '' : '';
                          } else if (category === 'contact') {
                            if (formData && formData.contact && typeof formData.contact === 'object') {
                              formValue = formData.contact[field.id] || '';
                            } else {
                              formValue = formData ? formData[field.id] || '' : '';
                            }
                          } else if (category === 'structure' && structureFieldsMapping) {
                            if (field.id === 'raisonSociale') {
                              if (formData && formData.structure && typeof formData.structure === 'object') {
                                formValue = formData.structure.raisonSociale || '';
                              } else {
                                formValue = formData ? formData.structure || '' : '';
                              }
                            } else if (['type', 'adresse', 'codePostal', 'ville', 'pays', 'siret', 'tva'].includes(field.id)) {
                              if (formData && formData.structure && typeof formData.structure === 'object') {
                                formValue = formData.structure[field.id] || '';
                              } else {
                                const fieldKey = `structure${field.id.charAt(0).toUpperCase() + field.id.slice(1)}`;
                                formValue = formData ? formData[fieldKey] || formData[field.id] || '' : '';
                              }
                            } else {
                              formValue = formData ? formData[field.id] || '' : '';
                            }
                          } else {
                            formValue = formData && formData[field.id] ? formData[field.id] : '';
                          }
                          
                          // Copier la valeur si elle existe
                          if (formValue) {
                            onCopyValue(fieldPath, formValue);
                          }
                        });
                      }}
                      title="Copier toutes les valeurs du formulaire"
                    >
                      ⏬ Tout copier
                    </button>
                  )}
                </th>
                <th className={styles.columnFinal}>Valeur finale</th>
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
                  // Pour formData, on peut avoir les données dans .contact ou directement
                  if (formData && formData.contact && typeof formData.contact === 'object') {
                    formValue = formData.contact[field.id] || '';
                  } else {
                    formValue = formData ? formData[field.id] || '' : '';
                  }
                } else if (category === 'structure' && structureFieldsMapping) {
                  // Special case for structure fields that have different mappings
                  if (field.id === 'raisonSociale') {
                    existingValue = existingData ? existingData.structure || '' : '';
                    // Pour formData, on doit chercher dans la structure imbriquée
                    if (formData && formData.structure && typeof formData.structure === 'object') {
                      formValue = formData.structure.raisonSociale || '';
                    } else {
                      formValue = formData ? formData.structure || '' : '';
                    }
                  } else if (['type', 'adresse', 'codePostal', 'ville', 'pays', 'siret', 'tva'].includes(field.id)) {
                    const fieldKey = `structure${field.id.charAt(0).toUpperCase() + field.id.slice(1)}`;
                    existingValue = existingData ? existingData[fieldKey] || '' : '';
                    // Pour formData, chercher dans l'objet structure
                    if (formData && formData.structure && typeof formData.structure === 'object') {
                      formValue = formData.structure[field.id] || '';
                    } else {
                      formValue = formData ? formData[fieldKey] || formData[field.id] || '' : '';
                    }
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
