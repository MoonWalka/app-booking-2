# Standardisation des Hooks

## Contexte

Cette documentation détaille le travail de standardisation des hooks réalisé dans l'application app-booking-2. L'objectif de cette standardisation était d'organiser tous les hooks dans une structure cohérente pour améliorer la maintenabilité du code et faciliter la réutilisation des hooks à travers l'application.

## Problème initial

Avant la standardisation, plusieurs problèmes ont été identifiés :

1. **Manque de cohérence architecturale** : Les hooks étaient dispersés à différents endroits dans l'application (dans `/components`, `/hooks`, etc.) sans organisation claire.

2. **Duplication de code** : Différentes versions des mêmes hooks existaient dans différents dossiers.

3. **Difficultés pour retrouver les hooks** : L'absence d'organisation claire rendait difficile de trouver le hook nécessaire pour une tâche spécifique.

4. **Complexité d'importation** : Les chemins d'importation étaient souvent complexes et incohérents.

## Solution implémentée

### 1. Structure standardisée des hooks

Tous les hooks ont été organisés selon la structure suivante :

```
src/hooks/
  index.js                   # Exporte tous les hooks principaux
  [common hooks]             # Hooks génériques utilisés dans toute l'application
  artistes/                  # Hooks spécifiques aux artistes
    index.js                 # Exporte tous les hooks d'artistes
  common/                    # Hooks utilitaires communs
    index.js                 # Exporte tous les hooks communs
  concerts/                  # Hooks spécifiques aux concerts
    index.js                 # Exporte tous les hooks de concerts
  lieux/                     # Hooks spécifiques aux lieux
    index.js                 # Exporte tous les hooks de lieux
  programmateurs/            # Hooks spécifiques aux programmateurs
    index.js                 # Exporte tous les hooks de programmateurs
  [...autres catégories]
```

### 2. Standardisation des hooks clés

Plusieurs hooks importants ont été standardisés, notamment :

#### useLieuDetails

- **Déplacement** : de `/components/lieux/desktop/hooks/useLieuDetails.js` vers `/hooks/lieux/useLieuDetails.js`
- **Amélioration** : Ajout d'une documentation JSDoc complète et optimisation des fonctionnalités
- **Fichiers mis à jour** : 
  - `/components/lieux/LieuDetails.js`
  - `/components/lieux/desktop/LieuView.js`
  - `/components/lieux/mobile/LieuView.js`
  - `/components/lieux/desktop/LieuDetails.js`

#### useProgrammateurSearch

- **Consolidation** : Fusion des fonctionnalités de différentes versions du hook
- **Emplacement standardisé** : `/hooks/programmateurs/useProgrammateurSearch.js`
- **Améliorations** : 
  - Interface flexible avec support pour différents modes d'utilisation
  - Compatibilité avec les anciennes implémentations via une API unifiée
  - Documentation JSDoc complète
  - Gestion intelligente des options pour supporter à la fois les appels directs avec lieuId et les appels avec objet d'options
- **Résolution de conflits** : Fusion des fonctionnalités de deux implémentations différentes :
  - Version spécifique aux lieux (chargement du programmateur lié à un lieu)
  - Version générique utilisant `useEntitySearch`

#### useAddressSearch

- **Standardisation** : Utilisation de la version principale dans `/hooks/common/useAddressSearch.js`
- **Fonctionnalités** : 
  - Support du mode standard et du mode formulaire
  - Interface flexible pour différents cas d'utilisation
  - Intégration avec l'API LocationIQ

### 3. Création de fichiers index.js

Des fichiers `index.js` ont été créés dans chaque dossier de hooks pour faciliter les imports :

```javascript
// Exemple pour src/hooks/lieux/index.js
export { default as useLieuDetails } from './useLieuDetails';
export { default as useLieuForm } from './useLieuForm';
export { default as useLieuSearch } from './useLieuSearch';
// ... autres hooks
```

Cela permet d'importer les hooks de manière plus concise :

```javascript
import { useLieuDetails, useLieuSearch } from '@/hooks/lieux';
```

au lieu de :

```javascript
import useLieuDetails from '@/hooks/lieux/useLieuDetails';
import useLieuSearch from '@/hooks/lieux/useLieuSearch';
```

