/**
 * @fileoverview Hook de gestion de la liste des concerts avec pagination et filtres
 * Fournit une interface complète pour afficher, rechercher et filtrer les concerts
 * avec gestion des statuts, formulaires associés et pagination optimisée.
 * 
 * @author TourCraft Team
 * @since 2024
 */

import { useState, useEffect, useCallback } from 'react';
import { formatDate } from '@/utils/dateUtils';
import { concertService } from '@/services/firestoreService.js';

/**
 * Hook de gestion complète de la liste des concerts avec fonctionnalités avancées
 * 
 * Ce hook fournit une interface riche pour gérer l'affichage des concerts avec
 * pagination, recherche, filtres par statut, et gestion des formulaires associés.
 * Optimisé pour les grandes listes avec chargement progressif.
 * 
 * @description
 * Fonctionnalités principales :
 * - Récupération paginée des concerts (20 par page)
 * - Gestion des statuts de concert avec détails visuels
 * - Recherche multi-critères (titre, lieu, programmateur, date)
 * - Filtres par statut avec compteurs
 * - Détection des formulaires associés
 * - Chargement progressif avec pagination infinie
 * - Gestion des erreurs et états de chargement
 * - Interface de rechargement et réinitialisation
 * 
 * @returns {Object} Interface complète de gestion des concerts
 * @returns {Array} returns.concerts - Liste des concerts chargés
 * @returns {boolean} returns.loading - État de chargement en cours
 * @returns {string|null} returns.error - Message d'erreur éventuel
 * @returns {boolean} returns.hasMore - Indique s'il y a plus de concerts à charger
 * @returns {Function} returns.fetchConcerts - Fonction de chargement des concerts
 * @returns {Array} returns.searchFields - Configuration des champs de recherche
 * @returns {Array} returns.filterOptions - Options de filtrage par statut
 * @returns {Function} returns.getStatusDetails - Fonction d'obtention des détails de statut
 * @returns {Function} returns.hasForm - Fonction de vérification de formulaire associé
 * 
 * @example
 * ```javascript
 * const {
 *   concerts,
 *   loading,
 *   error,
 *   hasMore,
 *   fetchConcerts,
 *   searchFields,
 *   filterOptions,
 *   getStatusDetails,
 *   hasForm
 * } = useConcertsList();
 * 
 * // Affichage de la liste
 * if (loading && concerts.length === 0) return <div>Chargement...</div>;
 * if (error) return <div>Erreur: {error}</div>;
 * 
 * return (
 *   <div>
 *     {concerts.map(concert => {
 *       const statusDetails = getStatusDetails(concert.statut);
 *       const hasFormulaire = hasForm(concert.id);
 *       
 *       return (
 *         <div key={concert.id}>
 *           <h3>{concert.titre}</h3>
 *           <span className={`badge badge-${statusDetails.variant}`}>
 *             {statusDetails.icon} {statusDetails.label}
 *           </span>
 *           {hasFormulaire && <span>📋 Formulaire</span>}
 *         </div>
 *       );
 *     })}
 *     
 *     {hasMore && (
 *       <button onClick={() => fetchConcerts(false)}>
 *         Charger plus
 *       </button>
 *     )}
 *   </div>
 * );
 * ```
 * 
 * @dependencies
 * - concertService (Firestore service)
 * - formatDate utility
 * - React hooks (useState, useEffect, useCallback)
 * 
 * @complexity HIGH
 * @businessCritical true
 * @migrationCandidate useGenericEntityList - Candidat prioritaire pour généralisation
 * 
 * @workflow
 * 1. Initialisation des états et configuration de pagination
 * 2. Chargement initial des concerts avec tri par date
 * 3. Récupération des formulaires associés
 * 4. Configuration des champs de recherche et filtres
 * 5. Gestion de la pagination avec lastVisible
 * 6. Mise à jour progressive de la liste
 * 7. Gestion des erreurs et états de chargement
 * 
 * @statusManagement
 * - contact: Contact établi (📞, step 1)
 * - preaccord: Pré-accord (✅, step 2)
 * - contrat: Contrat signé (📄, step 3)
 * - acompte: Acompte facturé (💸, step 4)
 * - solde: Solde facturé (🔁, step 5)
 * - annule: Annulé (❌, step 0)
 * 
 * @searchFields
 * - titre: Titre du concert
 * - lieuNom: Nom du lieu
 * - programmateurNom: Nom du programmateur
 * - date: Date formatée du concert
 * 
 * @pagination
 * - pageSize: 20 concerts par page
 * - Chargement progressif avec lastVisible
 * - Détection automatique de fin de liste
 * - Option de réinitialisation complète
 * 
 * @performance
 * - Pagination optimisée avec Firestore cursors
 * - Chargement asynchrone des formulaires
 * - Mise en cache des résultats de recherche
 * - Callbacks mémorisés pour éviter les re-renders
 * 
 * @errorHandling
 * - Erreur de chargement : "Impossible de charger les concerts. Veuillez réessayer plus tard."
 * - Logging automatique des erreurs dans la console
 * - Gestion gracieuse des échecs de pagination
 * 
 * @usedBy ConcertsList, ConcertsDashboard, ConcertsSearch, AdminPanel
 */

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
