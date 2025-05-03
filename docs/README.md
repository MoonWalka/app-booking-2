# Documentation TourCraft

## Introduction

Bienvenue dans la documentation de TourCraft, une application web complète dédiée à la gestion de booking musical. Cette documentation vise à fournir une compréhension approfondie de l'architecture, des composants et des flux de travail de l'application.

## Structure de l'application

TourCraft est construit comme une application React moderne utilisant Firebase comme backend. L'architecture est organisée autour des domaines métier suivants :

- **Artistes** : Gestion des artistes représentés
- **Concerts** : Planification et suivi des concerts
- **Contrats** : Génération, personnalisation et suivi des contrats
- **Lieux** : Gestion des salles et espaces de concert
- **Programmateurs** : Gestion des contacts et relations avec les programmateurs
- **Structures** : Organisation des entités juridiques associées

## Navigation rapide

### Architecture et conception

- [Architecture globale](ARCHITECTURE.md)
- [Corrections de documentation](DOCUMENTATION_CORRECTIONS.md)

### Composants

- [Vue d'ensemble des composants](components/COMPONENTS.md)
- [Composants UI](components/UI_COMPONENTS.md)
- [Composants communs](components/COMMON_COMPONENTS.md)
- [Composants de mise en page](components/LAYOUT_COMPONENTS.md)
- [Composants de formulaire](components/FORM_COMPONENTS.md)
- [Composants PDF](components/PDF_COMPONENTS.md)

### Hooks

- [Vue d'ensemble des hooks](hooks/HOOKS.md)
- [Hooks communs](hooks/COMMON_HOOKS.md)
- [Hooks des concerts](hooks/CONCERT_HOOKS.md)
- [Hooks des contrats](hooks/CONTRAT_HOOKS.md)
- [Hooks des artistes](hooks/ARTISTE_HOOKS.md)

### Contextes

- [Vue d'ensemble des contextes](contexts/CONTEXTS.md)

### Services

- [Vue d'ensemble des services](services/SERVICES.md)

### Utilitaires

- [Vue d'ensemble des utilitaires](utils/UTILS.md)

### Flux de travail

- [Vue d'ensemble des flux de travail](workflows/WORKFLOWS.md)
- [Création et gestion de concerts](workflows/CONCERT_WORKFLOW.md)
- [Gestion des contrats](workflows/CONTRAT_WORKFLOW.md)
- [Associations entre entités](workflows/ASSOCIATION_WORKFLOW.md)

## Guide de contribution

### Standards de code

- Le code suit les standards ESLint configurés dans le projet
- Les styles utilisent des CSS Modules
- Les composants devraient être fonctionnels (hooks) plutôt que basés sur des classes
- La documentation est écrite en français

### Procédure de contribution

1. Créer une branche basée sur `develop` pour votre fonctionnalité
2. Développer et tester vos modifications
3. S'assurer que les tests passent et que le code respecte les standards
4. Soumettre une Pull Request vers `develop`
5. La PR sera revue et fusionnée après validation

### Règles de documentation

- La documentation des composants et hooks doit inclure :
  - Description de la fonction/du but
  - Liste des props/paramètres
  - Dépendances
  - Exemples d'utilisation

## FAQ

**Q: Comment ajouter un nouveau type d'entité ?**  
R: Créez les fichiers nécessaires dans les dossiers appropriés (components, hooks, services) en suivant les conventions de nommage et l'architecture existante.

**Q: Comment générer un nouveau type de document PDF ?**  
R: Consultez la documentation sur les [Composants PDF](components/PDF_COMPONENTS.md) et les [Services](services/SERVICES.md#pdfservice) pour comprendre l'architecture de génération PDF.

**Q: Comment déboguer les problèmes de communication avec Firebase ?**  
R: Utilisez les méthodes de débogage disponibles dans le [FirestoreService](services/SERVICES.md#firestoreservice) et consultez la console Firebase pour les journaux d'erreurs.

## Ressources externes

- [Documentation React](https://reactjs.org/docs/getting-started.html)
- [Documentation Firebase](https://firebase.google.com/docs)
- [Guide Material-UI](https://mui.com/getting-started/usage/)

## Contact

Pour toute question sur la documentation, contactez l'équipe technique à l'adresse tech@tourcraft.com