# Guide du système de styles TourCraft

Ce dossier contient toutes les feuilles de style CSS utilisées dans l'application TourCraft.

## Structure

La structure du dossier styles est organisée comme suit :

```
styles/
├── index.css          # Point d'entrée principal qui importe tous les autres styles
├── theme.css          # Définitions des thèmes (clair/sombre)
├── base/              # Styles de base et fondations
│   ├── reset.css      # Réinitialisation des styles par défaut
│   ├── colors.css     # Palette de couleurs et variables CSS
│   └── variables.css  # Autres variables (espacement, typographie, etc.)
├── components/        # Styles spécifiques aux composants
│   ├── buttons.css    # Styles des boutons
│   ├── cards.css      # Styles des cartes
│   ├── forms.css      # Styles des formulaires
│   └── ...
└── pages/             # Styles spécifiques aux pages
    ├── dashboard.css  # Styles de la page tableau de bord
    ├── artistes.css   # Styles de la page artistes
    └── ...
```

## Convention de nommage

Toutes les variables CSS dans notre application utilisent le préfixe `--tc-` (pour TourCraft) afin d'éviter les collisions avec d'autres bibliothèques CSS.

### Exemples :
- `--tc-primary-color` : couleur principale de l'application
- `--tc-border-radius` : rayon de bordure standard
- `--tc-spacing-md` : espacement medium

## Utilisation des variables

Pour utiliser une variable CSS :

```css
.my-element {
  color: var(--tc-primary-color);
  margin: var(--tc-spacing-md);
}
```

## Palette de couleurs

Notre palette de couleurs est divisée en plusieurs catégories :

### Couleurs principales
- `--tc-primary-color` : Couleur principale de marque (bleu)
- `--tc-secondary-color` : Couleur secondaire (gris)
- `--tc-success-color` : Couleur de succès (vert)
- `--tc-danger-color` : Couleur d'erreur (rouge)
- `--tc-warning-color` : Couleur d'avertissement (jaune)
- `--tc-info-color` : Couleur d'information (bleu clair)

### Variantes de couleurs
- `--tc-primary-light` : Version plus claire de la couleur principale
- `--tc-primary-dark` : Version plus foncée de la couleur principale

### Couleurs de texte
- `--tc-text-color` : Couleur principale du texte
- `--tc-text-muted` : Couleur de texte atténuée/secondaire
- `--tc-label-color` : Couleur pour les libellés de formulaires

### Couleurs de fond
- `--tc-bg-color` : Couleur de fond principale
- `--tc-card-bg` : Couleur de fond des cartes

## Espacement

Nous utilisons un système d'espacement cohérent :

- `--tc-spacing-xs` : 0.25rem (4px) - Très petit espacement
- `--tc-spacing-sm` : 0.5rem (8px) - Petit espacement
- `--tc-spacing-md` : 1rem (16px) - Espacement moyen (standard)
- `--tc-spacing-lg` : 1.5rem (24px) - Grand espacement
- `--tc-spacing-xl` : 2rem (32px) - Très grand espacement

## Typographie

Les variables de typographie incluent :

- `--tc-font-size-xs` : 0.75rem (12px)
- `--tc-font-size-sm` : 0.875rem (14px)
- `--tc-font-size-base` : 1rem (16px)
- `--tc-font-size-md` : 1.125rem (18px)
- `--tc-font-size-lg` : 1.25rem (20px)
- `--tc-font-size-xl` : 1.5rem (24px)
- `--tc-font-size-xxl` : 2rem (32px)

## Bordures et ombres

- `--tc-border-radius` : Rayon de bordure standard (0.25rem)
- `--tc-border-radius-sm` : Petit rayon de bordure (0.125rem)
- `--tc-border-color` : Couleur de bordure standard
- `--tc-shadow` : Ombre standard pour les éléments (cartes, etc.)
- `--tc-shadow-hover` : Ombre pour les états hover
- `--tc-shadow-modal` : Ombre pour les modales

## Transitions

- `--tc-transition` : Transition standard (all 0.2s ease-in-out)
- `--tc-transition-duration` : Durée standard de transition (0.2s)

## Déclarer de nouvelles variables

Pour ajouter une nouvelle variable CSS :

1. Déterminez si elle appartient à colors.css ou variables.css
2. Ajoutez-la avec le préfixe `--tc-`
3. Documentez-la dans ce README si nécessaire
4. Utilisez-la de manière cohérente dans toute l'application

## Thèmes

L'application prend en charge un thème clair et un thème sombre qui sont définis dans theme.css. Pour basculer entre les thèmes, nous utilisons l'attribut `data-theme` sur l'élément html :

```css
html[data-theme="dark"] {
  --tc-bg-color: #121212;
  --tc-text-color: #ffffff;
  /* Autres variables spécifiques au thème sombre */
}
```

## Compatibilité

Nos variables CSS sont compatibles avec tous les navigateurs modernes. Pour les anciens navigateurs, nous utilisons des valeurs de repli :

```css
.element {
  color: #0066cc; /* Valeur de repli pour les navigateurs qui ne supportent pas CSS variables */
  color: var(--tc-primary-color);
}
```