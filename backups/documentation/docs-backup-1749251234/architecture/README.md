# Documentation Architecture

*Dernière mise à jour : 25 mai 2025*

Ce dossier contient la documentation de l'architecture du projet TourCraft, incluant les principes techniques, les guides et les plans de refactorisation.

## 📋 Documents Disponibles

### Architecture Principale
- [📐 **GUIDE_ARCHITECTURE.md**](./GUIDE_ARCHITECTURE.md) - Guide détaillé de l'architecture du projet

### Plans et Refactorisation
- [📐 **REFACTORING_STRUCTURE.md**](./REFACTORING_STRUCTURE.md) - Plan de refactorisation de la structure du projet
- [📋 **plan-environnements-dev-prod.md**](./plan-environnements-dev-prod.md) - Plan des environnements de développement et production

### Sécurité
- [🔒 **SECURITE.md**](./SECURITE.md) - Documentation de sécurité et bonnes pratiques

## 🏗️ Principes Architecturaux

### Structure du Projet
- **Séparation des responsabilités** : Components, hooks, services
- **Architecture modulaire** : Composants réutilisables
- **Responsive design** : Support desktop/mobile
- **Performance** : Optimisation du bundle et lazy loading

### Technologies Clés
- **React** : Framework principal avec hooks
- **Firebase** : Backend et authentification
- **CSS Modules** : Styles isolés et maintenables
- **React Router** : Navigation et routing

### Patterns Utilisés
- **Hooks personnalisés** : Logique métier réutilisable
- **Context API** : Gestion d'état globale
- **Composants génériques** : Réutilisabilité maximale
- **Factory patterns** : Création d'objets standardisée

## 🎯 Objectifs Architecturaux

1. **Maintenabilité** : Code lisible et évolutif
2. **Performance** : Chargement rapide et optimisé
3. **Scalabilité** : Architecture extensible
4. **Sécurité** : Protection des données et authentification
5. **Accessibilité** : Respect des standards WCAG

## 🔄 Évolution de l'Architecture

### Accomplissements Récents
- Migration vers hooks génériques
- Standardisation CSS avec CSS Modules
- Simplification Firebase avec Testing SDK
- Optimisation des performances

### Prochaines Étapes
- Amélioration de la gestion d'état
- Optimisation des composants
- Renforcement de la sécurité

---

*Documentation maintenue par l'équipe de développement* 