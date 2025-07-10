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
  // Special case for date information
  if (!fields && title === "Informations de la date" && existingData) {
    const date = existingData;
    return (
      <div className={styles.section}>
        <div className={`${styles.header} ${headerClass}`}>
          <h3 className={styles.title}>{title}</h3>
        </div>
        <div className={styles.body}>
          <div className={styles.dateInfoGrid}>
            <div className={styles.infoGroup}>
              <div className={styles.infoLabel}>Date</div>
              <div className={styles.infoValue}>
                {date.date ? new Date(date.date.seconds * 1000).toLocaleDateString('fr-FR') : 'Non spécifiée'}
              </div>
            </div>
            <div className={styles.infoGroup}>
              <div className={styles.infoLabel}>Montant</div>
              <div className={styles.infoValue}>
                {date.montant ? new Intl.NumberFormat('fr-FR', { 
                  style: 'currency', 
                  currency: 'EUR' 
                }).format(date.montant) : '0,00 €'}
              </div>
            </div>
            <div className={styles.infoGroup}>
              <div className={styles.infoLabel}>Lieu</div>
              <div className={styles.infoValue}>
                {date.lieuNom || 'Non spécifié'}
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
                  {onCopyValue && (
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
                            if (formData && typeof formData === 'object') {
                              if (formData.contact && typeof formData.contact === 'object') {
                                formValue = formData.contact[field.id] || '';
                              } else {
                                formValue = formData[field.id] || '';
                              }
                            }
                          } else if (category === 'structure' && structureFieldsMapping) {
                            if (field.id === 'raisonSociale') {
                              if (formData && typeof formData === 'object') {
                                if (formData.structure && typeof formData.structure === 'object') {
                                  formValue = formData.structure.raisonSociale || '';
                                } else if (formData.nom) {
                                  formValue = formData.nom || '';
                                } else {
                                  formValue = formData.structure || '';
                                }
                              }
                            } else if (['type', 'adresse', 'codePostal', 'ville', 'pays', 'siret', 'tva', 'numeroIntracommunautaire'].includes(field.id)) {
                              if (formData && typeof formData === 'object') {
                                if (formData.structure && typeof formData.structure === 'object') {
                                  formValue = formData.structure[field.id] || '';
                                } else {
                                  formValue = formData[field.id] || '';
                                }
                              }
                            } else {
                              formValue = formData ? formData[field.id] || '' : '';
                            }
                          } else {
                            formValue = formData && formData[field.id] ? formData[field.id] : '';
                          }
                          
                          // Copier la valeur si elle existe
                          if (formValue && onCopyValue) {
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
                  // Pour formData, on peut avoir les données directement (nouveau format)
                  // ou dans .contact (ancien format)
                  if (formData && typeof formData === 'object') {
                    // Si formData a une propriété contact (ancien format)
                    if (formData.contact && typeof formData.contact === 'object') {
                      formValue = formData.contact[field.id] || '';
                    } else {
                      // Sinon c'est le nouveau format direct (signataireData)
                      formValue = formData[field.id] || '';
                    }
                  }
                } else if (category === 'structure' && structureFieldsMapping) {
                  // Special case for structure fields that have different mappings
                  if (field.id === 'raisonSociale') {
                    existingValue = existingData ? existingData.structure || '' : '';
                    // Pour le nouveau format, structureData a un champ 'nom' qui correspond à 'raisonSociale'
                    if (formData && typeof formData === 'object') {
                      if (formData.structure && typeof formData.structure === 'object') {
                        formValue = formData.structure.raisonSociale || '';
                      } else if (formData.nom) {
                        // Nouveau format : structureData.nom → raisonSociale
                        formValue = formData.nom || '';
                      } else {
                        formValue = formData.structure || '';
                      }
                    }
                  } else if (['type', 'adresse', 'codePostal', 'ville', 'pays', 'siret', 'tva', 'numeroIntracommunautaire'].includes(field.id)) {
                    const fieldKey = `structure${field.id.charAt(0).toUpperCase() + field.id.slice(1)}`;
                    existingValue = existingData ? existingData[fieldKey] || '' : '';
                    // Pour formData, chercher dans l'objet structure ou directement
                    if (formData && typeof formData === 'object') {
                      if (formData.structure && typeof formData.structure === 'object') {
                        formValue = formData.structure[field.id] || '';
                      } else {
                        // Nouveau format : les champs sont directement dans structureData
                        formValue = formData[field.id] || '';
                      }
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
                    onCopyValue={onCopyValue ? (value) => onCopyValue(fieldPath, value) : null}
                    onValueChange={onValidateField ? (value) => onValidateField(category, field.id, value) : null}
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
