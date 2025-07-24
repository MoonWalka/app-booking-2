import React, { useState } from 'react';
import styles from './DatesTableControls.module.css';

/**
 * Bandeau de contrôle pour le tableau des dates
 * Contient tous les contrôles de filtrage, recherche et actions
 */
const DatesTableControls = ({
  // Pagination
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  
  // Actions
  onRefresh,
  onCalculate,
  
  // Recherche
  searchValue = '',
  onSearchChange,
  onSearch,
  
  // Filtres date
  dateFilter = null,
  onDateFilterChange,
  onFilter,
  onClearFilters,
  
  // Actions supplémentaires
  onAdd,
  onExportExcel,
  onChangeView,
  onShowMap,
  
  // État de chargement
  loading = false
}) => {
  const [localSearchValue, setLocalSearchValue] = useState(searchValue);
  const [localDateFilter, setLocalDateFilter] = useState(dateFilter || '');

  // Gestion de la recherche locale
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearchValue(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  // Gestion du changement de date locale
  const handleDateChange = (e) => {
    const value = e.target.value;
    setLocalDateFilter(value);
    if (onDateFilterChange) {
      onDateFilterChange(value);
    }
  };

  // Gestion du changement de page
  const handlePageInputChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1 && value <= totalPages && onPageChange) {
      onPageChange(value);
    }
  };

  return (
    <div className={`${styles.controlsContainer} ${loading ? styles.loading : ''}`}>
      {/* Groupe 1: Pagination et actions de base */}
      <div className={styles.controlGroup}>
        {/* Sélecteur de page */}
        <div className={styles.paginationControls}>
          <div className={styles.pageSelector}>
            <input
              type="number"
              min="1"
              max={totalPages}
              value={currentPage}
              onChange={handlePageInputChange}
              className={styles.pageInput}
              disabled={loading}
            />
            <span>/</span>
            <span>{totalPages}</span>
          </div>
        </div>

        {/* Bouton de rechargement */}
        <button
          className={styles.iconButton}
          onClick={onRefresh}
          title="Recharger les données"
          disabled={loading}
        >
          <i className={`bi bi-arrow-clockwise ${loading ? styles.spinning : ''}`}></i>
        </button>

        {/* Bouton Calculer */}
        <button
          className={styles.iconButton}
          onClick={onCalculate}
          title="Calculer"
          disabled={loading}
        >
          <i className="bi bi-calculator"></i>
        </button>
      </div>

      {/* Séparateur */}
      <div className={styles.separator}></div>

      {/* Groupe 2: Recherche */}
      <div className={styles.controlGroup}>
        <div className={styles.searchControls}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Nom, lieu, ville, projet"
            value={localSearchValue}
            onChange={handleSearchChange}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && onSearch) {
                onSearch(localSearchValue);
              }
            }}
            disabled={loading}
          />
          <button
            className={styles.searchButton}
            onClick={() => onSearch && onSearch(localSearchValue)}
            title="Rechercher"
            disabled={loading}
          >
            <i className="bi bi-search"></i>
          </button>
        </div>
      </div>

      {/* Séparateur */}
      <div className={styles.separator}></div>

      {/* Groupe 3: Filtres de date */}
      <div className={styles.controlGroup} data-tour="dates-filters">
        <div className={styles.dateFilterControls}>
          <span className={styles.dateLabel}>Voir les dates à partir de :</span>
          <input
            type="date"
            className={styles.dateInput}
            value={localDateFilter}
            onChange={handleDateChange}
            disabled={loading}
          />
        </div>
      </div>

      {/* Groupe 4: Boutons de filtre */}
      <div className={styles.controlGroup}>
        <button
          className={styles.primaryButton}
          onClick={onFilter}
          disabled={loading}
        >
          Filtrer
        </button>
        <button
          className={styles.secondaryButton}
          onClick={onClearFilters}
          disabled={loading}
        >
          Voir tout
        </button>
      </div>

      {/* Groupe 5: Actions à droite */}
      <div className={styles.actionsGroup}>
        {/* Bouton Ajouter */}
        {onAdd && (
          <button
            className={styles.actionButton}
            onClick={onAdd}
            title="Ajouter une nouvelle date"
            disabled={loading}
          >
            <i className="bi bi-plus-lg"></i>
            <span>Ajouter</span>
          </button>
        )}

        {/* Export Excel */}
        <button
          className={styles.iconButton}
          onClick={onExportExcel}
          title="Exporter en Excel"
          disabled={loading}
        >
          <i className="bi bi-file-earmark-excel"></i>
        </button>

        {/* Vue tableau */}
        <button
          className={styles.iconButton}
          onClick={onChangeView}
          title="Changer la vue"
          disabled={loading}
        >
          <i className="bi bi-grid-3x3-gap"></i>
        </button>

        {/* Vue carte */}
        <button
          className={styles.iconButton}
          onClick={onShowMap}
          title="Afficher sur la carte"
          disabled={loading}
        >
          <i className="bi bi-globe"></i>
        </button>
      </div>
    </div>
  );
};

export default DatesTableControls;