# Guide CSS TourCraft - Version 2.0

## Introduction

Ce guide CSS définit les standards, conventions et bonnes pratiques pour le développement front-end de l'application TourCraft. Il intègre les améliorations issues de notre récent audit CSS et établit un cadre cohérent pour garantir la qualité, la maintenabilité et la cohérence visuelle de notre interface utilisateur.

## Table des matières

1. [Architecture CSS](#1-architecture-css)
2. [Système de variables](#2-système-de-variables)
3. [Conventions de nommage](#3-conventions-de-nommage)
4. [Imports et alias](#4-imports-et-alias)
5. [Composants UI standardisés](#5-composants-ui-standardisés)
6. [Responsive design](#6-responsive-design)
7. [Performance](#7-performance)
8. [Outils et scripts](#8-outils-et-scripts)
9. [Checklist de qualité](#9-checklist-de-qualité)

## 1. Architecture CSS

### 1.1 Structure des fichiers

L'architecture CSS de TourCraft suit une structure modulaire et hiérarchique :

```
src/
├── styles/
│   ├── base/
│   │   ├── colors.css       # Variables de couleurs
│   │   ├── index.css        # Point d'entrée base
│   │   ├── reset.css        # Reset CSS global
│   │   ├── typography.css   # Typographie et texte
│   │   └── variables.css    # Variables globales
│   ├── components/
│   │   ├── buttons.css      # Styles des boutons
│   │   ├── cards.css        # Styles des cartes
│   │   ├── forms.css        # Styles des formulaires
│   │   └── ...
│   ├── pages/
│   │   ├── artistes.css     # Styles spécifiques aux pages
│   │   ├── concerts.css
│   │   └── ...
│   ├── mixins/
│   │   └── breakpoints.css  # Mixins pour media queries
│   └── index.css            # Point d'entrée principal
├── components/
│   ├── ui/                  # Composants UI réutilisables
│   │   ├── Button/
│   │   │   ├── Button.js
│   │   │   └── Button.module.css
│   │   └── ...
│   └── [feature]/           # Composants métier
│       ├── desktop/
│       │   └── Component.module.css
│       └── mobile/
│           └── Component.module.css
```

### 1.2 Approches de styling

TourCraft utilise deux approches complémentaires :

1. **CSS Modules** : Pour les styles spécifiques aux composants
   - Isolation automatique des styles
   - Nommage local des classes
   - Fichiers `.module.css` associés à chaque composant

2. **Styles globaux** : Pour les fondations et les utilitaires
   - Variables CSS globales
   - Classes utilitaires réutilisables
   - Importés via `src/styles/index.css`

### 1.3 Priorité des styles

L'ordre de priorité des styles est le suivant (du plus prioritaire au moins prioritaire) :

1. Styles inline (à éviter)
2. CSS Modules
3. Styles globaux
4. Styles par défaut du navigateur

## 2. Système de variables

### 2.1 Préfixe standardisé

Toutes les variables CSS doivent utiliser le préfixe `--tc-` (TourCraft) :

```css
/* ✅ Correct */
:root {
  --tc-primary-color: #3498db;
}

/* ❌ Incorrect */
:root {
  --primary-color: #3498db;
}
```

### 2.2 Catégories de variables

Les variables sont organisées par catégories :

#### Couleurs

```css
/* Couleurs primaires */
--tc-color-primary: #3498db;
--tc-color-secondary: #2c3e50;
--tc-color-success: #2ecc71;
--tc-color-warning: #f39c12;
--tc-color-danger: #e74c3c;
--tc-color-info: #3498db;

/* Couleurs de texte */
--tc-text-color-primary: #212529;
--tc-text-color-secondary: #6c757d;
--tc-text-color-muted: #95a5a6;

/* Couleurs de fond */
--tc-bg-color: #f5f7fa;
--tc-bg-color-light: #ffffff;
--tc-bg-color-dark: #e9ecef;
```

#### Typographie

```css
/* Tailles de police */
--tc-font-size-xs: 0.75rem;
--tc-font-size-sm: 0.875rem;
--tc-font-size-md: 1rem;
--tc-font-size-lg: 1.25rem;
--tc-font-size-xl: 1.5rem;
--tc-font-size-2xl: 2rem;

/* Poids de police */
--tc-font-weight-light: 300;
--tc-font-weight-regular: 400;
--tc-font-weight-medium: 500;
--tc-font-weight-semibold: 600;
--tc-font-weight-bold: 700;

/* Hauteurs de ligne */
--tc-line-height-tight: 1.25;
--tc-line-height-normal: 1.5;
--tc-line-height-loose: 1.75;
```

#### Espacement

```css
/* Espacements */
--tc-spacing-xs: 0.25rem;
--tc-spacing-sm: 0.5rem;
--tc-spacing-md: 1rem;
--tc-spacing-lg: 1.5rem;
--tc-spacing-xl: 2rem;
--tc-spacing-2xl: 3rem;
```

#### Bordures et ombres

```css
/* Bordures */
--tc-border-width: 1px;
--tc-border-width-thick: 2px;
--tc-border-color: #dee2e6;
--tc-border-radius-sm: 0.25rem;
--tc-border-radius: 0.375rem;
--tc-border-radius-lg: 0.5rem;
--tc-border-radius-pill: 50rem;

/* Ombres */
--tc-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--tc-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--tc-shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
```

### 2.3 Utilisation des variables

Toujours utiliser les variables CSS sans fallbacks codés en dur :

```css
/* ✅ Correct */
.button {
  color: var(--tc-text-color-primary);
  background-color: var(--tc-color-primary);
  padding: var(--tc-spacing-sm) var(--tc-spacing-md);
}

/* ❌ Incorrect - Fallback codé en dur */
.button {
  color: var(--tc-text-color-primary, #212529);
  background-color: var(--tc-color-primary, #3498db);
  padding: var(--tc-spacing-sm, 0.5rem) var(--tc-spacing-md, 1rem);
}

/* ❌ Incorrect - Valeur codée en dur */
.button {
  color: #212529;
  background-color: #3498db;
  padding: 0.5rem 1rem;
}
```

## 3. Conventions de nommage

### 3.1 Classes CSS Modules

Pour les CSS Modules, utiliser la convention camelCase :

```css
/* ✅ Correct */
.buttonPrimary {
  /* styles */
}

.cardHeader {
  /* styles */
}

/* ❌ Incorrect */
.button-primary {
  /* styles */
}

.card_header {
  /* styles */
}
```

### 3.2 Classes globales

Pour les classes globales, utiliser le préfixe `tc-` suivi de kebab-case :

```css
/* ✅ Correct */
.tc-btn {
  /* styles */
}

.tc-card-header {
  /* styles */
}

/* ❌ Incorrect - Sans préfixe */
.btn {
  /* styles */
}

/* ❌ Incorrect - Mauvais format */
.tcBtn {
  /* styles */
}
```

### 3.3 États et variantes

Pour les états et variantes, utiliser des suffixes descriptifs :

```css
/* États */
.buttonPrimary.isActive {}
.buttonPrimary.isDisabled {}

/* Variantes */
.tc-btn-primary {}
.tc-btn-secondary {}
.tc-btn-outline {}
```

## 4. Imports et alias

### 4.1 Configuration des alias

TourCraft utilise des alias pour simplifier les imports. La configuration se trouve dans `jsconfig.json` :

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@styles/*": ["src/styles/*"],
      "@components/*": ["src/components/*"],
      "@ui/*": ["src/components/ui/*"]
    }
  }
}
```

### 4.2 Imports standardisés

Utiliser les alias pour tous les imports CSS :

```jsx
// ✅ Correct - Import de CSS Module
import styles from './Component.module.css';

// ✅ Correct - Import de styles globaux (uniquement au niveau App)
import '@styles/index.css';

// ✅ Correct - Import de composant UI
import Button from '@ui/Button';

// ❌ Incorrect - Chemin relatif complexe
import styles from '../../../styles/components/buttons.css';

// ❌ Incorrect - Import redondant de styles globaux
import '@styles/index.css'; // Ne pas importer dans les composants individuels
```

### 4.3 Règles d'import

1. **Styles globaux** : Importer uniquement dans `App.js` ou au niveau racine
2. **CSS Modules** : Importer dans chaque composant concerné
3. **Éviter les imports multiples** : Ne pas importer plusieurs fichiers CSS dans un même composant

## 5. Composants UI standardisés

### 5.1 Bibliothèque de composants

TourCraft dispose d'une bibliothèque de composants UI standardisés dans `src/components/ui/` :

- `Button` : Boutons d'action
- `Card` : Conteneurs de contenu
- `Badge` : Étiquettes et badges
- `Form` : Éléments de formulaire
- etc.

### 5.2 Utilisation des composants UI

Toujours privilégier les composants UI standardisés :

```jsx
// ✅ Correct
import Button from '@ui/Button';

function Component() {
  return (
    <Button variant="primary" onClick={handleClick}>
      Valider
    </Button>
  );
}

// ❌ Incorrect - Utilisation directe de classes Bootstrap
function Component() {
  return (
    <button className="btn btn-primary" onClick={handleClick}>
      Valider
    </button>
  );
}
```

### 5.3 Extension des composants

Pour étendre un composant UI avec des styles spécifiques :

```jsx
import Button from '@ui/Button';
import styles from './CustomPage.module.css';

function CustomPage() {
  return (
    <Button 
      variant="primary" 
      className={styles.customButton}
      onClick={handleClick}
    >
      Action spécifique
    </Button>
  );
}
```

## 6. Responsive design

### 6.1 Approche mobile-first

TourCraft suit une approche mobile-first :

```css
/* Styles de base (mobile) */
.container {
  padding: var(--tc-spacing-sm);
}

/* Styles pour tablettes et au-delà */
@media (min-width: 768px) {
  .container {
    padding: var(--tc-spacing-md);
  }
}

/* Styles pour desktop */
@media (min-width: 1024px) {
  .container {
    padding: var(--tc-spacing-lg);
  }
}
```

### 6.2 Points de rupture standardisés

Utiliser les points de rupture standardisés :

```css
/* Variables de points de rupture */
:root {
  --tc-breakpoint-sm: 576px;
  --tc-breakpoint-md: 768px;
  --tc-breakpoint-lg: 992px;
  --tc-breakpoint-xl: 1200px;
  --tc-breakpoint-2xl: 1400px;
}
```

### 6.3 Composants responsives vs. versions distinctes

Privilégier les composants responsives avec media queries plutôt que des versions distinctes :

```jsx
// ✅ Recommandé - Composant responsive unique
import styles from './Component.module.css';

function Component() {
  return <div className={styles.container}>...</div>;
}

// styles.module.css utilise des media queries
```

Si nécessaire, utiliser le hook `useResponsive` pour les cas complexes :

```jsx
// Pour les cas complexes uniquement
import { useResponsive } from '@hooks/useResponsive';

function ResponsiveComponent() {
  const { isMobile } = useResponsive();
  
  return isMobile ? <MobileView /> : <DesktopView />;
}
```

## 7. Performance

### 7.1 Optimisation du chargement CSS

Pour optimiser les performances, séparer les styles critiques des styles non-critiques :

```html
<head>
  <!-- Styles critiques inlinés pour un rendu immédiat -->
  <style id="critical-css">
    /* Variables CSS essentielles et styles de layout */
    :root { --tc-primary-color: #3498db; /* ... */ }
    body { font-family: sans-serif; margin: 0; }
  </style>
  
  <!-- Autres styles chargés de manière asynchrone -->
  <link rel="preload" href="/static/css/main.css" as="style">
  <link rel="stylesheet" href="/static/css/main.css">
</head>
```

### 7.2 Optimisation des imports

Éviter les imports CSS redondants qui augmentent la taille du bundle :

```jsx
// ✅ Correct - Import unique au niveau App
// App.js
import '@styles/index.css';

// ❌ Incorrect - Imports redondants dans chaque composant
// Component.js
import '@styles/index.css'; // Redondant
```

### 7.3 Minimisation des styles inline

Éviter les styles inline qui contournent l'optimisation CSS :

```jsx
// ✅ Correct - Utilisation de CSS Modules
import styles from './Component.module.css';

function Component() {
  return <div className={styles.container}>...</div>;
}

// ❌ Incorrect - Styles inline
function Component() {
  return (
    <div style={{ 
      padding: '1rem', 
      backgroundColor: '#f5f7fa' 
    }}>
      ...
    </div>
  );
}
```

## 8. Outils et scripts

### 8.1 Scripts d'audit

TourCraft dispose de scripts d'audit pour vérifier la conformité CSS :

```bash
# Vérifier l'utilisation des variables CSS
npm run audit:css

# Vérifier l'utilisation directe des classes Bootstrap
npm run audit:bootstrap
```

### 8.2 Scripts de correction

Des scripts de correction sont disponibles pour standardiser le CSS :

```bash
# Supprimer les fallbacks codés en dur
./fix_css_var_fallbacks.sh

# Corriger les fallbacks en cascade
./fix_css_cascade_fallbacks.sh

# Corriger les problèmes de parenthèses manquantes
./fix_css_missing_parenthesis.sh

# Corriger les espaces inconsistants
./fix_css_inconsistent_spaces.sh
```

### 8.3 Linter CSS

Un linter CSS personnalisé est configuré pour détecter les problèmes :

```bash
# Lancer le linter CSS
npm run lint:css
```

## 9. Checklist de qualité

Avant de soumettre du code CSS, vérifier les points suivants :

### 9.1 Variables et valeurs

- [ ] Toutes les couleurs utilisent des variables `--tc-color-*`
- [ ] Tous les espacements utilisent des variables `--tc-spacing-*`
- [ ] Toutes les tailles de police utilisent des variables `--tc-font-size-*`
- [ ] Aucun fallback codé en dur n'est présent

### 9.2 Structure et organisation

- [ ] Les styles spécifiques aux composants sont dans des fichiers `.module.css`
- [ ] Les imports CSS utilisent les alias configurés
- [ ] Pas d'imports redondants de styles globaux
- [ ] Les classes suivent les conventions de nommage

### 9.3 Composants et responsive

- [ ] Les composants UI standardisés sont utilisés quand disponibles
- [ ] L'approche mobile-first est respectée
- [ ] Les media queries utilisent les points de rupture standardisés
- [ ] Les styles sont cohérents entre desktop et mobile

### 9.4 Performance

- [ ] Les styles critiques sont identifiés
- [ ] Pas de styles inline inutiles
- [ ] Les sélecteurs CSS sont optimisés (pas trop spécifiques)
- [ ] Les animations sont optimisées pour les performances

## Conclusion

Ce guide CSS établit un cadre cohérent pour le développement front-end de TourCraft. En suivant ces standards et bonnes pratiques, nous garantissons une interface utilisateur cohérente, maintenable et performante.

Pour toute question ou suggestion d'amélioration, contacter l'équipe front-end.

---

*Dernière mise à jour : 20 mai 2025*
