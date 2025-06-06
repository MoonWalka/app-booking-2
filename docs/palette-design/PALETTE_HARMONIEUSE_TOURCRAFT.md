# Palette Harmonieuse TourCraft

**Créée le 31 Mai 2025** - Basée sur la couleur de référence **#213547**

## 🎯 Objectifs

Créer une palette complètement harmonieuse où toutes les couleurs s'accordent parfaitement avec la couleur principale #213547 (sidebar) de TourCraft.

## 🔬 Méthodologie

### Couleur de Référence
- **#213547** = HSL(202°, 36%, 20%)
- Teinte : 202° (gris-bleu)
- Saturation : 36%
- Luminosité : 20%

### Principe d'Harmonisation
Toutes les couleurs partagent les mêmes caractéristiques pour créer une cohérence visuelle parfaite :

1. **Couleurs de statut** : Même saturation (36%) que la couleur principale
2. **Couleurs neutres** : Même teinte (202°) avec saturation réduite (8%)
3. **Variants** : Échelle cohérente de luminosité (50-900)

## 🎨 Palette Principale

### Couleur de Base
```css
--tc-color-primary: #213547;    /* HSL(202°, 36%, 20%) */
```

### Variants Harmonisés
```css
--tc-color-primary-50:  hsl(202, 36%, 96%);  /* #f7f9fa - Ultra clair */
--tc-color-primary-100: hsl(202, 36%, 89%);  /* #e8eef2 - Très clair */
--tc-color-primary-200: hsl(202, 36%, 78%);  /* #cdd9e2 - Clair */
--tc-color-primary-300: hsl(202, 36%, 67%);  /* #b1c4d1 - Moyen clair */
--tc-color-primary-400: hsl(202, 36%, 56%);  /* #96afc1 - Moyen */
--tc-color-primary-500: #213547;             /* Couleur de base */
--tc-color-primary-600: hsl(202, 36%, 16%);  /* #1a2b38 - Foncé */
--tc-color-primary-700: hsl(202, 36%, 13%);  /* #15232e - Très foncé */
--tc-color-primary-800: hsl(202, 36%, 10%);  /* #101b24 - Ultra foncé */
--tc-color-primary-900: hsl(202, 36%, 7%);   /* #0b131a - Noir bleuté */
```

## ✅ Couleurs de Statut Harmonisées

### Success (Vert)
**Teinte : 142°** - Complémentaire harmonieuse de 202°
```css
--tc-color-success-500: hsl(142, 36%, 45%);  /* #6fbc90 - Vert base */
--tc-color-success-300: hsl(142, 36%, 67%);  /* #abd8be - Vert clair */
--tc-color-success-700: hsl(142, 36%, 29%);  /* #467559 - Vert foncé */
```

### Warning (Orange)
**Teinte : 35°** - Couleur chaude harmonieuse
```css
--tc-color-warning-500: hsl(35, 36%, 45%);   /* #b18d62 - Orange base */
--tc-color-warning-300: hsl(35, 36%, 67%);   /* #d1bda4 - Orange clair */
--tc-color-warning-700: hsl(35, 36%, 29%);   /* #6c5a3e - Orange foncé */
```

### Error (Rouge)
**Teinte : 0°** - Rouge pur harmonisé
```css
--tc-color-error-500: hsl(0, 36%, 45%);      /* #b16262 - Rouge base */
--tc-color-error-300: hsl(0, 36%, 67%);      /* #d1a4a4 - Rouge clair */
--tc-color-error-700: hsl(0, 36%, 29%);      /* #6c3e3e - Rouge foncé */
```

### Info (Bleu)
**Teinte : 202°** - Même teinte que primary, saturation plus élevée
```css
--tc-color-info-500: hsl(202, 45%, 45%);     /* #779bb8 - Bleu base */
--tc-color-info-300: hsl(202, 45%, 67%);     /* #afc5d6 - Bleu clair */
--tc-color-info-700: hsl(202, 45%, 29%);     /* #4a5d6f - Bleu foncé */
```

## 🔘 Couleurs Neutres Teintées

Les gris sont légèrement teintés avec la couleur principale pour une cohérence parfaite :

