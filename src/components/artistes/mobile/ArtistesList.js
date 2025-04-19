// src/components/artistes/mobile/ArtistesList.js
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy, deleteDoc, doc, limit, startAfter } from 'firebase/firestore';
import { db } from '../../../firebase.js.m1fix.bak';
import { Button, Form, InputGroup, Spinner } from 'react-bootstrap';
import '../../../style/artistesList.css';
import '../../../style/artistesListMobile.css';
import { getNbConcerts, filteredArtistes } from './utils/concertUtils';
import { handleDelete } from './handlers/deleteHandler';
import { handleLoadMore } from './handlers/paginationHandler';
 // Nouveau fichier CSS spécifique au mobile

const ArtistesListMobile = () => {
  const [artistes, setArtistes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('tous');
  const [showDropdown, setShowDropdown] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const pageSize = 10; // Nombre d'artistes à charger par page (réduit pour le mobile)

  // Même logique de chargement des données que la version desktop
  // ...

  return (
    <div className="artistes-mobile-container">
      {/* Entête simplifié */}
      <div className="mobile-header-container">
        <h1>Artistes</h1>
        <Button 
          variant="primary"
          onClick={() => navigate('/artistes/nouveau')}
          className="mobile-add-btn"
        >
          <i className="bi bi-plus-lg"></i>
        </Button>
      </div>

      {/* Barre de recherche */}
      <div className="mobile-search-container" ref={searchInputRef}>
        <InputGroup>
          <InputGroup.Text><i className="bi bi-search"></i></InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setShowDropdown(searchTerm.length > 0)}
          />
          {searchTerm && (
            <Button 
              variant="outline-secondary"
              onClick={() => setSearchTerm('')}
            >
              <i className="bi bi-x"></i>
            </Button>
          )}
        </InputGroup>

        {/* Dropdown de résultats de recherche */}
        {/* ... */}
      </div>

      {/* Filtres simplifiés en menu horizontal scrollable */}
      <div className="mobile-filters-container">
        <button 
          className={`filter-pill ${filter === 'tous' ? 'active' : ''}`}
          onClick={() => setFilter('tous')}
        >
          Tous
        </button>
        <button 
          className={`filter-pill ${filter === 'avecConcerts' ? 'active' : ''}`}
          onClick={() => setFilter('avecConcerts')}
        >
          Avec concerts
        </button>
        <button 
          className={`filter-pill ${filter === 'sansConcerts' ? 'active' : ''}`}
          onClick={() => setFilter('sansConcerts')}
        >
          Sans concerts
        </button>
      </div>

      {/* Liste d'artistes en cards adaptées au mobile */}
      <div className="mobile-artistes-grid">
        {loading && artistes.length === 0 ? (
          <div className="loading-indicator">
            <Spinner animation="border" variant="primary" />
            <p>Chargement...</p>
          </div>
        ) : filteredArtistes.length === 0 ? (
          <div className="empty-state-mobile">
            <i className="bi bi-music-note-list"></i>
            <p>Aucun artiste trouvé</p>
            <Button
              variant="primary"
              onClick={() => navigate('/artistes/nouveau')}
            >
              Ajouter un artiste
            </Button>
          </div>
        ) : (
          filteredArtistes.map(artiste => (
            <div 
              key={artiste.id} 
              className="artiste-card-mobile"
              onClick={() => navigate(`/artistes/${artiste.id}`)}
            >
              <div className="artiste-card-header">
                {artiste.photoPrincipale ? (
                  <img src={artiste.photoPrincipale} alt={artiste.nom} />
                ) : (
                  <div className="placeholder-photo-mobile">
                    <i className="bi bi-music-note"></i>
                  </div>
                )}
                {/* Badges simplifiés */}
                <div className="artiste-badges-mobile">
                  {getNbConcerts(artiste) > 0 && (
                    <span className="badge-mobile badge-concerts">
                      {getNbConcerts(artiste)}
                    </span>
                  )}
                </div>
              </div>
              <div className="artiste-card-content">
                <h3>{artiste.nom}</h3>
                {artiste.genre && <p className="genre">{artiste.genre}</p>}
                
                {/* Boutons d'action en bas de la carte */}
                <div className="artiste-actions-mobile">
                  <button 
                    className="action-btn view"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/artistes/${artiste.id}`);
                    }}
                  >
                    <i className="bi bi-eye"></i>
                  </button>
                  <button 
                    className="action-btn edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/artistes/${artiste.id}/modifier`);
                    }}
                  >
                    <i className="bi bi-pencil"></i>
                  </button>
                  <button 
                    className="action-btn delete"
                    onClick={(e) => handleDelete(artiste.id, e)}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bouton "Charger plus" en bas de page */}
      {hasMore && !searchTerm && (
        <div className="load-more-container-mobile">
          <Button 
            variant="outline-primary"
            onClick={handleLoadMore}
            disabled={loading}
            className="load-more-btn-mobile"
          >
            {loading ? (
              <Spinner animation="border" size="sm" />
            ) : (
              <i className="bi bi-plus-circle"></i>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ArtistesListMobile;