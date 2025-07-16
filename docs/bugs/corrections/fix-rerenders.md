# Fix pour les Re-renders de ContactViewTabs

## PROBLÈME PRINCIPAL: setState dans useMemo

Le code actuel appelle des `setState` à l'intérieur d'un `useMemo`, ce qui est strictement interdit par React et cause des re-renders en cascade.

## SOLUTION PROPOSÉE

### 1. Retirer les setState du useMemo et utiliser des valeurs dérivées:

```javascript
// AVANT (INCORRECT)
const contact = useMemo(() => {
  if (!cleanId || !currentOrganization?.id) {
    setLoading(false);  // ❌ setState dans useMemo
    setError(!cleanId ? 'ID manquant' : 'Organisation manquante');  // ❌
    return null;
  }
  // ...
  if (data) {
    setEntityType('structure');  // ❌ setState dans useMemo
    setLoading(false);  // ❌
    setError(null);  // ❌
    return data;
  }
}, [...]);

// APRÈS (CORRECT)
// Déterminer le type et récupérer les données de manière pure
const { contact, detectedType, isLoading, errorMessage } = useMemo(() => {
  if (!cleanId || !currentOrganization?.id) {
    return {
      contact: null,
      detectedType: forcedViewType || null,
      isLoading: false,
      errorMessage: !cleanId ? 'ID manquant' : 'Organisation manquante'
    };
  }
  
  // Si le type est fourni ou déjà connu
  if (forcedViewType === 'structure') {
    const data = getStructureWithPersonnes(cleanId);
    if (data) {
      return {
        contact: data,
        detectedType: 'structure',
        isLoading: false,
        errorMessage: null
      };
    }
  }
  
  // Essayer de détecter le type
  const structureData = getStructureWithPersonnes(cleanId);
  if (structureData) {
    return {
      contact: structureData,
      detectedType: 'structure',
      isLoading: false,
      errorMessage: null
    };
  }
  
  const personneData = getPersonneWithStructures(cleanId);
  if (personneData) {
    const type = personneData.isPersonneLibre && (!personneData.structures || personneData.structures.length === 0) 
      ? 'personne_libre' 
      : 'personne';
    return {
      contact: personneData,
      detectedType: type,
      isLoading: false,
      errorMessage: null
    };
  }
  
  // Pas encore trouvé
  const hasData = structures.length > 0 || personnes.length > 0;
  return {
    contact: null,
    detectedType: forcedViewType || null,
    isLoading: !hasData,
    errorMessage: hasData ? 'Contact non trouvé' : null
  };
}, [cleanId, currentOrganization?.id, forcedViewType, getStructureWithPersonnes, getPersonneWithStructures, structures.length, personnes.length]);

// Utiliser les valeurs dérivées directement
const entityType = detectedType;
const loading = isLoading;
const error = errorMessage;
```

### 2. Supprimer les états redondants:

```javascript
// SUPPRIMER ces lignes:
// const [entityType, setEntityType] = useState(forcedViewType);
// const [loading, setLoading] = useState(true);
// const [error, setError] = useState(null);
// const [dataReady, setDataReady] = useState(false);

// Et supprimer le useEffect qui set dataReady (lignes 136-141)
```

### 3. Optimiser le useEffect pour les dates:

```javascript
// AVANT
React.useEffect(() => {
  if (entityType !== 'structure' || !structureName) {
    return;
  }
  
  const timeoutId = setTimeout(() => {
    loadStructureDates();
  }, 100);
  
  return () => clearTimeout(timeoutId);
}, [entityType, structureName, loadStructureDates]);

// APRÈS - Ajouter une ref pour éviter les appels multiples
const datesLoadedRef = useRef(false);
const lastStructureNameRef = useRef(null);

React.useEffect(() => {
  if (entityType !== 'structure' || !structureName) {
    datesLoadedRef.current = false;
    return;
  }
  
  // Éviter de recharger si c'est la même structure
  if (structureName === lastStructureNameRef.current && datesLoadedRef.current) {
    return;
  }
  
  lastStructureNameRef.current = structureName;
  
  const timeoutId = setTimeout(() => {
    loadStructureDates().then(() => {
      datesLoadedRef.current = true;
    });
  }, 100);
  
  return () => clearTimeout(timeoutId);
}, [entityType, structureName, loadStructureDates]);
```

### 4. Ajouter des logs de debug temporaires:

```javascript
// Au début du composant
const renderCount = useRef(0);
renderCount.current += 1;

console.log(`🔄 [ContactViewTabs] RENDER #${renderCount.current}`, {
  id,
  cleanId,
  viewType,
  entityType: detectedType,
  hasContact: !!contact,
  loading: isLoading,
  error: errorMessage,
  timestamp: new Date().toISOString()
});
```

## IMPACT ATTENDU

Avec ces changements:
- **6 re-renders → 2-3 re-renders maximum**
- Render 1: Mount initial
- Render 2: Quand les données Firebase arrivent
- Render 3: (Optionnel) Si les dates se chargent pour une structure

## AUTRES OPTIMISATIONS POSSIBLES

1. **Utiliser React Query** pour gérer le cache et les états de chargement automatiquement
2. **Memoizer plus agressivement** les sections qui ne changent pas souvent
3. **Diviser le composant** en sous-composants plus petits avec leur propre logique
4. **Utiliser useDeferredValue** pour les mises à jour moins critiques