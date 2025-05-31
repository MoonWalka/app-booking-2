import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {  collection, getDocs, query, where, orderBy, limit, startAfter  } from '@/services/firebase-service';
import { db } from '../../services/firebase-service';
import { useResponsive } from '@/hooks/common';
import styles from './ListWithFilters.module.css';

/**
 * Composant générique pour afficher des listes avec filtres, tri et pagination
 * 
 * @param {Object} props - Propriétés du composant
 * @param {string} props.entityType - Type d'entité (artistes, programmateurs, etc.)
 * @param {string} props.title - Titre de la liste
 * @param {Array} props.columns - Configuration des colonnes [{id, label, field, sortable, width, render}]
 * @param {Object} props.filters - Filtres initiaux {field: value, ...}
 * @param {Object} props.sort - Tri initial {field, direction}
 * @param {React.ReactNode} props.actions - Actions personnalisées à afficher en haut
 * @param {Function} props.onRowClick - Fonction appelée lors du clic sur une ligne
 * @param {number} props.pageSize - Nombre d'éléments par page (défaut: 10)
 * @param {boolean} props.showRefresh - Afficher le bouton de rafraîchissement
 * @param {Array} props.filterOptions - Options de filtres 
 *    [{id, label, field, type, options, placeholder}]
 * @param {Function} props.renderActions - Fonction pour rendre les actions par ligne
 * @return {JSX.Element} Composant de liste avec filtres
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
}) => {
  const { isMobile } = useResponsive();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState(initialFilters);
  const [sort, setSort] = useState(initialSort);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [filterValues, setFilterValues] = useState({});
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Configuration des filtres
  useEffect(() => {
    const initialValues = {};
    filterOptions.forEach(filter => {
      if (filters[filter.field] !== undefined) {
        initialValues[filter.id] = filters[filter.field];
      } else {
        initialValues[filter.id] = '';
      }
    });
    setFilterValues(initialValues);
  }, [filterOptions, filters]);

  // Chargement des données
  const loadData = async (isLoadMore = false) => {
    setLoading(true);
    
    try {
      const collectionRef = collection(db, entityType);
      
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
      
      // Tri
      q = query(q, orderBy(sort.field, sort.direction));
      
      // Pagination
      if (isLoadMore && lastDoc) {
        q = query(q, startAfter(lastDoc), limit(pageSize));
      } else {
        q = query(q, limit(pageSize));
      }
      
      // Exécution de la requête
      const querySnapshot = await getDocs(q);
      
      // Gestion de la pagination
      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
      setLastDoc(lastVisible);
      setHasMore(querySnapshot.docs.length === pageSize);
      
      // Transformation des documents
      const loadedItems = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      // Mise à jour des items
      if (isLoadMore) {
        setItems(prev => [...prev, ...loadedItems]);
      } else {
        setItems(loadedItems);
      }
    } catch (error) {
      console.error(`Erreur lors du chargement des ${entityType}:`, error);
    } finally {
      setLoading(false);
    }
  };

  // Chargement initial
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityType, filters, sort, pageSize]);

  // Changement de tri
  const handleSort = (field) => {
    if (sort.field === field) {
      // Inversion du tri sur la même colonne
      setSort({
        field,
        direction: sort.direction === 'asc' ? 'desc' : 'asc',
      });
    } else {
      // Nouvelle colonne, tri par défaut
      setSort({
        field,
        direction: 'asc',
      });
    }
  };

  // Application des filtres
  const handleFilterApply = () => {
    const appliedFilters = {};
    
    // Transformation des valeurs de filtres en filtres appliqués
    Object.entries(filterValues).forEach(([filterId, value]) => {
      const filterOption = filterOptions.find(opt => opt.id === filterId);
      
      if (filterOption && value !== '') {
        appliedFilters[filterOption.field] = value;
      }
    });
    
    setFilters(appliedFilters);
    setLastDoc(null); // Réinitialisation de la pagination
  };

  // Réinitialisation des filtres
  const handleFilterReset = () => {
    setFilterValues({});
    setFilters({});
    setLastDoc(null);
  };

  // Chargement de plus d'éléments
  const handleLoadMore = () => {
    loadData(true);
  };

  // Rafraîchissement des données
  const handleRefresh = () => {
    setLastDoc(null);
    loadData();
  };

  // Changement de valeur de filtre
  const handleFilterChange = (filterId, value) => {
    setFilterValues(prev => ({
      ...prev,
      [filterId]: value,
    }));
  };

  // Gestion du clic sur une ligne
  const handleRowClick = (item) => {
    if (onRowClick) {
      onRowClick(item);
    }
  };

  // Rendu des colonnes
  const renderColumnValue = (item, column) => {
    if (column.render) {
      return column.render(item);
    }
    
    if (!column.field) {
      return '';
    }
    
    const value = column.field.split('.').reduce((obj, key) => 
      obj ? obj[key] : undefined, item);
      
    return value || '';
  };

  // Déterminer si des filtres sont appliqués
  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== '');

  // Fonction pour rendre une carte mobile
  const renderMobileCard = (item) => {
    // Utiliser les 2-3 premières colonnes pour l'affichage principal
    const mainColumns = columns.slice(0, 3);
    const titleColumn = columns[0];
    const titleValue = renderColumnValue(item, titleColumn);

    return (
      <div 
        key={item.id} 
        className={styles.mobileCard}
        onClick={() => handleRowClick(item)}
      >
        <div className={styles.mobileCardHeader}>
          <h3 className={styles.mobileCardTitle}>{titleValue}</h3>
          {renderActions && (
            <div 
              className={styles.mobileCardActions}
              onClick={(e) => e.stopPropagation()}
            >
              {renderActions(item)}
            </div>
          )}
        </div>
        
        <div className={styles.mobileCardContent}>
          {mainColumns.slice(1).map((column) => (
            <div key={column.id} className={styles.mobileCardField}>
              <div className={styles.mobileCardFieldLabel}>
                {column.label}
              </div>
              <div className={styles.mobileCardFieldValue}>
                {renderColumnValue(item, column)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {title && <h2 className={styles.title}>{title}</h2>}
        
        <div className={styles.actionsWrapper}>
          {actions}
          
          {showRefresh && (
            <button 
              className={styles.refreshButton} 
              onClick={handleRefresh}
              title="Rafraîchir"
            >
              <i className="bi bi-arrow-clockwise"></i>
            </button>
          )}
        </div>
      </div>
      
      {filterOptions.length > 0 && (
        <>
          {isMobile && (
            <button
              className={styles.mobileFiltersToggle}
              onClick={() => setShowMobileFilters(!showMobileFilters)}
            >
              <i className={`bi ${showMobileFilters ? 'bi-funnel-fill' : 'bi-funnel'}`}></i>
              {showMobileFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
              {hasActiveFilters && <i className="bi bi-dot" style={{ color: 'orange' }}></i>}
            </button>
          )}
          
          <div 
            className={styles.filtersContainer}
            style={isMobile ? { display: showMobileFilters ? 'block' : 'none' } : {}}
          >
            <div className={styles.filters}>
              {filterOptions.map((filter) => (
                <div key={filter.id} className={styles.filterItem}>
                  <label className={styles.filterLabel}>{filter.label}</label>
                  
                  {filter.type === 'select' && (
                    <select
                      className={styles.filterSelect}
                      value={filterValues[filter.id] || ''}
                      onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                    >
                      <option value="">{filter.placeholder || 'Tous'}</option>
                      {filter.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}
                  
                  {filter.type === 'text' && (
                    <input
                      type="text"
                      className={styles.filterInput}
                      value={filterValues[filter.id] || ''}
                      onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                      placeholder={filter.placeholder || 'Rechercher...'}
                    />
                  )}
                  
                  {filter.type === 'date' && (
                    <input
                      type="date"
                      className={styles.filterInput}
                      value={filterValues[filter.id] || ''}
                      onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
            
            <div className={styles.filterActions}>
              <button 
                className={styles.applyButton} 
                onClick={handleFilterApply}
              >
                Appliquer
              </button>
              {hasActiveFilters && (
                <button 
                  className={styles.resetButton} 
                  onClick={handleFilterReset}
                >
                  Réinitialiser
                </button>
              )}
            </div>
          </div>
        </>
      )}
      
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th 
                  key={column.id} 
                  className={`${styles.tableHeader} ${column.sortable ? styles.sortable : ''}`}
                  style={{ '--column-width': column.width || 'auto' }}
                  onClick={() => column.sortable && handleSort(column.field)}
                >
                  <div className={styles.headerContent}>
                    <span>{column.label}</span>
                    {column.sortable && (
                      <div className={styles.sortIcon}>
                        {sort.field === column.field ? (
                          sort.direction === 'asc' ? (
                            <i className="bi bi-caret-up-fill"></i>
                          ) : (
                            <i className="bi bi-caret-down-fill"></i>
                          )
                        ) : (
                          <i className="bi bi-caret-down"></i>
                        )}
                      </div>
                    )}
                  </div>
                </th>
              ))}
              {renderActions && (
                <th className={styles.tableHeader} style={{ width: '120px' }}>
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (renderActions ? 1 : 0)} className={styles.noData}>
                  {loading ? (
                    <div className={styles.loading}>
                      <i className="bi bi-hourglass-split"></i>
                      <span>Chargement...</span>
                    </div>
                  ) : (
                    <div className={styles.noResults}>
                      <i className="bi bi-search"></i>
                      <span>Aucun résultat trouvé</span>
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr 
                  key={item.id} 
                  className={styles.tableRow}
                  onClick={() => handleRowClick(item)}
                >
                  {columns.map((column) => (
                    <td 
                      key={`${item.id}-${column.id}`} 
                      className={styles.tableCell}
                    >
                      {renderColumnValue(item, column)}
                    </td>
                  ))}
                  {renderActions && (
                    <td 
                      className={styles.tableCell} 
                      onClick={(e) => e.stopPropagation()}
                    >
                      {renderActions(item)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Conteneur des cartes mobiles */}
      <div className={styles.mobileCardsContainer}>
        {items.length === 0 ? (
          <div className={styles.noData}>
            {loading ? (
              <div className={styles.loading}>
                <i className="bi bi-hourglass-split"></i>
                <span>Chargement...</span>
              </div>
            ) : (
              <div className={styles.noResults}>
                <i className="bi bi-search"></i>
                <span>Aucun résultat trouvé</span>
              </div>
            )}
          </div>
        ) : (
          items.map((item) => renderMobileCard(item))
        )}
      </div>
      
      {hasMore && !loading && (
        <div className={styles.loadMoreContainer}>
          <button 
            className={styles.loadMoreButton} 
            onClick={handleLoadMore}
          >
            Charger plus
          </button>
        </div>
      )}
      
      {loading && items.length > 0 && (
        <div className={styles.loadingMoreContainer}>
          <i className="bi bi-hourglass-split"></i>
          <span>Chargement...</span>
        </div>
      )}
    </div>
  );
};

ListWithFilters.propTypes = {
  entityType: PropTypes.string.isRequired,
  title: PropTypes.string,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      field: PropTypes.string,
      sortable: PropTypes.bool,
      width: PropTypes.string,
      render: PropTypes.func,
    })
  ).isRequired,
  filters: PropTypes.object,
  sort: PropTypes.shape({
    field: PropTypes.string,
    direction: PropTypes.oneOf(['asc', 'desc']),
  }),
  actions: PropTypes.node,
  onRowClick: PropTypes.func,
  pageSize: PropTypes.number,
  showRefresh: PropTypes.bool,
  filterOptions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      field: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['text', 'select', 'date']).isRequired,
      options: PropTypes.arrayOf(
        PropTypes.shape({
          value: PropTypes.string.isRequired,
          label: PropTypes.string.isRequired,
        })
      ),
      placeholder: PropTypes.string,
    })
  ),
  renderActions: PropTypes.func,
};

export default ListWithFilters;