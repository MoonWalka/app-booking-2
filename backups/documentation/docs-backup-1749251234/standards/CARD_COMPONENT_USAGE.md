# Guide d'utilisation du composant Card standardisé

*Date de création: 12 mai 2025*

## Introduction

Ce document décrit l'utilisation du composant `Card` standardisé dans le projet TourCraft. Ce composant fait partie de notre stratégie de standardisation UI/UX et doit être utilisé pour toutes les nouvelles implémentations de cartes, ainsi que pour la migration progressive des implémentations existantes.

## Pourquoi standardiser ?

Notre audit CSS a révélé que les cards et cardHeaders étaient implémentés de plus de 15 façons différentes dans le projet, créant des incohérences visuelles et rendant la maintenance difficile. En utilisant un composant standardisé, nous obtenons :

- **Cohérence visuelle** à travers l'application
- **Réduction du code CSS** dupliqué
- **Maintenance simplifiée** (les changements sont appliqués partout)
- **Développement plus rapide** de nouvelles fonctionnalités

## API du composant Card

```jsx
<Card
  title="Titre de la carte"              // Texte du titre
  icon={<i className="bi bi-..."></i>}   // Icône (Bootstrap Icons ou autre)
  className="classe-personnalisée"       // Classes additionnelles
  isEditing={false}                      // Mode édition (bordure en pointillé)
  isHoverable={true}                     // Animation au survol
  variant="primary"                      // Variante: primary, success, warning, danger, info
  headerActions={<ButtonGroup />}        // Boutons/actions dans l'en-tête
  footerContent={<div>Footer</div>}      // Contenu optionnel de pied de carte
  onClick={handleClick}                  // Fonction de clic (optionnel)
>
  Contenu de la carte
</Card>
```

## Types de cards courants

### 1. Card de visualisation (read-only)

```jsx
<Card
  title="Informations générales"
  icon={<i className="bi bi-info-circle"></i>}
  className={styles.customCard}
>
  <p>Contenu en lecture seule</p>
</Card>
```

### 2. Card de formulaire

```jsx
<Card
  title="Édition des informations"
  icon={<i className="bi bi-pencil"></i>}
  isEditing={true}
>
  <Form>
    <Form.Group>
      <Form.Label>Nom</Form.Label>
      <Form.Control type="text" />
    </Form.Group>
    {/* Autres champs */}
  </Form>
</Card>
```

### 3. Card avec actions

```jsx
<Card
  title="Actions disponibles"
  headerActions={
    <ButtonGroup>
      <Button variant="outline-primary" size="sm">
        <i className="bi bi-pencil"></i>
      </Button>
      <Button variant="outline-danger" size="sm">
        <i className="bi bi-trash"></i>
      </Button>
    </ButtonGroup>
  }
>
  <p>Contenu de la carte</p>
</Card>
```

### 4. Card avec variante

```jsx
<Card
  title="Information importante"
  variant="warning"
  icon={<i className="bi bi-exclamation-triangle"></i>}
>
  <p>Ce message nécessite votre attention.</p>
</Card>
```

### 5. Card avec pied de page

```jsx
<Card
  title="Résumé"
  footerContent={
    <div className="d-flex justify-content-between">
      <span>Total:</span>
      <strong>1250€</strong>
    </div>
  }
>
  <p>Détails des éléments...</p>
</Card>
```

## Guidelines CSS

### Classes de style extérieures

Le composant Card expose automatiquement les classes CSS suivantes pour le styling global :

- `.tc-card` - Sur l'élément racine de la carte
- `.tc-card-header` - Sur l'en-tête de la carte
- `.tc-card-body` - Sur le corps de la carte
- `.tc-card-footer` - Sur le pied de la carte
- `.tc-card-hover` - Appliquée lorsque `isHoverable` est `true`
- `.tc-card-{variant}` - Appliquée lorsqu'une variante est spécifiée

### Styling des éléments internes

Pour modifier le style des éléments intérieurs de la carte, vous pouvez :

1. Utiliser la prop `className` pour ajouter des classes CSS au conteneur principal
2. Utiliser des sélecteurs CSS pour cibler les éléments intérieurs :

```css
/* Exemple de styling pour l'intérieur d'une carte */
.myCustomCard :global(.card-title) {
  font-size: 1.2rem;
  color: var(--tc-primary-color);
}
```

## Exemples d'implémentation

### Avant / Après

#### Avant la standardisation

```jsx
<div className={styles.formCard}>
  <div className={styles.cardHeader}>
    <i className="bi bi-info-circle"></i>
    <h3>Informations de base</h3>
  </div>
  <div className={styles.cardBody}>
    {/* Contenu */}
  </div>
</div>
```

#### Après la standardisation

```jsx
<Card
  title="Informations de base"
  icon={<i className="bi bi-info-circle"></i>}
  className={styles.structureFormCard}
>
  {/* Contenu */}
</Card>
```

## Bonnes pratiques

1. **Toujours utiliser le composant Card** pour les nouvelles fonctionnalités
2. **Éviter de recréer** des styles de cartes personnalisés
3. **Utiliser les variantes** prédéfinies plutôt que des couleurs personnalisées
4. **Garder une hiérarchie claire** : ne pas imbriquer de cartes à l'intérieur d'autres cartes
5. **Maintenir la cohérence** dans l'utilisation des icônes et des intitulés

## Plan de migration

Pour les composants existants, suivre le plan de migration:

1. Identifier les composants qui utilisent des cards personnalisées
2. Prioriser les sections les plus visibles de l'application
3. Remplacer progressivement les implémentations personnalisées
4. Exécuter régulièrement le script `scripts/migration/migrate_cards.js` pour suivre la progression

---

Pour toute question ou suggestion concernant ce composant, contactez l'équipe UI/UX de TourCraft.