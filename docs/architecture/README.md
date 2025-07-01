# Documentation Architecture

*Dernière mise à jour : 30 juin 2025*

Ce dossier contient la documentation de l'architecture du projet TourCraft, incluant les principes techniques, les guides et les plans de refactorisation.

## 📋 Documents Disponibles

### Architecture Principale
- [🎯 **ARCHITECTURE_V2_2025.md**](./ARCHITECTURE_V2_2025.md) - Guide complet de l'architecture V2 actuelle
- [📋 **CONSOLIDATION_DASHBOARDS_RAPPORT.md**](./CONSOLIDATION_DASHBOARDS_RAPPORT.md) - Rapport de consolidation des dashboards
- [📝 **recommendations.md**](./recommendations.md) - Recommandations techniques générales

### Plans et Simplification
- [🔄 **SIMPLIFICATION_SANS_UI_CHANGE.md**](./SIMPLIFICATION_SANS_UI_CHANGE.md) - Guide de simplification du code
- [📋 **plan-environnements-dev-prod.md**](./plan-environnements-dev-prod.md) - Plan des environnements avec émulateurs Firebase
- [📈 **PLAN_REFACTORING_TOURCRAFT_2025.md**](./PLAN_REFACTORING_TOURCRAFT_2025.md) - Plan de refactoring global

### Sécurité
- [🔒 **SECURITE.md**](./SECURITE.md) - Documentation de sécurité et bonnes pratiques

## 🏗️ Principes Architecturaux

### Structure du Projet
- **Séparation des responsabilités** : Components, hooks, services
- **Architecture modulaire** : Composants réutilisables
- **Responsive design** : Support desktop/mobile
- **Performance** : Optimisation du bundle et lazy loading

### Technologies Clés
- **React 18.2** : Framework principal avec hooks et contextes
- **Firebase 10.9** : Backend, auth, et stockage
- **CSS Modules** : Styles isolés et maintenables
- **React Router 6** : Navigation et routing
- **CRACO** : Configuration personnalisée du build

### Patterns Architecturaux V2
- **Hooks génériques** : Architecture unifiée pour toutes les entités
- **Multi-Organisation** : Support natif avec OrganizationContext
- **Cache multicouche** : Système de cache avec TTL configurable
- **Relations bidirectionnelles** : Gestion automatique des relations
- **Configuration centralisée** : entityConfigurations.js

## 🎯 Objectifs Architecturaux

1. **Maintenabilité** : Code lisible et évolutif
2. **Performance** : Chargement rapide et optimisé
3. **Scalabilité** : Architecture extensible
4. **Sécurité** : Protection des données et authentification
5. **Accessibilité** : Respect des standards WCAG

## 🔄 Évolution de l'Architecture

### Accomplissements Architecture V2
- ✅ Migration complète programmateurs → contacts
- ✅ Implémentation hooks génériques V2
- ✅ Système de cache intelligent
- ✅ Support multi-organisation natif
- ✅ Relations bidirectionnelles automatiques
- ✅ Émulateurs Firebase pour développement hors ligne

### Prochaines Étapes
- Migration vers TypeScript pour la type safety
- Implémentation GraphQL pour optimiser les requêtes
- Tests unitaires des hooks génériques
- Migration vers Vite ou Next.js

## 📦 Documents Archivés

Les documents obsolètes de l'architecture V1 ont été archivés dans `/docs/archive/architecture-v1/` :
- `GUIDE_ARCHITECTURE.md` - Architecture V1 obsolète
- `REFACTORING_STRUCTURE.md` - Migration programmateur→contact terminée
- `ARCHITECTURE_LEGACY.md` - Documentation legacy

---

*Documentation maintenue par l'équipe de développement* 