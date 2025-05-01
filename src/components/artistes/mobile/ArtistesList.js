// src/components/artistes/mobile/ArtistesList.js
import React, { useState, useEffect } from 'react';
import { Container, Spinner, Card, Button, Badge, Form, InputGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import styles from './ArtistesList.module.css';

// Import custom hooks - reusing the same hooks from desktop version
import useArtistesList from '@/hooks/artistes/useArtistesList';
import useSearchAndFilter from '@/hooks/artistes/useSearchAndFilter';
import useHandleDeleteArtist from '@/hooks/artistes/useHandleDeleteArtist';

/**
 * Mobile version of the artists list component
 */
const MobileArtistesList = () => {
  const navigate = useNavigate();
  const [sortByField, setSortByField] = useState('nom');
  const [sortDirection, setSortDirection] = useState('asc');

  // Reusing the same hooks from desktop version
  const {
    artistes,
    loading,
    stats,
    hasMore,
    loadMoreArtistes,
    setArtistes
  } = useArtistesList(10, sortByField, sortDirection); // Smaller page size for mobile

  const {
    searchTerm,
    setSearchTerm,
    filter,
    setFilter,
    showDropdown,
    setShowDropdown,
    sortBy,
    setSortBy,
    searchInputRef,
    handleSearchChange,
    handleSortChange,
    handleCreateArtiste,
    filteredArtistes,
    noResults
  } = useSearchAndFilter(artistes);

  const { handleDelete } = useHandleDeleteArtist(setArtistes, stats);

  // Effect to fetch artists when sort parameters change
  useEffect(() => {
    if (sortBy !== sortByField || sortDirection !== sortDirection) {
      setSortByField(sortBy);
      setSortDirection(sortDirection);
    }
  }, [sortBy, sortDirection]);

  // Handle clearing search
  const handleClearSearch = () => {
    setSearchTerm('');
    setShowDropdown(false);
  };

  // Mobile renderers 
  const renderArtistCard = (artiste) => {
    const nbConcerts = artiste.concertsAssocies?.length || 0;
    
    return (
      <Card key={artiste.id} className={styles.artisteCard}>
        <Card.Body>
          <div className={styles.artisteHeader}>
            <div className={styles.artisteInfo}>
              <div className={styles.artisteAvatar}>
                {artiste.photoPrincipale ? (
                  <img src={artiste.photoPrincipale} alt={artiste.nom} />
                ) : (
                  <div className={styles.placeholderAvatar}>
                    <i className="bi bi-music-note"></i>
                  </div>
                )}
              </div>
              <div>
                <h3 className={styles.artisteName}>
                  {artiste.nom}
                  {artiste.estGroupeFavori && (
                    <i className="bi bi-star-fill text-warning ms-2"></i>
                  )}
                </h3>
                {artiste.genre && <div className={styles.artisteGenre}>{artiste.genre}</div>}
              </div>
            </div>
            <Badge 
              bg={nbConcerts > 0 ? "primary" : "secondary"}
              className={styles.concertsBadge}
            >
              <i className="bi bi-music-note-beamed me-1"></i>
              {nbConcerts}
            </Badge>
          </div>

          <div className={styles.artisteDetails}>
            {artiste.ville && (
              <div className={styles.artisteDetail}>
                <i className="bi bi-geo-alt text-muted"></i>
                <span>{artiste.ville}</span>
              </div>
            )}
            {artiste.cachetMoyen && (
              <div className={styles.artisteDetail}>
                <i className="bi bi-cash text-muted"></i>
                <span>{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(artiste.cachetMoyen)}</span>
              </div>
            )}
          </div>

          <div className={styles.artisteActions}>
            <Button 
              as={Link} 
              to={`/artistes/${artiste.id}`} 
              variant="outline-primary" 
              className={styles.actionButton}
            >
              <i className="bi bi-eye"></i>
            </Button>
            <Button 
              as={Link} 
              to={`/artistes/${artiste.id}/modifier`} 
              variant="outline-secondary" 
              className={styles.actionButton}
            >
              <i className="bi bi-pencil"></i>
            </Button>
            <Button 
              variant="outline-danger"
              onClick={(e) => handleDelete(artiste.id, e)}
              className={styles.actionButton}
            >
              <i className="bi bi-trash"></i>
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
  };

  // Loading state
  if (loading && artistes.length === 0) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" variant="primary" className="me-2" />
        <span>Chargement des artistes...</span>
      </Container>
    );
  }

  return (
    <Container className="py-3">
      {/* Header */}
      <div className={styles.mobileHeader}>
        <h1 className={styles.pageTitle}>
          <i className="bi bi-music-note-list me-2"></i>
          Artistes
        </h1>
        <Button 
          variant="primary"
          onClick={() => navigate('/artistes/nouveau')}
          className={styles.addButton}
        >
          <i className="bi bi-plus-circle"></i>
        </Button>
      </div>
      
      {/* Stats Summary */}
      <div className={styles.statsRow}>
        <div className={styles.statItem}>
          <div className={styles.statValue}>{stats.total}</div>
          <div className={styles.statLabel}>Total</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statValue}>{stats.avecConcerts}</div>
          <div className={styles.statLabel}>Avec concerts</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statValue}>{stats.sansConcerts}</div>
          <div className={styles.statLabel}>Sans concerts</div>
        </div>
      </div>
      
      {/* Search and Filter */}
      <div className={styles.searchFilterContainer}>
        <div className={styles.searchContainer} ref={searchInputRef}>
          <InputGroup className="mb-3">
            <InputGroup.Text>
              <i className="bi bi-search"></i>
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            {searchTerm && (
              <Button 
                variant="outline-secondary"
                onClick={handleClearSearch}
              >
                <i className="bi bi-x-circle"></i>
              </Button>
            )}
          </InputGroup>
          
          {/* Dropdown search results (mobile optimized) */}
          {showDropdown && (
            <div className={styles.mobileSearchDropdown}>
              {noResults ? (
                <div 
                  className={styles.searchCreateItem} 
                  onClick={handleCreateArtiste} 
                  role="button" 
                  tabIndex={0}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  <span>Créer "{searchTerm}"</span>
                </div>
              ) : (
                filteredArtistes.slice(0, 5).map(artiste => (
                  <Link to={`/artistes/${artiste.id}`} key={artiste.id} className={styles.searchResultItem}>
                    <div className={styles.searchResultAvatar}>
                      {artiste.photoPrincipale ? (
                        <img src={artiste.photoPrincipale} alt={artiste.nom} className="img-fluid" />
                      ) : (
                        <i className="bi bi-music-note"></i>
                      )}
                    </div>
                    <div>{artiste.nom}</div>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>

        <Form.Select 
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="mb-3"
        >
          <option value="tous">Tous les artistes</option>
          <option value="avecConcerts">Avec concerts</option>
          <option value="sansConcerts">Sans concerts</option>
        </Form.Select>
        
        <div className={styles.sortButtons}>
          <Button 
            variant={sortBy === 'nom' ? 'primary' : 'outline-secondary'}
            size="sm"
            onClick={() => handleSortChange('nom')}
            className="mb-2"
          >
            <i className="bi bi-sort-alpha-down me-1"></i>
            Nom {sortBy === 'nom' && (
              <i className={`bi bi-sort-${sortDirection === 'asc' ? 'down' : 'up'} ms-1`}></i>
            )}
          </Button>
          <Button 
            variant={sortBy === 'createdAt' ? 'primary' : 'outline-secondary'}
            size="sm"
            onClick={() => handleSortChange('createdAt')}
            className="mb-2"
          >
            <i className="bi bi-calendar me-1"></i>
            Date {sortBy === 'createdAt' && (
              <i className={`bi bi-sort-${sortDirection === 'asc' ? 'down' : 'up'} ms-1`}></i>
            )}
          </Button>
        </div>
      </div>
      
      {/* Artists List or Empty State */}
      {filteredArtistes.length > 0 ? (
        <div className={styles.artistesList}>
          {filteredArtistes.map(artiste => renderArtistCard(artiste))}
          
          {/* Load More Button */}
          {hasMore && (
            <Button 
              variant="outline-primary" 
              onClick={loadMoreArtistes} 
              disabled={loading}
              className={styles.loadMoreButton}
            >
              {loading ? (
                <><Spinner size="sm" animation="border" className="me-2" /> Chargement...</>
              ) : (
                <><i className="bi bi-plus-circle me-2"></i> Charger plus</>
              )}
            </Button>
          )}
        </div>
      ) : (
        <Card className={styles.emptyCard}>
          <Card.Body className="text-center py-5">
            <i className="bi bi-music-note-list display-4 text-muted mb-3"></i>
            <h3 className="h5">Aucun artiste trouvé</h3>
            {searchTerm ? (
              <p className="text-muted">
                Aucun résultat pour "{searchTerm}"
              </p>
            ) : (
              <p className="text-muted">
                Vous n'avez pas encore ajouté d'artistes
              </p>
            )}
            <Button 
              variant="primary"
              onClick={() => navigate('/artistes/nouveau')}
              className="mt-3"
            >
              <i className="bi bi-plus-circle me-2"></i>
              Ajouter un artiste
            </Button>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default MobileArtistesList;