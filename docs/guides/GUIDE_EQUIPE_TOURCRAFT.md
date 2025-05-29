# 📚 GUIDE ÉQUIPE TOURCRAFT - CSS VARIABLES

**Date :** 21 Mai 2025  
**Version :** 1.0 - Migration CSS terminée  
**Statut :** ✅ Production Ready

---

## 🎯 **INTRODUCTION**

Ce guide complet vous permettra d'utiliser efficacement le nouveau système CSS TourCraft basé sur des variables CSS natives. Fini Tailwind, place à un système optimisé, performant et entièrement adapté à nos besoins !

### **🚀 Avantages du nouveau système :**
- ✅ **Performance** : Bundle CSS réduit de 78% (22KB vs 100KB)
- ✅ **Cohérence** : Couleurs exactes de la maquette
- ✅ **Dark mode** : Toggle instantané sans rechargement
- ✅ **Maintenance** : Variables centralisées
- ✅ **Évolutivité** : Architecture future-proof

---

## 🎨 **CLASSES DE BASE**

### **📝 Typographie**

#### **Tailles de police :**
```html
<p class="tc-text-xs">Texte très petit (12px)</p>
<p class="tc-text-sm">Texte petit (14px)</p>
<p class="tc-text-base">Texte normal (16px)</p>
<p class="tc-text-lg">Texte large (18px)</p>
<p class="tc-text-xl">Titre section (24px)</p>
<p class="tc-text-2xl">Grand titre (32px)</p>
<p class="tc-text-6xl">Titre principal (60px)</p>
```

#### **Poids de police :**
```html
<p class="tc-font-normal">Texte normal (400)</p>
<p class="tc-font-medium">Texte medium (500)</p>
<p class="tc-font-semibold">Texte semi-gras (600)</p>
<p class="tc-font-bold">Texte gras (700)</p>
```

#### **Alignement :**
```html
<p class="tc-text-left">Texte à gauche</p>
<p class="tc-text-center">Texte centré</p>
<p class="tc-text-right">Texte à droite</p>
```

### **🎨 Couleurs**

#### **Couleurs de texte :**
```html
<p class="tc-text-primary">Texte couleur primaire (#213547)</p>
<p class="tc-text-secondary">Texte couleur secondaire (#1e88e5)</p>
<p class="tc-text-success">Texte succès (vert)</p>
<p class="tc-text-warning">Texte avertissement (jaune)</p>
<p class="tc-text-error">Texte erreur (rouge)</p>
<p class="tc-text-info">Texte information (bleu)</p>
<p class="tc-text-muted">Texte atténué (gris)</p>
```

#### **Couleurs de fond :**
```html
<div class="tc-bg-default">Fond par défaut</div>
<div class="tc-bg-light">Fond clair</div>
<div class="tc-bg-primary">Fond primaire</div>
<div class="tc-bg-secondary">Fond secondaire</div>
<div class="tc-bg-success">Fond succès</div>
<div class="tc-bg-warning">Fond avertissement</div>
<div class="tc-bg-error">Fond erreur</div>
<div class="tc-bg-hover">Fond au survol</div>
```

### **📐 Espacements**

#### **Padding :**
```html
<div class="tc-p-1">Padding 4px</div>
<div class="tc-p-2">Padding 8px</div>
<div class="tc-p-3">Padding 12px</div>
<div class="tc-p-4">Padding 16px (standard)</div>
<div class="tc-p-6">Padding 24px</div>
<div class="tc-p-8">Padding 32px</div>

<!-- Padding directionnel -->
<div class="tc-px-4">Padding horizontal 16px</div>
<div class="tc-py-2">Padding vertical 8px</div>
```

#### **Margin :**
```html
<div class="tc-m-2">Margin 8px</div>
<div class="tc-mb-4">Margin bottom 16px</div>
<div class="tc-mt-6">Margin top 24px</div>
```

#### **Gap (Flexbox/Grid) :**
```html
<div class="tc-flex tc-gap-2">Gap 8px entre éléments</div>
<div class="tc-grid tc-gap-4">Gap 16px entre éléments</div>
```

### **✨ Effets**

#### **Border radius :**
```html
<div class="tc-rounded-sm">Coins arrondis 4px</div>
<div class="tc-rounded">Coins arrondis 6px (standard)</div>
<div class="tc-rounded-lg">Coins arrondis 12px</div>
<div class="tc-rounded-full">Coins complètement arrondis</div>
```

