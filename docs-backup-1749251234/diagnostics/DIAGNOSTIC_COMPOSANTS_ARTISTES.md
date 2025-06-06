# 🎯 DIAGNOSTIC - COMPOSANTS ARTISTES SUSPECTS

## 🧠 Problèmes identifiés

Ton intuition était correcte ! J'ai trouvé plusieurs sources potentielles de boucles infinies dans les composants liés aux **artistes**.

## ❌ Problème #1 : useArtistesList - Boucle de dépendances

### Code problématique (lignes 205-207) :
```javascript
// Effet pour mettre à jour les stats quand la liste change
useEffect(() => {
  if (entityList.items) {
    calculateStats(); // ← Appelle calculateStats
  }
}, [entityList.items, calculateStats]); // ← calculateStats dans les dépendances

// Mais calculateStats utilise setStats qui peut changer entityList.items
const calculateStats = useCallback(async () => {
  // ...
  setStats(prevStats => { // ← Peut déclencher un re-render
    // ...
  });
}, []); // ← Pas de dépendances mais utilise setStats
```

**Problème :** Boucle potentielle `entityList.items` → `calculateStats` → `setStats` → re-render → `entityList.items` change → boucle infinie.

## ❌ Problème #2 : useArtistesList - useEffect avec calculateStats

### Code problématique (lignes 108-110) :
```javascript
// Effet pour le calcul initial des stats
useEffect(() => {
  calculateStats();
}, [calculateStats]); // ← calculateStats dans les dépendances
```

**Problème :** Si `calculateStats` n'est pas stable, cet effet se relance en boucle.

## ❌ Problème #3 : ArtistesList - Callbacks avec dépendances instables

### Code problématique (lignes 50-56) :
```javascript
const { handleDelete } = useDeleteArtiste(useCallback((deletedId) => {
  if (isUpdatingRef.current) return;
  isUpdatingRef.current = true;
  
  try {
    setArtistes(prevArtistes => prevArtistes.filter(a => a.id !== deletedId));
  } finally {
    isUpdatingRef.current = false;
  }
}, [setArtistes])); // ← setArtistes peut changer à chaque render
```

**Problème :** `setArtistes` dans les dépendances peut créer un nouveau callback à chaque render.

## ❌ Problème #4 : ArtistesList - hasActiveFilters recalculé

### Code problématique (lignes 130-132) :
```javascript
const hasActiveFilters = useCallback(() => {
  return searchTerm || (filters && Object.values(filters).some(f => f && f !== 'all'));
}, [searchTerm, filters]); // ← Recalculé si searchTerm ou filters changent
```

**Problème :** Utilisé dans le JSX, peut causer des re-renders si `filters` ou `searchTerm` changent fréquemment.

## 🔍 Test de vérification

Pour confirmer que les artistes sont la source du problème :

### 1. Désactiver temporairement les composants artistes
```javascript
// Dans App.js ou le routeur principal
// Commenter temporairement la route des artistes
// <Route path="/artistes/*" element={<ArtistesPage />} />
```

### 2. Ajouter des logs de diagnostic
```javascript
// Dans useArtistesList.js
useEffect(() => {
  console.count("🎨 [ARTISTES] useArtistesList render");
}, []);

// Dans ArtistesList.js
useEffect(() => {
  console.count("🎨 [ARTISTES] ArtistesList render");
}, []);
```

## ✅ Solutions recommandées

### Solution #1 : Stabiliser calculateStats
```javascript
const calculateStats = useCallback(async () => {
  if (isCalculatingRef.current) return;
  
  try {
    isCalculatingRef.current = true;
    // ... logique de calcul
    
    setStats(prevStats => {
      // Comparaison stricte pour éviter les mises à jour inutiles
      if (prevStats.total === snapshot.size && 
          prevStats.avecConcerts === avecConcerts && 
          prevStats.sansConcerts === sansConcerts) {
        return prevStats; // ← Retourner la même référence
      }
      return { total: snapshot.size, avecConcerts, sansConcerts };
    });
  } finally {
    isCalculatingRef.current = false;
  }
}, []); // ← Garder les dépendances vides
```

### Solution #2 : Retirer calculateStats des dépendances
```javascript
// Effet pour le calcul initial des stats
useEffect(() => {
  calculateStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // ← Pas de dépendances, exécuté une seule fois
```

### Solution #3 : Stabiliser les callbacks dans ArtistesList
```javascript
const { handleDelete } = useDeleteArtiste(useCallback((deletedId) => {
  // ... logique
}, [])); // ← Pas de dépendances, utiliser des refs si nécessaire
```

### Solution #4 : Mémoiser hasActiveFilters
```javascript
const hasActiveFilters = useMemo(() => {
  return searchTerm || (filters && Object.values(filters).some(f => f && f !== 'all'));
}, [searchTerm, filters]);
```

## 🧪 Test rapide

**Commande pour tester :**
1. Ouvrir `http://localhost:3000`
2. **NE PAS** aller sur `/artistes`
3. Aller directement sur `/concerts`
4. Cliquer sur un concert

**Si les boucles disparaissent :** Les artistes sont bien la source du problème.
**Si les boucles persistent :** Le problème vient d'ailleurs (concerts, hooks génériques, etc.).

## 🎯 Priorité d'action

1. **Immédiat :** Tester sans les artistes pour confirmer
2. **Correction :** Appliquer les solutions pour stabiliser `useArtistesList`
3. **Vérification :** Confirmer que les boucles sont éliminées

---

**Date :** $(date)
**Phase :** Diagnostic composants artistes
**Statut :** ✅ Problèmes identifiés - Test de confirmation en cours 