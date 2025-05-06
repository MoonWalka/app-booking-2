# Guide de l'Architecture TourCraft

*Document créé le: 5 mai 2025*  
*Dernière mise à jour: 7 mai 2025*

Ce guide décrit l'architecture complète du projet app-booking-2, intégrant les principes fondamentaux, la structure des dossiers, et les approches de refactorisation mises en œuvre.

## Table des matières

1. [Structure du projet](#structure-du-projet)
2. [Architecture en couches](#architecture-en-couches)
3. [Architecture responsive multi-device](#architecture-responsive-multi-device)
4. [Modèle de données et associations entre entités](#modèle-de-données-et-associations-entre-entités)
5. [Flux de données](#flux-de-données)
6. [Validation des formulaires](#validation-des-formulaires)
7. [Hooks génériques et standardisés](#hooks-génériques-et-standardisés)
8. [Composants génériques](#composants-génériques)
9. [Génération de documents PDF](#génération-de-documents-pdf)
10. [Optimisations de performance](#optimisations-de-performance)
11. [Exemple de refactorisation: Gestion des Structures](#exemple-de-refactorisation-gestion-des-structures)
12. [Exceptions connues et justifications](#exceptions-connues-et-justifications)
13. [Roadmap architecturale](#roadmap-architecturale)

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
│   │   ├── common/        # Hooks communs (useResponsive, useDebounce, etc.)
│   │   ├── forms/         # Hooks pour les formulaires
│   │   ├── lists/         # Hooks pour les listes
│   │   ├── concerts/      # Hooks spécifiques aux concerts
│   │   ├── programmateurs/# Hooks spécifiques aux programmateurs
│   │   ├── structures/    # Hooks spécifiques aux structures
│   │   ├── firestore/     # Hooks d'accès à Firestore
│   │   ├── search/        # Hooks pour les fonctionnalités de recherche
│   │   ├── artistes/      # Hooks spécifiques aux artistes
│   │   ├── contrats/      # Hooks spécifiques aux contrats
│   │   ├── lieux/         # Hooks spécifiques aux lieux
│   │   └── __tests__/     # Tests unitaires pour les hooks
│   ├── services/          # Services d'accès aux données
│   ├── utils/             # Fonctions utilitaires
│   ├── styles/            # Styles centralisés
│   ├── pages/             # Assemblage des composants pour chaque route
│   │   └── css/           # Styles spécifiques aux pages
│   ├── context/           # Contextes React
│   │   ├── AuthContext.js # Contexte d'authentification
│   │   └── ParametresContext.js # Contexte des paramètres
│   ├── schemas/           # Schémas de validation et de modèles de données
│   ├── firebaseInit.js    # Initialisation Firebase
│   └── mockStorage.js     # Système de stockage local pour tests
├── docs/                  # Documentation du projet
├── functions/             # Fonctions Cloud Firebase
├── scripts/               # Scripts d'automatisation
├── craco.config.js        # Configuration de build personnalisée
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

### Gestion du responsive avec useResponsive

Suite à la standardisation des hooks (mai 2025), l'approche recommandée pour gérer le responsive est d'utiliser le hook `useResponsive` :

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

## Hooks génériques et standardisés

Suite à la migration des hooks réalisée en mai 2025, l'architecture du projet repose désormais sur un ensemble de hooks génériques qui encapsulent les comportements communs et réduisent la duplication de code.

### 1. useGenericEntityForm

Hook central pour la gestion des formulaires d'entités, il fournit une interface standardisée pour :
- Chargement initial des données
- Gestion de l'état du formulaire
- Validation des données
- Soumission et sauvegarde
- Gestion des entités liées

```jsx
const { 
  formData, 
  setFormData,
  handleChange,
  handleSubmit,
  isValid,
  errors,
  loading,
  saving
} = useGenericEntityForm({
  entityType: 'programmateurs',
  entityId, // optionnel, pour l'édition
  initialData: {}, // données initiales
  collectionName: 'programmateurs', // collection Firestore
  validateForm, // fonction de validation personnalisée
  transformData, // fonction de transformation avant sauvegarde
  onSuccess, // callback après sauvegarde réussie
  relatedEntities: [
    { name: 'structure', collection: 'structures', idField: 'structureId' }
  ]
});
```

### 2. useGenericEntityList

Hook pour gérer les listes d'entités avec recherche, filtrage et pagination :

```jsx
const {
  items,
  loading,
  error,
  searchTerm,
  setSearchTerm,
  filters,
  setFilter,
  currentPage,
  totalPages,
  goToPage
} = useGenericEntityList({
  collectionName: 'concerts',
  searchFields: ['titre', 'lieu'],
  initialSortField: 'date',
  filterOptions: [
    { field: 'statut', options: ['confirme', 'en_negociation', 'annule'] }
  ],
  pageSize: 20
});
```

### 3. useGenericEntityDetails

Hook pour charger et gérer les détails d'une entité :

```jsx
const {
  data,
  loading,
  error,
  reload,
  handleDelete,
  relatedEntities
} = useGenericEntityDetails({
  entityType: 'lieu',
  entityId,
  includeRelations: ['programmateurs', 'concerts'],
  onDeleteSuccess
});
```

### 4. useGenericEntitySearch

Hook pour la recherche d'entités avec autocomplétion :

```jsx
const {
  searchTerm,
  setSearchTerm,
  searchResults,
  loading,
  error,
  selectedEntity,
  setSelectedEntity
} = useGenericEntitySearch({
  collectionName: 'lieux',
  searchFields: ['nom', 'ville', 'codePostal'],
  limit: 10,
  transform: (entity) => ({ label: entity.nom, value: entity.id })
});
```

### Migrations des hooks spécifiques

Tous les hooks spécifiques d'entités ont été migrés ou sont en cours de migration vers ces hooks génériques :

| Hook original | État | Version générique |
|---------------|------|------------------|
| `useConcertForm` | ✅ Migré | `useGenericEntityForm` |
| `useLieuForm` | ✅ Migré | `useGenericEntityForm` |
| `useProgrammateurForm` | ✅ Migré | `useGenericEntityForm` |
| `useStructureForm` | ✅ Migré | `useGenericEntityForm` |
| `useLieuDetails` | ✅ Migré | `useGenericEntityDetails` |
| `useProgrammateurDetails` | ✅ Migré | `useGenericEntityDetails` |
| `useConcertDetails` | ✅ Migré | `useGenericEntityDetails` |
| `useArtistesList` | ✅ Migré | `useGenericEntityList` |
| `useLieuxFilters` | ✅ Migré | `useGenericEntityList` |
| `useConcertFilters` | ✅ Migré | `useGenericEntityList` |
| `useArtisteSearch` | ✅ Migré | `useGenericEntitySearch` |
| `useLieuSearch` | ✅ Migré | `useGenericEntitySearch` |
| `useProgrammateurSearch` | ✅ Migré | `useGenericEntitySearch` |

> **Guide de migration des hooks**: Pour plus de détails sur la migration des hooks, consultez [STANDARDISATION_HOOKS.md](/docs/hooks/STANDARDISATION_HOOKS.md).

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

Cette section illustre comment les principes architecturaux ont été appliqués lors de la refactorisation de la gestion des structures (mai 2025).

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

#### 2. Utilisation de useGenericEntityForm dans useProgrammateurForm

Le hook `useProgrammateurForm` a été migré vers `useGenericEntityForm` avec des configurations spécifiques pour la gestion des structures :

```javascript
const useProgrammateurForm = (programmeurId, initialData = {}, onSuccess) => {
  // Configuration des entités liées, dont la structure
  const relatedEntities = [
    { name: 'structure', collection: 'structures', idField: 'structureId' }
  ];
  
  // Validation spécifique aux programmateurs
  const validateProgrammateurForm = (data) => {
    // Logique de validation spécifique
    return { isValid, errors };
  };
  
  // Utilisation du hook générique
  const genericFormHook = useGenericEntityForm({
    entityType: 'programmateurs',
    entityId: programmeurId,
    initialData,
    collectionName: 'programmateurs',
    validateForm: validateProgrammateurForm,
    onSuccess,
    relatedEntities,
    // Ici on passe le service structureService pour gérer les structures
    services: {
      structure: structureService.ensureStructureEntity
    }
  });

  return genericFormHook;
};
```

### Avantages de la refactorisation

1. **Centralisation** : Toute la logique de gestion des structures est maintenant dans un seul endroit.
2. **Cohérence** : Un seul point de vérité pour les entités Structure.
3. **Maintenabilité** : Code plus facile à maintenir et à faire évoluer.
4. **Réutilisation** : Le service centralisé peut être utilisé par d'autres modules.
5. **Clarté** : Flux de données plus clair entre les composants.

## Exceptions connues et justifications

Cette section documente les exceptions à l'architecture standard et leurs justifications :

### 1. Migrations progressives

**Exception :** Certains hooks spécifiques coexistent temporairement avec leur version migrée (ex: `useLieuDetails.js` et `useLieuDetailsMigrated.js`).

**Justification :** La migration est progressive pour minimiser les risques. Les hooks migrant vers les versions génériques sont testés en parallèle des hooks originaux avant remplacement complet. Cette migration est prévue pour être terminée d'ici fin mai 2025.

### 2. Composants sans version mobile

**Exception :** Certains composants complexes n'ont pas d'équivalent mobile fonctionnel.

**Justification :** La version mobile est temporairement mise en pause pour se concentrer sur l'amélioration des composants desktop qui sont les plus utilisés. Un composant `UnderConstruction` est utilisé comme placeholder pour maintenir la cohérence architecturale.

### 3. Certains hooks communs dans des dossiers spécifiques

**Exception :** Certains hooks communs peuvent exister dans des dossiers d'entités spécifiques (comme `useEntitySearch` dans plusieurs dossiers).

**Justification :** Ces hooks sont maintenus temporairement pour rétrocompatibilité et re-exportent généralement la version commune standardisée. Ils seront supprimés après la période de migration (fin mai 2025).

## Roadmap architecturale

Cette section présente les prochaines évolutions prévues pour l'architecture de l'application :

### 1. Finalisation de la standardisation des hooks (échéance : fin mai 2025)
- Suppression des versions dupliquées et temporaires
- Documentation complète des hooks génériques
- Tests unitaires pour tous les hooks génériques

### 2. Amélioration de l'architecture mobile (échéance : juin 2025)
- Refactorisation des composants mobiles
- Implémentation d'une expérience utilisateur adaptée aux appareils mobiles
- Optimisation des performances sur les appareils mobiles

### 3. Evolution vers une architecture modulaire (échéance : juillet 2025)
- Organisation du code en modules fonctionnels
- Meilleure isolation entre les modules
- API interne claire entre les modules

### 4. Performance et optimisation (échéance : août 2025)
- Lazy loading systématique des modules
- Stratégies de mise en cache avancées
- Optimisation des performances des requêtes Firestore

---

*Document préparé par l'équipe Documentation*  
*Pour toute question: documentation@tourcraft.com*