## Hooks standardisés

### Hooks de lieux

- `useLieuDetails` - Gestion complète des détails d'un lieu
- `useLieuForm` - Gestion du formulaire d'édition d'un lieu
- `useLieuSearch` - Recherche de lieux
- `useAddressSearch` - Recherche et sélection d'adresses pour les lieux

### Hooks de programmateurs

- `useProgrammateurDetails` - Gestion des détails d'un programmateur
- `useProgrammateurSearch` - Recherche et sélection de programmateurs
- `useAddressSearch` - Version adaptée pour les programmateurs

### Hooks communs

- `useAddressSearch` - Version générique pour la recherche d'adresses
- `useEntitySearch` - Recherche générique d'entités dans Firestore
- `useResponsive` - Gestion de l'affichage responsive
- `useTheme` - Gestion du thème de l'application

## Fichiers supprimés

Pour éviter toute confusion, les fichiers hooks suivants ont été supprimés après avoir vérifié que leurs fonctionnalités étaient correctement migrées vers les versions standardisées :

- `/components/lieux/desktop/hooks/useLieuDetails.js`
- `/components/lieux/desktop/hooks/useProgrammateurSearch.js`
- `/components/lieux/desktop/hooks/useAddressSearch.js`

## Corrections d'erreurs et optimisations

Suite à la standardisation initiale, quelques problèmes ont été identifiés et corrigés :

1. **Export manquant dans index.js** :
   - Problème : Le hook `useProgrammateurSearch` n'était pas correctement exporté dans `/hooks/programmateurs/index.js`
   - Solution : Ajout de la ligne d'export dans le fichier index :
     ```javascript
     export { default as useProgrammateurSearch } from './useProgrammateurSearch';
     ```
   - Effets : Résolution des erreurs de compilation dans les composants utilisant ce hook

2. **Incompatibilités d'API** :
   - Problème : Certaines implémentations existantes utilisaient l'ancienne API des hooks
   - Solution : Implémentation d'une API rétrocompatible dans les hooks standardisés
   - Exemple : Adaptation du hook `useProgrammateurSearch` pour accepter directement un lieuId comme paramètre

3. **Vérification de la couverture fonctionnelle** :
   - Tests effectués pour s'assurer que toutes les fonctionnalités des hooks originaux sont préservées
   - Validation du fonctionnement des composants après migration vers les hooks standardisés

## Avantages de la standardisation

1. **Architecture cohérente** : Tous les hooks suivent maintenant une convention de nommage et d'organisation claire
2. **Meilleure découvrabilité** : Il est plus facile de trouver les hooks existants
3. **Facilitation des imports** : Les fichiers index.js permettent des imports plus concis
4. **Documentation améliorée** : Ajout de documentation JSDoc pour tous les hooks standardisés
5. **Réduction de la duplication** : Fusion des hooks ayant des fonctionnalités similaires

## Recommandations pour l'avenir

Pour maintenir cette standardisation, il est recommandé de :

1. **Placer tous les nouveaux hooks dans le répertoire approprié** sous `/hooks/[catégorie]/`
2. **Mettre à jour le fichier index.js** correspondant pour exporter le nouveau hook
3. **Documenter chaque hook avec des commentaires JSDoc** expliquant son fonctionnement
4. **Favoriser la réutilisation** des hooks existants plutôt que d'en créer de nouveaux
5. **Utiliser des interfaces flexibles** pour adapter les hooks à différents cas d'utilisation

## Tâches restantes

Pour compléter la standardisation des hooks dans l'ensemble du projet :

1. **Réviser les hooks des autres entités** :
   - Hooks liés aux contrats
   - Hooks liés aux structures 
   - Hooks liés aux paiements

2. **Mettre à jour la documentation des API** :
   - Créer une documentation complète des API pour chaque hook standardisé
   - Inclure des exemples d'utilisation pour différents scénarios

3. **Ajouter des tests unitaires** :
   - Implémenter des tests pour valider le bon fonctionnement des hooks standardisés
   - Assurer la couverture des différents cas d'utilisation

## Historique des mises à jour

