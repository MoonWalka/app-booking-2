# 🎯 GUIDE D'UTILISATION - SYSTÈME CSS TOURCRAFT

**Version :** 1.0  
**Date :** 21 Mai 2025  
**Statut :** ✅ Système opérationnel  

Ce guide pratique vous permet d'utiliser efficacement le nouveau système CSS TourCraft.

---

## 🚀 **DÉMARRAGE RAPIDE**

### **Classes de base essentielles :**
```html
<!-- Typographie -->
<h1 class="tc-text-2xl tc-font-bold">Titre principal</h1>
<p class="tc-text-base tc-text-muted">Texte secondaire</p>

<!-- Espacements -->
<div class="tc-p-4 tc-mb-6">Contenu avec espacement</div>

<!-- Couleurs -->
<button class="tc-btn tc-btn-primary">Action principale</button>
<div class="tc-bg-light tc-p-3">Zone claire</div>
```

### **Dark mode (prêt à l'emploi) :**
```html
<!-- Toggle dark mode -->
<button onclick="toggleDarkMode()" class="tc-btn">
    🌙 Mode sombre
</button>

<script>
function toggleDarkMode() {
    const html = document.documentElement;
    const theme = html.getAttribute('data-theme');
    html.setAttribute('data-theme', theme === 'dark' ? 'light' : 'dark');
    localStorage.setItem('theme', theme === 'dark' ? 'light' : 'dark');
}

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
});
</script>
```

---

## 📚 **CLASSES UTILITAIRES DISPONIBLES**

### **🔤 Typographie (15 classes)**
```css
/* Tailles de texte */
.tc-text-xs      /* 12px - badges, labels */
.tc-text-sm      /* 14px - texte secondaire */
.tc-text-base    /* 16px - texte principal */
.tc-text-lg      /* 18px - sous-titres */
.tc-text-xl      /* 24px - titres de section */
.tc-text-2xl     /* 32px - titres principaux */
.tc-text-6xl     /* 60px - icônes, hero */

/* Poids de police */
.tc-font-normal    /* 400 */
.tc-font-medium    /* 500 */
.tc-font-semibold  /* 600 */
.tc-font-bold      /* 700 */

/* Alignement */
.tc-text-left, .tc-text-center, .tc-text-right
```

### **🎨 Couleurs (16 classes)**
```css
/* Couleurs de texte */
.tc-text-primary     /* #213547 - couleur principale */
.tc-text-secondary   /* #1e88e5 - couleur secondaire */
.tc-text-success     /* #4caf50 - vert succès */
.tc-text-warning     /* #ffc107 - jaune avertissement */
.tc-text-error       /* #f44336 - rouge erreur */

/* Couleurs de fond */
.tc-bg-primary, .tc-bg-secondary, .tc-bg-success
.tc-bg-warning, .tc-bg-error, .tc-bg-light, .tc-bg-default

/* Couleurs Tailwind équivalentes */
.tc-text-blue-500, .tc-text-green-500, .tc-bg-blue-500
```

### **📏 Espacements (35 classes)**
```css
/* Padding */
.tc-p-0, .tc-p-1, .tc-p-2, .tc-p-3, .tc-p-4, .tc-p-6, .tc-p-8
.tc-px-1, .tc-px-2, .tc-px-3, .tc-px-4  /* Horizontal */
.tc-py-1, .tc-py-2, .tc-py-3, .tc-py-4  /* Vertical */

/* Margin */
.tc-m-0, .tc-m-1, .tc-m-2, .tc-m-3, .tc-m-4
.tc-mx-auto  /* Centrage horizontal */

/* Gap (pour flexbox/grid) */
.tc-gap-1, .tc-gap-2, .tc-gap-3, .tc-gap-4, .tc-gap-6

/* Échelle des espacements */
/* tc-*-1 = 4px, tc-*-2 = 8px, tc-*-3 = 12px, tc-*-4 = 16px */
```

