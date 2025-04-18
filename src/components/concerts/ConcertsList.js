import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, query, orderBy, getDocs, where } from 'firebase/firestore';
import Badge from 'react-bootstrap/Badge';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import '../../style/concertsList.css';

const ConcertsList = () => {
  const navigate = useNavigate();
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredConcerts, setFilteredConcerts] = useState([]);
  const [statusFilter, setStatusFilter] = useState('tous');
  const [concertsWithForms, setConcertsWithForms] = useState([]);
  const [unvalidatedForms, setUnvalidatedForms] = useState([]);
  const [concertsWithContracts, setConcertsWithContracts] = useState({});

  useEffect(() => {
    const fetchConcertsAndForms = async () => {
      try {
        // Récupérer les concerts
        const concertsRef = collection(db, 'concerts');
        const q = query(concertsRef, orderBy('date', 'desc'));
        const querySnapshot = await getDocs(q);

        const concertsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setConcerts(concertsData);
        setFilteredConcerts(concertsData);

        // Récupérer les ID des concerts qui ont des formulaires associés
        const formsRef = collection(db, 'formLinks');
        const formsSnapshot = await getDocs(formsRef);
        
        // Créer un Set pour stocker les IDs des concerts avec formulaires
        const concertsWithFormsSet = new Set();
        
        formsSnapshot.forEach(doc => {
          const formData = doc.data();
          if (formData.concertId) {
            concertsWithFormsSet.add(formData.concertId);
          }
        });
        
        // Récupérer les soumissions de formulaires
        const formSubmissionsRef = collection(db, 'formSubmissions');
        const submissionsSnapshot = await getDocs(formSubmissionsRef);
        
        // Set pour stocker les IDs des concerts avec formulaires non validés
        const concertsWithUnvalidatedFormsSet = new Set();
        
        submissionsSnapshot.forEach(doc => {
          const formData = doc.data();
          if (formData.concertId) {
            concertsWithFormsSet.add(formData.concertId); // Ajouter aux formulaires existants
            
            // Si le formulaire est soumis mais pas encore validé, l'ajouter aux non validés
            if (formData.status !== 'validated') {
              concertsWithUnvalidatedFormsSet.add(formData.concertId);
            }
          }
        });
        
        setConcertsWithForms(Array.from(concertsWithFormsSet));
        setUnvalidatedForms(Array.from(concertsWithUnvalidatedFormsSet));
        
        // Récupérer les contrats
        const contratsRef = collection(db, 'contrats');
        const contratsSnapshot = await getDocs(contratsRef);
        
        const contratsData = {};
        
        contratsSnapshot.forEach(doc => {
          const contratData = doc.data();
          if (contratData.concertId) {
            contratsData[contratData.concertId] = {
              id: doc.id,
              ...contratData
            };
          }
        });
        
        setConcertsWithContracts(contratsData);
        
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setError('Impossible de charger les concerts. Veuillez réessayer plus tard.');
        setLoading(false);
      }
    };

    fetchConcertsAndForms();
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
        (concert.lieuCodePostal && concert.lieuCodePostal.includes(term)) ||
        formatDateFr(concert.date).includes(term)
      );
    }
    
    setFilteredConcerts(results);
  }, [searchTerm, statusFilter, concerts]);

  // Fonction pour vérifier si un concert a un contrat
  const hasContract = (concertId) => {
    return concertsWithContracts[concertId] !== undefined;
  };
  
  // Fonction pour obtenir le statut du contrat
  const getContractStatus = (concertId) => {
    if (!hasContract(concertId)) return null;
    return concertsWithContracts[concertId].status || 'generated';
  };
  
  // Fonction pour obtenir la variante du bouton contrat
  const getContractButtonVariant = (concertId) => {
    const status = getContractStatus(concertId);
    if (!status) return 'outline-primary';
    
    switch (status) {
      case 'signed':
        return 'success';
      case 'sent':
        return 'success';
      case 'generated':
        return 'warning';
      default:
        return 'outline-primary';
    }
  };
  
  // Fonction pour obtenir le texte de l'info-bulle
  const getContractTooltip = (concertId) => {
    const status = getContractStatus(concertId);
    if (!status) return 'Aucun contrat généré';
    
    switch (status) {
      case 'signed':
        return 'Contrat signé';
      case 'sent':
        return 'Contrat envoyé';
      case 'generated':
        return 'Contrat généré mais non envoyé';
      default:
        return 'Statut inconnu';
    }
  };

  // Fonction pour formater la date au format français
  const formatDateFr = (dateString) => {
    if (!dateString) return '-';
    
    // Si c'est un timestamp Firestore
    if (dateString.seconds) {
      const date = new Date(dateString.seconds * 1000);
      return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
    }
    
    // Si c'est une chaîne de date au format ISO
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Si la date est invalide, retourner la chaîne originale
    
    return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
  };

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
  
  // Composant pour afficher le statut avancé avec infos sur les étapes
  const StatusWithInfo = ({ concert }) => {
    const [showDetails, setShowDetails] = useState(false);
    
    // Déterminer l'action et le message en fonction du statut et des étapes
    const getStatusDetails = () => {
      const today = new Date();
      const concertDate = concert.date ? new Date(concert.date.seconds ? concert.date.seconds * 1000 : concert.date) : null;
      const isPastDate = concertDate && concertDate < today;
      
      switch (concert.statut) {
        case 'contact':
          if (!hasForm(concert.id) && concert.programmateurId) 
            return { message: 'Formulaire à envoyer', action: 'form', variant: 'warning' };
          if (!concert.programmateurId) 
            return { message: 'Programmateur à démarcher', action: 'prog', variant: 'warning' };
          return { message: 'Contact établi', action: 'contact', variant: 'info' };
        
        case 'preaccord':
          return { message: 'Pré-accord obtenu', action: 'preaccord', variant: 'primary' };
          
        case 'contrat':
          return { message: 'Contrat signé', action: 'contrat', variant: 'success' };
        
        case 'acompte':
          return { message: 'Acompte facturé', action: 'acompte', variant: 'warning' };
        
        case 'solde':
          if (isPastDate)
            return { message: 'Concert terminé', action: 'completed', variant: 'secondary' };
          return { message: 'Solde facturé', action: 'solde', variant: 'info' };
          
        case 'annule':
          return { message: 'Concert annulé', action: 'annule', variant: 'danger' };
          
        default:
          return { message: concert.statut || 'Non défini', action: 'unknown', variant: 'light' };
      }
    };
    
    const statusInfo = getStatusDetails();
    const statusDetails = getStatusDetails(concert.statut);
    const totalSteps = 5; // Nombre total d'étapes dans le processus
    
    // Déterminer l'étape actuelle
    const getStep = (statut) => {
      switch (statut) {
        case 'contact': return 1;
        case 'preaccord': return 2;
        case 'contrat': return 3;
        case 'acompte': return 4;
        case 'solde': return 5;
        case 'annule': return 0;
        default: return 0;
      }
    };
    
    const currentStep = getStep(concert.statut || 'contact');
    
    return (
      <div 
        className="status-advanced-container" 
        onMouseEnter={() => setShowDetails(true)}
        onMouseLeave={() => setShowDetails(false)}
      >
        <div className="status-progress-container">
          <div className="status-steps">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div 
                key={i} 
                className={`status-step ${i < currentStep ? 'completed' : ''} ${i === currentStep - 1 ? 'current' : ''}`}
              />
            ))}
          </div>
          <div className="status-label">
            <span className="status-icon">{statusDetails.icon}</span>
            <span className="status-text">{statusDetails.label}</span>
          </div>
        </div>
        
        {showDetails && (
          <div className="status-tooltip">
            <div className={`status-message status-message-${statusInfo.variant}`}>
              {statusInfo.message}
              {!hasForm(concert.id) && concert.programmateurId && (
                <div className="action-reminder">
                  <i className="bi bi-exclamation-circle me-1"></i>
                  Formulaire à envoyer
                </div>
              )}
              {hasUnvalidatedForm(concert.id) && (
                <div className="action-reminder">
                  <i className="bi bi-exclamation-circle me-1"></i>
                  Formulaire à valider
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Fonction pour vérifier si un concert a un formulaire associé
  const hasForm = (concertId) => {
    return concertsWithForms.includes(concertId) || 
           concerts.find(c => c.id === concertId)?.formId !== undefined;
  };

  // Fonction pour vérifier si un formulaire est non validé
  const hasUnvalidatedForm = (concertId) => {
    return unvalidatedForms.includes(concertId);
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
                <th>Lieu</th>
                <th>Ville</th>
                <th>Artiste</th>
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
                      <div className="date-day">{formatDateFr(concert.date).split('-')[0]}</div>
                      <div className="date-month">{formatDateFr(concert.date).split('-')[1]}</div>
                      <div className="date-year">{formatDateFr(concert.date).split('-')[2]}</div>
                    </div>
                  </td>
                  <td>{concert.lieuNom || "-"}</td>
                  <td>
                    {concert.lieuVille && concert.lieuCodePostal ? 
                      `${concert.lieuVille} (${concert.lieuCodePostal})` : 
                      concert.lieuVille || concert.lieuCodePostal || "-"
                    }
                  </td>
                  <td>
                    {concert.artisteNom ? (
                      <span className="artiste-name">
                        <i className="bi bi-music-note me-1"></i>
                        {concert.artisteNom}
                      </span>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
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
                    <StatusWithInfo concert={concert} />
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="btn-group action-buttons">
                      <ActionButton 
                        to={`/concerts/${concert.id}/edit`} 
                        tooltip="Modifier le concert" 
                        icon={<i className="bi bi-pencil"></i>} 
                        variant="light"
                      />
                      {hasForm(concert.id) && (
                        <div className="position-relative">
                          <ActionButton 
                            to={`/concerts/${concert.id}/form`} 
                            tooltip="Voir le formulaire" 
                            icon={<i className="bi bi-file-text"></i>} 
                            variant="light"
                          />
                          {hasUnvalidatedForm(concert.id) && (
                            <span className="notification-badge" title="Formulaire mis à jour"></span>
                          )}
                        </div>
                      )}
                      {!hasForm(concert.id) && concert.programmateurId && (
                        <ActionButton 
                          tooltip="Envoyer formulaire" 
                          icon={<i className="bi bi-envelope"></i>} 
                          variant="light"
                          onClick={() => navigate(`/concerts/${concert.id}?openFormGenerator=true`)}
                        />
                      )}
                      
                      {/* NOUVEAU BOUTON DE CONTRAT */}
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip>
                            {hasContract(concert.id) 
                              ? getContractTooltip(concert.id) 
                              : "Générer un contrat"}
                          </Tooltip>
                        }
                      >
                        <Link 
                          to={hasContract(concert.id) 
                            ? `/contrats/${concertsWithContracts[concert.id].id}` 
                            : `/contrats/generate/${concert.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className={`btn btn-${getContractButtonVariant(concert.id)} btn-icon modern-btn`}
                        >
                          <i className="bi bi-file-earmark-text"></i>
                        </Link>
                      </OverlayTrigger>
                      {/* FIN DU NOUVEAU BOUTON */}
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
