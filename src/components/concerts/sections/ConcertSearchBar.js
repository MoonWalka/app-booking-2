import React, { useState, useRef } from 'react';
import styles from './ConcertSearchBar.module.css';

const statusTabs = [
  { id: 'all', label: 'Tous les concerts' },
  { id: 'contact', label: 'Contact établi' },
  { id: 'preaccord', label: 'Pré-accord' },
  { id: 'contrat', label: 'Contrat signé' },
  { id: 'acompte', label: 'Acompte facturé' },
  { id: 'solde', label: 'Soldé facturé' },
  { id: 'annule', label: 'Annulé' },
];

const ConcertSearchBar = ({ searchTerm, setSearchTerm, statusFilter, setStatusFilter, statusDetailsMap, filteredCount, totalCount }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Fermer le dropdown si clic en dehors
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  const activeStatus = statusTabs.find(tab => tab.id === statusFilter) || statusTabs[0];

  return (
    <div className={styles.filtersContainer}>
      <div className={styles.searchBox}>
        <i className={`bi bi-search ${styles.searchIcon}`}></i>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Rechercher un concert par titre, lieu, contact..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            type="button"
            className={styles.clearSearch}
            aria-label="Effacer la recherche"
            onClick={() => setSearchTerm('')}
          >
            <i className="bi bi-x-lg"></i>
          </button>
        )}
      </div>
      <div className={styles.filterDropdownWrapper} ref={dropdownRef}>
        <button 
          className={styles.filterButton}
          onClick={() => setShowDropdown(v => !v)}
          aria-label="Filtrer les concerts"
          type="button"
        >
          <i className="bi bi-funnel"></i> {activeStatus.label}
        </button>
        {showDropdown && (
          <div className={styles.filterDropdownMenu}>
            {statusTabs.map(tab => (
              <button
                key={tab.id}
                className={
                  styles.filterDropdownItem +
                  (statusFilter === tab.id ? ' ' + styles.active : '')
                }
                onClick={() => {
                  setStatusFilter(tab.id);
                  setShowDropdown(false);
                }}
                type="button"
              >
                {tab.label}
                {statusDetailsMap && statusDetailsMap[tab.id] && (
                  <span className={styles.statusCount}>
                    {statusDetailsMap[tab.id].count || 0}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      <button className={styles.sortButton} type="button">
        <i className="bi bi-sort-alpha-down"></i> Trier par
      </button>
      <div className={styles.resultsCount}>
        {filteredCount !== undefined && totalCount !== undefined && (
          <span>{filteredCount} / {totalCount} résultats</span>
        )}
      </div>
    </div>
  );
};

export default ConcertSearchBar;
