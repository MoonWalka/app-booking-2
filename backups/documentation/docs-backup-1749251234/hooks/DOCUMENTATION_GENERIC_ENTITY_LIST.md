# Documentation: useGenericEntityList

*Document créé le: 5 mai 2025*
*Dernière mise à jour: 5 mai 2025*

## 🧑‍💻 GUIDE DÉVELOPPEUR : Utiliser useGenericEntityList

### Ce que vous devez savoir

`useGenericEntityList` est un hook React générique qui simplifie la gestion des listes d'entités dans TourCraft. Il centralise les fonctionnalités de chargement, filtrage, tri et pagination des données, vous évitant de réécrire cette logique pour chaque type d'entité.

### Comment l'utiliser

#### 1. Installation et importation

```javascript
import { useGenericEntityList } from '@/hooks/common';
```

#### 2. Configuration de base

```javascript
const { items, loading, error } = useGenericEntityList({
  collectionName: 'concerts',  // Nom de la collection Firestore
  searchFields: ['titre', 'lieu'], // Champs pour la recherche
  initialSortField: 'date'     // Tri par défaut
});
```

#### 3. Exemple avec filtrage

```javascript
// Configuration des filtres
const filterConfig = {
  status: { type: 'equals' },
  date: { type: 'date-range' }
};

const { 
  items, 
  loading, 
  setFilter, 
  resetFilters 
} = useGenericEntityList({
  collectionName: 'concerts',
  filterConfig,
  initialFilters: { status: 'confirme' }
});

// Pour appliquer un filtre
const handleStatusChange = (status) => {
  setFilter('status', status);
};
```

#### 4. Exemple avec pagination

```javascript
const { 
  items, 
  loading, 
  pagination, 
  loadMore 
} = useGenericEntityList({
  collectionName: 'concerts',
  pageSize: 10
});

// Affichage avec "Charger plus"
return (
  <div>
    <ListItems items={items} />
    {pagination.hasMore && (
      <button onClick={loadMore} disabled={loading}>
        Charger plus
      </button>
    )}
  </div>
);
```

### Prochaines étapes

- Consultez la documentation complète ci-dessous pour des configurations avancées
- Migrez progressivement vos hooks de liste existants vers useGenericEntityList
- Voir `src/hooks/lieux/useLieuxFiltersMigrated.js` pour un exemple de migration

## 🤖 SECTION COPILOT : Informations Détaillées

> Cette section fournit des détails techniques complets pour GitHub Copilot.

### Fichiers connexes et leurs emplacements

- `/src/hooks/common/useGenericEntityList.js` - Implémentation du hook
- `/src/hooks/tests/useGenericEntityList.test.js` - Tests unitaires
- `/docs/hooks/SPEC_API_GENERIC_ENTITY_LIST.md` - Spécification d'API
- `/docs/hooks/ANALYSE_HOOKS_LISTE.md` - Analyse des hooks existants

### API Complète

#### Paramètres

```typescript
interface GenericEntityListConfig {
  // Configuration de base
  collectionName: string;           // Nom de la collection Firestore (obligatoire)
  idField?: string;                 // Nom du champ identifiant (défaut: 'id')
  transformItem?: (item: any) => any; // Fonction pour transformer chaque élément
  
  // Configuration du filtrage
  filterConfig?: Record<string, {   // Configuration des filtres disponibles
    type: 'equals' | 'range' | 'date-range' | 'contains' | 'in';
    firestoreOperator?: string | { start?: string; end?: string };
  }>;
  initialFilters?: Record<string, any>; // Filtres initiaux appliqués
  customQueryBuilder?: (baseQuery: any, filters: any, searchTerm: string) => any; // Constructeur de requête personnalisé
  customFiltering?: (items: any[], options: { filters: any; searchTerm: string }) => any[]; // Filtrage personnalisé côté client
  
  // Configuration de la recherche
  searchFields?: string[];         // Champs sur lesquels effectuer la recherche
  initialSearchTerm?: string;      // Terme de recherche initial
  searchDebounceTime?: number;     // Délai de debounce pour la recherche (défaut: 300ms)
  searchMinLength?: number;        // Longueur minimale pour déclencher une recherche (défaut: 2)
  
  // Configuration du tri
  initialSortField?: string;       // Champ de tri initial
  initialSortDirection?: 'asc' | 'desc'; // Direction initiale du tri (défaut: 'asc')
  disableSort?: boolean;           // Désactiver le tri
  
  // Configuration de la pagination
  pageSize?: number;               // Taille de la page (défaut: 20)
  paginationMode?: 'server' | 'client'; // Mode de pagination (défaut: 'server')
  
  // Options avancées
  realtime?: boolean;              // Récupération en temps réel des mises à jour
  cacheResults?: boolean;          // Mise en cache des résultats
  showLoadingFeedback?: boolean;   // Afficher un état de chargement (défaut: true)
  
  // Données pré-chargées (pour la pagination côté client)
  initialItems?: any[];            // Éléments pré-chargés
  
  // Callbacks
  onError?: (error: Error) => void; // Appelé en cas d'erreur
  onItemsChange?: (items: any[]) => void; // Appelé quand la liste change
  onLoadStart?: () => void;        // Appelé au début du chargement
  onLoadEnd?: (items: any[]) => void; // Appelé à la fin du chargement
}
```

