# Guide Pratique pour la Migration des Hooks TourCraft

*Document créé le: 5 mai 2025*
*Dernière mise à jour: 5 mai 2025*

Ce guide fournit des instructions détaillées pour migrer les hooks existants vers les versions génériques, en se basant sur les exemples déjà réalisés.

## 🧑‍💻 GUIDE DÉVELOPPEUR : Migration des Hooks

### Ce que vous devez savoir

TourCraft est en cours de migration vers un ensemble de hooks génériques qui permettent de :
- Réduire la duplication de code entre les différents hooks spécifiques à chaque entité
- Standardiser les interfaces et les comportements
- Faciliter la maintenance et l'évolution des fonctionnalités

Les quatre types de hooks génériques sont :
- `useGenericEntitySearch` - Pour la recherche d'entités
- `useGenericEntityList` - Pour la gestion des listes et filtres
- `useGenericEntityDetails` - Pour le chargement et la modification des détails d'une entité
- `useGenericEntityForm` - Pour la gestion des formulaires

### Processus de migration en 5 étapes

#### 1. Analyser le hook existant

Avant de commencer la migration, analysez le hook existant pour comprendre :
- Quelles données sont manipulées
- Quels états sont gérés
- Quelles fonctions sont exposées
- Quelles spécificités métier existent

Exemple :
```javascript
// Hook original
const useLieuxFilters = (lieux = []) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('tous');
  const [filterRegion, setFilterRegion] = useState('toutes');
  // ...
};
```

#### 2. Identifier la configuration du hook générique

Pour chaque hook à migrer, identifiez la configuration appropriée :

**Pour un hook de liste** (`useGenericEntityList`) :
```javascript
const config = {
  collectionName: 'nomCollection',  // Nom de la collection Firestore
  filterConfig: {                   // Configuration des filtres
    champ1: { type: 'equals' },
    champ2: { type: 'range' }
  },
  searchFields: ['champ1', 'champ2'],  // Champs pour la recherche
  initialSortField: 'champ1'           // Tri par défaut
};
```

**Pour un hook de détails** (`useGenericEntityDetails`) :
```javascript
const config = {
  collectionName: 'nomCollection',
  relatedEntities: [
    { name: 'entitéLiée', idField: 'champId', collection: 'autreCollection' }
  ],
  formatFields: {
    date: (value) => format(new Date(value), 'dd/MM/yyyy')
  }
};
```

#### 3. Créer le hook migré

Créez un nouveau fichier pour le hook migré en suivant cette convention de nommage :
- Original : `useHookName.js`
- Migré : `useHookNameMigrated.js`

Utilisez le hook générique approprié et adaptez l'interface pour maintenir la compatibilité :

```javascript
// Nouveau hook migré
import { useGenericEntityList } from '@/hooks/common';

const useHookNameMigrated = (params) => {
  // Configuration du hook générique
  const genericHook = useGenericEntityList({
    // Configuration spécifique...
  });
  
  // Adapter l'API pour maintenir la compatibilité
  return {
    // Propriétés et méthodes originales
    data: genericHook.items,
    loading: genericHook.loading,
    customFunction: () => {
      // Logique spécifique qui s'appuie sur le hook générique
    }
  };
};
```

#### 4. Tester le hook migré

Créez des tests unitaires pour vérifier que le hook migré :
- Fournit toutes les données et fonctions de l'API originale
- Se comporte comme prévu dans différents scénarios
- Gère correctement les cas d'erreur

```javascript
// Dans un fichier de test
test('le hook migré devrait exposer la même API que l\'original', () => {
  const { result } = renderHook(() => useHookNameMigrated());
  
  expect(result.current).toHaveProperty('data');
  expect(result.current).toHaveProperty('loading');
  expect(result.current).toHaveProperty('customFunction');
});
```

#### 5. Intégrer le hook migré

Une fois testé, vous pouvez commencer à intégrer le hook migré dans vos composants :

```javascript
// Dans un composant
// Avant
import { useHookName } from '@/hooks/entity';

// Après
import { useHookNameMigrated as useHookName } from '@/hooks/entity';

// Le reste du code reste inchangé grâce à la compatibilité de l'API
```

### Exemples de migration par type de hook

### Migration d'un hook de liste

Exemple de migration de `useConcertFilters` :

