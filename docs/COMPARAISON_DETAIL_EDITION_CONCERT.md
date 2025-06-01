# Comparaison Visuelle : Page Détail vs Page Édition de Concert

## 📊 Tableau de Comparaison Rapide

| Élément | Page Détail (ConcertView) | Page Édition (ConcertForm) | État |
|---------|---------------------------|----------------------------|------|
| **Container principal** | `.concertViewContainer` | `.deskConcertFormContainer` | ✅ Identique |
| **Fond** | `var(--tc-bg-white)` | `var(--tc-bg-white)` | ✅ Identique |
| **Bordure** | `1px solid var(--tc-border-light)` | `1px solid var(--tc-border-light)` | ✅ Identique |
| **Border-radius** | `var(--tc-radius-base)` | `var(--tc-radius-base)` | ✅ Identique |
| **Ombre** | `var(--tc-shadow-base)` | `var(--tc-shadow-base)` | ✅ Identique |
| **Padding** | `var(--tc-space-4)` | `var(--tc-space-4)` | ✅ Identique |
| **Largeur** | `calc(100% - var(--tc-space-8))` | `calc(100% - var(--tc-space-8))` | ✅ Identique |

## 🎨 Headers des Sections

### Page Détail
```html
<div class="card-header">
  <i class="bi bi-info-circle"></i>
  <h3>Informations générales</h3>
</div>
```

### Page Édition  
```html
<div class="Card_cardHeader__6vbKg lieu required tc-card-header">
  <div class="Card_headerTitleSection__0zk0n">
    <span class="Card_cardIcon__oCTiv"><i class="bi bi-geo-alt"></i></span>
    <h3 class="Card_cardTitle__DQBdL">Lieu(x)</h3>
  </div>
</div>
```

### Styles Appliqués (Harmonisés)
```css
/* Variables globales utilisées par les deux pages */
--tc-card-header-bg-color: var(--tc-color-primary-50);  /* Fond bleu clair */
--tc-card-header-text: var(--tc-color-primary-700);     /* Texte bleu foncé */

/* Headers avec fond bleu */
.card-header, .cardHeader {
  background-color: var(--tc-color-primary-50);
  padding: var(--tc-space-4);
  border-bottom: 1px solid var(--tc-color-primary-100);
}

/* Sections obligatoires */
.required.cardHeader {
  background-color: var(--tc-color-primary-100);
  border-bottom: 2px solid var(--tc-color-primary-400);
}
```

## 🎯 Couleurs des Icônes

| Type de Section | Couleur | Variable CSS |
|-----------------|---------|--------------|
| Lieu | Bleu info | `var(--tc-color-info-600)` |
| Artiste | Violet secondaire | `var(--tc-color-secondary-600)` |
| Programmateur | Bleu primaire | `var(--tc-color-primary-600)` |
| Infos générales | Vert succès | `var(--tc-color-success-600)` |
| Notes | Orange warning | `var(--tc-color-warning-600)` |

## 📝 Différences Structurelles

### 1. **Composants Utilisés**
- **Page Détail** : Utilise des `<div>` simples avec classes globales
- **Page Édition** : Utilise le composant `Card` avec CSS modules

### 2. **Mode d'Affichage**
- **Page Détail** : Mode lecture avec possibilité de basculer en édition
- **Page Édition** : Toujours en mode édition avec champs de formulaire

### 3. **Interactions**
- **Page Détail** : 
  - Liens cliquables vers entités (lieu, programmateur, etc.)
  - Bouton flottant d'édition rapide
  - Affichage statique des informations

- **Page Édition** :
  - Champs de saisie interactifs
  - Dropdowns de recherche
  - Validation en temps réel
  - Boutons de sauvegarde/annulation

## 🔧 Styles Spécifiques

### Page Détail - Éléments Uniques
```css
/* Bouton d'édition flottant */
.quickEditButton {
  position: fixed;
  bottom: var(--tc-space-8);
  right: var(--tc-space-8);
  background: linear-gradient(135deg, var(--tc-color-primary), var(--tc-color-primary-dark));
}

/* Liens vers entités */
.contact-link, .artiste-link {
  color: var(--tc-color-primary);
  text-decoration: none;
}

/* Notes en lecture seule */
.notes-content {
  background-color: var(--tc-bg-subtle);
  border: 1px solid var(--tc-border-light);
  white-space: pre-line;
}
```

### Page Édition - Éléments Uniques
```css
/* Champs de formulaire */
.formControl {
  padding: var(--tc-space-3);
  border: 1px solid var(--tc-color-gray-300);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
}

.formControl:hover {
  border-color: var(--tc-color-primary-300);
  background-color: var(--tc-color-gray-50);
}

.formControl:focus {
  border-color: var(--tc-color-primary);
  box-shadow: 0 0 0 3px rgba(33, 53, 71, 0.1), inset 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* Labels de formulaire */
.formLabel {
  font-weight: var(--tc-font-weight-semibold);
  color: var(--tc-color-primary-700);
  letter-spacing: 0.025em;
}

/* Sélection d'entités */
.selectedLieu, .selectedProgrammateur, .selectedArtiste {
  background-color: var(--tc-bg-subtle);
  border: 1px solid var(--tc-border-light);
  animation: selectPulse 0.3s ease;
}
```

## ✅ Éléments Parfaitement Harmonisés

1. **Container principal** : Même apparence (fond blanc, bordure, ombre)
2. **Headers de sections** : Fond bleu clair, même padding, même typographie
3. **Titres** : Taille 2XL, couleur primaire
4. **Icônes** : Couleurs harmonisées par type de section
5. **Espacements** : Utilisation cohérente des variables d'espacement
6. **Responsive** : Mêmes breakpoints et comportements mobiles

## 🎯 Conclusion

L'harmonisation visuelle entre les pages de détail et d'édition est **excellente** :
- ✅ Couleurs identiques (fond bleu pour headers)
- ✅ Typographie cohérente (h3 pour les titres)
- ✅ Espacements uniformes
- ✅ Styles de container identiques
- ✅ Icônes avec couleurs harmonisées

Les différences restantes sont **fonctionnelles et justifiées** :
- Mode lecture vs mode édition
- Éléments interactifs vs statiques
- Animations spécifiques aux formulaires