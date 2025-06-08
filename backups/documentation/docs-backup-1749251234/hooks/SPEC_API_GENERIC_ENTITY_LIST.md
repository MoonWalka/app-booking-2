# Spécification d'API: useGenericEntityList

*Document créé le: 5 mai 2025*

## Vue d'ensemble

`useGenericEntityList` est un hook générique conçu pour standardiser la gestion des listes d'entités dans l'application TourCraft. Il centralise les fonctionnalités de chargement, filtrage, recherche, tri et pagination des données, en offrant une interface cohérente et flexible qui peut être adaptée à différents types d'entités.

## Objectifs

- Standardiser la gestion des listes d'entités à travers l'application
- Réduire la duplication de code entre les différents hooks de liste
- Améliorer la maintenabilité et la testabilité du code
- Simplifier la création de nouvelles vues de liste
- Permettre la personnalisation du comportement pour différents types d'entités

## API

### Paramètres

`useGenericEntityList` accepte un objet de configuration avec les propriétés suivantes :

#### Configuration de base

| Propriété | Type | Requis | Description |
|-----------|------|--------|-------------|
| `collectionName` | string | Oui | Le nom de la collection Firestore à interroger |
| `idField` | string | Non | Le nom du champ identifiant (défaut: 'id') |
| `transformItem` | function | Non | Fonction pour transformer chaque élément avant de l'ajouter à la liste (défaut: item => item) |

#### Filtrage et recherche

| Propriété | Type | Requis | Description |
|-----------|------|--------|-------------|
| `initialFilters` | object | Non | Filtres initiaux à appliquer (défaut: {}) |
| `filterConfig` | object | Non | Configuration des champs filtrables et leurs types |
| `searchFields` | string[] | Non | Champs sur lesquels effectuer la recherche textuelle |
| `searchConfig` | object | Non | Configuration avancée de la recherche |
| `defaultFilters` | object | Non | Filtres appliqués par défaut, ne peuvent pas être réinitialisés (défaut: {}) |
| `customFiltering` | function | Non | Fonction personnalisée pour le filtrage client (items, filters, searchTerm) => filteredItems |

#### Tri et pagination

| Propriété | Type | Requis | Description |
|-----------|------|--------|-------------|
| `initialSortField` | string | Non | Champ de tri initial |
| `initialSortDirection` | string | Non | Direction de tri initiale ('asc' ou 'desc', défaut: 'asc') |
| `pageSize` | number | Non | Nombre d'éléments par page (défaut: 10) |
| `paginationMode` | string | Non | Mode de pagination ('server' ou 'client', défaut: 'server') |
| `customSorting` | function | Non | Fonction personnalisée de tri (a, b, sortField, sortDirection) => number |

#### Options avancées

| Propriété | Type | Requis | Description |
|-----------|------|--------|-------------|
| `includeDeleted` | boolean | Non | Inclure les éléments marqués comme supprimés (défaut: false) |
| `realtime` | boolean | Non | Utiliser des listeners en temps réel plutôt que des requêtes ponctuelles (défaut: false) |
| `queryConstraints` | array | Non | Contraintes de requête Firestore supplémentaires à appliquer |
| `customQueryBuilder` | function | Non | Fonction personnalisée pour construire la requête Firestore |

#### Callbacks

| Propriété | Type | Requis | Description |
|-----------|------|--------|-------------|
| `onItemsLoaded` | function | Non | Callback appelé après le chargement des éléments |
| `onError` | function | Non | Callback appelé en cas d'erreur |
| `onFilterChange` | function | Non | Callback appelé lors du changement de filtre |
| `onSearchChange` | function | Non | Callback appelé lors du changement de terme de recherche |

### Valeur retournée

Le hook retourne un objet contenant les propriétés et méthodes suivantes :

#### États des données

| Propriété | Type | Description |
|-----------|------|-------------|
| `items` | array | Liste des éléments filtrés, triés et paginés |
| `loading` | boolean | Indique si les données sont en cours de chargement |
| `error` | object | Erreur éventuelle lors du chargement des données |
| `totalCount` | number | Nombre total d'éléments (avant pagination) |
| `hasMore` | boolean | Indique s'il y a plus de données à charger |

#### Pagination

| Propriété/Méthode | Type | Description |
|-------------------|------|-------------|
| `currentPage` | number | Page actuelle |
| `totalPages` | number | Nombre total de pages estimé |
| `setPage` | function | Fonction pour naviguer vers une page spécifique |
| `nextPage` | function | Fonction pour passer à la page suivante |
| `prevPage` | function | Fonction pour revenir à la page précédente |
| `loadMore` | function | Fonction pour charger plus de résultats (pagination infinie) |
| `pageSize` | number | Nombre d'éléments par page |
| `setPageSize` | function | Fonction pour modifier le nombre d'éléments par page |

#### Filtres et recherche

