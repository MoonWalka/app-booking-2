# Architecture du projet app-booking-2

Ce document décrit l'architecture optimisée du projet app-booking-2 après la refactorisation.

## Structure du projet

```
app-booking-2/
├── public/                # Fichiers statiques
├── src/                   # Code source
│   ├── components/        # Composants UI
│   │   ├── atoms/         # Composants UI de base (boutons, inputs, etc.)
│   │   ├── molecules/     # Composants UI composés (GenericList, etc.)
│   │   ├── concerts/      # Composants spécifiques aux concerts
│   │   ├── lieux/         # Composants spécifiques aux lieux
│   │   ├── programmateurs/# Composants spécifiques aux programmateurs
│   │   ├── forms/         # Composants de formulaires
│   │   ├── common/        # Composants communs
│   │   └── layout/        # Composants de mise en page
│   ├── hooks/             # Logique métier réutilisable
│   │   ├── forms/         # Hooks pour les formulaires
│   │   └── lists/         # Hooks pour les listes
│   ├── services/          # Services d'accès aux données
│   ├── utils/             # Fonctions utilitaires
│   │   └── tests/         # Tests unitaires
│   ├── style/             # Styles centralisés
│   ├── pages/             # Assemblage des composants pour chaque route
│   ├── context/           # Contextes React
│   ├── firebase.js        # Configuration Firebase
│   └── ...
├── package.json           # Dépendances et scripts
└── ...
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

## Optimisations de performance

L'architecture intègre plusieurs optimisations de performance :

- **Pagination** pour les requêtes Firebase
- **Mise en cache** pour réduire les appels réseau
- **Mémoisation** des fonctions de rendu avec useCallback
