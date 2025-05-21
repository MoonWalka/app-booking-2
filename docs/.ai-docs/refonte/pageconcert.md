# Adaptation du header et correction des bordures

Je vois la différence entre votre version actuelle et la maquette. Voici les modifications nécessaires pour corriger les problèmes de bordure et adapter l'apparence du header.

## 1. Correction du problème de bordure dans le tableau

Le problème de bordure que vous avez remarqué peut être corrigé en modifiant le CSS du tableau. Voici les ajustements à apporter à `ConcertsTable.module.css` :

```css
.tableContainer {
  background-color: var(--tc-white);
  border-radius: var(--tc-border-radius-lg);
  border: 1px solid var(--tc-border-color);
  overflow: hidden;
  margin-top: var(--tc-spacing-md);
  /* Suppression de l'ombre pour correspondre à la maquette */
  box-shadow: none;
}

.concertsTable {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

/* Assure que toutes les cellules ont une bordure cohérente */
.concertsTable tbody td {
  border-bottom: 1px solid var(--tc-border-color);
}

/* Supprime la bordure de la dernière ligne */
.concertsTable tbody tr:last-child td {
  border-bottom: none;
}
```

## 2. Adaptation du header principal

Pour que le header ressemble à celui de la maquette, modifiez `ConcertsList.module.css` :

```css
.concertsContainer {
  width: 100%;
  margin: 0;
  padding: 20px 30px;
  background-color: var(--tc-light-color);
}

.sectionHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.sectionTitle {
  font-size: var(--tc-font-size-xl);
  font-weight: var(--tc-font-weight-bold);
  color: var(--tc-text-color-primary);
  margin: 0;
}
```

Assurez-vous que votre composant `ConcertsList.js` contient la structure suivante pour le header :

```jsx
<div className={styles.sectionHeader}>
  <h2 className={styles.sectionTitle}>Liste des concerts</h2>
  <Button 
    variant="primary" 
    onClick={handleAddConcert}
  >
    <i className="bi bi-plus-circle me-2"></i>
    Ajouter un concert
  </Button>
</div>
```

## 3. Amélioration des onglets de statut

Pour que les onglets de statut ressemblent à ceux de la maquette, modifiez `ConcertStatusTabs.module.css` :

```css
.statusTabs {
  display: flex;
  margin-bottom: var(--tc-spacing-md);
  overflow-x: auto;
  padding-bottom: 0;
}

.statusTab {
  padding: var(--tc-spacing-xs) var(--tc-spacing-sm);
  margin-right: var(--tc-spacing-sm);
  cursor: pointer;
  color: var(--tc-text-color-secondary);
  font-weight: var(--tc-font-weight-medium);
  white-space: nowrap;
  transition: var(--tc-transition);
  border-radius: var(--tc-border-radius-sm);
}

.statusTab:hover {
  background-color: var(--tc-white);
  color: var(--tc-secondary-color);
}

.statusTabActive {
  background-color: var(--tc-white);
  color: var(--tc-secondary-color);
  box-shadow: var(--tc-shadow-sm);
}

.statusCount {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: var(--tc-gray-200);
  color: var(--tc-text-color-secondary);
  border-radius: 12px;
  padding: 2px 8px;
  font-size: var(--tc-font-size-xs);
  margin-left: var(--tc-spacing-xs);
}
```

## 4. Amélioration de la barre de recherche

Pour que la barre de recherche corresponde à la maquette, modifiez `ConcertSearchBar.module.css` :

```css
.searchBox {
  display: flex;
  align-items: center;
  background-color: var(--tc-white);
  border: 1px solid var(--tc-border-color);
  border-radius: var(--tc-border-radius);
  padding: var(--tc-spacing-xs) var(--tc-spacing-sm);
  max-width: 300px;
}

.searchBox i {
  color: var(--tc-gray-500);
  margin-right: var(--tc-spacing-xs);
}

.searchBox input {
  border: none;
  outline: none;
  flex-grow: 1;
  padding: var(--tc-spacing-xs) 0;
  font-size: var(--tc-font-size-base);
  background-color: transparent;
}
```

Assurez-vous que votre composant `ConcertSearchBar.js` est structuré comme ceci :