### **✨ Effets (12 classes)**
```css
/* Border-radius */
.tc-rounded-none     /* 0 */
.tc-rounded-sm       /* 4px */
.tc-rounded          /* 6px - défaut */
.tc-rounded-lg       /* 8px */
.tc-rounded-full     /* 9999px - cercle */

/* Ombres */
.tc-shadow-none, .tc-shadow-sm, .tc-shadow, .tc-shadow-lg

/* Transitions */
.tc-transition       /* 300ms ease */
.tc-transition-fast  /* 150ms ease */
```

### **📐 Layout (15 classes)**
```css
/* Display */
.tc-block, .tc-inline, .tc-flex, .tc-grid, .tc-hidden

/* Flexbox */
.tc-flex-col, .tc-flex-row
.tc-justify-start, .tc-justify-center, .tc-justify-end, .tc-justify-between
.tc-items-start, .tc-items-center, .tc-items-end

/* Container */
.tc-container  /* Largeur maximale avec centrage */
```

### **🧩 Composants (21 classes)**
```css
/* Boutons */
.tc-btn              /* Style de base */
.tc-btn-primary      /* Bouton principal */
.tc-btn-secondary    /* Bouton secondaire */

/* Cartes */
.tc-card             /* Carte avec ombre et padding */

/* Badges */
.tc-badge            /* Badge de base */
.tc-badge-primary, .tc-badge-success, .tc-badge-warning

/* États interactifs */
.tc-hover-bg-light   /* Fond clair au survol */
.tc-hover-shadow     /* Ombre au survol */
.tc-focus-ring       /* Anneau de focus */

/* Responsive */
.tc-hidden-mobile    /* Caché sur mobile */
.tc-hidden-desktop   /* Caché sur desktop */
```

---

## 🎨 **VARIABLES CSS DISPONIBLES**

### **Couleurs principales :**
```css
/* Couleurs exactes de la maquette */
--tc-color-primary: #213547;
--tc-color-secondary: #1e88e5;
--tc-color-accent: #4db6ac;

/* Couleurs fonctionnelles */
--tc-color-success: #4caf50;
--tc-color-warning: #ffc107;
--tc-color-error: #f44336;
--tc-color-info: #2196f3;

/* Couleurs de fond */
--tc-bg-default: #ffffff;
--tc-bg-light: #f8f9fa;
--tc-bg-dark: #343a40;

/* Couleurs de texte */
--tc-text-default: #333333;
--tc-text-muted: #6c757d;
--tc-text-light: #ffffff;
```

### **Espacements :**
```css
--tc-space-0: 0;
--tc-space-1: 0.25rem;  /* 4px */
--tc-space-2: 0.5rem;   /* 8px */
--tc-space-3: 0.75rem;  /* 12px */
--tc-space-4: 1rem;     /* 16px */
--tc-space-6: 1.5rem;   /* 24px */
--tc-space-8: 2rem;     /* 32px */
```

### **Typographie :**
```css
--tc-font-size-xs: 0.75rem;     /* 12px */
--tc-font-size-sm: 0.875rem;    /* 14px */
--tc-font-size-base: 1rem;      /* 16px */
--tc-font-size-lg: 1.125rem;    /* 18px */
--tc-font-size-xl: 1.5rem;      /* 24px */
--tc-font-size-2xl: 2rem;       /* 32px */
--tc-font-size-6xl: 3.75rem;    /* 60px */

--tc-font-weight-normal: 400;
--tc-font-weight-medium: 500;
--tc-font-weight-semibold: 600;
--tc-font-weight-bold: 700;
```

### **Effets :**
```css
--tc-shadow-sm: 0 2px 4px rgba(0,0,0,0.05);
--tc-shadow-base: 0 2px 4px rgba(0, 0, 0, 0.1);
--tc-shadow-lg: 0 8px 16px rgba(0,0,0,0.1);

--tc-radius-sm: 0.25rem;    /* 4px */
--tc-radius-base: 0.375rem; /* 6px */
--tc-radius-lg: 0.5rem;     /* 8px */

--tc-transition-fast: 150ms ease;
--tc-transition-base: 300ms ease;
```

