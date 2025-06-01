import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Form, InputGroup, Table, Button as BootstrapButton, Tabs, Tab, Spinner } from 'react-bootstrap';
import Button from '@ui/Button';
import styles from './GenericList.module.css';

const GenericList = ({
  title,
  items = [],
  renderItem,
  searchFields = [],
  filterOptions = [],
  addButtonText,
  addButtonLink,
  loading = false,
  emptyMessage = "Aucun élément trouvé.",
  onLoadMore,
  hasMore = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [filteredItems, setFilteredItems] = useState(items);

  // Filtrer les éléments en fonction du terme de recherche et du filtre actif
  useEffect(() => {
    let result = [...items];
    
    // Appliquer le filtre actif
    if (activeFilter !== 'all' && filterOptions.length > 0) {
      const activeFilterOption = filterOptions.find(option => option.value === activeFilter);
      if (activeFilterOption && activeFilterOption.filterFn) {
        result = result.filter(activeFilterOption.filterFn);
      }
    }
    
    // Appliquer la recherche si un terme est saisi et des champs de recherche sont définis
    if (searchTerm && typeof searchTerm === 'string' && searchTerm.trim() !== '' && searchFields.length > 0) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(item => 
        searchFields.some(field => {
          const value = field.accessor(item);
          return value && value.toString().toLowerCase().includes(term);
        })
      );
    }
    
    setFilteredItems(result);
  }, [items, searchTerm, activeFilter, searchFields, filterOptions]);

  // Gérer le changement du terme de recherche
  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  // Gérer le changement de filtre
  const handleFilterChange = useCallback((filter) => {
    setActiveFilter(filter);
  }, []);

  // Gérer le chargement de plus d'éléments
  const handleLoadMoreFn = useCallback(() => {
    if (onLoadMore && !loading && hasMore) {
      onLoadMore();
    }
  }, [onLoadMore, loading, hasMore]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        {addButtonText && addButtonLink && (
          <Button as={Link} to={addButtonLink} variant="primary">
            <i className="bi bi-plus-circle me-2"></i>
            {addButtonText}
          </Button>
        )}
      </div>

      <div className={styles.controls}>
        {searchFields.length > 0 && (
          <InputGroup className="mb-3">
            <InputGroup.Text>
              <i className="bi bi-search"></i>
            </InputGroup.Text>
            <Form.Control
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            {searchTerm && (
              <BootstrapButton 
                variant="outline-secondary" 
                onClick={() => setSearchTerm('')}
              >
                <i className="bi bi-x-lg"></i>
              </BootstrapButton>
            )}
          </InputGroup>
        )}

        {filterOptions.length > 0 && (
          <Tabs
            activeKey={activeFilter}
            onSelect={handleFilterChange}
            className={`mb-3 ${styles.filterTabs}`}
          >
            <Tab eventKey="all" title="Tous" />
            {filterOptions.map(option => (
              <Tab 
                key={option.value} 
                eventKey={option.value} 
                title={
                  <span>
                    {option.icon && <span className={styles.filterIcon}>{option.icon}</span>}
                    {option.label}
                  </span>
                }
              />
            ))}
          </Tabs>
        )}
      </div>

      {loading && filteredItems.length === 0 ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status" variant="primary" />
          <p className="mt-2">Chargement...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className={styles.emptyState}>
          <i className="bi bi-inbox fs-1 text-muted"></i>
          <p className="mt-2 text-muted">{emptyMessage}</p>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <Table hover className={styles.table}>
              <tbody>
                {filteredItems.map(renderItem)}
              </tbody>
            </Table>
          </div>

          {hasMore && (
            <div className={styles.loadMoreContainer}>
              <BootstrapButton 
                variant="outline-primary" 
                onClick={handleLoadMoreFn}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Chargement...
                  </>
                ) : (
                  <>
                    <i className="bi bi-arrow-down-circle me-2"></i>
                    Charger plus
                  </>
                )}
              </BootstrapButton>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GenericList;
