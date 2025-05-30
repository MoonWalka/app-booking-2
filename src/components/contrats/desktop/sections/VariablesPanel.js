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
  buttonRef,
  className = '',
  // Nouvelles props pour la logique avancée
  enableAdvancedInsertion = true,
  insertionMethod = 'auto' // 'auto', 'quill', 'textarea'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredVariables, setFilteredVariables] = useState(variables);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Références pour la gestion de clic à l'extérieur (logique du hook)
  const panelRef = useRef(null);

  // Catégories de variables
  const categories = [
    { id: 'all', label: 'Toutes', icon: 'bi-list-ul' },
    { id: 'body', label: 'Corps de contrat', icon: 'bi-file-text' },
    { id: 'headerFooter', label: 'En-tête/Pied', icon: 'bi-layout-text-window' },
    { id: 'signature', label: 'Signature', icon: 'bi-pen' }
  ];

  // Gestion du clic à l'extérieur (logique du hook intégrée)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isVisible &&
        panelRef.current &&
        !panelRef.current.contains(event.target) &&
        buttonRef?.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, buttonRef]);

  // Filtrer les variables selon le terme de recherche et la catégorie
  useEffect(() => {
    // Calculer directement les variables prédéfinies selon la catégorie
    const customVars = variables || [];
    let predefined = [];
    
    if (selectedCategory === 'all') {
      // Combiner toutes les catégories et dédoublonner
      const allPredefined = [
        { label: "Nom du programmateur", value: "programmateur_nom" },
        { label: "Structure du programmateur", value: "programmateur_structure" },
        { label: "Email du programmateur", value: "programmateur_email" },
        { label: "SIRET du programmateur", value: "programmateur_siret" },
        { label: "Nom de l'artiste", value: "artiste_nom" },
        { label: "Genre de l'artiste", value: "artiste_genre" },
        { label: "Titre du concert", value: "concert_titre" },
        { label: "Date du concert", value: "concert_date" },
        { label: "Montant du concert", value: "concert_montant" },
        { label: "Nom du lieu", value: "lieu_nom" },
        { label: "Adresse du lieu", value: "lieu_adresse" },
        { label: "Code postal du lieu", value: "lieu_code_postal" },
        { label: "Ville du lieu", value: "lieu_ville" },
        { label: "Capacité du lieu", value: "lieu_capacite" },
        { label: "Jour actuel", value: "date_jour" },
        { label: "Mois actuel", value: "date_mois" },
        { label: "Année actuelle", value: "date_annee" },
        { label: "Date complète", value: "date_complete" }
      ];
      // Dédoublonner
      predefined = allPredefined.filter((item, index, arr) => 
        arr.findIndex(i => i.value === item.value) === index
      );
    } else if (selectedCategory === 'body') {
      predefined = [
        { label: "Nom du programmateur", value: "programmateur_nom" },
        { label: "Structure du programmateur", value: "programmateur_structure" },
        { label: "Email du programmateur", value: "programmateur_email" },
        { label: "SIRET du programmateur", value: "programmateur_siret" },
        { label: "Nom de l'artiste", value: "artiste_nom" },
        { label: "Genre de l'artiste", value: "artiste_genre" },
        { label: "Titre du concert", value: "concert_titre" },
        { label: "Date du concert", value: "concert_date" },
        { label: "Montant du concert", value: "concert_montant" },
        { label: "Nom du lieu", value: "lieu_nom" },
        { label: "Adresse du lieu", value: "lieu_adresse" },
        { label: "Code postal du lieu", value: "lieu_code_postal" },
        { label: "Ville du lieu", value: "lieu_ville" },
        { label: "Capacité du lieu", value: "lieu_capacite" },
        { label: "Jour actuel", value: "date_jour" },
        { label: "Mois actuel", value: "date_mois" },
        { label: "Année actuelle", value: "date_annee" },
        { label: "Date complète", value: "date_complete" }
      ];
    } else if (selectedCategory === 'headerFooter') {
      predefined = [
        { label: "Nom du programmateur", value: "programmateur_nom" },
        { label: "Structure du programmateur", value: "programmateur_structure" },
        { label: "Email du programmateur", value: "programmateur_email" },
        { label: "SIRET du programmateur", value: "programmateur_siret" },
        { label: "Nom de l'artiste", value: "artiste_nom" }
      ];
    } else if (selectedCategory === 'signature') {
      predefined = [
        { label: "Nom du programmateur", value: "programmateur_nom" },
        { label: "Structure du programmateur", value: "programmateur_structure" },
        { label: "Nom de l'artiste", value: "artiste_nom" },
        { label: "Ville du lieu", value: "lieu_ville" },
        { label: "Jour actuel", value: "date_jour" },
        { label: "Mois actuel", value: "date_mois" },
        { label: "Année actuelle", value: "date_annee" },
        { label: "Date complète", value: "date_complete" }
      ];
    }
    
    const allVars = [...customVars, ...predefined];
    
    if (!searchTerm.trim()) {
      setFilteredVariables(allVars);
    } else {
      const filtered = allVars.filter(variable => {
        const searchLower = searchTerm.toLowerCase();
        return (
          variable.value?.toLowerCase().includes(searchLower) ||
          variable.label?.toLowerCase().includes(searchLower)
        );
      });
      
      setFilteredVariables(filtered);
    }
  }, [searchTerm, variables, selectedCategory]); // Dépendances stables sans objets complexes

  const handleTogglePanel = () => {
    setIsVisible(!isVisible);
    if (!isVisible) {
      setSearchTerm(''); // Reset search when opening
      setSelectedCategory('all');
    }
  };

  // Insertion avancée intégrée du hook
  const handleAdvancedInsertion = (variable, targetId) => {
    const variableText = `{${variable.value}}`;
    
    if (enableAdvancedInsertion) {
      if (insertionMethod === 'quill' || targetId === 'bodyContent' || targetId === 'headerContent' || targetId === 'footerContent') {
        // Pour ReactQuill - logique sophistiquée du hook
        if (onSelectVariable) {
          onSelectVariable(variable.value, targetId);
        }
      } else {
        // Pour textarea - logique sophistiquée du hook
        const textarea = document.getElementById(targetId);
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const currentValue = textarea.value;
          
          const newValue = currentValue.substring(0, start) + variableText + currentValue.substring(end);
          
          // Simuler l'événement de changement
          const event = new Event('input', { bubbles: true });
          textarea.value = newValue;
          textarea.dispatchEvent(event);
          
          // Repositionner le curseur
          setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + variableText.length, start + variableText.length);
          }, 50);
        }
      }
    } else {
      // Méthode simple
      if (onSelectVariable) {
        onSelectVariable(variable.value, targetId);
      }
    }
  };

  const handleSelectVariable = (variable) => {
    handleAdvancedInsertion(variable, targetId);
    // Ne pas fermer le panel pour permettre l'insertion de plusieurs variables
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  // Fonction simple pour obtenir toutes les variables (utilisée dans le render)
  const getAllVariables = () => {
    const customVars = variables || [];
    let predefined = [];
    
    if (selectedCategory === 'all') {
      const allPredefined = [
        { label: "Nom du programmateur", value: "programmateur_nom" },
        { label: "Structure du programmateur", value: "programmateur_structure" },
        { label: "Email du programmateur", value: "programmateur_email" },
        { label: "SIRET du programmateur", value: "programmateur_siret" },
        { label: "Nom de l'artiste", value: "artiste_nom" },
        { label: "Genre de l'artiste", value: "artiste_genre" },
        { label: "Titre du concert", value: "concert_titre" },
        { label: "Date du concert", value: "concert_date" },
        { label: "Montant du concert", value: "concert_montant" },
        { label: "Nom du lieu", value: "lieu_nom" },
        { label: "Adresse du lieu", value: "lieu_adresse" },
        { label: "Code postal du lieu", value: "lieu_code_postal" },
        { label: "Ville du lieu", value: "lieu_ville" },
        { label: "Capacité du lieu", value: "lieu_capacite" },
        { label: "Jour actuel", value: "date_jour" },
        { label: "Mois actuel", value: "date_mois" },
        { label: "Année actuelle", value: "date_annee" },
        { label: "Date complète", value: "date_complete" }
      ];
      predefined = allPredefined.filter((item, index, arr) => 
        arr.findIndex(i => i.value === item.value) === index
      );
    } else if (selectedCategory === 'body') {
      predefined = [
        { label: "Nom du programmateur", value: "programmateur_nom" },
        { label: "Structure du programmateur", value: "programmateur_structure" },
        { label: "Email du programmateur", value: "programmateur_email" },
        { label: "SIRET du programmateur", value: "programmateur_siret" },
        { label: "Nom de l'artiste", value: "artiste_nom" },
        { label: "Genre de l'artiste", value: "artiste_genre" },
        { label: "Titre du concert", value: "concert_titre" },
        { label: "Date du concert", value: "concert_date" },
        { label: "Montant du concert", value: "concert_montant" },
        { label: "Nom du lieu", value: "lieu_nom" },
        { label: "Adresse du lieu", value: "lieu_adresse" },
        { label: "Code postal du lieu", value: "lieu_code_postal" },
        { label: "Ville du lieu", value: "lieu_ville" },
        { label: "Capacité du lieu", value: "lieu_capacite" },
        { label: "Jour actuel", value: "date_jour" },
        { label: "Mois actuel", value: "date_mois" },
        { label: "Année actuelle", value: "date_annee" },
        { label: "Date complète", value: "date_complete" }
      ];
    } else if (selectedCategory === 'headerFooter') {
      predefined = [
        { label: "Nom du programmateur", value: "programmateur_nom" },
        { label: "Structure du programmateur", value: "programmateur_structure" },
        { label: "Email du programmateur", value: "programmateur_email" },
        { label: "SIRET du programmateur", value: "programmateur_siret" },
        { label: "Nom de l'artiste", value: "artiste_nom" }
      ];
    } else if (selectedCategory === 'signature') {
      predefined = [
        { label: "Nom du programmateur", value: "programmateur_nom" },
        { label: "Structure du programmateur", value: "programmateur_structure" },
        { label: "Nom de l'artiste", value: "artiste_nom" },
        { label: "Ville du lieu", value: "lieu_ville" },
        { label: "Jour actuel", value: "date_jour" },
        { label: "Mois actuel", value: "date_mois" },
        { label: "Année actuelle", value: "date_annee" },
        { label: "Date complète", value: "date_complete" }
      ];
    }
    
    return [...customVars, ...predefined];
  };

  const allVariables = getAllVariables();
  
  if (allVariables.length === 0) {
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

      {/* Mini-panel fixe avec fonctionnalités avancées */}
      {isVisible && (
        <div className={styles.panel} ref={panelRef}>
          {/* En-tête avec recherche */}
          <div className={styles.panelHeader}>
            <div className={styles.headerTitle}>
              <i className="bi bi-list-ul me-2"></i>
              Variables disponibles
              <span className={styles.varCount}>({filteredVariables.length})</span>
            </div>
            
            {/* Sélecteur de catégories */}
            <div className={styles.categorySelector}>
              {categories.map(category => (
                <button
                  key={category.id}
                  type="button"
                  className={`${styles.categoryBtn} ${selectedCategory === category.id ? styles.active : ''}`}
                  onClick={() => setSelectedCategory(category.id)}
                  title={category.label}
                >
                  <i className={`bi ${category.icon}`}></i>
                  <span>{category.label}</span>
                </button>
              ))}
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
                    key={`${variable.value}-${index}`}
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
                {selectedCategory !== 'all' && (
                  <button
                    type="button"
                    className={styles.showAllBtn}
                    onClick={() => {
                      setSelectedCategory('all');
                      setSearchTerm('');
                    }}
                  >
                    Voir toutes les catégories
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Pied du panel avec informations supplémentaires */}
          <div className={styles.panelFooter}>
            <div className={styles.footerLeft}>
              <div className={styles.resultCount}>
                {filteredVariables.length} variable{filteredVariables.length > 1 ? 's' : ''}
                {selectedCategory !== 'all' && (
                  <span className={styles.categoryInfo}>
                    {' '}dans "{categories.find(c => c.id === selectedCategory)?.label}"
                  </span>
                )}
              </div>
              {enableAdvancedInsertion && (
                <div className={styles.insertionInfo}>
                  <i className="bi bi-info-circle me-1"></i>
                  Insertion avancée activée
                </div>
              )}
            </div>
            <button
              type="button"
              className={styles.closeButton}
              onClick={() => setIsVisible(false)}
            >
              <i className="bi bi-eye-slash me-1"></i>
              Masquer le panel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VariablesPanel; 