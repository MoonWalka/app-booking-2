# Journal de Migration des Hooks

*Dernière mise à jour: 7 Mai 2025*

Ce document suit la progression de la migration des hooks spécifiques vers les hooks génériques, conformément au plan établi dans `PLAN_MIGRATION_HOOKS_GENERIQUES.md`.

## État Actuel de la Migration

| Hook | Statut | Date | Notes |
|------|--------|------|-------|
| useGenericEntityDetails | ✅ Terminé | 28/04/2025 | Hook de base implémenté et testé |
| useGenericEntityList | ✅ Terminé | 30/04/2025 | Hook de base implémenté et testé |
| useGenericEntitySearch | ✅ Terminé | 01/05/2025 | Hook de base implémenté et testé |
| useGenericEntityForm | ✅ Terminé | 03/05/2025 | Hook de base implémenté et testé |
| useLieuDetails | ✅ Migré | 05/05/2025 | Migré vers useGenericEntityDetails |
| useProgrammateurDetails | ✅ Migré | 05/05/2025 | Migré vers useGenericEntityDetails, gestion personnalisée des structures et contacts |
| useArtisteDetails | ✅ Migré | 06/05/2025 | Migré vers useGenericEntityDetails, gestion personnalisée des genres, types de spectacle, membres et documents |
| useStructureDetails | ✅ Migré | 07/05/2025 | Migré vers useGenericEntityDetails, gestion des programmateurs associés |
| useConcertDetails | ✅ Migré | 05/05/2025 | Migré vers useGenericEntityDetails, gestion personnalisée des formulaires et des relations bidirectionnelles |
| useContratDetails | ✅ Migré | 07/05/2025 | Migré vers useGenericEntityDetails, gestion complexe des relations multi-niveaux |

## Détails des Migrations

### useGenericEntityDetails (28/04/2025)
- Implémentation du hook de base pour la gestion des détails d'entité
- Fonctionnalités: chargement, édition, suppression, navigation, et gestion des entités liées
- Tests unitaires complets

### useGenericEntityList (30/04/2025)
- Implémentation du hook de base pour l'affichage de listes d'entités
- Fonctionnalités: pagination, tri, filtrage basique
- Tests unitaires complets

### useGenericEntitySearch (01/05/2025)
- Implémentation du hook de base pour la recherche d'entités
- Fonctionnalités: recherche textuelle, filtres avancés, historique de recherche
- Tests unitaires complets
- Note: Le déploiement final avec tous les hooks de recherche migrés est prévu pour le 11/05/2025

### useGenericEntityForm (03/05/2025)
- Implémentation du hook de base pour les formulaires d'entités
- Fonctionnalités: validation, état du formulaire, soumission
- Tests unitaires complets

### useLieuDetails (05/05/2025)
- Migration réussie vers useGenericEntityDetails
- Fonctionnalités spécifiques préservées: affichage des capacités et des équipements
- Tests unitaires implémentés pour valider la migration

### useProgrammateurDetails (05/05/2025)
- Migration réussie vers useGenericEntityDetails
- Gestion personnalisée des relations bidirectionnelles avec les structures
- Fonctionnalités spécifiques préservées: 
  - Gestion des contacts (ajout/modification/suppression)
  - Association avec structures principales et secondaires 
  - Synchronisation bidirectionnelle des relations
- Tests unitaires implémentés pour valider la migration

### useArtisteDetails (06/05/2025)
- Migration réussie vers useGenericEntityDetails
- Fonctionnalités spécifiques préservées:
  - Gestion des entités liées (structure, manager)
  - Gestion des genres musicaux et types de spectacle
  - Gestion des membres de l'artiste/groupe
  - Gestion des réseaux sociaux
  - Gestion des documents associés (riders, contrats, etc.)
- Tests unitaires à finaliser pour valider complètement la migration

### useStructureDetails (07/05/2025)
- Migration réussie vers useGenericEntityDetails
- Implémenté dans `useStructureDetailsMigrated.js` avec gestion des relations
- Fonctionnalités spécifiques préservées:
  - Gestion des programmateurs associés (relation one-to-many)
  - Formatage des dates et des valeurs nulles
  - API compatible avec l'ancien hook pour garantir la transition en douceur
- Prochaine étape: implémenter les tests unitaires pour valider la migration

### useContratDetails (07/05/2025)
- Migration réussie vers useGenericEntityDetails
- Implémenté dans `useContratDetailsMigrated.js` avec gestion des relations complexes
- Fonctionnalités spécifiques préservées:
  - Gestion des entités liées directes (template, concert)
  - Gestion des entités liées indirectes via le concert (programmateur, lieu, artiste)
  - Chargement des paramètres d'entreprise
  - Requêtes personnalisées pour gérer les relations multi-niveaux
  - Formatage des dates et montants
  - API compatible avec l'ancien hook pour garantir la transition en douceur
