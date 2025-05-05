# Analyse des hooks et composants de liste existants

*Document créé le: 5 mai 2025*

## Objectif

Ce document analyse les hooks et composants actuels de TourCraft qui gèrent des listes d'entités, afin d'identifier les fonctionnalités communes et les spécificités à prendre en compte dans la conception du hook générique `useGenericEntityList`.

## Hooks de liste analysés

### 1. useLieuxFilters

**Fonctionnalités principales**:
- Chargement paginé de lieux depuis Firestore
- Filtrage par ville, capacité et type de lieu
- Recherche textuelle sur nom/ville/adresse
- Tri par différents critères (nom, ville, capacité)
- Gestion de l'état de chargement et des erreurs
- Rafraîchissement des données

**Structure de code**:
```javascript
// Imports...
const useLieuxFilters = (initialFilters = {}) => {
  // États pour les filtres
  const [filters, setFilters] = useState(initialFilters);
  const [lieux, setLieux] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  // Chargement initial
  useEffect(() => {
    loadInitialData();
  }, [filters]);

  // Chargement des données en fonction des filtres
  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Construction de la requête Firestore avec les filtres
      let q = collection(db, "lieux");
      
      // Application des filtres
      if (filters.ville) {
        q = query(q, where("ville", "==", filters.ville));
      }
      if (filters.type) {
        q = query(q, where("type", "==", filters.type));
      }
      if (filters.capaciteMin) {
        q = query(q, where("capacite", ">=", parseInt(filters.capaciteMin)));
      }
      // etc...
      
      // Exécution de la requête
      const querySnapshot = await getDocs(q);
      const fetchedLieux = [];
      querySnapshot.forEach((doc) => {
        fetchedLieux.push({ id: doc.id, ...doc.data() });
      });
      
      setLieux(fetchedLieux);
      // Gestion de la pagination
      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
      setHasMore(querySnapshot.docs.length === LIMIT);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Chargement des données suivantes (pagination)
  const loadMore = async () => {
    // Logique similaire mais avec startAfter(lastDoc)
  };

  // Mise à jour des filtres
  const handleFilterChange = (filterName, value) => {
    // Mise à jour de l'état des filtres
  };

  // Réinitialisation des filtres
  const resetFilters = () => {
    // Retour aux filtres par défaut
  };

  // Retourne l'API du hook
  return {
    lieux,
    loading,
    error,
    filters,
    hasMore,
    handleFilterChange,
    loadMore,
    resetFilters,
  };
};
```

### 2. useConcertFilters

**Fonctionnalités principales**:
- Filtrage de concerts par date, lieu, statut, artiste
- Support pour des intervalles de dates
- Recherche textuelle sur titre/artiste
- Tri par date (croissant/décroissant)
- Chargement paginé depuis Firestore
- Support pour des filtres complexes (statuts multiples)

**Spécificités notables**:
- Gestion de la logique d'affichage des concerts passés vs. à venir
- Support pour la recherche de valeurs dans des tableaux (tags)
- Logique de filtrage plus complexe que d'autres entités

### 3. useArtistesList

**Fonctionnalités principales**:
- Chargement d'une liste d'artistes
- Filtrage par style musical et tags
- Recherche textuelle sur nom d'artiste
- Support pour le tri par popularité ou ordre alphabétique
- Gestion de la suppression d'artistes

**Spécificités notables**:
- Calcul de métriques additionnelles (nombre de concerts)
- Chargement de données associées (concerts liés)

### 4. ListWithFilters (Composant avec logique intégrée)

**Description**:
Ce n'est pas un hook mais un composant réutilisable qui intègre sa propre logique de liste avec filtres. Il est utilisé dans plusieurs parties de l'application.

**Fonctionnalités principales**:
- Interface utilisateur pour les filtres et la liste
- Support pour les filtres personnalisables
- Pagination côté client
- Tri et recherche

**Structure**:
```jsx
const ListWithFilters = ({ 
  items, 
  renderItem,
  filterOptions,
  searchFields,
  initialFilters,
  sortOptions,
  loading,
  itemsPerPage = 10
}) => {
  // État local pour les filtres actifs
  const [activeFilters, setActiveFilters] = useState(initialFilters || {});
  // État pour la recherche
  const [searchTerm, setSearchTerm] = useState('');
  // État pour le tri
  const [sortBy, setSortBy] = useState(sortOptions?.[0]?.value);
  // État pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  
  // Logique de filtrage
  const filteredItems = useMemo(() => {
    return items
      .filter(item => {
        // Appliquer les filtres actifs
        // Recherche textuelle
      })
      .sort((a, b) => {
        // Tri selon critère
      });
  }, [items, activeFilters, searchTerm, sortBy]);
  
  // Pagination
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);
  
  // Gestionnaires d'événements
  const handleFilterChange = (filterName, value) => {
    // Mise à jour des filtres
  };
  
  // Rendu du composant
  return (
    <div>
      {/* Composants de filtres et recherche */}
      <div className="list-filters">
        {/* ... */}
      </div>
      
      {/* Liste d'éléments */}
      <div className="list-items">
        {paginatedItems.map(item => renderItem(item))}
      </div>
      
      {/* Pagination */}
      {/* ... */}
    </div>
  );
};
```

## Fonctionnalités communes identifiées

Après analyse des hooks existants, voici les fonctionnalités communes qui devraient être intégrées dans le hook générique `useGenericEntityList` :

1. **Chargement de données**:
   - Chargement initial basé sur les filtres
   - Support pour la pagination (chargement de plus de résultats)
   - Gestion des états de chargement et d'erreur

2. **Filtrage**:
   - Support pour divers types de filtres (égalité, intervalle, inclusion)
   - Filtres simples et filtres composites
   - Mémorisation des filtres appliqués