---

## 🔄 **MIGRATION DEPUIS TAILWIND**

### **Table de correspondance :**
| Tailwind | TourCraft | Description |
|----------|-----------|-------------|
| `text-xs` | `tc-text-xs` | Texte 12px |
| `text-sm` | `tc-text-sm` | Texte 14px |
| `text-xl` | `tc-text-xl` | Texte 24px |
| `p-4` | `tc-p-4` | Padding 16px |
| `gap-2` | `tc-gap-2` | Gap 8px |
| `rounded` | `tc-rounded` | Border-radius 6px |
| `shadow` | `tc-shadow` | Ombre de base |
| `bg-blue-500` | `tc-bg-blue-500` | Fond bleu |
| `text-green-500` | `tc-text-green-500` | Texte vert |

### **Avantages de la migration :**
- ✅ **Variables centralisées** : Modification globale possible
- ✅ **Bundle plus petit** : 22KB vs 100KB Tailwind
- ✅ **Dark mode natif** : Adaptation automatique
- ✅ **Couleurs exactes** : Conformité maquette garantie

---

## 🌙 **DARK MODE**

### **Activation automatique :**
Toutes les classes `tc-*` s'adaptent automatiquement au dark mode via les variables CSS.

### **Variables dark mode :**
```css
[data-theme="dark"] {
    --tc-bg-default: #1e1e1e;
    --tc-bg-light: #2d2d2d;
    --tc-text-default: #ffffff;
    --tc-text-muted: #b0b0b0;
    --tc-color-primary: #4a6b7c;  /* Plus clair pour dark mode */
}
```

### **Toggle JavaScript :**
```javascript
function toggleDarkMode() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}
```

---

## 💡 **EXEMPLES PRATIQUES**

### **Page complète :**
```html
<!DOCTYPE html>
<html data-theme="light">
<head>
    <link rel="stylesheet" href="src/styles/base/colors.css">
    <link rel="stylesheet" href="src/styles/base/variables.css">
    <link rel="stylesheet" href="src/styles/components/tc-utilities.css">
</head>
<body class="tc-bg-default tc-text-default">
    <header class="tc-bg-primary tc-text-light tc-p-4">
        <div class="tc-container tc-flex tc-justify-between tc-items-center">
            <h1 class="tc-text-xl tc-font-bold">TourCraft</h1>
            <button onclick="toggleDarkMode()" class="tc-btn">
                🌙 Dark Mode
            </button>
        </div>
    </header>
    
    <main class="tc-container tc-p-6">
        <div class="tc-card tc-p-6 tc-mb-6">
            <h2 class="tc-text-lg tc-font-semibold tc-mb-4">
                Bienvenue sur TourCraft
            </h2>
            <p class="tc-text-base tc-text-muted tc-mb-4">
                Système CSS moderne avec dark mode intégré.
            </p>
            <div class="tc-flex tc-gap-3">
                <button class="tc-btn tc-btn-primary">
                    Action principale
                </button>
                <button class="tc-btn tc-btn-secondary">
                    Action secondaire
                </button>
            </div>
        </div>
    </main>
</body>
</html>
```

### **Formulaire :**
```html
<form class="tc-card tc-p-6">
    <h3 class="tc-text-lg tc-font-semibold tc-mb-4">Nouveau concert</h3>
    
    <div class="tc-mb-4">
        <label class="tc-text-sm tc-font-medium tc-mb-2">
            Nom du concert
        </label>
        <input type="text" class="tc-p-3 tc-rounded tc-bg-light">
    </div>
    
    <div class="tc-mb-4">
        <label class="tc-text-sm tc-font-medium tc-mb-2">
            Description
        </label>
        <textarea class="tc-p-3 tc-rounded tc-bg-light"></textarea>
    </div>
    
    <div class="tc-flex tc-gap-3">
        <button type="submit" class="tc-btn tc-btn-primary">
            Créer
        </button>
        <button type="button" class="tc-btn">
            Annuler
        </button>
    </div>
</form>
```

