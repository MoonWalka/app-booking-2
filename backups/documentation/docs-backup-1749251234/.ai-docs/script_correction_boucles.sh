#!/bin/bash

# Script de correction des boucles de re-renders dans l'application React
# À exécuter à la racine du projet

echo "🔍 Début des corrections pour les boucles de re-renders..."

# 1. Correction de useArtistesList.js
echo "✅ Correction de useArtistesList.js..."
cat > src/hooks/artistes/useArtistesList.js << 'EOL'
/**
 * Hook optimisé pour la liste des artistes basé sur useGenericEntityList
 * 
 * Cette implémentation suit l'approche RECOMMANDÉE pour les nouveaux développements
 * en utilisant directement les hooks génériques.
 */
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useGenericEntityList } from '@/hooks/generics';
import { collection, getDocs, query } from '@/services/firebase-service';
import { db } from '@/services/firebase-service';

/**
 * Hook optimisé pour gérer une liste d'artistes avec pagination et filtres
 * @param {Object} options - Options de configuration
 * @param {number} [options.pageSize=20] - Nombre d'artistes par page
 * @param {string} [options.sortField='nom'] - Champ de tri
 * @param {string} [options.sortDirection='asc'] - Direction de tri ('asc' ou 'desc')
 * @returns {Object} API pour gérer la liste d'artistes
 */
export const useArtistesList = ({
  pageSize = 20,
  sortField = 'nom',
  sortDirection = 'asc',
  initialFilters = []
} = {}) => {
  // Compteur de renders pour diagnostic
  const renderCount = useRef(0);
  
  useEffect(() => {
    renderCount.current += 1;
    console.log(`🔄 [RENDER] useArtistesList: ${renderCount.current}`);
    
    if (renderCount.current > 10) {
      console.warn(`🚨 [RENDER_LOOP] useArtistesList a eu ${renderCount.current} renders`);
    }
  });

  // Statistiques des artistes
  const [stats, setStats] = useState({
    total: 0,
    avecConcerts: 0,
    sansConcerts: 0
  });

  // États de recherche pour la compatibilité
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});

  // Utilisation du hook générique pour les listes
  const entityList = useGenericEntityList('artistes', {
    pageSize,
    defaultSort: { field: sortField, direction: sortDirection },
    defaultFilters: {},
    enableSelection: false,
    enableFilters: false,
    enableSearch: false,
    searchFields: ['nom', 'genre', 'tags'],
    transformItem: (data) => ({
      ...data,
      // Exemple de champ calculé
      hasConcerts: !!(data.concertsAssocies && data.concertsAssocies.length > 0)
    })
  }, {
    paginationType: 'pages',
    enableVirtualization: false,
    enableCache: true,
    enableRealTime: false,
    enableBulkActions: false,
    autoRefresh: false
  });

  // Fonction pour calculer les statistiques - CORRIGÉ: dépendances explicites
  const calculateStats = useCallback(async () => {
    try {
      const artistesQuery = query(collection(db, 'artistes'));
      const snapshot = await getDocs(artistesQuery);
      
      let avecConcerts = 0;
      let sansConcerts = 0;
      
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.concertsAssocies && data.concertsAssocies.length > 0) {
          avecConcerts++;
        } else {
          sansConcerts++;
        }
      });
      
      setStats({
        total: snapshot.size,
        avecConcerts,
        sansConcerts
      });
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error);
    }
  }, [db]); // Dépendance explicite à db qui est stable

  // Charger les statistiques au montage - CORRIGÉ: pas de dépendance à calculateStats
  useEffect(() => {
    calculateStats();
  }, []); // Exécuter uniquement au montage

  // Recalculer les statistiques lors d'un rafraîchissement des données - CORRIGÉ: dépendances minimales
  const refreshWithStats = useCallback(() => {
    if (entityList && entityList.refresh) {
      entityList.refresh();
    }
    calculateStats();
  }, [calculateStats, entityList]); // Dépendances minimales et stables

  // Filtres spécifiques aux artistes - CORRIGÉ: mémoïsation des callbacks
  const filterByGenre = useCallback((genre) => {
    if (!genre) {
      entityList.removeFilter('genre');
    } else {
      entityList.applyFilter({
        field: 'genre',
        operator: '==',
        value: genre
      });
    }
  }, [entityList]);

  const filterByHasConcerts = useCallback((hasConcerts = true) => {
    entityList.applyFilter({
      field: 'hasConcerts',
      operator: '==',
      value: hasConcerts
    });
  }, [entityList]);

  // Fonctions de compatibilité pour ArtistesList - CORRIGÉ: mémoïsation des callbacks
  const setFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({});
    setSearchTerm('');
  }, []);

  // Alias pour la compatibilité - CORRIGÉ: utilisation de useMemo pour les valeurs dérivées
  const sortBy = useMemo(() => entityList.sortField || sortField, [entityList.sortField, sortField]);
  const hasMore = useMemo(() => entityList.hasMore || false, [entityList.hasMore]);
  
  // CORRIGÉ: Stabilisation des fonctions avec useCallback
  const setSortBy = useCallback(entityList.setSortField || (() => {}), [entityList.setSortField]);
  const setSortDirection = useCallback(entityList.setSortDirection || (() => {}), [entityList.setSortDirection]);
  const loadMoreArtistes = useCallback(entityList.loadMore || (() => {}), [entityList.loadMore]);
  const setArtistes = useCallback(entityList.setEntities || (() => {}), [entityList.setEntities]);

  return {
    ...entityList,
    // Renommer items en artistes pour maintenir la compatibilité
    artistes: entityList.items || [],
    stats,
    refreshWithStats,
    
    // Ajouter des filtres spécifiques aux artistes
    filterByGenre,
    filterByHasConcerts,
    
    // Propriétés de compatibilité avec ArtistesList
    searchTerm,
    setSearchTerm,
    filters,
    setFilter,
    resetFilters,
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection,
    hasMore,
    loadMoreArtistes,
    setArtistes
  };
};

