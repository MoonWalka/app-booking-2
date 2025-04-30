// src/components/artistes/mobile/ArtistesList.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  startAfter,
  doc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '@/firebaseInit';
import '@styles/index.css';
import { Button, Form, InputGroup } from 'react-bootstrap';
import Spinner from '@/components/common/Spinner';
import { getNbConcerts, filteredArtistes } from '@/components/artistes/mobile/utils/concertUtils';
import { handleDelete } from '@/components/artistes/mobile/handlers/deleteHandler';
import { handleLoadMore } from '@/components/artistes/mobile/handlers/paginationHandler';
// Nouveau fichier CSS spécifique au mobile

const ArtistesList = () => {
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
  useEffect(() => {
    const loadArtistes = async () => {
      setLoading(true);
      try {
        const artistesRef = collection(db, 'artistes');
        const q = query(
          artistesRef,
          orderBy('nom'),
          limit(pageSize)
        );
        
        const querySnapshot = await getDocs(q);
        const artistesList = [];
        
        for (const doc of querySnapshot.docs) {
          const artisteData = { id: doc.id, ...doc.data() };
          // Récupération du nombre de concerts pour chaque artiste
          const nbConcerts = await getNbConcerts(doc.id);
          artisteData.nbConcerts = nbConcerts;
          artistesList.push(artisteData);
        }
        
        setArtistes(artistesList);
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
        setHasMore(querySnapshot.docs.length === pageSize);
      } catch (error) {
        console.error("Erreur lors du chargement des artistes:", error);
      } finally {
        setLoading(false);
      }
    };

    loadArtistes();
  }, []);

  // Fonction pour charger plus d'artistes
  const loadMoreData = async () => {
    if (!hasMore || loading) return;
    
    setLoading(true);
    try {
      const result = await handleLoadMore('artistes', lastVisible, 'nom', pageSize);
      if (result.newDocs.length > 0) {
        // Ajouter les infos de concerts pour chaque nouvel artiste
        const artistesWithConcerts = await Promise.all(
          result.newDocs.map(async (artiste) => {
            const nbConcerts = await getNbConcerts(artiste.id);
            return { ...artiste, nbConcerts };
          })
        );
        
        setArtistes(prev => [...prev, ...artistesWithConcerts]);
        setLastVisible(result.lastVisible);
        setHasMore(result.hasMore);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des artistes supplémentaires:", error);
    } finally {
      setLoading(false);
    }
  };

  // Gestion de la suppression d'un artiste
  const handleDeleteArtiste = async (artisteId, e) => {
    e.stopPropagation(); // Éviter la navigation
    const success = await handleDelete('artistes', artisteId, 'Êtes-vous sûr de vouloir supprimer cet artiste ?');
    if (success) {
      setArtistes(prev => prev.filter(artiste => artiste.id !== artisteId));
    }
  };

  // Appliquer le filtre aux artistes
  const getFilteredArtistes = () => {
    // D'abord, filtrer par recherche
    let filtered = filteredArtistes(artistes, searchTerm);
    
    // Ensuite, appliquer le filtre de concerts
    if (filter === 'avecConcerts') {
      filtered = filtered.filter(artiste => artiste.nbConcerts > 0);
    } else if (filter === 'sansConcerts') {
      filtered = filtered.filter(artiste => artiste.nbConcerts === 0);
    }
    
    return filtered;
  };
  
  // Obtenir la liste filtrée
  const filteredArtistesList = getFilteredArtistes();

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
          <Spinner message="Chargement des artistes..." />
        ) : filteredArtistesList.length === 0 ? (
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
          filteredArtistesList.map(artiste => (
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
                    onClick={(e) => handleDeleteArtiste(artiste.id, e)}
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
            onClick={loadMoreData}
            disabled={loading}
            className="load-more-btn-mobile"
          >
            {loading ? (
              <Spinner inline />
            ) : (
              <i className="bi bi-plus-circle"></i>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ArtistesList;