// src/components/concerts/mobile/ConcertsList.js
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../../firebaseInit';
import { Badge, Button, Form, InputGroup } from 'react-bootstrap';
import Spinner from '../../common/Spinner';
import { formatDateFrSlash } from '@/utils/dateUtils';
// Import du module CSS
import styles from './ConcertsList.module.css';

const ConcertsListMobile = () => {
  const navigate = useNavigate();
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredConcerts, setFilteredConcerts] = useState([]);
  const [statusFilter, setStatusFilter] = useState('tous');
  
  // Correction UI: Utilisation de useMemo pour optimiser les appels à getStatusDetails
  const statusDetailsMap = useMemo(() => ({
    contact: {
      icon: '📞',
      label: 'Contact',
      variant: 'info',
      tooltip: 'Premier contact établi avec le programmateur'
    },
    preaccord: {
      icon: '✅',
      label: 'Pré-accord',
      variant: 'primary',
      tooltip: 'Accord verbal obtenu, en attente de confirmation'
    },
    contrat: {
      icon: '📄',
      label: 'Contrat',
      variant: 'success',
      tooltip: 'Contrat signé par toutes les parties'
    },
    acompte: {
      icon: '💸',
      label: 'Acompte',
      variant: 'warning',
      tooltip: 'Acompte facturé, en attente de paiement'
    },
    solde: {
      icon: '🔁',
      label: 'Solde',
      variant: 'secondary',
      tooltip: 'Solde facturé, concert terminé'
    },
    annule: {
      icon: '❌',
      label: 'Annulé',
      variant: 'danger',
      tooltip: 'Concert annulé'
    }
  }), []);
  
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
        concert.artisteNom?.toLowerCase().includes(term) ||
        (concert.lieuVille && concert.lieuVille.toLowerCase().includes(term)) ||
        (concert.lieuCodePostal && concert.lieuCodePostal.includes(term))
      );
    }
    
    setFilteredConcerts(results);
  }, [searchTerm, statusFilter, concerts]);

  // Correction UI: Fonction optimisée pour obtenir la couleur du statut
  const getStatusColor = (statut) => {
    return statusDetailsMap[statut]?.variant || 'light';
  };

  // Correction UI: Fonction pour obtenir les informations complètes sur le statut
  const getStatusInfo = (statut) => {
    return statusDetailsMap[statut] || {
      icon: '❓',
      label: statut || 'Non défini',
      variant: 'light',
      tooltip: 'Statut non défini'
    };
  };

  // Fonction pour vérifier si une date est passée
  const isDatePassed = (date) => {
    if (!date) return false;
    const today = new Date();
    const concertDate = new Date(date.seconds ? date.seconds * 1000 : date);
    return concertDate < today;
  };

  return (
    <div className={styles.concertsMobileContainer}>
      {/* En-tête avec titre et bouton d'ajout */}
      <div className={styles.mobileHeader}>
        <h1 className="fs-4 fw-bold text-primary mb-0">Concerts</h1>
        <Button 
          variant="primary"
          className="d-flex align-items-center gap-2 rounded-3 px-3 py-2"
          onClick={() => navigate('/concerts/nouveau')}
        >
          <i className="bi bi-plus-lg"></i>
          <span className="d-none d-sm-inline">Ajouter</span>
        </Button>
      </div>

      {/* Barre de recherche */}
      <div className={styles.mobileSearchContainer}>
        <InputGroup className={styles.searchInputGroup}>
          <InputGroup.Text>
            <i className="bi bi-search"></i>
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Rechercher un concert..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          {searchTerm && (
            <Button 
              variant="outline-secondary"
              onClick={() => setSearchTerm('')}
              className={styles.clearSearchBtn}
            >
              <i className="bi bi-x"></i>
            </Button>
          )}
        </InputGroup>
      </div>

      {/* Filtres par statut */}
      <div className={styles.mobileFiltersContainer}>
        {/* Correction UI: Utilisation des filtres standardisés depuis statusDetailsMap */}
        <button 
          className={`btn ${statusFilter === 'tous' ? 'btn-primary' : 'btn-outline-primary'} btn-sm me-2 px-3 py-2 rounded-pill ${styles.filterButton}`}
          onClick={() => setStatusFilter('tous')}
        >
          Tous
        </button>
        {Object.keys(statusDetailsMap).map(status => (
          <button 
            key={status}
            className={`btn ${statusFilter === status ? 'btn-primary' : 'btn-outline-primary'} btn-sm me-2 px-3 py-2 rounded-pill d-inline-flex align-items-center ${styles.filterButton}`}
            onClick={() => setStatusFilter(status)}
          >
            <span className={styles.filterIcon}>{statusDetailsMap[status].icon}</span> 
            <span className={`ms-1 ${styles.filterLabel}`}>{statusDetailsMap[status].label}</span>
          </button>
        ))}
      </div>

      {/* Affichage des concerts */}
      {loading ? (
        <Spinner message="Chargement des concerts..." />
      ) : error ? (
        <div className={styles.errorContainer}>
          <i className="bi bi-exclamation-triangle-fill"></i>
          <p>{error}</p>
        </div>
      ) : filteredConcerts.length === 0 ? (
        <div className={styles.emptyContainer}>
          <i className="bi bi-calendar-x"></i>
          <p>Aucun concert trouvé</p>
          <Button 
            variant="primary"
            onClick={() => navigate('/concerts/nouveau')}
            className={styles.addConcertButton}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Ajouter un concert
          </Button>
        </div>
      ) : (
        <div className={styles.concertsListMobile}>
          {filteredConcerts.map(concert => (
            <div 
              key={concert.id} 
              className={styles.concertCard}
              onClick={() => navigate(`/concerts/${concert.id}`)}
            >
              {/* Date du concert */}
              <div className={`${styles.concertCardDate} ${isDatePassed(concert.date) ? styles.pastDate : ''}`}>
                <div className={styles.dateDay}>{formatDateFrSlash(concert.date).split('/')[0]}</div>
                <div className={styles.dateMonth}>{formatDateFrSlash(concert.date).split('/')[1]}</div>
                <div className={styles.dateYear}>{formatDateFrSlash(concert.date).split('/')[2]}</div>
              </div>
              
              <div className={styles.concertDetails}>
                <h3 className={styles.concertCardTitle}>{concert.titre || concert.artisteNom || "Concert sans titre"}</h3>
                
                <div className={styles.concertInfo}>
                  {concert.lieuNom && (
                    <div className={styles.infoItem}>
                      <i className="bi bi-geo-alt"></i>
                      <span className={styles.concertVenueName}>{concert.lieuNom}</span>
                      {concert.lieuVille && (
                        <span className={styles.concertVenueLocation}>{concert.lieuVille}</span>
                      )}
                    </div>
                  )}
                  
                  {concert.artisteNom && (
                    <div className={styles.infoItem}>
                      <i className="bi bi-music-note"></i>
                      <span className={styles.artistTag}>{concert.artisteNom}</span>
                    </div>
                  )}
                  
                  {concert.montant && (
                    <div className={`${styles.infoItem} ${styles.montant}`}>
                      <i className="bi bi-cash"></i>
                      <span>{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(concert.montant)}</span>
                    </div>
                  )}
                </div>
                
                <div className={styles.concertStatus}>
                  <Badge bg={getStatusColor(concert.statut)} className={styles.concertStatusBadge}>
                    {getStatusInfo(concert.statut).label}
                  </Badge>
                </div>
              </div>
              
              <div className={styles.concertActions}>
                <Link 
                  to={`/concerts/${concert.id}`}
                  className={`${styles.actionBtn} ${styles.view} ${styles.concertActionButton}`}
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Voir le détail"
                >
                  <i className="bi bi-eye"></i>
                </Link>
                <Link 
                  to={`/concerts/${concert.id}/edit`}
                  className={`${styles.actionBtn} ${styles.edit} ${styles.concertActionButton}`}
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Modifier le concert"
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
