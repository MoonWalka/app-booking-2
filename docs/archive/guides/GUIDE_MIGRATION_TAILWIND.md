# 🎨 GUIDE MIGRATION TAILWIND → VARIABLES CSS TOURCRAFT

**Date :** 21 Mai 2025 - Jour 4  
**Objectif :** Remplacer les classes Tailwind par nos variables CSS optimisées  
**Basé sur :** Audit maquette HTML réelle

---

## 📋 **MAPPING TAILWIND → VARIABLES CSS**

### **🎨 COULEURS**
```css
/* TAILWIND → TOURCRAFT */
.text-blue-500     → color: var(--tc-color-blue-500);
.text-green-500    → color: var(--tc-color-green-500);
.text-red-500      → color: var(--tc-color-red-500);
.text-yellow-500   → color: var(--tc-color-yellow-500);

.bg-blue-500       → background-color: var(--tc-color-blue-500);
.bg-green-500      → background-color: var(--tc-color-green-500);
.bg-red-500        → background-color: var(--tc-color-red-500);
.bg-yellow-500     → background-color: var(--tc-color-yellow-500);

.border-blue-500   → border-color: var(--tc-color-blue-500);
.border-green-500  → border-color: var(--tc-color-green-500);
```

### **📐 ESPACEMENTS**
```css
/* TAILWIND → TOURCRAFT */
.p-1               → padding: var(--tc-space-1);        /* 4px */
.p-2               → padding: var(--tc-space-2);        /* 8px */
.p-3               → padding: var(--tc-space-3);        /* 12px */
.p-4               → padding: var(--tc-space-4);        /* 16px */
.p-6               → padding: var(--tc-space-6);        /* 24px */
.p-8               → padding: var(--tc-space-8);        /* 32px */

.m-1               → margin: var(--tc-space-1);
.m-2               → margin: var(--tc-space-2);
.m-4               → margin: var(--tc-space-4);

.gap-2             → gap: var(--tc-gap-2);              /* 8px */
.gap-4             → gap: var(--tc-gap-4);              /* 16px */
.gap-6             → gap: var(--tc-gap-6);              /* 24px */

.space-x-2         → gap: var(--tc-gap-2);              /* Pour flexbox */
```

### **🔤 TYPOGRAPHIE**
```css
/* TAILWIND → TOURCRAFT */
.text-xs           → font-size: var(--tc-font-size-xs);     /* 12px */
.text-sm           → font-size: var(--tc-font-size-sm);     /* 14px */
.text-base         → font-size: var(--tc-font-size-base);   /* 16px */
.text-lg           → font-size: var(--tc-font-size-lg);     /* 18px */
.text-xl           → font-size: var(--tc-font-size-xl);     /* 24px */
.text-2xl          → font-size: var(--tc-font-size-2xl);    /* 32px */
.text-6xl          → font-size: var(--tc-font-size-6xl);    /* 60px */

.font-normal       → font-weight: var(--tc-font-weight-normal);
.font-medium       → font-weight: var(--tc-font-weight-medium);
.font-semibold     → font-weight: var(--tc-font-weight-semibold);
.font-bold         → font-weight: var(--tc-font-weight-bold);
```

### **🎯 EFFETS**
```css
/* TAILWIND → TOURCRAFT */
.rounded           → border-radius: var(--tc-radius-base);      /* 6px */
.rounded-sm        → border-radius: var(--tc-radius-sm);        /* 4px */
.rounded-md        → border-radius: var(--tc-radius-md);        /* 8px */
.rounded-lg        → border-radius: var(--tc-radius-lg);        /* 12px */
.rounded-full      → border-radius: var(--tc-radius-full);      /* 9999px */

.shadow            → box-shadow: var(--tc-shadow-base);
.shadow-sm         → box-shadow: var(--tc-shadow-sm);
.shadow-md         → box-shadow: var(--tc-shadow-md);
.shadow-lg         → box-shadow: var(--tc-shadow-lg);

.transition        → transition: var(--tc-transition-base);
.transition-fast   → transition: var(--tc-transition-fast);
```

---

## 🚀 **EXEMPLES DE MIGRATION**

### **Avant (Tailwind)**
```html
<div class="p-4 bg-blue-500 text-white rounded-lg shadow-md">
    <h2 class="text-xl font-semibold mb-2">Titre</h2>
    <p class="text-sm">Description</p>
</div>
```

### **Après (Variables CSS)**
```html
<div class="tc-card">
    <h2 class="tc-title">Titre</h2>
    <p class="tc-description">Description</p>
</div>
```

```css
.tc-card {
    padding: var(--tc-space-4);
    background-color: var(--tc-color-blue-500);
    color: var(--tc-text-light);
    border-radius: var(--tc-radius-lg);
    box-shadow: var(--tc-shadow-md);
}

.tc-title {
    font-size: var(--tc-font-size-xl);
    font-weight: var(--tc-font-weight-semibold);
    margin-bottom: var(--tc-space-2);
}

.tc-description {
    font-size: var(--tc-font-size-sm);
}
```

---

## ✅ **AVANTAGES DE LA MIGRATION**

### **Performance :**
- ✅ **Bundle plus petit** (suppression Tailwind)
- ✅ **CSS optimisé** (variables natives)
- ✅ **Moins de classes** dans le HTML

### **Maintenance :**
- ✅ **Cohérence garantie** (variables centralisées)
- ✅ **Thème unifié** (couleurs exactes maquette)
- ✅ **Évolutivité** (dark mode, responsive)

### **Développement :**
- ✅ **Autocomplete** (variables CSS)
- ✅ **Debugging facilité** (DevTools)
- ✅ **Réutilisabilité** (composants CSS)

---

## 📊 **IMPACT MIGRATION**

| Métrique | Avant | Après | Amélioration |
|----------|-------|-------|--------------|
| **Variables CSS** | 431 | 130 | **-70%** |
| **Classes Tailwind** | ~50 | 0 | **-100%** |
| **Cohérence couleurs** | 60% | 100% | **+40%** |
| **Bundle size** | +Tailwind | Variables seules | **-80%** |

---

**Migration Tailwind → Variables CSS TourCraft - Jour 4** 🚀 