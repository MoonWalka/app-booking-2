import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import '../../style/artistesList.css';

const ArtistesList = () => {
  const [artistes, setArtistes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('tous');
  const [showDropdown, setShowDropdown] = useState(false);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArtistes = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'artistes'), orderBy('nom'));
        const querySnapshot = await getDocs(q);
        const artistes = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setArtistes(artistes);
      } catch (error) {
        console.error('Erreur lors de la récupération des artistes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtistes();
  }, []);

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

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet artiste ?')) {
      try {
        await deleteDoc(doc(db, 'artistes', id));
        setArtistes(artistes.filter(artiste => artiste.id !== id));
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

  if (loading) {
    return <div className="loading-container">Chargement des artistes...</div>;
  }

  return (
    <div className="artistes-list-container">
      <div className="list-header">
        <h2 className="page-title">Artistes</h2>
      </div>

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
          
          <button 
            className="btn btn-primary btn-add-artiste"
            onClick={() => navigate('/artistes/nouveau')}
          >
            <i className="bi bi-plus-circle"></i>
            <span className="btn-text">Ajouter</span>
          </button>
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
      </div>

      {filteredArtistes.length === 0 && !searchTerm ? (
        <div className="no-results">
          <p>Aucun artiste trouvé</p>
          <button
            className="btn btn-primary mt-3"
            onClick={() => navigate('/artistes/nouveau')}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Ajouter un artiste
          </button>
        </div>
      ) : (
        <div className="artistes-grid">
          {filteredArtistes.map(artiste => (
            <div className="artiste-card" key={artiste.id}>
              <div className="artiste-photo">
                {artiste.photoPrincipale ? (
                  <img src={artiste.photoPrincipale} alt={artiste.nom} />
                ) : (
                  <div className="placeholder-photo">
                    <i className="bi bi-music-note"></i>
                  </div>
                )}
              </div>
              <div className="artiste-content">
                <h3 className="artiste-name">{artiste.nom}</h3>
                {artiste.genre && <p className="artiste-genre">{artiste.genre}</p>}
                <div className="artiste-stats">
                  <span className="stat-item">
                    <i className="bi bi-calendar-event"></i>
                    {artiste.concertsAssocies?.length || 0} concerts
                  </span>
                  {artiste.cachetMoyen && (
                    <span className="stat-item">
                      <i className="bi bi-cash"></i>
                      {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(artiste.cachetMoyen)}
                    </span>
                  )}
                </div>
              </div>
              <div className="artiste-actions">
                <Link to={`/artistes/${artiste.id}`} className="btn btn-outline-primary">
                  <i className="bi bi-eye"></i>
                </Link>
                <Link to={`/artistes/${artiste.id}/modifier`} className="btn btn-outline-secondary">
                  <i className="bi bi-pencil"></i>
                </Link>
                <button 
                  className="btn btn-outline-danger"
                  onClick={() => handleDelete(artiste.id)}
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Styles CSS pour les nouvelles fonctionnalités */}
      <style jsx>{`
        .search-input-group {
          display: flex;
          gap: 10px;
          width: 100%;
          position: relative;
        }
        
        .search-input {
          flex: 1;
          position: relative;
        }
        
        .btn-clear {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #6c757d;
          padding: 0;
          cursor: pointer;
        }
        
        .btn-add-artiste {
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        .search-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          width: calc(100% - 130px); /* Largeur de la barre de recherche moins le bouton */
          background: white;
          border: 1px solid #ddd;
          border-radius: 4px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          z-index: 100;
          max-height: 300px;
          overflow-y: auto;
          margin-top: 5px;
        }
        
        .search-item, .create-new-item {
          padding: 10px 15px;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          text-decoration: none;
          color: #333;
          border-bottom: 1px solid #eee;
        }
        
        .search-item:hover, .create-new-item:hover {
          background-color: #f8f9fa;
        }
        
        .create-new-item {
          color: #007bff;
        }
        
        .item-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #f1f3f5;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        
        .item-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .item-content {
          flex: 1;
        }
        
        .item-name {
          font-weight: 500;
        }
        
        .item-genre {
          font-size: 0.8rem;
          color: #6c757d;
        }
      `}</style>
    </div>
  );
};

export default ArtistesList;
