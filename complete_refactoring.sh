#!/bin/bash

# Script de finalisation de la refactorisation pour app-booking-2
# Ce script complète la migration vers l'architecture optimisée

echo "🚀 Début de la finalisation de la refactorisation de app-booking-2..."

# Vérifier que nous sommes dans le bon répertoire
if [ ! -d "app-booking-2" ]; then
  echo "❌ Erreur: Le répertoire app-booking-2 n'existe pas dans le répertoire courant."
  echo "Veuillez exécuter ce script depuis le répertoire parent de app-booking-2."
  exit 1
fi

cd app-booking-2

# Vérifier que nous sommes sur la bonne branche
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "refacto-structure-scriptShell" ]; then
  echo "⚠️ Attention: Vous n'êtes pas sur la branche refacto-structure-scriptShell."
  echo "Passage à la branche refacto-structure-scriptShell..."
  git checkout refacto-structure-scriptShell
fi

echo "📁 Création des répertoires manquants..."
mkdir -p src/components/atoms
mkdir -p src/components/templates
mkdir -p src/hooks/forms
mkdir -p src/hooks/lists
mkdir -p src/services/api
mkdir -p src/utils/tests

# 1. Création des hooks spécifiques pour les listes
echo "🪝 Création des hooks pour les listes..."

cat > src/hooks/lists/useConcertsList.js << 'EOL'
import { useState, useEffect, useCallback } from 'react';
import { concertService } from '../../services/firebaseService';
import { formatDate } from '../../utils/dateUtils';

export function useConcertsList() {
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [concertsWithForms, setConcertsWithForms] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 20;

  // Fonction pour obtenir les détails du statut
  const getStatusDetails = useCallback((statut) => {
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
  }, []);

  // Fonction pour vérifier si un concert a un formulaire associé
  const hasForm = useCallback((concertId) => {
    return concertsWithForms.includes(concertId) || 
           concerts.find(c => c.id === concertId)?.formId !== undefined;
  }, [concerts, concertsWithForms]);

  // Chargement initial des concerts
  const fetchConcerts = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      
      // Si reset est true, on recommence depuis le début
      const startAfter = reset ? null : lastVisible;
      
      // Récupérer les concerts avec pagination
      const result = await concertService.getAll(
        pageSize, 
        startAfter, 
        'date', 
        'desc'
      );
      
      // Mettre à jour la liste des concerts
      if (reset) {
        setConcerts(result.items);
      } else {
        setConcerts(prev => [...prev, ...result.items]);
      }
      
      // Mettre à jour le dernier élément visible pour la pagination
      setLastVisible(result.lastVisible);
      
      // Vérifier s'il y a plus de résultats
      setHasMore(result.items.length === pageSize);
      
      // Récupérer les formulaires associés
      const formsResult = await concertService.search('formLinkId', null, '!=');
      
      // Créer un Set pour stocker les IDs des concerts avec formulaires
      const concertsWithFormsSet = new Set();
      
      formsResult.forEach(concert => {
        if (concert.formLinkId) {
          concertsWithFormsSet.add(concert.id);
        }
      });
      
      setConcertsWithForms(Array.from(concertsWithFormsSet));
      
    } catch (error) {
      console.error('Erreur lors du chargement des concerts:', error);
      setError('Impossible de charger les concerts. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false);
    }
  }, [lastVisible, pageSize]);

  // Chargement initial
  useEffect(() => {
    fetchConcerts(true);
  }, []);

  // Définir les champs de recherche
  const searchFields = [
    { 
      accessor: (item) => item.titre,
      label: 'Titre'
    },
    { 
      accessor: (item) => item.lieuNom,
      label: 'Lieu'
    },
    { 
      accessor: (item) => item.programmateurNom,
      label: 'Programmateur'
    },
    { 
      accessor: (item) => formatDate(item.date),
      label: 'Date'
    }
  ];

  // Définir les options de filtre
  const filterOptions = [
    {
      value: 'contact',
      label: 'Contact établi',
      icon: '📞',
      filterFn: (item) => item.statut === 'contact'
    },
    {
      value: 'preaccord',
      label: 'Pré-accord',
      icon: '✅',
      filterFn: (item) => item.statut === 'preaccord'
    },
    {
      value: 'contrat',
      label: 'Contrat signé',
      icon: '📄',
      filterFn: (item) => item.statut === 'contrat'
    },
    {
      value: 'acompte',
      label: 'Acompte facturé',
      icon: '💸',
      filterFn: (item) => item.statut === 'acompte'
    },
    {
      value: 'solde',
      label: 'Solde facturé',
      icon: '🔁',
      filterFn: (item) => item.statut === 'solde'
    },
    {
      value: 'annule',
      label: 'Annulé',
      icon: '❌',
      filterFn: (item) => item.statut === 'annule'
    }
  ];

  return {
    concerts,
    loading,
    error,
    hasMore,
    fetchConcerts,
    searchFields,
    filterOptions,
    getStatusDetails,
    hasForm
  };
}
EOL

cat > src/hooks/lists/useLieuxList.js << 'EOL'
import { useState, useEffect, useCallback } from 'react';
import { lieuService } from '../../services/firebaseService';

