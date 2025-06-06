# Rapport d'analyse ESLint - TourCraft

## Date: 6 Juin 2025

## Résumé des erreurs ESLint identifiées

### 1. Variables et imports non utilisés

#### `src/hooks/relances/useRelancesAutomatiques.js`
- **Ligne 21**: `options` est assigné mais jamais utilisé dans le destructuring
  ```javascript
  export const useRelancesAutomatiques = (options = {}) => {
    const { autoEvaluation } = options; // 'options' non utilisé après
  ```

#### `src/utils/formatters.js`
- **Ligne 53**: La fonction `getCacheKey` accepte un paramètre `id` mais la version avec 2 paramètres n'est jamais exportée
  ```javascript
  export const getCacheKey = (id) => `concert_${id}_${Date.now()}`;
  // Mais utilisé avec: getCacheKey(id, Date.now()) dans useConcertDetails
  ```

### 2. Dépendances manquantes dans useEffect

#### `src/hooks/concerts/useConcertDetails.js`
- **Ligne 555**: ESLint désactivé pour exhaustive-deps
  ```javascript
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genericDetails?.entity?.id, genericDetails?.loading]); // Manque potentiellement d'autres dépendances
  ```

#### `src/hooks/concerts/useConcertDetailsFixed.js`
- **Lignes 239, 271**: Multiple désactivations d'exhaustive-deps
  ```javascript
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ```

### 3. Variables globales non définies (no-undef)

#### `src/hooks/common/useBidirectionalRelations.js`
- Utilisation de `console` sans déclaration (lignes 25, 42, 44, 57, 74, 76, 89, 107, 109, 122, 133, 138)

#### `src/hooks/concerts/useConcertDetails.js`
- `CustomEvent` non défini (lignes 187, 210)
- `window` non défini (lignes 194, 211, 625, 645, 646)
- `setTimeout` non défini (ligne 200)
- `URLSearchParams` non défini (ligne 761)
- Multiple utilisations de `console` non déclarées

### 4. Imports relatifs problématiques

#### Imports avec chemins relatifs profonds
- `src/hooks/generics/forms/useGenericFormWizard.js`:
  ```javascript
  import { utilityCache } from '../../../utils/networkStabilizer';
  ```
- `src/hooks/search/useConcertSearch.js`:
  ```javascript
  import { formatDate } from '../../utils/dateUtils';
  ```

### 5. Imports Firebase potentiellement non utilisés

#### `src/services/bidirectionalRelationsService.js`
- Importe `arrayUnion`, `arrayRemove`, `serverTimestamp` mais certains peuvent ne pas être utilisés dans tous les cas

#### `src/hooks/common/useGenericEntityDetails.js`
- Importe `serverTimestamp` (ligne 5) mais semble ne pas l'utiliser directement

### 6. Problèmes de structure et conventions

#### `src/components/concerts/ConcertInfoSection.js`
- Redéfinition de fonctions utilitaires déjà disponibles dans `@/utils/formatters`
  ```javascript
  const formatDate = (date) => { ... }; // Duplique formatDate de utils/formatters
  const formatMontant = (montant) => { ... }; // Duplique formatMontant de utils/formatters
  ```

### 7. Logs de debug en production

#### Multiple fichiers
- `src/hooks/concerts/useConcertDetails.js` (lignes 221-294): Nombreux console.log de debug
- `src/components/concerts/ConcertInfoSection.js` (ligne 9): console.log de debug
- `src/hooks/common/useGenericEntityDetails.js` (lignes 64-72): console.log de debug intensif

### 8. Gestion des erreurs incohérente

#### `src/hooks/concerts/useConcertWatcher.js`
- Capture d'erreur sans re-throw ni gestion appropriée (ligne 67)
  ```javascript
  } catch (error) {
    console.error('❌ Erreur lors de l\'évaluation des relances:', error);
    // Pas de re-throw ou de gestion d'état d'erreur
  }
  ```

## Recommandations

### 1. Configuration ESLint globale
Créer ou mettre à jour `.eslintrc.js` avec :
```javascript
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'react-hooks/exhaustive-deps': 'warn',
  },
};
```

### 2. Nettoyage des imports
- Utiliser un outil comme `eslint-plugin-unused-imports`
- Exécuter régulièrement : `npx eslint --fix src/`

### 3. Gestion des logs
- Remplacer tous les `console.log` par le service `debugLog`
- Configurer `debugLog` pour désactiver les logs en production

### 4. Refactoring des hooks
- Réviser les dépendances des useEffect
- Éviter de désactiver exhaustive-deps sauf cas exceptionnels documentés

### 5. Standardisation des imports
- Préférer les imports absolus avec alias `@/`
- Éviter les chemins relatifs profonds (`../../../`)

## Scripts de correction suggérés

### 1. Nettoyer les console.log
```bash
find src -name "*.js" -o -name "*.jsx" | xargs sed -i '' 's/console\.log/debugLog/g'
```

### 2. Identifier les imports non utilisés
```bash
npx eslint src/ --rule "no-unused-vars:error" --fix
```

### 3. Vérifier les dépendances manquantes
```bash
npx eslint src/ --rule "react-hooks/exhaustive-deps:error" --no-eslintrc
```

## Priorités

1. **Haute priorité** : Corriger les erreurs no-undef (variables globales)
2. **Moyenne priorité** : Nettoyer les imports non utilisés
3. **Basse priorité** : Résoudre les warnings exhaustive-deps
4. **Continue** : Remplacer progressivement les console.log par debugLog