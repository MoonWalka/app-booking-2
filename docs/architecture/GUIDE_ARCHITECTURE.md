# Guide de l'Architecture TourCraft

*Document créé le: 5 mai 2025*
*Dernière mise à jour: 5 mai 2025*

Ce guide décrit l'architecture complète du projet app-booking-2, intégrant les principes fondamentaux, la structure des dossiers, et les approches de refactorisation mises en œuvre.

## Table des matières

1. [Structure du projet](#structure-du-projet)
2. [Architecture en couches](#architecture-en-couches)
3. [Architecture responsive multi-device](#architecture-responsive-multi-device)
4. [Modèle de données et associations entre entités](#modèle-de-données-et-associations-entre-entités)
5. [Flux de données](#flux-de-données)
6. [Validation des formulaires](#validation-des-formulaires)
7. [Composants génériques](#composants-génériques)
8. [Génération de documents PDF](#génération-de-documents-pdf)
9. [Optimisations de performance](#optimisations-de-performance)
10. [Exemple de refactorisation: Gestion des Structures](#exemple-de-refactorisation-gestion-des-structures)
11. [Exceptions connues et justifications](#exceptions-connues-et-justifications)

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
│   │   ├── useIsMobile.js # Hook pour détecter les appareils mobiles (déprécié)
│   │   ├── useResponsiveComponent.js # Hook pour le chargement conditionnel des composants
│   │   ├── useTheme.js    # Hook pour la gestion du thème
│   │   ├── common/        # Hooks communs, dont useResponsive (remplace useIsMobile)
│   │   ├── forms/         # Hooks pour les formulaires
│   │   ├── lists/         # Hooks pour les listes
│   │   ├── concerts/      # Hooks spécifiques aux concerts
│   │   ├── programmateurs/# Hooks spécifiques aux programmateurs
│   │   ├── structures/    # Hooks spécifiques aux structures
│   │   ├── firestore/     # Hooks d'accès à Firestore
│   │   └── search/        # Hooks pour les fonctionnalités de recherche
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

Le projet implémente une architecture permettant d'adapter l'interface aux différents appareils.

### Structure de dossiers par device

Les composants spécifiques à un type d'appareil sont organisés dans des dossiers dédiés :
- `/desktop` : Composants optimisés pour les écrans larges
- `/mobile` : Composants optimisés pour les écrans mobiles

### Mode "En construction" pour les composants mobiles

À partir du 3 mai 2025, les composants mobiles ont été temporairement mis en pause et remplacés par un composant uniforme "UnderConstruction". Ce choix permet de :

- Maintenir la structure responsive du projet
- Informer clairement les utilisateurs de l'indisponibilité temporaire de la version mobile
- Faciliter le développement futur des fonctionnalités mobiles
- Unifier l'expérience utilisateur sur mobile

> **Note importante**: La décision de reporter la refactorisation des composants mobiles au 15 mai 2025 a été prise pour prioriser les composants de formulaire qui sont plus critiques pour les utilisateurs actuels.

### Chargement conditionnel avec hooks

#### useResponsive (recommandé)

Le hook `useResponsive` est le hook recommandé pour gérer les comportements responsifs :

```jsx
import { useResponsive } from '@/hooks/common';

function MyComponent() {
  const { isMobile, getResponsiveComponent, dimensions } = useResponsive();
  
  // Option 1: Simple condition sur isMobile
  return (
    <div className={isMobile ? 'mobile-container' : 'desktop-container'}>
      {isMobile ? <MobileView /> : <DesktopView />}
    </div>
  );
  
  // Option 2: Utilisation du chargement dynamique de composants
  const ResponsiveView = getResponsiveComponent({
    desktopPath: 'path/to/DesktopView',
    mobilePath: 'path/to/MobileView'
  });
  
  return <ResponsiveView />;
}
```

#### Hooks dépréciés (à migrer)

Les hooks suivants sont maintenus pour compatibilité mais seront supprimés après le 15 mai 2025 :

- `useIsMobile` : Détecte les écrans mobiles (à remplacer par `useResponsive`)
- `useResponsiveComponent` : Charge dynamiquement des composants (à remplacer par `useResponsive.getResponsiveComponent`)

## Modèle de données et associations entre entités

L'application gère plusieurs types d'entités et leurs relations bidirectionnelles.

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

### Hooks génériques

Des hooks génériques encapsulent la logique métier pour plusieurs types d'entités :

- `useGenericEntitySearch`: Recherche standardisée d'entités
- `useGenericEntityList`: Gestion des listes d'entités
- `useGenericEntityDetails`: Gestion des détails d'entités
- `useGenericEntityForm`: Gestion des formulaires d'entités

```jsx
// Exemple d'utilisation d'un hook générique
const { 
  items,
  loading,
  error,
  searchTerm,
  setSearchTerm,
  filters,
  setFilter
} = useGenericEntityList({
  collectionName: 'concerts',
  searchFields: ['titre', 'lieu'],
  initialSortField: 'date'
});
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

## Exemple de refactorisation: Gestion des Structures

Cette section illustre comment les principes architecturaux ont été appliqués lors de la refactorisation de la gestion des structures.

### Problème initial

Avant la refactorisation, plusieurs problèmes étaient présents :

1. Duplication de la logique de création/mise à jour des structures entre le hook `useProgrammateurDetails` et le service `structureService`
2. Risque d'incohérences dans la gestion du `structureId`
3. Code redondant dans `StructureInfoSection`
4. Manque de clarté dans le flux de données

### Solution implémentée

#### 1. Centralisation de la logique dans `structureService.js`

Le service `structureService` est devenu le point central de gestion des structures avec une fonction `ensureStructureEntity` améliorée pour :
- Vérifier les structures existantes par ID
- Rechercher des structures par nom
- Créer de nouvelles structures
- Gérer les associations programmateur-structure

#### 2. Modification du hook `useProgrammateurDetails`

Le hook a été modifié pour utiliser exclusivement le service centralisé :
- Suppression de l'ancienne fonction `createOrUpdateStructureEntity`
- Ajout d'une nouvelle fonction `handleStructureEntity` qui utilise le service
- Amélioration de la gestion des notifications

#### 3. Simplification du composant `StructureInfoSection`

Le composant a été simplifié pour se concentrer uniquement sur l'affichage et la sélection des structures, laissant la logique au service.

### Avantages de la refactorisation

1. **Centralisation** : Toute la logique de gestion des structures est maintenant dans un seul endroit.
2. **Cohérence** : Un seul point de vérité pour les entités Structure.
3. **Maintenabilité** : Code plus facile à maintenir et à faire évoluer.
4. **Clarté** : Flux de données plus clair entre les composants.
5. **Robustesse** : Meilleure gestion des cas d'erreur et des cas limites.

## Exceptions connues et justifications

Cette section documente les exceptions à l'architecture standard et leurs justifications :

### 1. Hooks hors de leur dossier thématique

**Exception :** Les hooks `useIsMobile.js` et `useResponsiveComponent.js` sont à la racine de `/src/hooks/` alors qu'ils devraient être dans `/src/hooks/common/`.

**Justification :** Ces hooks sont en cours de migration vers `/src/hooks/common/useResponsive.js`. Ils restent à la racine pour maintenir la compatibilité avec le code existant jusqu'au 15 mai 2025.

### 2. Composants sans version mobile

**Exception :** Certains composants complexes n'ont pas d'équivalent mobile.

**Justification :** La version mobile est temporairement mise en pause pour se concentrer sur l'amélioration des composants desktop qui sont les plus utilisés. Un composant `UnderConstruction` est utilisé comme placeholder pour maintenir la cohérence architecturale.

### 3. Migrations partielles vers les hooks génériques

**Exception :** Certains hooks spécifiques coexistent avec leur version migrant vers un hook générique (ex: `useLieuDetails.js` et `useLieuDetailsMigrated.js`).

**Justification :** La migration est progressive pour minimiser les risques. Les hooks migrés sont déployés en parallèle pour permettre des tests approfondis avant de remplacer complètement les hooks originaux.

---

*Document préparé par l'équipe Documentation*
*Pour toute question: documentation@tourcraft.com*