- **Mai 2024** : Standardisation initiale des hooks liés aux lieux et programmateurs
- **4 mai 2025** : Corrections et optimisations, mise à jour de la documentation

## Hooks consolidés récemment (Mai 2025)

| Hook | Location | Description | 
|------|----------|-------------|
| `useAddressSearch` | `/hooks/common/` | Recherche et sélection d'adresses |
| `useCompanySearch` | `/hooks/common/` | Recherche d'entreprises par nom ou SIRET |
| `useLocationIQ` | `/hooks/common/` | Interface avec l'API LocationIQ |
| `useTheme` | `/hooks/common/` | Application des thèmes et variables CSS |
| `useResponsive` | `/hooks/common/` | Gestion responsive (remplace useResponsiveComponent et useIsMobile) |
| `useSearchAndFilter` | `/hooks/search/` | Filtrage et recherche génériques |
| `useFormSubmission` | `/hooks/forms/` | Hook générique pour soumission de formulaires |
| `useConcertSubmission` | `/hooks/concerts/` | Hook spécifique pour les concerts, utilise useFormSubmission |
| `useArtisteSearch` | `/hooks/artistes/` | Hook spécifique pour la recherche d'artistes, utilise useSearchAndFilter |
| `useStructureSearch` | `/hooks/structures/` | Recherche de structures par nom, ville ou SIRET |

## Désactivation temporaire du hook useStructureSearch (Mai 2025)

Suite à des problèmes d'initialisation du hook `useStructureSearch` dans le composant `ProgrammateurLegalSection`, une décision temporaire a été prise de désactiver complètement la fonctionnalité de recherche de structures dans ce composant.

### Problème rencontré

L'erreur suivante se produisait lors de l'initialisation du composant :
```
Cannot access uninitialized variable.
default@http://localhost:3000/programmateurs-desktop-ProgrammateurLegalSection.xxx.hot-update.js
```

Cette erreur était causée par un conflit entre différentes méthodes d'exportation du hook `useStructureSearch`.

### Approche adoptée

Pour permettre à l'application de continuer à fonctionner normalement, la solution suivante a été implémentée :

1. **Simplification du composant ProgrammateurLegalSection** :
   - Suppression complète de la fonctionnalité de recherche et d'autocomplete pour les structures
   - Conservation uniquement des fonctionnalités d'édition manuelle des champs relatifs à la structure
   - Retrait des dépendances vers `useStructureSearch`

2. **Conservation du hook useStructureSearch** :
   - Le hook a été maintenu dans `/hooks/structures/index.js` pour une utilisation future
   - Les exports ont été normalisés pour suivre les standards React

### Impact fonctionnel

- Les utilisateurs ne peuvent plus rechercher et sélectionner une structure existante dans le formulaire d'édition des programmateurs
- Ils doivent saisir manuellement les informations de la structure
- Toutes les autres fonctionnalités du formulaire d'édition des programmateurs restent opérationnelles

### Plan de résolution future

Une refactorisation plus complète sera nécessaire pour réintégrer cette fonctionnalité. Les étapes suivantes sont prévues :

1. Revoir la structure d'exportation des hooks pour garantir une compatibilité complète
2. Vérifier l'implémentation du hook `useStructureSearch` et les champs requis par Firestore
3. Tester l'intégration de ce hook dans d'autres composants avant de le réintégrer dans `ProgrammateurLegalSection`
4. Documenter correctement son utilisation pour éviter des problèmes similaires à l'avenir

### Date de mise à jour prévue

Cette fonctionnalité sera reimplémentée après la consolidation de l'architecture des hooks et la résolution des problèmes d'indexation dans Firestore, prévue pour Juin 2025.

## Migration vers useGenericEntityForm (Mai 2025)

Dans le cadre de la standardisation des hooks, un effort particulier est en cours pour migrer les différents hooks de formulaire vers l'implémentation générique `useGenericEntityForm`. Cette migration vise à améliorer la maintenabilité du code et à réduire la duplication.

### Hooks concernés par la migration

| Hook | État | Responsable | Date cible | Notes |
|------|------|------------|-----------|-------|
| `useConcertForm` | ✅ Terminé | Alice | 30/04/2025 | Implémentation de référence, sert de modèle pour les autres migrations |
| `useLieuForm` | ✅ Terminé | Copilot | 05/05/2025 | Hook entièrement migré pour utiliser useGenericEntityForm |
| `useProgrammateurForm` | ✅ Terminé | Copilot | 05/05/2025 | Implémenté à partir de zéro en utilisant directement useGenericEntityForm |
| `useStructureForm` | ✅ Terminé | Copilot | 05/05/2025 | Migré avec validation améliorée pour les champs spécifiques aux structures |
| `useEntrepriseForm` | ✅ Terminé | Copilot | 05/05/2025 | Adaptation spéciale pour utiliser le contexte ParametresContext au lieu de Firebase directement |

### Approche de migration

Pour chaque hook à migrer, la méthode suivante est utilisée :

1. **Analyse du hook existant** :
   - Identifier les données initiales et leur structure
   - Documenter les fonctions de validation spécifiques
   - Identifier les transformations de données nécessaires
   - Lister les entités liées gérées par le hook

2. **Création de la version basée sur useGenericEntityForm** :
   - Configurer les paramètres pour useGenericEntityForm
   - Implémenter les fonctions de validation et transformation spécifiques
   - Configurer correctement les entités liées

3. **Maintien de la compatibilité** :
   - S'assurer que l'API externe du hook reste identique
   - Ajouter des mappings si nécessaire pour garantir la rétrocompatibilité
   - Documenter les nouveaux paramètres/retours disponibles

4. **Tests et validation** :
   - Tester le hook dans tous les composants qui l'utilisent
   - Vérifier que toutes les fonctionnalités sont préservées

### Modèle de référence

Le hook `useConcertForm` sert de modèle de référence pour les autres migrations. Les principales caractéristiques de son implémentation sont :

```javascript
// Configuration des entités liées
const relatedEntities = [
  { name: 'lieu', collection: 'lieux', idField: 'lieuId', nameField: 'lieuNom' },
  // autres entités...
];

// Validation spécifique aux concerts
const validateConcertForm = (data) => {
  // Logique de validation spécifique
  return { isValid, errors };
};

// Transformation des données avant sauvegarde
const transformConcertData = (data) => {
  // Logique de transformation spécifique
  return transformedData;
};

// Utilisation du hook générique
const genericFormHook = useGenericEntityForm({
  entityType: 'concerts',
  entityId: concertId,
  initialData,
  collectionName: 'concerts',
  validateForm: validateConcertForm,
  transformData: transformConcertData,
  onSuccess: onConcertSaveSuccess,
  relatedEntities
});

// Maintien de l'API compatible
return {
  ...genericFormHook,
  // Propriétés spécifiques pour maintenir la compatibilité
  selectedLieu: genericFormHook.relatedData.lieu || null,
  // autres propriétés spécifiques...
};
```

### Suivi de l'avancement

Cette section sera mise à jour au fur et à mesure de l'avancement de la migration. Un rapport sera fait après chaque migration réussie pour documenter les difficultés rencontrées et les solutions apportées.

## Futurs Hooks Génériques (Mai-Juin 2025)

Suite au succès de la migration des hooks de formulaire vers `useGenericEntityForm`, un plan de migration plus large a été établi pour standardiser d'autres types de hooks fréquemment utilisés dans l'application. Ce plan, détaillé dans le document [PLAN_MIGRATION_HOOKS_GENERIQUES.md](/docs/hooks/PLAN_MIGRATION_HOOKS_GENERIQUES.md), prévoit l'implémentation progressive de trois nouveaux hooks génériques :

1. **useGenericEntitySearch** - Pour standardiser la recherche d'entités (remplacement de useLieuSearch, useProgrammateurSearch, etc.)
2. **useGenericEntityList** - Pour standardiser la gestion des listes d'entités (remplacement de useLieuxFilters, useConcertFilters, etc.)
3. **useGenericEntityDetails** - Pour standardiser la gestion des détails d'entités (remplacement de useLieuDetails, useProgrammateurDetails, etc.)

Ce processus de standardisation s'échelonnera de mai à juin 2025 et permettra de réduire considérablement la duplication de code tout en améliorant la maintenabilité et la cohérence de l'application.