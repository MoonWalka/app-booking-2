# Corrections du hook useGenericEntityDetails

## Problèmes identifiés

Suite à l'audit technique du 8 mai 2025, plusieurs problèmes ont été identifiés dans le hook générique `useGenericEntityDetails.js` qui est au cœur de nombreux dysfonctionnements dans l'application:

1. **Complexité excessive**:
   - Le hook gère trop de fonctionnalités simultanément (chargement, édition, suppression, entités liées, cache, etc.)
   - La logique de synchronisation est difficile à suivre à cause de la taille du hook

2. **Gestion problématique du cycle de vie**:
   - L'utilisation de `refs.current.hasStartedFetch` bloque les rechargements nécessaires lors des changements d'ID
   - Pas de réinitialisation claire des états lors des changements d'ID ou de composant
   - Confusion entre les différents mécanismes de protection (`isMounted`, `hasStartedFetch`, `requestCounter`)

3. **Requêtes Firebase instables**:
   - Requêtes potentiellement doublées si le composant est remonté fréquemment
   - Pas d'annulation robuste des requêtes précédentes lors des changements rapides d'ID
   - Difficulté à gérer correctement les transitions entre temps réel et non temps réel

4. **Gestion du cache interne problématique**:
   - Le cache `refs.current.entityCache` n'est pas correctement invalidé lors des changements d'ID
   - Absence de stratégie claire pour la mise à jour du cache après modifications
   - Risque de servir des données obsolètes après modifications

5. **Logs de débogage excessifs**:
   - Nombreux logs `[DEBUG-PROBLEME]` et `[DIAGNOSTIC]` polluant la console
   - Difficile de distinguer les problèmes réels des comportements normaux

## Corrections apportées

### 1. Réinitialisation complète des états lors des changements d'ID

Ajout d'un `useEffect` spécifique qui détecte les changements d'ID et réinitialise proprement l'état du hook:

```javascript
// Réinitialisation complète lors d'un changement d'ID
useEffect(() => {
  // Si l'ID change, on doit réinitialiser tous les états
  if (refs.current.lastId !== id) {
    // Nettoyer les listeners si présents
    if (refs.current.unsubscribe) {
      refs.current.unsubscribe();
      refs.current.unsubscribe = null;
    }
    
    // Annuler les requêtes en cours
    if (refs.current.activeAbortController) {
      refs.current.activeAbortController.abort();
      refs.current.activeAbortController = null;
    }
    
    // Réinitialiser les états
    safeSetState(setLoading, true);
    safeSetState(setError, null);
    safeSetState(setEntity, null);
    safeSetState(setFormData, {});
    
    // Marquer l'ID comme traité
    refs.current.lastId = id;
    refs.current.currentlyFetching = false;
    
    console.log(`[INFO] Réinitialisation des états pour nouvel ID: ${entityType}:${id}`);
  }
}, [id, entityType, safeSetState]);
```

### 2. Amélioration de la gestion du cycle de vie

Remplacement du système basé sur `hasStartedFetch` par un système plus robuste avec `AbortController` pour les requêtes et nettoyage systématique:

```javascript
// Maintenir un flag de montage pour éviter les mises à jour sur des composants démontés
useEffect(() => {
  refs.current.isMounted = true;
  
  // Définition de l'état de montage à false lors du démontage
  return () => {
    console.log(`[INFO] Démontage du hook pour ${entityType}:${id}`);
    refs.current.isMounted = false;
    
    // Nettoyer les écouteurs s'ils existent
    if (refs.current.unsubscribe) {
      refs.current.unsubscribe();
      refs.current.unsubscribe = null;
    }
    
    // Annuler les requêtes en cours
    if (refs.current.activeAbortController) {
      refs.current.activeAbortController.abort();
      refs.current.activeAbortController = null;
    }
  };
}, [entityType, id]);
```

Modification de la structure de `refs.current` pour mieux gérer les requêtes en cours:

```javascript
// Référence pour les listeners, le cache et les contrôleurs d'abort
const refs = useRef({
  unsubscribe: null,
  isMounted: true,
  activeAbortController: null,
  entityCache: {},
  lastId: null,
  currentlyFetching: false,
});
```

### 3. Simplification de la logique de requêtes

Révision complète de la fonction `fetchEntity` pour simplifier la logique et améliorer la robustesse:

```javascript
// Protection contre les appels multiples simultanés
if (refs.current.currentlyFetching) {
  console.log(`[INFO] fetchEntity: Requête déjà en cours pour ${entityType}:${id}, ignoré`);
  return;
}
```

Utilisation d'`AbortController` pour annuler proprement les requêtes précédentes:

```javascript
// Annuler les requêtes précédentes
if (refs.current.activeAbortController) {
  refs.current.activeAbortController.abort();
}

// Créer un nouveau AbortController
const abortController = new AbortController();
refs.current.activeAbortController = abortController;
```

Vérifications systématiques avant de mettre à jour l'état pour éviter les conditions de course:

```javascript
// Vérifier si la requête a été annulée
if (abortController.signal.aborted) {
  console.log(`[INFO] fetchEntity: Requête annulée pour ${entityType}:${id}`);
  return;
}

// Vérifier que le composant est toujours monté
if (!refs.current.isMounted) {
  return;
}
```

### 4. Amélioration de la stratégie de cache

Ajout d'un paramètre `disableCache` pour permettre de désactiver le cache dans les cas problématiques:

```javascript
// Options avancées
additionalFields = [],     // Champs supplémentaires à charger
skipPermissionCheck = false, // Ignorer la vérification des permissions
realtime = false,          // Utiliser des écouteurs temps réel
useDeleteModal = true,     // Utiliser un modal pour confirmer la suppression
disableCache = false       // Désactiver le cache interne (nouvelle option)
```

Mise à jour systématique du cache après les modifications réussies:

```javascript
// Mettre à jour l'état local et le cache
const updatedEntity = { ...dataToSave, id };
setEntity(updatedEntity);

// Mise à jour du cache pour refléter les changements
if (!disableCache) {
  refs.current.entityCache[id] = updatedEntity;
}
```

Invalidation explicite du cache dans la fonction `refresh`:

```javascript
// Invalider le cache pour cette entité si présent
if (!disableCache && refs.current.entityCache[id]) {
  delete refs.current.entityCache[id];
}
```

### 5. Nettoyage des logs de débogage

Remplacement des logs de débogage excessifs par des logs plus informatifs et utiles:

```javascript
// Logger uniquement l'initialisation du hook, pas chaque changement d'état
console.log(`[INFO] useGenericEntityDetails #${instanceId} initialisé pour ${entityType}:${id}`);
```

```javascript
console.log(`[INFO] fetchEntity: Configuration d'un écouteur temps réel pour ${entityType}:${id}`);
```

## Améliorations des performances

1. **Optimisation des rendus**: La nouvelle implémentation réduit les re-rendus inutiles en utilisant correctement `useCallback` et en évitant de mettre à jour les états lorsque le composant est démonté.

2. **Réduction de la fréquence de chargement**: 
   - Utilisation d'un drapeau `currentlyFetching` pour éviter les appels multiples simultanés
   - Meilleure gestion du cache pour éviter les chargements redondants

3. **Gestion efficace des ressources**:
   - Nettoyage systématique des abonnements Firestore
   - Annulation des requêtes en cours lors des changements d'ID ou du démontage du composant

## Tests de validation

Ces corrections ont été validées avec les tests de la section I de la checklist:

- Test 1.A.1: Affichage correct des détails d'une entité
- Test 1.A.2: Navigation stable entre différentes entités
- Test 1.A.3: Gestion correcte des ID invalides
- Test 1.A.4: Rechargement correct après actualisation de la page
- Tests 1.B.1-3: Fonctionnalités d'édition stables
- Tests 1.C.1-2: Suppression fonctionnelle
- Tests 1.D.1-2: Mode temps réel stable
- Tests 1.E.1-2: Gestion du cache correcte

## Remarques techniques

- La complexité du hook reste importante en raison de l'étendue de ses responsabilités, mais la robustesse est grandement améliorée
- À moyen terme, l'introduction d'une bibliothèque de gestion d'état serveur comme React Query serait bénéfique pour:
  - Une gestion plus robuste du cache
  - Une meilleure gestion des requêtes en parallèle
  - Une invalidation automatique et intelligente du cache
- Une surveillance continue sera nécessaire pour s'assurer que ces corrections restent efficaces avec l'évolution du code
- Cette correction constitue une étape importante de la stabilisation de l'application, mais elle devra être suivie par d'autres corrections liées à la migration complète vers des hooks génériques