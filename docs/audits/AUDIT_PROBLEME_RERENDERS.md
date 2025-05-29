# Audit des problèmes de re-renders dans ConcertForm

## Problème principal identifié

Le formulaire de concert subit **plus de 6000 re-renders** lors du chargement initial. L'audit du code révèle plusieurs causes :

## 1. Boucle dans useGenericEntityForm (CRITIQUE)

### Problème
Dans `src/hooks/generics/forms/useGenericEntityForm.js`, ligne 174 :
```javascript
const handleFieldChange = useCallback((fieldName, value) => {
  // ...
  if (enableAutoSave) triggerAutoSave(); // ⚠️ PROBLÈME ICI
}, [validateOnChange, enableValidation, enableTouchedTracking, enableDirtyTracking, enableAutoSave, triggerAutoSave]);
```

Le `triggerAutoSave` est dans les dépendances du `useCallback`, et `triggerAutoSave` lui-même dépend de `formData`. Cela crée une boucle :
1. `formData` change → `triggerAutoSave` est recréé
2. `triggerAutoSave` recréé → `handleFieldChange` est recréé
3. `handleFieldChange` recréé → tous les composants enfants re-render
4. Les re-renders peuvent déclencher de nouveaux changements → boucle infinie

### Solution
Retirer `triggerAutoSave` des dépendances ou utiliser une ref :
```javascript
const triggerAutoSaveRef = useRef();
triggerAutoSaveRef.current = triggerAutoSave;

const handleFieldChange = useCallback((fieldName, value) => {
  // ...
  if (enableAutoSave && triggerAutoSaveRef.current) {
    triggerAutoSaveRef.current();
  }
}, [validateOnChange, enableValidation, enableTouchedTracking, enableDirtyTracking, enableAutoSave]);
```

## 2. useEntitySearch appelé 3 fois (IMPORTANT)

Dans `ConcertForm.js`, le hook `useEntitySearch` est appelé 3 fois :
- Pour les lieux (ligne 100)
- Pour les programmateurs (ligne 116)
- Pour les artistes (ligne 132)

Chaque instance peut déclencher ses propres re-renders lors de la recherche.

### Solution
Considérer l'utilisation d'un seul hook de recherche avec un type dynamique, ou mémoïser les résultats.

## 3. Objets de configuration instables

### Problème
Dans `useConcertForm.js`, ligne 96 :
```javascript
const formOptions = useMemo(() => ({
  // Configuration complexe...
}), [isNewConcert, concertId, onSuccessCallback, onErrorCallback, transformConcertData]);
```

Les callbacks dans les dépendances peuvent changer et recréer `formOptions`.

### Solution
Utiliser des refs pour les callbacks :
```javascript
const onSuccessCallbackRef = useRef(onSuccessCallback);
const onErrorCallbackRef = useRef(onErrorCallback);
// ...
```

## 4. États multiples non consolidés

Le formulaire gère de nombreux états séparés :
- `formData` (données du formulaire)
- `loading` (état de chargement)
- `validationErrors` (erreurs de validation)
- `touchedFields` (champs touchés)
- `isDirty` (formulaire modifié)
- `autoSaveStatus` (statut de sauvegarde automatique)

Chaque mise à jour d'état déclenche un re-render.

### Solution
Utiliser `useReducer` pour consolider les états liés :
```javascript
const [formState, dispatch] = useReducer(formReducer, initialFormState);
```

## 5. Absence de mémoïsation des composants enfants

Les sections du formulaire (`ConcertInfoSection`, `LieuSearchSection`, etc.) ne sont pas mémoïsées avec `React.memo`.

### Solution
```javascript
const ConcertInfoSection = React.memo(({ formData, onChange, formErrors }) => {
  // ...
});
```

## Actions correctives recommandées

### Priorité 1 (Impact immédiat)
1. **Corriger la boucle triggerAutoSave** dans `useGenericEntityForm`
2. **Désactiver l'auto-save** temporairement si non essentiel

### Priorité 2 (Optimisations importantes)  
3. **Mémoïser les sections du formulaire** avec React.memo
4. **Stabiliser les callbacks** avec useRef
5. **Consolider les états** avec useReducer

### Priorité 3 (Améliorations long terme)
6. **Refactoriser useEntitySearch** pour réduire les instances
7. **Implémenter un système de debounce** pour les validations
8. **Virtualiser les listes longues** si présentes

## Code de test rapide

Pour vérifier si les corrections fonctionnent, ajoutez ce code dans `ConcertForm.js` :
```javascript
// Au début du composant
const renderCount = useRef(0);
renderCount.current++;
console.log(`ConcertForm render #${renderCount.current}`);

// Si > 50 renders en 5 secondes, il y a toujours un problème
```

## Conclusion

Le problème principal vient d'une boucle de dépendances dans le hook générique. Une fois corrigé, le nombre de re-renders devrait passer de 6000+ à moins de 20 pour le chargement initial. 