- Migration achevée en avance sur le planning (initialement prévue pour le 10/05/2025)

### useConcertDetails (05/05/2025)
- Migration réussie vers useGenericEntityDetails
- Implémenté dans `useConcertDetailsMigrated.js` avec tests unitaires
- Fonctionnalités spécifiques préservées:
  - Gestion des entités liées (lieu, artiste, programmateur, structure)
  - Gestion des statuts de concert avec `useConcertStatus`
  - Gestion des formulaires de concert avec `useConcertFormsManagement`
  - Gestion des relations bidirectionnelles avec `useConcertAssociations`
  - Formatage personnalisé des dates et montants
  - API compatible avec l'ancien hook pour garantir la transition en douceur
- Tests unitaires implémentés pour valider la migration

## Problèmes Rencontrés et Solutions

### Problèmes avec les relations bidirectionnelles
**Problème**: La mise à jour des relations bidirectionnelles (par exemple entre programmateurs et structures) nécessite des opérations supplémentaires sur les documents associés.

**Solution**: Implémentation d'un mécanisme `onBeforeSubmit` dans useGenericEntityDetails permettant d'exécuter des opérations personnalisées avant la sauvegarde finale.

### Gestion des sous-collections et documents imbriqués
**Problème**: Certains hooks spécifiques gèrent des sous-collections ou des collections de données imbriquées (comme les contacts des programmateurs).

**Solution**: Les hooks migrés conservent des fonctions utilitaires spécifiques pour manipuler ces collections tout en utilisant la base commune du hook générique.

### Conflit entre noms de paramètres (05/05/2025)
**Problème**: Un conflit a été détecté entre le nom du paramètre `validateForm` de useGenericEntityDetails et une variable locale du même nom dans certains hooks migrés.

**Solution**: Le paramètre a été renommé en `validateFormFn` dans l'API du hook générique pour éviter toute collision.

### Gestion des relations multi-niveaux (07/05/2025)
**Problème**: Le hook useContratDetails nécessite de charger des entités liées indirectement (à travers une autre entité), ce qui n'est pas directement supporté par le mécanisme standard de relatedEntities.

**Solution**: Implémentation de requêtes personnalisées (customQueries) dans useGenericEntityDetails qui permettent de définir des logiques de chargement complexes pour les entités liées indirectement.

## Prochaines Étapes

1. ✅ Migration de useArtisteDetails (terminée le 06/05/2025)
2. ✅ Migration de useStructureDetails (terminée le 07/05/2025)
3. ✅ Migration de useConcertDetails (terminée le 05/05/2025)
4. ✅ Migration de useContratDetails (terminée le 07/05/2025, en avance sur le planning)
5. 📝 Tests unitaires pour les hooks migrés (prévu pour le 10/05/2025)
6. 📝 Refactorisation des composants pour utiliser les nouveaux hooks génériques (prévu pour la semaine du 12/05/2025)

## Alignement avec le Plan de Restructuration

Ce journal de migration s'aligne avec le [Plan de Restructuration des Hooks](./PLAN_RESTRUCTURATION_HOOKS.md) qui a pour objectif d'organiser les hooks dans une structure cohérente. Les points clés d'alignement sont:

1. **Phases complémentaires**: La migration vers des hooks génériques (ce document) se concentre sur la fonctionnalité, tandis que la restructuration se concentre sur l'organisation des fichiers.
   
2. **Timing coordonné**: La migration de useIsMobile.js prévue pour le 07/05/2025 dans le plan de restructuration n'apparaît pas dans ce journal car il s'agit d'un hook utilitaire et non d'un hook d'entité métier.

3. **État global de la migration**: Actuellement à 70% comme indiqué dans l'État Consolidé des Migrations et Refactorisations.

## Ressources

- [PLAN_MIGRATION_HOOKS_GENERIQUES.md](/docs/hooks/PLAN_MIGRATION_HOOKS_GENERIQUES.md) - Plan complet de la migration
- [SPEC_API_GENERIC_ENTITY_DETAILS.md](/docs/hooks/SPEC_API_GENERIC_ENTITY_DETAILS.md) - Spécification technique de useGenericEntityDetails
- [STANDARDISATION_HOOKS.md](/docs/hooks/STANDARDISATION_HOOKS.md) - Standards techniques pour l'utilisation des hooks génériques
- [ETAT_MIGRATION_CONSOLIDATION.md](/docs/ETAT_MIGRATION_CONSOLIDATION.md) - État consolidé de tous les chantiers de refactorisation