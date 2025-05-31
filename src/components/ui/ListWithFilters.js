import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {  collection, getDocs, query, where, orderBy, limit, startAfter  } from '@/services/firebase-service';
import { db } from '../../services/firebase-service';
import { useResponsive } from '@/hooks/common';
import StatsCards from './StatsCards';
import styles from './ListWithFilters.module.css';

/**
 * Version simplifiée de ListWithFilters qui utilise les collections standard Firebase
 * (pas de système multi-organisation)
 */
const ListWithFilters = ({
  entityType,
  title,
  columns,
  filters: initialFilters = {},
  sort: initialSort = { field: 'createdAt', direction: 'desc' },
  actions,
  onRowClick,
  pageSize = 10,
  showRefresh = true,
  filterOptions = [],
  renderActions,
  calculateStats,
  showStats = false,
  showAdvancedFilters = false,
  advancedFilterOptions = [],
  // Props pour données externes (hooks spécialisés)
  initialData = null,
  loading: externalLoading = null,
  error: externalError = null,
  onRefresh: externalOnRefresh = null,
}) => {
  const { isMobile } = useResponsive();
  const [items, setItems] = useState(initialData || []);
  const [loading, setLoading] = useState(externalLoading !== null ? externalLoading : true);
  const [error, setError] = useState(externalError);
  const [filters, setFilters] = useState(initialFilters);
  const [sort, setSortState] = useState(initialSort);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [filterValues, setFilterValues] = useState({});

  // Synchronisation avec les données externes
  useEffect(() => {
    if (initialData !== null) {
      setItems(initialData);
    }
  }, [initialData]);

  useEffect(() => {
    if (externalLoading !== null) {
      setLoading(externalLoading);
    }
  }, [externalLoading]);

  useEffect(() => {
    if (externalError !== null) {
      setError(externalError);
    }
  }, [externalError]);

  // Initialisation des valeurs de filtres
  useEffect(() => {
    const initialValues = {};
    filterOptions.forEach(option => {
      if (filters[option.field] !== undefined) {
        initialValues[option.id] = filters[option.field];
      }
    });
    setFilterValues(initialValues);
  }, [filterOptions, filters]);

  // Chargement des données - VERSION SIMPLIFIÉE
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const loadData = useCallback(async (isLoadMore = false) => {
    // Si des données externes sont fournies, ne pas charger depuis Firebase
    if (initialData !== null) {
      console.log('📦 Utilisation des données externes (hooks spécialisés)');
      return;
    }

    setLoading(true);
    
    try {
      // Utiliser directement la collection standard
      const collectionName = entityType;
      console.log(`📁 Chargement de la collection: ${collectionName}`);
      
      const collectionRef = collection(db, collectionName);
      
      // Construction de la requête
      let q = collectionRef;
      
      // Ajout des filtres
      const filterEntries = Object.entries(filters);
      if (filterEntries.length > 0) {
        const filterConditions = filterEntries
          .filter(([field, value]) => value !== undefined && value !== '')
          .map(([field, value]) => where(field, '==', value));
        
        if (filterConditions.length > 0) {
          q = query(q, ...filterConditions);
        }
      }
      
      // Tri avec gestion d'erreur
      try {
        q = query(q, orderBy(sort.field, sort.direction));
      } catch (sortError) {
        console.warn(`⚠️ Impossible de trier par ${sort.field}, utilisation du tri par défaut:`, sortError);
        // Fallback sur createdAt si le champ de tri n'existe pas
        try {
          q = query(q, orderBy('createdAt', 'desc'));
        } catch (fallbackError) {
          console.warn('⚠️ Pas de tri appliqué:', fallbackError);
          // Continuer sans tri si aucun champ ne fonctionne
        }
      }
      
      // Pagination
      if (isLoadMore && lastDoc) {
        q = query(q, startAfter(lastDoc), limit(pageSize));
      } else {
        q = query(q, limit(pageSize));
      }
      
      const querySnapshot = await getDocs(q);
      
      console.log(`✅ Données chargées: ${querySnapshot.docs.length} éléments`);
      
      const loadedItems = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      if (isLoadMore) {
        setItems(prev => [...prev, ...loadedItems]);
      } else {
        setItems(loadedItems);
      }
      
      // Gestion pagination
      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
      setLastDoc(lastVisible);
      setHasMore(querySnapshot.docs.length === pageSize);
      
      setError(null);
    } catch (err) {
      console.error('❌ Erreur chargement données:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityType, filters, sort, pageSize]);

  // Recharger les données quand les paramètres changent
  useEffect(() => {
    setLastDoc(null); // Reset pagination when parameters change
    loadData();
  }, [loadData]);

  // Gestion du rafraîchissement
  const handleRefresh = () => {
    if (externalOnRefresh) {
      externalOnRefresh();
    } else {
      loadData();
    }
  };

  // Gestion du tri
  const handleSort = (field) => {
    const newDirection = sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc';
    setSortState({ field, direction: newDirection });
  };

  // Gestion des filtres
  const handleFilterChange = (filterId, value) => {
    setFilterValues(prev => ({ ...prev, [filterId]: value }));
  };

  const applyFilters = () => {
    const newFilters = {};
    filterOptions.forEach(option => {
      const value = filterValues[option.id];
      if (value !== undefined && value !== '') {
        newFilters[option.field] = value;
      }
    });
    setFilters(newFilters);
  };

  const resetFilters = () => {
    setFilterValues({});
    setFilters({});
  };

  // Rendu du tableau desktop
  const renderDesktopTable = () => (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map(column => (
              <th
                key={column.id}
                className={column.sortable ? styles.sortable : ''}
                onClick={column.sortable ? () => handleSort(column.field) : undefined}
                style={{ width: column.width }}
              >
                <div className={styles.headerContent}>
                  <span>{column.label}</span>
                  {column.sortable && sort.field === column.field && (
                    <i className={`bi bi-arrow-${sort.direction === 'asc' ? 'up' : 'down'} ${styles.sortIcon}`}></i>
                  )}
                </div>
              </th>
            ))}
            {renderActions && <th style={{ width: '120px' }}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr
              key={item.id}
              className={styles.tableRow}
              onClick={onRowClick ? () => onRowClick(item) : undefined}
              style={{ cursor: onRowClick ? 'pointer' : 'default' }}
            >
              {columns.map(column => (
                <td key={column.id} className={styles.tableCell}>
                  {column.render ? column.render(item) : item[column.field] || '-'}
                </td>
              ))}
              {renderActions && (
                <td className={styles.tableCell}>
                  {renderActions(item)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Rendu des cartes mobiles
  const renderMobileCards = () => (
    <div className={styles.mobileCardsContainer}>
      {items.map(item => (
        <div
          key={item.id}
          className={styles.mobileCard}
          onClick={onRowClick ? () => onRowClick(item) : undefined}
        >
          <div className={styles.mobileCardHeader}>
            <h3 className={styles.mobileCardTitle}>
              {columns[0]?.render ? columns[0].render(item) : item[columns[0]?.field] || 'Sans titre'}
            </h3>
            {renderActions && (
              <div className={styles.mobileCardActions}>
                {renderActions(item)}
              </div>
            )}
          </div>
          <div className={styles.mobileCardContent}>
            {columns.slice(1, 5).map(column => (
              <div key={column.id} className={styles.mobileCardField}>
                <span className={styles.mobileCardFieldLabel}>{column.label}</span>
                <span className={styles.mobileCardFieldValue}>
                  {column.render ? column.render(item) : item[column.field] || '-'}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  if (loading && items.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <span>Chargement...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <i className="bi bi-exclamation-triangle"></i>
          <span>Erreur: {error}</span>
          <button onClick={handleRefresh} className={styles.retryButton}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* En-tête */}
      <div className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        <div className={styles.actionsWrapper}>
          {showRefresh && (
            <button
              onClick={handleRefresh}
              className={styles.refreshButton}
              title="Actualiser"
            >
              <i className="bi bi-arrow-clockwise"></i>
            </button>
          )}
          {actions}
        </div>
      </div>

      {/* Statistiques */}
      {showStats && calculateStats && (
        <StatsCards stats={calculateStats(items)} />
      )}

      {/* Filtres basiques */}
      {filterOptions.length > 0 && (
        <div className={styles.filtersContainer}>
          <div className={styles.filters}>
            {filterOptions.map(option => (
              <div key={option.id} className={styles.filterItem}>
                <label className={styles.filterLabel}>{option.label}</label>
                {option.type === 'select' ? (
                  <select
                    className={styles.filterSelect}
                    value={filterValues[option.id] || ''}
                    onChange={(e) => handleFilterChange(option.id, e.target.value)}
                  >
                    <option value="">{option.placeholder || 'Tous'}</option>
                    {option.options?.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={option.type || 'text'}
                    className={styles.filterInput}
                    placeholder={option.placeholder}
                    value={filterValues[option.id] || ''}
                    onChange={(e) => handleFilterChange(option.id, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
          <div className={styles.filterActions}>
            <button onClick={resetFilters} className={styles.resetButton}>
              <i className="bi bi-x-circle"></i> Effacer
            </button>
            <button onClick={applyFilters} className={styles.applyButton}>
              <i className="bi bi-funnel"></i> Appliquer
            </button>
          </div>
        </div>
      )}

      {/* Contenu principal */}
      {items.length === 0 ? (
        <div className={styles.noData}>
          <i className="bi bi-inbox"></i>
          <span>Aucune donnée trouvée</span>
        </div>
      ) : (
        <>
          {isMobile ? renderMobileCards() : renderDesktopTable()}
          
          {/* Pagination */}
          {hasMore && (
            <div className={styles.loadMoreContainer}>
              <button
                onClick={() => loadData(true)}
                className={styles.loadMoreButton}
                disabled={loading}
              >
                {loading ? 'Chargement...' : 'Charger plus'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

ListWithFilters.propTypes = {
  entityType: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  columns: PropTypes.array.isRequired,
  filters: PropTypes.object,
  sort: PropTypes.object,
  actions: PropTypes.node,
  onRowClick: PropTypes.func,
  pageSize: PropTypes.number,
  showRefresh: PropTypes.bool,
  filterOptions: PropTypes.array,
  renderActions: PropTypes.func,
  calculateStats: PropTypes.func,
  showStats: PropTypes.bool,
  showAdvancedFilters: PropTypes.bool,
  advancedFilterOptions: PropTypes.array,
  // Props pour données externes
  initialData: PropTypes.array,
  loading: PropTypes.bool,
  error: PropTypes.string,
  onRefresh: PropTypes.func,
};

export default ListWithFilters;