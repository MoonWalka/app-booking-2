# Plan de Restructuration des Hooks

*Créé le: 5 mai 2025*
*Mis à jour le: 5 mai 2025*

Ce document détaille le plan d'action pour restructurer le dossier `src/hooks/` afin d'éliminer les duplications, améliorer l'organisation et assurer la cohérence avec le plan de migration des hooks génériques.

## Problèmes Identifiés

Suite à l'audit du dossier `src/hooks/`, nous avons identifié plusieurs problèmes:

1. **Dossiers de tests dupliqués**:
   - `__tests__/` contient un seul fichier
   - `tests/` contient plusieurs fichiers dont un en doublon avec `__tests__/`

2. **Hooks dupliqués à plusieurs endroits**:
   - `useLocationIQ.js` existe à la fois à la racine et dans `common/`
   - `useTheme.js` existe à la fois à la racine et dans `common/`
   - `useResponsiveComponent.js` (racine) vs `useResponsive.js` (common)
   - `useIsMobile.js` n'existe qu'à la racine mais devrait être complètement remplacé par `useResponsive.js` dans `common/`

3. **Hooks utilitaires dupliqués dans des sous-dossiers**:
   - `useAddressSearch.js` dans `common/` et `programmateurs/`
   - `useCompanySearch.js` dans `common/` et `programmateurs/`

4. **Coexistence des hooks originaux et migrés**:
   - Ex: `useProgrammateurDetails.js` et `useProgrammateurDetailsMigrated.js`

## Plan d'Action

### Phase 1: Consolidation des Tests (Échéance: 7 mai 2025) ✅ COMPLÉTÉ

1. **Analyse des tests dupliqués** ✅ :
   - Comparer le contenu de `useGenericEntityDetails.test.js` dans les deux dossiers
   - Identifier la version la plus à jour ou la plus complète

2. **Standardisation du dossier de tests** ✅ :
   - Conserver uniquement le dossier `__tests__/` (convention standard React)
   - Migrer tous les fichiers de `tests/` vers `__tests__/`
   - Résoudre les conflits éventuels

3. **Suppression du dossier redondant** ❌ :
   - Supprimer le dossier `tests/` après migration réussie (à faire)

| Tâche | Statut | Responsable | Date |
|-------|--------|------------|------|
| Analyse des tests dupliqués | ✅ Complété | Équipe Dev | 5 mai 2025 |
| Migration vers `__tests__/` | ✅ Complété | Équipe Dev | 5 mai 2025 |
| Suppression de `tests/` | ❌ En attente | Équipe Dev | 7 mai 2025 |

### Phase 2: Consolidation des Hooks Utilitaires (Échéance: 9 mai 2025) 🔄 EN COURS

> **Note importante**: Une partie du travail de consolidation a déjà été commencée! Plusieurs hooks comme `useLocationIQ.js`, `useTheme.js`, `useAddressSearch.js` et `useCompanySearch.js` ont déjà été partiellement restructurés en utilisant une approche de re-export pour maintenir la compatibilité avec le code existant.

1. **Consolidation des hooks communs à la racine** 🔄 :
   - ✅ Déjà effectué pour `useLocationIQ.js` et `useTheme.js` (re-export vers la version dans `common/`)
   - ✅ Déjà effectué pour `useResponsiveComponent.js` (wrapper déprécié vers `useResponsive.js`)
   - 🔄 En cours pour `useIsMobile.js`:
     * ✅ Le hook de remplacement `useResponsive.js` est **déjà implémenté** dans `common/`
     * ✅ `useIsMobile.js` contient déjà un avertissement de dépréciation
     * ❌ À faire: Migration des composants qui utilisent encore `useIsMobile.js` (notamment ContratGenerator.js, ContratTemplateEditor.js)
   - ✅ Standardisation des noms déjà effectuée

2. **Consolidation des hooks utilitaires dupliqués dans les sous-dossiers** ✅ :
   - ✅ Déjà effectué pour `useAddressSearch.js` et `useCompanySearch.js` (les versions dans `programmateurs/` sont déjà des re-exports)

