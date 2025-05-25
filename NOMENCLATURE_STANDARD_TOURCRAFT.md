# 📐 NOMENCLATURE STANDARD CSS TOURCRAFT

**Date :** 21 Mai 2025  
**Version :** 1.0  
**Statut :** 🚧 En cours de définition

---

## 🎯 **OBJECTIF**

Définir une **nomenclature unique et cohérente** pour toutes les variables CSS TourCraft, basée sur l'audit du Jour 1 qui a révélé :
- **431 variables** utilisées
- **270 variables manquantes** 
- **31 doublons "primary"**
- **72 doublons "background"**

---

## 📋 **PRINCIPES DE NOMENCLATURE**

### **1. Préfixe obligatoire**
```css
--tc-[catégorie]-[propriété]-[variante]
```

### **2. Catégories principales**
- `color` : Couleurs de base
- `bg` : Arrière-plans
- `text` : Couleurs de texte
- `border` : Bordures
- `space` : Espacements
- `font` : Typographie
- `shadow` : Ombres
- `radius` : Border-radius
- `transition` : Transitions
- `z` : Z-index

### **3. Règles de nommage**
- **Kebab-case** obligatoire
- **Pas d'abréviation** ambiguë
- **Ordre logique** : général → spécifique
- **Cohérence** avec les standards CSS

---

## 🎨 **COULEURS (color, bg, text, border)**

### **Couleurs de base (--tc-color-*)**
```css
/* COULEURS PRINCIPALES */
--tc-color-primary: #1e3a5f;           /* Bleu foncé principal */
--tc-color-primary-light: #2d4b72;     /* Variante claire */
--tc-color-primary-dark: #132740;      /* Variante foncée */

--tc-color-secondary: #3498db;         /* Bleu clair secondaire */
--tc-color-secondary-light: #4aa3de;   /* Variante claire */
--tc-color-secondary-dark: #2980b9;    /* Variante foncée */

/* COULEURS SÉMANTIQUES */
--tc-color-success: #2ecc71;           /* Vert succès */
--tc-color-success-light: #40d47e;     /* Variante claire */
--tc-color-success-dark: #27ae60;      /* Variante foncée */

--tc-color-warning: #f39c12;           /* Orange avertissement */
--tc-color-warning-light: #f5ab35;     /* Variante claire */
--tc-color-warning-dark: #d68910;      /* Variante foncée */

--tc-color-danger: #e74c3c;            /* Rouge erreur */
--tc-color-danger-light: #eb6254;      /* Variante claire */
--tc-color-danger-dark: #c0392b;       /* Variante foncée */

--tc-color-info: #3498db;              /* Bleu information */
--tc-color-info-light: #4aa3de;        /* Variante claire */
--tc-color-info-dark: #2980b9;         /* Variante foncée */

/* COULEURS NEUTRES */
--tc-color-white: #ffffff;
--tc-color-black: #000000;
--tc-color-gray-50: #fafbfc;
--tc-color-gray-100: #f8f9fa;
--tc-color-gray-200: #e9ecef;
--tc-color-gray-300: #dee2e6;
--tc-color-gray-400: #ced4da;
--tc-color-gray-500: #adb5bd;
--tc-color-gray-600: #6c757d;
--tc-color-gray-700: #495057;
--tc-color-gray-800: #343a40;
--tc-color-gray-900: #212529;

/* COULEURS MÉTIER TOURCRAFT */
--tc-color-artiste: #6610f2;           /* Violet artistes */
--tc-color-artiste-light: #f0e6ff;     /* Variante claire */

--tc-color-concert: #5e72e4;           /* Bleu concerts */
--tc-color-concert-light: #eef0fd;     /* Variante claire */

--tc-color-programmateur: #6f42c1;     /* Violet programmateurs */
--tc-color-programmateur-light: #f0e6fa; /* Variante claire */
```

### **Arrière-plans (--tc-bg-*)**
```css
/* ARRIÈRE-PLANS DE BASE */
--tc-bg-default: #ffffff;              /* Fond par défaut */
--tc-bg-light: #f8f9fa;                /* Fond clair */
--tc-bg-dark: #343a40;                 /* Fond sombre */

/* ARRIÈRE-PLANS COMPOSANTS */
--tc-bg-card: #ffffff;                 /* Fond des cartes */
--tc-bg-modal: #ffffff;                /* Fond des modales */
--tc-bg-sidebar: var(--tc-color-primary); /* Fond sidebar */
--tc-bg-header: #ffffff;               /* Fond header */

/* ARRIÈRE-PLANS INTERACTIFS */
--tc-bg-hover: #f8f9fa;                /* Fond au survol */
--tc-bg-active: #e9ecef;               /* Fond actif */
--tc-bg-focus: rgba(52, 152, 219, 0.1); /* Fond focus */

/* ARRIÈRE-PLANS SÉMANTIQUES */
--tc-bg-success: rgba(46, 204, 113, 0.1);   /* Fond succès */
--tc-bg-warning: rgba(243, 156, 18, 0.1);   /* Fond avertissement */
--tc-bg-danger: rgba(231, 76, 60, 0.1);     /* Fond erreur */
--tc-bg-info: rgba(52, 152, 219, 0.1);      /* Fond information */

/* ARRIÈRE-PLANS OVERLAY */
--tc-bg-overlay: rgba(0, 0, 0, 0.5);    /* Overlay sombre */
--tc-bg-backdrop: rgba(0, 0, 0, 0.3);   /* Backdrop modal */
```

### **Couleurs de texte (--tc-text-*)**
```css
/* TEXTE DE BASE */
--tc-text-default: #212529;            /* Texte par défaut */
--tc-text-muted: #6c757d;              /* Texte atténué */
--tc-text-light: #ffffff;              /* Texte clair */
--tc-text-dark: #000000;               /* Texte foncé */

/* TEXTE SÉMANTIQUE */
--tc-text-primary: var(--tc-color-primary);     /* Texte primaire */
--tc-text-secondary: var(--tc-color-secondary); /* Texte secondaire */
--tc-text-success: var(--tc-color-success);     /* Texte succès */
--tc-text-warning: var(--tc-color-warning);     /* Texte avertissement */
--tc-text-danger: var(--tc-color-danger);       /* Texte erreur */
--tc-text-info: var(--tc-color-info);           /* Texte information */

/* TEXTE SPÉCIALISÉ */
--tc-text-link: var(--tc-color-primary);        /* Liens */
--tc-text-link-hover: var(--tc-color-primary-dark); /* Liens survol */
--tc-text-placeholder: #adb5bd;                 /* Placeholder */
```

### **Bordures (--tc-border-*)**
```css
/* COULEURS DE BORDURE */
--tc-border-default: #dee2e6;          /* Bordure par défaut */
--tc-border-light: #e9ecef;            /* Bordure claire */
--tc-border-dark: #adb5bd;             /* Bordure foncée */

/* BORDURES SÉMANTIQUES */
--tc-border-primary: var(--tc-color-primary);   /* Bordure primaire */
--tc-border-success: var(--tc-color-success);   /* Bordure succès */
--tc-border-warning: var(--tc-color-warning);   /* Bordure avertissement */
--tc-border-danger: var(--tc-color-danger);     /* Bordure erreur */
--tc-border-info: var(--tc-color-info);         /* Bordure information */

/* BORDURES INTERACTIVES */
--tc-border-focus: var(--tc-color-primary);     /* Bordure focus */
--tc-border-hover: var(--tc-color-primary-light); /* Bordure survol */
```

---

## 📏 **ESPACEMENTS (--tc-space-*)**

### **Échelle d'espacement**
```css
/* ÉCHELLE DE BASE (multiples de 4px) */
--tc-space-0: 0;                       /* 0px */
--tc-space-1: 0.25rem;                 /* 4px */
--tc-space-2: 0.5rem;                  /* 8px */
--tc-space-3: 0.75rem;                 /* 12px */
--tc-space-4: 1rem;                    /* 16px */
--tc-space-5: 1.25rem;                 /* 20px */
--tc-space-6: 1.5rem;                  /* 24px */
--tc-space-8: 2rem;                    /* 32px */
--tc-space-10: 2.5rem;                 /* 40px */
--tc-space-12: 3rem;                   /* 48px */
--tc-space-16: 4rem;                   /* 64px */
--tc-space-20: 5rem;                   /* 80px */
--tc-space-24: 6rem;                   /* 96px */

/* ALIAS SÉMANTIQUES */
--tc-space-xs: var(--tc-space-1);      /* Extra small */
--tc-space-sm: var(--tc-space-2);      /* Small */
--tc-space-md: var(--tc-space-4);      /* Medium */
--tc-space-lg: var(--tc-space-6);      /* Large */
--tc-space-xl: var(--tc-space-8);      /* Extra large */
--tc-space-xxl: var(--tc-space-12);    /* Extra extra large */
```

---

## 🔤 **TYPOGRAPHIE (--tc-font-*)**

### **Familles de polices**
```css
--tc-font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--tc-font-mono: 'SF Mono', Monaco, 'Cascadia Code', monospace;
```

### **Tailles de police**
```css
--tc-font-size-xs: 0.75rem;            /* 12px */
--tc-font-size-sm: 0.875rem;           /* 14px */
--tc-font-size-base: 1rem;             /* 16px */
--tc-font-size-lg: 1.125rem;           /* 18px */
--tc-font-size-xl: 1.25rem;            /* 20px */
--tc-font-size-2xl: 1.5rem;            /* 24px */
--tc-font-size-3xl: 1.875rem;          /* 30px */
--tc-font-size-4xl: 2.25rem;           /* 36px */
```

### **Poids de police**
```css
--tc-font-weight-normal: 400;
--tc-font-weight-medium: 500;
--tc-font-weight-semibold: 600;
--tc-font-weight-bold: 700;
```

### **Hauteurs de ligne**
```css
--tc-line-height-tight: 1.25;
--tc-line-height-normal: 1.5;
--tc-line-height-relaxed: 1.75;
```

---

