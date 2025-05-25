# Documentation Standards & Conventions

*Dernière mise à jour : 25 mai 2025*

Ce dossier contient les standards, conventions et guides de style du projet TourCraft.

## 📋 Documents Disponibles

### Guides de Style
- [📝 **CSS_STYLE_GUIDE.md**](./CSS_STYLE_GUIDE.md) - Standards et conventions CSS
- [📋 **GUIDE_STANDARDS_CONVENTIONS.md**](./GUIDE_STANDARDS_CONVENTIONS.md) - Guide général des standards et conventions

### Standards Spécifiques
- [📋 **STANDARDISATION_MODELES.md**](./STANDARDISATION_MODELES.md) - Standardisation des modèles de données
- [📋 **components-standardises.md**](./components-standardises.md) - Standards pour les composants
- [📋 **GUIDE_IMPORTS_UI.md**](./GUIDE_IMPORTS_UI.md) - Guide des imports d'interface utilisateur

### Composants Standards
- [📋 **CARD_COMPONENT_USAGE.md**](./CARD_COMPONENT_USAGE.md) - Usage standardisé du composant Card

## 🎯 Standards Techniques

### CSS et Styles
- **CSS Modules** : Styles isolés et maintenables
- **Variables CSS** : Système de design avec variables --tc-*
- **Responsive Design** : Support desktop/mobile
- **Performance** : Optimisation des styles

### Composants React
- **Architecture générique** : Patterns réutilisables
- **Props standardisées** : Interface cohérente
- **TypeScript** : Typage strict
- **Tests** : Couverture des composants

### Code JavaScript/React
- **ESLint** : Règles de qualité de code
- **Prettier** : Formatage automatique
- **Hooks** : Patterns standardisés
- **Imports** : Organisation et conventions

## 📐 Conventions de Nommage

### Fichiers et Dossiers
- **Composants** : PascalCase (ex: `UserProfile.js`)
- **Hooks** : camelCase avec préfixe use (ex: `useUserData.js`)
- **Utilitaires** : camelCase (ex: `formatDate.js`)
- **CSS Modules** : ComponentName.module.css

### Variables et Fonctions
- **Variables** : camelCase
- **Constantes** : UPPER_SNAKE_CASE
- **Fonctions** : camelCase
- **Classes CSS** : kebab-case ou camelCase

## 🚀 Bonnes Pratiques

### Performance
1. **Lazy Loading** : Chargement différé des composants
2. **Memoization** : React.memo pour les composants
3. **Bundle Splitting** : Optimisation du code
4. **CSS Optimization** : Minification et purge

### Maintenabilité
1. **Documentation** : Chaque composant documenté
2. **Tests** : Couverture des fonctionnalités critiques
3. **Refactoring** : Amélioration continue
4. **Standards** : Respect des conventions

### Accessibilité
1. **WCAG** : Respect des standards d'accessibilité
2. **Semantic HTML** : Utilisation correcte des balises
3. **ARIA** : Attributs d'accessibilité
4. **Keyboard Navigation** : Support clavier complet

## 📊 Métriques de Qualité

- **ESLint** : 0 warning maintenu
- **CSS** : 225+ modules standardisés
- **TypeScript** : Couverture de type élevée
- **Tests** : Couverture des composants critiques

---

*Documentation maintenue par l'équipe de développement* 