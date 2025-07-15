import React from 'react';
import styles from './ContactsToolbar.module.css';

const ContactsToolbar = ({
  viewMode,
  setViewMode,
  showPersonnesOnly,
  setShowPersonnesOnly,
  currentPage,
  setCurrentPage,
  totalPages,
  itemsPerPage,
  setItemsPerPage,
  totalItems,
  onRefresh
}) => {
  
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={styles.toolbar}>
      <div className={styles.leftSection}>
        {/* Bouton Refresh */}
        <button 
          className={styles.toolbarButton}
          onClick={onRefresh}
          title="Rafraîchir"
        >
          <i className="bi bi-arrow-clockwise"></i>
        </button>

        {/* Bouton Mode Personne */}
        <button 
          className={`${styles.toolbarButton} ${showPersonnesOnly ? styles.active : ''}`}
          onClick={() => setShowPersonnesOnly(!showPersonnesOnly)}
          title={showPersonnesOnly ? "Afficher tous les contacts" : "Afficher uniquement les personnes"}
        >
          <i className="bi bi-person"></i>
        </button>

        <div className={styles.separator}></div>

        {/* Boutons de vue */}
        <div className={styles.viewButtons}>
          <button 
            className={`${styles.viewButton} ${viewMode === 'list' ? styles.active : ''}`}
            onClick={() => setViewMode('list')}
            title="Vue liste"
          >
            <i className="bi bi-list"></i>
          </button>
          <button 
            className={`${styles.viewButton} ${viewMode === 'map' ? styles.active : ''}`}
            onClick={() => setViewMode('map')}
            title="Vue carte"
          >
            <i className="bi bi-geo-alt"></i>
          </button>
        </div>
      </div>

      <div className={styles.rightSection}>
        {/* Infos de pagination */}
        <span className={styles.paginationInfo}>
          {startItem}-{endItem} sur {totalItems}
        </span>

        {/* Sélecteur d'items par page */}
        <select 
          className={styles.itemsPerPageSelect}
          value={itemsPerPage}
          onChange={(e) => {
            setItemsPerPage(Number(e.target.value));
            setCurrentPage(1); // Retour à la première page
          }}
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>

        {/* Contrôles de pagination */}
        <div className={styles.paginationControls}>
          <button 
            className={styles.paginationButton}
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            title="Première page"
          >
            <i className="bi bi-chevron-double-left"></i>
          </button>
          <button 
            className={styles.paginationButton}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            title="Page précédente"
          >
            <i className="bi bi-chevron-left"></i>
          </button>
          
          <span className={styles.pageInfo}>
            Page {currentPage} / {totalPages}
          </span>
          
          <button 
            className={styles.paginationButton}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            title="Page suivante"
          >
            <i className="bi bi-chevron-right"></i>
          </button>
          <button 
            className={styles.paginationButton}
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            title="Dernière page"
          >
            <i className="bi bi-chevron-double-right"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactsToolbar;