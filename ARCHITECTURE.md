# Architecture du projet app-booking-2

Ce document décrit l'architecture optimisée du projet app-booking-2 après la refactorisation complète.

## Structure du projet

```
src/
├── components/       # Composants UI
│   ├── atoms/        # Composants UI de base (boutons, inputs, etc.)
│   ├── molecules/    # Composants UI composés (GenericList, etc.)
│   ├── organisms/    # Sections complètes (Header, Sidebar, etc.)
│   ├── templates/    # Layouts réutilisables
│   ├── concerts/     # Composants spécifiques aux concerts
│   ├── lieux/        # Composants spécifiques aux lieux
│   ├── programmateurs/ # Composants spécifiques aux programmateurs
│   ├── forms/        # Composants de formulaires
│   ├── common/       # Composants communs
│   └── layout/       # Composants de mise en page
├── hooks/            # Logique métier réutilisable
│   ├── forms/        # Hooks pour les formulaires
│   └── lists/        # Hooks pour les listes
├── services/         # Services d'accès aux données
│   └── api/          # Services d'API
├── utils/            # Fonctions utilitaires
│   └── tests/        # Tests unitaires
├── style/            # Styles centralisés
├── pages/            # Assemblage des composants pour chaque route
├── context/          # Contextes React
├── firebase.js       # Configuration Firebase
└── mockStorage.js    # Stockage local pour les tests
```

## Architecture en couches

L'architecture du projet suit une approche en couches qui sépare clairement les responsabilités :

### 1. Couche de présentation (UI)

- **Composants** : Responsables uniquement de l'affichage et des interactions utilisateur
- **Pages** : Assemblent les composants pour former des vues complètes
- **Style** : Centralise les styles avec des variables CSS

### 2. Couche logique (Business Logic)

- **Hooks** : Encapsulent la logique métier et l'état
- **Context** : Gèrent l'état global de l'application

### 3. Couche d'accès aux données

- **Services** : Centralisent les opérations d'accès aux données
- **Firebase** : Configuration et interface avec Firebase

## Flux de données

Le flux de données dans l'application suit un modèle unidirectionnel :

1. **Services** récupèrent les données depuis Firebase
2. **Hooks** consomment ces services et gèrent la logique métier
3. **Composants** utilisent les hooks et affichent les données
4. **Interactions utilisateur** déclenchent des actions dans les hooks
5. **Hooks** mettent à jour les données via les services

## Composants génériques

L'architecture utilise des composants génériques pour réduire la duplication de code :

### GenericList

Un composant réutilisable pour afficher des listes avec recherche et filtrage :

```jsx
<GenericList
  title="Titre de la liste"
  items={items}
  renderItem={renderItem}
  searchFields={searchFields}
  filterOptions={filterOptions}
  addButtonText="Ajouter"
  addButtonLink="/ajouter"
  loading={loading}
  emptyMessage="Aucun élément trouvé."
/>
```

### Hooks personnalisés

Des hooks spécifiques encapsulent la logique métier pour chaque type de données :

```jsx
// Exemple d'utilisation d'un hook personnalisé
const { 
  concerts, 
  loading, 
  error, 
  searchFields, 
  filterOptions 
} = useConcertsList();
```

## Services Firebase

Les services Firebase centralisent les opérations CRUD pour chaque collection :

```javascript
// Exemple d'utilisation d'un service
const concerts = await concertService.getAll(10, lastVisible);
const concert = await concertService.getById(id);
await concertService.update(id, updatedData);
```

## Tests

L'architecture prend en charge les tests à différents niveaux :

- **Tests unitaires** pour les composants, hooks et services
- **Tests d'intégration** pour vérifier les interactions entre les différentes couches

## Optimisations de performance

L'architecture intègre plusieurs optimisations de performance :

- **Lazy loading** des composants de page
- **Pagination** pour les requêtes Firebase
- **Mise en cache** pour réduire les appels réseau
- **Mémoisation** des fonctions de rendu avec useCallback

## Extensibilité

L'architecture est conçue pour être facilement extensible :

- Ajout de nouveaux types de données en créant de nouveaux services et hooks
- Extension des composants génériques pour prendre en charge de nouvelles fonctionnalités
- Ajout de nouvelles pages en assemblant les composants existants