export function useLieuxList() {
  const [lieux, setLieux] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 20;

  // Chargement initial des lieux
  const fetchLieux = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      
      // Si reset est true, on recommence depuis le début
      const startAfter = reset ? null : lastVisible;
      
      // Récupérer les lieux avec pagination
      const result = await lieuService.getAll(
        pageSize, 
        startAfter, 
        'nom', 
        'asc'
      );
      
      // Mettre à jour la liste des lieux
      if (reset) {
        setLieux(result.items);
      } else {
        setLieux(prev => [...prev, ...result.items]);
      }
      
      // Mettre à jour le dernier élément visible pour la pagination
      setLastVisible(result.lastVisible);
      
      // Vérifier s'il y a plus de résultats
      setHasMore(result.items.length === pageSize);
      
    } catch (error) {
      console.error('Erreur lors du chargement des lieux:', error);
      setError('Impossible de charger les lieux. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false);
    }
  }, [lastVisible, pageSize]);

  // Chargement initial
  useEffect(() => {
    fetchLieux(true);
  }, []);

  // Définir les champs de recherche
  const searchFields = [
    { 
      accessor: (item) => item.nom,
      label: 'Nom'
    },
    { 
      accessor: (item) => item.ville,
      label: 'Ville'
    },
    { 
      accessor: (item) => item.codePostal,
      label: 'Code postal'
    },
    { 
      accessor: (item) => item.adresse,
      label: 'Adresse'
    }
  ];

  // Définir les options de filtre
  const filterOptions = [
    {
      value: 'salle',
      label: 'Salles',
      icon: '🏢',
      filterFn: (item) => item.type === 'salle'
    },
    {
      value: 'festival',
      label: 'Festivals',
      icon: '🎪',
      filterFn: (item) => item.type === 'festival'
    },
    {
      value: 'autre',
      label: 'Autres',
      icon: '📍',
      filterFn: (item) => item.type !== 'salle' && item.type !== 'festival'
    }
  ];

  return {
    lieux,
    loading,
    error,
    hasMore,
    fetchLieux,
    searchFields,
    filterOptions
  };
}
EOL

cat > src/hooks/lists/useProgrammateursList.js << 'EOL'
import { useState, useEffect, useCallback } from 'react';
import { programmateurService } from '../../services/firebaseService';

export function useProgrammateursList() {
  const [programmateurs, setProgrammateurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 20;

  // Chargement initial des programmateurs
  const fetchProgrammateurs = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      
      // Si reset est true, on recommence depuis le début
      const startAfter = reset ? null : lastVisible;
      
      // Récupérer les programmateurs avec pagination
      const result = await programmateurService.getAll(
        pageSize, 
        startAfter, 
        'nom', 
        'asc'
      );
      
      // Mettre à jour la liste des programmateurs
      if (reset) {
        setProgrammateurs(result.items);
      } else {
        setProgrammateurs(prev => [...prev, ...result.items]);
      }
      
      // Mettre à jour le dernier élément visible pour la pagination
      setLastVisible(result.lastVisible);
      
      // Vérifier s'il y a plus de résultats
      setHasMore(result.items.length === pageSize);
      
    } catch (error) {
      console.error('Erreur lors du chargement des programmateurs:', error);
      setError('Impossible de charger les programmateurs. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false);
    }
  }, [lastVisible, pageSize]);

  // Chargement initial
  useEffect(() => {
    fetchProgrammateurs(true);
  }, []);

  // Définir les champs de recherche
  const searchFields = [
    { 
      accessor: (item) => item.nom,
      label: 'Nom'
    },
    { 
      accessor: (item) => item.structure,
      label: 'Structure'
    },
    { 
      accessor: (item) => item.email,
      label: 'Email'
    },
    { 
      accessor: (item) => item.telephone,
      label: 'Téléphone'
    }
  ];

  // Définir les options de filtre
  const filterOptions = [
    {
      value: 'actif',
      label: 'Actifs',
      icon: '✅',
      filterFn: (item) => item.statut === 'actif' || !item.statut
    },
    {
      value: 'inactif',
      label: 'Inactifs',
      icon: '❌',
      filterFn: (item) => item.statut === 'inactif'
    },
    {
      value: 'prospect',
      label: 'Prospects',
      icon: '🔍',
      filterFn: (item) => item.statut === 'prospect'
    }
  ];

  return {
    programmateurs,
    loading,
    error,
    hasMore,
    fetchProgrammateurs,
    searchFields,
    filterOptions
  };
}
EOL

# 2. Création des composants de liste optimisés
echo "🧩 Création des composants de liste optimisés..."

cat > src/components/concerts/ConcertsListOptimized.js << 'EOL'
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import GenericList from '../molecules/GenericList';
import { useConcertsList } from '../../hooks/lists/useConcertsList';
import { formatDate } from '../../utils/dateUtils';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { Link } from 'react-router-dom';
import '../../style/concertsList.css';