#### **Ombres :**
```html
<div class="tc-shadow-sm">Ombre légère</div>
<div class="tc-shadow">Ombre standard</div>
<div class="tc-shadow-lg">Ombre prononcée</div>
```

#### **Transitions :**
```html
<div class="tc-transition">Transition standard (300ms)</div>
<div class="tc-transition-fast">Transition rapide (150ms)</div>
```

### **📦 Layout**

#### **Display :**
```html
<div class="tc-block">Display block</div>
<div class="tc-flex">Display flex</div>
<div class="tc-grid">Display grid</div>
<div class="tc-hidden">Masqué</div>
```

#### **Flexbox :**
```html
<div class="tc-flex tc-justify-center tc-items-center">
  Centré horizontalement et verticalement
</div>

<div class="tc-flex tc-justify-between">
  Espacement entre éléments
</div>

<div class="tc-flex tc-flex-col tc-gap-4">
  Colonne avec espacement
</div>
```

#### **Container :**
```html
<div class="tc-container">
  Container responsive avec padding automatique
</div>
```

---

## 🧩 **COMPOSANTS AVANCÉS**

### **🔘 Boutons**

#### **Boutons de base :**
```html
<!-- Bouton primaire -->
<button class="tc-btn tc-btn-primary">
  Action principale
</button>

<!-- Bouton secondaire -->
<button class="tc-btn tc-btn-secondary">
  Action secondaire
</button>

<!-- Bouton personnalisé -->
<button class="tc-btn" style="background-color: var(--tc-color-success); color: var(--tc-text-light);">
  Bouton succès
</button>
```

### **🃏 Cartes**

#### **Card de base :**
```html
<div class="tc-card">
  <h3 class="tc-text-lg tc-font-semibold tc-mb-3">Titre de la carte</h3>
  <p class="tc-text-sm tc-text-muted">Description de la carte</p>
</div>
```

#### **Card interactive :**
```html
<div class="tc-card tc-hover-shadow">
  <h3 class="tc-text-lg tc-font-semibold tc-text-primary tc-mb-3">
    Carte interactive
  </h3>
  <p class="tc-text-sm tc-text-secondary">
    Cette carte a un effet d'ombre au survol
  </p>
</div>
```

### **🏷️ Badges**

#### **Badges de statut :**
```html
<span class="tc-badge">Badge par défaut</span>
<span class="tc-badge tc-badge-primary">Primary</span>
<span class="tc-badge tc-badge-success">Validé</span>

<!-- Badge personnalisé -->
<span class="tc-badge" style="background-color: var(--tc-color-warning); color: var(--tc-text-default);">
  En attente
</span>
```

---

## 🌙 **DARK MODE**

### **🔄 Toggle Dark Mode**

#### **Implémentation JavaScript :**
```javascript
// Fonction de toggle
function toggleDarkMode() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
});
```

#### **Bouton de toggle :**
```html
<button onclick="toggleDarkMode()" class="tc-btn tc-btn-primary">
  🌙 Basculer le thème
</button>
```

### **🎨 Adaptation automatique**

**Toutes les classes TourCraft s'adaptent automatiquement au dark mode !**

```html
<!-- Ces éléments changent automatiquement de couleur -->
<div class="tc-bg-default tc-text-default tc-p-4">
  Contenu qui s'adapte au thème
</div>

<div class="tc-card">
  <h3 class="tc-text-primary">Titre adaptatif</h3>
  <p class="tc-text-muted">Texte adaptatif</p>
</div>
```

---

## 📱 **RESPONSIVE DESIGN**

### **🔧 Classes responsive**

#### **Masquage conditionnel :**
```html
<div class="tc-hidden-mobile">Masqué sur mobile</div>
<div class="tc-hidden-desktop">Masqué sur desktop</div>
```

#### **Container responsive :**
```html
<div class="tc-container">
  <!-- S'adapte automatiquement :
       Mobile: 100% width
       Tablet: 720px max
       Desktop: 960px max
       Large: 1140px max -->
</div>
```

### **📐 Breakpoints**

Les breakpoints sont définis dans les variables :
- **xs** : 0px (mobile)
- **sm** : 576px (mobile large)
- **md** : 768px (tablet)
- **lg** : 992px (desktop)
- **xl** : 1200px (large desktop)

---

## 🎯 **EXEMPLES PRATIQUES**

