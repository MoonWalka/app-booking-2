# Architecture V2 - TourCraft Application

## Vue d'ensemble

L'architecture V2 de TourCraft est une refonte majeure centrée sur la modularité, la réutilisabilité et la maintenabilité. Elle introduit un système de composants génériques, des hooks standardisés et une gestion multi-organisation native.

## Technologies principales

### Frontend
- **React 18.2** - Framework UI avec hooks et contextes
- **React Router v6** - Navigation SPA
- **React Bootstrap 2.10** - Composants UI Bootstrap
- **Firebase SDK 10.9** - Backend as a Service
- **React Hook Form + Formik** - Gestion des formulaires
- **React PDF Renderer** - Génération de PDF
- **Leaflet** - Cartes interactives

### Build & Tooling
- **CRACO** - Configuration Create React App
- **Babel** - Transpilation avec alias de chemins
- **ESLint** - Linting du code
- **Jest** - Tests unitaires

## Structure des dossiers

```
src/
├── components/          # Composants React
│   ├── common/         # Composants génériques réutilisables
│   ├── ui/             # Composants UI de base
│   ├── contacts/       # Composants spécifiques aux contacts
│   ├── concerts/       # Composants spécifiques aux concerts
│   ├── artistes/       # Composants spécifiques aux artistes
│   ├── lieux/          # Composants spécifiques aux lieux
│   └── structures/     # Composants spécifiques aux structures
├── hooks/              # Hooks React personnalisés
│   ├── common/         # Hooks génériques réutilisables
│   ├── generics/       # Hooks génériques avancés (V2)
│   └── [entity]/       # Hooks spécifiques par entité
├── services/           # Services et logique métier
├── context/            # Contextes React globaux
├── pages/              # Composants de pages
├── config/             # Fichiers de configuration
├── utils/              # Utilitaires et helpers
└── styles/             # Styles CSS globaux
```

## Patterns architecturaux

### 1. Architecture générique V2

Le cœur de l'architecture V2 repose sur des composants et hooks génériques qui peuvent être configurés pour différentes entités :

#### Composants génériques
- **GenericDetailView** - Vue détaillée configurable pour toute entité
- **GenericList** - Liste paginée et filtrable
- **UnifiedContactSelector** - Sélecteur de contacts unifié (mono/multi)
- **EntityViewTabs** - Système d'onglets pour les vues détaillées

#### Hooks génériques principaux
- **useGenericEntityDetails** - Gestion complète d'une entité (CRUD, cache, relations)
- **useGenericEntityForm** - Gestion des formulaires d'entité
- **useGenericEntityList** - Gestion des listes d'entités
- **useGenericSearch** - Recherche unifiée avec debounce
- **useSafeRelations** - Chargement sécurisé des relations

### 2. Configuration centralisée des entités

Toutes les entités sont configurées dans `/config/entityConfigurations.js` :

```javascript
export const entityConfigurations = {
  artiste: {
    title: 'Artiste',
    icon: 'bi-music-note-beamed',
    mainFields: {
      title: 'nom',
      subtitle: 'style'
    },
    sections: [...],
    relations: {...}
  },
  // Autres entités...
};
```

### 3. Système de contacts unifié

Migration du système "programmateurs" vers un système de "contacts" unifié :
- Un contact peut avoir différents rôles (programmateur, technicien, etc.)
- Relations bidirectionnelles avec concerts, lieux, structures
- Gestion des personnes physiques et morales

### 4. Gestion multi-organisation

Architecture native pour supporter plusieurs organisations :
- **OrganizationContext** - Contexte global pour l'organisation courante
- Isolation des données par `entrepriseId`
- Changement d'organisation sans rechargement
- Migration automatique des données RIB

### 5. Système de cache intelligent

Cache multicouche avec invalidation intelligente :
- Cache en mémoire pour les données fréquemment accédées
- TTL configurable par type d'entité
- Invalidation automatique lors des modifications
- Support du mode temps réel avec Firestore

### 6. Relations bidirectionnelles

Gestion automatique des relations entre entités :
- Service `bidirectionalRelationsService` pour la cohérence
- Hook `useBidirectionalRelations` pour les composants
- Support des relations 1-1, 1-N et N-N

