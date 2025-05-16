import React, { useEffect, useRef } from 'react';
import styles from './VariablesDropdown.module.css';

/**
 * Composant pour afficher un menu déroulant de variables à insérer
 */
const VariablesDropdown = ({
  isOpen,
  variables,
  targetId,
  buttonRef,
  onToggle,
  onSelectVariable
}) => {
  const dropdownRef = useRef(null);

  // Gestionnaire pour fermer le dropdown quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef?.current &&
        !buttonRef.current.contains(event.target)
      ) {
        onToggle();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onToggle, buttonRef]);

  if (!variables || variables.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <button
        type="button"
        ref={buttonRef}
        className={styles.variablesButton}
        onClick={(e) => {
          e.preventDefault();
          onToggle();
        }}
      >
        <i className="bi bi-code-square me-1"></i>
        Variables
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className={styles.dropdown}
        >
          <h6 className={styles.dropdownHeader}>Variables disponibles</h6>
          <ul className={styles.variablesList}>
            {variables.map((variable, index) => (
              <li key={index}>
                <button
                  type="button"
                  className={styles.variableItem}
                  onClick={() => onSelectVariable(variable.value, targetId)}
                >
                  <span className={styles.variableLabel}>{variable.label}</span>
                  <code className={styles.variableCode}>{"{" + variable.value + "}"}</code>
                </button>
              </li>
            ))}
          </ul>
          <div className={styles.dropdownFooter}>
            <button
              type="button"
              className={styles.closeButton}
              onClick={onToggle}
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VariablesDropdown;