import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useResponsive } from '@/hooks/common';
import { useMultiOrgQuery } from '@/hooks/useMultiOrgQuery';
import styles from './ResponsiveList.module.css';

/**
 * Composant de liste responsive unifié qui remplace tous les composants desktop/mobile
 * Utilise le nouveau système de design et s'adapte automatiquement à la taille d'écran
 */
const ResponsiveList = ({
  entityType,
  title,
  columns,
  filterOptions = [],
  searchPlaceholder = 'Rechercher...',
  onRowClick,
  onAdd,
  renderActions,
  initialSort = { field: 'updatedAt', direction: 'desc' },
  pageSize = 20,
  showStats = true,
  showFilters = true,
  showSearch = true,
  emptyMessage = 'Aucun élément trouvé',
  className = ''
}) => {
  const { isMobile } = useResponsive();
  
  // États locaux pour les filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState(initialSort.field);
  const [sortDirection, setSortDirection] = useState(initialSort.direction);
  
  // Chargement des données
  const {
    data: items = [],
    loading,
    error,
    loadMore,
    hasMore,
    loadingMore
  } = useMultiOrgQuery(entityType, {
    orderByField: sortBy,
    orderDirection: sortDirection,
    limitCount: pageSize
  });
  
  // Filtrage des données
  const filteredItems = useMemo(() => {
    if (!items.length) return [];
    
    return items.filter(item => {
      // Filtre de recherche
      if (searchTerm) {
        const searchableText = columns
          .filter(col => col.searchable !== false)
          .map(col => {
            const value = getNestedValue(item, col.field);
            return value ? value.toString().toLowerCase() : '';
          })
          .join(' ');
        
        if (!searchableText.includes(searchTerm.toLowerCase())) {
          return false;
        }
      }
      
      // Autres filtres
      for (const [filterKey, filterValue] of Object.entries(filters)) {
        if (filterValue && filterValue !== '') {
          const itemValue = getNestedValue(item, filterKey);
          if (itemValue !== filterValue) {
            return false;
          }
        }
      }
      
      return true;
    });
  }, [items, searchTerm, filters, columns]);
  
  // Statistiques
  const stats = useMemo(() => {
    if (!showStats || !items.length) return null;
    
    return {
      total: items.length,
      filtered: filteredItems.length,
      // Stats personnalisées basées sur le type d'entité
      ...(entityType === 'concerts' && {
        aVenir: items.filter(c => new Date(c.date) > new Date()).length,
        passes: items.filter(c => new Date(c.date) <= new Date()).length
      }),
      ...(entityType === 'structures' && {
        associations: items.filter(s => s.type === 'association').length,
        entreprises: items.filter(s => s.type === 'entreprise').length
      })
    };
  }, [items, filteredItems, entityType, showStats]);
  
  // Gestion du tri
  const handleSort = useCallback((field) => {
    if (sortBy === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  }, [sortBy]);
  
  // Gestion des filtres
  const handleFilterChange = useCallback((filterKey, value) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
  }, []);
  
  // Rendu responsive du contenu
  const renderContent = () => {
    if (loading) {
      return (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Chargement...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className={styles.error}>
          <i className="bi bi-exclamation-triangle"></i>
          <p>Erreur lors du chargement</p>
        </div>
      );
    }
    
    if (!filteredItems.length) {
      return (
        <div className={styles.empty}>
          <i className="bi bi-inbox"></i>
          <p>{emptyMessage}</p>
        </div>
      );
    }
    
    return isMobile ? renderMobileList() : renderDesktopTable();
  };
  
  // Rendu desktop (tableau)
  const renderDesktopTable = () => (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map(column => (
              <th 
                key={column.id}
                className={column.sortable ? styles.sortableHeader : ''}
                onClick={column.sortable ? () => handleSort(column.field) : undefined}
              >
                <span className={styles.headerContent}>
                  {column.label}
                  {column.sortable && sortBy === column.field && (
                    <i className={`bi bi-chevron-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                  )}
                </span>
              </th>
            ))}
            {renderActions && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {filteredItems.map(item => (
            <tr 
              key={item.id}
              className={onRowClick ? styles.clickableRow : ''}
              onClick={onRowClick ? () => onRowClick(item) : undefined}
            >
              {columns.map(column => (
                <td key={column.id}>
                  {column.render 
                    ? column.render(item)
                    : getNestedValue(item, column.field) || '-'
                  }
                </td>
              ))}
              {renderActions && (
                <td onClick={e => e.stopPropagation()}>
                  {renderActions(item)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
  
  // Rendu mobile (cartes)
  const renderMobileList = () => (
    <div className={styles.mobileList}>
      {filteredItems.map(item => (
        <div 
          key={item.id}
          className={`${styles.mobileCard} ${onRowClick ? styles.clickableCard : ''}`}
          onClick={onRowClick ? () => onRowClick(item) : undefined}
        >
          {columns.slice(0, 3).map(column => ( // Afficher seulement les 3 premières colonnes sur mobile
            <div key={column.id} className={styles.mobileField}>
              <span className={styles.mobileLabel}>{column.label}:</span>
              <span className={styles.mobileValue}>
                {column.render 
                  ? column.render(item)
                  : getNestedValue(item, column.field) || '-'
                }
              </span>
            </div>
          ))}
          {renderActions && (
            <div className={styles.mobileActions} onClick={e => e.stopPropagation()}>
              {renderActions(item)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
  
  return (
    <div className={`${styles.container} ${className}`}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        {onAdd && (
          <button className={styles.addButton} onClick={onAdd}>
            <i className="bi bi-plus-lg"></i>
            {isMobile ? '' : `Nouveau ${entityType.slice(0, -1)}`}
          </button>
        )}
      </div>
      
      {/* Stats */}
      {stats && (
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{stats.total}</span>
            <span className={styles.statLabel}>Total</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{stats.filtered}</span>
            <span className={styles.statLabel}>Affichés</span>
          </div>
          {Object.entries(stats).map(([key, value]) => {
            if (key !== 'total' && key !== 'filtered') {
              return (
                <div key={key} className={styles.statCard}>
                  <span className={styles.statValue}>{value}</span>
                  <span className={styles.statLabel}>{key}</span>
                </div>
              );
            }
            return null;
          })}
        </div>
      )}
      
      {/* Filtres et recherche */}
      {(showSearch || showFilters) && (
        <div className={styles.filters}>
          {showSearch && (
            <div className={styles.searchBox}>
              <i className="bi bi-search"></i>
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
              {searchTerm && (
                <button 
                  className={styles.clearButton}
                  onClick={() => setSearchTerm('')}
                >
                  <i className="bi bi-x"></i>
                </button>
              )}
            </div>
          )}
          
          {showFilters && filterOptions.map(filter => (
            <div key={filter.id} className={styles.filterGroup}>
              {filter.type === 'select' ? (
                <select
                  value={filters[filter.field] || ''}
                  onChange={(e) => handleFilterChange(filter.field, e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="">{filter.label}</option>
                  {filter.options?.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={filter.type || 'text'}
                  placeholder={filter.placeholder || filter.label}
                  value={filters[filter.field] || ''}
                  onChange={(e) => handleFilterChange(filter.field, e.target.value)}
                  className={styles.filterInput}
                />
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Contenu principal */}
      {renderContent()}
      
      {/* Pagination */}
      {!searchTerm && Object.keys(filters).every(k => !filters[k]) && hasMore && (
        <div className={styles.pagination}>
          <button 
            className={styles.loadMoreButton}
            onClick={loadMore}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <>
                <span className={styles.buttonSpinner}></span>
                Chargement...
              </>
            ) : (
              'Charger plus'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

// Fonction utilitaire pour accéder aux propriétés imbriquées
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

ResponsiveList.propTypes = {
  entityType: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  columns: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    field: PropTypes.string.isRequired,
    sortable: PropTypes.bool,
    searchable: PropTypes.bool,
    render: PropTypes.func
  })).isRequired,
  filterOptions: PropTypes.array,
  searchPlaceholder: PropTypes.string,
  onRowClick: PropTypes.func,
  onAdd: PropTypes.func,
  renderActions: PropTypes.func,
  initialSort: PropTypes.object,
  pageSize: PropTypes.number,
  showStats: PropTypes.bool,
  showFilters: PropTypes.bool,
  showSearch: PropTypes.bool,
  emptyMessage: PropTypes.string,
  className: PropTypes.string
};

export default ResponsiveList;