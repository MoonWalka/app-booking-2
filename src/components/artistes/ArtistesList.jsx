import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy, deleteDoc, doc, limit, startAfter } from 'firebase/firestore';
import { db } from '../../firebase';
import '../../style/artistesList.css';

const ArtistesList = () => {
  const [artistes, setArtistes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('tous');
  const [showDropdown, setShowDropdown] = useState(false);
  const [sortBy, setSortBy] = useState('nom');
  const [sortDirection, setSortDirection] = useState('asc');
  const [stats, setStats] = useState({
    total: 0,
    avecConcerts: 0,
    sansConcerts: 0
  });
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const pageSize = 12; // Nombre d'artistes à charger par page

  // Fonction pour charger les artistes
  const fetchArtistes = async (reset = true) => {
    if (reset) {
      setLoading(true);
      setLastVisible(null);
    }
    
    try {
      let q;
      if (reset || !lastVisible) {
        // Première charge ou réinitialisation
        q = query(collection(db, 'artistes'), orderBy(sortBy, sortDirection), limit(pageSize));
      } else {
        // Chargement de page supplémentaire
        q = query(collection(db, 'artistes'), orderBy(sortBy, sortDirection), startAfter(lastVisible), limit(pageSize));
      }
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setHasMore(false);
        if (!reset) return; // Ne rien faire s'il n'y a pas de résultats supplémentaires
      } else {
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
        setHasMore(querySnapshot.docs.length >= pageSize);
      }
      
      const fetchedArtistes = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      if (reset) {
        setArtistes(fetchedArtistes);
      } else {
        setArtistes(prevArtistes => [...prevArtistes, ...fetchedArtistes]);
      }
      
      // Calculer les statistiques si c'est un chargement initial
      if (reset) {
        const allDataQuery = query(collection(db, 'artistes'));
        const allDataSnapshot = await getDocs(allDataQuery);
        
        let avecConcerts = 0;
        let sansConcerts = 0;
        
        allDataSnapshot.forEach(doc => {
          const artisteData = doc.data();
          if (artisteData.concertsAssocies && artisteData.concertsAssocies.length > 0) {
            avecConcerts++;
          } else {
            sansConcerts++;
          }
        });
        
        setStats({
          total: allDataSnapshot.size,
          avecConcerts,
          sansConcerts
        });
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des artistes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Chargement initial
  useEffect(() => {
    fetchArtistes();
  }, [sortBy, sortDirection]);

  // Gestion de la fermeture du dropdown si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDelete = async (id, event) => {
    event.stopPropagation(); // Empêcher la propagation de l'événement
    
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet artiste ?')) {
      try {
        await deleteDoc(doc(db, 'artistes', id));
        setArtistes(artistes.filter(artiste => artiste.id !== id));
        setStats(prev => ({
          ...prev,
          total: prev.total - 1
        }));
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'artiste:', error);
      }
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowDropdown(value.length > 0);
  };

  const handleCreateArtiste = () => {
    // Rediriger vers le formulaire d'ajout et pré-remplir le nom
    navigate(`/artistes/nouveau?nom=${encodeURIComponent(searchTerm)}`);
  };

  const handleSortChange = (field) => {
    if (field === sortBy) {
      // Si on clique sur le même champ, inverser la direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Sinon, changer le champ et mettre en ordre ascendant par défaut
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchArtistes(false);
    }
  };

  const filteredArtistes = artistes.filter(artiste => {
    // Appliquer filtre de recherche
    const matchesSearch = artiste.nom.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Appliquer filtres spécifiques si nécessaire
    if (filter === 'tous') return matchesSearch;
    if (filter === 'avecConcerts') return matchesSearch && artiste.concertsAssocies?.length > 0;
    if (filter === 'sansConcerts') return matchesSearch && (!artiste.concertsAssocies || artiste.concertsAssocies.length === 0);
    
    return matchesSearch;
  });

  // Déterminer si aucun résultat ne correspond à la recherche
  const noResults = searchTerm.length > 0 && filteredArtistes.length === 0;

  const getNbConcerts = (artiste) => {
    if (!artiste.concertsAssocies) return 0;
    return artiste.concertsAssocies.length;
  };

  return (
    <div className="artistes-list-container">
      <div className="list-header">
        <h2 className="page-title">Gestion des artistes</h2>
        <div className="list-actions">
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/artistes/nouveau')}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Nouvel artiste
          </button>
        </div>
      </div>

      <div className="statistics-cards">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="bi bi-people-fill"></i>
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.total}</h3>
            <span className="stat-label">Total artistes</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <i className="bi bi-calendar-check"></i>
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.avecConcerts}</h3>
            <span className="stat-label">Avec concerts</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <i className="bi bi-calendar-x"></i>
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.sansConcerts}</h3>
            <span className="stat-label">Sans concerts</span>
          </div>
        </div>
      </div>

      <div className="search-filter-controls">
        <div className="search-filter-container" ref={searchInputRef}>
          <div className="search-input-group">
            <div className="search-input">
              <i className="bi bi-search search-icon"></i>
              <input
                type="text"
                placeholder="Rechercher un artiste..."
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => setShowDropdown(searchTerm.length > 0)}
                className="form-control"
              />
              {searchTerm && (
                <button 
                  className="btn btn-clear" 
                  onClick={() => {
                    setSearchTerm('');
                    setShowDropdown(false);
                  }}
                >
                  <i className="bi bi-x-circle"></i>
                </button>
              )}
            </div>
            
            {/* Dropdown qui apparaît lors de la recherche */}
            {showDropdown && (
              <div className="search-dropdown">
                {noResults ? (
                  <div className="create-new-item" onClick={handleCreateArtiste}>
                    <div className="item-content">
                      <i className="bi bi-plus-circle me-2"></i>
                      <span>
                        Créer l'artiste "<strong>{searchTerm}</strong>"
                      </span>
                    </div>
                  </div>
                ) : (
                  filteredArtistes.slice(0, 5).map(artiste => (
                    <Link to={`/artistes/${artiste.id}`} key={artiste.id} className="search-item">
                      <div className="item-avatar">
                        {artiste.photoPrincipale ? (
                          <img src={artiste.photoPrincipale} alt={artiste.nom} />
                        ) : (
                          <i className="bi bi-music-note"></i>
                        )}
                      </div>
                      <div className="item-content">
                        <div className="item-name">{artiste.nom}</div>
                        {artiste.genre && <div className="item-genre">{artiste.genre}</div>}
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>
          
          <div className="filter-controls">
            <div className="filter-select">
              <select 
                className="form-select" 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="tous">Tous les artistes</option>
                <option value="avecConcerts">Avec concerts</option>
                <option value="sansConcerts">Sans concerts</option>
              </select>
            </div>
            
            <div className="sort-controls">
              <div className="sort-label">Trier par:</div>
              <div className="sort-options">
                <button 
                  className={`sort-button ${sortBy === 'nom' ? 'active' : ''}`}
                  onClick={() => handleSortChange('nom')}
                >
                  Nom {sortBy === 'nom' && (
                    <i className={`bi bi-sort-${sortDirection === 'asc' ? 'down' : 'up'}`}></i>
                  )}
                </button>
                <button 
                  className={`sort-button ${sortBy === 'createdAt' ? 'active' : ''}`}
                  onClick={() => handleSortChange('createdAt')}
                >
                  Date {sortBy === 'createdAt' && (
                    <i className={`bi bi-sort-${sortDirection === 'asc' ? 'down' : 'up'}`}></i>
                  )}
                </button>
                <button 
                  className={`sort-button ${sortBy === 'cachetMoyen' ? 'active' : ''}`}
                  onClick={() => handleSortChange('cachetMoyen')}
                >
                  Cachet {sortBy === 'cachetMoyen' && (
                    <i className={`bi bi-sort-${sortDirection === 'asc' ? 'down' : 'up'}`}></i>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading && artistes.length === 0 ? (
        <div className="loading-container">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement des artistes...</span>
          </div>
          <p>Chargement des artistes...</p>
        </div>
      ) : filteredArtistes.length === 0 ? (
        <div className="no-results">
          <div className="empty-state">
            <i className="bi bi-music-note-list empty-icon"></i>
            <h3>Aucun artiste trouvé</h3>
            {searchTerm ? (
              <p>Aucun résultat pour la recherche "{searchTerm}"</p>
            ) : (
              <p>Vous n'avez pas encore ajouté d'artistes</p>
            )}
            <button
              className="btn btn-primary mt-3"
              onClick={() => navigate('/artistes/nouveau')}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Ajouter un artiste
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="artistes-grid">
            {filteredArtistes.map(artiste => (
              <div 
                className="artiste-card" 
                key={artiste.id}
                onClick={() => navigate(`/artistes/${artiste.id}`)}
              >
                <div className="artiste-photo">
                  {artiste.photoPrincipale ? (
                    <img src={artiste.photoPrincipale} alt={artiste.nom} />
                  ) : (
                    <div className="placeholder-photo">
                      <i className="bi bi-music-note"></i>
                    </div>
                  )}
                  <div className="artiste-badges">
                    {getNbConcerts(artiste) > 0 && (
                      <span className="badge bg-primary">{getNbConcerts(artiste)} concert{getNbConcerts(artiste) > 1 ? 's' : ''}</span>
                    )}
                    {artiste.estGroupeFavori && (
                      <span className="badge bg-warning"><i className="bi bi-star-fill"></i> Favori</span>
                    )}
                  </div>
                </div>
                <div className="artiste-content">
                  <h3 className="artiste-name">{artiste.nom}</h3>
                  {artiste.genre && <p className="artiste-genre">{artiste.genre}</p>}
                  <div className="artiste-info">
                    {artiste.cachetMoyen && (
                      <span className="info-item">
                        <i className="bi bi-cash"></i>
                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(artiste.cachetMoyen)}
                      </span>
                    )}
                    {artiste.ville && (
                      <span className="info-item">
                        <i className="bi bi-geo-alt"></i>
                        {artiste.ville}
                      </span>
                    )}
                  </div>
                </div>
                <div className="artiste-actions">
                  <Link to={`/artistes/${artiste.id}`} className="btn btn-outline-primary btn-sm" onClick={(e) => e.stopPropagation()}>
                    <i className="bi bi-eye"></i>
                  </Link>
                  <Link to={`/artistes/${artiste.id}/modifier`} className="btn btn-outline-secondary btn-sm" onClick={(e) => e.stopPropagation()}>
                    <i className="bi bi-pencil"></i>
                  </Link>
                  <button 
                    className="btn btn-outline-danger btn-sm"
                    onClick={(e) => handleDelete(artiste.id, e)}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {hasMore && !searchTerm && (
            <div className="load-more-container">
              <button 
                className="btn btn-outline-primary load-more-btn"
                onClick={handleLoadMore}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Chargement...
                  </>
                ) : (
                  <>
                    <i className="bi bi-plus-circle me-2"></i>
                    Charger plus d'artistes
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ArtistesList;