## Flux de données

### 1. Chargement d'une entité
```
Page → useGenericEntityDetails → Firestore
                ↓
            Cache Check
                ↓
        GenericDetailView ← Relations
```

### 2. Modification d'une entité
```
Form → useGenericEntityForm → Validation
            ↓
      Firestore Update
            ↓
    Cache Invalidation
            ↓
    Relations Update
```

### 3. Recherche et filtrage
```
SearchInput → useGenericSearch → Debounce
                    ↓
              Firestore Query
                    ↓
              Results Cache
```

## Conventions de code

### Imports
```javascript
// Utiliser l'alias @ pour tous les imports internes
import { useGenericEntityDetails } from '@/hooks/common';
import GenericDetailView from '@/components/common/GenericDetailView';
```

### Hooks
- Préfixe `use` obligatoire
- Un hook par fichier
- Export par défaut pour les hooks principaux
- Export nommé pour les hooks utilitaires

### Composants
- Composants fonctionnels uniquement
- PropTypes ou TypeScript pour la validation
- Modules CSS pour les styles scopés

### Services
- Fonctions pures autant que possible
- Gestion des erreurs centralisée
- Logging via `loggerService`

## Gestion des états

### États locaux
- `useState` pour les états simples
- `useReducer` pour les états complexes
- `useRef` pour les valeurs persistantes

### États globaux
- **AuthContext** - Authentification utilisateur
- **OrganizationContext** - Organisation courante
- **ParametresContext** - Paramètres application
- **TabsContext** - Gestion des onglets ouverts

## Performance

### Optimisations implémentées
- Lazy loading des routes avec Suspense
- Memoization des composants lourds
- Debounce sur les recherches
- Cache intelligent des données
- Virtual scrolling pour les longues listes

### Monitoring
- `PerformanceMonitor` component
- Métriques Web Vitals
- Tracking des renders inutiles

## Sécurité

### Authentification
- Firebase Authentication
- Protection des routes avec `PrivateRoute`
- Tokens JWT automatiques

### Autorisation
- Vérification des permissions par organisation
- Rôles utilisateur (owner, admin, member)
- Isolation des données par tenant

### Validation
- Validation côté client avec Yup
- Validation métier dans les hooks
- Sanitization des entrées utilisateur

## Tests

### Structure des tests
```
__tests__/
├── integration/    # Tests d'intégration
├── unit/          # Tests unitaires
└── e2e/           # Tests end-to-end
```

### Outils de test
- Jest pour les tests unitaires
- React Testing Library
- Puppeteer pour les tests E2E

## Déploiement

### Environnements
- **development** - Firebase Emulator local
- **staging** - Environnement de test
- **production** - Application en production

### Configuration
Variables d'environnement dans `.env.[environment]` :
- Firebase config
- API keys externes
- Feature flags

## Migration V1 → V2

### Changements majeurs
1. **Programmateurs → Contacts** : Système unifié de gestion des contacts
2. **Hooks spécifiques → Hooks génériques** : Réutilisation maximale
3. **Props drilling → Context API** : Meilleure gestion des états
4. **Components monolithiques → Composants atomiques** : Modularité

### Guide de migration
1. Remplacer les imports de programmateurs par contacts
2. Utiliser les hooks génériques au lieu des spécifiques
3. Configurer les entités dans `entityConfigurations.js`
4. Migrer vers le système de cache unifié

## Bonnes pratiques

### DO
- Utiliser les composants et hooks génériques
- Configurer plutôt que coder en dur
- Maintenir les relations bidirectionnelles
- Utiliser le cache pour les données stables
- Documenter les configurations complexes

### DON'T
- Créer des composants spécifiques sans nécessité
- Dupliquer la logique métier
- Accéder directement à Firestore sans hooks
- Ignorer les erreurs de validation
- Modifier les données sans passer par les services

## Roadmap V3

### Améliorations prévues
- Migration TypeScript complète
- Server-Side Rendering avec Next.js
- GraphQL pour les requêtes complexes
- Websockets pour le temps réel
- PWA avec support offline complet

### Refactoring planifié
- Extraction de la logique métier en packages
- Micro-frontends pour les modules complexes
- Design system complet avec Storybook
- Tests de performance automatisés