import { useState, useEffect, useCallback } from 'react';
import { formatDate } from '@/utils/dateUtils';
import { concertService } from '@/services/firestoreService.js';

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