3. **Recherche**:
   - Recherche textuelle sur un ou plusieurs champs
   - Logique de correspondance partielle

4. **Tri**:
   - Support pour différents critères de tri
   - Ordre ascendant/descendant
   - Tri sur des champs imbriqués

5. **Pagination**:
   - Contrôle du nombre d'éléments par page
   - Navigation entre les pages
   - Détection s'il y a plus de résultats à charger

6. **Gestion d'état**:
   - État de la liste d'éléments
   - État des filtres et de la recherche
   - État du tri et de la pagination

7. **Actions**:
   - Rafraîchissement des données
   - Réinitialisation des filtres
   - Modification des filtres

8. **Optimisations**:
   - Mémorisation des résultats filtrés (useMemo)
   - Debounce de la recherche
   - Chargement conditionnel basé sur les changements de filtres

## Spécificités à prendre en compte

Certaines spécificités doivent être considérées pour permettre au hook générique de s'adapter à différents cas d'utilisation :

1. **Types de filtres variables**:
   - Certaines entités nécessitent des filtres spécifiques
   - Les types de filtres peuvent varier (sélection, checkbox, plage de valeurs)

2. **Logique de recherche personnalisée**:
   - La logique de recherche peut nécessiter des adaptations selon l'entité
   - Recherche sur champs imbriqués ou tableaux

3. **Comportement de pagination**:
   - Certains hooks utilisent une pagination côté serveur (Firestore)
   - D'autres utilisent une pagination côté client

4. **Logique métier spécifique**:
   - Certaines listes incluent des calculs ou transformations spécifiques
   - Filtrage par relations (ex: concerts d'un artiste spécifique)

## Paramètres recommandés pour useGenericEntityList

Sur la base de cette analyse, voici les paramètres recommandés pour le hook `useGenericEntityList` :

```javascript
const useGenericEntityList = ({
  // Configuration de la collection
  collectionName,                  // Nom de la collection Firestore
  transformItem = (item) => item,  // Transformation des éléments avant affichage
  
  // Configuration des filtres
  initialFilters = {},             // Filtres initiaux
  filterConfig = {},               // Configuration des champs et types de filtres
  
  // Configuration de la recherche
  searchFields = [],               // Champs sur lesquels effectuer la recherche
  searchConfig = {},               // Configuration avancée de la recherche
  
  // Configuration du tri
  initialSortField = null,         // Champ de tri initial
  initialSortDirection = 'asc',    // Direction de tri initiale
  
  // Configuration de la pagination
  pageSize = 10,                   // Éléments par page
  usePaginationMode = 'server',    // 'server' ou 'client'
  
  // Callbacks
  onItemsLoaded,                   // Callback après chargement des éléments
  onError,                         // Callback en cas d'erreur
  
  // Options avancées
  customFiltering,                 // Fonction de filtrage personnalisée 
  customSorting,                   // Fonction de tri personnalisée
  includeDeleted = false,          // Inclure les éléments supprimés
  realtime = false                 // Utiliser une écoute temps réel
}) => {
  // Implémentation...
  
  // Retourne l'API du hook
  return {
    // États
    items,                         // Liste des éléments filtrés et triés
    loading,                       // État de chargement
    error,                         // Erreur éventuelle
    
    // Pagination
    currentPage,                   // Page actuelle
    totalPages,                    // Nombre total de pages
    hasMore,                       // A-t-on plus de résultats à charger ?
    
    // Filtres et recherche
    filters,                       // Filtres actuels
    searchTerm,                    // Terme de recherche actuel
    
    // Tri
    sortField,                     // Champ de tri actuel
    sortDirection,                 // Direction de tri actuelle
    
    // Actions
    setPage,                       // Définir la page actuelle
    loadMore,                      // Charger plus de résultats
    setFilter,                     // Définir un filtre
    setFilters,                    // Définir plusieurs filtres
    resetFilters,                  // Réinitialiser les filtres
    setSearchTerm,                 // Définir le terme de recherche
    setSorting,                    // Définir le tri
    refresh,                       // Rafraîchir les données
  };
};
```

## Recommandations pour l'implémentation

1. **Architecture modulaire**:
   - Séparer la logique de filtrage, tri, pagination et chargement de données
   - Utiliser des hooks internes pour une meilleure organisation du code

2. **Utilisation efficace de useMemo et useCallback**:
   - Mémoriser les résultats filtrés et triés pour éviter des recalculs inutiles
   - Utiliser useCallback pour les fonctions fréquemment référencées

3. **Gestion efficace des requêtes Firestore**:
   - Optimiser les requêtes en fonction des filtres
   - Éviter les requêtes inutiles lors des changements de filtres mineurs
   - Utiliser les index composés pour les requêtes complexes

4. **Options de personnalisation**:
   - Permettre l'injection de logiques personnalisées pour le filtrage et le tri
   - Supporter des transformations avant/après le chargement des données

5. **Documentation claire**:
   - Documenter tous les paramètres et valeurs de retour
   - Fournir des exemples d'utilisation pour différents scénarios

## Conclusion

Le hook générique `useGenericEntityList` doit être conçu pour être suffisamment flexible pour répondre à tous les cas d'utilisation identifiés, tout en maintenant une interface simple et cohérente. Il devra gérer efficacement le chargement des données, le filtrage, la recherche, le tri et la pagination, tout en permettant des personnalisations pour des besoins spécifiques.

Ce document servira de base pour la conception de l'API du hook et son implémentation dans le cadre de la phase 2 du plan de migration des hooks génériques de l'application TourCraft.

---

**Prochaine étape**: Conception de l'API du hook useGenericEntityList (22/05/2025)