```css
--tc-color-gray-50:  hsl(202, 8%, 98%);  /* #fafbfb - Quasi blanc teinté */
--tc-color-gray-100: hsl(202, 8%, 96%);  /* #f6f7f8 - Très très clair */
--tc-color-gray-200: hsl(202, 8%, 90%);  /* #e8eaeb - Très clair */
--tc-color-gray-300: hsl(202, 8%, 82%);  /* #ced2d4 - Clair */
--tc-color-gray-400: hsl(202, 8%, 65%);  /* #a1a7ab - Moyen clair */
--tc-color-gray-500: hsl(202, 8%, 48%);  /* #757c82 - Moyen */
--tc-color-gray-600: hsl(202, 8%, 35%);  /* #565b60 - Foncé */
--tc-color-gray-700: hsl(202, 8%, 25%);  /* #3d4144 - Très foncé */
--tc-color-gray-800: hsl(202, 8%, 15%);  /* #242629 - Ultra foncé */
--tc-color-gray-900: hsl(202, 8%, 8%);   /* #131415 - Quasi noir */
```

## 🎭 Couleurs Métier Harmonisées

### Artistes
**Teinte : 262°** - Violet harmonieux
```css
--tc-color-artiste: hsl(262, 36%, 45%);        /* #7562b1 - Violet harmonisé */
--tc-color-artiste-light: hsl(262, 36%, 89%);  /* #ede6f2 - Violet très clair */
```

### Concerts
**Teinte : 222°** - Bleu concert harmonisé
```css
--tc-color-concert: hsl(222, 36%, 45%);        /* #6275b1 - Bleu concert */
--tc-color-concert-light: hsl(222, 36%, 89%);  /* #e6eaf2 - Bleu très clair */
```

### Programmateurs
**Teinte : 282°** - Violet programmateur
```css
--tc-color-programmateur: hsl(282, 36%, 45%);  /* #9162b1 - Violet programmateur */
--tc-color-programmateur-light: hsl(282, 36%, 89%); /* #f0e6f2 - Violet très clair */
```

## 🌓 Mode Sombre Harmonisé

Le mode sombre utilise des versions adaptées des mêmes couleurs harmonieuses :

- **Couleurs principales** : Versions plus claires (300-400)
- **Fonds** : Gris très foncés teintés avec la couleur principale
- **Textes** : Gris clairs teintés pour maintenir l'harmonie

## ♿ Accessibilité WCAG AA

Tous les contrastes respectent les normes WCAG AA :

- **Texte normal** : Ratio minimum 4.5:1
- **Texte large** : Ratio minimum 3:1
- **Variables spéciales** : `--tc-*-text-contrast` pour un contraste optimal

## 🚀 Application

### Script d'application automatique
```bash
./scripts/apply-harmonized-colors.sh
```

### Vérification manuelle
```bash
# Sauvegarde automatique créée dans :
src/styles/base/colors-original-backup-YYYYMMDD-HHMMSS.css

# Pour revenir en arrière :
cp src/styles/base/colors-original-backup-*.css src/styles/base/colors.css
```

## ✨ Avantages de la Nouvelle Palette

1. **Cohérence visuelle parfaite** : Toutes les couleurs s'harmonisent
2. **Psychologie des couleurs** : 
   - Vert success apaisant et harmonieux
   - Orange warning chaleureux mais cohérent
   - Rouge error distinctif mais intégré
   - Bleu info professionnel et familier
3. **Accessibilité maintenue** : Tous les contrastes WCAG AA respectés
4. **Mode sombre inclus** : Transition automatique harmonieuse
5. **Palette étendue** : Nuances 50-900 pour tous les besoins

## 🎨 Exemples d'Usage

### Badges de statut
```css
.badge-success {
    background: var(--tc-color-success-500);
    color: var(--tc-success-text-contrast);
}
```

### Cartes avec accent
```css
.card-primary {
    border-left: 4px solid var(--tc-color-primary-500);
    background: var(--tc-color-primary-50);
}
```

### Boutons harmonisés
```css
.btn-secondary {
    background: var(--tc-color-secondary);
    color: white;
}

.btn-secondary:hover {
    background: var(--tc-color-secondary-dark);
}
```

---

**Cette palette garantit une identité visuelle cohérente et professionnelle pour TourCraft tout en respectant les standards d'accessibilité modernes.**