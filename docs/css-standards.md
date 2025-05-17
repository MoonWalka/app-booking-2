# Guide de standardisation CSS TourCraft

Ce document détaille les standards CSS à suivre pour toutes les modifications et nouvelles fonctionnalités de l'application TourCraft. Ces standards assurent une cohérence visuelle, une réduction des doublons, et une meilleure maintenabilité.

## Système de variables

### Préfixe
Toutes les variables CSS doivent utiliser le préfixe `--tc-` pour éviter les conflits avec les bibliothèques tierces.

### Couleurs
Utiliser les variables de couleur plutôt que les valeurs hexadécimales ou RGB codées en dur :

```css
/* À éviter */
color: #0d6efd;
background-color: rgba(0, 0, 0, 0.1);

/* Recommandé */
color: var(--tc-primary-color);
background-color: var(--tc-overlay-dark-10);
```

### Variables de couleur standard

| Variable | Valeur par défaut | Usage |
|----------|------------------|-------|
| `--tc-primary-color` | `#0d6efd` | Actions principales, boutons primaires |
| `--tc-secondary-color` | `#6c757d` | Actions secondaires, texte secondaire |
| `--tc-success-color` | `#28a745` | Messages de succès, validations |
| `--tc-danger-color` | `#dc3545` | Erreurs, alertes, suppression |
| `--tc-warning-color` | `#ffc107` | Avertissements, attention |
| `--tc-info-color` | `#17a2b8` | Informations, conseils |
| `--tc-light-color` | `#f8f9fa` | Arrière-plans clairs |
| `--tc-dark-color` | `#343a40` | Texte principal, en-têtes |

### Espacement et tailles
Utiliser les variables d'espacement plutôt que des valeurs en pixels ou rem :

```css
/* À éviter */
margin: 8px;
padding: 1rem;

/* Recommandé */
margin: var(--tc-spacing-md);
padding: var(--tc-spacing-lg);
```

### Variables d'espacement standard

| Variable | Valeur par défaut | Équivalent |
|----------|------------------|------------|
| `--tc-spacing-xs` | `0.125rem` | 2px |
| `--tc-spacing-sm` | `0.25rem` | 4px |
| `--tc-spacing-md` | `0.5rem` | 8px |
| `--tc-spacing-lg` | `1rem` | 16px |
| `--tc-spacing-xl` | `1.5rem` | 24px |
| `--tc-spacing-xxl` | `2rem` | 32px |

### Typographie
Utiliser les variables de typographie pour la taille, le poids et la ligne des textes :

```css
/* À éviter */
font-size: 1.25rem;
font-weight: 700;

/* Recommandé */
font-size: var(--tc-font-size-lg);
font-weight: var(--tc-font-weight-bold);
```

### Variables de typographie standard

| Variable | Valeur par défaut | Usage |
|----------|------------------|-------|
| `--tc-font-size-xs` | `0.75rem` | Petit texte, notes |
| `--tc-font-size-sm` | `0.875rem` | Texte secondaire |
| `--tc-font-size-md` | `1rem` | Texte principal |
| `--tc-font-size-lg` | `1.25rem` | Sous-titres |
| `--tc-font-size-xl` | `1.5rem` | Titres de section |
| `--tc-font-size-xxl` | `2rem` | Titres principaux |

## Media Queries et Responsive Design

### Breakpoints standards
Utiliser les breakpoints standard de TourCraft pour la conception responsive :

```css
/* À éviter */
@media (max-width: 768px) { ... }

/* Recommandé */
@media (max-width: var(--tc-breakpoint-md)) { ... }
```

### Variables de breakpoints standard

| Variable | Valeur | Description |
|----------|--------|-------------|
| `--tc-breakpoint-xs` | `576px` | Téléphones en mode portrait |
| `--tc-breakpoint-sm` | `768px` | Téléphones en mode paysage et petites tablettes |
| `--tc-breakpoint-md` | `992px` | Tablettes en mode paysage |
| `--tc-breakpoint-lg` | `1200px` | Petits ordinateurs portables et ordinateurs de bureau |
| `--tc-breakpoint-xl` | `1400px` | Grands écrans et moniteurs HD |

## Composants UI

### Boutons
Utiliser les classes de bouton TourCraft au lieu des classes Bootstrap :

```html
<!-- À éviter -->
<button class="btn btn-primary">Enregistrer</button>

<!-- Recommandé -->
<button class="tc-btn tc-btn-primary">Enregistrer</button>
```

### Cartes
Utiliser le composant Card de TourCraft plutôt que les classes Bootstrap :

```jsx
// À éviter
<div className="card">
  <div className="card-body">Contenu</div>
</div>

// Recommandé
<Card>
  <Card.Body>Contenu</Card.Body>
</Card>
```

### Autres composants
Se référer à la bibliothèque de composants UI TourCraft pour tous les éléments d'interface courants.

## Bonnes pratiques

### Sélecteurs CSS
- Éviter les sélecteurs trop spécifiques qui augmentent la spécificité
- Utiliser des classes plutôt que des sélecteurs d'éléments
- Limiter l'imbrication des sélecteurs à 3 niveaux maximum

### Optimisation
- Regrouper les propriétés similaires
- Utiliser les utilitaires CSS existants plutôt que de créer des styles dupliqués
- Éviter les !important sauf pour les classes utilitaires

### Structure des fichiers
- Les fichiers CSS spécifiques aux composants doivent utiliser l'extension `.module.css`
- Les utilitaires globaux doivent être dans le dossier `/src/styles/utils`
- Les variables globales doivent être dans `/src/styles/variables.css`

## Processus de correction

### Priorisation
1. Composants UI partagés
2. Composants avec le plus grand nombre de problèmes
3. Composants les plus utilisés dans l'application

### Étapes
1. Identifier les valeurs codées en dur avec les outils d'audit
2. Remplacer par les variables standard TourCraft
3. Vérifier visuellement dans l'environnement de test
4. Valider avec l'équipe de design

## Ressources

- [Environnement de test CSS](/test-style)
- [Audit CSS complet](css_audit_report.md)
- [Plan de migration des composants](card_migration_plan.md)