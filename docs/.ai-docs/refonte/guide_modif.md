# Guide de Modifications pour Adapter le Layout TourCraft

Ce guide détaillé vous fournit les instructions précises pour adapter la disposition (layout) de votre application TourCraft afin qu'elle ressemble à la version map de référence. Pour chaque page prioritaire, vous trouverez les fichiers exacts à modifier et les changements à apporter.

## Table des matières
1. [Page Concerts](#page-concerts)
2. [Page Programmateurs](#page-programmateurs)
3. [Page Artistes](#page-artistes)
4. [Page Paramètres](#page-paramètres)

## Page Concerts

### Éléments déjà conformes
- La structure générale de la page est déjà bien organisée
- Le système de filtres et de recherche est bien positionné
- La pagination est correctement implémentée

### Modifications nécessaires

#### 1. Ajuster l'espacement du conteneur principal
**Fichier**: `/src/components/concerts/desktop/ConcertsList.module.css`

**Modification**:
```css
/* AVANT */
.concertsContainer {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--tc-spacing-md);
}

/* APRÈS */
.concertsContainer {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--tc-spacing-lg) var(--tc-spacing-md);
}
```

#### 2. Améliorer la mise en page du tableau des concerts
**Fichier**: `/src/components/concerts/sections/ConcertsTable.module.css`

**Modification**:
```css
/* AVANT */
.tableContainer {
  background-color: var(--tc-color-white);
  border-radius: var(--tc-border-radius);
  box-shadow: var(--tc-box-shadow));
  overflow: hidden;
}

/* APRÈS */
.tableContainer {
  background-color: var(--tc-color-white);
  border-radius: var(--tc-border-radius-lg);
  box-shadow: var(--tc-shadow-sm);
  overflow: hidden;
  margin-top: var(--tc-spacing-md);
}

/* AVANT */
.concertsTable th {
  background-color: var(--tc-color-gray-100);
  padding: var(--tc-spacing-sm) var(--tc-spacing-md);
  text-align: left;
  font-weight: var(--tc-font-weight-semibold);
  color: var(--tc-text-color-secondary);
  border-bottom: var(--tc-border-width) solid var(--tc-border-color);
}

/* APRÈS */
.concertsTable th {
  background-color: var(--tc-color-gray-50);
  padding: var(--tc-spacing-md) var(--tc-spacing-lg);
  text-align: left;
  font-weight: var(--tc-font-weight-semibold);
  color: var(--tc-text-color-secondary);
  border-bottom: var(--tc-border-width) solid var(--tc-border-color);
  font-size: var(--tc-font-size-sm);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
```

#### 3. Améliorer l'affichage des onglets de statut
**Fichier**: `/src/components/concerts/sections/ConcertStatusTabs.module.css`

**Modification**:
```css
/* AVANT (si le fichier existe) */
.statusTabs {
  /* styles existants */
}

/* APRÈS */
.statusTabs {
  display: flex;
  margin-bottom: var(--tc-spacing-md);
  border-bottom: 1px solid var(--tc-border-color);
  overflow-x: auto;
  padding-bottom: 0;
}

.statusTab {
  padding: var(--tc-spacing-sm) var(--tc-spacing-md);
  margin-right: var(--tc-spacing-sm);
  cursor: pointer;
  border-bottom: 3px solid transparent;
  color: var(--tc-text-color-secondary);
  font-weight: var(--tc-font-weight-medium);
  white-space: nowrap;
  transition: all 0.2s ease;
}

.statusTab:hover {
  color: var(--tc-primary-color);
}

.statusTabActive {
  border-bottom: 3px solid var(--tc-primary-color);
  color: var(--tc-primary-color);
  font-weight: var(--tc-font-weight-semibold);
}

.statusCount {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: var(--tc-color-gray-200);
  color: var(--tc-text-color-secondary);
  border-radius: 12px;
  padding: 2px 8px;
  font-size: var(--tc-font-size-xs);
  margin-left: var(--tc-spacing-xs);
}
```

## Page Programmateurs

### Éléments déjà conformes
- La structure générale avec filtres et tableau est bien organisée
- Le système de pagination est correctement implémenté

### Modifications nécessaires

#### 1. Améliorer la mise en page du conteneur principal
**Fichier**: `/src/components/programmateurs/desktop/ProgrammateursList.module.css`

**Modification**:
```css
/* AVANT */
.programmateurContainer {
  /* styles existants */
}

/* APRÈS */
.programmateurContainer {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--tc-spacing-lg) var(--tc-spacing-md);
}
```

#### 2. Améliorer la mise en page des cartes de programmateurs
**Fichier**: `/src/components/programmateurs/sections/ProgrammateurCard.module.css`

**Modification**:
```css
/* AVANT */
.card {
  /* styles existants */
}

/* APRÈS */
.card {
  border-radius: var(--tc-border-radius-lg);
  box-shadow: var(--tc-shadow-sm);
  border: 1px solid var(--tc-border-color);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: var(--tc-shadow-md);
}

.cardHeader {
  padding: var(--tc-spacing-md);
  border-bottom: 1px solid var(--tc-border-color);
  background-color: var(--tc-color-gray-50);
}

.cardBody {
  padding: var(--tc-spacing-md);
  flex-grow: 1;
}

.cardFooter {
  padding: var(--tc-spacing-md);
  border-top: 1px solid var(--tc-border-color);
  background-color: var(--tc-color-white);
  display: flex;
  justify-content: flex-end;
  gap: var(--tc-spacing-sm);
}
```

## Page Artistes

### Éléments déjà conformes
- La structure générale avec filtres et grille est bien organisée
- Le système de pagination est correctement implémenté

### Modifications nécessaires

#### 1. Améliorer la mise en page du conteneur principal
**Fichier**: `/src/components/artistes/desktop/ArtistesList.module.css`

**Modification**:
```css
/* AVANT */
.artistesContainer {
  /* styles existants */
}

/* APRÈS */
.artistesContainer {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--tc-spacing-lg) var(--tc-spacing-md);
}
```

#### 2. Améliorer la mise en page des cartes d'artistes
**Fichier**: `/src/components/artistes/desktop/ArtisteCard.module.css`

**Modification**:
```css
/* AVANT */
.card {
  /* styles existants */
}

/* APRÈS */
.card {
  border-radius: var(--tc-border-radius-lg);
  box-shadow: var(--tc-shadow-sm);
  border: 1px solid var(--tc-border-color);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: var(--tc-shadow-md);
}

.cardImage {
  height: 180px;
  overflow: hidden;
  position: relative;
}

.cardImage img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.card:hover .cardImage img {
  transform: scale(1.05);
}

.cardBody {
  padding: var(--tc-spacing-md);
  flex-grow: 1;
}

.cardTitle {
  font-size: var(--tc-font-size-lg);
  font-weight: var(--tc-font-weight-semibold);
  margin-bottom: var(--tc-spacing-xs);
  color: var(--tc-text-color-primary);
}

.cardSubtitle {
  font-size: var(--tc-font-size-sm);
  color: var(--tc-text-color-secondary);
  margin-bottom: var(--tc-spacing-sm);
}

.cardFooter {
  padding: var(--tc-spacing-md);
  border-top: 1px solid var(--tc-border-color);
  background-color: var(--tc-color-white);
  display: flex;
  justify-content: flex-end;
  gap: var(--tc-spacing-sm);
}
```

#### 3. Corriger les boutons dans la page détail artiste
**Fichier**: `/src/components/artistes/desktop/ArtisteDetail.module.css`

**Modification**:
```css
/* AVANT */
.backButton {
  /* styles existants */
}

.editBtn {
  /* styles existants */
}

/* APRÈS - SUPPRIMER ces styles personnalisés et les remplacer par l'utilisation du composant Button */
```

**Fichier**: `/src/components/artistes/desktop/ArtisteDetail.js`

**Modification**:
```jsx
// AVANT
<button className={styles.backButton} onClick={() => navigate('/artistes')}>
  <i className="bi bi-arrow-left"></i>
</button>

// APRÈS
<Button 
  variant="outline-secondary" 
  size="sm" 
  onClick={() => navigate('/artistes')}
  className="mb-3"
>
  <i className="bi bi-arrow-left me-2"></i>
  Retour
</Button>

// AVANT
<button className={styles.editBtn} onClick={handleEdit}>
  <i className="bi bi-pencil"></i> Modifier
</button>

// APRÈS
<Button 
  variant="primary" 
  onClick={handleEdit}
>
  <i className="bi bi-pencil me-2"></i> Modifier
</Button>
```

## Page Paramètres

### Éléments déjà conformes
- La structure générale avec onglets est bien organisée
- Les formulaires sont bien structurés

### Modifications nécessaires

#### 1. Améliorer la mise en page du conteneur principal
**Fichier**: `/src/components/parametres/Parametres.module.css`

**Modification**:
```css
/* AVANT */
.parametresContainer {
  /* styles existants */
}

/* APRÈS */
.parametresContainer {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--tc-spacing-lg) var(--tc-spacing-md);
}
```

#### 2. Améliorer la mise en page des onglets
**Fichier**: `/src/components/parametres/Parametres.module.css`

**Modification**:
```css
/* AVANT */
.tabsContainer {
  /* styles existants */
}

/* APRÈS */
.tabsContainer {
  display: flex;
  flex-wrap: wrap;
  gap: var(--tc-spacing-sm);
  margin-bottom: var(--tc-spacing-lg);
}

.tab {
  padding: var(--tc-spacing-sm) var(--tc-spacing-md);
  background-color: var(--tc-color-white);
  border: 1px solid var(--tc-border-color);
  border-radius: var(--tc-border-radius);
  color: var(--tc-text-color-secondary);
  font-weight: var(--tc-font-weight-medium);
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab:hover {
  background-color: var(--tc-color-gray-50);
}

.tabActive {
  background-color: var(--tc-primary-color);
  color: var(--tc-color-white);
  border-color: var(--tc-primary-color);
}

.tabContent {
  background-color: var(--tc-color-white);
  border-radius: var(--tc-border-radius-lg);
  box-shadow: var(--tc-shadow-sm);
  padding: var(--tc-spacing-lg);
  border: 1px solid var(--tc-border-color);
}
```

#### 3. Améliorer la mise en page des formulaires
**Fichier**: `/src/components/parametres/sections/EntrepriseForm.module.css`

**Modification**:
```css
/* AVANT */
.formGroup {
  /* styles existants */
}

/* APRÈS */
.formGroup {
  margin-bottom: var(--tc-spacing-md);
}

.formLabel {
  display: block;
  margin-bottom: var(--tc-spacing-xs);
  font-weight: var(--tc-font-weight-medium);
  color: var(--tc-text-color-primary);
}

.formControl {
  width: 100%;
  padding: var(--tc-spacing-sm);
  border: 1px solid var(--tc-border-color);
  border-radius: var(--tc-border-radius);
  font-size: var(--tc-font-size-base);
  transition: border-color 0.2s ease;
}

.formControl:focus {
  border-color: var(--tc-primary-color);
  outline: none;
  box-shadow: 0 0 0 3px rgba(var(--tc-primary-color-rgb), 0.2);
}

.formRow {
  display: flex;
  flex-wrap: wrap;
  gap: var(--tc-spacing-md);
  margin-bottom: var(--tc-spacing-md);
}

.formCol {
  flex: 1;
  min-width: 250px;
}
```

## Recommandations générales

1. **Standardisation des conteneurs principaux**:
   - Tous les conteneurs principaux des pages devraient avoir la même structure:
   ```css
   .pageContainer {
     max-width: 1400px;
     margin: 0 auto;
     padding: var(--tc-spacing-lg) var(--tc-spacing-md);
   }
   ```

2. **Utilisation cohérente des composants UI**:
   - Remplacer tous les boutons personnalisés par le composant `Button` standardisé
   - Utiliser les mêmes styles de carte pour tous les éléments similaires

3. **Espacement cohérent**:
   - Utiliser les variables d'espacement (`--tc-spacing-*`) de manière cohérente
   - Maintenir des marges et paddings similaires entre les sections

4. **Ombres et bordures**:
   - Utiliser les mêmes styles d'ombre et de bordure pour les éléments similaires
   - Préférer `var(--tc-shadow-sm)` pour les cartes et conteneurs

5. **Responsive design**:
   - S'assurer que toutes les pages ont des media queries cohérentes
   - Utiliser les mêmes points de rupture partout

Ces modifications vous permettront d'obtenir une disposition très proche de la référence map tout en minimisant les changements structurels dans votre application.
