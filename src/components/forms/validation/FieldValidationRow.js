import React from 'react';
import styles from './FieldValidationRow.module.css';

const FieldValidationRow = ({ 
  fieldName,
  existingValue,
  formValue,
  finalValue,
  onCopyValue,
  onValueChange,
  isDisabled = false
}) => {
  return (
    <tr className={styles.row}>
      <td className={styles.fieldName}>
        {fieldName}
      </td>
      <td className={styles.existingValue}>
        {existingValue || <em className={styles.emptyValue}>Non renseigné</em>}
      </td>
      <td className={styles.formValue}>
        {formValue || <em className={styles.emptyValue}>Non renseigné</em>}
      </td>
      <td className={styles.actionCell}>
        <button 
          className={styles.copyButton}
          onClick={() => onCopyValue && onCopyValue(formValue)}
          title="Copier vers valeur finale"
          disabled={isDisabled || !onCopyValue}
        >
          ➡️
        </button>
      </td>
      <td className={styles.finalValueCell}>
        <input
          type="text"
          className={styles.finalValueInput}
          value={finalValue || ''}
          onChange={(e) => onValueChange && onValueChange(e.target.value)}
          disabled={isDisabled || !onValueChange}
        />
      </td>
    </tr>
  );
};

export default FieldValidationRow;
