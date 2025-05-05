# Architecture du projet app-booking-2

Ce document décrit l'architecture optimisée du projet app-booking-2.

## Structure du projet

```
app-booking-2/
├── public/                # Fichiers statiques
├── src/                   # Code source
│   ├── components/        # Composants UI
│   │   ├── ui/            # Composants UI de base (boutons, inputs, etc.)
│   │   ├── molecules/     # Composants UI composés (GenericList, etc.)
│   │   ├── concerts/      # Composants spécifiques aux concerts
│   │   ├── contrats/      # Composants spécifiques aux contrats
│   │   ├── lieux/         # Composants spécifiques aux lieux
│   │   ├── programmateurs/# Composants spécifiques aux programmateurs
│   │   │   ├── desktop/   # Version desktop des composants programmateurs
│   │   │   ├── mobile/    # Version mobile des composants programmateurs
│   │   │   └── sections/  # Sections de formulaire des programmateurs
│   │   ├── structures/    # Composants spécifiques aux structures
│   │   │   ├── desktop/   # Version desktop des composants structures
│   │   │   ├── mobile/    # Version mobile des composants structures
│   │   │   └── core/      # Composants core des structures
│   │   ├── artistes/      # Composants spécifiques aux artistes
│   │   ├── forms/         # Composants de formulaires
│   │   ├── common/        # Composants communs
│   │   ├── layout/        # Composants de mise en page
│   │   ├── pdf/           # Composants pour la génération de documents PDF
│   │   ├── parametres/    # Composants pour les paramètres de l'application
│   │   └── validation/    # Composants pour la validation des formulaires
│   ├── hooks/             # Logique métier réutilisable
│   │   ├── useIsMobile.js # Hook pour détecter les appareils mobiles
│   │   ├── useResponsiveComponent.js # Hook pour le chargement conditionnel des composants
│   │   ├── useTheme.js    # Hook pour la gestion du thème
│   │   ├── forms/         # Hooks pour les formulaires
│   │   ├── lists/         # Hooks pour les listes
│   │   ├── concerts/      # Hooks spécifiques aux concerts
│   │   ├── programmateurs/# Hooks spécifiques aux programmateurs
│   │   ├── structures/    # Hooks spécifiques aux structures
│   │   ├── firestore/     # Hooks d'accès à Firestore
│   │   ├── search/        # Hooks pour les fonctionnalités de recherche
│   │   └── common/        # Hooks communs
│   ├── services/          # Services d'accès aux données
│   ├── utils/             # Fonctions utilitaires
│   ├── styles/            # Styles centralisés
│   ├── pages/             # Assemblage des composants pour chaque route
│   │   └── css/           # Styles spécifiques aux pages
│   ├── context/           # Contextes React
│   │   ├── AuthContext.js # Contexte d'authentification
│   │   └── ParametresContext.js # Contexte des paramètres
│   ├── firebaseInit.js    # Initialisation Firebase
│   └── mockStorage.js     # Système de stockage local pour tests
├── docs/                  # Documentation du projet
├── functions/             # Fonctions Cloud Firebase
├── package.json           # Dépendances et scripts
└── ...
```

## Architecture en couches

L'architecture du projet suit une approche en couches qui sépare clairement les responsabilités :

### 1. Couche de présentation (UI)

- **Composants** : Responsables uniquement de l'affichage et des interactions utilisateur
- **Pages** : Assemblent les composants pour former des vues complètes
- **Styles** : Centralise les styles avec des variables CSS et modules CSS pour l'isolation des styles

### 2. Couche logique (Business Logic)

- **Hooks** : Encapsulent la logique métier et l'état
- **Context** : Gèrent l'état global de l'application
- **Validation** : Schémas de validation pour garantir l'intégrité des données

### 3. Couche d'accès aux données

- **Services** : Centralisent les opérations d'accès aux données
- **Firebase** : Configuration et interface avec Firebase
- **mockStorage** : Système de stockage local pour le développement et les tests

## Architecture responsive multi-device

Le projet implémente une architecture permettant d'adapter l'interface aux différents appareils :

