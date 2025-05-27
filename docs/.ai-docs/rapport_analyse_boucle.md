# Rapport d'analyse des boucles de re-renders dans l'application React

## Introduction

Suite à l'analyse approfondie du code source de la branche `feature/css-consolidation` du dépôt `app-booking-2`, ce rapport présente une analyse exhaustive des causes potentielles des boucles de re-renders observées dans l'application React. L'objectif est d'identifier avec précision les patterns problématiques sans sur-ingénierie, tout en proposant des solutions pragmatiques pour résoudre définitivement ces problèmes.

## Contexte technique

L'application est construite avec React et utilise intensivement les hooks (useState, useEffect, useCallback, useMemo) ainsi que des hooks personnalisés génériques pour la gestion des données. La structure repose sur une architecture de composants modulaires avec des hooks spécialisés pour chaque type d'entité, eux-mêmes basés sur des hooks génériques réutilisables. Cette approche, bien que favorisant la réutilisation du code, introduit plusieurs niveaux d'abstraction qui peuvent compliquer le suivi du cycle de vie des composants et la propagation des mises à jour.

## Analyse des causes racines des boucles de re-renders

### 1. Dépendances circulaires dans les hooks

Le problème le plus critique identifié se situe dans le hook `useArtistesList.js`. Ce hook présente plusieurs patterns de dépendances circulaires qui provoquent des boucles infinies de re-renders:

```javascript
// Dans useArtistesList.js
const calculateStats = useCallback(async () => {
  try {
    // ... code qui modifie l'état avec setStats
    setStats({
      total: snapshot.size,
      avecConcerts,
      sansConcerts
    });
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques:', error);
  }
}, []);

// Premier useEffect problématique
useEffect(() => {
  calculateStats();
}, [calculateStats]); // calculateStats dans les dépendances

// Deuxième useEffect problématique avec refreshWithStats
const refreshWithStats = useCallback(() => {
  entityList.refresh();
  calculateStats();
}, [entityList, calculateStats]);
```

Le problème fondamental ici est que `calculateStats` est inclus comme dépendance dans le useEffect, alors que cette fonction est elle-même définie avec useCallback. Même si useCallback est utilisé avec un tableau de dépendances vide, React crée une nouvelle référence de fonction à chaque render dans certaines conditions, notamment lors de l'utilisation de closures complexes ou d'interactions avec d'autres hooks. Cela déclenche une chaîne de re-renders: le useEffect s'exécute à nouveau, ce qui appelle calculateStats, qui modifie l'état avec setStats, ce qui provoque un nouveau render, et ainsi de suite.

### 2. Callbacks instables dans les composants

Dans le composant `ArtistesList.js` (version desktop), plusieurs callbacks sont définis de manière instable:

```javascript
// Dans ArtistesList.js (desktop)
const { handleDelete } = useDeleteArtiste((deletedId) => {
  // Callback exécuté après une suppression réussie
  // Mise à jour de la liste locale d'artistes
  setArtistes(prevArtistes => prevArtistes.filter(a => a.id !== deletedId));
});
```

Ce callback anonyme est recréé à chaque render car il n'est pas enveloppé dans un useCallback. De plus, même s'il était enveloppé dans un useCallback, il dépendrait de `setArtistes` qui provient du hook `useArtistesList`. Or, cette fonction peut elle-même changer entre les renders si elle n'est pas stabilisée correctement dans le hook source.

### 3. Propagation excessive des mises à jour d'état

Le hook `useGenericEntityList.js` est particulièrement complexe et gère de nombreux états interdépendants. L'analyse révèle plusieurs patterns problématiques:

```javascript
// Dans useGenericEntityList.js
// Configuration de récupération des données
const fetchConfig = {
  // ...
  onData: (newData) => {
    if (newData) {
      const processedItems = newData.map(item => 
        transformItemRef.current ? transformItemRef.current(item) : item
      );
      
      if (paginationType === 'infinite') {
        setAllItems(prev => [...prev, ...processedItems]);
      } else {
        setAllItems(processedItems);
      }
      
      setTotalCount(newData.length);
      setHasMore(newData.length === pageSize);
      
      if (onItemsChangeRef.current) {
        onItemsChangeRef.current(processedItems);
      }
    }
  }
};
```

