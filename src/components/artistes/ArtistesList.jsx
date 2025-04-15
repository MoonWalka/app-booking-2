import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import '../../style/artistesList.css';

const ArtistesList = () => {
  const [artistes, setArtistes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('tous');
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

  const filteredArtistes = artistes.filter(artiste => {
    // Appliquer filtre de recherche
    const matchesSearch = artiste.nom.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Appliquer filtres spécifiques si nécessaire
    if (filter === 'tous') return matchesSearch;
    if (filter === 'avecConcerts') return matchesSearch && artiste.concertsAssocies?.length > 0;
    if (filter === 'sansConcerts') return matchesSearch && (!artiste.concertsAssocies || artiste.concertsAssocies.length === 0);
    
    return matchesSearch;
  });

  if (loading) {
    return <div className="loading-container">Chargement des artistes...</div>;
  }

  return (
    <div className="artistes-list-container">
      <div className="list-header">
        <h2 className="page-title">Artistes</h2>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/artistes/nouveau')}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Ajouter un artiste
        </button>
      </div>

      <div className="search-filter-container">
        <div className="search-input">
          <i className="bi bi-search search-icon"></i>
          <input
            type="text"
            placeholder="Rechercher un artiste..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control"
          />
        </div>
        
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

      {filteredArtistes.length === 0 ? (
        <div className="no-results">
          <p>Aucun artiste trouvé</p>
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
    </div>
  );
};

export default ArtistesList;
