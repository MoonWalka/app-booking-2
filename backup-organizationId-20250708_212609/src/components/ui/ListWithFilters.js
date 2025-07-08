import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {  collection, getDocs, query, where, orderBy, limit, startAfter  } from '@/services/firebase-service';
import { db } from '@services/firebase-service';
import { useResponsive } from '@/hooks/common';
import { useEntreprise } from '@/context/EntrepriseContext';
import StatsCards from './StatsCards';
import styles from './ListWithFilters.module.css';

/**
 * Version améliorée de ListWithFilters qui filtre automatiquement par organizationId
 * pour garantir la séparation des données entre organisations
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
  const { currentEntreprise } = useEntreprise();
  const [items, setItems] = useState(initialData || []);

  // Fonction utilitaire pour déterminer la classe CSS selon le type de données
  const getCellClass = (column, value) => {
    const field = column.field?.toLowerCase() || '';
    const label = column.label?.toLowerCase() || '';
    
    // Détection du type basée sur le nom du champ ou de la colonne
    if (field.includes('montant') || field.includes('prix') || field.includes('cout') || 
        label.includes('montant') || label.includes('prix') || label.includes('€')) {
      return `${styles.tableCell} ${styles.cellNumber}`;
    }
    
    if (field.includes('date') || field.includes('created') || field.includes('updated') ||
        label.includes('date')) {
      return `${styles.tableCell} ${styles.cellDate}`;
    }
    
    if (field.includes('email') || field.includes('mail') || 
        (typeof value === 'string' && value.includes('@'))) {
      return `${styles.tableCell} ${styles.cellEmail}`;
    }
    
    if (field.includes('telephone') || field.includes('phone') || field.includes('tel') ||
        label.includes('téléphone') || label.includes('phone')) {
      return `${styles.tableCell} ${styles.cellPhone}`;
    }
    
    if (field.includes('statut') || field.includes('status') || field.includes('etat') ||
        label.includes('statut') || label.includes('status')) {
      return `${styles.tableCell} ${styles.cellStatus}`;
    }
    
    // Par défaut, texte normal
    return `${styles.tableCell} ${styles.cellText}`;
  };

  // Fonction pour l'alignement des en-têtes
  const getHeaderClass = (column) => {
    const field = column.field?.toLowerCase() || '';
    const label = column.label?.toLowerCase() || '';
    
    if (field.includes('montant') || field.includes('prix') || field.includes('cout') || 
        label.includes('montant') || label.includes('prix') || label.includes('€')) {
      return styles.headerNumber;
    }
    
    if (field.includes('date') || field.includes('created') || field.includes('updated') ||
        label.includes('date')) {
      return styles.headerDate;
    }
    
    if (field.includes('email') || field.includes('mail')) {
      return styles.headerEmail;
    }
    
    if (field.includes('telephone') || field.includes('phone') || field.includes('tel') ||
        label.includes('téléphone') || label.includes('phone')) {
      return styles.headerPhone;
    }
    
    if (field.includes('statut') || field.includes('status') || field.includes('etat') ||
        label.includes('statut') || label.includes('status')) {
      return styles.headerStatus;
    }
    
    return styles.headerText;
  };
  const [loading, setLoading] = useState(externalLoading !== null ? externalLoading : true);
  const [error, setError] = useState(externalError);
  const [filters, setFilters] = useState(initialFilters);
  const [sort, setSortState] = useState(initialSort);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [filterValues, setFilterValues] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  // Fonction utilitaire pour le tri client-side
  const sortDataClientSide = (data, sortField, sortDirection) => {
    if (!sortField || !data || data.length === 0) return data;

    return [...data].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Gestion des valeurs nulles/undefined
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortDirection === 'asc' ? 1 : -1;
      if (bValue == null) return sortDirection === 'asc' ? -1 : 1;

      // Conversion pour le tri
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        // Tri alphabétique avec gestion des accents
        aValue = aValue.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        bValue = bValue.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      }

      // Tri des dates Firestore
      if (aValue?.toDate && bValue?.toDate) {
        aValue = aValue.toDate();
        bValue = bValue.toDate();
      }

      // Tri numérique
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Tri par défaut (string et dates)
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Synchronisation avec les données externes
  useEffect(() => {
    if (initialData !== null) {
      console.log('🔄 Application tri client-side:', { field: sort.field, direction: sort.direction });
      const sortedData = sortDataClientSide(initialData, sort.field, sort.direction);
      setItems(sortedData);
    }
  }, [initialData, sort.field, sort.direction]);

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

  // Fonction de sanitisation des données imbriquées
  const sanitizeNestedData = (data, organizationId) => {
    return data.map(item => {
      // Détecter et aplatir les structures imbriquées
      if (entityType === 'contacts' && item.contact && typeof item.contact === 'object') {
        console.warn(`⚠️ Structure imbriquée détectée pour contact ${item.id}`);
        return {
          ...item.contact,
          id: item.id,
          organizationId: item.organizationId || organizationId,
          // Préserver les relations
          structures: item.structures || item.contact.structures || [],
          lieux: item.lieux || item.contact.lieux || [],
          dates: item.dates || item.contact.dates || []
        };
      }
      
      if (entityType === 'lieux' && item.lieu && typeof item.lieu === 'object') {
        console.warn(`⚠️ Structure imbriquée détectée pour lieu ${item.id}`);
        return {
          ...item.lieu,
          id: item.id,
          organizationId: item.organizationId || organizationId,
          // Préserver les relations
          contacts: item.contacts || item.lieu.contacts || [],
          structures: item.structures || item.lieu.structures || [],
          dates: item.dates || item.lieu.dates || []
        };
      }
      
      if (entityType === 'artistes' && item.artiste && typeof item.artiste === 'object') {
        console.warn(`⚠️ Structure imbriquée détectée pour artiste ${item.id}`);
        return {
          ...item.artiste,
          id: item.id,
          organizationId: item.organizationId || organizationId,
          dates: item.dates || item.artiste.dates || []
        };
      }
      
      if (entityType === 'structures' && item.structure && typeof item.structure === 'object') {
        console.warn(`⚠️ Structure imbriquée détectée pour structure ${item.id}`);
        return {
          ...item.structure,
          id: item.id,
          organizationId: item.organizationId || organizationId,
          contacts: item.contacts || item.structure.contacts || [],
          lieux: item.lieux || item.structure.lieux || []
        };
      }
      
      return item;
    });
  };

  // Chargement des données - VERSION SIMPLIFIÉE
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const loadData = useCallback(async (isLoadMore = false) => {
    // Si des données externes sont fournies, ne pas charger depuis Firebase
    if (initialData !== null) {
      console.log('📦 Utilisation des données externes (hooks spécialisés)');
      // Appliquer la sanitisation même sur les données externes
      if (currentEntreprise?.id) {
        const sanitizedData = sanitizeNestedData(initialData, currentEntreprise.id);
        setItems(sanitizedData);
      }
      return;
    }
    
    // Vérifier que entityType est défini
    if (!entityType) {
      console.warn('⚠️ entityType non défini - arrêt du chargement Firebase');
      return;
    }

    setLoading(true);
    
    try {
      // Utiliser directement la collection standard
      const collectionName = entityType;
      console.log(`📁 Chargement de la collection: ${collectionName}`);
      
      const collectionRef = collection(db, collectionName);
      
      // Construction de la requête avec les filtres
      const queryConditions = [];
      
      // IMPORTANT: Toujours filtrer par organizationId pour la sécurité
      console.log('🔍 DEBUG ListWithFilters:', {
        entityType: entityType,
        currentEntreprise: currentEntreprise,
        currentEntrepriseId: currentEntreprise?.id,
        localStorageId: localStorage.getItem('currentEntrepriseId')
      });
      
      if (currentEntreprise?.id) {
        queryConditions.push(where('organizationId', '==', currentEntreprise.id));
        console.log('✅ Filtre organizationId appliqué:', currentEntreprise.id);
      } else {
        console.warn('⚠️ Pas d\'organisation courante - impossible de filtrer les données');
        console.log('🔍 DEBUG: currentEntreprise complet:', currentEntreprise);
        setItems([]);
        setLoading(false);
        return;
      }
      
      // Ajout des filtres additionnels
      const filterEntries = Object.entries(filters);
      if (filterEntries.length > 0) {
        const filterConditions = filterEntries
          .filter(([field, value]) => value !== undefined && value !== '')
          .map(([field, value]) => where(field, '==', value));
        
        queryConditions.push(...filterConditions);
      }
      
      // Construire la requête initiale avec les conditions
      let q = queryConditions.length > 0 ? query(collectionRef, ...queryConditions) : collectionRef;
      
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
      
      let loadedItems = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Appliquer la sanitisation des données imbriquées
      if (currentEntreprise?.id) {
        loadedItems = sanitizeNestedData(loadedItems, currentEntreprise.id);
      }
      
      // 🔍 DEBUG: Voir la structure des données
      if (loadedItems.length > 0) {
        console.log('🔍 DEBUG Structure du premier élément:', {
          entityType: entityType,
          firstItem: loadedItems[0],
          itemKeys: Object.keys(loadedItems[0])
        });
        
        // 🔍 DEBUG DÉTAILLÉ: Afficher les données directement
        console.log('📋 DONNÉES COMPLÈTES:', {
          entityType: entityType,
          totalItems: loadedItems.length,
          querySnapshot: querySnapshot.docs.length,
          firstItemData: {
            id: loadedItems[0].id,
            nom: loadedItems[0].nom,
            prenom: loadedItems[0].prenom, 
            email: loadedItems[0].email,
            telephone: loadedItems[0].telephone,
            organisation: loadedItems[0].organisation,
            organizationId: loadedItems[0].organizationId,
            structureId: loadedItems[0].structureId,
            allFields: Object.keys(loadedItems[0]),
            fullData: loadedItems[0]
          }
        });
        
        // DEBUG SPÉCIAL: Comparer dates vs contacts
        if (entityType === 'contacts') {
          console.log('🎯 DEBUG CONTACTS vs CONCERTS:', {
            contactsCount: loadedItems.length,
            organizationId: currentEntreprise?.id,
            sampleContact: loadedItems[0],
            queryUsed: 'where(organizationId, ==, ' + currentEntreprise?.id + ')'
          });
        }
      }
      
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
  }, [entityType, filters, sort, pageSize, currentEntreprise?.id]);

  // Recharger les données quand les paramètres changent
  useEffect(() => {
    // Ne charger que si pas de données externes
    if (initialData === null) {
      setLastDoc(null); // Reset pagination when parameters change
      loadData();
    }
  }, [loadData, initialData]);

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
  const renderDesktopTable = () => {
    console.log('🖥️ DEBUG renderDesktopTable appelé:', { 
      itemsCount: items.length, 
      columnsCount: columns.length,
      firstItemFields: items.length > 0 ? Object.keys(items[0]) : []
    });
    
    return (
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map(column => (
                <th
                  key={column.id}
                  className={`${column.sortable ? styles.sortable : ''} ${getHeaderClass(column)}`}
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
              {renderActions && <th className={styles.headerActions} style={{ width: '120px' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (renderActions ? 1 : 0)} className={styles.noDataCell}>
                  <div className={styles.noDataContent}>
                    <i className="bi bi-inbox"></i>
                    <span>Aucune donnée trouvée</span>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((item, index) => {
                console.log(`🔍 DEBUG Rendu ligne ${index}:`, {
                  itemId: item.id,
                  itemData: item,
                  columnsCount: columns.length
                });
                
                return (
                  <tr 
                    key={item.id} 
                    className={styles.tableRow}
                    onClick={onRowClick ? () => onRowClick(item) : undefined}
                    style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                  >
                    {columns.map(column => {
                      const value = item[column.field];
                      console.log(`🔍 DEBUG Cellule ${column.field}:`, {
                        columnField: column.field,
                        rawValue: value,
                        renderedValue: column.render ? column.render(item) : value || '-',
                        itemId: item.id
                      });
                      
                      return (
                        <td key={column.id} className={getCellClass(column, value)}>
                          {column.render ? column.render(item) : value || '-'}
                        </td>
                      );
                    })}
                    {renderActions && (
                      <td className={`${styles.tableCell} ${styles.cellActions}`}>
                        {renderActions(item)}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    );
  };

  // Rendu des cartes mobiles
  const renderMobileCards = () => (
    <div style={{ display: 'block', width: '100%' }}>
      {items.map(item => (
        <div
          key={item.id}
          style={{
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '16px',
            margin: '12px 0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
          onClick={onRowClick ? () => onRowClick(item) : undefined}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>
              {columns[0]?.render ? columns[0].render(item) : item[columns[0]?.field] || 'Sans titre'}
            </h3>
            {renderActions && (
              <div style={{ marginLeft: '12px' }}>
                {renderActions(item)}
              </div>
            )}
          </div>
          <div style={{ marginTop: '8px' }}>
            {columns.slice(1, 4).map(column => (
              <div key={column.id} style={{ marginBottom: '4px', fontSize: '14px' }}>
                <span style={{ fontWeight: '500', color: '#666' }}>{column.label}: </span>
                <span>
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
    console.log('🔄 DEBUG ListWithFilters - État loading:', { loading, itemsLength: items.length });
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
    console.log('❌ DEBUG ListWithFilters - État error:', { error, itemsLength: items.length });
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

  console.log('🎯 DEBUG ListWithFilters - Rendu principal:', { 
    entityType,
    itemsLength: items.length, 
    loading, 
    error, 
    isMobile,
    items: items.length > 0 ? items.slice(0, 2) : []
  });

  return (
    <div className={styles.container}>
      {/* En-tête */}
      <div className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        <div className={styles.actionsWrapper}>
          {filterOptions.length > 0 && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={styles.filterToggleButton}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: 'transparent',
                color: '#6b7280',
                cursor: 'pointer'
              }}
              title="Filtres"
            >
              <i className="bi bi-funnel"></i>
              Filtres
              {Object.keys(filters).length > 0 && (
                <span className={styles.filterBadge}>{Object.keys(filters).length}</span>
              )}
            </button>
          )}
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

      {/* Filtres déroulants */}
      {filterOptions.length > 0 && showFilters && (
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
            <div className={styles.filterActions}>
              <button onClick={resetFilters} className={styles.resetButton}>
                <i className="bi bi-x-circle"></i> Effacer
              </button>
              <button onClick={applyFilters} className={styles.applyButton}>
                <i className="bi bi-funnel"></i> Appliquer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contenu principal */}
      {isMobile ? (
        items.length === 0 ? (
          <div className={styles.noData}>
            <i className="bi bi-inbox"></i>
            <span>Aucune donnée trouvée</span>
          </div>
        ) : (
          renderMobileCards()
        )
      ) : (
        renderDesktopTable()
      )}
      
      {/* Pagination */}
      {items.length > 0 && hasMore && (
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