```javascript
// Hook original simplifié
const useConcertFilters = (concerts = []) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('tous');
  
  const filteredConcerts = useMemo(() => {
    return concerts.filter(concert => {
      if (searchTerm && !concert.titre.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (statusFilter !== 'tous' && concert.statut !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [concerts, searchTerm, statusFilter]);
  
  return {
    concerts,
    filteredConcerts,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter
  };
};

// Hook migré
import { useGenericEntityList } from '@/hooks/common';

const useConcertFiltersMigrated = (concerts = []) => {
  const genericList = useGenericEntityList({
    collectionName: 'concerts',
    initialItems: concerts,
    paginationMode: concerts.length > 0 ? 'client' : 'server',
    filterConfig: {
      statut: { type: 'equals' }
    },
    searchFields: ['titre', 'lieu'],
    initialSortField: 'date',
    initialSortDirection: 'desc'
  });
  
  return {
    concerts: genericList.allItems,
    filteredConcerts: genericList.items,
    searchTerm: genericList.searchTerm,
    setSearchTerm: genericList.setSearchTerm,
    statusFilter: genericList.filters.statut || 'tous',
    setStatusFilter: (status) => genericList.setFilter('statut', status === 'tous' ? null : status)
  };
};
```

### Migration d'un hook de détails

Exemple de migration de `useLieuDetails` :

```javascript
// Hook migré
import { useGenericEntityDetails } from '@/hooks/common';

const useLieuDetailsMigrated = (id) => {
  const genericDetails = useGenericEntityDetails({
    collectionName: 'lieux',
    id,
    relatedEntities: [
      { 
        name: 'programmateur', 
        idField: 'programmateurId', 
        collection: 'programmateurs' 
      }
    ],
    formatFields: {
      createdAt: (value) => value ? format(new Date(value), 'dd/MM/yyyy HH:mm') : '-'
    },
    validateFormFn: validateLieuForm
  });
  
  // Logique métier spécifique aux lieux
  const handleProgrammateurChange = (newProgrammateur) => {
    if (newProgrammateur) {
      genericDetails.updateFormData({
        ...genericDetails.formData,
        programmateurId: newProgrammateur.id,
        programmateur: {
          id: newProgrammateur.id,
          nom: newProgrammateur.nom,
          prenom: newProgrammateur.prenom
        }
      });
    } else {
      genericDetails.updateFormData({
        ...genericDetails.formData,
        programmateurId: null,
        programmateur: null
      });
    }
  };
  
  return {
    ...genericDetails,
    handleProgrammateurChange
  };
};
```

## 🤖 SECTION COPILOT : Informations Détaillées

### Analyse des différences entre hooks génériques

#### useGenericEntityList vs useGenericEntityDetails

| Aspect | useGenericEntityList | useGenericEntityDetails |
|--------|----------------------|------------------------|
| **Focus principal** | Collections d'entités | Entité individuelle |
| **Opérations CRUD** | Lecture (list) | Lecture, création, mise à jour, suppression |
| **Filtrage** | Oui, configurable | Non applicable |
| **Pagination** | Oui, modes client/serveur | Non applicable |
| **Relations** | Limitées | Complètes, avec chargement récursif |
| **États d'interface** | Liste/grille | Vue/édition |

#### Cas spécifiques à gérer lors de la migration

1. **Relations bidirectionnelles complexes**

Pour les entités avec des relations bidirectionnelles (comme les programmateurs et structures), vous devrez adapter la logique de synchronisation :

```javascript
// Dans useGenericEntityDetails
onBeforeSubmit: async (formData, originalData) => {
  // Vérifiez les modifications de relations
  if (formData.structureId !== originalData.structureId) {
    // Mise à jour de l'ancienne structure (supprimer la référence)
    if (originalData.structureId) {
      await removeEntityReference('structures', originalData.structureId, 
        'programmateursAssocies', originalData.id);
    }
    
    // Mise à jour de la nouvelle structure (ajouter la référence)
    if (formData.structureId) {
      await addEntityReference('structures', formData.structureId,
        'programmateursAssocies', {
          id: originalData.id,
          nom: formData.nom,
          prenom: formData.prenom
        });
    }
  }
  
  return formData;
}
```

2. **Traitement spécifique par type d'entité**

Certaines entités peuvent nécessiter un traitement particulier :

```javascript
// Dans un hook migré spécifique
const generateContratPdf = async () => {
  const entityData = genericDetails.entity;
  if (!entityData) return null;
  
  try {
    // Logique spécifique pour générer un PDF pour cette entité
    return await contratService.generatePdf(entityData.id);
  } catch (error) {
    console.error('Erreur lors de la génération du PDF', error);
    return null;
  }
};
```

### Stratégies de test pour les hooks migrés

1. **Tests d'équivalence fonctionnelle**

Vérifiez que les hooks migrés se comportent comme les originaux :

```javascript
test('le hook migré devrait filtrer de la même manière que l\'original', async () => {
  // Données de test
  const testData = [ /* ... */ ];
  
  // Rendu des deux hooks
  const { result: originalResult } = renderHook(() => useOriginalHook(testData));
  const { result: migratedResult } = renderHook(() => useMigratedHook(testData));
  
  // Application d'un filtre identique
  act(() => {
    originalResult.current.setStatusFilter('confirme');
    migratedResult.current.setStatusFilter('confirme');
  });
  
  // Vérification que les résultats filtrés sont identiques
  expect(migratedResult.current.filteredConcerts).toEqual(
    originalResult.current.filteredConcerts
  );
});
```