| Propriété/Méthode | Type | Description |
|-------------------|------|-------------|
| `filters` | object | État actuel des filtres |
| `setFilter` | function | Fonction pour définir un filtre spécifique (nom, valeur) |
| `setFilters` | function | Fonction pour définir plusieurs filtres à la fois |
| `resetFilters` | function | Fonction pour réinitialiser les filtres (aux valeurs initiales) |
| `clearFilters` | function | Fonction pour effacer tous les filtres (sauf defaultFilters) |
| `searchTerm` | string | Terme de recherche actuel |
| `setSearchTerm` | function | Fonction pour définir le terme de recherche |
| `availableFilters` | object | Description des filtres disponibles selon filterConfig |

#### Tri

| Propriété/Méthode | Type | Description |
|-------------------|------|-------------|
| `sortField` | string | Champ de tri actuel |
| `sortDirection` | string | Direction de tri actuelle ('asc' ou 'desc') |
| `setSorting` | function | Fonction pour définir le tri (champ, direction) |
| `toggleSortDirection` | function | Inverse la direction de tri actuelle |

#### Actions globales

| Propriété/Méthode | Type | Description |
|-------------------|------|-------------|
| `refresh` | function | Force un rechargement complet des données |
| `resetState` | function | Réinitialise tous les états (filtres, tri, pagination) |
| `getQuerySnapshot` | function | Retourne le dernier snapshot Firestore (pour debugging) |

## Types de filtres supportés

Le hook supporte plusieurs types de filtres via la propriété `filterConfig` :

```javascript
// Exemple de configuration de filtres
const filterConfig = {
  // Filtre d'égalité simple
  type: {
    type: 'equals',
    firestoreOperator: '==',
    multiple: false,
  },
  
  // Filtre sur un tableau (valeur doit être dans le tableau)
  tags: {
    type: 'array-contains',
    firestoreOperator: 'array-contains',
    multiple: false,
  },
  
  // Filtre multi-valeurs (OR)
  status: {
    type: 'in',
    firestoreOperator: 'in',
    multiple: true,
    options: ['pending', 'active', 'cancelled']
  },
  
  // Filtre de plage (min et max)
  capacite: {
    type: 'range',
    firestoreOperator: {
      min: '>=',
      max: '<='
    },
  },
  
  // Filtre de date
  date: {
    type: 'date-range',
    firestoreOperator: {
      start: '>=',
      end: '<='
    },
    format: 'yyyy-MM-dd' // Format de date attendu
  },
  
  // Filtre booléen
  actif: {
    type: 'boolean',
    firestoreOperator: '=='
  },
  
  // Filtre personnalisé (logique côté client)
  custom: {
    type: 'custom',
    clientSideFilter: (item, value) => {
      // Logique personnalisée
      return true/false;
    }
  }
};
```

## Modes de pagination

Le hook supporte deux modes de pagination :

### 1. Pagination côté serveur ('server')

- Utilise les fonctionnalités de pagination de Firestore (`limit`, `startAfter`)
- Plus efficace pour les grandes collections
- Nécessite de maintenir un état de curseur entre les requêtes
- Supporte la pagination infinie

### 2. Pagination côté client ('client')

- Récupère toutes les données et effectue la pagination en mémoire
- Plus simple à implémenter pour de petites collections
- Permet des opérations complexes non supportées par Firestore
- Consomme plus de ressources pour les grandes collections

## Fonctionnalités avancées

### Recherche textuelle avancée

La recherche textuelle peut être configurée via `searchConfig` :

```javascript
const searchConfig = {
  mode: 'contains', // 'contains', 'startsWith', ou 'fulltext'
  caseSensitive: false,
  minLength: 2, // Longueur minimale pour déclencher la recherche
  debounceTime: 300, // Temps de debounce en ms
  tokenize: true, // Diviser le terme de recherche en tokens
  searchOnCachedRelations: true, // Chercher aussi dans les relations mises en cache
}
```

### Écoute en temps réel

Si `realtime: true`, le hook utilisera `onSnapshot` au lieu de `getDocs` pour écouter les changements en temps réel dans la collection.

## Exemples d'utilisation

### Exemple simple : Liste de lieux avec filtres de base

```javascript
const lieuxList = useGenericEntityList({
  collectionName: 'lieux',
  searchFields: ['nom', 'ville', 'adresse'],
  initialFilters: { type: 'salle' },
  initialSortField: 'nom',
  pageSize: 20,
});

// Utilisation dans un composant
return (
  <div>
    <input 
      type="text" 
      value={lieuxList.searchTerm} 
      onChange={e => lieuxList.setSearchTerm(e.target.value)}
      placeholder="Rechercher un lieu..."
    />
    
    <select onChange={e => lieuxList.setFilter('type', e.target.value)}>
      <option value="">Tous les types</option>
      <option value="salle">Salles</option>
      <option value="festival">Festivals</option>
    </select>
    
    {lieuxList.loading ? (
      <div>Chargement...</div>
    ) : (
      <ul>
        {lieuxList.items.map(lieu => (
          <li key={lieu.id}>{lieu.nom} - {lieu.ville}</li>
        ))}
      </ul>
    )}
    
    <div className="pagination">
      <button 
        onClick={lieuxList.prevPage} 
        disabled={lieuxList.currentPage === 1}
      >
        Précédent
      </button>
      <span>Page {lieuxList.currentPage} / {lieuxList.totalPages}</span>
      <button 
        onClick={lieuxList.nextPage} 
        disabled={!lieuxList.hasMore}
      >
        Suivant
      </button>
    </div>
  </div>
);
```

