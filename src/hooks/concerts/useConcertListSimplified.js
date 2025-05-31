import { useState, useCallback, useMemo } from 'react';
import { useMultiOrgQuery } from '@/hooks/useMultiOrgQuery';

// Configuration des statuts (constante pour éviter les re-créations)
const STATUS_CONFIG = {
  'contact-etabli': { label: 'Contact établi', color: 'blue' },
  'pre-accord': { label: 'Pré-accord', color: 'orange' },
  'contrat-signe': { label: 'Contrat signé', color: 'green' },
  'acompte-facture': { label: 'Acompte facturé', color: 'purple' },
  'solde-facture': { label: 'Soldé facturé', color: 'success' },
  'annule': { label: 'Annulé', color: 'danger' }
};

/**
 * Hook simplifié pour la liste des concerts
 * Combine toutes les fonctionnalités en un seul hook simple
 */
export const useConcertListSimplified = () => {
  // États des filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Chargement des données avec pagination
  const {
    data: concerts = [],
    loading,
    error,
    loadMore,
    hasMore,
    loadingMore
  } = useMultiOrgQuery('concerts', {
    orderByField: 'date',
    orderDirection: 'desc',
    limitCount: 20
  });

  // Filtrage des concerts
  const filteredConcerts = useMemo(() => {
    if (!concerts.length) return [];

    return concerts.filter(concert => {
      // Filtre par statut
      if (statusFilter !== 'all' && concert.statut !== statusFilter) {
        return false;
      }

      // Filtre par recherche
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const searchableText = [
          concert.titre,
          concert.artiste?.nom,
          concert.lieu?.nom,
          concert.lieu?.ville,
          concert.programmateur?.nom
        ].filter(Boolean).join(' ').toLowerCase();
        
        if (!searchableText.includes(search)) {
          return false;
        }
      }

      return true;
    });
  }, [concerts, searchTerm, statusFilter]);

  // Statistiques
  const stats = useMemo(() => {
    const now = new Date();
    return {
      total: concerts.length,
      aVenir: concerts.filter(c => new Date(c.date) > now).length,
      passes: concerts.filter(c => new Date(c.date) <= now).length
    };
  }, [concerts]);

  // Fonctions utilitaires
  const isDatePassed = useCallback((date) => new Date(date) < new Date(), []);
  const getStatusDetails = useCallback((status) => STATUS_CONFIG[status] || { label: status, color: 'default' }, []);

  // Vérifications pour les formulaires et contrats
  const hasForm = useCallback((concert) => !!concert.formId, []);
  const hasUnvalidatedForm = useCallback((concert) => concert.formId && !concert.formValidated, []);
  const hasContract = useCallback((concert) => !!concert.contratId, []);
  const getContractStatus = useCallback((concert) => concert.contratStatus || 'draft', []);

  return {
    // Données
    concerts: filteredConcerts,
    loading,
    error,
    stats,
    
    // Filtres
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    
    // Pagination
    loadMore,
    hasMore,
    loadingMore,
    
    // Configuration
    statusConfig: STATUS_CONFIG,
    
    // Utilitaires
    isDatePassed,
    getStatusDetails,
    hasForm,
    hasUnvalidatedForm,
    hasContract,
    getContractStatus,
    
    // Compteurs
    filteredCount: filteredConcerts.length,
    totalCount: concerts.length
  };
};