## 🎭 **EFFETS (--tc-shadow-*, --tc-radius-*, --tc-transition-*)**

### **Ombres**
```css
--tc-shadow-none: none;
--tc-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--tc-shadow-base: 0 2px 4px rgba(0, 0, 0, 0.1);
--tc-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--tc-shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
--tc-shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1);

/* OMBRES SPÉCIALISÉES */
--tc-shadow-card: var(--tc-shadow-base);
--tc-shadow-modal: var(--tc-shadow-xl);
--tc-shadow-dropdown: var(--tc-shadow-lg);
--tc-shadow-focus: 0 0 0 3px rgba(52, 152, 219, 0.3);
```

### **Border-radius**
```css
--tc-radius-none: 0;
--tc-radius-sm: 0.25rem;               /* 4px */
--tc-radius-base: 0.375rem;            /* 6px */
--tc-radius-md: 0.5rem;                /* 8px */
--tc-radius-lg: 0.75rem;               /* 12px */
--tc-radius-xl: 1rem;                  /* 16px */
--tc-radius-full: 9999px;              /* Cercle complet */

/* ALIAS SÉMANTIQUES */
--tc-radius-button: var(--tc-radius-base);
--tc-radius-card: var(--tc-radius-md);
--tc-radius-modal: var(--tc-radius-lg);
```

### **Transitions**
```css
--tc-transition-fast: 150ms ease;
--tc-transition-base: 300ms ease;
--tc-transition-slow: 500ms ease;

/* TRANSITIONS SPÉCIALISÉES */
--tc-transition-colors: color 150ms ease, background-color 150ms ease, border-color 150ms ease;
--tc-transition-transform: transform 150ms ease;
--tc-transition-opacity: opacity 150ms ease;
```

---

## 📐 **LAYOUT (--tc-z-*, --tc-size-*)**

### **Z-index**
```css
--tc-z-dropdown: 1000;
--tc-z-sticky: 1020;
--tc-z-fixed: 1030;
--tc-z-modal-backdrop: 1040;
--tc-z-modal: 1050;
--tc-z-popover: 1060;
--tc-z-tooltip: 1070;
--tc-z-toast: 1080;
```

### **Tailles communes**
```css
--tc-size-header: 60px;
--tc-size-sidebar: 240px;
--tc-size-sidebar-collapsed: 64px;
```

---

## 🔄 **MAPPING DES VARIABLES EXISTANTES**

### **Variables à CONSERVER (déjà conformes)**
```css
/* Ces variables respectent déjà la nomenclature */
--tc-primary-color → --tc-color-primary ✅
--tc-secondary-color → --tc-color-secondary ✅
--tc-spacing-md → --tc-space-md ✅
```

### **Variables à RENOMMER (doublons critiques)**
```css
/* COULEURS PRIMAIRES (31 variables → 3) */
--tc-primary-color → --tc-color-primary
--tc-color-primary → --tc-color-primary (garder)
--tc-primary → --tc-color-primary
--tc-btn-primary-bg → --tc-bg-primary
--tc-text-color-primary → --tc-text-primary

/* ARRIÈRE-PLANS (72 variables → 15) */
--tc-bg-color → --tc-bg-default
--tc-background-color → --tc-bg-default
--tc-bg-light → --tc-bg-light (garder)
--tc-card-bg → --tc-bg-card
--tc-modal-bg → --tc-bg-modal

/* TEXTE (28 variables → 10) */
--tc-text-color → --tc-text-default
--tc-color-text → --tc-text-default
--tc-text-muted → --tc-text-muted (garder)
```

### **Variables à SUPPRIMER (redondantes)**
```css
/* Variables Bootstrap obsolètes */
--tc-bs-primary → SUPPRIMER (utiliser --tc-color-primary)
--tc-bs-secondary → SUPPRIMER (utiliser --tc-color-secondary)
--tc-bs-box-shadow → SUPPRIMER (utiliser --tc-shadow-base)

/* Variables incohérentes */
--tc-primary-color-05 → SUPPRIMER (utiliser rgba())
--tc-primary-color-10 → SUPPRIMER (utiliser rgba())
--tc-primary-color-20 → SUPPRIMER (utiliser rgba())
```

---

## 📊 **OBJECTIFS DE RÉDUCTION**

| Catégorie | Avant | Après | Réduction |
|-----------|-------|-------|-----------|
| **Couleurs** | 221 | 80 | -64% |
| **Typographie** | 52 | 15 | -71% |
| **Effets** | 49 | 20 | -59% |
| **Espacements** | 29 | 12 | -59% |
| **Layout** | 20 | 10 | -50% |
| **TOTAL** | **431** | **200** | **-53%** |

---

## ✅ **VALIDATION**

### **Critères de validation :**
- [ ] Nomenclature cohérente appliquée
- [ ] Doublons éliminés
- [ ] Variables manquantes définies
- [ ] Rétrocompatibilité assurée
- [ ] Tests de régression passés

### **Prochaine étape :**
Créer le script de migration automatique basé sur cette nomenclature.

---

*Nomenclature TourCraft v1.0 - Migration CSS* 