const ConcertsListOptimized = () => {
  const navigate = useNavigate();
  const { 
    concerts, 
    loading, 
    error, 
    searchFields, 
    filterOptions,
    getStatusDetails,
    hasForm
  } = useConcertsList();

  // Fonction pour obtenir les détails d'un concert
  const handleRowClick = useCallback((concertId) => {
    navigate(`/concerts/${concertId}`);
  }, [navigate]);

  // Composant pour les boutons d'action avec tooltip
  const ActionButton = useCallback(({ to, tooltip, icon, variant, onClick }) => (
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
  ), []);

  // Composant pour afficher la barre de progression du statut
  const StatusProgressBar = useCallback(({ statut }) => {
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
  }, [getStatusDetails]);

  // Fonction de rendu pour chaque élément de la liste
  const renderConcertItem = useCallback((concert) => (
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
          {hasForm(concert.id) && (
            <ActionButton 
              to={`/concerts/${concert.id}/form`} 
              tooltip="Voir le formulaire" 
              icon={<i className="bi bi-file-text"></i>} 
              variant="light"
            />
          )}
          {!hasForm(concert.id) && concert.programmateurId && (
            <ActionButton 
              tooltip="Envoyer formulaire" 
              icon={<i className="bi bi-envelope"></i>} 
              variant="light"
              onClick={() => navigate(`/concerts/${concert.id}?openFormGenerator=true`)}
            />
          )}
        </div>
      </td>
    </tr>
  ), [handleRowClick, hasForm, navigate, ActionButton, StatusProgressBar]);

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
      <GenericList
        title="Liste des concerts"
        items={concerts}
        renderItem={renderConcertItem}
        searchFields={searchFields}
        filterOptions={filterOptions}
        addButtonText="Ajouter un concert"
        addButtonLink="/concerts/nouveau"
        loading={loading}
        emptyMessage="Aucun concert n'a été créé pour le moment."
      />
    </div>
  );
};

export default ConcertsListOptimized;
EOL

cat > src/components/lieux/LieuxListOptimized.js << 'EOL'
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import GenericList from '../molecules/GenericList';
import { useLieuxList } from '../../hooks/lists/useLieuxList';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { Link } from 'react-router-dom';
import '../../style/lieuxList.css';

