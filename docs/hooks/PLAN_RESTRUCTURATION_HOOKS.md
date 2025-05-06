# Plan de Restructuration des Hooks

*Créé le: 5 mai 2025*
*Mis à jour le: 6 mai 2025*

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

3. **Suppression du dossier redondant** ✅ :
   - Supprimer le dossier `tests/` après migration réussie

| Tâche | Statut | Responsable | Date |
|-------|--------|------------|------|
| Analyse des tests dupliqués | ✅ Complété | Équipe Dev | 5 mai 2025 |
| Migration vers `__tests__/` | ✅ Complété | Équipe Dev | 5 mai 2025 |
| Suppression de `tests/` | ✅ Complété | Équipe Dev | 6 mai 2025 |

### Phase 2: Consolidation des Hooks Utilitaires (Échéance: 9 mai 2025) ✅ COMPLÉTÉ

> **Note importante**: Une partie du travail de consolidation a déjà été commencée! Plusieurs hooks comme `useLocationIQ.js`, `useTheme.js`, `useAddressSearch.js` et `useCompanySearch.js` ont déjà été partiellement restructurés en utilisant une approche de re-export pour maintenir la compatibilité avec le code existant.

1. **Consolidation des hooks communs à la racine** ✅ :
   - ✅ Déjà effectué pour `useLocationIQ.js` et `useTheme.js` (re-export vers la version dans `common/`)
   - ✅ Déjà effectué pour `useResponsiveComponent.js` (wrapper déprécié vers `useResponsive.js`)
   - ✅ Complété pour `useIsMobile.js`:
     * ✅ Le hook de remplacement `useResponsive.js` est implémenté dans `common/`
     * ✅ Migration des composants qui utilisaient `useIsMobile.js` terminée (6 mai 2025)
     * ✅ Suppression de `useIsMobile.js` complétée (6 mai 2025) 
   - ✅ Standardisation des noms déjà effectuée

2. **Consolidation des hooks utilitaires dupliqués dans les sous-dossiers** ✅ :
   - ✅ Déjà effectué pour `useAddressSearch.js` et `useCompanySearch.js` (les versions dans `programmateurs/` sont déjà des re-exports)

| Tâche | Statut | Responsable | Date |
|-------|--------|------------|------|
| Analyse des hooks dupliqués | ✅ Complété | Équipe Dev | 5 mai 2025 |
| Implémentation de `useResponsive.js` | ✅ Complété | Équipe Dev | Date antérieure |
| Migration des composants utilisant `useIsMobile.js` | ✅ Complété | Équipe Dev | 6 mai 2025 |
| Documentation de l'état actuel | ✅ Complété | Équipe Dev | 5 mai 2025 |
| Guide de migration useIsMobile → useResponsive | ✅ Complété | Équipe Dev | 7 mai 2025 |

#### Plan de transition progressive pour useIsMobile vers useResponsive

Pour assurer une transition sans rupture des composants utilisant `useIsMobile`, nous avons suivi cette approche:

1. **Phase immédiate (d'ici le 7 mai)** ✅ :
   - ✅ Migration des composants utilisant activement useIsMobile.js
   - ✅ Création de documentation claire du processus de migration (Guide dans /docs/hooks/GUIDE_MIGRATION_USEMOBILE.md)

2. **Phase intermédiaire (8-15 mai)** ✅ :
   - ✅ Transformation de `useIsMobile.js` en simple wrapper autour de `useResponsive`
   - ✅ Surveillance des journaux d'erreurs pour détecter des utilisations non documentées

3. **Phase finale (après le 15 mai)** ✅ :
   - ✅ Suppression complète de `useIsMobile.js` après confirmation qu'aucun composant ne l'utilise
   - ✅ Mise à jour de la documentation pour refléter cette suppression

**Note**: La migration de useIsMobile vers useResponsive a été accélérée et complétée en avance sur le calendrier initial (le 6 mai 2025).

### Phase 3: Gestion des Hooks Migrés et Originaux (Échéance: 12 mai 2025) ✅ COMPLÉTÉ

1. **Analyse de l'utilisation des hooks** ✅ :
   - ✅ Identifier quels composants utilisent les hooks originaux vs migrés
   - ✅ Évaluer l'impact du remplacement des hooks originaux

2. **Stratégie de transition** ✅ :
   - ✅ Pour chaque hook migré, vérifier la compatibilité avec l'API des hooks génériques
   - ✅ Création d'une stratégie par wrapper pour les hooks originaux
   - ✅ Création d'un guide de migration détaillé (`GUIDE_MIGRATION_HOOKS_VERS_GENERIQUES.md`) le 6 mai 2025
   - ✅ Implémentation de la stratégie de wrapper pour tous les hooks (terminé)

3. **Documentation et standardisation** ✅ :
   - ✅ Mise à jour de la documentation pour refléter la nouvelle approche
   - ✅ Définition des conventions de nommage pour les hooks migrés (suffixe V2)
   - ✅ Documentation des différences d'API entre versions originales et migrées

4. **Corrections post-migration** ✅ :
   - ✅ Correction des erreurs de compilation dans les hooks migrés
   - ✅ Ajout des fonctions de validation manquantes dans les utilitaires
   - ✅ Implémentation des hooks génériques manquants (useGenericEntityList)
   - ✅ Documentation des corrections dans `CORRECTIONS_HOOKS_MIGRATION.md`

| Tâche | Statut | Responsable | Date |
|-------|--------|------------|------|
| Analyse de l'utilisation | ✅ Complété | Équipe Dev | 6 mai 2025 |
| Création de la stratégie | ✅ Complété | Équipe Dev | 6 mai 2025 |
| Mise à jour documentation | ✅ Complété | Équipe Dev | 6 mai 2025 |
| Implémentation de wrappers | ✅ Complété | Équipe Dev | 6 mai 2025 |
| Corrections post-migration | ✅ Complété | Équipe Dev | 6 mai 2025 |

### Phase 4: Implémentation et Validation (Échéance: 16 mai 2025) ✅ COMPLÉTÉ EN AVANCE

1. **Refactorisation des imports** ✅ :
   - ✅ Identification de tous les composants qui importaient directement les hooks spécifiques
   - ✅ Mise à jour des imports pour utiliser la structure standardisée
   - ✅ Documentation des modifications dans le journal de refactorisation

2. **Tests de non-régression** ✅ :
   - ✅ Exécution de tous les tests unitaires existants pour les hooks
   - ✅ Validation du comportement des composants qui utilisent les hooks
   - ✅ Vérification que les fonctionnalités ne sont pas impactées

3. **Déploiement en environnement de test** ✅ :
   - ✅ Déploiement des modifications en environnement de test
   - ✅ Tests manuels sur les principales fonctionnalités
   - ✅ Collecte des retours d'utilisateurs tests

| Tâche | Statut | Responsable | Date prévue | Date réelle |
|-------|--------|------------|-------------|------------|
| Refactorisation des imports | ✅ Complété | Équipe Dev | 13 mai 2025 | 6 mai 2025 |
| Tests de non-régression | ✅ Complété | Équipe Test | 15 mai 2025 | 6 mai 2025 |
| Déploiement en test | ✅ Complété | Équipe DevOps | 16 mai 2025 | 6 mai 2025 |

### Phase 5: Nettoyage Final (Échéance: 18 mai 2025) ✅ COMPLÉTÉ EN MAJORITÉ

1. **Audit des hooks obsolètes** ✅ :
   - ✅ Identification des hooks qui ne sont plus utilisés après la migration
   - ✅ Documentation des hooks à supprimer dans le futur dans `PLAN_DEPRECIATION_HOOKS.md`

2. **Documentation finale** ✅ :
   - ✅ Mise à jour de la documentation technique
   - ✅ Création d'exemples d'utilisation des hooks génériques
   - ✅ Archivage de la documentation des anciens hooks

3. **Plan de suppression future** ✅ :
   - ✅ Planification de la suppression progressive des wrappers (document `PLAN_DEPRECIATION_HOOKS.md`)
   - ✅ Établissement d'un calendrier de dépréciation avec des échéances précises
   - ⏳ A faire : Finalisation de la documentation et validation par les parties prenantes

| Tâche | Statut | Responsable | Date prévue | Date réelle |
|-------|--------|------------|-------------|------------|
| Audit des hooks obsolètes | ✅ Complété | Équipe Dev | 17 mai 2025 | 6 mai 2025 |
| Documentation finale | ✅ Complété | Équipe Doc | 18 mai 2025 | 6 mai 2025 |
| Plan de suppression future | ✅ Complété | Équipe Dev | 18 mai 2025 | 6 mai 2025 |
| Validation par les parties prenantes | ⏳ A faire | Équipe Dev + PM | 18 mai 2025 | - |

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
Avancement Global: ■■■■■■■■■□  90%

Phase 1: Consolidation des Tests
[■■■■■■■■■■] 100% (Complété)

Phase 2: Consolidation des Hooks Utilitaires
[■■■■■■■■■■] 100% (Complété)

Phase 3: Gestion des Hooks Migrés et Originaux
[■■■■■■■■■■] 100% (Complété)

Phase 4: Implémentation et Validation
[■■■■■■■■■■] 100% (Complété)

Phase 5: Nettoyage Final
[■■■■■■■■■□] 90%
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

La prochaine mise à jour de ce document est prévue pour le 12 mai 2025, après le début de la Phase 3.