### Structure de dossiers par device

Les composants spécifiques à un type d'appareil sont organisés dans des dossiers dédiés :
- `/desktop` : Composants optimisés pour les écrans larges
- `/mobile` : Composants optimisés pour les écrans mobiles

### Mode "En construction" pour les composants mobiles

À partir du 3 mai 2025, les composants mobiles ont été temporairement mis en pause et remplacés par un composant uniforme "UnderConstruction" qui informe les utilisateurs que la version mobile est en cours de développement. Ce choix permet de :

- Maintenir la structure responsive du projet
- Informer clairement les utilisateurs de l'indisponibilité temporaire de la version mobile
- Faciliter le développement futur des fonctionnalités mobiles
- Unifier l'expérience utilisateur sur mobile

Le composant `UnderConstruction` est implémenté dans `src/components/common/UnderConstruction.js` et est utilisé dans tous les composants mobiles principaux.

### Chargement conditionnel avec hooks

Le hook `useResponsiveComponent` permet de charger dynamiquement le composant approprié :

```jsx
// Exemple d'utilisation du hook useResponsiveComponent
const LieuDetails = useResponsiveComponent('lieux/LieuDetails');
```

Le hook `useIsMobile` permet d'adapter les comportements selon le type d'appareil :

```jsx
const isMobile = useIsMobile();
return isMobile ? <MobileView /> : <DesktopView />;
```

## Modèle de données et associations entre entités

L'application gère plusieurs types d'entités et leurs relations bidirectionnelles :

### Associations bidirectionnelles

#### Programmateurs - Structures

- Un programmateur est associé à une structure via `structureId`
- Une structure référence ses programmateurs via le tableau `programmateurs`
- Les composants `ProgrammateurStructuresSection` et `StructureInfoSection` gèrent cette relation

#### Artistes - Structures

- Un artiste peut être associé à une structure (label, agence...)
- Les associations sont maintenues de façon bidirectionnelle

#### Lieux - Programmateurs

- Un lieu peut être associé à un ou plusieurs programmateurs
- La relation est gérée par le composant `LieuProgrammateurSection`

#### Concerts - Lieux - Artistes

- Un concert est associé à un lieu et à un ou plusieurs artistes
- Les relations sont gérées dans les formulaires de création de concerts

### Intégrité référentielle

Le système maintient l'intégrité référentielle :
- Lors de la suppression d'une entité, les références sont nettoyées dans les entités associées
- Les hooks de mise à jour gèrent les mises à jour des références dans les deux sens

## Flux de données

Le flux de données dans l'application suit un modèle unidirectionnel :

1. **Services** récupèrent les données depuis Firebase/mockStorage
2. **Hooks** consomment ces services et gèrent la logique métier
3. **Composants** utilisent les hooks et affichent les données
4. **Interactions utilisateur** déclenchent des actions dans les hooks
5. **Hooks** mettent à jour les données via les services

### Exemple concret de flux de données

```
User Action → Component → Custom Hook → Firestore/mockStorage → Hook (update state) → Component Re-render
```

## Validation des formulaires

Le système de validation des formulaires utilise une combinaison de :

1. **Formik** pour la gestion des formulaires
2. **Yup** pour les schémas de validation
3. **Composants personnalisés** pour l'affichage des erreurs

Les schémas de validation sont organisés par entité pour maintenir la cohérence des règles métier à travers l'application.

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

## Génération de documents PDF

Le système dispose d'une architecture dédiée à la génération de documents PDF :

1. **Composants PDF** : Définissent la structure des documents PDF
2. **Templates** : Modèles de documents personnalisables
3. **Service de génération** : Convertit les composants React en documents PDF

## Optimisations de performance

L'architecture intègre plusieurs optimisations de performance :

- **Pagination** pour les requêtes Firebase
- **Mise en cache** pour réduire les appels réseau
- **Mémoisation** des fonctions de rendu avec useCallback et useMemo
- **Chargement conditionnel** des composants selon le device
- **Debounce** pour éviter les appels trop fréquents aux API et à Firestore
