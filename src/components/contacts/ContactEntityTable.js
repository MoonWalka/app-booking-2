import React, { useState } from 'react';
import AddButton from '@/components/ui/AddButton';
import styles from './ContactDatesTable.module.css';

/**
 * Composant tableau générique pour afficher les entités associées à un contact
 * (concerts, contrats, factures, etc.)
 */
const ContactEntityTable = ({
  title,
  icon,
  iconColor = '#dc3545',
  data = [],
  loading = false,
  error = null,
  columns = [],
  emptyMessage = "Aucune donnée disponible",
  emptyIcon = "bi-inbox",
  contactId,
  itemsPerPage = 5, // Réduit pour éviter le scroll
  fullWidth = false, // Nouvelle prop pour mode onglet plein
  showHeader = false, // Nouvelle prop pour afficher le header de pagination
  addButtonLabel = null, // Label du bouton d'ajout (ex: "Nouvelle date")
  onAddClick = null // Fonction appelée au clic sur le bouton d'ajout
}) => {
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  
  // Calculs pour la pagination
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);
  
  // Fonctions de navigation
  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToPreviousPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
  const goToNextPage = () => setCurrentPage(prev => Math.min(totalPages, prev + 1));

  // Composant pour l'état vide
  const EmptyState = ({ message, iconClass }) => (
    <div className={styles.emptyState}>
      <i className={iconClass} style={{ fontSize: '3rem', color: '#6c757d' }}></i>
      <h3>Aucune donnée</h3>
      <p>{message}</p>
    </div>
  );

  // Rendu d'une cellule selon sa configuration
  const renderCell = (item, column) => {
    if (column.render) {
      return column.render(item);
    }
    
    // Accès aux propriétés imbriquées (ex: "concert.titre")
    const value = column.key.split('.').reduce((obj, key) => obj?.[key], item);
    return value || '—';
  };

  // État de chargement
  if (loading) {
    return (
      <div className={fullWidth ? styles.fullWidthContainer : styles.tableContainer}>
        <EmptyState 
          message="Chargement des données..."
          iconClass="bi-hourglass-split"
        />
      </div>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <div className={fullWidth ? styles.fullWidthContainer : styles.tableContainer}>
        <EmptyState 
          message={`Erreur: ${error}`}
          iconClass="bi-exclamation-triangle"
        />
      </div>
    );
  }

  const containerClass = fullWidth ? styles.fullWidthContainer : styles.tableContainer;
  const wrapperClass = fullWidth ? styles.fullWidthWrapper : styles.tableWrapper;

  return (
    <div className={containerClass}>
      {/* Header de pagination */}
      {showHeader && (
        <div className={styles.tableHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.paginationSummary}>
              {data.length > 0 ? (
                <span>
                  {Math.min(startIndex + 1, data.length)}-{Math.min(endIndex, data.length)} sur {data.length}
                  {totalPages > 1 && ` • Page ${currentPage}/${totalPages}`}
                </span>
              ) : (
                <span>Aucun élément</span>
              )}
            </div>
            
            {totalPages > 1 && (
              <div className={styles.headerPaginationControls}>
                <button 
                  className={styles.headerPaginationBtn}
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  title="Page précédente"
                >
                  <i className="bi bi-chevron-left"></i>
                </button>
                <span className={styles.headerPageInfo}>
                  {currentPage}/{totalPages}
                </span>
                <button 
                  className={styles.headerPaginationBtn}
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  title="Page suivante"
                >
                  <i className="bi bi-chevron-right"></i>
                </button>
              </div>
            )}
          </div>
          
          {addButtonLabel && (
            <div className={styles.headerRight}>
              <AddButton
                onClick={() => {
                  if (onAddClick) {
                    onAddClick();
                  } else {
                    console.log(`Ajouter ${addButtonLabel.toLowerCase()}`);
                    alert(`Fonctionnalité "${addButtonLabel}" en cours de développement`);
                  }
                }}
                label={addButtonLabel}
                size="sm"
              />
            </div>
          )}
        </div>
      )}
      
      <div className={wrapperClass}>
        <table className={fullWidth ? styles.fullWidthTable : styles.table}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} style={{ width: column.width }}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '40px' }}>
                  <div style={{ color: '#6c757d' }}>
                    <i className={emptyIcon} style={{ fontSize: '2rem', marginBottom: '10px', display: 'block' }}></i>
                    {emptyMessage}
                  </div>
                </td>
              </tr>
            ) : (
              currentData.map((item, index) => (
                <tr key={item.id || index}>
                  {columns.map((column) => (
                    <td key={column.key} className={column.className}>
                      {renderCell(item, column)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination en bas (seulement si pas de header) */}
      {!showHeader && data.length > itemsPerPage && (
        <div className={fullWidth ? styles.fullWidthPagination : styles.pagination}>
          <div className={styles.paginationInfo}>
            {data.length} résultat{data.length > 1 ? 's' : ''} • Page {currentPage} sur {totalPages}
          </div>
          <div className={styles.paginationControls}>
            <button 
              className={styles.paginationBtn}
              onClick={goToFirstPage}
              disabled={currentPage === 1}
              title="Première page"
            >
              <i className="bi bi-chevron-double-left"></i>
            </button>
            <button 
              className={styles.paginationBtn}
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              title="Page précédente"
            >
              <i className="bi bi-chevron-left"></i>
            </button>
            <span className={styles.paginationCurrent}>
              {currentPage} / {totalPages}
            </span>
            <button 
              className={styles.paginationBtn}
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              title="Page suivante"
            >
              <i className="bi bi-chevron-right"></i>
            </button>
            <button 
              className={styles.paginationBtn}
              onClick={goToLastPage}
              disabled={currentPage === totalPages}
              title="Dernière page"
            >
              <i className="bi bi-chevron-double-right"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactEntityTable;