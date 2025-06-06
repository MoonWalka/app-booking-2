# Guide CSS TourCraft - Version 2.0 (Consolidé)

## Introduction

Ce guide CSS définit les standards, conventions et bonnes pratiques pour le développement front-end de l'application TourCraft. Il intègre les améliorations issues de notre récent audit CSS et établit un cadre cohérent pour garantir la qualité, la maintenabilité et la cohérence visuelle de notre interface utilisateur.

**✨ Version consolidée** : Ce document intègre tous les standards CSS TourCraft en un guide de référence unique.

## Table des matières

1. [Principes fondamentaux](#1-principes-fondamentaux)
2. [Architecture CSS](#2-architecture-css)
3. [Système de variables](#3-système-de-variables)
4. [Conventions de nommage](#4-conventions-de-nommage)
5. [Modules CSS](#5-modules-css)
6. [Imports et alias](#6-imports-et-alias)
7. [Composants UI standardisés](#7-composants-ui-standardisés)
8. [Responsive design](#8-responsive-design)
9. [Performance](#9-performance)
10. [Outils et scripts](#10-outils-et-scripts)
11. [Checklist de qualité](#11-checklist-de-qualité)

## 1. Principes fondamentaux

### 1.1 Principes de base

1. **Utiliser des modules CSS** pour encapsuler les styles des composants
2. **Favoriser les variables CSS** pour toutes les valeurs réutilisables
3. **Suivre une convention de nommage cohérente**
4. **Concevoir de façon responsive dès le départ**
5. **Documenter les choix de style complexes**
6. **Éviter les styles inline** en production
7. **Privilégier la réutilisabilité** et la maintenabilité

### 1.2 Formatage du code CSS

- Utiliser **Prettier** avec la configuration du projet
- Indentation de 2 espaces
- Pas d'espaces de fin de ligne
- Utiliser des points-virgules à la fin des déclarations
- Une déclaration par ligne
- Espaces autour des deux-points dans les déclarations

## 2. Architecture CSS

### 2.1 Structure des fichiers

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

### 2.2 Approches de styling

TourCraft utilise deux approches complémentaires :

1. **CSS Modules** : Pour les styles spécifiques aux composants
   - Isolation automatique des styles
   - Nommage local des classes
   - Fichiers `.module.css` associés à chaque composant

2. **Styles globaux** : Pour les fondations et les utilitaires
   - Variables CSS globales
   - Classes utilitaires réutilisables
   - Importés via `src/styles/index.css`

### 2.3 Priorité des styles

L'ordre de priorité des styles est le suivant (du plus prioritaire au moins prioritaire) :

1. Styles inline (à éviter)
2. CSS Modules
3. Styles globaux
4. Styles par défaut du navigateur

## 3. Système de variables

### 3.1 Préfixe standardisé

Toutes les variables CSS doivent utiliser le préfixe `--tc-` (TourCraft) :

```css
/* ✅ Correct */
:root {
  --tc-primary-color: #3498db;
  --tc-spacing-4: 16px;
}

/* ❌ Incorrect */
:root {
  --primary-color: #3498db;        /* Manque le préfixe tc */
  --bs-primary: #3498db;           /* Préfixe non-standard */
  --tc-bs-spacing-4: 16px;         /* Double préfixe */
}
```

### 3.2 Catégories de variables

#### Couleurs principales

```css
/* Couleurs primaires */
--tc-color-primary: #1a73e8;
--tc-color-primary-light: rgba(26, 115, 232, 0.1);
--tc-color-primary-dark: #0d47a1;

/* Couleurs secondaires */
--tc-color-secondary: #5f6368;
--tc-color-secondary-light: #e8eaed;
--tc-color-secondary-dark: #3c4043;

/* Couleurs fonctionnelles */
--tc-color-success: #34a853;
--tc-color-warning: #fbbc04;
--tc-color-error: #ea4335;
--tc-color-info: #4285f4;

/* Couleurs de fond */
--tc-bg-default: #ffffff;
--tc-bg-light: #f8f9fa;
--tc-bg-dark: #202124;

/* Couleurs de texte */
--tc-text-color-primary: #212529;
--tc-text-color-secondary: #6c757d;
--tc-text-color-muted: #95a5a6;
```

#### Typographie

```css
/* Tailles de police */
--tc-font-size-xs: 0.75rem;
--tc-font-size-sm: 0.875rem;
--tc-font-size-md: 1rem;
--tc-font-size-lg: 1.125rem;
--tc-font-size-xl: 1.25rem;
--tc-font-size-2xl: 1.5rem;

/* Poids de police */
--tc-font-weight-light: 300;
--tc-font-weight-regular: 400;
--tc-font-weight-medium: 500;
--tc-font-weight-semibold: 600;
--tc-font-weight-bold: 700;

/* Familles de polices */
--tc-font-family-primary: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, sans-serif;
--tc-font-family-secondary: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, sans-serif;

/* Hauteurs de ligne */
--tc-line-height-tight: 1.25;
--tc-line-height-normal: 1.5;
--tc-line-height-loose: 1.75;
```

#### Espacement

```css
/* Espacements */
--tc-spacing-0: 0;
--tc-spacing-1: 4px;
--tc-spacing-2: 8px;
--tc-spacing-3: 12px;
--tc-spacing-4: 16px;
--tc-spacing-5: 20px;
--tc-spacing-6: 24px;
--tc-spacing-8: 32px;
--tc-spacing-10: 40px;
--tc-spacing-12: 48px;
--tc-spacing-16: 64px;
--tc-spacing-20: 80px;
--tc-spacing-24: 96px;

/* Espacements alternatifs */
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
--tc-border-light: #e0e0e0;
--tc-border-medium: #bdbdbd;
--tc-border-dark: #757575;

/* Rayons des bordures */
--tc-border-radius-sm: 0.25rem;
--tc-border-radius: 0.375rem;
--tc-border-radius-md: 4px;
--tc-border-radius-lg: 0.5rem;
--tc-border-radius-xl: 12px;
--tc-border-radius-pill: 50rem;

/* Ombres */
--tc-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--tc-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--tc-shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
--tc-shadow-xl: 0 8px 16px rgba(0, 0, 0, 0.1);
```

#### Transitions et animations

```css
/* Transitions */
--tc-transition-fast: 0.15s ease;
--tc-transition-normal: 0.3s ease;
--tc-transition-slow: 0.5s ease;
--tc-transition-timing: cubic-bezier(0.4, 0, 0.2, 1);

/* Z-index */
--tc-z-index-dropdown: 1000;
--tc-z-index-navbar: 1020;
--tc-z-index-modal: 1050;
--tc-z-index-tooltip: 1070;
```

### 3.3 Utilisation des variables

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

## 4. Conventions de nommage

### 4.1 Nommage des classes CSS

Le projet utilise une convention de nommage BEM modifiée:

- **Bloc** : Le composant principal (ex: `concert-card`)
- **Élément** : Une partie du composant (ex: `concert-card__title`)
- **Modificateur** : Une variation (ex: `concert-card--featured`)

### 4.2 Fichiers et modules

- **Composants React** : PascalCase (ex: `UserProfile.js`)
- **Modules CSS** : Nom du composant suffixé par ".module.css" (ex: `UserProfile.module.css`)
- **Styles globaux** : kebab-case (ex: `global-styles.css`)

## 5. Modules CSS

### 5.1 Structure des fichiers

Chaque composant React doit avoir son propre module CSS avec le même nom:

```
Button.js
Button.module.css
```

### 5.2 Organisation interne des fichiers CSS

Organiser le contenu des fichiers CSS selon cet ordre:

1. Variables locales spécifiques au composant
2. Styles de base du composant
3. Variantes du composant
4. États (hover, active, disabled)
5. Media queries pour le responsive

### 5.3 Exemple de structure avec commentaires

```css
/*
 * Styles pour Button
 * Standardisé selon le Guide CSS TourCraft
 * Dernière mise à jour: 25 mai 2025
 */

/* Variables locales */
.button {
  --button-height: 36px;
  --button-horizontal-padding: var(--tc-spacing-4);
}

/* Styles de base */
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: var(--button-height);
  padding: 0 var(--button-horizontal-padding);
  font-size: var(--tc-font-size-sm);
  font-weight: var(--tc-font-weight-medium);
  border-radius: var(--tc-border-radius-md);
  transition: background-color var(--tc-transition-fast) var(--tc-transition-timing);
}

/* Variantes */
.button--primary {
  background-color: var(--tc-color-primary);
  color: var(--tc-bg-default);
}

.button--secondary {
  background-color: var(--tc-color-secondary);
  color: var(--tc-bg-default);
}

/* États */
.button:hover {
  opacity: 0.9;
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Media queries */
@media (min-width: 768px) {
  .button {
    --button-height: 40px;
    --button-horizontal-padding: var(--tc-spacing-6);
  }
}
```

## 6. Imports et alias

### 6.1 Imports CSS

```javascript
// ✅ Correct - Import de module CSS
import styles from './Button.module.css';

// ✅ Correct - Import de styles globaux
import './global-styles.css';

// ❌ Incorrect - Import sans extension
import styles from './Button.module';
```

### 6.2 Utilisation des classes

```javascript
// ✅ Correct - Utilisation des classes CSS Modules
<button className={styles.button}>
  Cliquer ici
</button>

// ✅ Correct - Combinaison de classes
<button className={`${styles.button} ${styles['button--primary']}`}>
  Bouton primaire
</button>

// ✅ Correct - Avec clsx pour la lisibilité
import clsx from 'clsx';

<button className={clsx(styles.button, {
  [styles['button--primary']]: isPrimary,
  [styles['button--disabled']]: isDisabled
})}>
  Bouton conditionnel
</button>
```

## 7. Composants UI standardisés

### 7.1 Composants de base

Les composants suivants doivent utiliser les standards CSS TourCraft :

- **Button** : Boutons avec variantes (primary, secondary, danger)
- **Card** : Cartes avec ombres et bordures standardisées
- **Form** : Champs de formulaire avec validation visuelle
- **Modal** : Modales avec overlay et animations
- **Tooltip** : Info-bulles avec positionnement intelligent

### 7.2 Exemple de composant standardisé

```css
/* Card.module.css */
.card {
  background-color: var(--tc-bg-default);
  border-radius: var(--tc-border-radius-lg);
  box-shadow: var(--tc-shadow-md);
  padding: var(--tc-spacing-6);
  transition: box-shadow var(--tc-transition-normal);
}

.card:hover {
  box-shadow: var(--tc-shadow-lg);
}

.card__header {
  margin-bottom: var(--tc-spacing-4);
  padding-bottom: var(--tc-spacing-3);
  border-bottom: 1px solid var(--tc-border-color);
}

.card__title {
  font-size: var(--tc-font-size-lg);
  font-weight: var(--tc-font-weight-semibold);
  color: var(--tc-text-color-primary);
  margin: 0;
}

.card__content {
  color: var(--tc-text-color-secondary);
  line-height: var(--tc-line-height-normal);
}
```

## 8. Responsive design

### 8.1 Points de rupture (media queries)

```css
/* Points de rupture - Approche mobile-first */
@media (min-width: 576px) { /* Petits appareils et plus */ }
@media (min-width: 768px) { /* Tablettes et plus */ }
@media (min-width: 992px) { /* Ordinateurs de bureau et plus */ }
@media (min-width: 1200px) { /* Grands écrans */ }
```

> ⚠️ **Important** : Nous suivons une approche mobile-first, donc utilisez `min-width` et non `max-width` pour les media queries. Les styles de base s'appliquent à tous les appareils, puis nous ajoutons des styles spécifiques pour les écrans plus grands.

### 8.2 Variables responsives

```css
/* Variables responsives avec Custom Properties */
.component {
  --component-padding: var(--tc-spacing-4);
  --component-font-size: var(--tc-font-size-sm);
}

@media (min-width: 768px) {
  .component {
    --component-padding: var(--tc-spacing-6);
    --component-font-size: var(--tc-font-size-md);
  }
}

@media (min-width: 992px) {
  .component {
    --component-padding: var(--tc-spacing-8);
    --component-font-size: var(--tc-font-size-lg);
  }
}
```

## 9. Performance

### 9.1 Optimisations CSS

- **Éviter les sélecteurs complexes** : Privilégier les classes simples
- **Minimiser les reflows** : Éviter les changements de layout fréquents
- **Utiliser transform et opacity** : Pour les animations performantes
- **Lazy loading des styles** : Charger les styles uniquement quand nécessaire

### 9.2 Bonnes pratiques

```css
/* ✅ Performant - Transform pour les animations */
.element {
  transform: translateX(0);
  transition: transform var(--tc-transition-normal);
}

.element--moved {
  transform: translateX(100px);
}

/* ❌ Non performant - Left pour les animations */
.element {
  left: 0;
  transition: left var(--tc-transition-normal);
}

.element--moved {
  left: 100px;
}
```

## 10. Outils et scripts

### 10.1 Scripts de migration

Le projet dispose de scripts automatisés pour la migration CSS :

- `refactor_css.py` : Migration automatique vers les variables CSS
- `prefix_css_vars.py` : Ajout automatique des préfixes --tc-
- `css_audit.py` : Audit des styles non conformes

### 10.2 Validation

```bash
# Audit CSS
npm run css:audit

# Validation des variables
npm run css:validate

# Formatage automatique
npm run css:format
```

## 11. Checklist de qualité

### 11.1 Avant de commiter

- [ ] Toutes les valeurs codées en dur sont remplacées par des variables CSS
- [ ] Les variables utilisent le préfixe `--tc-`
- [ ] Les styles sont organisés selon la structure recommandée
- [ ] Les media queries suivent l'approche mobile-first
- [ ] Les commentaires expliquent les choix complexes
- [ ] Le code est formaté avec Prettier
- [ ] Aucun style inline en production

### 11.2 Revue de code

- [ ] Les noms de classes suivent la convention BEM
- [ ] Les composants utilisent des CSS Modules
- [ ] Les styles sont réutilisables et maintenables
- [ ] Les performances sont optimisées
- [ ] La documentation est à jour

---

## Conclusion

Ce guide CSS consolidé établit les standards d'excellence pour TourCraft. En suivant ces conventions, nous garantissons :

- **Cohérence visuelle** dans toute l'application
- **Maintenabilité** du code CSS
- **Performance optimale** des styles
- **Facilité de développement** pour l'équipe
- **Évolutivité** de l'architecture CSS

Pour toute question ou suggestion d'amélioration, consultez l'équipe de développement front-end.

---

*Guide CSS TourCraft - Version 2.0 Consolidée*  
*Dernière mise à jour : 25 mai 2025*  
*Document de référence unique pour tous les standards CSS*
