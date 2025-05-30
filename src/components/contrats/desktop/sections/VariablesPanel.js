import React, { useState, useEffect, useRef } from 'react';
import styles from './VariablesPanel.module.css';

/**
 * Mini-panel fixe pour afficher et insérer des variables
 * Intégration de la logique sophistiquée de useVariablesDropdown
 */
const VariablesPanel = ({
  variables = [],
  onSelectVariable,
  targetId,
  className = '',
  // Nouvelles props pour la logique avancée
  enableAdvancedInsertion = true,
  insertionMethod = 'auto' // 'auto', 'quill', 'textarea'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredVariables, setFilteredVariables] = useState(variables);
  
  const panelRef = useRef(null);
  const internalButtonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isVisible &&
        panelRef.current &&
        !panelRef.current.contains(event.target) &&
        internalButtonRef.current &&
        !internalButtonRef.current.contains(event.target)
      ) {
        setIsVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredVariables(variables);
    } else {
      const filtered = variables.filter(variable => {
        const searchLower = searchTerm.toLowerCase();
        return (
          variable.value?.toLowerCase().includes(searchLower) ||
          variable.label?.toLowerCase().includes(searchLower)
        );
      });
      setFilteredVariables(filtered);
    }
  }, [searchTerm, variables]);

  const handleTogglePanel = () => {
    setIsVisible(!isVisible);
    console.log('[VariablesPanel] Bouton cliqué, isVisible va devenir:', !isVisible);
    if (!isVisible) {
      setSearchTerm(''); 
    };
  };

  const handleAdvancedInsertion = (variable, targetId) => {
    const variableText = `{${variable.value}}`;
    
    if (enableAdvancedInsertion) {
      if (insertionMethod === 'quill' || targetId === 'bodyContent' || targetId === 'headerContent' || targetId === 'footerContent') {
        if (onSelectVariable) {
          onSelectVariable(variable.value, targetId);
        }
      } else {
        const textarea = document.getElementById(targetId);
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const currentValue = textarea.value;
          const newValue = currentValue.substring(0, start) + variableText + currentValue.substring(end);
          const event = new Event('input', { bubbles: true });
          textarea.value = newValue;
          textarea.dispatchEvent(event);
          setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + variableText.length, start + variableText.length);
          }, 50);
        }
      }
    } else {
      if (onSelectVariable) {
        onSelectVariable(variable.value, targetId);
      }
    }
  };

  const handleSelectVariable = (variable) => {
    handleAdvancedInsertion(variable, targetId);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  if (!variables || variables.length === 0) {
    console.log('[VariablesPanel] variables est vide ou non défini, rien à afficher');
    return null;
  }

  return (
    <div className={`${styles.variablesPanelContainer} ${className}`}>
      <button 
        ref={internalButtonRef}
        onClick={handleTogglePanel} 
        className={styles.toggleButton}
        type="button"
        aria-expanded={isVisible}
        aria-controls={`variables-panel-${targetId}`}
      >
        <i className="bi bi-braces"></i> Insérer Variable
      </button>

      {isVisible && (
        <div 
          id={`variables-panel-${targetId}`}
          className={styles.panel}
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`variables-panel-title-${targetId}`}
        >
          {console.log('[VariablesPanel] Panel affiché !')}
          <div className={styles.panelHeader}>
            <h3 id={`variables-panel-title-${targetId}`} className={styles.panelTitle}>Variables disponibles</h3>
            <button onClick={handleTogglePanel} className={styles.closeButton} aria-label="Fermer">
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          
          <div className={styles.searchContainer}>
            <i className={`bi bi-search ${styles.searchIcon}`}></i>
            <input
              type="text"
              placeholder="Rechercher une variable..."
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-controls={`variables-list-${targetId}`}
            />
            {searchTerm && (
              <button onClick={handleClearSearch} className={styles.clearSearchButton} aria-label="Effacer la recherche">
                <i className="bi bi-x"></i>
              </button>
            )}
          </div>

          <ul id={`variables-list-${targetId}`} className={styles.variablesList}>
            {filteredVariables.length > 0 ? (
              filteredVariables.map((variable) => (
                <li key={variable.value} className={styles.variableItem}>
                  <button 
                    onClick={() => handleSelectVariable(variable)} 
                    className={styles.variableButton}
                    type="button"
                  >
                    <span className={styles.variableName} title={variable.label}>{`{${variable.value}}`}</span>
                    <span className={styles.variableLabel}>{variable.label}</span>
                  </button>
                </li>
              ))
            ) : (
              <li className={styles.noResults}>Aucune variable trouvée.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default VariablesPanel; 