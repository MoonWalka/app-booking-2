# Guide d'importation des composants UI TourCraft

## Mise à jour du 20 mai 2025

Ce guide explique les conventions d'importation à utiliser pour les composants UI dans le projet TourCraft.

## Problème résolu

Plusieurs composants utilisaient l'alias d'importation `@ui/...` qui n'était pas correctement configuré dans le projet, causant des erreurs comme:

```
ERROR in Module not found: Error: Can't resolve '@ui/Card' in '...'
ERROR in Module not found: Error: Can't resolve '@ui/Button' in '...'
```

## Solution implémentée

Nous avons standardisé les importations selon les règles suivantes:

### 1. Composants UI personnalisés TourCraft

Importer depuis le chemin complet avec l'alias `@components`:

```javascript
// ✅ CORRECT
import Card from '@components/ui/Card';
import Button from '@components/ui/Button';
import ErrorMessage from '@components/ui/ErrorMessage';
```

```javascript
// ❌ INCORRECT (ne fonctionne pas)
import Card from '@ui/Card';
import Button from '@ui/Button';
```

### 2. Composants de formulaire

Utiliser les composants de React Bootstrap pour les formulaires:

```javascript
// ✅ CORRECT
import { Form, Row, Col } from 'react-bootstrap';

// Puis utiliser comme:
<Form.Group>
  <Form.Label>...</Form.Label>
  <Form.Control type="text" />
  <Form.Text>...</Form.Text>
</Form.Group>
```

```javascript
// ❌ INCORRECT (ne fonctionne pas)
import FormGroup from '@ui/FormGroup';
import FormLabel from '@ui/FormLabel';
import FormControl from '@ui/FormControl';
```

### 3. Alias configurés dans le projet

Les alias suivants sont correctement configurés dans `craco.config.js`:

- `@components` → `src/components`
- `@hooks` → `src/hooks`
- `@context` → `src/context`
- `@utils` → `src/utils`
- `@styles` → `src/styles`
- `@services` → `src/services`
- `@pages` → `src/pages`
- `@` → `src` (alias standard recommandé pour tous les nouveaux imports)

## Exemples de fichiers mis à jour

- `src/components/lieux/desktop/LieuView.js`
- `src/components/parametres/ParametresApparence.js`