### Exemple avancé : Liste de concerts avec filtres complexes

```javascript
const concertsList = useGenericEntityList({
  collectionName: 'concerts',
  searchFields: ['titre', 'artisteCache.nom', 'lieuCache.nom'],
  initialSortField: 'date',
  initialSortDirection: 'desc',
  filterConfig: {
    status: {
      type: 'in',
      firestoreOperator: 'in',
      multiple: true,
      options: ['confirmed', 'pending', 'cancelled']
    },
    date: {
      type: 'date-range',
      firestoreOperator: {
        start: '>=',
        end: '<='
      }
    }
  },
  transformItem: (concert) => ({
    ...concert,
    displayDate: formatDate(concert.date),
    isPast: new Date(concert.date) < new Date()
  }),
  customQueryBuilder: (baseQuery, filters, sortField, sortDirection) => {
    // Logique personnalisée pour construire la requête
    let q = baseQuery;
    
    // Exemple: Si on affiche les concerts passés, on ajoute un tri différent
    if (filters.showPast) {
      q = query(q, orderBy('date', 'desc'));
    } else {
      q = query(q, orderBy('date'));
    }
    
    return q;
  }
});

// Utilisation dans un composant
// ...
```

### Migration depuis un hook existant

Pour migrer depuis un hook existant comme `useLieuxFilters` :

```javascript
// Ancien hook spécifique
const useLieuxFilters = (initialFilters = {}) => {
  // ... logique spécifique
};

// Nouveau hook basé sur useGenericEntityList
const useLieuxFilters = (initialFilters = {}) => {
  const listHook = useGenericEntityList({
    collectionName: 'lieux',
    initialFilters,
    searchFields: ['nom', 'ville', 'adresse'],
    filterConfig: {
      type: {
        type: 'equals',
        firestoreOperator: '=='
      },
      ville: {
        type: 'equals',
        firestoreOperator: '=='
      },
      capacite: {
        type: 'range',
        firestoreOperator: {
          min: '>=',
          max: '<='
        }
      }
    },
    initialSortField: 'nom'
  });
  
  // Adapter l'interface pour maintenir la compatibilité
  return {
    lieux: listHook.items,
    loading: listHook.loading,
    error: listHook.error,
    filters: listHook.filters,
    handleFilterChange: listHook.setFilter,
    resetFilters: listHook.resetFilters,
    hasMore: listHook.hasMore,
    loadMore: listHook.loadMore
  };
};
```

## Implémentation interne

L'implémentation interne de `useGenericEntityList` utilisera :

- `useState` pour gérer les différents états (filtres, tri, pagination)
- `useEffect` pour déclencher les requêtes lors des changements de filtres/tri
- `useMemo` pour optimiser le filtrage et le tri côté client
- `useCallback` pour mémoriser les fonctions fréquemment référencées
- Firebase Firestore pour les requêtes de données

L'architecture interne suivra une approche modulaire :

1. **Module de construction de requête** : Transforme les filtres en contraintes Firestore
2. **Module de chargement de données** : Gère les requêtes Firestore et la pagination
3. **Module de filtrage client** : Applique les filtres qui ne peuvent pas être résolus côté serveur
4. **Module de tri** : Gère le tri des données locales ou la construction des requêtes ordonnées
5. **Module de pagination** : Gère la navigation entre les pages et le chargement incrémental

## Recommandations d'utilisation

1. **Choisir le bon mode de pagination** :
   - Pour les petites collections (< 1000 éléments), la pagination côté client est souvent plus flexible
   - Pour les grandes collections, privilégier la pagination côté serveur

2. **Optimiser les requêtes Firestore** :
   - Utiliser `defaultFilters` pour les filtres qui seront toujours appliqués
   - Créer des index composites pour les requêtes fréquentes
   - Limiter le nombre de champs récupérés si nécessaire

3. **Privilégier le filtrage côté serveur** :
   - Quand c'est possible, utilisez des filtres qui peuvent être appliqués directement dans les requêtes Firestore
   - Réservez le filtrage côté client pour les cas complexes non supportés par Firestore

4. **Gestion des relations** :
   - Pour les données liées fréquemment accédées, utilisez des données mises en cache (ex: `artisteCache` dans `concerts`)
   - Pour les relations plus dynamiques, envisagez de charger les données liées séparément

## Prochaines étapes

1. Implémentation du hook générique
2. Création de tests unitaires et d'intégration
3. Migration progressive des hooks existants
4. Documentation des patterns d'utilisation avancés

## Historique des modifications

| Date | Description | Auteur |
|------|-------------|--------|
| 05/05/2025 | Création du document | Copilot |
| - | - | - |