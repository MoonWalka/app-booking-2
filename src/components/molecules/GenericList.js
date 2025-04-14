import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const GenericList = ({
  title,
  items,
  renderItem,
  searchFields = [],
  filterOptions = [],
  addButtonText,
  addButtonLink,
  loading = false,
  emptyMessage = "Aucun élément trouvé."
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [filteredItems, setFilteredItems] = useState([]);
  
  // Filtrer les éléments en fonction du terme de recherche et du filtre actif
  useEffect(() => {
    if (!items) return;
    
    let results = [...items];
    
    // Appliquer le filtre
    if (activeFilter !== 'all' && filterOptions.length > 0) {
      const filterOption = filterOptions.find(option => option.value === activeFilter);
      if (filterOption && filterOption.filterFn) {
        results = results.filter(item => filterOption.filterFn(item));
      }
    }
    
    // Appliquer la recherche
    if (searchTerm && searchFields.length > 0) {
      const term = searchTerm.toLowerCase();
      results = results.filter(item => 
        searchFields.some(field => {
          const value = field.accessor(item);
          return value && value.toString().toLowerCase().includes(term);
        })
      );
    }
    
    setFilteredItems(results);
  }, [items, searchTerm, activeFilter, searchFields, filterOptions]);
  
  return (
    <div className="list-container">
      {/* En-tête avec titre et bouton d'ajout */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="modern-title">{title}</h2>
        {addButtonLink && (
          <Link to={addButtonLink} className="btn btn-primary modern-add-btn">
            <i className="bi bi-plus-lg me-2"></i>
            {addButtonText}
          </Link>
        )}
      </div>
      
      {/* Barre de recherche */}
      {searchFields.length > 0 && (
        <div className="search-filter-container mb-4">
          <div className="search-bar">
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control search-input"
                placeholder={`Rechercher...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  className="btn btn-outline-secondary clear-search" 
                  onClick={() => setSearchTerm('')}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Filtres */}
      {filterOptions.length > 0 && (
        <div className="filter-tabs mb-4">
          <button 
            className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            Tous
          </button>
          {filterOptions.map(option => (
            <button 
              key={option.value}
              className={`filter-tab ${activeFilter === option.value ? 'active' : ''}`}
              onClick={() => setActiveFilter(option.value)}
            >
              {option.icon && <span className="filter-icon">{option.icon}</span>}
              {option.label}
            </button>
          ))}
        </div>
      )}
      
      {/* Contenu */}
      {loading ? (
        <div className="text-center my-5 loading-spinner">Chargement...</div>
      ) : filteredItems.length === 0 ? (
        <div className="alert alert-info modern-alert">
          <div className="d-flex align-items-center">
            <i className="bi bi-info-circle me-3"></i>
            <p className="mb-0">
              {searchTerm || activeFilter !== 'all' 
                ? 'Aucun élément ne correspond à vos critères de recherche.' 
                : emptyMessage}
            </p>
          </div>
        </div>
      ) : (
        <div className="table-responsive modern-table-container">
          <table className="table table-hover modern-table">
            <thead>
              <tr>
                {/* Les en-têtes de colonnes seront définis par le composant parent */}
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => renderItem(item))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GenericList;
