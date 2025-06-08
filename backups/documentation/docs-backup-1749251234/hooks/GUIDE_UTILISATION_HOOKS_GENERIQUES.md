# Guide d'Utilisation des Hooks Génériques

*Document créé le: 9 mai 2025*  
*Dernière mise à jour: 9 mai 2025*

Ce guide explique comment utiliser directement les hooks génériques dans les nouveaux développements, conformément au plan de dépréciation progressive des hooks spécifiques.

## Contexte

Notre projet est en transition des hooks spécifiques aux entités vers des hooks génériques plus flexibles et maintenables. Bien que des versions "migrées" (avec suffixe `Migrated` ou `V2`) existent actuellement, **la meilleure pratique est d'utiliser directement les hooks génériques** pour tout nouveau code.

## Les Hooks Génériques Disponibles

1. `useGenericEntityForm` - Pour les formulaires d'entités
2. `useGenericEntityDetails` - Pour l'affichage et la manipulation des détails d'une entité
3. `useGenericEntitySearch` - Pour la recherche d'entités
4. `useGenericEntityList` - Pour la gestion des listes d'entités

## Importer les Hooks Génériques

```javascript
// Importer directement depuis le module common
import { useGenericEntityForm } from '@/hooks/common';
// OU utiliser l'alias plus court
import { useEntityForm } from '@/hooks/common';
```

## Utilisation de `useGenericEntityForm`

### Exemple d'Utilisation Directe

```javascript
import { useGenericEntityForm } from '@/hooks/common';

const MonComposant = ({ entiteId }) => {
  const {
    formData,
    setFormData,
    loading,
    submitting,
    error,
    formErrors,
    handleChange,
    handleSubmit,
    resetForm,
    relatedData,
    handleSelectRelatedEntity
  } = useGenericEntityForm({
    entityType: 'entites', // Type d'entité (pour navigation)
    entityId: entiteId,    // ID de l'entité à éditer
    collectionName: 'entites', // Collection Firestore
    initialData: {
      // Valeurs par défaut
      nom: '',
      actif: true
    },
    validateForm: (data) => {
      // Validation personnalisée
      const errors = {};
      if (!data.nom) errors.nom = 'Le nom est requis';
      return {
        isValid: Object.keys(errors).length === 0,
        errors,
        message: Object.keys(errors).length > 0 ? 'Formulaire incomplet' : null
      };
    },
    transformData: (data) => {
      // Transformation des données avant sauvegarde
      return {
        ...data,
        nomNormalise: data.nom?.toLowerCase()
      };
    },
    onSuccess: (savedId, data) => {
      // Actions après sauvegarde réussie
      console.log(`Entité ${savedId} sauvegardée`);
    },
    relatedEntities: [
      // Définition des entités liées
      {
        name: 'parent',
        collection: 'parents',
        idField: 'parentId'
      }
    ]
  });

  // Utiliser les valeurs et fonctions retournées...
};
```

### Création d'un Hook Spécialisé Basé sur le Hook Générique

Si vous avez des besoins spécifiques à une entité, créez un hook qui utilise le hook générique en interne :

```javascript
import { useGenericEntityForm } from '@/hooks/common';

export const useMonEntiteForm = (entiteId) => {
  // Logique de validation spécifique
  const validateEntite = (data) => {
    // Validation personnalisée
    return { isValid: true, errors: {} };
  };

  // Utiliser le hook générique
  const formHook = useGenericEntityForm({
    entityType: 'entites',
    entityId: entiteId,
    collectionName: 'entites',
    validateForm: validateEntite,
    // Autres options...
  });

  // Ajouter des fonctionnalités spécifiques
  const fonctionSpecifique = () => {
    // Logique spécifique à l'entité...
  };

  // Retourner le hook générique enrichi
  return {
    ...formHook,
    fonctionSpecifique
  };
};
```

## Utilisation de `useGenericEntityDetails`

```javascript
import { useGenericEntityDetails } from '@/hooks/common';

const {
  entity,
  loading,
  error,
  reload,
  deleteEntity,
  formData,
  setFormData,
  handleChange,
  saveChanges,
  isDirty,
  relatedData
} = useGenericEntityDetails({
  entityType: 'entites',
  id: entiteId,
  collectionName: 'entites',
  relatedEntities: [
    {
      name: 'sousEntites',
      collection: 'sousEntites',
      query: (db) => query(collection(db, 'sousEntites'), where('entiteId', '==', entiteId))
    }
  ]
});
```

## Utilisation de `useGenericEntitySearch`

```javascript
import { useGenericEntitySearch } from '@/hooks/common';

const {
  searchTerm,
  setSearchTerm,
  searchResults,
  loading,
  error,
  selectedEntity,
  setSelectedEntity
} = useGenericEntitySearch({
  collectionName: 'entites',
  searchFields: ['nom', 'description'],
  limit: 10
});
```

## Utilisation de `useGenericEntityList`

```javascript
import { useGenericEntityList } from '@/hooks/common';

const {
  items,
  allItems,
  loading,
  error,
  searchTerm,
  setSearchTerm,
  filters,
  setFilter,
  clearFilters,
  sortField,
  sortDirection,
  setSortField,
  setSortDirection
} = useGenericEntityList({
  collectionName: 'entites',
  searchFields: ['nom', 'description'],
  initialSortField: 'nom',
  filterConfig: {
    type: { type: 'equals' },
    dateCreation: { type: 'range' }
  }
});
```

## Avantages d'Utiliser Directement les Hooks Génériques

1. **Éviter la double migration** : Pas besoin de passer par des hooks intermédiaires qui seront supprimés en novembre 2025
2. **Accès à toutes les fonctionnalités** : Les hooks génériques offrent plus d'options que leurs wrappers
3. **Meilleure maintenabilité** : Code plus cohérent avec la direction technique du projet
4. **Performance** : Les hooks génériques utilisent des optimisations comme `useCallback` et `useMemo`
5. **Extensibilité** : Facile à personnaliser pour des besoins spécifiques

## Pièges à Éviter

1. **Ne pas mélanger approches** : Évitez de mélanger hooks spécifiques et hooks génériques dans un même composant
2. **Attention aux props manquantes** : Les hooks génériques nécessitent certaines props obligatoires
3. **Vérification des types** : Les hooks génériques supposent certains formats de données, vérifiez la documentation

---

Pour toute question sur l'utilisation des hooks génériques ou pour signaler des problèmes, contactez l'équipe technique.

**Références**:
- [Plan de dépréciation des hooks](/docs/hooks/PLAN_DEPRECIATION_HOOKS.md)
- [Documentation des hooks génériques](/docs/hooks/)