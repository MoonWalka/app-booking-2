import React, { useState, useEffect } from 'react';
import styles from './VariablesPanel.module.css';

/**
 * Mini-panel fixe pour afficher et insérer des variables
 * Remplace le dropdown par une interface plus moderne et pratique
 */
const VariablesPanel = ({
  variables = [],
  onSelectVariable,
  targetId,
  buttonRef,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredVariables, setFilteredVariables] = useState(variables);

  // Filtrer les variables selon le terme de recherche
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
    if (!isVisible) {
      setSearchTerm(''); // Reset search when opening
    }
  };

  const handleSelectVariable = (variable) => {
    onSelectVariable(variable.value, targetId);
    // Ne pas fermer le panel pour permettre l'insertion de plusieurs variables
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  if (!variables || variables.length === 0) {
    return null;
  }

  return (
    <div className={`${styles.container} ${className}`}>
      {/* Bouton d'activation du panel */}
      <button
        type="button"
        ref={buttonRef}
        className={`${styles.toggleButton} ${isVisible ? styles.active : ''}`}
        onClick={handleTogglePanel}
        title="Afficher/Masquer le panel des variables"
      >
        <i className="bi bi-code-square me-1"></i>
        Variables
        <i className={`bi ${isVisible ? 'bi-chevron-up' : 'bi-chevron-down'} ms-1`}></i>
      </button>

      {/* Mini-panel fixe */}
      {isVisible && (
        <div className={styles.panel}>
          {/* En-tête avec recherche */}
          <div className={styles.panelHeader}>
            <div className={styles.headerTitle}>
              <i className="bi bi-list-ul me-2"></i>
              Variables disponibles
            </div>
            <div className={styles.searchContainer}>
              <div className={styles.searchInputWrapper}>
                <i className="bi bi-search"></i>
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder="Rechercher une variable..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    type="button"
                    className={styles.clearSearch}
                    onClick={handleClearSearch}
                    title="Effacer la recherche"
                  >
                    <i className="bi bi-x"></i>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Liste des variables */}
          <div className={styles.panelBody}>
            {filteredVariables.length > 0 ? (
              <div className={styles.variablesList}>
                {filteredVariables.map((variable, index) => (
                  <button
                    key={index}
                    type="button"
                    className={styles.variableItem}
                    onClick={() => handleSelectVariable(variable)}
                    title={`Insérer la variable ${variable.value}`}
                  >
                    <div className={styles.variableInfo}>
                      <span className={styles.variableLabel}>{variable.label}</span>
                      <code className={styles.variableCode}>{"{" + variable.value + "}"}</code>
                    </div>
                    <i className="bi bi-plus-circle-dotted"></i>
                  </button>
                ))}
              </div>
            ) : (
              <div className={styles.noResults}>
                <i className="bi bi-search mb-2"></i>
                <p>Aucune variable trouvée pour "{searchTerm}"</p>
              </div>
            )}
          </div>

          {/* Pied du panel */}
          <div className={styles.panelFooter}>
            <button
              type="button"
              className={styles.closeButton}
              onClick={() => setIsVisible(false)}
            >
              <i className="bi bi-eye-slash me-1"></i>
              Masquer le panel
            </button>
            <div className={styles.resultCount}>
              {filteredVariables.length} variable{filteredVariables.length > 1 ? 's' : ''}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VariablesPanel; 