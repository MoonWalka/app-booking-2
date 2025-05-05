# Index des Fichiers du Projet TourCraft

*Document créé le: 5 mai 2025*
*Dernière mise à jour: 5 mai 2025*

Ce document répertorie tous les fichiers importants du projet TourCraft, classés par catégorie pour faciliter la navigation et la recherche.

## Documents de Planification et Migration

### Migration des Hooks Génériques
- `/docs/hooks/PLAN_MIGRATION_HOOKS_GENERIQUES.md` - Plan principal de migration vers des hooks génériques
- `/docs/hooks/JOURNAL_MIGRATION_HOOKS.md` - Journal de suivi de la migration
- `/docs/hooks/STANDARDISATION_HOOKS.md` - Standards pour l'organisation des hooks

### Documents d'Analyse
- `/docs/hooks/ANALYSE_HOOKS_DETAILS.md` - Analyse des hooks de détails existants
- `/docs/hooks/ANALYSE_HOOKS_LISTE.md` - Analyse des hooks de liste existants
- `/docs/hooks/ANALYSE_HOOKS_RECHERCHE.md` - Analyse des hooks de recherche existants

### Spécifications API
- `/docs/hooks/SPEC_API_GENERIC_ENTITY_DETAILS.md` - Spécification de l'API useGenericEntityDetails
- `/docs/hooks/SPEC_API_GENERIC_ENTITY_LIST.md` - Spécification de l'API useGenericEntityList
- `/docs/hooks/SPEC_API_GENERIC_ENTITY_SEARCH.md` - Spécification de l'API useGenericEntitySearch
- `/docs/hooks/SPEC_API_GENERIC_ENTITY_FORM.md` - Spécification de l'API useGenericEntityForm

### Plans de Refactorisation
- `/docs/PLAN_REFACTORISATION_COMPOSANTS.md` - Plan de refactorisation des composants
- `/docs/PLAN_REFACTORISATION_CSS_PROGRESSIF.md` - Plan de refactorisation CSS progressive
- `/docs/PLAN_MIGRATION_FIREBASE.md` - Plan de migration Firebase

## Documentation sur les Hooks

### Hooks Génériques
- `/src/hooks/common/useGenericEntityForm.js` - Hook générique pour les formulaires d'entités
- `/src/hooks/common/useGenericEntitySearch.js` - Hook générique pour la recherche d'entités
- `/src/hooks/common/useSearchAndFilter.js` - Hook utilitaire pour la recherche et le filtrage

### Hooks par Entité
#### Hooks de Concerts
- `/src/hooks/concerts/useConcertDetails.js` - Gestion des détails d'un concert
- `/src/hooks/concerts/useConcertForm.js` - Gestion du formulaire d'un concert
- `/src/hooks/concerts/useConcertSearch.js` - Recherche de concerts
- `/src/hooks/concerts/useConcertFilters.js` - Filtrage des concerts

#### Hooks de Lieux
- `/src/hooks/lieux/useLieuDetails.js` - Gestion des détails d'un lieu
- `/src/hooks/lieux/useLieuForm.js` - Gestion du formulaire d'un lieu
- `/src/hooks/lieux/useLieuSearch.js` - Recherche de lieux

#### Hooks de Programmateurs
- `/src/hooks/programmateurs/useProgrammateurDetails.js` - Gestion des détails d'un programmateur
- `/src/hooks/programmateurs/useProgrammateurForm.js` - Gestion du formulaire d'un programmateur
- `/src/hooks/programmateurs/useProgrammateurSearch.js` - Recherche de programmateurs

#### Hooks de Structures
- `/src/hooks/structures/useStructureDetails.js` - Gestion des détails d'une structure
- `/src/hooks/structures/useStructureForm.js` - Gestion du formulaire d'une structure
- `/src/hooks/structures/useStructureSearch.js` - Recherche de structures

#### Hooks d'Artistes
- `/src/hooks/artistes/useArtisteDetails.js` - Gestion des détails d'un artiste
- `/src/hooks/artistes/useArtisteForm.js` - Gestion du formulaire d'un artiste
- `/src/hooks/artistes/useArtisteSearch.js` - Recherche d'artistes

#### Hooks de Contrats
- `/src/hooks/contrats/useContratDetails.js` - Gestion des détails d'un contrat
- `/src/hooks/contrats/useContratForm.js` - Gestion du formulaire d'un contrat

## Composants Principaux

### Composants de Concerts
- `/src/components/concerts/desktop/ConcertDetails.js` - Affichage détaillé d'un concert (desktop)
- `/src/components/concerts/desktop/ConcertForm.js` - Formulaire de concert (desktop)
- `/src/components/concerts/desktop/ConcertList.js` - Liste des concerts (desktop)
- `/src/components/concerts/mobile/ConcertDetails.js` - Affichage détaillé d'un concert (mobile)

### Composants de Programmateurs
- `/src/components/programmateurs/desktop/ProgrammateurDetails.js` - Affichage détaillé d'un programmateur (desktop)
- `/src/components/programmateurs/desktop/ProgrammateurLegalSection.js` - Section légale d'un programmateur
- `/src/components/programmateurs/desktop/ProgrammateurStructuresSection.js` - Section des structures d'un programmateur

### Composants de Lieux
- `/src/components/lieux/desktop/LieuDetails.js` - Affichage détaillé d'un lieu (desktop)
- `/src/components/lieux/desktop/LieuForm.js` - Formulaire de lieu (desktop)
- `/src/components/lieux/desktop/LieuList.js` - Liste des lieux (desktop)

### Composants Génériques
- `/src/components/common/GenericList.js` - Composant de liste générique
- `/src/components/common/UnderConstruction.js` - Message pour les fonctionnalités en construction

## Services et Accès aux Données

### Services Firebase
- `/src/services/firebaseService.js` - Service principal d'accès à Firebase
- `/src/services/storageService.js` - Service de gestion du stockage Firebase
- `/src/firebaseInit.js` - Configuration et initialisation de Firebase

### Services Métier
- `/src/services/concertService.js` - Service pour les opérations sur les concerts
- `/src/services/artisteService.js` - Service pour les opérations sur les artistes
- `/src/services/programmateursService.js` - Service pour les opérations sur les programmateurs

## Contextes React

- `/src/context/AuthContext.js` - Contexte d'authentification
- `/src/context/ParametresContext.js` - Contexte des paramètres de l'application

## Utilitaires

- `/src/utils/dates.js` - Fonctions utilitaires pour les dates
- `/src/utils/formatters.js` - Formateurs pour différents types de données
- `/src/utils/validation.js` - Fonctions de validation génériques

---

*Ce document est maintenu à jour régulièrement pour refléter la structure actuelle du projet.*