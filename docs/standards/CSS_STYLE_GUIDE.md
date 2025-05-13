# Guide de Style CSS TourCraft

*Document créé le: 4 mai 2025*  
*Dernière mise à jour: 5 mai 2025*

## Introduction

Ce document définit les standards et bonnes pratiques pour la stylisation CSS dans l'application TourCraft. Il sert de référence pour assurer une cohérence visuelle et une maintenabilité optimale du code CSS.

## Principes fondamentaux

1. **Utiliser des modules CSS** pour encapsuler les styles des composants
2. **Favoriser les variables CSS** pour toutes les valeurs réutilisables
3. **Suivre une convention de nommage cohérente**
4. **Concevoir de façon responsive dès le départ**
5. **Documenter les choix de style complexes**

## Variables CSS standardisées

### Préfixes

Toutes les variables CSS doivent utiliser le préfixe `--tc-` (TourCraft) suivi d'un identifiant descriptif:

```css
/* Correct */
--tc-color-primary: #1a73e8;
--tc-spacing-4: 16px;

/* Incorrect */
--bs-primary: #1a73e8; /* Préfixe non-standard */
--tc-bs-spacing-4: 16px; /* Double préfixe */
--color-primary: #1a73e8; /* Manque le préfixe tc */
```

### Catégories de variables

#### Couleurs

```css
/* Couleurs principales */
--tc-color-primary: #1a73e8;
--tc-color-primary-light: rgba(26, 115, 232, 0.1);
--tc-color-primary-dark: #0d47a1;

/* Couleurs secondaires */
--tc-color-secondary: #5f6368;
--tc-color-secondary-light: #e8eaed;
--tc-color-secondary-dark: #3c4043;

/* Couleurs d'état */
--tc-color-success: #34a853;
--tc-color-warning: #fbbc04;
--tc-color-error: #ea4335;
--tc-color-info: #4285f4;

/* Couleurs de fond */
--tc-bg-default: #ffffff;
--tc-bg-light: #f8f9fa;
--tc-bg-dark: #202124;
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

/* Graisse des polices */
--tc-font-weight-normal: 400;
--tc-font-weight-medium: 500;
--tc-font-weight-semibold: 600;
--tc-font-weight-bold: 700;

/* Familles de polices */
--tc-font-family-primary: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, sans-serif;
--tc-font-family-secondary: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, sans-serif;
```

#### Espacements

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
```

#### Bordures et coins arrondis

```css
/* Bordures */
--tc-border-light: #e0e0e0;
--tc-border-medium: #bdbdbd;
--tc-border-dark: #757575;

/* Rayons des bordures */
--tc-radius-sm: 2px;
--tc-radius-md: 4px;
--tc-radius-lg: 8px;
--tc-radius-xl: 12px;
--tc-radius-pill: 9999px;
```

#### Ombres

```css
/* Ombres */
--tc-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--tc-shadow-md: 0 2px 4px rgba(0, 0, 0, 0.1);
--tc-shadow-lg: 0 4px 8px rgba(0, 0, 0, 0.1);
--tc-shadow-xl: 0 8px 16px rgba(0, 0, 0, 0.1);
```

#### Transitions

```css
/* Transitions */
--tc-transition-fast: 150ms;
--tc-transition-normal: 250ms;
--tc-transition-slow: 350ms;
--tc-transition-timing: cubic-bezier(0.4, 0, 0.2, 1);
```

#### Points de rupture (media queries)

```css
/* Points de rupture - Approche mobile-first */
@media (min-width: 576px) { /* Petits appareils et plus */ }
@media (min-width: 768px) { /* Tablettes et plus */ }
@media (min-width: 992px) { /* Ordinateurs de bureau et plus */ }
@media (min-width: 1200px) { /* Grands écrans */ }
```

> ⚠️ **Important** : Nous suivons une approche mobile-first, donc utilisez `min-width` et non `max-width` pour les media queries. Les styles de base s'appliquent à tous les appareils, puis nous ajoutons des styles spécifiques pour les écrans plus grands.

## Modules CSS

### Structure des fichiers

Chaque composant React doit avoir son propre module CSS avec le même nom:

```
Button.js
Button.module.css
```

### Organisation interne des fichiers CSS

Organiser le contenu des fichiers CSS selon cet ordre:

1. Variables locales spécifiques au composant
2. Styles de base du composant
3. Variantes du composant
4. États (hover, active, disabled)
5. Media queries pour le responsive

### Exemple de structure avec commentaires

```css
/*
 * Styles pour Button
 * Standardisé selon le Guide de Style CSS de TourCraft
 * Dernière mise à jour: 5 mai 2025
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
  border-radius: var(--tc-radius-md);
  transition: background-color var(--tc-transition-fast) var(--tc-transition-timing);
}

/* Variantes */
.primary {
  background-color: var(--tc-color-primary);
  color: white;
}

.secondary {
  background-color: var(--tc-color-secondary-light);
  color: var(--tc-color-secondary-dark);
}

/* États */
.button:hover:not(:disabled) {
  opacity: 0.9;
}

.button:active:not(:disabled) {
  transform: translateY(1px);
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 576px) {
  .button {
    --button-height: 44px; /* Plus grand sur mobile pour faciliter l'appui */
    width: 100%; /* Pleine largeur sur mobile */
  }
}
```

## Convention de nommage

### BEM modifié pour React

Nous utilisons une convention de nommage inspirée de BEM mais adaptée aux modules CSS de React:

```css
/* Bloc */
.button { }