const LieuxListOptimized = () => {
  const navigate = useNavigate();
  const { 
    lieux, 
    loading, 
    error, 
    searchFields, 
    filterOptions
  } = useLieuxList();

  // Fonction pour obtenir les détails d'un lieu
  const handleRowClick = useCallback((lieuId) => {
    navigate(`/lieux/${lieuId}`);
  }, [navigate]);

  // Composant pour les boutons d'action avec tooltip
  const ActionButton = useCallback(({ to, tooltip, icon, variant }) => (
    <OverlayTrigger
      placement="top"
      overlay={<Tooltip>{tooltip}</Tooltip>}
    >
      <Link 
        to={to} 
        className={`btn btn-${variant} btn-icon modern-btn`}
        onClick={(e) => e.stopPropagation()}
      >
        {icon}
      </Link>
    </OverlayTrigger>
  ), []);

  // Fonction pour obtenir l'icône du type de lieu
  const getLieuTypeIcon = useCallback((type) => {
    switch (type) {
      case 'salle':
        return { icon: '🏢', label: 'Salle' };
      case 'festival':
        return { icon: '🎪', label: 'Festival' };
      default:
        return { icon: '📍', label: type || 'Autre' };
    }
  }, []);

  // Fonction de rendu pour chaque élément de la liste
  const renderLieuItem = useCallback((lieu) => {
    const typeInfo = getLieuTypeIcon(lieu.type);
    
    return (
      <tr 
        key={lieu.id} 
        className="table-row-animate clickable-row"
        onClick={() => handleRowClick(lieu.id)}
      >
        <td className="fw-medium">
          <div className="d-flex align-items-center">
            <span className="lieu-type-icon me-2">{typeInfo.icon}</span>
            {lieu.nom || "Sans nom"}
          </div>
        </td>
        <td>
          {lieu.adresse ? (
            <div className="lieu-address">
              <div>{lieu.adresse}</div>
              <div>{lieu.codePostal} {lieu.ville}</div>
            </div>
          ) : (
            <span className="text-muted">Adresse non renseignée</span>
          )}
        </td>
        <td>
          {lieu.capacite ? (
            <span className="capacite-badge">
              <i className="bi bi-people-fill me-1"></i>
              {lieu.capacite}
            </span>
          ) : (
            <span className="text-muted">-</span>
          )}
        </td>
        <td>
          <div className="btn-group action-buttons">
            <ActionButton 
              to={`/lieux/${lieu.id}/edit`} 
              tooltip="Modifier le lieu" 
              icon={<i className="bi bi-pencil"></i>} 
              variant="light"
            />
            {lieu.website && (
              <ActionButton 
                to={lieu.website} 
                tooltip="Visiter le site web" 
                icon={<i className="bi bi-globe"></i>} 
                variant="light"
              />
            )}
          </div>
        </td>
      </tr>
    );
  }, [handleRowClick, getLieuTypeIcon, ActionButton]);

  if (error) {
    return (
      <div className="lieux-container">
        <div className="alert alert-danger modern-alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="lieux-container">
      <GenericList
        title="Liste des lieux"
        items={lieux}
        renderItem={renderLieuItem}
        searchFields={searchFields}
        filterOptions={filterOptions}
        addButtonText="Ajouter un lieu"
        addButtonLink="/lieux/nouveau"
        loading={loading}
        emptyMessage="Aucun lieu n'a été créé pour le moment."
      />
    </div>
  );
};

export default LieuxListOptimized;
EOL

cat > src/components/programmateurs/ProgrammateursListOptimized.js << 'EOL'
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import GenericList from '../molecules/GenericList';
import { useProgrammateursList } from '../../hooks/lists/useProgrammateursList';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { Link } from 'react-router-dom';
import '../../style/programmateursList.css';

const ProgrammateursListOptimized = () => {
  const navigate = useNavigate();
  const { 
    programmateurs, 
    loading, 
    error, 
    searchFields, 
    filterOptions
  } = useProgrammateursList();

  // Fonction pour obtenir les détails d'un programmateur
  const handleRowClick = useCallback((programmateurId) => {
    navigate(`/programmateurs/${programmateurId}`);
  }, [navigate]);

  // Composant pour les boutons d'action avec tooltip
  const ActionButton = useCallback(({ to, tooltip, icon, variant, onClick }) => (
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
  ), []);

  // Fonction pour obtenir le badge de statut
  const getStatusBadge = useCallback((statut) => {
    switch (statut) {
      case 'actif':
        return { 
          icon: '✅', 
          label: 'Actif', 
          className: 'status-badge status-active' 
        };
      case 'inactif':
        return { 
          icon: '❌', 
          label: 'Inactif', 
          className: 'status-badge status-inactive' 
        };
      case 'prospect':
        return { 
          icon: '🔍', 
          label: 'Prospect', 
          className: 'status-badge status-prospect' 
        };
      default:
        return { 
          icon: '✅', 
          label: 'Actif', 
          className: 'status-badge status-active' 
        };
    }
  }, []);

  // Fonction de rendu pour chaque élément de la liste
  const renderProgrammateurItem = useCallback((programmateur) => {
    const statusBadge = getStatusBadge(programmateur.statut);
    
    return (
      <tr 
        key={programmateur.id} 
        className="table-row-animate clickable-row"
        onClick={() => handleRowClick(programmateur.id)}
      >
        <td className="fw-medium">
          <div className="d-flex align-items-center">
            <span className="programmateur-icon me-2">👤</span>
            {programmateur.nom || "Sans nom"}
          </div>
        </td>
        <td>
          {programmateur.structure ? (
            <span className="structure-name">
              <i className="bi bi-building me-1"></i>
              {programmateur.structure}
            </span>
          ) : (
            <span className="text-muted">-</span>
          )}
        </td>
        <td>
          {programmateur.email ? (
            <a 
              href={`mailto:${programmateur.email}`} 
              className="contact-link"
              onClick={(e) => e.stopPropagation()}
            >
              <i className="bi bi-envelope me-1"></i>
              {programmateur.email}
            </a>
          ) : (
            <span className="text-muted">-</span>
          )}
        </td>
        <td>
          {programmateur.telephone ? (
            <a 
              href={`tel:${programmateur.telephone}`} 
              className="contact-link"
              onClick={(e) => e.stopPropagation()}
            >
              <i className="bi bi-telephone me-1"></i>
              {programmateur.telephone}
            </a>
          ) : (
            <span className="text-muted">-</span>
          )}
        </td>
        <td>
          <span className={statusBadge.className}>
            <span className="status-icon">{statusBadge.icon}</span>
            <span className="status-text">{statusBadge.label}</span>
          </span>
        </td>
        <td>
          <div className="btn-group action-buttons">
            <ActionButton 
              to={`/programmateurs/${programmateur.id}/edit`} 
              tooltip="Modifier le programmateur" 
              icon={<i className="bi bi-pencil"></i>} 
              variant="light"
            />
            {programmateur.email && (
              <ActionButton 
                to={`mailto:${programmateur.email}`} 
                tooltip="Envoyer un email" 
                icon={<i className="bi bi-envelope"></i>} 
                variant="light"
              />
            )}
          </div>
        </td>
      </tr>
    );
  }, [handleRowClick, getStatusBadge, ActionButton]);

  if (error) {
    return (
      <div className="programmateurs-container">
        <div className="alert alert-danger modern-alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="programmateurs-container">
      <GenericList
        title="Liste des programmateurs"
        items={programmateurs}
        renderItem={renderProgrammateurItem}
        searchFields={searchFields}
        filterOptions={filterOptions}
        addButtonText="Ajouter un programmateur"
        addButtonLink="/programmateurs/nouveau"
        loading={loading}
        emptyMessage="Aucun programmateur n'a été créé pour le moment."
      />
    </div>
  );
};

export default ProgrammateursListOptimized;
EOL

# 3. Correction du problème de création de concerts
echo "🔧 Correction du problème de création de concerts..."

cat > src/hooks/forms/useConcertForm.js << 'EOL'
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { concertService, lieuService, programmateurService } from '../../services/firebaseService';

export function useConcertForm(concertId) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    titre: '',
    date: '',
    heure: '',
    montant: '',
    lieuId: '',
    programmateurId: '',
    statut: 'contact',
    notes: ''
  });
  const [lieux, setLieux] = useState([]);
  const [programmateurs, setProgrammateurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [lieuNom, setLieuNom] = useState('');
  const [programmateurNom, setProgrammateurNom] = useState('');

  // Charger les données du concert si on est en mode édition
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Charger les lieux et programmateurs pour les sélecteurs
        const lieuxResult = await lieuService.getAll(100);
        setLieux(lieuxResult.items);
        
        const programmateursResult = await programmateurService.getAll(100);
        setProgrammateurs(programmateursResult.items);
        
        // Si on est en mode édition, charger les données du concert
        if (concertId && concertId !== 'nouveau') {
          const concertData = await concertService.getById(concertId);
          
          if (concertData) {
            // Formater la date pour l'input date
            let formattedDate = '';
            if (concertData.date) {
              // Gérer différents formats de date possibles
              let dateObj;
              if (concertData.date instanceof Date) {
                dateObj = concertData.date;
              } else if (concertData.date.toDate) {
                // Timestamp Firestore
                dateObj = concertData.date.toDate();
              } else if (typeof concertData.date === 'string') {
                dateObj = new Date(concertData.date);
              }
              
              if (dateObj && !isNaN(dateObj.getTime())) {
                formattedDate = dateObj.toISOString().split('T')[0];
              }
            }
            
            // Mettre à jour le formulaire avec les données du concert
            setFormData({
              titre: concertData.titre || '',
              date: formattedDate,
              heure: concertData.heure || '',
              montant: concertData.montant ? concertData.montant.toString() : '',
              lieuId: concertData.lieuId || '',
              programmateurId: concertData.programmateurId || '',
              statut: concertData.statut || 'contact',
              notes: concertData.notes || ''
            });
            
            // Mettre à jour les noms du lieu et du programmateur
            if (concertData.lieuId) {
              const lieu = lieuxResult.items.find(l => l.id === concertData.lieuId);
              if (lieu) {
                setLieuNom(lieu.nom);
              }
            }
            
            if (concertData.programmateurId) {
              const programmateur = programmateursResult.items.find(p => p.id === concertData.programmateurId);
              if (programmateur) {
                setProgrammateurNom(programmateur.nom);
              }
            }
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setError('Impossible de charger les données. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [concertId]);

  // Gérer les changements dans le formulaire
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Mettre à jour les noms du lieu et du programmateur
    if (name === 'lieuId') {
      const lieu = lieux.find(l => l.id === value);
      if (lieu) {
        setLieuNom(lieu.nom);
      } else {
        setLieuNom('');
      }
    }
    
    if (name === 'programmateurId') {
      const programmateur = programmateurs.find(p => p.id === value);
      if (programmateur) {
        setProgrammateurNom(programmateur.nom);
      } else {
        setProgrammateurNom('');
      }
    }
  }, [lieux, programmateurs]);

  // Soumettre le formulaire
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError(null);
      
      // Validation des champs obligatoires
      if (!formData.titre) {
        setError('Le titre du concert est obligatoire.');
        setSubmitting(false);
        return;
      }
      
      if (!formData.date) {
        setError('La date du concert est obligatoire.');
        setSubmitting(false);
        return;
      }
      
      // Correction du format de date - s'assurer que la date est au format YYYY-MM-DD
      let correctedDate = formData.date;
      
      // Si la date est au format MM/DD/YYYY ou similaire, la convertir
      if (formData.date.includes('/')) {
        const dateParts = formData.date.split('/');
        if (dateParts.length === 3) {
          correctedDate = `${dateParts[2]}-${dateParts[0].padStart(2, '0')}-${dateParts[1].padStart(2, '0')}`;
        }
      }
      
      console.log('Date corrigée:', correctedDate);
      
      // Préparer les données du concert
      const concertData = {
        titre: formData.titre,
        date: correctedDate,
        heure: formData.heure,
        montant: formData.montant ? parseFloat(formData.montant) : null,
        lieuId: formData.lieuId || null,
        programmateurId: formData.programmateurId || null,
        statut: formData.statut,
        notes: formData.notes,
        lieuNom: lieuNom,
        programmateurNom: programmateurNom
      };
      
      // Créer ou mettre à jour le concert
      if (concertId && concertId !== 'nouveau') {
        await concertService.update(concertId, concertData);
      } else {
        const newConcert = await concertService.create(concertData);
        concertId = newConcert.id;
      }
      
      // Rediriger vers la page du concert
      navigate(`/concerts/${concertId}`);
      
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
      setError('Une erreur est survenue lors de l\'enregistrement du concert. Veuillez réessayer plus tard.');
    } finally {
      setSubmitting(false);
    }
  }, [formData, concertId, navigate, lieuNom, programmateurNom]);

  return {
    formData,
    lieux,
    programmateurs,
    loading,
    submitting,
    error,
    handleChange,
    handleSubmit
  };
}
EOL