#### Valeurs retournées

```typescript
interface GenericEntityListResult {
  // Données principales
  items: any[];                    // Éléments filtrés, triés et paginés
  allItems: any[];                 // Tous les éléments chargés
  filteredItems: any[];            // Éléments après filtrage et tri
  totalItems: number;              // Nombre total d'éléments
  
  // États
  loading: boolean;                // État de chargement
  error: Error | null;             // Erreur éventuelle
  
  // Recherche
  searchTerm: string;              // Terme de recherche actuel
  setSearchTerm: (term: string) => void; // Définir le terme de recherche
  
  // Filtrage
  filters: Record<string, any>;    // Filtres actuels
  setFilter: (name: string, value: any) => void; // Définir un filtre
  setMultipleFilters: (filters: Record<string, any>) => void; // Définir plusieurs filtres
  resetFilters: () => void;        // Réinitialiser tous les filtres
  
  // Tri
  sortField: string | null;        // Champ de tri actuel
  sortDirection: 'asc' | 'desc';   // Direction de tri actuelle
  setSort: (field: string, direction?: 'asc' | 'desc') => void; // Définir le tri
  toggleSortDirection: () => void; // Inverser la direction du tri
  
  // Pagination
  pagination: {
    currentPage: number;           // Page actuelle
    pageSize: number;              // Taille de la page
    totalItems: number;            // Nombre total d'éléments
    totalPages: number;            // Nombre total de pages
    hasMore: boolean;              // S'il y a plus de données à charger
    loadMore: () => void;          // Charger la page suivante
    goToPage: (pageNumber: number) => void; // Aller à une page spécifique
  };
  loadMore: () => void;            // Charger la page suivante
  hasMore: boolean;                // S'il y a plus de données à charger
  goToPage: (pageNumber: number) => void; // Aller à une page spécifique
  
  // Rafraîchir
  refresh: () => void;             // Rafraîchir les données
}
```

### Types de filtres supportés

Le hook prend en charge plusieurs types de filtres pour différents besoins :

1. **equals** : Égalité stricte
   ```javascript
   setFilter('status', 'confirme');
   ```

2. **range** : Plage de valeurs
   ```javascript
   setFilter('montant', { start: 1000, end: 5000 });
   ```

3. **date-range** : Plage de dates
   ```javascript
   setFilter('date', { 
     start: new Date('2025-01-01'), 
     end: new Date('2025-12-31') 
   });
   ```

4. **contains** : Inclusion dans un tableau
   ```javascript
   setFilter('tags', 'jazz'); // élément unique
   setFilter('tags', ['jazz', 'blues']); // plusieurs éléments
   ```

5. **in** : Appartenance à un ensemble
   ```javascript
   setFilter('lieu', ['paris', 'lyon', 'marseille']);
   ```

### Modes de pagination

Le hook supporte deux modes de pagination :

1. **server** (défaut) : La pagination est gérée côté serveur avec Firestore
   - Utilise `limit()` et `startAfter()` pour récupérer les pages
   - Plus efficace pour les grandes collections
   - Ne donne pas accès à toutes les données en même temps

2. **client** : La pagination est gérée côté client
   - Tous les éléments sont chargés en une seule requête
   - Puis filtrés, triés et paginés en mémoire
   - Recommandé uniquement pour les petites collections
   - Permet des fonctionnalités avancées comme le filtrage sur plusieurs champs simultanément

### Gestion des entités liées

Pour les cas où vous avez besoin de charger des entités liées à celles de votre liste :

```javascript
// Chargement manuel des entités liées après avoir récupéré la liste
const { items } = useGenericEntityList({
  collectionName: 'concerts'
});

useEffect(() => {
  // Pour chaque concert, charger le lieu associé
  const loadRelatedEntities = async () => {
    for (const concert of items) {
      if (concert.lieuId) {
        const lieuRef = doc(db, 'lieux', concert.lieuId);
        const lieuDoc = await getDoc(lieuRef);
        if (lieuDoc.exists()) {
          concert.lieu = lieuDoc.data();
        }
      }
    }
  };
  
  if (items.length > 0) {
    loadRelatedEntities();
  }
}, [items]);
```

### Exemples avancés

#### Filtrage personnalisé côté client

```javascript
const { items } = useGenericEntityList({
  collectionName: 'concerts',
  paginationMode: 'client',
  customFiltering: (items, { filters, searchTerm }) => {
    return items.filter(item => {
      // Logique de filtrage personnalisée
      if (filters.complex && !complexFilterLogic(item)) return false;
      
      // Recherche dans plusieurs champs concaténés
      if (searchTerm) {
        const searchContent = `${item.titre} ${item.artiste} ${item.lieu}`.toLowerCase();
        if (!searchContent.includes(searchTerm.toLowerCase())) return false;
      }
      
      return true;
    });
  }
});
```

