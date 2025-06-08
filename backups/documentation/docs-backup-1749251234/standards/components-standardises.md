# Standards pour les Composants Standardisés

*Dernière mise à jour: 15 mai 2025*

Ce document décrit les règles et standards à suivre pour l'utilisation des composants standardisés dans le projet TourCraft App Booking.

## Table des matières

1. [Composant Card](#composant-card)
2. [Règles ESLint](#règles-eslint)
3. [Processus de vérification](#processus-de-vérification)

## Composant Card

### Utilisation standard

Le composant Card standardisé est la seule implémentation de carte autorisée dans l'application. Il est situé dans :

```javascript
import Card from '@/components/ui/Card';
```

### Composant déprécié

L'ancien composant Card situé dans `src/components/common/ui/Card.js` est **déprécié** et ne doit plus être utilisé dans aucun nouveau développement. Il est maintenu uniquement pour des raisons de compatibilité et sera supprimé après le 15 août 2025.

```javascript
// ❌ NE PLUS UTILISER
import Card from '@/components/common/ui/Card';
import Card from '../../components/common/ui/Card';
```

### Documentation complète

Pour la documentation complète du composant Card standardisé, consultez [docs/components/Card.md](/docs/components/Card.md).

## Règles ESLint

### Restriction d'importation

Une règle ESLint a été mise en place pour empêcher l'importation de l'ancien composant Card :

```javascript
// .eslintrc.js
'no-restricted-imports': ['error', {
  paths: [{
    name: '../components/common/ui/Card',
    message: 'Ce composant est déprécié. Utilisez @/components/ui/Card à la place.'
  },
  // Autres chemins...
  ],
  patterns: [
    '**/components/common/ui/Card',
    '**/common/ui/Card'
  ]
}]
```

### Vérification du code

Pour vérifier que votre code est conforme à cette règle, exécutez :

```bash
npm run lint
```

Pour corriger automatiquement les problèmes qui peuvent l'être :

```bash
npm run lint:fix
```

### Messages d'erreur

Si vous tentez d'utiliser l'ancien composant Card, vous verrez une erreur ESLint comme celle-ci :

```
error: Ce composant est déprécié. Utilisez @/components/ui/Card à la place. Voir docs/components/Card.md pour plus d'informations. (no-restricted-imports)
```

## Processus de vérification

### Intégration continue

La vérification ESLint est exécutée automatiquement dans notre pipeline CI/CD. Tout code qui tente d'utiliser l'ancien composant Card sera rejeté.

### Vérification locale

Il est recommandé de configurer votre IDE pour montrer les erreurs ESLint en temps réel :

#### VSCode

1. Installer l'extension ESLint
2. Configurer `"eslint.validate": ["javascript", "javascriptreact"]` dans votre settings.json

#### WebStorm/IntelliJ

1. Aller dans Settings > Languages & Frameworks > JavaScript > Code Quality Tools > ESLint
2. Activer "Automatic ESLint configuration"

### Date de suppression prévue

L'ancien composant Card sera supprimé définitivement après le 15 août 2025, après une période de dépréciation de 3 mois.

## Questions fréquentes

### Pourquoi cette standardisation ?

La standardisation du composant Card permet :
- Une interface utilisateur cohérente
- Un support uniforme du mode édition
- Une maintenance simplifiée
- Une meilleure expérience développeur

### Que faire si j'ai besoin d'aide pour la migration ?

Si vous avez des questions sur la migration vers le composant Card standardisé :
1. Consultez la documentation dans `/docs/components/Card.md`
2. Utilisez le script d'audit `npm run audit:card` pour identifier les composants à migrer
3. Contactez l'équipe d'architecture si vous avez besoin d'assistance supplémentaire

---

Document maintenu par l'équipe TourCraft.