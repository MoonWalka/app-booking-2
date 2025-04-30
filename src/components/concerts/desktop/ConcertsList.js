import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import firebase from '@/firebaseInit';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import Spinner from '@/components/common/Spinner';
import { formatDateFr } from '@/utils/dateUtils';
// Correction UI: Import du fichier CSS centralisé pour les concerts
import '@/styles/components/concerts.css';

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
        const concertsRef = firebase.collection(firebase.db, 'concerts');
        const q = firebase.query(concertsRef, firebase.orderBy('date', 'desc'));
        const querySnapshot = await firebase.getDocs(q);

        const concertsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setConcerts(concertsData);
        setFilteredConcerts(concertsData);

        // Récupérer les ID des concerts qui ont des formulaires associés
        const formsRef = firebase.collection(firebase.db, 'formLinks');
        const formsSnapshot = await firebase.getDocs(formsRef);
        
        // Créer un Set pour stocker les IDs des concerts avec formulaires
        const concertsWithFormsSet = new Set();
        
        formsSnapshot.forEach(doc => {
          const formData = doc.data();
          if (formData.concertId) {
            concertsWithFormsSet.add(formData.concertId);
          }
        });
        
        // Récupérer les soumissions de formulaires
        const formSubmissionsRef = firebase.collection(firebase.db, 'formSubmissions');
        const submissionsSnapshot = await firebase.getDocs(formSubmissionsRef);
        
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
        const contratsRef = firebase.collection(firebase.db, 'contrats');
        const contratsSnapshot = await firebase.getDocs(contratsRef);
        
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

  // Fonction pour obtenir les détails d'un concert
  const handleRowClick = (concertId) => {
    navigate(`/concerts/${concertId}`);
  };

  // Composant pour les boutons d'action avec tooltip (version corrigée)
  // Correction UI: Utilisation de classes standardisées pour les boutons d'action
  const ActionButton = ({ to, tooltip, icon, variant, onClick }) => (
    <OverlayTrigger
      placement="top"
      overlay={<Tooltip>{tooltip}</Tooltip>}
    >
      {to ? (
        <Link 
          to={to} 
          className={`btn btn-${variant} action-button`}
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
          className={`btn btn-${variant} action-button`}
        >
          {icon}
        </button>
      )}
    </OverlayTrigger>
  );
  
  // Correction UI: Utilisation de useMemo pour éviter les appels redondants à getStatusDetails
  const statusDetailsMap = useMemo(() => ({
    contact: {
      icon: '📞',
      label: 'Contact établi',
      variant: 'info',
      tooltip: 'Premier contact établi avec le programmateur',
      step: 1
    },
    preaccord: {
      icon: '✅',
      label: 'Pré-accord',
      variant: 'primary',
      tooltip: 'Accord verbal obtenu, en attente de confirmation',
      step: 2
    },
    contrat: {
      icon: '📄',
      label: 'Contrat signé',
      variant: 'success',
      tooltip: 'Contrat signé par toutes les parties',
      step: 3
    },
    acompte: {
      icon: '💸',
      label: 'Acompte facturé',
      variant: 'warning',
      tooltip: 'Acompte facturé, en attente de paiement',
      step: 4
    },
    solde: {
      icon: '🔁',
      label: 'Solde facturé',
      variant: 'secondary',
      tooltip: 'Solde facturé, concert terminé',
      step: 5
    },
    annule: {
      icon: '❌',
      label: 'Annulé',
      variant: 'danger',
      tooltip: 'Concert annulé',
      step: 0
    }
  }), []);
  
  // Correction UI: Fonction optimisée pour récupérer les détails du statut
  const getStatusDetails = (statut) => {
    return statusDetailsMap[statut] || {
      icon: '❓',
      label: statut || 'Non défini',
      variant: 'light',
      tooltip: 'Statut non défini',
      step: 0
    };
  };
  
  // Correction UI: Composant simplifié pour afficher le statut avec meilleure performance
  const StatusWithInfo = ({ concert }) => {
    const today = new Date();
    const concertDate = concert.date ? new Date(concert.date.seconds ? concert.date.seconds * 1000 : concert.date) : null;
    const isPastDate = concertDate && concertDate < today;
    
    const statusMessage = (() => {
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
    })();
    
    const statusDetails = getStatusDetails(concert.statut);
    
    return (
      <div className="status-advanced-container">
        <div className="status-message-container">
          {/* Correction UI: Utilisation de classes CSS standardisées */}
          <div className={`status-message status-message-${statusDetails.variant}`}>
            {statusMessage.message}
          </div>
        </div>
        {!hasForm(concert.id) && concert.programmateurId && (
          <div className="action-reminder">
            <i className="bi bi-exclamation-circle"></i>
            <span>Formulaire à envoyer</span>
          </div>
        )}
        {hasUnvalidatedForm(concert.id) && (
          <div className="action-reminder">
            <i className="bi bi-exclamation-circle"></i>
            <span>Formulaire à valider</span>
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

  const isDatePassed = (date) => {
    const today = new Date();
    const concertDate = new Date(date.seconds ? date.seconds * 1000 : date);
    return concertDate < today;
  };

  if (loading) {
    return <Spinner message="Chargement des concerts..." contentOnly={true} />;
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
    <div className="concerts-container p-4">
      <div className="d-flex justify-content-between align-items-center mb-4 header-container">
        <h2 className="fs-4 fw-bold text-primary mb-0">Liste des concerts</h2>
        <Link to="/concerts/nouveau" className="btn btn-primary d-flex align-items-center gap-2 px-3 py-2 rounded-3">
          <i className="bi bi-plus-lg"></i>
          Ajouter un concert
        </Link>
      </div>

      <div className="search-filter-container">
        <div className="search-bar bg-white rounded-3 shadow-sm">
          <div className="input-group border-0">
            <span className="input-group-text bg-transparent border-0">
              <i className="bi bi-search text-primary"></i>
            </span>
            <input
              type="text"
              className="form-control border-0 py-2 search-input"
              placeholder="Rechercher un concert..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                className="btn border-0 text-secondary" 
                onClick={() => setSearchTerm('')}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            )}
          </div>
        </div>
      </div>
  
      <div className="status-filter-tabs">
        {/* Correction UI: Utilisation de classes standardisées pour les filtres */}
        <button 
          className={`btn ${statusFilter === 'tous' ? 'btn-primary' : 'btn-light'} rounded-pill px-3 py-2`}
          onClick={() => setStatusFilter('tous')}
        >
          Tous les concerts
        </button>
        {Object.keys(statusDetailsMap).map(status => {
          const statusInfo = statusDetailsMap[status];
          return (
            <button 
              key={status}
              className={`btn ${statusFilter === status ? 'btn-primary' : 'btn-light'} rounded-pill px-3 py-2 d-flex align-items-center gap-2`}
              onClick={() => setStatusFilter(status)}
            >
              <span className="status-icon">{statusInfo.icon}</span>
              {statusInfo.label}
            </button>
          );
        })}
      </div>
  
      {filteredConcerts.length === 0 ? (
        <div className="alert bg-white text-secondary border-0 shadow-sm rounded-4 p-4">
          <div className="d-flex align-items-center">
            <i className="bi bi-info-circle fs-3 me-3 text-primary"></i>
            <p className="mb-0">
              {searchTerm || statusFilter !== 'tous' 
                ? 'Aucun concert ne correspond à vos critères de recherche.' 
                : 'Aucun concert n\'a été créé pour le moment.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="table-responsive bg-white rounded-4 shadow-sm p-3">
          <table className="table table-hover concerts-table">
            <thead>
              <tr className="text-secondary border-bottom">
                <th className="fw-medium text-center">Date</th>
                <th className="fw-medium">Lieu</th>
                <th className="fw-medium">Ville</th>
                <th className="fw-medium">Artiste</th>
                <th className="fw-medium">Programmateur</th>
                <th className="fw-medium text-end">Montant</th>
                <th className="fw-medium text-center">Statut</th>
                <th className="fw-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredConcerts.map(concert => (
                <tr 
                  key={concert.id} 
                  className={`tc-clickable-row border-bottom ${isDatePassed(concert.date) ? 'past-concert' : ''}`}
                  onClick={() => handleRowClick(concert.id)}
                >
                  <td className={`concert-date-cell text-center align-middle ${isDatePassed(concert.date) ? 'past-date' : ''}`}>
                    <div className="date-box">
                      <span className="date-day">{formatDateFr(concert.date).split('-')[0]}</span>
                      <span className="date-separator">/</span>
                      <span className="date-month">{formatDateFr(concert.date).split('-')[1]}</span>
                      <span className="date-separator">/</span>
                      <span className="date-year">{formatDateFr(concert.date).split('-')[2]}</span>
                    </div>
                  </td>
                  <td className="concert-venue-name align-middle">
                    <div className="text-truncate-container" title={concert.lieuNom || "-"}>
                      {concert.lieuNom || "-"}
                    </div>
                  </td>
                  <td className="concert-venue-location align-middle">
                    <div className="text-truncate-container" title={concert.lieuVille && concert.lieuCodePostal ? 
                      `${concert.lieuVille} (${concert.lieuCodePostal})` : 
                      concert.lieuVille || concert.lieuCodePostal || "-"}>
                      {concert.lieuVille && concert.lieuCodePostal ? 
                        `${concert.lieuVille} (${concert.lieuCodePostal})` : 
                        concert.lieuVille || concert.lieuCodePostal || "-"
                      }
                    </div>
                  </td>
                  <td className="concert-artist-cell align-middle">
                    {concert.artisteNom ? (
                      <span className="artist-name">
                        <i className="bi bi-music-note"></i>
                        {concert.artisteNom}
                      </span>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td className="align-middle">
                    <div className="concert-artist-cell">
                      {concert.programmateurNom ? (
                        <span className="programmateur-name" title={concert.programmateurNom}>
                          <i className="bi bi-person-fill"></i>
                          {concert.programmateurNom}
                        </span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </div>
                  </td>
                  <td className="montant-column text-end align-middle">
                    {concert.montant ? (
                      <span className="montant-value">
                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(concert.montant)}
                      </span>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td className="status-column align-middle">
                    <StatusWithInfo concert={concert} />
                  </td>
                  <td onClick={(e) => e.stopPropagation()} className="align-middle">
                    <div className="d-flex gap-2 justify-content-center">
                      {hasForm(concert.id) && (
                        <div className="tc-notification-container">
                          <ActionButton 
                            to={`/concerts/${concert.id}/form`} 
                            tooltip="Voir le formulaire" 
                            icon={<i className="bi bi-file-text"></i>} 
                            variant="light"
                          />
                          {/* Correction UI: Utilisation d'une classe CSS plutôt qu'un style inline */}
                          {hasUnvalidatedForm(concert.id) && (
                            <span className="tc-notification-badge" title="Formulaire mis à jour"></span>
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
                          className={`btn btn-${getContractButtonVariant(concert.id)} action-button`}
                        >
                          <i className="bi bi-file-earmark-text"></i>
                        </Link>
                      </OverlayTrigger>
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