| Tâche | Statut | Responsable | Date |
|-------|--------|------------|------|
| Analyse des hooks dupliqués | ✅ Complété | Équipe Dev | 5 mai 2025 |
| Implémentation de `useResponsive.js` | ✅ Complété | Équipe Dev | Date antérieure |
| Migration des composants utilisant `useIsMobile.js` | 🔄 En cours | Équipe Dev | 7 mai 2025 |
| Documentation de l'état actuel | ✅ Complété | Équipe Dev | 5 mai 2025 |
| Guide de migration useIsMobile → useResponsive | ❌ À faire | Équipe Dev | 7 mai 2025 |

#### Plan de transition progressive pour useIsMobile vers useResponsive

Pour assurer une transition sans rupture des composants utilisant `useIsMobile`, nous suivrons cette approche:

1. **Phase immédiate (d'ici le 7 mai)**:
   - Maintenir `useIsMobile.js` avec son warning de dépréciation
   - Migrer les composants restants qui l'utilisent activement:
     * `ContratGenerator.js`
     * `ContratTemplateEditor.js`
   - Créer une documentation claire du processus de migration

2. **Phase intermédiaire (8-15 mai)**:
   - Transformer `useIsMobile.js` en simple wrapper autour de `useResponsive`
   - Surveiller les journaux d'erreurs pour détecter des utilisations non documentées

3. **Phase finale (après le 15 mai)**:
   - Retirer complètement `useIsMobile.js` après confirmation qu'aucun composant ne l'utilise
   - Mettre à jour toute documentation qui pourrait encore y faire référence

### Phase 3: Gestion des Hooks Migrés et Originaux (Échéance: 12 mai 2025)

1. **Analyse de l'utilisation des hooks**:
   - Identifier quels composants utilisent les hooks originaux vs migrés
   - Évaluer l'impact du remplacement des hooks originaux

2. **Stratégie de transition**:
   - Pour chaque hook migré, vérifier la compatibilité avec l'API des hooks génériques
   - Créer un plan de migration pour les composants utilisant encore les hooks originaux
   - Prévoir des wrappers temporaires si nécessaire pour maintenir la compatibilité

3. **Documentation et standardisation**:
   - Mettre à jour la documentation pour refléter la nouvelle structure
   - Définir des conventions de nommage claires pour les hooks migrés

| Tâche | Statut | Responsable | Date |
|-------|--------|------------|------|
| Analyse de l'utilisation | 📝 Planifié | Équipe Dev | 10 mai 2025 |
| Création de la stratégie | 📝 Planifié | Équipe Dev | 11 mai 2025 |
| Mise à jour documentation | 📝 Planifié | Équipe Dev | 12 mai 2025 |

### Phase 4: Implémentation et Validation (Échéance: 16 mai 2025)

1. **Refactorisation des imports**:
   - Mettre à jour tous les imports pour utiliser la nouvelle structure
   - Assurer la compatibilité avec les hooks existants

2. **Tests de non-régression**:
   - Exécuter les tests unitaires pour s'assurer que les fonctionnalités sont préservées
   - Tester manuellement les fonctionnalités clés utilisant les hooks restructurés

3. **Déploiement et surveillance**:
   - Déployer les changements dans un environnement de test
   - Surveiller les erreurs ou problèmes éventuels

| Tâche | Statut | Responsable | Date |
|-------|--------|------------|------|
| Refactorisation des imports | 📝 Planifié | Équipe Dev | 13 mai 2025 |
| Tests de non-régression | 📝 Planifié | Équipe Dev | 14-15 mai 2025 |
| Déploiement | 📝 Planifié | Équipe Dev | 16 mai 2025 |

### Phase 5: Nettoyage Final (Échéance: 18 mai 2025)

1. **Suppression des fichiers obsolètes**:
   - Supprimer tous les fichiers hooks dupliqués à la racine une fois les migrations complétées
   - Supprimer les versions non migrées des hooks une fois leur remplacement validé
   - S'assurer qu'aucun fichier temporaire ou de transition ne reste dans le projet

2. **Validation structurelle**:
   - Auditer la structure finale du dossier `src/hooks/` pour vérifier l'absence de doublons
   - Vérifier que chaque hook est correctement placé dans son dossier thématique approprié
   - S'assurer que les fichiers index.js exportent correctement tous les hooks

3. **Documentation finale de la structure**:
   - Créer un schéma visuel de la nouvelle structure des hooks
   - Ajouter un README.md dans le dossier `src/hooks/` qui explique clairement l'organisation

| Tâche | Statut | Responsable | Date |
|-------|--------|------------|------|
| Suppression fichiers obsolètes | 📝 Planifié | Équipe Dev | 17 mai 2025 |
| Validation structurelle | 📝 Planifié | Équipe Dev | 17 mai 2025 |
| Documentation finale | 📝 Planifié | Équipe Dev | 18 mai 2025 |

## Recommandations à Long Terme

1. **Standardisation des exports**:
   - Utiliser des fichiers `index.js` dans chaque sous-dossier pour uniformiser les exports
   - Permettre l'importation depuis le dossier sans spécifier le fichier exact

2. **Documentation intégrée**:
   - Ajouter des JSDoc à tous les hooks pour améliorer l'autocomplétion
   - Standardiser le format de documentation

3. **Tests systématiques**:
   - S'assurer que tous les hooks ont des tests unitaires complets
   - Mettre en place des tests d'intégration pour les hooks complexes

4. **Processus d'audit régulier**:
   - Mettre en place un audit trimestriel de la structure des hooks
   - Intégrer des vérifications automatisées pour éviter la création de nouveaux doublons

## Visualisation de l'Avancement

```
Avancement Global: ■■■■■□□□□□  50%

Phase 1: Consolidation des Tests
[■■■■■■■■■□] 90% (Reste la suppression du dossier tests/)

Phase 2: Consolidation des Hooks Utilitaires
[■■■■■■■■□□] 80% (Reste la migration des composants utilisant useIsMobile.js)

Phase 3: Gestion des Hooks Migrés et Originaux
[□□□□□□□□□□] 0%

Phase 4: Implémentation et Validation
[□□□□□□□□□□] 0%

Phase 5: Nettoyage Final
[□□□□□□□□□□] 0%
```

## Alignement avec le Plan de Migration

Ce plan de restructuration s'aligne avec le [Journal de Migration des Hooks](./JOURNAL_MIGRATION_HOOKS.md) et complète les efforts de migration vers des hooks génériques. La structure proposée facilitera l'adoption progressive des hooks génériques tout en maintenant la compatibilité avec le code existant.

## Exemple de migration de useIsMobile vers useResponsive

Pour aider les développeurs à migrer leurs composants, voici un exemple de migration:

```javascript
// Avant - avec useIsMobile
import { useIsMobile } from '@/hooks/useIsMobile';

function MyComponent() {
  const isMobile = useIsMobile();
  
  return (
    <div>
      {isMobile ? <MobileView /> : <DesktopView />}
    </div>
  );
}

// Après - avec useResponsive
import { useResponsive } from '@/hooks/common';

function MyComponent() {
  const { isMobile, getResponsiveComponent } = useResponsive();
  
  // Option 1: Simple condition sur isMobile
  return (
    <div>
      {isMobile ? <MobileView /> : <DesktopView />}
    </div>
  );
  
  // Option 2: Utilisation du chargement dynamique de composants
  const ResponsiveView = getResponsiveComponent({
    desktopPath: 'path/to/DesktopView',
    mobilePath: 'path/to/MobileView'
  });
  
  return <ResponsiveView propA={propA} propB={propB} />;
}
```

## Fonctionnalités additionnelles de useResponsive

Le hook `useResponsive` offre plusieurs fonctionnalités avancées comparé à `useIsMobile`:

1. **Options de configuration**: Possibilité de définir le breakpoint et de forcer le mode desktop
2. **Dimensions d'écran**: Accès aux dimensions précises (`width` et `height`)
3. **Chargement dynamique de composants**: Fonction `getResponsiveComponent` qui gère automatiquement le chargement du bon composant selon la taille d'écran
4. **Gestion des erreurs**: Mécanismes de récupération en cas d'erreur de chargement
5. **Fonctions utilitaires**: `checkIsMobile`, `updateDimensions` pour des cas complexes

Pour plus de détails, consultez le fichier `/src/hooks/common/useResponsive.js`.

## Prochaine Mise à Jour

La prochaine mise à jour de ce document est prévue pour le 7 mai 2025, après la finalisation de la Phase 2.