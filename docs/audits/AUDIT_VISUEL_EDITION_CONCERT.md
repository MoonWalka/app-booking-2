# Audit visuel de la page d'édition de concert

## Date : 30 décembre 2024

## Problèmes identifiés

### 1. **Hiérarchie visuelle faible**
- Les cartes se ressemblent toutes (même fond gris clair)
- Pas de distinction claire entre les sections obligatoires et optionnelles
- Les titres de sections manquent de contraste

### 2. **Espacement incohérent**
- `margin-bottom` variable entre les cartes (space-4 vs space-6)
- Padding interne des cartes parfois trop important
- Les boutons d'action en haut manquent d'alignement

### 3. **Couleurs ternes**
- Trop de gris (gray-100, gray-200)
- Les icônes sont toutes de la même couleur primaire
- Manque de couleurs pour guider l'œil

### 4. **Feedback visuel insuffisant**
- Les champs obligatoires ne sont pas assez visibles
- Les sections sélectionnées (lieu, artiste) manquent de distinction
- Pas d'indication visuelle de progression dans le formulaire

## Recommandations d'amélioration

### 1. **Améliorer la hiérarchie visuelle**

```css
/* Cartes avec fond blanc et bordures subtiles */
.formCard {
  background-color: var(--tc-color-white);
  border: 1px solid var(--tc-color-gray-200);
  box-shadow: var(--tc-shadow-sm);
}

/* Headers colorés selon l'importance */
.cardHeader {
  background-color: var(--tc-color-gray-50); /* Plus subtil */
  border-bottom: 2px solid transparent;
}

/* Section obligatoire */
.cardHeader.required {
  border-bottom-color: var(--tc-color-primary);
}

/* Icônes colorées par type */
.cardHeader.lieu i { color: var(--tc-color-info); }
.cardHeader.artiste i { color: var(--tc-color-artiste); }
.cardHeader.programmateur i { color: var(--tc-color-programmateur); }
```

### 2. **Espacement cohérent**

```css
/* Espacement uniforme entre cartes */
.formCard {
  margin-bottom: var(--tc-space-4); /* Uniforme */
}

/* Padding réduit pour plus de compacité */
.cardBody {
  padding: var(--tc-space-4); /* Au lieu de space-6 */
}

/* Alignement des boutons d'action */
.actionButtons {
  padding: var(--tc-space-3) 0;
  border-bottom: 1px solid var(--tc-color-gray-200);
}
```

### 3. **Palette de couleurs améliorée**

```css
/* États de sélection avec couleurs douces */
.selectedEntity {
  background-color: var(--tc-color-gray-50);
  border: 2px solid var(--tc-color-primary-light);
  border-radius: var(--tc-radius-md);
}

/* Hover states plus visibles */
.formCard:hover {
  box-shadow: var(--tc-shadow-md);
  transition: box-shadow 0.2s ease;
}

/* Focus states améliorés */
.formControl:focus {
  border-color: var(--tc-color-primary);
  box-shadow: 0 0 0 3px rgba(33, 53, 71, 0.1);
}
```

### 4. **Indicateurs visuels améliorés**

```css
/* Badge pour les champs obligatoires */
.requiredBadge {
  display: inline-block;
  background-color: var(--tc-color-error-light);
  color: var(--tc-color-error-dark);
  font-size: var(--tc-font-size-xs);
  padding: 2px 6px;
  border-radius: var(--tc-radius-sm);
  margin-left: var(--tc-space-2);
}

/* Indicateur de progression */
.progressIndicator {
  display: flex;
  gap: var(--tc-space-2);
  margin-bottom: var(--tc-space-4);
}

.progressStep {
  flex: 1;
  height: 4px;
  background-color: var(--tc-color-gray-200);
  border-radius: var(--tc-radius-full);
}

.progressStep.completed {
  background-color: var(--tc-color-success);
}
```

### 5. **Micro-interactions**

```css
/* Transitions douces */
.formCard {
  transition: all 0.2s ease;
}

/* Animation de sélection */
@keyframes selectPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
}

.selectedEntity {
  animation: selectPulse 0.3s ease;
}
```

## Plan d'implémentation

1. **Phase 1** : Améliorer les couleurs et contrastes
   - Fond blanc pour les cartes
   - Headers plus subtils
   - Icônes colorées

2. **Phase 2** : Uniformiser l'espacement
   - Marges cohérentes
   - Padding optimisé
   - Alignement des éléments

3. **Phase 3** : Ajouter des indicateurs visuels
   - Badges obligatoires
   - États de sélection
   - Feedback de focus

4. **Phase 4** : Micro-interactions
   - Transitions hover
   - Animations subtiles
   - États de chargement améliorés

## Résultat attendu

- Interface plus moderne et aérée
- Meilleure lisibilité et hiérarchie
- Expérience utilisateur plus fluide
- Respect total du guide CSS TourCraft 