strcite mode c'est ça qui empechait la page de s'afficher
mais y'a encore un soucis dans le sens ou c'est pas une vrai page d'edtiion



````
// ...existing code...
import { useState, useEffect, useCallback, useRef } from 'react';
// ...existing code...
export const useGenericEntityForm = ({
// ...existing code
}) => {
+  // Guard to avoid running fetch twice (e.g. in StrictMode)
+  const hasFetchedRef = useRef(false);
   const navigate = useNavigate();
   const [formData, setFormData] = useState(initialData);
   // ...existing code...
   useEffect(() => {
+    if (hasFetchedRef.current) return;
+    hasFetchedRef.current = true;
     console.log("[useGenericEntityForm] useEffect [entityId, collectionName]. entityId:", entityId);
     const fetchEntityData = async () => {
       // ...existing code...
````


Made changes.

Jusqu’ici, ces doublons venaient du fait que React 18 en mode Développement (StrictMode) monte deux fois le composant et donc réexécute l’`useEffect` de chargement. On a corrigé ça en ajoutant dans `useGenericEntityForm` un guard :

```js
const hasFetchedRef = useRef(false);

useEffect(() => {
  if (hasFetchedRef.current) return;
  hasFetchedRef.current = true;
  // …fetchEntityData()
}, [/* deps */]);
```

Désormais, même si React relance l’effet une seconde fois, il s’arrête immédiatement et n’appelle plus `fetchEntityData`, ce qui supprime les logs en double et empêche les requêtes redondantes.