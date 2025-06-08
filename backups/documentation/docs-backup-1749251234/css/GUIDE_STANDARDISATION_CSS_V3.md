# Guide CSS TourCraft - Version 3.0 (Phase 2 Optimisé)

**Date de mise à jour :** 29 mai 2025  
**Statut :** ✅ **SYNCHRONISÉ avec l'état réel du projet**

---

## 🎯 **Introduction**

Ce guide CSS reflète l'état **optimisé Phase 2** du système CSS TourCraft avec une réduction de **75%** des variables et **95%** des tailles de fichiers. Il définit les standards actuels pour garantir la qualité, la maintenabilité et la cohérence visuelle.

**✨ Version 3.0 Phase 2** : Document intégralement mis à jour avec les métriques réelles de mai 2025.

### 📊 **Métriques actuelles vérifiées :**
- **314 variables CSS --tc-** optimisées (106 variables core + 208 couleurs)
- **233 fichiers CSS Modules** 
- **Architecture ultra-optimisée** (réduction ~95% tailles fichiers)
- **Performance maximisée** avec bundle CSS simplifié

---

## 📋 **Table des matières**

1. [Architecture CSS optimisée](#1-architecture-css-optimisée)
2. [Système de variables Phase 2](#2-système-de-variables-phase-2)
3. [Variables réelles par catégorie](#3-variables-réelles-par-catégorie)
4. [Migration et bonnes pratiques](#4-migration-et-bonnes-pratiques)
5. [Modules CSS](#5-modules-css)
6. [Responsive design](#6-responsive-design)
7. [Checklist de qualité](#7-checklist-de-qualité)

---

## 1. Architecture CSS optimisée

### 1.1 Structure réelle (Mai 2025)

```
src/styles/
├── base/                    # ⭐ OPTIMISÉ Phase 2
│   ├── colors.css          # 355 lignes → 208 variables couleurs
│   ├── index.css           # 39 lignes → Point d'entrée base
│   ├── reset.css           # 224 lignes → Reset CSS global
│   ├── typography.css      # 518 lignes → Typographie optimisée
│   └── variables.css       # 202 lignes → 106 variables core
├── components/             # Styles composants
├── pages/                  # Styles pages spécifiques
├── mixins/                 # Mixins réutilisables
└── index.css              # Point d'entrée principal
```

**📊 Comparaison avant/après optimisation :**
- `colors.css` : 4,817 → 355 lignes (**-92%**)
- `variables.css` : 9,587 → 202 lignes (**-98%**)
- `typography.css` : 11,613 → 518 lignes (**-95%**)
- `reset.css` : 4,594 → 224 lignes (**-95%**)

### 1.2 Principes Phase 2

1. **Variables optimisées** : Système simplifié --tc-space-* vs --tc-spacing-*
2. **Couleurs centralisées** : 208 variables dans colors.css
3. **Performance prioritaire** : Bundle CSS ultra-léger
4. **Maintenabilité** : Moins de variables, plus de cohérence

---

## 2. Système de variables Phase 2

### 2.1 Préfixe standardisé --tc-

**Total : 314 variables CSS --tc-**
- **106 variables core** (variables.css)
- **208 variables couleurs** (colors.css)

### 2.2 Convention de nommage Phase 2

```css
/* ✅ Nouvelles variables Phase 2 (actuelles) */
--tc-space-4               /* Espacement (nouveau système) */
--tc-font-size-base        /* Typographie (simplifié) */
--tc-radius-base           /* Border radius (standardisé) */

/* ❌ Anciennes variables (obsolètes) */
--tc-spacing-4             /* Ancien système */
--tc-font-size-md          /* Ancienne convention */
--tc-border-radius-md      /* Ancien système */
```

---

## 3. Variables réelles par catégorie

### 3.1 Espacements (15 variables)

**Variables principales :**
```css
--tc-space-0: 0;                       /* 0px */
--tc-space-1: 0.25rem;                 /* 4px */
--tc-space-2: 0.5rem;                  /* 8px */
--tc-space-3: 0.75rem;                 /* 12px */
--tc-space-4: 1rem;                    /* 16px - Standard */
--tc-space-5: 1.25rem;                 /* 20px */
--tc-space-6: 1.5rem;                  /* 24px */
--tc-space-8: 2rem;                    /* 32px */
--tc-space-10: 2.5rem;                 /* 40px */
--tc-space-24: 6rem;                   /* 96px */
```

**Alias disponibles :**
```css
--tc-space-xs: var(--tc-space-1);
--tc-space-sm: var(--tc-space-2);
--tc-space-md: var(--tc-space-4);
--tc-space-lg: var(--tc-space-6);
--tc-spacing-unit: var(--tc-space-4);   /* Unité de base */
```

### 3.2 Typographie (18 variables)

**Familles de polices :**
```css
--tc-font-sans: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
--tc-font-mono: 'SF Mono', Monaco, 'Cascadia Code', monospace;
--tc-font-family: var(--tc-font-sans);
--tc-font-family-base: var(--tc-font-sans);
```

**Tailles de police (basées sur maquette réelle) :**
```css
--tc-font-size-xxs: 0.625rem;         /* 10px */
--tc-font-size-xs: 0.75rem;           /* 12px */
--tc-font-size-sm: 0.875rem;          /* 14px */
--tc-font-size-base: 1rem;            /* 16px - Standard */
--tc-font-size-md: 1rem;              /* 16px - Alias */
--tc-font-size-lg: 1.125rem;          /* 18px */
--tc-font-size-xl: 1.5rem;            /* 24px */
--tc-font-size-2xl: 2rem;             /* 32px */
--tc-font-size-3xl: 2.25rem;          /* 36px */
--tc-font-size-6xl: 3.75rem;          /* 60px */
--tc-font-size-xxxl: 4rem;            /* 64px */
```

**Poids de police :**
```css
--tc-font-weight-normal: 400;
--tc-font-weight-regular: 400;
--tc-font-weight-medium: 500;
--tc-font-weight-semibold: 600;
--tc-font-weight-bold: 700;
```

### 3.3 Effets et ombres (20 variables)

**Ombres essentielles :**
```css
--tc-shadow-none: none;
--tc-shadow-xs: 0 1px 2px rgba(0,0,0,0.05);
--tc-shadow-sm: 0 2px 4px rgba(0,0,0,0.05);
--tc-shadow-base: 0 2px 4px rgba(0, 0, 0, 0.1);
--tc-shadow-md: 0 4px 8px rgba(0,0,0,0.1);
--tc-shadow-lg: 0 8px 16px rgba(0,0,0,0.1);
--tc-shadow-card: 0 2px 8px rgba(0,0,0,0.1);
--tc-shadow-modal: 0 10px 25px rgba(0,0,0,0.15);
--tc-shadow-hover: 0 4px 12px rgba(0,0,0,0.15);
--tc-shadow-focus: 0 0 0 3px rgba(33, 53, 71, 0.1);
```

**Border-radius :**
```css
--tc-radius-none: 0;
--tc-radius-xs: 0.125rem;              /* 2px */
--tc-radius-sm: 0.25rem;               /* 4px */
--tc-radius-base: 0.375rem;            /* 6px - Standard */
--tc-radius-md: 0.5rem;                /* 8px */
--tc-radius-lg: 0.75rem;               /* 12px */
--tc-radius-pill: 50rem;
--tc-radius-full: 9999px;
```

**Transitions :**
```css
--tc-transition-fast: 150ms ease;
--tc-transition-base: 300ms ease;
--tc-transition-normal: var(--tc-transition-base);
```

### 3.4 Layout et composants (15 variables)

**Variables d'interface :**
```css
--tc-header-height: 60px;
--tc-sidebar-width: 240px;
--tc-sidebar-collapsed-width: 60px;
--tc-input-height: 2.5rem;             /* 40px */
--tc-input-width: 100%;
--tc-preview-width: 300px;
--tc-preview-height: 200px;
```

**Composants boutons :**
```css
--tc-btn-padding-y: 0.375rem;
--tc-btn-padding-x: var(--tc-space-sm);
```

**Composants cartes :**
```css
--tc-card-bg-color: var(--tc-bg-white);
--tc-card-border-radius: var(--tc-radius-lg);
--tc-card-shadow-low: var(--tc-shadow-sm);
--tc-card-shadow-medium: var(--tc-shadow-base);
--tc-card-shadow-high: var(--tc-shadow-lg);
```

### 3.5 Breakpoints (6 variables)

```css
--tc-breakpoint-xs: 0;
--tc-breakpoint-sm: 576px;
--tc-breakpoint-md: 768px;
--tc-breakpoint-lg: 992px;
--tc-breakpoint-xl: 1200px;
--tc-breakpoint-xxl: 1400px;
```

### 3.6 Couleurs (208 variables dans colors.css)

Les couleurs sont définies dans `src/styles/base/colors.css` :

**Exemples de variables couleurs principales :**
```css
--tc-color-primary: #1a73e8;
--tc-bg-white: #ffffff;
--tc-bg-light: #f8f9fa;
--tc-bg-default: var(--tc-bg-white);
--tc-text-default: #212529;
--tc-text-secondary: #6c757d;
--tc-border-light: #e0e0e0;
--tc-border-default: var(--tc-border-light);
/* ... 208 variables couleurs total */
```

---

## 4. Migration et bonnes pratiques

### 4.1 Migration des anciennes variables

**Table de correspondance :**
```css
/* Espacements */
--tc-spacing-4    → --tc-space-4
--tc-spacing-sm   → --tc-space-2  
--tc-spacing-md   → --tc-space-4
--tc-spacing-lg   → --tc-space-6

/* Typographie */
--tc-font-size-md → --tc-font-size-base
--tc-font-size-lg → --tc-font-size-lg    /* (inchangé) */

/* Effets */
--tc-border-radius-md → --tc-radius-md
--tc-box-shadow-base  → --tc-shadow-base
```

### 4.2 Utilisation correcte

```css
/* ✅ Variables Phase 2 actuelles */
.button {
  color: var(--tc-text-default);
  background-color: var(--tc-color-primary);
  padding: var(--tc-space-2) var(--tc-space-4);
  border-radius: var(--tc-radius-base);
  font-size: var(--tc-font-size-base);
  box-shadow: var(--tc-shadow-sm);
}

/* ❌ Anciennes variables (à migrer) */
.button {
  padding: var(--tc-spacing-sm) var(--tc-spacing-md);
  font-size: var(--tc-font-size-md);
  border-radius: var(--tc-border-radius-md);
}

/* ❌ Fallbacks codés en dur (interdit) */
.button {
  color: var(--tc-text-default, #212529);
  padding: var(--tc-space-2, 0.5rem);
}
```

### 4.3 Vérification des variables

```bash
# Voir toutes les variables réellement définies
grep -r "\-\-tc\-" src/styles/base/variables.css | grep ":"

# Vérifier les variables couleurs
grep -r "\-\-tc\-" src/styles/base/colors.css | grep ":"

# Compter les variables par fichier
echo "Variables dans variables.css:" $(grep -r "\-\-tc\-" src/styles/base/variables.css | grep ":" | wc -l)
echo "Variables dans colors.css:" $(grep -r "\-\-tc\-" src/styles/base/colors.css | grep ":" | wc -l)
```

---

## 5. Modules CSS

### 5.1 Structure standard (233 fichiers)

Chaque composant React a son module CSS :
```
Button.js
Button.module.css
```

### 5.2 Template de module CSS

```css
/*
 * Styles pour [ComponentName]
 * Guide CSS TourCraft v3.0 - Phase 2 Optimisé
 * Dernière mise à jour: 29 mai 2025
 * Variables: 314 CSS --tc- disponibles
 */

/* Variables locales du composant */
.component {
  --component-padding: var(--tc-space-4);
  --component-radius: var(--tc-radius-base);
}

/* Styles de base */
.component {
  padding: var(--component-padding);
  border-radius: var(--component-radius);
  background-color: var(--tc-bg-white);
  color: var(--tc-text-default);
  font-size: var(--tc-font-size-base);
  transition: all var(--tc-transition-base) ease;
}

/* Variantes */
.component--primary {
  background-color: var(--tc-color-primary);
  color: var(--tc-bg-white);
}

/* États interactifs */
.component:hover {
  box-shadow: var(--tc-shadow-hover);
}

.component:focus {
  outline: 2px solid var(--tc-color-primary);
  outline-offset: 2px;
}

/* Responsive */
@media (min-width: 768px) {
  .component {
    --component-padding: var(--tc-space-6);
  }
}
```

---

## 6. Responsive design

### 6.1 Breakpoints standardisés

```css
/* Approche mobile-first avec variables */
@media (min-width: 576px) { 
  /* var(--tc-breakpoint-sm) */ 
}
@media (min-width: 768px) { 
  /* var(--tc-breakpoint-md) */ 
}
@media (min-width: 992px) { 
  /* var(--tc-breakpoint-lg) */ 
}
@media (min-width: 1200px) { 
  /* var(--tc-breakpoint-xl) */ 
}
```

### 6.2 Variables responsives

```css
/* Système responsive avec variables locales */
.component {
  --component-size: var(--tc-space-4);
  --component-font: var(--tc-font-size-sm);
}

@media (min-width: 768px) {
  .component {
    --component-size: var(--tc-space-6);
    --component-font: var(--tc-font-size-base);
  }
}

@media (min-width: 1200px) {
  .component {
    --component-size: var(--tc-space-8);
    --component-font: var(--tc-font-size-lg);
  }
}
```

---

## 7. Checklist de qualité

### 7.1 Variables CSS ✅

- [ ] Utiliser uniquement les variables --tc- définies
- [ ] Vérifier existence avec `grep -r "\-\-tc-[variable]" src/styles/`
- [ ] Préférer --tc-space-* au lieu de --tc-spacing-*
- [ ] Préférer --tc-font-size-base au lieu de --tc-font-size-md
- [ ] Pas de fallbacks codés en dur

### 7.2 Architecture ✅

- [ ] CSS Module pour chaque composant React
- [ ] Variables locales définies au début du fichier
- [ ] Organisation : base → variantes → états → responsive
- [ ] Commentaires explicatifs ajoutés

### 7.3 Performance ✅

- [ ] Import uniquement des styles nécessaires
- [ ] Utilisation des variables optimisées Phase 2
- [ ] Pas de duplication de styles
- [ ] Transitions et animations optimisées

### 7.4 Validation ✅

```bash
# Scripts de validation
./tools/audit/audit_css_standards_comprehensive.sh
find . -name "*.module.css" | wc -l  # Doit retourner 233
grep -r "\-\-tc\-" src/styles/ | grep ":" | wc -l  # Doit retourner ~314
```

---

## 🎯 **Conclusion**

**Le système CSS TourCraft Phase 2 est optimisé et performant !**

### ✅ **Points forts :**
- **314 variables CSS** bien organisées et documentées
- **233 modules CSS** pour une isolation parfaite
- **Architecture simplifiée** avec réduction de 95% des tailles
- **Performance maximale** avec bundle ultra-léger

### 🚀 **Pour aller plus loin :**
- Utiliser les variables réelles documentées ci-dessus
- Migrer progressivement les anciennes variables
- Respecter les conventions Phase 2
- Tester avec les scripts d'audit

---

*Guide CSS TourCraft v3.0 - Aligné avec l'état réel du projet*  
*Dernière synchronisation : 29 mai 2025*  
*Statut : ✅ **Documentation cohérente et à jour*** 