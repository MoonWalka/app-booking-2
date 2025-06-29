# Système de Preview Universel

Ce système permet d'afficher n'importe quel composant React directement dans l'inventaire sans modifier le composant lui-même.

## Architecture

### 1. PreviewWrapper
Le composant principal qui charge dynamiquement les composants selon l'URL.

**Route :** `/preview/component/:componentName`

**Exemple :** `/preview/component/ContactForm`

### 2. componentRegistry.js
Registre centralisé de tous les composants disponibles pour le preview.

## Comment ajouter un nouveau composant

1. Ouvrir `componentRegistry.js`
2. Ajouter une entrée dans l'objet `componentRegistry` :

```javascript
'NomDuComposant': {
  path: () => import('../chemin/vers/Composant'),
  category: 'Catégorie',
  description: 'Description du composant',
  defaultProps: {
    // Props par défaut pour le preview
    prop1: 'valeur1',
    prop2: 'valeur2'
  }
}
```

## Utilisation dans l'inventaire

1. Aller sur `/inventaire-pages`
2. Cliquer sur le bouton "Composants" en haut
3. Sélectionner un composant dans la liste
4. Le composant s'affiche dans l'iframe de preview

## Avantages

- ✅ Aucune modification nécessaire des composants existants
- ✅ Chargement dynamique (lazy loading)
- ✅ Props par défaut configurables
- ✅ Support des données mock
- ✅ Interface unifiée pour pages et composants
- ✅ Facile à maintenir et étendre

## Structure des fichiers

```
src/components/preview/
├── PreviewWrapper.js      # Composant principal
├── PreviewWrapper.css     # Styles
├── componentRegistry.js   # Registre des composants
└── README.md             # Documentation
```

## Exemples de composants supportés

- **Forms :** ArtisteForm, ContactForm, ConcertForm, etc.
- **Views :** ArtisteView, ContactView, ConcertView, etc.
- **Lists :** ArtistesList, ContactsList, ConcertsList, etc.
- **UI :** Button, Card, Table, Modal, etc.
- **Editors :** FactureEditor, DevisEditor, ContratGenerator, etc.

## Notes techniques

- Les imports dynamiques utilisent la syntaxe `import()`
- Les composants sont wrappés dans un `Suspense` pour gérer le chargement
- Les erreurs sont capturées et affichées de manière conviviale
- Les props par défaut permettent d'éviter les erreurs de props manquantes