# Hooks dans TourCraft

## Vue d'ensemble

Dans TourCraft, nous utilisons largement des hooks React personnalisés pour encapsuler et réutiliser la logique à travers l'application. Les hooks sont organisés par domaine fonctionnel pour faciliter la maintenance et la lisibilité du code.

## Catégories de hooks

### [Hooks communs](COMMON_HOOKS.md)
Hooks réutilisables à travers différentes parties de l'application, tels que la gestion de recherche d'entités, la responsivité et le thème.

### [Hooks pour les concerts](CONCERT_HOOKS.md)
Hooks spécifiques à la gestion des concerts, incluant la création, l'édition, et le suivi des statuts.

### [Hooks pour les contrats](CONTRAT_HOOKS.md)
Hooks dédiés à la génération et à la gestion des contrats, incluant les templates et la génération de PDF.

### [Hooks pour les artistes](ARTISTE_HOOKS.md)
Hooks pour la gestion des artistes, incluant la recherche et le filtrage.

### [Hooks pour les programmateurs](PROGRAMMATEUR_HOOKS.md)
Hooks pour la gestion des programmateurs, incluant les détails, la liste et les relations avec les concerts.

### [Hooks pour les paramétrages](PARAMETRE_HOOKS.md)
Hooks pour la gestion des paramètres de l'application et des informations d'entreprise.

## Bonnes pratiques

- Les hooks doivent être nommés avec le préfixe `use` selon la convention React
- Chaque hook doit avoir une responsabilité unique et clairement définie
- Les hooks complexes devraient être décomposés en hooks plus petits et plus spécialisés
- La documentation du hook doit préciser ses dépendances, ses paramètres et son API retournée

## Navigation
- [Retour à l'accueil](../README.md)
- [Voir les hooks communs](COMMON_HOOKS.md)
- [Voir les hooks pour programmateurs](PROGRAMMATEUR_HOOKS.md)