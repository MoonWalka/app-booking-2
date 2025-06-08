# 🔧 Guide de Dépannage - Refactoring TourCraft

## 🚨 Problèmes rencontrés et solutions

### 1. Page blanche sur la route refactored

**Symptômes** :
- La page est complètement blanche
- Aucune erreur dans la console
- Le bouton de bascule semble fonctionner mais rien ne s'affiche

**Causes possibles** :
1. Routes définies à plusieurs endroits
2. Composant non importé correctement
3. Erreur silencieuse dans le rendu

**Solution** :
```javascript
// Vérifier dans la page parente (ex: ConcertsPage.js)
<Routes>
  <Route path="/:id/refactored" element={<ConcertDetailsRefactored />} />
</Routes>

// ET NON PAS seulement dans App.js
```

### 2. Erreur "Objects are not valid as React child"

**Symptômes** :
```
ERROR
Objects are not valid as React child (found: object with keys {label, onClick, variant, icon})
```

**Cause** : Passage d'objets au lieu d'éléments React

**Solution** :
```javascript
// ❌ Incorrect
<FormHeader
  actions={[
    { label: 'Retour', onClick: handleBack }
  ]}
/>

// ✅ Correct
<FormHeader
  actions={[
    <button key="back" onClick={handleBack}>Retour</button>
  ]}
/>
```

### 3. Hook useNavigate en dehors du Router

**Symptômes** :
```
ERROR
useNavigate() may be used only in the context of a <Router> component
```

**Cause** : Composant utilisé en dehors du contexte Router

**Solution** :
```javascript
// Placer le composant À L'INTÉRIEUR du Router
<Router>
  <RefactoringTestButton /> {/* ✅ Correct */}
  <Routes>...</Routes>
</Router>

// Et non pas à l'extérieur
<RefactoringTestButton /> {/* ❌ Incorrect */}
<Router>...</Router>
```

### 4. Import Card incorrect

**Symptômes** :
```
export 'Card' (imported as 'Card') was not found in '../ui/Card'
```

**Cause** : Mauvais type d'import (nommé vs défaut)

**Solution** :
```javascript
// Vérifier le type d'export dans le fichier source
// Si export default :
import Card from '../ui/Card';

// Si export nommé :
import { Card } from '../ui/Card';
```

### 5. Boucles infinies persistantes

**Symptômes** :
- Re-renders continus dans le Profiler React
- Performance dégradée
- Ventilateur qui s'emballe

**Causes** :
1. Profondeur trop élevée dans useSafeRelations
2. Dépendances mal gérées dans useEffect
3. Relations circulaires non détectées

**Solution** :
```javascript
// Limiter la profondeur
const { data } = useSafeRelations('concert', id, 1); // depth = 1

// Vérifier les dépendances
useEffect(() => {
  // Code
}, [id]); // Seulement les dépendances nécessaires

// Utiliser le Set de tracking
console.log('Entités chargées:', loadedEntities);
```

## 🛠️ Outils de diagnostic

### 1. Console de débogage

```javascript
// Ajouter au début du composant
console.log('🚀 Composant monté:', { props, state });

// Dans le hook
console.log('🔄 Hook appelé:', { entityType, entityId, depth });

// Avant le return
console.log('🎨 Rendu avec:', { data, loading, error });
```

### 2. React DevTools

1. Ouvrir l'onglet **Profiler**
2. Cliquer sur **Start profiling**
3. Interagir avec l'application
4. Analyser les re-renders

### 3. Network Inspector

1. Ouvrir l'onglet **Network**
2. Filtrer par **Fetch/XHR**
3. Observer les requêtes Firestore répétées
4. Identifier les patterns de boucle

## 📋 Checklist de debug

Quand quelque chose ne fonctionne pas :

1. **Vérifier la console** pour les erreurs JavaScript
2. **Vérifier les imports** (défaut vs nommé)
3. **Vérifier les routes** (App.js ET pages parentes)
4. **Ajouter des logs** temporaires pour tracer le flux
5. **Simplifier le composant** pour isoler le problème
6. **Tester avec des données minimales**
7. **Comparer avec l'ancienne version** qui fonctionne

### 6. Relations inverses ne se chargent pas

**Symptômes** :
```
TypeError: collection is not a function
```

**Cause** : Conflit de noms entre la variable locale et la fonction importée

**Solution** :
```javascript
// ❌ Incorrect - conflit avec la fonction collection()
const collection = entityType === 'lieu' ? 'lieux' : `${entityType}s`;
const loadEntity = async (collection, id) => {
  const docRef = doc(db, collection, id); // Erreur ici
}

// ✅ Correct - utiliser un nom différent
const collectionName = entityType === 'lieu' ? 'lieux' : `${entityType}s`;
const loadEntity = async (collectionName, id) => {
  const docRef = doc(db, collectionName, id);
}
```

### 7. Relations inverses (concerts d'un lieu)

**Symptômes** :
- Les concerts n'apparaissent pas dans la vue lieu
- La relation est stockée dans l'autre sens (concert → lieu)

**Solution** :
Ajouter le support des relations inverses dans `useSafeRelations` :
```javascript
// Configuration avec reverseField
lieu: {
  concerts: { 
    collection: 'concerts', 
    field: 'concertsIds', 
    isArray: true, 
    reverseField: 'lieuId' // Chercher les concerts où lieuId == lieu.id
  }
}

// Implémentation de la recherche inverse
if (relationConfig.reverseField && !relationIds) {
  const collectionRef = collection(db, relationConfig.collection);
  const q = query(
    collectionRef,
    where(relationConfig.reverseField, '==', entityData.id)
  );
  const querySnapshot = await getDocs(q);
  // Traiter les résultats...
}
```

## 🆘 Solutions d'urgence

### Rollback rapide

Si rien ne fonctionne :

```javascript
// Temporairement revenir à l'ancienne version
<Route path="/:id" element={<ConcertDetails />} />
// Au lieu de
<Route path="/:id" element={<ConcertDetailsRefactored />} />
```

### Mode debug complet

```javascript
// Créer un composant de test minimal
const TestComponent = () => {
  console.log('Component rendered');
  return <div>Test OK - {new Date().toISOString()}</div>;
};

// L'utiliser pour vérifier que le routing fonctionne
<Route path="/:id/test" element={<TestComponent />} />
```

## 🎯 Bonnes pratiques

1. **Toujours commencer simple** : D'abord faire fonctionner, puis optimiser
2. **Un changement à la fois** : Facilite l'identification des problèmes
3. **Garder l'ancienne version** : Permet de comparer et rollback
4. **Documenter les problèmes** : Pour l'équipe et le futur vous
5. **Tester sur différents navigateurs** : Les erreurs peuvent varier

## 📞 Obtenir de l'aide

Si le problème persiste :

1. **Capturer** :
   - L'erreur exacte
   - Les logs de console
   - La configuration des routes
   - Le code du composant

2. **Essayer** :
   - Un composant minimal
   - Une route différente
   - Un navigateur différent

3. **Partager** :
   - Le contexte complet
   - Ce qui a été tenté
   - L'objectif recherché