2. **Tests pour les fonctionnalités étendues**

Vérifiez les nouvelles fonctionnalités apportées par les hooks génériques :

```javascript
test('le hook migré devrait prendre en charge le tri des résultats', async () => {
  const { result } = renderHook(() => useMigratedHook(testData));
  
  // Tester le tri, une fonctionnalité potentiellement nouvelle
  act(() => {
    result.current.setSort('date', 'desc');
  });
  
  // Vérifier que les résultats sont triés
  const items = result.current.filteredConcerts;
  for (let i = 1; i < items.length; i++) {
    expect(new Date(items[i-1].date) >= new Date(items[i].date)).toBe(true);
  }
});
```

### Hooks restants à migrer et particularités

#### Hooks de détails

1. **useLieuDetails**
   - Point d'attention : Relations avec programmateurs
   - Complexité : Faible

2. **useProgrammateurDetails**
   - Point d'attention : Relations bidirectionnelles avec structures
   - Complexité : Moyenne
   - Suggestion : Utiliser le hook `onBeforeSubmit` pour synchroniser les modifications

3. **useStructureDetails**
   - Point d'attention : Gestion d'un tableau de programmateurs associés
   - Complexité : Moyenne à élevée
   - Suggestion : Implémenter une logique personnalisée pour la gestion des collections

4. **useArtisteDetails**
   - Point d'attention : Gestion simplifiée, pas de relations bidirectionnelles complexes
   - Complexité : Faible

#### Hooks de liste

1. **useConcertFilters**
   - Point d'attention : Filtrage par statut et date
   - Complexité : Moyenne
   - Suggestion : Utiliser les types de filtres `equals` et `date-range`

2. **useArtisteFilters**
   - Point d'attention : Filtrage par genre musical
   - Complexité : Faible
   - Suggestion : Utiliser le type de filtre `in` pour les genres multiples

3. **useProgrammateursFilters**
   - Point d'attention : Dépendances au composant de recherche
   - Complexité : Moyenne
   - Suggestion : Adapter l'API pour maintenir la compatibilité avec les composants existants

4. **useStructuresFilters**
   - Point d'attention : Filtrage par type de structure
   - Complexité : Faible
   - Suggestion : Utiliser une configuration similaire à `useLieuxFiltersMigrated`

### Timeline recommandée pour la migration

| Semaine | Objectifs |
|---------|-----------|
| Semaine 1 | - Migrer useLieuDetails<br>- Migrer useArtisteFilters<br>- Tester ces migrations |
| Semaine 2 | - Migrer useProgrammateurDetails<br>- Migrer useConcertFilters<br>- Tester ces migrations |
| Semaine 3 | - Migrer useStructureDetails<br>- Migrer useProgrammateursFilters<br>- Migrer useStructuresFilters<br>- Tester ces migrations |
| Semaine 4 | - Finaliser tous les tests de non-régression<br>- Basculer l'application vers les hooks migrés<br>- Documentation finale |

### Conseils pour une migration réussie

1. **Commencez par les hooks les plus simples** : Gagnez en expérience avant d'aborder les cas complexes

2. **Conservez l'API originale** : Assurez-vous que le hook migré expose les mêmes propriétés/méthodes que l'original

3. **Utilisez les tests comme guide** : Écrivez d'abord les tests qui vérifient la compatibilité avec l'ancien hook

4. **Migrez un hook à la fois** : Ne modifiez pas plusieurs hooks interconnectés simultanément

5. **Testez dans des composants réels** : Après les tests unitaires, vérifiez le comportement dans l'interface utilisateur

6. **Documentation des différences** : Si certains comportements changent malgré vos efforts, documentez-les clairement

7. **Prévoyez une stratégie de rollback** : Conservez l'ancien hook et permettez de basculer facilement entre les versions

## Conclusion

La migration vers les hooks génériques permet d'améliorer considérablement la maintenabilité du code tout en offrant de nouvelles fonctionnalités. En suivant ce guide et les exemples déjà réalisés, vous pourrez migrer progressivement l'ensemble des hooks spécifiques vers leurs versions génériques.

---

*Références:*
- [SPEC_API_GENERIC_ENTITY_LIST.md](/docs/hooks/SPEC_API_GENERIC_ENTITY_LIST.md)
- [SPEC_API_GENERIC_ENTITY_DETAILS.md](/docs/hooks/SPEC_API_GENERIC_ENTITY_DETAILS.md)
- [DOCUMENTATION_GENERIC_ENTITY_LIST.md](/docs/hooks/DOCUMENTATION_GENERIC_ENTITY_LIST.md)
- [JOURNAL_MIGRATION_HOOKS.md](/docs/hooks/JOURNAL_MIGRATION_HOOKS.md)