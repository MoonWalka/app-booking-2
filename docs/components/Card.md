# Composant Card

*Dernière mise à jour : 15 mai 2025*

## Vue d'ensemble

Le composant Card est un élément d'interface utilisateur standardisé pour afficher du contenu dans un conteneur distinct avec une structure claire. Il est utilisé dans toute l'application TourCraft pour maintenir une cohérence visuelle et fonctionnelle.

## Importation

```javascript
import Card from '@/components/ui/Card';
```

## Utilisation de base

```jsx
<Card
  title="Titre de la carte"
  variant="primary"
>
  Contenu de la carte
</Card>
```

## Props disponibles

| Prop | Type | Valeurs possibles | Par défaut | Description |
|------|------|------------------|------------|-------------|
| `title` | String/Node | - | - | Titre affiché dans l'en-tête de la carte |
| `variant` | String | 'default', 'primary', 'secondary', 'success', 'danger', 'warning', 'info' | 'default' | Style visuel de la carte |
| `elevation` | String | 'none', 'low', 'medium', 'high' | 'medium' | Niveau d'élévation (ombre) |
| `className` | String | - | - | Classes CSS additionnelles |
| `onClick` | Function | - | - | Handler pour les événements de clic |
| `header` | Node | - | - | Contenu personnalisé pour l'en-tête (alternative à `title`) |
| `footer` | Node | - | - | Contenu du pied de carte |
| `action` | Node | - | - | Contenu d'action dans l'en-tête (ex: boutons) |
| `editable` | Boolean | true, false | false | Active le mode édition (si applicable) |

## Exemples d'utilisation

### Carte simple avec titre
```jsx
<Card title="Informations du contact">
  <p>Nom: John Doe</p>
  <p>Email: john@example.com</p>
</Card>
```

### Carte avec variante et élévation
```jsx
<Card 
  title="Alerte de sécurité"
  variant="danger"
  elevation="high"
>
  Votre mot de passe expirera dans 3 jours.
</Card>
```

### Carte avec actions
```jsx
<Card 
  title="Détails de l'événement"
  action={<Button variant="primary">Modifier</Button>}
>
  <p>Festival de Jazz - 20 juin 2025</p>
</Card>
```

### Carte avec pied de page
```jsx
<Card 
  title="Statistiques mensuelles"
  footer={<small className="text-muted">Dernière mise à jour: 15 mai 2025</small>}
>
  <p>Ventes totales: 45 000 €</p>
</Card>
```

### Carte sans titre avec en-tête personnalisé
```jsx
<Card 
  header={
    <div className="d-flex justify-content-between align-items-center">
      <span>Notifications</span>
      <Badge variant="danger">3</Badge>
    </div>
  }
>
  <ul className="list-group list-group-flush">
    <li className="list-group-item">Nouveau message de Thomas</li>
    <li className="list-group-item">Mise à jour disponible</li>
    <li className="list-group-item">Rappel: Réunion à 14h</li>
  </ul>
</Card>
```

## Mode édition

Le composant Card prend en charge un mode édition qui permet aux utilisateurs de modifier son contenu directement. Pour l'activer :

```jsx
<Card 
  title="Profil"
  editable={true}
  onEdit={(content) => handleContentUpdate(content)}
>
  <p>Nom: John Doe</p>
  <p>Rôle: Administrateur</p>
</Card>
```

## Styles personnalisés

Les styles du composant Card peuvent être personnalisés grâce aux variables CSS suivantes :

```css
:root {
  --card-border-radius: 0.5rem;
  --card-padding: 1.25rem;
  --card-header-bg: var(--white);
  --card-body-padding: var(--spacer);
  --card-footer-bg: var(--light);
  --card-shadow-low: 0 2px 4px rgba(0, 0, 0, 0.05);
  --card-shadow-medium: 0 4px 6px rgba(0, 0, 0, 0.1);
  --card-shadow-high: 0 8px 16px rgba(0, 0, 0, 0.15);
}
```

## Bonnes pratiques

1. **Favoriser la concision** : Les cartes sont destinées à présenter des informations ciblées de manière concise.

2. **Utiliser les variantes appropriées** :
   - `primary` pour les informations principales ou les actions importantes
   - `warning` pour les alertes modérées ou notifications
   - `danger` pour les erreurs ou alertes critiques

3. **Structurer le contenu** : Utiliser des listes, des paragraphes et d'autres éléments HTML pour structurer clairement le contenu.

4. **Éviter la surcharge** : Ne pas surcharger une carte avec trop d'informations ou de fonctionnalités.

## Accessibilité

Le composant Card est conçu avec les considérations d'accessibilité suivantes :

- Les contrastes de couleurs respectent les normes WCAG 2.1 AA
- La navigation au clavier est prise en charge
- Les attributs ARIA appropriés sont utilisés lorsque nécessaire
- Les titres de carte sont présentés en utilisant une hiérarchie sémantique adéquate

## Notes de migration

En mai 2025, tous les composants ont été migrés vers cette implémentation standardisée du Card. L'ancien composant Card (`@/components/common/ui/Card`) a été déprécié puis supprimé.

## Voir aussi

- [Documentation sur les standards des composants](/docs/standards/components-standardises.md)
- [Rapport de migration du composant Card](/card_migration_report.md)
- [Guide de style TourCraft](/docs/css/style-guide.md)
- [Composant Button](/docs/components/Button.md)
