import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { formatDate } from '../../utils/dateUtils';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import Badge from 'react-bootstrap/Badge';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import '../../style/concertsList.css'; // Nouveau fichier CSS à créer

const ConcertsList = () => {
  const navigate = useNavigate();
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredConcerts, setFilteredConcerts] = useState([]);
  const [statusFilter, setStatusFilter] = useState('tous');

  useEffect(() => {
    const fetchConcerts = async () => {
      try {
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
        formatDate(concert.date).toLowerCase().includes(term)
      );
    }
    
    setFilteredConcerts(results);
  }, [searchTerm, statusFilter, concerts]);

  // Fonction pour obtenir les détails d'un concert
  const handleRowClick = (concertId) => {
    navigate(`/concerts/${concertId}`);
  };

  // Composant pour les boutons d'action avec tooltip
  const ActionButton = ({ to, tooltip, icon, variant, onClick }) => (
    <OverlayTrigger
      placement="top"
      overlay={<Tooltip>{tooltip}</Tooltip>}
    >
      {to ? (
        <Link 
          to={to} 
          className={`btn btn-${variant} btn-icon modern-btn`}
          onClick={(e) => e.stopPropagation()}
        >
          {icon}
        </Link>
      ) : (
        <button 
          onClick={(e) => { 
            e.stopPropagation();
            onClick(); 
          }} 
          className={`btn btn-${variant} btn-icon modern-btn`}
        >
          {icon}
        </button>
      )}
    </OverlayTrigger>
  );

  // Fonction pour obtenir les détails du statut
  const getStatusDetails = (statut) => {
    switch (statut) {
      case 'contact':
        return {
          icon: '📞',
          label: 'Contact établi',
          variant: 'info',
          tooltip: 'Premier contact établi avec le programmateur',
          step: 1
        };
      case 'preaccord':
        return {
          icon: '✅',
          label: 'Pré-accord',
          variant: 'primary',
          tooltip: 'Accord verbal obtenu, en attente de confirmation',
          step: 2
        };
      case 'contrat':
        return {
          icon: '📄',
          label: 'Contrat signé',
          variant: 'success',
          tooltip: 'Contrat signé par toutes les parties',
          step: 3
        };
      case 'acompte':
        return {
          icon: '💸',
          label: 'Acompte facturé',
          variant: 'warning',
          tooltip: 'Acompte facturé, en attente de paiement',
          step: 4
        };
      case 'solde':
        return {
          icon: '🔁',
          label: 'Solde facturé',
          variant: 'secondary',
          tooltip: 'Solde facturé, concert terminé',
          step: 5
        };
      case 'annule':
        return {
          icon: '❌',
          label: 'Annulé',
          variant: 'danger',
          tooltip: 'Concert annulé',
          step: 0
        };
      default:
        return {
          icon: '❓',
          label: statut || 'Non défini',
          variant: 'light',
          tooltip: 'Statut non défini',
          step: 0
        };
    }
  };

  // Composant pour afficher la barre de progression du statut
  const StatusProgressBar = ({ statut }) => {
    const statusInfo = getStatusDetails(statut);
    const totalSteps = 5; // Nombre total d'étapes dans le processus
    
    return (
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip>{statusInfo.tooltip}</Tooltip>}
      >
        <div className="status-progress-container">
          <div className="status-steps">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div 
                key={i} 
                className={`status-step ${i < statusInfo.step ? 'completed' : ''} ${i === statusInfo.step - 1 ? 'current' : ''}`}
              />
            ))}
          </div>
          <div className="status-label">
            <span className="status-icon">{statusInfo.icon}</span>
            <span className="status-text">{statusInfo.label}</span>
          </div>
        </div>
      </OverlayTrigger>
    );
  };

  if (loading) {
    return <div className="text-center my-5 loading-spinner">Chargement des concerts...</div>;
  }

  if (error) {
    return (
      <div className="concerts-container">
        <div className="alert alert-danger modern-alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="concerts-container">
      <div className="d-flex justify-content-between align-items-center mb-4 header-container">
        <h2 className="modern-title">Liste des concerts</h2>
        <Link to="/concerts/nouveau" className="btn btn-primary modern-add-btn">
          <i className="bi bi-plus-lg me-2"></i>
          Ajouter un concert
        </Link>
      </div>

      <div className="search-filter-container mb-4">
        <div className="search-bar">
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control search-input"
              placeholder="Rechercher un concert..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                className="btn btn-outline-secondary clear-search" 
                onClick={() => setSearchTerm('')}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="status-filter-tabs mb-4">
        <button 
          className={`status-tab ${statusFilter === 'tous' ? 'active' : ''}`}
          onClick={() => setStatusFilter('tous')}
        >
          Tous les concerts
        </button>
        {['contact', 'preaccord', 'contrat', 'acompte', 'solde'].map(status => {
          const statusInfo = getStatusDetails(status);
          return (
            <button 
              key={status}
              className={`status-tab ${statusFilter === status ? 'active' : ''}`}
              onClick={() => setStatusFilter(status)}
            >
              <span className="status-icon">{statusInfo.icon}</span>
              {statusInfo.label}
            </button>
          );
        })}
      </div>

      {filteredConcerts.length === 0 ? (
        <div className="alert alert-info modern-alert">
          <div className="d-flex align-items-center">
            <i className="bi bi-info-circle me-3"></i>
            <p className="mb-0">
              {searchTerm || statusFilter !== 'tous' 
                ? 'Aucun concert ne correspond à vos critères de recherche.' 
                : 'Aucun concert n\'a été créé pour le moment.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="table-responsive modern-table-container">
          <table className="table table-hover modern-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Titre</th>
                <th>Lieu</th>
                <th>Programmateur</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredConcerts.map(concert => (
                <tr 
                  key={concert.id} 
                  className="table-row-animate clickable-row"
                  onClick={() => handleRowClick(concert.id)}
                >
                  <td className="date-column">
                    <div className="date-box">
                      <div className="date-month">{formatDate(concert.date).split(' ')[1]}</div>
                      <div className="date-day">{formatDate(concert.date).split(' ')[0]}</div>
                      <div className="date-year">{formatDate(concert.date).split(' ')[2]}</div>
                    </div>
                  </td>
                  <td className="fw-medium">{concert.titre || "Sans titre"}</td>
                  <td>{concert.lieuNom || "-"}</td>
                  <td>
                    {concert.programmateurNom ? (
                      <span className="programmateur-name">
                        <i className="bi bi-person-fill me-1"></i>
                        {concert.programmateurNom}
                      </span>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td className="montant-column">
                    {concert.montant ? (
                      <span className="montant-value">
                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(concert.montant)}
                      </span>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td className="status-column">
                    <StatusProgressBar statut={concert.statut || 'contact'} />
                  </td>
                  <td>
                    <div className="btn-group action-buttons">
                      <ActionButton 
                        to={`/concerts/${concert.id}/edit`} 
                        tooltip="Modifier le concert" 
                        icon={<i className="bi bi-pencil"></i>} 
                        variant="light"
                      />
                      <ActionButton 
                        to={`/concerts/${concert.id}/form`} 
                        tooltip="Voir le formulaire" 
                        icon={<i className="bi bi-file-text"></i>} 
                        variant="light"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ConcertsList;
