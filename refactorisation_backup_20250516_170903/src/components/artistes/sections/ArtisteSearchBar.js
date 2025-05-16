// src/components/artistes/sections/ArtisteSearchBar.js
import React from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import styles from './ArtisteSearchBar.module.css';
import Card from '@/components/ui/Card';

/**
 * Search and filter bar component for artists list
 */
const ArtisteSearchBar = ({
  searchTerm,
  onSearchChange,
  onClearSearch,
  filter,
  onFilterChange,
  sortBy,
  onSortChange,
  sortDirection,
  showDropdown,
  searchResults,
  noResults,
  onCreateArtiste,
  searchInputRef
}) => {
  return (
    <Card className="mb-4">
      <div className="row mb-3">
        <div className="position-relative col-lg-6 mb-3 mb-lg-0" ref={searchInputRef}>
          <InputGroup>
            <InputGroup.Text>
              <i className="bi bi-search"></i>
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Rechercher un artiste..."
              value={searchTerm}
              onChange={onSearchChange}
              onFocus={() => {}}
            />
            {searchTerm && (
              <Button 
                variant="outline-secondary"
                onClick={onClearSearch}
              >
                <i className="bi bi-x-circle"></i>
              </Button>
            )}
          </InputGroup>
          
          {/* Dropdown that appears during search */}
          {showDropdown && (
            <div className={`${styles.searchResultsDropdown} position-absolute w-100 mt-1 shadow-sm`}>
              {noResults ? (
                <div 
                  className={styles.searchCreateItem} 
                  onClick={onCreateArtiste} 
                  role="button" 
                  tabIndex={0}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  <span>
                    Créer l'artiste "<strong>{searchTerm}</strong>"
                  </span>
                </div>
              ) : (
                searchResults.slice(0, 5).map(artiste => (
                  <Link to={`/artistes/${artiste.id}`} key={artiste.id} className={styles.searchResultItem}>
                    <div className={styles.searchResultAvatar}>
                      {artiste.photoPrincipale ? (
                        <img src={artiste.photoPrincipale} alt={artiste.nom} className="img-fluid" />
                      ) : (
                        <div className={styles.placeholderAvatar}>
                          <i className="bi bi-music-note"></i>
                        </div>
                      )}
                    </div>
                    <div className="text-truncate">
                      <div className="fw-bold text-truncate">{artiste.nom}</div>
                      {artiste.genre && <div className="small text-muted text-truncate">{artiste.genre}</div>}
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>
        
        <div className="col-lg-6">
          <div className="row">
            <div className="col-md-4 mb-2 mb-md-0">
              <Form.Select 
                value={filter}
                onChange={onFilterChange}
              >
                <option value="tous">Tous les artistes</option>
                <option value="avecConcerts">Avec concerts</option>
                <option value="sansConcerts">Sans concerts</option>
              </Form.Select>
            </div>
            <div className="col-md-8">
              <div className="d-flex align-items-center h-100">
                <span className="me-2 d-none d-md-block">Trier par:</span>
                <div className="d-flex gap-2 flex-wrap">
                  <Button 
                    variant={sortBy === 'nom' ? 'primary' : 'outline-secondary'}
                    size="sm"
                    onClick={() => onSortChange('nom')}
                  >
                    Nom {sortBy === 'nom' && (
                      <i className={`bi bi-sort-${sortDirection === 'asc' ? 'down' : 'up'} ms-1`}></i>
                    )}
                  </Button>
                  <Button 
                    variant={sortBy === 'createdAt' ? 'primary' : 'outline-secondary'}
                    size="sm"
                    onClick={() => onSortChange('createdAt')}
                  >
                    Date {sortBy === 'createdAt' && (
                      <i className={`bi bi-sort-${sortDirection === 'asc' ? 'down' : 'up'} ms-1`}></i>
                    )}
                  </Button>
                  <Button 
                    variant={sortBy === 'cachetMoyen' ? 'primary' : 'outline-secondary'}
                    size="sm"
                    onClick={() => onSortChange('cachetMoyen')}
                  >
                    Cachet {sortBy === 'cachetMoyen' && (
                      <i className={`bi bi-sort-${sortDirection === 'asc' ? 'down' : 'up'} ms-1`}></i>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ArtisteSearchBar;