```jsx
<div className={styles.searchBox}>
  <i className="bi bi-search"></i>
  <input
    type="text"
    placeholder="Rechercher un concert..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />
</div>
```

## 5. Adaptation des boutons d'action

Pour que les boutons d'action dans le tableau ressemblent à ceux de la maquette, créez ou modifiez `ActionButton.module.css` :

```css
.actionButton {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--tc-border-radius);
  transition: var(--tc-transition);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--tc-gray-600);
}

.actionButton:hover {
  background-color: var(--tc-gray-50);
}

.viewButton {
  color: var(--tc-secondary-color);
}

.viewButton:hover {
  background-color: rgba(var(--tc-secondary-color-rgb), 0.1);
}

.editButton {
  color: var(--tc-success-color);
}

.editButton:hover {
  background-color: rgba(var(--tc-success-color-rgb), 0.1);
}

.deleteButton {
  color: var(--tc-danger-color);
}

.deleteButton:hover {
  background-color: rgba(var(--tc-danger-color-rgb), 0.1);
}
```

Assurez-vous que votre composant `ActionButton.js` utilise ces classes :

```jsx
import React from 'react';
import styles from './ActionButton.module.css';

const ActionButton = ({ 
  icon, 
  variant, 
  onClick, 
  disabled = false,
  tooltip = ''
}) => {
  const getButtonClass = () => {
    let buttonClass = styles.actionButton;
    
    if (variant === 'view') buttonClass += ` ${styles.viewButton}`;
    else if (variant === 'edit') buttonClass += ` ${styles.editButton}`;
    else if (variant === 'delete') buttonClass += ` ${styles.deleteButton}`;
    
    return buttonClass;
  };

  return (
    <button 
      className={getButtonClass()}
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      type="button"
    >
      <i className={`bi bi-${icon}`}></i>
    </button>
  );
};

export default ActionButton;
```

## 6. Adaptation du bouton "Filtrer"

Pour que le bouton "Filtrer" corresponde à la maquette, ajoutez ce style à `ConcertsList.module.css` :

```css
.filterButton {
  display: flex;
  align-items: center;
  gap: var(--tc-spacing-xs);
  padding: var(--tc-spacing-xs) var(--tc-spacing-sm);
  background-color: var(--tc-white);
  border: 1px solid var(--tc-border-color);
  border-radius: var(--tc-border-radius);
  color: var(--tc-text-color-secondary);
  font-weight: var(--tc-font-weight-medium);
  cursor: pointer;
  transition: var(--tc-transition);
}

.filterButton:hover {
  background-color: var(--tc-gray-50);
}

.filterButton i {
  margin-right: var(--tc-spacing-xs);
}
```

## 7. Structure complète du conteneur de filtres

Pour organiser correctement la barre de recherche et le bouton de filtrage, modifiez `ConcertsList.module.css` :

```css
.filtersContainer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--tc-spacing-md);
}

.searchBoxWrapper {
  flex: 1;
  max-width: 300px;
}
```

Et utilisez cette structure dans `ConcertsList.js` :

```jsx
<div className={styles.filtersContainer}>
  <div className={styles.searchBoxWrapper}>
    <ConcertSearchBar 
      searchTerm={searchTerm} 
      setSearchTerm={setSearchTerm} 
    />
  </div>
  <button className={styles.filterButton}>
    <i className="bi bi-funnel"></i>
    Filtrer
  </button>
</div>
```

## 8. Vérifications finales

Après avoir implémenté ces modifications, assurez-vous de vérifier :

1. **Alignement des éléments** : Le titre "Liste des concerts" doit être à gauche et le bouton "Ajouter un concert" à droite.
2. **Style des onglets** : Les onglets doivent avoir un fond gris clair avec l'onglet actif en blanc.
3. **Bordures du tableau** : Vérifiez que les bordures du tableau sont cohérentes et que la dernière ligne n'a pas de bordure inférieure.
4. **Responsivité** : Testez sur différentes tailles d'écran pour vous assurer que tout s'affiche correctement.
5. **Icônes** : Assurez-vous que toutes les icônes s'affichent correctement.

Ces modifications devraient permettre à votre interface de ressembler davantage à la maquette tout en conservant toutes les fonctionnalités existantes et en respectant vos conventions CSS.