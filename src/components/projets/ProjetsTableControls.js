import React from 'react';
import styles from './ProjetsTableControls.module.css';

/**
 * Composant de contrôle pour le tableau des projets
 * Inclut recherche, filtre par artiste, rechargement et réinitialisation
 */
const ProjetsTableControls = ({
  searchValue = '',
  onSearchChange,
  selectedArtiste = '',
  onArtisteChange,
  artistes = [],
  onRefresh,
  onClearFilters,
  loading = false
}) => {
  return (
    <div className={styles.controlsContainer}>
      {/* Groupe de recherche */}
      <div className={styles.controlGroup}>
        <div className={styles.searchControls}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Rechercher un projet..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.separator} />

      {/* Groupe de filtre artiste */}
      <div className={styles.controlGroup}>
        <div className={styles.filterControls}>
          <select
            className={styles.artisteSelect}
            value={selectedArtiste}
            onChange={(e) => onArtisteChange(e.target.value)}
          >
            <option value="">Tous les artistes</option>
            {artistes.map(artiste => (
              <option key={artiste.id} value={artiste.id}>
                {[artiste.prenom, artiste.nom].filter(Boolean).join(' ') || artiste.nom}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.separator} />

      {/* Groupe d'actions */}
      <div className={styles.actionsGroup}>
        <button
          className={styles.iconButton}
          onClick={onRefresh}
          disabled={loading}
          title="Recharger les données"
        >
          <i className={`bi bi-arrow-clockwise ${loading ? styles.spinning : ''}`}></i>
        </button>
        
        <button
          className={styles.secondaryButton}
          onClick={onClearFilters}
          title="Voir tout"
        >
          <i className="bi bi-eye me-1"></i>
          Voir tout
        </button>
      </div>
    </div>
  );
};

export default ProjetsTableControls;