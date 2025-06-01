// src/hooks/lieux/useLieuxFilters.js
import { useState, useMemo, useCallback } from 'react';

/**
 * Hook optimisé pour la gestion des filtres et de la recherche de lieux
 * 
 * Version simplifiée qui fonctionne avec les lieux passés en paramètre
 * Corrigé pour éliminer l'erreur filters.find
 * 
 * @param {Array} lieux - Liste de lieux préchargés
 * @returns {Object} API de filtrage et recherche de lieux
 */
const useLieuxFilters = (lieux = []) => {
  // États locaux pour les filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('tous');
  const [sortOption, setSortOption] = useState('nomAsc');

  // Filtrage et recherche des lieux
  const filteredLieux = useMemo(() => {
    if (!Array.isArray(lieux)) return [];
    
    let filtered = [...lieux];
    
    // Filtrage par terme de recherche
    if (searchTerm && typeof searchTerm === 'string' && searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(lieu => {
        return (
          (lieu.nom && lieu.nom.toLowerCase().includes(term)) ||
          (lieu.ville && lieu.ville.toLowerCase().includes(term)) ||
          (lieu.adresse && lieu.adresse.toLowerCase().includes(term)) ||
          (lieu.codePostal && lieu.codePostal.includes(term))
        );
      });
    }
    
    // Filtrage par type
    if (filterType && filterType !== 'tous') {
      filtered = filtered.filter(lieu => lieu.type === filterType);
    }
    
    return filtered;
  }, [lieux, searchTerm, filterType]);

  // Tri des lieux filtrés
  const sortedLieux = useMemo(() => {
    if (!filteredLieux || filteredLieux.length === 0) return [];
    
    const sorted = [...filteredLieux];
    
    switch (sortOption) {
      case 'nomAsc':
        return sorted.sort((a, b) => (a.nom || '').localeCompare(b.nom || ''));
      case 'nomDesc':
        return sorted.sort((a, b) => (b.nom || '').localeCompare(a.nom || ''));
      case 'villeAsc':
        return sorted.sort((a, b) => (a.ville || '').localeCompare(b.ville || ''));
      case 'villeDesc':
        return sorted.sort((a, b) => (b.ville || '').localeCompare(a.ville || ''));
      case 'capaciteAsc':
        return sorted.sort((a, b) => ((a.capacite || 0) - (b.capacite || 0)));
      case 'capaciteDesc':
        return sorted.sort((a, b) => ((b.capacite || 0) - (a.capacite || 0)));
      case 'dateCreationAsc':
        return sorted.sort((a, b) => (a.createdAt?.toDate?.() || 0) - (b.createdAt?.toDate?.() || 0));
      case 'dateCreationDesc':
        return sorted.sort((a, b) => (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0));
      default:
        return sorted;
    }
  }, [filteredLieux, sortOption]);

  // Extraction des types disponibles
  const types = useMemo(() => {
    if (!lieux || !Array.isArray(lieux)) return ['tous'];
    
    const uniqueTypes = [...new Set(lieux
      .map(lieu => lieu?.type)
      .filter(Boolean))];
    return ['tous', ...uniqueTypes];
  }, [lieux]);

  // Fonction de réinitialisation complète
  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setFilterType('tous');
    setSortOption('nomAsc');
  }, []);

  return {
    // Données
    filteredLieux: sortedLieux,
    loading: false, // Pas de chargement car on travaille avec des données locales
    error: null,
    
    // Recherche
    searchTerm,
    setSearchTerm,
    
    // Filtres
    filterType,
    setFilterType,
    types,
    
    // Tri
    sortOption,
    setSortOption,
    
    // Actions
    resetFilters,
    refresh: () => {} // Pas besoin de refresh car on travaille avec des données locales
  };
};

export default useLieuxFilters;