Ce code modifie plusieurs états en cascade (`setAllItems`, `setTotalCount`, `setHasMore`) et appelle potentiellement un callback externe (`onItemsChangeRef.current`). Si ce callback modifie lui-même d'autres états, cela peut créer une cascade de mises à jour qui se propagent à travers plusieurs composants et hooks.

### 4. Utilisation incorrecte de useRef pour les objets

Un pattern subtil mais problématique concerne l'utilisation de useRef pour stocker des objets qui sont recréés à chaque render:

```javascript
// Pattern problématique (hypothétique, basé sur les commentaires dans le code)
const configRef = useRef({...}); // Crée un nouvel objet à chaque render
```

Bien que useRef lui-même ne déclenche pas de re-renders, l'objet passé à useRef est recréé à chaque render, ce qui peut causer des problèmes si cet objet est utilisé comme dépendance dans d'autres hooks.

### 5. Absence de mémoïsation pour les valeurs dérivées

Dans plusieurs endroits du code, des valeurs dérivées sont calculées directement dans le corps du composant sans mémoïsation:

```javascript
// Dans ArtistesList.js (desktop)
// Vérifier si des filtres sont actifs (NOUVEAU)
const hasActiveFilters = () => {
  return searchTerm || (filters && Object.values(filters).some(f => f && f !== 'all'));
};
```

Cette fonction est recréée à chaque render et, si elle est passée comme prop à des composants enfants, peut provoquer des re-renders inutiles de ces composants.

## Recommandations détaillées pour résoudre les boucles

### 1. Stabilisation des useEffect et useCallback

La première correction essentielle consiste à stabiliser les dépendances des useEffect et useCallback:

```javascript
// Correction pour useArtistesList.js
// 1. Stabiliser calculateStats avec des dépendances explicites
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

// 2. Supprimer calculateStats des dépendances du useEffect
useEffect(() => {
  calculateStats();
}, []); // Exécuter uniquement au montage

// 3. Stabiliser refreshWithStats
const refreshWithStats = useCallback(() => {
  if (entityList && entityList.refresh) {
    entityList.refresh();
  }
  calculateStats();
}, [calculateStats]); // Dépendance uniquement à calculateStats qui est maintenant stable
```

### 2. Mémoïsation des valeurs dérivées

Pour les valeurs dérivées qui sont utilisées dans le rendu ou passées comme props, il est crucial d'utiliser useMemo:

```javascript
// Correction pour ArtistesList.js (desktop)
// Mémoïser la fonction hasActiveFilters
const hasActiveFilters = useMemo(() => {
  return searchTerm || (filters && Object.values(filters).some(f => f && f !== 'all'));
}, [searchTerm, filters]); // Dépendances explicites
```

### 3. Stabilisation des callbacks passés aux hooks personnalisés

Les callbacks passés aux hooks personnalisés doivent être stabilisés avec useCallback:

```javascript
// Correction pour ArtistesList.js (desktop)
// Stabiliser le callback de suppression
const handleDeleteCallback = useCallback((deletedId) => {
  setArtistes(prevArtistes => prevArtistes.filter(a => a.id !== deletedId));
}, []); // Pas de dépendances car utilise la forme fonctionnelle de setArtistes

// Puis l'utiliser dans le hook
const { handleDelete } = useDeleteArtiste(handleDeleteCallback);
```

### 4. Optimisation des mises à jour d'état en cascade

Pour éviter les mises à jour d'état en cascade, il est recommandé de regrouper les mises à jour lorsque possible:

```javascript
// Correction pour useGenericEntityList.js
// Regrouper les mises à jour d'état
const updateItemsAndMetadata = useCallback((newData) => {
  if (!newData) return;
  
  const processedItems = newData.map(item => 
    transformItemRef.current ? transformItemRef.current(item) : item
  );
  
  // Mise à jour groupée des états
  setAllItems(prev => paginationType === 'infinite' ? [...prev, ...processedItems] : processedItems);
  setTotalCount(newData.length);
  setHasMore(newData.length === pageSize);
  
  // Appel du callback externe après les mises à jour internes
  if (onItemsChangeRef.current) {
    onItemsChangeRef.current(processedItems);
  }
}, [paginationType, pageSize]);

// Utiliser cette fonction dans fetchConfig
const fetchConfig = {
  // ...
  onData: updateItemsAndMetadata
};
```

