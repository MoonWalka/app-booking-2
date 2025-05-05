# Structure de Documentation TourCraft

*Document créé le: 5 mai 2025*

Ce document présente la nouvelle structure de documentation du projet TourCraft, conçue pour être accessible aux développeurs moins expérimentés tout en facilitant le travail des assistants IA.

## Organisation des Documents

Chaque document technique important sera désormais structuré en deux sections principales:

1. **🧑‍💻 GUIDE DÉVELOPPEUR** - Une section simplifiée avec les informations essentielles
2. **🤖 SECTION COPILOT** - Une section détaillée avec des informations techniques complètes

### Structure Type d'un Document

```markdown
# Titre du Document

*Date de création / Dernière mise à jour*
*Référence au plan global si applicable*

<!-- ======= SECTION DÉVELOPPEUR (SIMPLIFIÉE) ======= -->

## 🧑‍💻 GUIDE DÉVELOPPEUR : [Titre Simplifié]

### Ce que vous devez savoir
[Résumé simple et accessible du contenu]

### [Sections pertinentes pour l'utilisateur]
[Contenu simplifié avec exemples clairs]

### Comment ça marche (exemple simple)
[Exemple de code minimal et commenté]

### Prochaines étapes
[Actions à entreprendre, dates prévues]

<!-- ======= SECTION COPILOT (DÉTAILLÉE) ======= -->

## 🤖 SECTION COPILOT : Informations Détaillées

> Cette section fournit des détails techniques complets pour GitHub Copilot.

### Fichiers connexes et leurs emplacements
[Liste des fichiers liés avec chemins complets]

### [Sections techniques détaillées]
[Informations complètes et précises]

### [Analyses techniques]
[Analyses approfondies pour l'assistant]

### État du plan global (pour suivi Copilot)
[État d'avancement des différentes phases]

## Conclusion
[Conclusion générale du document]

---

*Références et liens vers d'autres documents*
```

## Dossier `.ai-docs`

Ce dossier contient des documents spécifiquement conçus pour aider GitHub Copilot à comprendre le projet:

1. **PROJECT_MAP.md** - Vue d'ensemble de la structure du projet
2. **FILES_INDEX.md** - Index complet des fichiers importants du projet
3. **CURRENT_STATUS.md** - État actuel des initiatives du projet
4. **CONVENTIONS.md** - Conventions de codage du projet

## Standards pour les Documents Techniques

### Pour les Plans et Analyses

Les documents de planification et d'analyse doivent inclure:

- Une section "Fichiers impactés" listant tous les fichiers qui seront modifiés
- Des références croisées explicites vers d'autres documents pertinents
- Un calendrier clair avec des étapes et des livrables

### Pour les Spécifications

Les spécifications doivent inclure:

- Des exemples concrets d'utilisation
- Des détails sur l'API proposée
- Des informations sur la compatibilité avec le code existant
- Les cas limites et leur gestion

## Mise en Œuvre

Cette nouvelle structure sera appliquée à:

1. Tous les nouveaux documents de documentation
2. Les documents existants les plus importants (plans, spécifications d'API)
3. Progressivement à l'ensemble de la documentation technique

## Objectifs

Cette restructuration vise à:

- Simplifier l'accès à l'information pour les développeurs moins expérimentés
- Fournir un contexte technique complet pour GitHub Copilot
- Éviter les erreurs dues à un manque d'information
- Faciliter la maintenance du projet dans la durée

---

*Document de référence pour la nouvelle structure de documentation du projet TourCraft*