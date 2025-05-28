# Plan de réactivation de l'auto-save

## État actuel
- ✅ Performances optimales : 1 render par composant
- ✅ validateOnChange : RÉACTIVÉ
- ❌ enableAutoSave : DÉSACTIVÉ

## Risques de l'auto-save
1. Peut déclencher des sauvegardes fréquentes
2. Chaque sauvegarde peut causer des re-renders
3. Les requêtes réseau peuvent impacter les performances

## Plan de réactivation sécurisée

### Option 1 : Auto-save avec debounce long (RECOMMANDÉ)
```javascript
const formOptionsWithAutoSave = useMemo(() => ({
  enableAutoSave: true,
  autoSaveDebounce: 5000, // 5 secondes au lieu de 3
  enableValidation: true,
  validateOnChange: true,
  validateOnBlur: true
}), []);
```

### Option 2 : Auto-save manuel
Ajouter un bouton "Sauvegarder le brouillon" au lieu de l'auto-save automatique.

### Option 3 : Auto-save conditionnel
Activer l'auto-save seulement après que l'utilisateur ait fait des modifications significatives :
```javascript
const shouldAutoSave = isDirty && Object.keys(formData).some(key => formData[key]);
```

## Tests à effectuer après réactivation

1. **Test de charge initiale**
   - Ouvrir le formulaire
   - Vérifier : < 10 renders

2. **Test de saisie**
   - Taper dans plusieurs champs
   - Vérifier : < 50 renders total

3. **Test d'auto-save**
   - Modifier un champ et attendre
   - Vérifier : Pas de pic de renders lors de la sauvegarde

## Métriques de succès
- Renders au chargement : < 10
- Renders par interaction : < 5
- Renders lors de l'auto-save : < 10
- Temps de réponse : < 100ms

## Recommandation
Commencer par l'Option 1 avec un debounce de 5 secondes, puis réduire progressivement si les performances restent bonnes. 