# Flux de travail dans TourCraft

## Vue d'ensemble

Les flux de travail représentent les processus métier principaux de l'application TourCraft. Ces processus impliquent généralement plusieurs entités, composants et interactions utilisateur pour accomplir des objectifs spécifiques liés à la gestion de booking.

## Flux de travail principaux

### [Création et gestion de concerts](CONCERT_WORKFLOW.md)
Ce flux de travail couvre le cycle de vie complet d'un concert, de la création initiale à la finalisation, en passant par les diverses étapes de négociation et de confirmation.

### [Gestion des contrats](CONTRAT_WORKFLOW.md)
Ce flux décrit le processus de création, personnalisation, envoi et suivi des contrats pour les concerts.

### [Associations entre entités](ASSOCIATION_WORKFLOW.md)
Ce flux explique comment les différentes entités (artistes, lieux, programmateurs) sont liées entre elles et comment gérer ces associations.

## Statuts et transitions

Chaque entité principale (concert, contrat) possède un cycle de vie représenté par des statuts. Les transitions entre ces statuts suivent des règles métier précises qui garantissent la cohérence des données.

### Statuts des concerts
- **Initial** : Premier contact, intention de concert
- **En négociation** : Discussion des termes en cours
- **Option** : Date réservée provisoirement
- **Confirmé** : Concert confirmé par toutes les parties
- **En attente de contrat** : Contrat en cours de préparation
- **Contrat envoyé** : Contrat envoyé au programmateur
- **Contrat signé** : Contrat signé par toutes les parties
- **Terminé** : Concert passé et toutes les obligations remplies
- **Annulé** : Concert annulé

### Statuts des contrats
- **Brouillon** : Contrat en cours de rédaction
- **À valider** : Contrat prêt pour validation interne
- **À envoyer** : Contrat validé, prêt à être envoyé
- **Envoyé** : Contrat envoyé au programmateur
- **Signé par programmateur** : Contrat signé par le programmateur
- **Signé** : Contrat signé par toutes les parties
- **Annulé** : Contrat annulé

## Diagramme de flux

![Diagramme des flux de travail](../assets/diagrams/workflow_diagram.png)
*Note: Ce diagramme est à titre indicatif, consultez la documentation détaillée pour chaque flux de travail.*

## Intégration des flux

Les flux de travail sont implémentés à travers une combinaison de:
- **Composants UI** qui guident l'utilisateur à travers les étapes
- **Hooks** qui encapsulent la logique métier
- **Contextes** qui maintiennent l'état global
- **Services** qui interagissent avec le backend
- **Validateurs** qui garantissent l'intégrité des données

## Navigation
- [Retour à l'accueil](../README.md)
- [Voir le flux de travail des concerts](CONCERT_WORKFLOW.md)