### **Liste avec badges :**
```html
<div class="tc-card">
    <div class="tc-p-4 tc-border-b">
        <h3 class="tc-text-lg tc-font-semibold">Concerts à venir</h3>
    </div>
    
    <div class="tc-p-4">
        <div class="tc-flex tc-justify-between tc-items-center tc-mb-3">
            <div>
                <h4 class="tc-font-medium">Concert Jazz Festival</h4>
                <p class="tc-text-sm tc-text-muted">15 juin 2025</p>
            </div>
            <span class="tc-badge tc-badge-success">Confirmé</span>
        </div>
        
        <div class="tc-flex tc-justify-between tc-items-center">
            <div>
                <h4 class="tc-font-medium">Rock en Seine</h4>
                <p class="tc-text-sm tc-text-muted">22 juin 2025</p>
            </div>
            <span class="tc-badge tc-badge-warning">En attente</span>
        </div>
    </div>
</div>
```

---

## ⚠️ **BONNES PRATIQUES**

### **✅ À faire :**
- Utiliser les classes `tc-*` pour tous les nouveaux développements
- Respecter l'échelle d'espacement (multiples de 4px)
- Tester en dark mode systématiquement
- Utiliser les variables CSS pour les styles custom

### **❌ À éviter :**
- Mélanger les classes Tailwind et TourCraft
- Créer des variables CSS en dehors du système
- Hardcoder des couleurs ou espacements
- Ignorer le dark mode dans les nouveaux composants

### **🔧 Styles custom :**
```css
/* Utiliser les variables TourCraft */
.mon-composant {
    background-color: var(--tc-color-primary);
    padding: var(--tc-space-4);
    border-radius: var(--tc-radius-base);
    transition: var(--tc-transition-base);
}

.mon-composant:hover {
    background-color: var(--tc-color-primary-light);
    box-shadow: var(--tc-shadow-lg);
}
```

---

## 🐛 **TROUBLESHOOTING**

### **Problème : Classes non appliquées**
```bash
# Vérifier que les CSS sont importés
# Dans votre fichier principal CSS :
@import 'src/styles/base/colors.css';
@import 'src/styles/base/variables.css';
@import 'src/styles/components/tc-utilities.css';
```

### **Problème : Dark mode ne fonctionne pas**
```javascript
// Vérifier l'attribut data-theme
console.log(document.documentElement.getAttribute('data-theme'));

// Forcer le dark mode pour tester
document.documentElement.setAttribute('data-theme', 'dark');
```

### **Problème : Variables non définies**
```bash
# Audit des variables manquantes
./scripts/audit-css-variables.sh
```

---

## 📊 **MÉTRIQUES ET PERFORMANCE**

### **Bundle CSS optimisé :**
- **Total** : 22KB (vs 100KB Tailwind)
- **colors.css** : 4.9KB (66 variables + dark mode)
- **variables.css** : 5.7KB (63 variables)
- **tc-utilities.css** : 11KB (114 classes)

### **Compatibilité navigateurs :**
- **Chrome** : 57+ (Mars 2017)
- **Firefox** : 52+ (Mars 2017)
- **Safari** : 10.1+ (Mars 2017)
- **Mobile** : iOS 10.3+, Android Chrome 57+

---

## 📞 **SUPPORT**

### **Ressources :**
- **Documentation** : `docs/migration-css/`
- **Démonstrations** : `demos/` (exemples HTML)
- **Scripts d'audit** : `scripts/audit-css-variables.sh`

### **FAQ :**
**Q : Puis-je mélanger Tailwind et TourCraft ?**  
R : Non, utilisez uniquement les classes `tc-*` pour la cohérence.

**Q : Comment ajouter une nouvelle couleur ?**  
R : Ajoutez-la dans `colors.css` en respectant la nomenclature `--tc-color-*`.

**Q : Le dark mode est-il automatique ?**  
R : Oui, toutes les classes `tc-*` s'adaptent automatiquement.

---

*Guide d'utilisation TourCraft CSS v1.0 - Système opérationnel* 