### **📄 Page type**

```html
<!DOCTYPE html>
<html lang="fr" data-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TourCraft</title>
    <link rel="stylesheet" href="src/styles/base/variables.css">
    <link rel="stylesheet" href="src/styles/components/tc-utilities.css">
</head>
<body>
    <!-- Header -->
    <header class="tc-bg-primary tc-text-light tc-p-4">
        <div class="tc-container tc-flex tc-justify-between tc-items-center">
            <h1 class="tc-text-2xl tc-font-bold">TourCraft</h1>
            <nav class="tc-flex tc-gap-4">
                <a href="#" class="tc-text-light">Concerts</a>
                <a href="#" class="tc-text-light">Artistes</a>
            </nav>
        </div>
    </header>

    <!-- Contenu principal -->
    <main class="tc-container tc-py-8">
        <section class="tc-mb-8">
            <h2 class="tc-text-6xl tc-font-bold tc-text-primary tc-mb-4">
                Titre principal
            </h2>
            <p class="tc-text-lg tc-text-muted tc-mb-6">
                Description de la section
            </p>
        </section>

        <!-- Grille de cartes -->
        <div class="tc-grid" style="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: var(--tc-space-6);">
            <div class="tc-card tc-hover-shadow">
                <h3 class="tc-text-lg tc-font-semibold tc-mb-3">Carte 1</h3>
                <p class="tc-text-sm tc-text-muted">Contenu de la carte</p>
                <button class="tc-btn tc-btn-primary tc-mt-4">Action</button>
            </div>
        </div>
    </main>
</body>
</html>
```

### **📋 Formulaire**

```html
<form class="tc-card">
    <h3 class="tc-text-xl tc-font-semibold tc-mb-4">Formulaire</h3>
    
    <div class="tc-mb-4">
        <label class="tc-text-sm tc-font-medium tc-mb-2">Nom :</label>
        <input type="text" class="tc-p-3 tc-rounded tc-border-light" style="width: 100%; border: 1px solid var(--tc-border-default);">
    </div>
    
    <div class="tc-mb-6">
        <label class="tc-text-sm tc-font-medium tc-mb-2">Email :</label>
        <input type="email" class="tc-p-3 tc-rounded tc-border-light" style="width: 100%; border: 1px solid var(--tc-border-default);">
    </div>
    
    <div class="tc-flex tc-gap-3">
        <button type="submit" class="tc-btn tc-btn-primary">Valider</button>
        <button type="button" class="tc-btn" style="background-color: var(--tc-bg-light);">Annuler</button>
    </div>
</form>
```

---

## 🔧 **VARIABLES CSS DIRECTES**

### **🎨 Utilisation des variables**

Vous pouvez utiliser directement les variables CSS dans vos styles :

```css
.mon-composant {
    background-color: var(--tc-color-primary);
    color: var(--tc-text-light);
    padding: var(--tc-space-4);
    border-radius: var(--tc-radius-base);
    box-shadow: var(--tc-shadow-base);
    transition: var(--tc-transition);
}

.mon-composant:hover {
    background-color: var(--tc-color-primary-dark);
    box-shadow: var(--tc-shadow-lg);
}
```

### **📋 Variables principales**

#### **Couleurs :**
- `--tc-color-primary` : #213547 (couleur maquette)
- `--tc-color-secondary` : #1e88e5 (bleu maquette)
- `--tc-color-accent` : #4db6ac (accent maquette)
- `--tc-color-success` : #4caf50
- `--tc-color-warning` : #ffc107
- `--tc-color-error` : #f44336

#### **Espacements :**
- `--tc-space-1` : 0.25rem (4px)
- `--tc-space-2` : 0.5rem (8px)
- `--tc-space-4` : 1rem (16px)
- `--tc-space-6` : 1.5rem (24px)
- `--tc-space-8` : 2rem (32px)

#### **Typographie :**
- `--tc-font-sans` : 'Segoe UI', Tahoma, Geneva, Verdana
- `--tc-font-size-xs` : 0.75rem (12px)
- `--tc-font-size-sm` : 0.875rem (14px)
- `--tc-font-size-base` : 1rem (16px)
- `--tc-font-size-xl` : 1.5rem (24px)

---

## ⚡ **BONNES PRATIQUES**

### **✅ À faire**