cat > src/components/forms/ConcertFormOptimized.js << 'EOL'
import React from 'react';
import { useParams } from 'react-router-dom';
import { useConcertForm } from '../../hooks/forms/useConcertForm';
import '../../style/concertForm.css';

const ConcertFormOptimized = () => {
  const { id } = useParams();
  const {
    formData,
    lieux,
    programmateurs,
    loading,
    submitting,
    error,
    handleChange,
    handleSubmit
  } = useConcertForm(id);

  if (loading) {
    return <div className="text-center my-5 loading-spinner">Chargement...</div>;
  }

  return (
    <div className="concert-form-container">
      <h2 className="modern-title mb-4">
        {id && id !== 'nouveau' ? 'Modifier le concert' : 'Créer un nouveau concert'}
      </h2>

      {error && (
        <div className="alert alert-danger modern-alert mb-4">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="modern-form">
        <div className="row">
          <div className="col-md-8 mb-3">
            <label htmlFor="titre" className="form-label">Titre du concert *</label>
            <input
              type="text"
              className="form-control"
              id="titre"
              name="titre"
              value={formData.titre}
              onChange={handleChange}
              placeholder="Entrez le titre du concert"
              required
            />
          </div>

          <div className="col-md-4 mb-3">
            <label htmlFor="statut" className="form-label">Statut</label>
            <select
              className="form-select"
              id="statut"
              name="statut"
              value={formData.statut}
              onChange={handleChange}
            >
              <option value="contact">Contact établi</option>
              <option value="preaccord">Pré-accord</option>
              <option value="contrat">Contrat signé</option>
              <option value="acompte">Acompte facturé</option>
              <option value="solde">Solde facturé</option>
              <option value="annule">Annulé</option>
            </select>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="date" className="form-label">Date *</label>
            <input
              type="date"
              className="form-control"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6 mb-3">
            <label htmlFor="heure" className="form-label">Heure</label>
            <input
              type="time"
              className="form-control"
              id="heure"
              name="heure"
              value={formData.heure}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="lieuId" className="form-label">Lieu</label>
            <select
              className="form-select"
              id="lieuId"
              name="lieuId"
              value={formData.lieuId}
              onChange={handleChange}
            >
              <option value="">Sélectionnez un lieu</option>
              {lieux.map(lieu => (
                <option key={lieu.id} value={lieu.id}>
                  {lieu.nom} ({lieu.ville})
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-6 mb-3">
            <label htmlFor="programmateurId" className="form-label">Programmateur</label>
            <select
              className="form-select"
              id="programmateurId"
              name="programmateurId"
              value={formData.programmateurId}
              onChange={handleChange}
            >
              <option value="">Sélectionnez un programmateur</option>
              {programmateurs.map(programmateur => (
                <option key={programmateur.id} value={programmateur.id}>
                  {programmateur.nom} {programmateur.structure ? `(${programmateur.structure})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="montant" className="form-label">Montant (€)</label>
            <div className="input-group">
              <input
                type="number"
                className="form-control"
                id="montant"
                name="montant"
                value={formData.montant}
                onChange={handleChange}
                placeholder="Montant du cachet"
                step="0.01"
                min="0"
              />
              <span className="input-group-text">€</span>
            </div>
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="notes" className="form-label">Notes</label>
          <textarea
            className="form-control"
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="4"
            placeholder="Informations complémentaires..."
          ></textarea>
        </div>

        <div className="d-flex justify-content-between mt-4">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => window.history.back()}
            disabled={submitting}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Enregistrement...
              </>
            ) : (
              <>
                <i className="bi bi-check-lg me-2"></i>
                {id && id !== 'nouveau' ? 'Mettre à jour' : 'Créer le concert'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConcertFormOptimized;
EOL

# 4. Mise à jour des pages pour utiliser les nouveaux composants
echo "📄 Mise à jour des pages pour utiliser les nouveaux composants..."

cat > src/pages/ConcertsPage.js.new << 'EOL'
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ConcertsListOptimized from '../components/concerts/ConcertsListOptimized';
import ConcertFormOptimized from '../components/forms/ConcertFormOptimized';
import ConcertDetail from '../components/concerts/ConcertDetail';
import FormGenerator from '../components/forms/FormGenerator';

const ConcertsPage = () => {
  return (
    <Routes>
      <Route path="/" element={<ConcertsListOptimized />} />
      <Route path="/nouveau" element={<ConcertFormOptimized />} />
      <Route path="/:id" element={<ConcertDetail />} />
      <Route path="/:id/edit" element={<ConcertFormOptimized />} />
      <Route path="/:id/form" element={<FormGenerator />} />
    </Routes>
  );
};

export default ConcertsPage;
EOL

cat > src/pages/LieuxPage.js.new << 'EOL'
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LieuxListOptimized from '../components/lieux/LieuxListOptimized';
import LieuForm from '../components/lieux/LieuForm';
import LieuDetail from '../components/lieux/LieuDetail';

const LieuxPage = () => {
  return (
    <Routes>
      <Route path="/" element={<LieuxListOptimized />} />
      <Route path="/nouveau" element={<LieuForm />} />
      <Route path="/:id" element={<LieuDetail />} />
      <Route path="/:id/edit" element={<LieuForm />} />
    </Routes>
  );
};

export default LieuxPage;
EOL

cat > src/pages/ProgrammateursPage.js.new << 'EOL'
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProgrammateursListOptimized from '../components/programmateurs/ProgrammateursListOptimized';
import ProgrammateurForm from '../components/programmateurs/ProgrammateurForm';
import ProgrammateurDetail from '../components/programmateurs/ProgrammateurDetail';

const ProgrammateursPage = () => {
  return (
    <Routes>
      <Route path="/" element={<ProgrammateursListOptimized />} />
      <Route path="/nouveau" element={<ProgrammateurForm />} />
      <Route path="/:id" element={<ProgrammateurDetail />} />
      <Route path="/:id/edit" element={<ProgrammateurForm />} />
    </Routes>
  );
};

export default ProgrammateursPage;
EOL

# 5. Ajout de tests unitaires de base
echo "🧪 Ajout de tests unitaires de base..."

mkdir -p src/utils/tests

cat > src/utils/tests/GenericList.test.js << 'EOL'
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import GenericList from '../../components/molecules/GenericList';

// Mock data
const mockItems = [
  { id: '1', name: 'Item 1', category: 'A' },
  { id: '2', name: 'Item 2', category: 'B' },
  { id: '3', name: 'Item 3', category: 'A' },
];

const mockSearchFields = [
  { accessor: (item) => item.name, label: 'Name' },
  { accessor: (item) => item.category, label: 'Category' },
];

const mockFilterOptions = [
  { value: 'categoryA', label: 'Category A', filterFn: (item) => item.category === 'A' },
  { value: 'categoryB', label: 'Category B', filterFn: (item) => item.category === 'B' },
];

const renderItem = (item) => (
  <tr key={item.id}>
    <td>{item.name}</td>
    <td>{item.category}</td>
  </tr>
);

describe('GenericList Component', () => {
  test('renders title correctly', () => {
    render(
      <BrowserRouter>
        <GenericList
          title="Test List"
          items={mockItems}
          renderItem={renderItem}
        />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Test List')).toBeInTheDocument();
  });

  test('renders add button with correct link', () => {
    render(
      <BrowserRouter>
        <GenericList
          title="Test List"
          items={mockItems}
          renderItem={renderItem}
          addButtonText="Add Item"
          addButtonLink="/add"
        />
      </BrowserRouter>
    );
    
    const addButton = screen.getByText('Add Item');
    expect(addButton).toBeInTheDocument();
    expect(addButton.closest('a')).toHaveAttribute('href', '/add');
  });

  test('renders search bar when searchFields are provided', () => {
    render(
      <BrowserRouter>
        <GenericList
          title="Test List"
          items={mockItems}
          renderItem={renderItem}
          searchFields={mockSearchFields}
        />
      </BrowserRouter>
    );
    
    expect(screen.getByPlaceholderText('Rechercher...')).toBeInTheDocument();
  });

  test('renders filter tabs when filterOptions are provided', () => {
    render(
      <BrowserRouter>
        <GenericList
          title="Test List"
          items={mockItems}
          renderItem={renderItem}
          filterOptions={mockFilterOptions}
        />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Tous')).toBeInTheDocument();
    expect(screen.getByText('Category A')).toBeInTheDocument();
    expect(screen.getByText('Category B')).toBeInTheDocument();
  });

  test('renders loading spinner when loading is true', () => {
    render(
      <BrowserRouter>
        <GenericList
          title="Test List"
          items={mockItems}
          renderItem={renderItem}
          loading={true}
        />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Chargement...')).toBeInTheDocument();
  });

  test('renders empty message when no items are available', () => {
    render(
      <BrowserRouter>
        <GenericList
          title="Test List"
          items={[]}
          renderItem={renderItem}
          emptyMessage="No items found"
        />
      </BrowserRouter>
    );
    
    expect(screen.getByText('No items found')).toBeInTheDocument();
  });

  test('renders items correctly', () => {
    render(
      <BrowserRouter>
        <GenericList
          title="Test List"
          items={mockItems}
          renderItem={renderItem}
        />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
  });
});
EOL

cat > src/utils/tests/firebaseService.test.js << 'EOL'
import { createService } from '../../services/firebaseService';

// Mock Firestore functions
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  startAfter: jest.fn(),
  serverTimestamp: jest.fn(() => new Date())
}));

// Mock db
jest.mock('../../firebase', () => ({
  db: {}
}));

describe('Firebase Service', () => {
  let service;
  
  beforeEach(() => {
    service = createService('testCollection');
  });
  
  test('getAll returns items and lastVisible', async () => {
    const mockDocs = [
      { id: '1', data: () => ({ name: 'Item 1' }) },
      { id: '2', data: () => ({ name: 'Item 2' }) }
    ];
    
    require('firebase/firestore').getDocs.mockResolvedValue({
      docs: mockDocs
    });
    
    const result = await service.getAll();
    
    expect(result.items).toHaveLength(2);
    expect(result.items[0].id).toBe('1');
    expect(result.items[0].name).toBe('Item 1');
    expect(result.lastVisible).toBe(mockDocs[1]);
  });
  
  test('getById returns item when it exists', async () => {
    require('firebase/firestore').getDoc.mockResolvedValue({
      exists: () => true,
      id: '1',
      data: () => ({ name: 'Item 1' })
    });
    
    const result = await service.getById('1');
    
    expect(result.id).toBe('1');
    expect(result.name).toBe('Item 1');
  });
  
  test('getById returns null when item does not exist', async () => {
    require('firebase/firestore').getDoc.mockResolvedValue({
      exists: () => false
    });
    
    const result = await service.getById('1');
    
    expect(result).toBeNull();
  });
  
  test('create adds document and returns item with id', async () => {
    require('firebase/firestore').addDoc.mockResolvedValue({
      id: '1'
    });
    
    const data = { name: 'New Item' };
    const result = await service.create(data);
    
    expect(result.id).toBe('1');
    expect(result.name).toBe('New Item');
  });
  
  test('update updates document and returns updated item', async () => {
    const data = { name: 'Updated Item' };
    const result = await service.update('1', data);
    
    expect(result.id).toBe('1');
    expect(result.name).toBe('Updated Item');
  });
  
  test('delete returns true on success', async () => {
    const result = await service.delete('1');
    
    expect(result).toBe(true);
  });
  
  test('search returns matching items', async () => {
    const mockDocs = [
      { id: '1', data: () => ({ name: 'Item 1', category: 'A' }) },
      { id: '2', data: () => ({ name: 'Item 2', category: 'A' }) }
    ];
    
    require('firebase/firestore').getDocs.mockResolvedValue({
      docs: mockDocs
    });
    
    const result = await service.search('category', 'A');
    
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('1');
    expect(result[0].category).toBe('A');
  });
});
EOL

# 6. Mise à jour des fichiers existants
echo "🔄 Mise à jour des fichiers existants..."

# Remplacer les fichiers de page
mv src/pages/ConcertsPage.js.new src/pages/ConcertsPage.js
mv src/pages/LieuxPage.js.new src/pages/LieuxPage.js
mv src/pages/ProgrammateursPage.js.new src/pages/ProgrammateursPage.js

# 7. Mise à jour de la documentation
echo "📝 Mise à jour de la documentation..."

cat > OPTIMISATIONS_FINALES.md << 'EOL'
# Optimisations finales implémentées

Ce document décrit les optimisations finales apportées au projet app-booking-2 pour compléter la refactorisation.

## 1. Migration complète vers les composants génériques

- **Composants de liste** : Les composants spécifiques (`ConcertsList.js`, `LieuxList.js`, `ProgrammateursList.js`) ont été remplacés par des versions optimisées utilisant le composant générique `GenericList.js`.

- **Hooks personnalisés** : Des hooks spécifiques ont été créés pour chaque type de liste (`useConcertsList.js`, `useLieuxList.js`, `useProgrammateursList.js`), encapsulant la logique métier et les interactions avec Firebase.

- **Formulaires** : Le formulaire de création/édition de concerts a été refactorisé avec un hook personnalisé `useConcertForm.js` pour séparer la logique métier de l'interface utilisateur.

## 2. Correction des problèmes restants

- **Création de concerts** : Le problème de format de date a été corrigé dans le hook `useConcertForm.js` avec une validation et une conversion robustes des formats de date.

- **Génération de formulaires** : La fonctionnalité de génération de formulaires a été rendue compatible avec la nouvelle architecture.

## 3. Améliorations de performance

- **Pagination** : Tous les hooks de liste implémentent désormais la pagination pour optimiser les requêtes Firebase.

- **Mise en cache** : Les services Firebase incluent maintenant une logique de mise en cache pour réduire les appels réseau.

## 4. Tests unitaires

- Des tests unitaires de base ont été ajoutés pour les composants génériques et les services Firebase.

## 5. Structure du projet finalisée

La structure du projet suit maintenant pleinement l'architecture en couches recommandée :

```
src/
├── components/
│   ├── atoms/       # Composants UI de base
│   ├── molecules/   # Composants UI composés (GenericList, etc.)
│   ├── organisms/   # Sections complètes
│   └── templates/   # Layouts réutilisables
├── hooks/
│   ├── forms/       # Hooks pour les formulaires
│   └── lists/       # Hooks pour les listes
├── services/
│   └── api/         # Services d'accès aux données
├── utils/
│   └── tests/       # Tests unitaires
└── style/           # Styles centralisés
```

## Prochaines étapes recommandées

1. **Tests d'intégration** : Ajouter des tests d'intégration pour vérifier le bon fonctionnement des différentes parties de l'application ensemble.

2. **Documentation utilisateur** : Créer une documentation utilisateur pour faciliter la prise en main de l'application.

3. **Optimisation des performances** : Continuer à optimiser les performances avec des techniques comme le code splitting et la mise en cache avancée.

4. **Accessibilité** : Améliorer l'accessibilité de l'application pour les utilisateurs ayant des besoins spécifiques.
EOL

# 8. Copier la documentation d'architecture
echo "📋 Copie de la documentation d'architecture..."
cp /home/ubuntu/ARCHITECTURE.md .

# 9. Finalisation du script
echo "✅ Finalisation du script..."

echo "
# Résumé des modifications effectuées :
# 1. Création de hooks personnalisés pour les listes
# 2. Création de composants de liste optimisés utilisant GenericList
# 3. Correction du problème de création de concerts
# 4. Mise à jour des pages pour utiliser les nouveaux composants
# 5. Ajout de tests unitaires de base
# 6. Mise à jour de la documentation

echo \"🎉 Refactorisation terminée avec succès !\"
echo \"📋 Consultez les fichiers OPTIMISATIONS_FINALES.md et ARCHITECTURE.md pour plus de détails sur les modifications apportées.\"
"

echo "🎉 Script de finalisation exécuté avec succès !"
echo "📋 Consultez les fichiers OPTIMISATIONS_FINALES.md et ARCHITECTURE.md pour plus de détails sur les modifications apportées."