/* Élément */
.buttonIcon { } /* PascalCase pour les éléments plutôt que button__icon */

/* Modificateur */
.primary { } /* Classe de modificateur à combiner avec la classe de base */
```

### Éviter la spécificité excessive

Éviter d'imbriquer les sélecteurs trop profondément:

```css
/* Correct - Facile à surcharger */
.title {
  font-weight: var(--tc-font-weight-bold);
}

/* À éviter - Trop spécifique */
.card .header .title {
  font-weight: var(--tc-font-weight-bold);
}
```

## Responsive Design

### Mobile-first

Nous adoptons une approche "mobile-first" pour tous les composants:

```css
/* Styles de base (mobile) */
.container {
  padding: var(--tc-spacing-4);
}

/* Tablettes et plus grands */
@media (min-width: 768px) {
  .container {
    padding: var(--tc-spacing-8);
  }
}
```

> **Rappel** : Toujours commencer par le style pour mobile, puis ajouter des styles pour les écrans plus grands avec `min-width`, jamais avec `max-width`.

### Bonnes pratiques adaptatives pour mobile

- Augmenter la taille des zones cliquables (min 44×44px)
- Utiliser des boutons pleine largeur
- Simplifier les tableaux complexes
- Désactiver ou adapter les effets de survol
- Transformer les grilles en colonnes empilées

## Styles en ligne

### Éviter les styles en ligne

Les styles en ligne sont à éviter dans la mesure du possible:

```jsx
// À éviter
<div style={{ color: 'red', fontSize: '14px' }}>Texte</div>

// Préférer
<div className={styles.errorText}>Texte</div>
```

### Cas exceptionnels

Les styles en ligne sont acceptables uniquement pour:

- Styles dynamiques impossibles à décrire via des classes
- Styles générés par un utilisateur
- Animations ou transitions calculées dynamiquement

## Optimisation

### Éviter les sélecteurs globaux

Ne pas utiliser de sélecteurs globaux dans les modules CSS:

```css
/* À éviter */
:global(.external-class) {
  color: red;
}

/* Préférer créer un composant wrapper */
```

### Minimiser les calculs CSS

Éviter les calculs coûteux dans les propriétés CSS:

```css
/* À éviter */
.element {
  width: calc(100% - 20px - 20px - 10px);
}

/* Préférer */
.element {
  width: calc(100% - var(--total-margin));
  --total-margin: 50px;
}
```

## Bonnes pratiques établies durant la refactorisation

### Structure standard de composant

Suite à notre refactorisation CSS, nous avons établi une structure standard pour les composants les plus utilisés :

1. **En-tête documenté**
   ```css
   /*
    * Styles pour [Nom du composant]
    * Standardisé selon le Guide de Style CSS de TourCraft
    * Dernière mise à jour: [date]
    */
   ```

2. **Organisation des règles par fonction**
   - Variables et propriétés fondamentales
   - Organisation du layout (flex, grid)
   - Styles visuels (couleurs, typographie, bordures)
   - États interactifs (hover, focus, active)
   - Media queries pour la responsivité

3. **Support responsive structuré selon l'approche mobile-first**
   ```css
   /* Base styles (mobile-first) */
   .component { ... }
   
   /* Écrans moyens (tablettes) */
   @media (min-width: 768px) {
     .component { ... }
   }
   
   /* Grands écrans */
   @media (min-width: 992px) {
     .component { ... }
   }
   ```

### Techniques de migration établies

Lors de la refactorisation d'un composant CSS existant, suivre ces étapes:

1. Identifier et remplacer toutes les valeurs codées en dur par des variables CSS
2. Corriger les préfixes non-standards (--bs-*, --tc-tc-*, etc.)
3. Ajouter des fallbacks pour la rétrocompatibilité si nécessaire
4. Ajouter ou améliorer le support responsive
5. Documenter les sections complexes avec des commentaires
6. Valider visuellement le résultat final

## Accélération de la migration CSS

Notre script `prefix_css_vars.py` peut automatiser une partie de la migration:

```bash
# Usage
python prefix_css_vars.py path/to/file.module.css
```

Ce script:
- Identifie les valeurs codées en dur (couleurs, espacements)
- Suggère des variables CSS standardisées
- Corrige automatiquement les préfixes erronés

## Audit et validation

### Script d'audit

Le script `scripts/audit_css_standards.js` permet de vérifier la conformité des fichiers CSS:

```bash
node scripts/audit_css_standards.js
```

### Checklist de validation

Avant de soumettre une modification CSS, vérifiez:

- [ ] Toutes les valeurs codées en dur ont été remplacées par des variables CSS
- [ ] Le composant utilise des classes BEM modifiées
- [ ] Le composant est responsive sur mobile, tablette et desktop
- [ ] Les styles sont encapsulés via CSS Modules
- [ ] Les noms de classe suivent la convention de nommage
- [ ] Aucun style en ligne n'est utilisé sans justification
- [ ] Le code inclut des commentaires pour les sections complexes

## Exemples de composants standardisés

Suite à notre refactorisation, consultez ces exemples de composants correctement standardisés:

- `Button.module.css` - Composant UI de base
- `Card.module.css` - Composant UI de structure
- `ProgrammateurDetails.module.css` - Composant entité complexe
- `LieuForm.module.css` - Composant formulaire

---

*Ce document est évolutif et sera mis à jour au fur et à mesure de l'identification de nouveaux besoins ou bonnes pratiques.*