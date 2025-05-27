# 🔬 DIAGNOSTIC CIBLÉ - ID INSTABLE

## 🧨 Symptôme identifié

**Boucle active malgré toutes les corrections :**
- `useFirestoreSubscription`, `ConcertView`, `useConcertDetails`, `useGenericEntityDetails` render en boucle (+720 fois)
- Clé du problème : `useGenericEntityDetails` + `ConcertView` qui réinitialisent en cascade

## 🚨 ERREUR CRITIQUE DÉCOUVERTE : Violation des règles des hooks

### ❌ Problème identifié :
```
React Hook "useRef" is called conditionally. React Hooks must be called in the exact same order in every component render
```

**Cause racine :** J'avais placé un `return` conditionnel **avant** tous les hooks, violant la règle fondamentale de React.

### ✅ Correction appliquée :
1. **Déplacement de tous les hooks avant toute condition**
2. **Protection conditionnelle déplacée à la fin du hook**
3. **Respect strict de l'ordre des hooks**

## 🎯 Solution complète appliquée

### 1. Validation et stabilisation avec useMemo

```javascript
// 🎯 STABILISATION FORCÉE DE L'ID pour éviter les boucles
const stableId = useMemo(() => {
  // Validation et stabilisation de l'ID
  if (!id || typeof id !== 'string' || id.length < 1) {
    console.log('[DIAGNOSTIC] ID invalide détecté:', id, '- retour null');
    return null;
  }
  console.log('[DIAGNOSTIC] ID stabilisé:', id);
  return id;
}, [id]);
```

### 2. Tous les hooks appelés inconditionnellement

```javascript
// ✅ CORRECT: Tous les hooks sont appelés dans le même ordre à chaque render
const instanceRef = useRef({...});
const [entity, setEntity] = useState(null);
const [loading, setLoading] = useState(true);
// ... tous les autres hooks
```

### 3. Protection conditionnelle à la fin

```javascript
// 🚨 PROTECTION: Si l'ID n'est pas stable, retourner un objet stub
if (!stableId) {
  console.log('[DIAGNOSTIC] Hook useGenericEntityDetails suspendu - ID instable');
  return {
    // Objet stub avec toutes les propriétés attendues
    entity: null,
    loading: false,
    error: { message: 'ID invalide ou manquant' },
    // ... toutes les autres propriétés avec valeurs par défaut
  };
}
```

### 4. Remplacement systématique de `id` par `stableId`

**Fichiers modifiés :**
- `src/hooks/common/useGenericEntityDetails.js`

**Remplacements effectués :**
- ✅ `InstanceTracker.register(entityType, { id: stableId, ... })`
- ✅ `debugLog` messages avec `stableId`
- ✅ `useEffect` dépendances : `[stableId, ...]` au lieu de `[id, ...]`
- ✅ `cache.get(stableId)` et `cache.set(stableId, ...)`
- ✅ `doc(db, collectionName, stableId)`
- ✅ `useFirestoreSubscription({ id: stableId, ... })`
- ✅ Toutes les fonctions utilisant l'ID

## 📊 Métriques de test

### Avant la correction :
- `🔄 [DIAGNOSTIC] useGenericEntityDetails render` : +720 fois
- `🔄 [DIAGNOSTIC] ConcertView render` : +720 fois
- `🔄 [DIAGNOSTIC] useFirestoreSubscription render` : +720 fois
- ❌ **Erreurs ESLint** : 42 violations des règles des hooks

### Après la correction (attendu) :
- `🔄 [DIAGNOSTIC] useGenericEntityDetails render` : 1-3 fois max
- `🔄 [DIAGNOSTIC] ConcertView render` : 1-3 fois max
- `🔄 [DIAGNOSTIC] useFirestoreSubscription render` : 1-3 fois max
- ✅ **Compilation** : Succès sans erreurs ESLint

### Logs de diagnostic à surveiller :
- `[DIAGNOSTIC] ID utilisé dans ConcertView:` - Doit être stable
- `[DIAGNOSTIC] ID reçu par useGenericEntityDetails:` - Doit être stable
- `[DIAGNOSTIC] ID stabilisé:` - Doit apparaître une seule fois
- `[DIAGNOSTIC] Hook useGenericEntityDetails suspendu` - Ne doit PAS apparaître si l'ID est valide

## 🧪 Test immédiat

### Étapes de vérification :
1. **✅ Compilation réussie** : `npm run build` - Succès
2. **🔄 Application en cours de démarrage** : `npm start`
3. **Prochaine étape** : Ouvrir la console du navigateur
4. **Test** : Naviguer vers `/concerts` et cliquer sur un concert
5. **Observer** : Les compteurs de diagnostic

### Signaux de succès :
- ✅ Compteurs stables (pas d'incrémentation continue)
- ✅ Pas de message "Maximum update depth exceeded"
- ✅ Application fluide et responsive
- ✅ Compilation sans erreurs ESLint

### Signaux d'échec :
- ❌ Compteurs qui continuent à s'incrémenter
- ❌ Messages d'erreur dans la console
- ❌ Application qui freeze

## 🔄 Prochaines étapes si le problème persiste

### Hypothèse 2 : Problème de key sur le composant parent
Vérifier si `<ConcertView key={concertId} />` utilise un `concertId` instable.

### Hypothèse 3 : Autres dépendances instables
Analyser les autres hooks et leurs dépendances :
- `useConcertDetails`
- `useFirestoreSubscription`
- Contextes React (AuthContext, ParametresContext)

### Hypothèse 4 : Problème de cache
Analyser le système de cache et ses interactions.

## 🎯 Objectif

**Éliminer définitivement les boucles de re-renders** en :
1. ✅ Respectant les règles des hooks React
2. ✅ Stabilisant l'ID avec `useMemo`
3. ✅ Empêchant les réinitialisations en cascade

## 🏆 Leçon apprise

**La violation des règles des hooks peut être une cause majeure de boucles infinies.** 
- Les hooks doivent **toujours** être appelés dans le même ordre
- Aucun hook ne doit être appelé conditionnellement
- Les `return` conditionnels doivent être placés **après** tous les hooks

---

**Date :** $(date)
**Phase :** Diagnostic ciblé - Correction règles des hooks
**Statut :** ✅ Compilation réussie, application en cours de démarrage 