export default useArtistesList;
EOL

# 2. Correction de ArtistesList.js (desktop)
echo "✅ Correction de ArtistesList.js (desktop)..."
cat > src/components/artistes/desktop/ArtistesList.js << 'EOL'
// src/components/artistes/desktop/ArtistesList.js
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Container, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Alert from '@/components/ui/Alert';
import styles from './ArtistesList.module.css';

// MIGRATION: Utilisation des hooks optimisés au lieu des versions V2
import { useArtistesList, useDeleteArtiste } from '@/hooks/artistes';

// Import des composants UI
import ArtistesListHeader from '../sections/ArtistesListHeader';
import ArtistesStatsCards from '../sections/ArtistesStatsCards';
import ArtisteSearchBar from '../sections/ArtisteSearchBar';
import ArtistesTable from '../sections/ArtistesTable';
import ArtistesEmptyState from '../sections/ArtistesEmptyState';
import ArtistesLoadMore from '../sections/ArtistesLoadMore';

/**
 * Composant qui affiche une liste d'artistes avec recherche, filtres et pagination
 * Refactorisé pour utiliser useArtistesList basé sur hooks génériques optimisés
 */
const ArtistesList = () => {
  // Compteur de renders pour diagnostic
  const renderCount = useRef(0);
  
  useEffect(() => {
    renderCount.current += 1;
    console.log(`🔄 [RENDER] ArtistesList: ${renderCount.current}`);
    
    if (renderCount.current > 10) {
      console.warn(`🚨 [RENDER_LOOP] ArtistesList a eu ${renderCount.current} renders`);
    }
  });

  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const searchInputRef = useRef(null);

  // MIGRATION: Utilisation du hook optimisé
  const {
    // Données principales
    artistes,
    loading,
    stats,
    error,
    
    // Pagination
    hasMore,
    loadMoreArtistes,
    
    // Recherche et filtrage
    searchTerm,
    setSearchTerm,
    filters,
    setFilter,
    resetFilters,
    
    // Tri
    sortBy,
    sortDirection,
    setSortBy,
    setSortDirection,

    // Actions
    setArtistes
  } = useArtistesList({
    pageSize: 20,
    initialSortField: 'nom',
    initialSortDirection: 'asc',
    cacheEnabled: false // Désactiver le cache pour éviter les problèmes de données obsolètes
  });

  // CORRIGÉ: Stabilisation du callback de suppression
  const handleDeleteCallback = useCallback((deletedId) => {
    setArtistes(prevArtistes => prevArtistes.filter(a => a.id !== deletedId));
  }, [setArtistes]);

  // MIGRATION: Utilisation du hook optimisé pour la suppression
  const { handleDelete } = useDeleteArtiste(handleDeleteCallback);

  // Navigation vers le formulaire de création d'artiste - CORRIGÉ: useCallback
  const handleAddClick = useCallback(() => {
    navigate('/artistes/nouveau');
  }, [navigate]);

  // Gestion de la recherche - CORRIGÉ: useCallback
  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
    setShowDropdown(!!e.target.value);
  }, [setSearchTerm]);

  // Effacement de la recherche - CORRIGÉ: useCallback
  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
    setShowDropdown(false);
  }, [setSearchTerm]);

  // Gestion du changement de filtre - CORRIGÉ: useCallback
  const handleFilterChange = useCallback((e) => {
    setFilter('status', e.target.value);
  }, [setFilter]);

  // Gestion du changement de tri - CORRIGÉ: useCallback
  const handleSortChange = useCallback((value) => {
    setSortBy(value);
  }, [setSortBy]);

  // Gestion du changement de direction de tri - CORRIGÉ: useCallback
  const handleSortDirectionToggle = useCallback(() => {
    const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    setSortDirection(newDirection);
  }, [sortDirection, setSortDirection]);

  // Réinitialisation de tous les filtres - CORRIGÉ: useCallback
  const handleResetFilters = useCallback(() => {
    resetFilters();
    setSearchTerm('');
    setShowDropdown(false);
  }, [resetFilters, setSearchTerm]);

  // Vérifier si des filtres sont actifs - CORRIGÉ: useMemo au lieu de fonction
  const hasActiveFilters = useMemo(() => {
    return searchTerm || (filters && Object.values(filters).some(f => f && f !== 'all'));
  }, [searchTerm, filters]);

  // Création d'un nouvel artiste depuis la barre de recherche - CORRIGÉ: useCallback
  const handleCreateArtiste = useCallback(() => {
    navigate('/artistes/nouveau', { state: { initialNom: searchTerm } });
  }, [navigate, searchTerm]);

  // CORRIGÉ: useMemo pour les données filtrées
  const filteredArtistes = useMemo(() => artistes, [artistes]);
  const noResults = useMemo(() => searchTerm && filteredArtistes.length === 0, [searchTerm, filteredArtistes]);

  // État de chargement
  if (loading && artistes.length === 0) {
    return (
      <Container className={styles.spinnerContainer}>
        <Spinner animation="border" role="status" variant="primary" className="me-2" />
        <span>Chargement des artistes...</span>
      </Container>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="danger">
          Une erreur est survenue lors du chargement des artistes : {error.message || error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container className={styles.artistesContainer}>
      {/* En-tête avec titre et bouton d'ajout */}
      <ArtistesListHeader onAddClick={handleAddClick} />
      
      {/* Cartes de statistiques */}
      <ArtistesStatsCards stats={stats} />
      
      {/* Barre de recherche et de filtrage */}
      <ArtisteSearchBar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onClearSearch={handleClearSearch}
        filter={(filters && filters.status) || ''}
        onFilterChange={handleFilterChange}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        sortDirection={sortDirection}
        onSortDirectionToggle={handleSortDirectionToggle}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
        showDropdown={showDropdown}
        searchResults={filteredArtistes}
        noResults={noResults}
        onCreateArtiste={handleCreateArtiste}
        searchInputRef={searchInputRef}
      />
      
      {/* Tableau ou état vide */}
      {filteredArtistes.length > 0 ? (
        <ArtistesTable 
          artistes={filteredArtistes} 
          onDelete={handleDelete}
        />
      ) : (
        <ArtistesEmptyState 
          searchTerm={searchTerm}
          onAddClick={handleAddClick}
        />
      )}
      
      {/* Bouton "Charger plus" (quand il y a plus d'artistes à charger) */}
      {filteredArtistes.length > 0 && hasMore && (
        <ArtistesLoadMore 
          loading={loading} 
          onLoadMore={loadMoreArtistes}
        />
      )}
    </Container>
  );
};

export default ArtistesList;
EOL

# 3. Ajout d'un fichier de diagnostic pour les boucles de re-renders
echo "✅ Ajout d'un fichier de diagnostic pour les boucles de re-renders..."
mkdir -p src/utils/debug
cat > src/utils/debug/renderTracker.js << 'EOL'
/**
 * Utilitaire pour suivre et diagnostiquer les boucles de re-renders
 */
import { useRef, useEffect } from 'react';

/**
 * Hook pour suivre les renders d'un composant
 * @param {string} componentName - Nom du composant à suivre
 * @param {number} warningThreshold - Seuil d'alerte (nombre de renders)
 * @param {Object} props - Props du composant pour le diagnostic
 * @returns {number} Nombre actuel de renders
 */
export const useRenderTracker = (componentName, warningThreshold = 10, props = {}) => {
  const renderCount = useRef(0);
  const previousProps = useRef(props);
  
  // Incrémenter le compteur à chaque render
  renderCount.current += 1;
  
  useEffect(() => {
    // Alerte si trop de renders
    if (renderCount.current > warningThreshold) {
      console.warn(`🚨 [RENDER_LOOP] ${componentName} a eu ${renderCount.current} renders`);
    }
    
    // Log normal pour le suivi
    console.log(`🔄 [RENDER] ${componentName}: ${renderCount.current}`);
    
    // Détecter les props qui ont changé
    if (props && Object.keys(props).length > 0) {
      const changedProps = [];
      
      Object.keys(props).forEach(key => {
        if (props[key] !== previousProps.current[key]) {
          changedProps.push(key);
        }
      });
      
      if (changedProps.length > 0) {
        console.log(`🔍 [PROPS_CHANGED] ${componentName}: ${changedProps.join(', ')}`);
      }
      
      // Mettre à jour les props précédentes
      previousProps.current = { ...props };
    }
  });
  
  return renderCount.current;
};

/**
 * HOC pour suivre les renders d'un composant
 * @param {React.Component} Component - Composant à suivre
 * @param {string} displayName - Nom d'affichage du composant
 * @param {number} warningThreshold - Seuil d'alerte (nombre de renders)
 * @returns {React.Component} Composant avec suivi des renders
 */
export const withRenderTracker = (Component, displayName, warningThreshold = 10) => {
  const WrappedComponent = (props) => {
    useRenderTracker(displayName || Component.displayName || Component.name, warningThreshold, props);
    return <Component {...props} />;
  };
  
  WrappedComponent.displayName = `WithRenderTracker(${displayName || Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

export default useRenderTracker;
EOL

echo "✅ Corrections terminées avec succès!"
echo "🧪 Veuillez tester l'application pour vérifier que les boucles de re-renders ont été éliminées."