#### Requête Firestore personnalisée

```javascript
const { items } = useGenericEntityList({
  collectionName: 'concerts',
  customQueryBuilder: (baseQuery, filters, searchTerm) => {
    let q = query(baseQuery);
    
    // Construire la requête selon vos besoins spécifiques
    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }
    
    if (filters.dateRange && filters.dateRange.start) {
      q = query(q, where('date', '>=', filters.dateRange.start));
    }
    
    // Autres clauses where, orderBy, etc.
    
    return q;
  }
});
```

#### Écoute en temps réel des modifications

```javascript
const { items } = useGenericEntityList({
  collectionName: 'concerts',
  realtime: true,
  onItemsChange: (updatedItems) => {
    console.log('Liste mise à jour en temps réel:', updatedItems);
    // Effectuer des actions supplémentaires en réponse aux mises à jour
  }
});
```

### Migration depuis un hook existant

Pour migrer depuis un hook existant tout en maintenant la compatibilité API :

```javascript
// Avant
const useLieuxFilters = (lieux = []) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('tous');
  // ... autres états et logique
  
  return { lieux, filteredLieux, searchTerm, setSearchTerm /* ... */ };
};

// Après
const useLieuxFiltersMigrated = (lieux = []) => {
  const genericList = useGenericEntityList({
    collectionName: 'lieux',
    initialItems: lieux,
    paginationMode: lieux.length > 0 ? 'client' : 'server',
    filterConfig: {
      type: { type: 'equals' }
    },
    searchFields: ['nom', 'ville', 'adresse']
  });
  
  // Adapter l'API pour maintenir la compatibilité
  return {
    lieux: genericList.allItems,
    filteredLieux: genericList.items,
    searchTerm: genericList.searchTerm,
    setSearchTerm: genericList.setSearchTerm,
    filterType: genericList.filters.type || 'tous',
    setFilterType: (type) => genericList.setFilter('type', type),
    // ... adapter d'autres propriétés au besoin
  };
};
```

### Optimisations de performance

Le hook inclut plusieurs optimisations de performance :

1. **Mise en cache des résultats** : Option `cacheResults: true` pour éviter de refaire des requêtes identiques
2. **Debounce pour la recherche** : Réduire le nombre de requêtes pendant la saisie
3. **Chargement incrémental** : Pagination pour éviter de charger toutes les données à la fois
4. **Memoization** : Utilisation de `useMemo` pour éviter des calculs inutiles sur les filtres et le tri

### Bonnes pratiques

1. **Choisissez le bon mode de pagination** :
   - Pour les petites collections (<100 éléments) : mode `client`
   - Pour les grandes collections : mode `server`

2. **Créez des configurations réutilisables** :
   ```javascript
   const CONCERTS_FILTER_CONFIG = {
     status: { type: 'equals' },
     date: { type: 'date-range' }
   };
   
   // Puis réutilisez-les
   const { items } = useGenericEntityList({
     collectionName: 'concerts',
     filterConfig: CONCERTS_FILTER_CONFIG
   });
   ```

3. **Évitez le mode temps réel pour les grandes collections** :
   Le mode temps réel peut consommer beaucoup de ressources sur de grandes collections.

4. **Utilisez `transformItem` pour normaliser les données** :
   ```javascript
   const { items } = useGenericEntityList({
     collectionName: 'concerts',
     transformItem: (concert) => ({
       ...concert,
       dateFormatted: formatDate(concert.date),
       montantFormatted: formatMontant(concert.montant)
     })
   });
   ```

### État d'avancement de la migration

| Hook original | Status | Blocages potentiels |
|---------------|--------|---------------------|
| useConcertFilters | À migrer | Dépendances spécifiques au statut |
| useLieuxFilters | En cours | Migration de test en cours |
| useArtisteFilters | À migrer | Aucun blocage identifié |
| useProgrammateursFilters | À migrer | Dépendances au composant de recherche |

### Prochaines évolutions prévues

1. **Support amélioré pour les recherches complexes**
   - Intégration potentielle avec Algolia ou Firebase Extensions
   - Prévu pour juillet 2025

2. **Meilleures performances pour les collections volumineuses**
   - Optimisation de la pagination et du chargement incrémental
   - Prévu pour juin 2025

3. **Interface utilisateur standard pour les filtres**
   - Composants génériques pour la gestion des filtres et de la recherche
   - Prévu pour août 2025

## Conclusion

`useGenericEntityList` offre une solution robuste pour la gestion des listes d'entités dans TourCraft, réduisant considérablement la duplication de code tout en offrant des fonctionnalités avancées de filtrage, tri et pagination.

---

*Références:*
- [SPEC_API_GENERIC_ENTITY_LIST.md](/docs/hooks/SPEC_API_GENERIC_ENTITY_LIST.md)
- [PLAN_MIGRATION_HOOKS_GENERIQUES.md](/docs/hooks/PLAN_MIGRATION_HOOKS_GENERIQUES.md)
- [ANALYSE_HOOKS_LISTE.md](/docs/hooks/ANALYSE_HOOKS_LISTE.md)