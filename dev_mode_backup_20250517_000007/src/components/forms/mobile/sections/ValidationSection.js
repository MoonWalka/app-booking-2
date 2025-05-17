import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import styles from './ValidationSection.module.css';

/**
 * Composant pour afficher une section de validation sur mobile
 * Affiche les champs à valider et permet de comparer les valeurs
 */
const ValidationSection = ({
  title,
  headerClass,
  fields,
  category,
  existingData,
  formData,
  validatedFields,
  onValidateField,
  onCopyValue,
  isValidated,
  structureFieldsMapping,
  concert
}) => {
  // Si c'est une section de concert
  if (concert) {
    return (
      <Card className={styles.sectionCard}>
        <Card.Header className={headerClass || styles.defaultHeader}>
          {title}
        </Card.Header>
        <Card.Body>
          <div className={styles.concertDetails}>
            <div className={styles.concertField}>
              <span className={styles.fieldLabel}>Date :</span>
              <span className={styles.fieldValue}>
                {new Date(concert.date?.seconds * 1000).toLocaleDateString('fr-FR')}
              </span>
            </div>
            <div className={styles.concertField}>
              <span className={styles.fieldLabel}>Artiste :</span>
              <span className={styles.fieldValue}>{concert.artisteName}</span>
            </div>
            <div className={styles.concertField}>
              <span className={styles.fieldLabel}>Lieu :</span>
              <span className={styles.fieldValue}>{concert.lieuName}</span>
            </div>
          </div>
        </Card.Body>
      </Card>
    );
  }

  // Si pas de champs à afficher
  if (!fields || fields.length === 0) {
    return null;
  }

  // Retrouver les données pour les champs
  const getExistingValue = (field) => {
    if (!existingData) return '';
    
    // Gestion spéciale pour les champs de structure
    if (structureFieldsMapping && field.key.includes('structure.')) {
      const structureKey = field.key.replace('structure.', '');
      return existingData.structure && existingData.structure[structureKey];
    }
    
    // Champs normaux
    return field.path ? 
      field.path.split('.').reduce((obj, key) => obj && obj[key], existingData) : 
      existingData[field.key];
  };

  // Retrouver les données du formulaire
  const getFormValue = (field) => {
    if (!formData) return '';
    
    const formKey = field.formKey || field.key;
    return formData[formKey];
  };

  // Vérifier si un champ est déjà validé
  const isFieldValidated = (field) => {
    if (isValidated) return true;
    return validatedFields && validatedFields[`${category}.${field.key}`];
  };

  return (
    <Card className={styles.sectionCard}>
      <Card.Header className={headerClass || styles.defaultHeader}>
        {title}
        {isValidated && (
          <Badge bg="success" className={styles.validatedBadge}>
            <i className="bi bi-check-circle-fill me-1"></i> Validé
          </Badge>
        )}
      </Card.Header>
      <Card.Body>
        {fields.map((field, index) => {
          const existingValue = getExistingValue(field);
          const formValue = getFormValue(field);
          const fieldKey = `${category}.${field.key}`;
          const validated = isFieldValidated(field);
          
          // Ne pas afficher les champs vides du formulaire
          if (!formValue && !existingValue) {
            return null;
          }
          
          return (
            <div key={index} className={styles.fieldContainer}>
              <div className={styles.fieldHeader}>
                <div className={styles.fieldLabel}>{field.label}</div>
                {validated && (
                  <Badge bg="success" className={styles.fieldBadge}>
                    <i className="bi bi-check-circle-fill"></i>
                  </Badge>
                )}
              </div>

              {/* Valeurs à comparer */}
              <div className={styles.valuesContainer}>
                {existingValue && (
                  <div className={styles.existingValue}>
                    <span className={styles.valueLabel}>Données actuelles</span>
                    <div className={styles.valueContent}>{existingValue}</div>
                  </div>
                )}
                
                <div className={styles.formValue}>
                  <span className={styles.valueLabel}>Données du formulaire</span>
                  <div className={styles.valueContent}>{formValue}</div>
                </div>
              </div>
              
              {/* Boutons d'action - seulement si non validé */}
              {!isValidated && !validated && formValue && (
                <div className={styles.actionButtons}>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={() => onCopyValue(fieldKey, formValue)}
                    disabled={validated}
                    className={styles.actionButton}
                  >
                    <i className="bi bi-check-circle me-1"></i>
                    Valider cette valeur
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </Card.Body>
    </Card>
  );
};

export default ValidationSection;