1. **Utilisez les classes TourCraft** plutôt que du CSS custom
2. **Respectez la nomenclature** `tc-*` pour la cohérence
3. **Testez en dark mode** systématiquement
4. **Utilisez les variables** pour les styles personnalisés
5. **Privilégiez les composants** réutilisables

### **❌ À éviter**

1. **Couleurs hardcodées** (utilisez les variables)
2. **Espacements arbitraires** (utilisez l'échelle définie)
3. **Classes Tailwind** (système migré)
4. **Styles inline** excessifs
5. **Duplication** de styles

### **🎯 Exemples**

#### **✅ Bon :**
```html
<div class="tc-card tc-p-4">
    <h3 class="tc-text-lg tc-font-semibold tc-text-primary">Titre</h3>
    <p class="tc-text-sm tc-text-muted">Description</p>
</div>
```

#### **❌ Mauvais :**
```html
<div style="background: white; padding: 15px; border-radius: 8px;">
    <h3 style="color: #213547; font-size: 18px;">Titre</h3>
    <p style="color: #888; font-size: 14px;">Description</p>
</div>
```

---

## 🚀 **MIGRATION DEPUIS TAILWIND**

### **📋 Table de correspondance**

| Tailwind | TourCraft | Description |
|----------|-----------|-------------|
| `text-xs` | `tc-text-xs` | Texte 12px |
| `text-sm` | `tc-text-sm` | Texte 14px |
| `text-xl` | `tc-text-xl` | Texte 24px |
| `p-4` | `tc-p-4` | Padding 16px |
| `gap-2` | `tc-gap-2` | Gap 8px |
| `rounded` | `tc-rounded` | Border radius 6px |
| `shadow` | `tc-shadow` | Ombre standard |
| `bg-blue-500` | `tc-bg-primary` | Fond primaire |
| `text-gray-500` | `tc-text-muted` | Texte atténué |

### **🔄 Script de migration**

Pour migrer automatiquement vos fichiers :

```bash
# Rechercher les classes Tailwind
./scripts/audit-tailwind-classes.sh

# Voir le guide de migration
cat GUIDE_MIGRATION_TAILWIND.md
```

---

## 🆘 **FAQ ET TROUBLESHOOTING**

### **❓ Questions fréquentes**

#### **Q: Comment changer la couleur primaire ?**
R: Modifiez `--tc-color-primary` dans `src/styles/base/colors.css`

#### **Q: Le dark mode ne fonctionne pas ?**
R: Vérifiez que `data-theme="dark"` est sur l'élément `<html>`

#### **Q: Comment créer un nouveau composant ?**
R: Utilisez les variables CSS existantes et les classes utilitaires

#### **Q: Puis-je encore utiliser Tailwind ?**
R: Non, le système a été migré. Utilisez les classes `tc-*` équivalentes

#### **Q: Comment déboguer les variables CSS ?**
R: Utilisez les DevTools pour inspector les variables dans l'onglet CSS

### **🔧 Problèmes courants**

#### **Variables non définies :**
```css
/* ❌ Erreur */
color: var(--tc-color-inexistant);

/* ✅ Solution */
color: var(--tc-color-primary);
```

#### **Dark mode non appliqué :**
```html
<!-- ❌ Erreur -->
<html>

<!-- ✅ Solution -->
<html data-theme="light">
```

#### **Styles non appliqués :**
```html
<!-- ❌ Erreur -->
<link rel="stylesheet" href="styles.css">

<!-- ✅ Solution -->
<link rel="stylesheet" href="src/styles/base/variables.css">
<link rel="stylesheet" href="src/styles/components/tc-utilities.css">
```

---

## 📞 **SUPPORT**

### **🔗 Ressources**

- **Documentation complète** : Ce guide
- **Exemples** : `demo/migration-example.html` et `demo/dark-mode-example.html`
- **Variables** : `src/styles/base/colors.css` et `src/styles/base/variables.css`
- **Classes** : `src/styles/components/tc-utilities.css`

### **🧪 Tests**

```bash
# Tester l'intégration
./scripts/test-integration-phase3.sh

# Tester la compatibilité
./scripts/test-cross-browser.sh
```

### **📊 Métriques**

- **129 variables CSS** optimisées
- **114 classes utilitaires** disponibles
- **78% de réduction** du bundle CSS
- **Support universel** navigateurs modernes

---

**🎉 Félicitations ! Vous maîtrisez maintenant le système CSS TourCraft !**

*Guide généré automatiquement - Migration CSS TourCraft v1.0* 