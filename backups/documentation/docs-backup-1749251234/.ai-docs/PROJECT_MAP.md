# Carte du Projet TourCraft

*Document créé le: 5 mai 2025*
*Dernière mise à jour: 5 mai 2025*

Ce document fournit une vue d'ensemble de la structure et de l'organisation du projet TourCraft, conçu spécifiquement pour GitHub Copilot.

## Architecture Globale

TourCraft est une application React avec Firebase comme backend, organisée selon une architecture en couches:

1. **Couche présentation**: Composants UI dans `/src/components`
2. **Couche logique métier**: Hooks React dans `/src/hooks` et contextes dans `/src/context`
3. **Couche d'accès aux données**: Services dans `/src/services` et configurations Firebase

## Structure des Dossiers Principaux

```
src/
├── components/        # Composants UI organisés par domaine
│   ├── artistes/      # Composants spécifiques aux artistes
│   ├── concerts/      # Composants spécifiques aux concerts
│   ├── lieux/         # Composants spécifiques aux lieux
│   └── ...
├── hooks/             # Hooks React organisés par domaine
│   ├── artistes/      # Hooks spécifiques aux artistes
│   ├── common/        # Hooks génériques et réutilisables
│   ├── concerts/      # Hooks spécifiques aux concerts
│   └── ...
├── context/           # Contextes React
├── services/          # Services d'accès aux données
└── utils/             # Utilitaires divers
```

## Plans et Initiatives Actuels

Le projet comprend plusieurs initiatives de refactorisation et d'amélioration:

1. **Migration vers des hooks génériques** (en cours)
   - Document principal: `/docs/hooks/PLAN_MIGRATION_HOOKS_GENERIQUES.md`
   - Journal de progression: `/docs/hooks/JOURNAL_MIGRATION_HOOKS.md`
   - Phase 1 (useGenericEntitySearch): ✅ Terminée (11 mai 2025)
   - Phase 2 (useGenericEntityList): ✅ Implémentation terminée, en attente de tests
   - Phase 3 (useGenericEntityDetails): ✅ Implémentation terminée, tests en cours
   - Phase 4 (useGenericEntityForm): ✅ Terminée (5 mai 2025)

2. **Refactorisation des composants** (en cours)
   - Document principal: `/docs/PLAN_REFACTORISATION_COMPOSANTS.md`
   - Phases 1 à 4 terminées, Phase 5 (Tests et validation) en cours

3. **Refactorisation CSS progressive** (en cours)
   - Document principal: `/docs/PLAN_REFACTORISATION_CSS_PROGRESSIF.md`
   - Résumé des modifications: `/docs/RESUME_REFACTORISATION_CSS.md`

4. **Migration Firebase** (planifiée)
   - Document principal: `/docs/PLAN_MIGRATION_FIREBASE.md`
   - Démarrage prévu: Juin 2025

## Entités Principales

Le système gère plusieurs entités avec des relations entre elles:

1. **Programmateur**: Personne organisant des concerts
   - Relation principale: Appartient à une Structure
   - Hooks principaux: `/src/hooks/programmateurs/`
   - Composants principaux: `/src/components/programmateurs/`

2. **Structure**: Organisation (salle, association, etc.)
   - Relation principale: Possède des Programmateurs
   - Hooks principaux: `/src/hooks/structures/`
   - Composants principaux: `/src/components/structures/`

3. **Concert**: Événement musical
   - Relations: Lieu, Artistes, Programmateurs, Contrat
   - Hooks principaux: `/src/hooks/concerts/`
   - Composants principaux: `/src/components/concerts/`

4. **Lieu**: Endroit où se déroulent les concerts
   - Relations: Programmateurs, Concerts
   - Hooks principaux: `/src/hooks/lieux/`
   - Composants principaux: `/src/components/lieux/`

5. **Artiste**: Performer musical
   - Relations: Concerts, Structure (optionnel)
   - Hooks principaux: `/src/hooks/artistes/`
   - Composants principaux: `/src/components/artistes/`

6. **Contrat**: Document légal pour un concert
   - Relations: Concert, Programmateur, Lieu
   - Hooks principaux: `/src/hooks/contrats/`
   - Composants principaux: `/src/components/contrats/`

## Hooks Génériques

Les hooks génériques développés ou en cours de développement sont:

1. **useGenericEntityForm**: ✅ Terminé
   - Utilisation: Gestion des formulaires pour les entités
   - Spécification: `/docs/hooks/SPEC_API_GENERIC_ENTITY_FORM.md`
   - Implémentation: `/src/hooks/common/useGenericEntityForm.js`

2. **useGenericEntitySearch**: ✅ Terminé
   - Utilisation: Recherche standardisée d'entités
   - Spécification: `/docs/hooks/SPEC_API_GENERIC_ENTITY_SEARCH.md`
   - Implémentation: `/src/hooks/common/useGenericEntitySearch.js`

3. **useGenericEntityList**: ✅ Implémentation terminée
   - Utilisation: Gestion des listes d'entités
   - Spécification: `/docs/hooks/SPEC_API_GENERIC_ENTITY_LIST.md`
   - Implémentation: `/src/hooks/common/useGenericEntityList.js`
   - Documentation: `/docs/hooks/DOCUMENTATION_GENERIC_ENTITY_LIST.md`

4. **useGenericEntityDetails**: ✅ Implémentation terminée
   - Utilisation: Gestion des détails d'une entité
   - Spécification: `/docs/hooks/SPEC_API_GENERIC_ENTITY_DETAILS.md`
   - Implémentation: `/src/hooks/common/useGenericEntityDetails.js`
   - Hook migré exemple: `/src/hooks/concerts/useConcertDetailsMigrated.js`
   - Tests: `/src/hooks/tests/useGenericEntityDetails.test.js`

## Relations Entre Documents de Documentation

```
PLAN_MIGRATION_HOOKS_GENERIQUES.md
├── JOURNAL_MIGRATION_HOOKS.md (suivi)
├── ANALYSE_HOOKS_RECHERCHE.md → SPEC_API_GENERIC_ENTITY_SEARCH.md
├── ANALYSE_HOOKS_LISTE.md → SPEC_API_GENERIC_ENTITY_LIST.md
├── ANALYSE_HOOKS_DETAILS.md → SPEC_API_GENERIC_ENTITY_DETAILS.md
└── SPEC_API_GENERIC_ENTITY_FORM.md (déjà implémenté)

PLAN_REFACTORISATION_COMPOSANTS.md
├── STANDARDISATION_MODELES.md
├── PLAN_REFACTORISATION_CSS_PROGRESSIF.md
└── RESUME_REFACTORISATION_CSS.md
```

## Conventions et Standards

1. **Structure des hooks**:
   - Hooks spécifiques dans dossiers par entité: `/src/hooks/[entity]/`
   - Hooks génériques dans: `/src/hooks/common/`
   - Standardisation définie dans: `/docs/hooks/STANDARDISATION_HOOKS.md`

2. **Relations entre entités**:
   - Approche hybride (ID + cache de données)
   - Définie dans: `/docs/STANDARDISATION_MODELES.md`

3. **Composants**:
   - Organisation par entité et par device (desktop/mobile)
   - Composants communs dans `/src/components/common/`

4. **Styles CSS**:
   - Variables CSS globales
   - Modules CSS pour isolation
   - Standardisation progressive en cours

---

*Ce document est destiné à fournir une vue d'ensemble du projet pour GitHub Copilot. Pour des détails spécifiques, consultez les documents référencés.*