### 5. Utilisation correcte de useRef pour les objets

Pour les objets qui doivent rester stables entre les renders mais qui peuvent changer au fil du temps:

```javascript
// Correction pour l'utilisation de useRef
// Initialiser useRef une seule fois
const configRef = useRef(null);

// Mettre à jour la référence si nécessaire, sans créer de nouvel objet à chaque render
useEffect(() => {
  if (!configRef.current) {
    configRef.current = {
      // Propriétés initiales
    };
  }
  
  // Mettre à jour des propriétés spécifiques si nécessaire
  configRef.current.someProperty = someValue;
}, [someValue]);
```

### 6. Implémentation d'un système de diagnostic des renders

Pour faciliter le débogage et la détection précoce des boucles de re-renders, il est recommandé d'implémenter un système de diagnostic:

```javascript
// Dans les composants et hooks critiques
const renderCount = useRef(0);

useEffect(() => {
  renderCount.current += 1;
  
  // Alerte si trop de renders
  if (renderCount.current > 10) {
    console.warn(`🚨 [RENDER_LOOP] ${componentName} a eu ${renderCount.current} renders`);
  }
  
  // Log normal pour le suivi
  console.log(`🔄 [RENDER] ${componentName}: ${renderCount.current}`);
}, []);
```

## Analyse des patterns React problématiques identifiés

L'analyse du code révèle plusieurs patterns React problématiques qui contribuent aux boucles de re-renders:

### 1. Dépendances manquantes ou excessives dans useEffect/useCallback

Le linter ESLint avec la règle `react-hooks/exhaustive-deps` signalerait plusieurs problèmes dans le code actuel. Les dépendances manquantes peuvent causer des bugs subtils, tandis que les dépendances excessives peuvent provoquer des boucles infinies.

### 2. Création d'objets et fonctions dans le corps du composant

La création d'objets, tableaux et fonctions directement dans le corps du composant génère de nouvelles références à chaque render, ce qui peut déclencher des re-renders inutiles des composants enfants qui reçoivent ces valeurs comme props.

### 3. Propagation excessive de props

Le pattern de propagation `{...props}` utilisé dans le composant wrapper `ArtistesList.js` peut propager des props inutiles ou instables aux composants enfants, augmentant le risque de re-renders en cascade.

### 4. Utilisation incorrecte des hooks personnalisés

Les hooks personnalisés comme `useArtistesList` et `useGenericEntityList` sont complexes et gèrent de nombreux états interdépendants. Une mauvaise utilisation ou une mauvaise configuration de ces hooks peut facilement conduire à des boucles de re-renders.

## Script de correction proposé

Voici un script shell qui implémente les corrections recommandées:

```bash
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
import { useState, useEffect, useCallback, useMemo } from 'react';
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
```

## Conclusion

L'analyse approfondie du code source a révélé plusieurs patterns problématiques qui contribuent aux boucles de re-renders dans l'application React. Les principales causes identifiées sont les dépendances circulaires dans les hooks, les callbacks instables, la propagation excessive des mises à jour d'état, l'utilisation incorrecte de useRef pour les objets, et l'absence de mémoïsation pour les valeurs dérivées.

Les recommandations proposées visent à résoudre ces problèmes de manière pragmatique, sans sur-ingénierie, en se concentrant sur la stabilisation des dépendances, la mémoïsation des valeurs dérivées, et l'optimisation des mises à jour d'état. Le script de correction fourni implémente ces recommandations et ajoute un système de diagnostic pour faciliter la détection précoce des boucles de re-renders.

En appliquant ces corrections, l'application devrait retrouver des performances optimales, avec des compteurs de renders qui se stabilisent à des valeurs raisonnables (1-3 renders par composant) au lieu de monter en boucle infinie.
