# Spécification d'API: useGenericEntitySearch

*Document créé le: 11 mai 2025*

## Vue d'ensemble

`useGenericEntitySearch` est un hook générique conçu pour centraliser la logique de recherche d'entités dans l'application TourCraft. Il remplace plusieurs hooks spécifiques à certains types d'entités (artistes, lieux, programmateurs, etc.) en fournissant une interface unifiée et configurable.

## Objectifs

- Standardiser l'interface de recherche d'entités dans l'application
- Réduire la duplication de code entre les hooks de recherche
- Améliorer la maintenabilité et la testabilité du code
- Permettre la personnalisation du comportement pour différents types d'entités

## API

### Paramètres

`useGenericEntitySearch` accepte un objet de configuration avec les propriétés suivantes :

| Propriété | Type | Requis | Description |
|-----------|------|--------|-------------|
| `collectionName` | string | Oui | Le nom de la collection Firestore à rechercher |
| `searchFields` | string[] | Oui | Les champs sur lesquels effectuer la recherche |
| `debounceTime` | number | Non | Le délai de debounce en ms (défaut: 300) |
| `initialSearchTerm` | string | Non | Terme de recherche initial (défaut: '') |
| `limit` | number | Non | Limite du nombre de résultats (défaut: 10) |
| `transformResult` | function | Non | Fonction de transformation des résultats |
| `customFilter` | function | Non | Fonction de filtrage personnalisée |
| `useLocalSearch` | boolean | Non | Si true, la recherche est effectuée localement (défaut: false) |
| `preloadData` | boolean | Non | Si true, précharge toutes les données au chargement (pour la recherche locale, défaut: false) |
| `sortResults` | function | Non | Fonction de tri des résultats |
| `searchCondition` | function | Non | Condition pour déclencher la recherche (défaut: term => term.length >= 2) |

### Valeur retournée

Le hook retourne un objet contenant les propriétés et méthodes suivantes :

| Propriété/Méthode | Type | Description |
|-------------------|------|-------------|
| `searchTerm` | string | Terme de recherche actuel |
| `setSearchTerm` | function | Fonction pour mettre à jour le terme de recherche |
| `results` | array | Résultats de la recherche |
| `isSearching` | boolean | Indique si une recherche est en cours |
| `error` | object | Erreur éventuelle lors de la recherche |
| `selectedEntity` | object | Entité sélectionnée |
| `setSelectedEntity` | function | Fonction pour définir l'entité sélectionnée |
| `searchResults` | array | Alias pour `results` (compatibilité) |
| `isLoading` | boolean | Alias pour `isSearching` (compatibilité) |
| `showDropdown` | boolean | Indique si le dropdown de résultats doit être affiché |
| `setShowDropdown` | function | Fonction pour contrôler l'affichage du dropdown |
| `refreshSearch` | function | Force une nouvelle recherche avec le terme actuel |
| `clearSearch` | function | Efface les résultats et le terme de recherche |
| `handleInputChange` | function | Gestion du changement d'entrée (avec debounce) |
| `handleResultClick` | function | Gestion du clic sur un résultat |
| `handleInputFocus` | function | Gestion du focus sur le champ de recherche |
| `isValidSelection` | function | Vérifie si la sélection est valide |
| `clearSelection` | function | Efface l'entité sélectionnée |

## Exemples d'utilisation

### Exemple simple : Recherche d'artistes

```javascript
const artisteSearch = useGenericEntitySearch({
  collectionName: 'artistes',
  searchFields: ['nom', 'style']
});

// Utilisation
return (
  <>
    <input 
      type="text" 
      value={artisteSearch.searchTerm} 
      onChange={e => artisteSearch.setSearchTerm(e.target.value)}
      onFocus={artisteSearch.handleInputFocus}
    />
    
    {artisteSearch.showDropdown && (
      <ul>
        {artisteSearch.isSearching ? (
          <li>Chargement...</li>
        ) : (
          artisteSearch.results.map(artiste => (
            <li 
              key={artiste.id}
              onClick={() => artisteSearch.handleResultClick(artiste)}
            >
              {artiste.nom}
            </li>
          ))
        )}
      </ul>
    )}
    
    {artisteSearch.selectedEntity && (
      <div>
        Artiste sélectionné : {artisteSearch.selectedEntity.nom}
        <button onClick={artisteSearch.clearSelection}>Supprimer</button>
      </div>
    )}
  </>
);
```

