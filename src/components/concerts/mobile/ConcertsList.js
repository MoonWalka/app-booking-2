// src/components/concerts/mobile/ConcertsList.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, query, orderBy, getDocs, where } from 'firebase/firestore';
import { db } from '../../../firebase';
import { Badge, Button, Form, InputGroup } from 'react-bootstrap';
import Spinner from '../../common/Spinner';
import '../../../style/concertsList.css';
import '../../../style/concertsListMobile.css';
import '../../../style/concertDisplay.css';
import { formatDateFrSlash } from '@/utils/dateUtils';


const ConcertsListMobile = () => {
  const navigate = useNavigate();
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredConcerts, setFilteredConcerts] = useState([]);
  const [statusFilter, setStatusFilter] = useState('tous');
  
  // Logique de chargement des données (similaire à la version desktop)
  useEffect(() => {
    const fetchConcerts = async () => {
      try {
        setLoading(true);
        const concertsRef = collection(db, 'concerts');
        const q = query(concertsRef, orderBy('date', 'desc'));
        const querySnapshot = await getDocs(q);

        const concertsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setConcerts(concertsData);
        setFilteredConcerts(concertsData);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des concerts:', error);
        setError('Impossible de charger les concerts. Veuillez réessayer plus tard.');
        setLoading(false);
      }
    };

    fetchConcerts();
  }, []);

  // Effet pour filtrer les concerts par recherche et statut
  useEffect(() => {
    let results = [...concerts];
    
    // Filtrer par statut
    if (statusFilter !== 'tous') {
      results = results.filter(concert => concert.statut === statusFilter);
    }
    
    // Filtrer par terme de recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(concert => 
        concert.titre?.toLowerCase().includes(term) ||
        concert.lieuNom?.toLowerCase().includes(term) ||
        concert.programmateurNom?.toLowerCase().includes(term) ||
        concert.artisteNom?.toLowerCase().includes(term)
      );
    }
    
    setFilteredConcerts(results);
  }, [searchTerm, statusFilter, concerts]);

  // La fonction formatDate locale n'est plus nécessaire car nous utilisons formatDateFrSlash depuis dateUtils

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (statut) => {
    switch (statut) {
      case 'contact': return 'info';
      case 'preaccord': return 'primary';
      case 'contrat': return 'success';
      case 'acompte': return 'warning';
      case 'solde': return 'secondary';
      case 'annule': return 'danger';
      default: return 'light';
    }
  };

  return (
    <div className="concerts-mobile-container">
      {/* En-tête avec titre et bouton d'ajout */}
      <div className="mobile-header">
        <h1>Concerts</h1>
        <Button 
          variant="primary"
          className="mobile-add-btn"
          onClick={() => navigate('/concerts/nouveau')}
        >
          <i className="bi bi-plus-lg"></i>
        </Button>
      </div>

      {/* Barre de recherche */}
      <div className="mobile-search-container">
        <InputGroup>
          <InputGroup.Text>
            <i className="bi bi-search"></i>
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Rechercher un concert..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <Button 
              variant="outline-secondary"
              onClick={() => setSearchTerm('')}
              className="clear-search-btn"
            >
              <i className="bi bi-x"></i>
            </Button>
          )}
        </InputGroup>
      </div>

      {/* Filtres par statut */}
      <div className="mobile-filters-container">
        <button 
          className={`filter-pill ${statusFilter === 'tous' ? 'active' : ''}`}
          onClick={() => setStatusFilter('tous')}
        >
          Tous
        </button>
        <button 
          className={`filter-pill ${statusFilter === 'contact' ? 'active' : ''}`}
          onClick={() => setStatusFilter('contact')}
        >
          <span className="filter-icon">📞</span> Contact
        </button>
        <button 
          className={`filter-pill ${statusFilter === 'preaccord' ? 'active' : ''}`}
          onClick={() => setStatusFilter('preaccord')}
        >
          <span className="filter-icon">✅</span> Pré-accord
        </button>
        <button 
          className={`filter-pill ${statusFilter === 'contrat' ? 'active' : ''}`}
          onClick={() => setStatusFilter('contrat')}
        >
          <span className="filter-icon">📄</span> Contrat
        </button>
        <button 
          className={`filter-pill ${statusFilter === 'acompte' ? 'active' : ''}`}
          onClick={() => setStatusFilter('acompte')}
        >
          <span className="filter-icon">💸</span> Acompte
        </button>
        <button 
          className={`filter-pill ${statusFilter === 'solde' ? 'active' : ''}`}
          onClick={() => setStatusFilter('solde')}
        >
          <span className="filter-icon">🔁</span> Solde
        </button>
      </div>

      {/* Affichage des concerts */}
      {loading ? (
        <Spinner message="Chargement des concerts..." />
      ) : error ? (
        <div className="error-container">
          <i className="bi bi-exclamation-triangle-fill"></i>
          <p>{error}</p>
        </div>
      ) : filteredConcerts.length === 0 ? (
        <div className="empty-container">
          <i className="bi bi-calendar-x"></i>
          <p>Aucun concert trouvé</p>
          <Button 
            variant="primary"
            onClick={() => navigate('/concerts/nouveau')}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Ajouter un concert
          </Button>
        </div>
      ) : (
        <div className="concerts-list-mobile">
          {filteredConcerts.map(concert => (
            <div 
              key={concert.id} 
              className="concert-card"
              onClick={() => navigate(`/concerts/${concert.id}`)}
            >
              <div className="concert-date concert-card-date">
                <div className="date-day">{formatDateFrSlash(concert.date).split('/')[0]}</div>
                <div className="date-month">{formatDateFrSlash(concert.date).split('/')[1]}</div>
                <div className="date-year">{formatDateFrSlash(concert.date).split('/')[2]}</div>
              </div>
              
              <div className="concert-details">
                <h3 className="concert-title concert-card-title">{concert.titre || "Concert sans titre"}</h3>
                
                <div className="concert-info">
                  {concert.lieuNom && (
                    <div className="info-item concert-venue-cell">
                      <i className="bi bi-geo-alt"></i>
                      <span className="concert-venue-name">{concert.lieuNom}</span>
                      {concert.lieuVille && (
                        <span className="concert-venue-location">{concert.lieuVille}</span>
                      )}
                    </div>
                  )}
                  
                  {concert.artisteNom && (
                    <div className="info-item concert-artist-cell">
                      <i className="bi bi-music-note"></i>
                      <span className="artist-tag">{concert.artisteNom}</span>
                    </div>
                  )}
                  
                  {concert.montant && (
                    <div className="info-item montant">
                      <i className="bi bi-cash"></i>
                      <span>{concert.montant.toLocaleString('fr-FR')} €</span>
                    </div>
                  )}
                </div>
                
                <div className="concert-status">
                  <Badge bg={getStatusColor(concert.statut)} className="concert-status-badge">
                    {concert.statut || 'Non défini'}
                  </Badge>
                </div>
              </div>
              
              <div className="concert-actions">
                <Link 
                  to={`/concerts/${concert.id}`}
                  className="action-btn view concert-action-button"
                  onClick={(e) => e.stopPropagation()}
                >
                  <i className="bi bi-eye"></i>
                </Link>
                <Link 
                  to={`/concerts/${concert.id}/edit`}
                  className="action-btn edit concert-action-button"
                  onClick={(e) => e.stopPropagation()}
                >
                  <i className="bi bi-pencil"></i>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConcertsListMobile;
