# Migration du système toggleEditMode

## Résumé

Audit complet et suppression du système `toggleEditMode` remplacé par le pattern de navigation vue/formulaire séparé.

## Changements effectués

### 1. Hooks nettoyés

#### `src/hooks/lieux/useLieuDetails.js`
- ✅ Supprimé `toggleEditMode` et `isEditing` 
- ✅ Conservé `handleEdit` qui navigue vers `/lieux/:id/edit`
- ✅ Mode lecture seule uniquement (`isEditMode = false`)

#### `src/hooks/common/useGenericEntityDetails.js`
- ✅ Supprimé la fonction `toggleEditMode`
- ✅ Remplacé `handleEdit: toggleEditMode` par `handleEdit: navigateToEdit`
- ✅ Ajouté commentaire expliquant la migration

### 2. Composants supprimés (ancien système d'édition en place)

#### `src/components/lieux/desktop/LieuDetails.js`
- ✅ **SUPPRIMÉ** - Utilisait l'édition en place avec `toggleEditMode`
- ✅ Remplacé par `LieuView` (lecture seule) + `LieuForm` (édition)

#### `src/components/programmateurs/desktop/ProgrammateurDetails.js`
- ✅ **SUPPRIMÉ** - Utilisait l'édition en place avec `toggleEditMode`
- ✅ Remplacé par `ProgrammateurView` (lecture seule) + `ProgrammateurForm` (édition)

#### `src/components/programmateurs/desktop/ProgrammateurHeader.js`
- ✅ **SUPPRIMÉ** - N'était plus utilisé et contenait `toggleEditMode`

### 3. Composants migrés

#### `src/components/concerts/mobile/ConcertView.js`
- ✅ Remplacé `toggleEditMode` par `handleEdit`
- ✅ Supprimé `isEditMode` (toujours `false` en mode vue)
- ✅ Simplifié la modal de suppression

### 4. Tests mis à jour

#### `src/hooks/__tests__/useGenericEntityDetails.test.js`
- ✅ Remplacé `toggleEditMode()` par un commentaire explicatif

#### `src/hooks/__tests__/useProgrammateurDetails.test.js`
- ✅ Remplacé `toggleEditMode: jest.fn()` par `handleEdit: jest.fn()`
- ✅ Mis à jour les assertions

### 5. Scripts de migration

#### `scripts/migrate_hooks_to_wrappers.js`
- ✅ Remplacé `toggleEditMode` par `handleEdit`

#### `backup/css/phase4-start/scripts/migrate_hooks_to_wrappers.js`
- ✅ Remplacé `toggleEditMode` par `handleEdit`

## Architecture finale

### Pattern de navigation (nouveau système)

```
/entites/:id          → EntiteView (lecture seule)
/entites/:id/edit     → EntiteForm (édition)
/entites/nouveau      → EntiteForm (création)
```

### Composants par entité

#### Lieux
- ✅ `LieuDetails.js` (racine) → redirige vers `LieuView` ou `LieuForm`
- ✅ `LieuView.js` → lecture seule, bouton "Modifier" navigue vers `/lieux/:id/edit`
- ✅ `LieuForm.js` → édition/création

#### Programmateurs  
- ✅ `ProgrammateurDetails.js` (racine) → redirige vers `ProgrammateurView`
- ✅ `ProgrammateurView.js` → lecture seule, bouton "Modifier" navigue vers `/programmateurs/:id/edit`
- ✅ `ProgrammateurForm.js` → édition/création

#### Concerts
- ✅ `ConcertDetails.js` (racine) → redirige vers `ConcertView`
- ✅ `ConcertView.js` → lecture seule, bouton "Modifier" navigue vers `/concerts/:id/edit`
- ✅ `ConcertForm.js` → édition/création

## Avantages de la migration

1. **Séparation claire** : Vue et édition sont des composants distincts
2. **Navigation cohérente** : URLs prévisibles (`/entite/:id` vs `/entite/:id/edit`)
3. **Performance** : Pas de re-render lors du changement de mode
4. **Maintenance** : Code plus simple, moins d'états à gérer
5. **UX** : Navigation browser native (back/forward)

## Vérification

- ✅ Compilation réussie (`npm run build`)
- ✅ Aucune référence restante à `toggleEditMode` dans le code source
- ✅ Tous les composants de vue sont en mode lecture seule
- ✅ Navigation fonctionnelle vers les formulaires d'édition

## Notes

- Les fichiers CSS `*.module.css` ont été conservés car partagés entre vue et formulaire
- Le hook `useGenericEntityDetails` reste compatible avec l'ancien système pour les entités non migrées
- Les tests ont été mis à jour pour refléter la nouvelle API 