### Exemple avancé : Recherche personnalisée de lieux avec filtrage

```javascript
const lieuSearch = useGenericEntitySearch({
  collectionName: 'lieux',
  searchFields: ['nom', 'ville', 'codePostal'],
  customFilter: (lieu) => lieu.actif === true,
  transformResult: (lieu) => ({
    ...lieu,
    displayName: `${lieu.nom} (${lieu.ville}, ${lieu.codePostal})`
  }),
  sortResults: (a, b) => a.ville.localeCompare(b.ville)
});

// Utilisation avec composant SearchDropdown
return (
  <SearchDropdown
    value={lieuSearch.searchTerm}
    onChange={lieuSearch.handleInputChange}
    onFocus={lieuSearch.handleInputFocus}
    isLoading={lieuSearch.isLoading}
    results={lieuSearch.results}
    showDropdown={lieuSearch.showDropdown}
    onResultClick={lieuSearch.handleResultClick}
    displayField="displayName"
    placeholder="Rechercher un lieu..."
  />
);
```

### Migration depuis un hook existant

Pour migrer depuis un hook existant comme `useLieuSearch` :

```javascript
// Ancien hook spécifique
const useLieuSearch = (initialTerm = '') => {
  // ... logique spécifique
};

// Nouveau hook basé sur useGenericEntitySearch
const useLieuSearch = (initialTerm = '') => {
  const searchHook = useGenericEntitySearch({
    collectionName: 'lieux',
    searchFields: ['nom', 'ville', 'codePostal'],
    initialSearchTerm: initialTerm,
    transformResult: (lieu) => ({
      ...lieu,
      displayName: `${lieu.nom} (${lieu.ville})`
    })
  });
  
  // Adapter l'interface si nécessaire pour maintenir la compatibilité
  return {
    ...searchHook,
    // Propriétés spécifiques à useLieuSearch
    lieu: searchHook.selectedEntity,
    setLieu: searchHook.setSelectedEntity,
    // Fonctions spécifiques éventuelles
    resetSearch: searchHook.clearSearch
  };
};
```

## Implémentation interne

L'implémentation interne de `useGenericEntitySearch` utilise :

- `useState` pour gérer l'état de la recherche
- `useEffect` pour déclencher les recherches
- `useMemo` et `useCallback` pour optimiser les performances
- `useDebounce` (hook personnalisé) pour limiter les requêtes
- Firebase Firestore pour les requêtes de recherche distantes

Le hook gère les cas suivants :

1. Recherche après saisie (avec debounce)
2. Recherche forcée via `refreshSearch`
3. Recherche locale vs. recherche Firestore
4. Gestion d'erreurs
5. Sélection d'entités et états du dropdown

## Tests et validation

Le hook a été testé avec succès dans le contexte de la recherche d'artistes lors de la création de concerts, comme documenté dans `CONCERT_HOOKS.md` (05/05/2025). Les tests ont confirmé que :

- La recherche s'effectue correctement avec debounce
- Les résultats s'affichent correctement dans l'interface
- La sélection d'entités fonctionne
- La recherche se déclenche également au focus du champ

Des limitations ont été identifiées concernant la recherche d'artistes plus anciens dans la base de données, qui seront adressées dans une phase ultérieure.

## Prochaines étapes

1. Migration de tous les hooks de recherche existants vers useGenericEntitySearch
2. Optimisation des performances pour les grandes collections
3. Ajout de fonctionnalités avancées (recherche avec opérateur OR, recherche par étendue, etc.)
4. Résolution du problème de recherche des anciens artistes

## Historique des modifications

| Date | Description | Auteur |
|------|-------------|--------|
| 11/05/2025 | Création du document | Copilot |
| - | - | - |