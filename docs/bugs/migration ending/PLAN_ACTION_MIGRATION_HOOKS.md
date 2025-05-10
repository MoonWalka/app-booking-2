# Plan d'action pour la migration des hooks

*Document créé le: 8 mai 2025*
*Mise à jour le: 8 mai 2025*

Ce document présente une check-list détaillée du plan d'action pour finaliser la migration des hooks dans le projet TourCraft.

## 1. Finaliser la migration des hooks vers des hooks génériques

- [x] **Inventaire des hooks non encore migrés**
   - [x] Exécuter le script `detect_deprecated_hooks.js` pour identifier les hooks encore utilisés mais dépréciés
   - [x] Créer une liste prioritaire basée sur la fréquence d'utilisation et les dépendances
   - [x] Vérifier si des hooks existent à la fois en version standard et migrée (comme useArtisteDetails.js et useArtisteDetailsMigrated.js)

- [x] **Migration des hooks restants**
   - [x] Utiliser le script `migrate_hooks_to_wrappers.js` pour convertir les hooks originaux en wrappers
   - [x] Créer des wrappers avec avertissement de dépréciation pour tous les hooks non migrés
   - [x] Mettre à jour les fichiers index.js pour exporter les versions V2

- [x] **Validation de la migration**
   - [x] Exécuter des tests unitaires sur les hooks migrés
   - [x] Effectuer des tests d'intégration pour vérifier la compatibilité avec les composants existants
   - [x] Vérifier que les wrappers transmettent correctement les paramètres et maintiennent l'API publique

## 2. Éliminer les duplications dans les hooks utilitaires

- [x] **Identification des hooks dupliqués**
   - [x] Rechercher les hooks utilitaires dupliqués comme `useSearchAndFilter.js`, `useEntitySearch.js` et `useFormSubmission.js`
   - [x] Utiliser le script `standardize_hook_imports.js` pour visualiser les motifs d'importation

- [x] **Centralisation des hooks utilitaires**
   - [x] Déplacer tous les hooks utilitaires dupliqués vers le dossier `common/`
   - [x] Créer des re-exports dans les sous-dossiers spécifiques si nécessaire pour maintenir la compatibilité
   - [x] Mettre à jour les importations dans tous les fichiers concernés

- [x] **Vérification de la centralisation**
   - [x] Tester que les composants fonctionnent correctement après centralisation
   - [x] Vérifier que tous les hooks utilitaires sont accessibles via le chemin standardisé `@/hooks/common`

## 3. Nettoyer les logs de débogage

- [x] **Analyse des logs de débogage**
   - [x] Rechercher tous les console.log avec des mots-clés comme 'DEBUG', 'TRACE', 'INFO' dans le code source des hooks
   - [x] Identifier les patterns comme `'[TRACE-UNIQUE][useResponsive] Hook exécuté !'`

- [x] **Implémentation d'une solution conditionnelle**
   - [x] Créer une fonction de log utilitaire qui respecte l'environnement d'exécution
   ```javascript
   const debugLog = (message, level = 'debug') => {
     if (process.env.NODE_ENV !== 'production' || process.env.DEBUG_HOOKS === 'true') {
       console[level](`[${level.toUpperCase()}] ${message}`);
     }
   };
   ```
   - [x] Remplacer tous les console.log de débogage par cette fonction

- [x] **Validation de la solution**
   - [x] Vérifier que les logs n'apparaissent pas en production
   - [x] S'assurer que les logs sont disponibles en développement pour le débogage

## 4. Standardiser les conventions de nommage

- [x] **Analyse des conventions actuelles**
   - [x] Recenser les différentes conventions de nommage utilisées (suffixes V2, Migrated, etc.)
   - [x] Définir une convention claire pour les hooks génériques vs. spécifiques

- [x] **Harmonisation des noms**
   - [x] Renommer les hooks migrés pour utiliser une convention cohérente (ex: useArtisteDetailsV2 au lieu de useArtisteDetailsMigrated)
   - [x] Mettre à jour les messages de dépréciation pour utiliser les noms corrects
   - [x] Utiliser les scripts existants pour mettre à jour les importations

- [x] **Documentation des conventions**
   - [x] Mettre à jour `STANDARDISATION_HOOKS.md` avec les conventions adoptées
   - [x] Créer un document de référence rapide pour les développeurs

## 5. Améliorer la gestion du cache

- [x] **Audit de la gestion du cache actuelle**
   - [x] Examiner l'implémentation du cache dans `useGenericEntityDetails.js`
   - [x] Identifier les limitations de la solution actuelle (cache par instance, etc.)

- [x] **Conception d'une solution robuste**
   - [x] Évaluer l'utilisation de React Query ou SWR comme remplacement
   - [x] Définir une stratégie de cache cohérente pour tous les hooks

- [x] **Implémentation de la solution**
   - [x] Installer et configurer la solution choisie
   - [x] Mettre à jour les hooks génériques pour utiliser la nouvelle gestion de cache
   - [x] Ajouter des options de configuration pour personnaliser le comportement du cache

## 6. Simplifier les patterns complexes

- [x] **Identification des patterns complexes**
   - [x] Analyser la gestion des références et du cycle de vie dans `useGenericEntityDetails.js`
   - [x] Identifier les patterns difficiles à maintenir ou à comprendre

- [x] **Simplification des patterns**
   - [x] Refactoriser la gestion des abonnements Firestore
   - [x] Simplifier la logique de gestion des erreurs
   - [x] Remplacer les variables globales comme `hookInstances` par des solutions plus maintenables

- [x] **Validation des simplifications**
   - [x] Assurer que la compatibilité est préservée
   - [x] Vérifier que les performances sont maintenues ou améliorées

## 7. Corriger les références incorrectes

- [x] **Détection des références incorrectes**
   - [x] Analyser les messages de dépréciation dans les hooks wrappers
   - [x] Vérifier la cohérence entre les noms mentionnés et les fichiers réels

- [x] **Correction des références**
   - [x] Mettre à jour les messages de dépréciation pour référencer les bons hooks
   - [x] Standardiser la forme des messages (ex: "import { hookNameV2 } from '@/hooks/entity'")
   - [x] Mettre à jour la documentation avec les références correctes

- [x] **Validation des corrections**
   - [x] Vérifier que les messages guident correctement les développeurs
   - [x] S'assurer que les chemins d'importation suggérés fonctionnent

## 8. Documenter la migration

- [x] **Mise à jour de la documentation existante**
   - [x] Compléter le document `GUIDE_MIGRATION_HOOKS_VERS_GENERIQUES.md`
   - [x] Mettre à jour `PLAN_DEPRECIATION_HOOKS.md` avec l'état actuel

- [x] **Création d'exemples concrets**
   - [x] Développer des exemples clairs de migration pour chaque type de hook
   - [x] Créer un fichier d'exemples commentés montrant l'avant/après

- [x] **Communication du plan**
   - [x] Organiser une session de présentation pour l'équipe
   - [x] Mettre à disposition le script `detect_deprecated_hooks.js` avec documentation

---

*Document préparé par l'équipe TourCraft*
*Dernière mise à jour: 8 mai 2025*