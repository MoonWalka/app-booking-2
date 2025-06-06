# Documentation: useGenericEntityDetails

*Document créé le: 5 mai 2025*

## Introduction

`useGenericEntityDetails` est un hook React générique conçu pour standardiser la récupération et la gestion des détails d'une entité dans l'application TourCraft. Ce hook centralise les fonctionnalités communes à tous les hooks de détails spécifiques (comme `useLieuDetails`, `useConcertDetails`, etc.) tout en offrant la flexibilité nécessaire pour s'adapter aux besoins spécifiques de chaque type d'entité.

## Objectifs

- Éliminer la duplication de code entre les différents hooks de détails
- Standardiser l'interface des hooks de détails d'entité
- Faciliter la création de nouveaux hooks de détails
- Améliorer la maintenabilité et la testabilité
- Permettre une personnalisation facile pour des cas spécifiques

## Installation

Le hook est disponible dans le module `@/hooks/common`:

```javascript
import { useGenericEntityDetails } from '@/hooks/common';
```

## API

### Paramètres

Le hook accepte un objet de configuration avec les propriétés suivantes :

```typescript
interface GenericEntityDetailsConfig {
  // Configuration de base
  entityType: string;               // Type d'entité (ex: 'concerts', 'lieux')
  collectionName: string;           // Nom de la collection Firestore
  id: string | null;                // ID de l'entité à charger (null = nouvelle entité)
  idField?: string;                 // Nom du champ d'ID (défaut: 'id')
  
  // Transformation et validation des données
  transformData?: (data: any) => any; // Transformer les données après chargement
  
  // Configuration des relations
  relatedEntities?: RelatedEntityConfig[];  // Configuration des entités liées
  loadRelatedEntities?: boolean;    // Charger automatiquement les entités liées
  
  // Callbacks
  onLoadSuccess?: (data: any) => void;  // Callback après chargement réussi
  onLoadError?: (error: any) => void;   // Callback en cas d'erreur
  
  // Options avancées
  realtime?: boolean;               // Écouter les changements en temps réel
  includeDeleted?: boolean;         // Inclure les entités marquées comme supprimées
  cache?: {                         // Options de mise en cache
    enabled: boolean;               // Activer la mise en cache
    ttl?: number;                   // Durée de vie du cache en ms
  };
}

interface RelatedEntityConfig {
  name: string;                     // Nom de la relation
  collectionName: string;           // Collection de l'entité liée
  idField: string;                  // Champ contenant l'ID de l'entité liée
  type: 'single' | 'multiple';      // Type de relation
  loadImmediately?: boolean;        // Charger immédiatement (défaut: false)
  transformData?: (data: any) => any; // Transformer les données de l'entité liée
}
```

### Valeurs retournées

Le hook retourne un objet avec les propriétés et méthodes suivantes :

```typescript
interface GenericEntityDetailsResult {
  // États
  entity: any;                      // Données de l'entité
  loading: boolean;                 // État de chargement
  error: Error | null;              // Erreur éventuelle
  
  // Entités liées
  relatedEntities: {                // Données des entités liées
    [key: string]: {
      data: any;                    // Données de l'entité liée
      loading: boolean;             // État de chargement
      error: Error | null;          // Erreur éventuelle
    }
  };
  
  // Méthodes
  refresh: () => Promise<void>;     // Recharger l'entité
  loadRelatedEntity: (name: string) => Promise<void>;  // Charger une entité liée spécifique
  
  // États dérivés
  isNew: boolean;                   // Indique si l'entité est nouvelle
  isEmpty: boolean;                 // Indique si l'entité est vide
  hasLoadedSuccessfully: boolean;   // Indique si le chargement a réussi
}
```

## Exemples d'utilisation

### Exemple de base

```javascript
import { useGenericEntityDetails } from '@/hooks/common';

function ConcertDetails({ concertId }) {
  const {
    entity: concert,
    loading,
    error,
    refresh
  } = useGenericEntityDetails({
    entityType: 'concerts',
    collectionName: 'concerts',
    id: concertId
  });
  
  if (loading) return <p>Chargement en cours...</p>;
  if (error) return <p>Erreur: {error.message}</p>;
  if (!concert) return <p>Concert non trouvé</p>;
  
  return (
    <div>
      <h1>{concert.titre}</h1>
      <p>Date: {formatDate(concert.date)}</p>
      <button onClick={refresh}>Rafraîchir</button>
    </div>
  );
}
```

### Exemple avec entités liées

```javascript
const concertDetails = useGenericEntityDetails({
  entityType: 'concerts',
  collectionName: 'concerts',
  id: concertId,
  relatedEntities: [
    {
      name: 'lieu',
      collectionName: 'lieux',
      idField: 'lieuId',
      type: 'single',
      loadImmediately: true
    },
    {
      name: 'artiste',
      collectionName: 'artistes',
      idField: 'artisteId',
      type: 'single',
      loadImmediately: true
    }
  ]
});

// Accès aux entités liées
const { data: lieu, loading: lieuLoading } = concertDetails.relatedEntities.lieu;
const { data: artiste, loading: artisteLoading } = concertDetails.relatedEntities.artiste;
```

### Exemple avec transformation de données

```javascript
const programmateurDetails = useGenericEntityDetails({
  entityType: 'programmateurs',
  collectionName: 'programmateurs',
  id: programmateurId,
  transformData: (data) => ({
    ...data,
    nomComplet: `${data.prenom} ${data.nom}`,
    estActif: data.statut === 'actif',
    dateModificationFormatee: formatDate(data.dateModification)
  })
});
```

### Exemple d'écoute en temps réel

```javascript
const contratDetails = useGenericEntityDetails({
  entityType: 'contrats',
  collectionName: 'contrats',
  id: contratId,
  realtime: true,  // Écoute les mises à jour en temps réel
  onLoadSuccess: (data) => console.log("Contrat mis à jour:", data)
});
```

## Migration depuis un hook existant

Pour migrer depuis un hook spécifique comme `useLieuDetails`, créez un wrapper qui utilise `useGenericEntityDetails` tout en conservant l'API du hook original pour assurer la compatibilité :

```javascript
// Ancien hook
const useLieuDetails = (lieuId) => {
  // Logique spécifique...
};

// Nouveau hook basé sur useGenericEntityDetails
const useLieuDetails = (lieuId) => {
  const detailsHook = useGenericEntityDetails({
    entityType: 'lieux',
    collectionName: 'lieux',
    id: lieuId,
    transformData: (lieu) => ({
      ...lieu,
      adresseComplete: `${lieu.adresse}, ${lieu.codePostal} ${lieu.ville}`
    }),
    relatedEntities: [
      {
        name: 'programmateur',
        collectionName: 'programmateurs',
        idField: 'programmateurId',
        type: 'single'
      }
    ]
  });
  
  // Ajouter des fonctionnalités spécifiques à useLieuDetails
  const { entity: lieu } = detailsHook;
  
  const fonctionSpecifique = useCallback(() => {
    // Logique spécifique aux lieux
  }, [lieu]);
  
  // Retourner une interface compatible avec l'ancien hook
  return {
    ...detailsHook,
    lieu: detailsHook.entity,
    fonctionSpecifique
  };
};
```

## Bonnes pratiques

### 1. Configuration des entités liées

Pour une performance optimale, configurez correctement les entités liées :

```javascript
// Bon exemple : chargement sélectif des entités liées
relatedEntities: [
  {
    name: 'programmateur',
    collectionName: 'programmateurs',
    idField: 'programmateurId',
    type: 'single',
    loadImmediately: false  // Ne charger que lorsque nécessaire
  }
]

// Puis, charger explicitement lorsque nécessaire
const handleLoadProgrammateur = () => {
  detailsHook.loadRelatedEntity('programmateur');
};
```

### 2. Mise en cache

Activez la mise en cache pour améliorer les performances :

```javascript
useGenericEntityDetails({
  // ...autres options
  cache: {
    enabled: true,
    ttl: 60000  // 1 minute
  }
})
```

### 3. Transformations des données

Utilisez les transformations pour préparer les données :

```javascript
transformData: (data) => {
  // Calculer des propriétés dérivées
  return {
    ...data,
    isActive: data.status === 'active',
    formattedDate: formatDate(data.date),
    // Filtrer des propriétés sensibles ou inutiles
    _privateInfo: undefined
  };
}
```

## Cas d'utilisation avancés

### Dépendances circulaires

Si vous avez des entités avec des références circulaires, utilisez `loadImmediately: false` pour éviter les boucles infinies :

```javascript
// Dans useProgrammateurDetails
relatedEntities: [
  {
    name: 'lieux',
    collectionName: 'lieux',
    idField: 'lieuxIds',  // Tableau d'IDs
    type: 'multiple',
    loadImmediately: false  // Important pour éviter les boucles
  }
]
```

### Chargement conditionnel

Vous pouvez charger conditionnellement certaines relations en fonction des valeurs de l'entité principale :

```javascript
const concertDetails = useGenericEntityDetails({
  entityType: 'concerts',
  collectionName: 'concerts',
  id: concertId,
  onLoadSuccess: (concert) => {
    // Charger l'artiste seulement si le concert est confirmé
    if (concert.status === 'confirmed') {
      concertDetails.loadRelatedEntity('artiste');
    }
  }
});
```

### Mode hors-ligne

Le hook prend en charge le mode hors-ligne de Firebase :

```javascript
// Le hook tentera de récupérer les données depuis le cache Firestore
// si l'application est hors-ligne
const lieuDetails = useGenericEntityDetails({
  entityType: 'lieux',
  collectionName: 'lieux',
  id: lieuId
});
```

## Dépannage

### Problème : L'entité ne se charge pas

Vérifications à effectuer :
1. L'ID est-il correct ? (`console.log(id)`)
2. La collection existe-t-elle ? (`console.log(collectionName)`)
3. Y a-t-il des erreurs Firestore ? (`console.log(error)`)

### Problème : Les entités liées ne se chargent pas

Vérifications à effectuer :
1. Le champ ID est-il correct dans l'entité principale ?
2. `loadImmediately` est-il défini à `true` ?
3. L'ID de l'entité liée existe-t-il dans la collection cible ?

### Problème : Les performances sont lentes

Solutions :
1. N'activez `loadImmediately` que pour les relations critiques
2. Utilisez la mise en cache (`cache.enabled: true`)
3. Limitez les transformations coûteuses dans `transformData`

## Extension de useGenericEntityDetails

Vous pouvez étendre les fonctionnalités du hook pour des besoins spécifiques :

```javascript
// Hook étendu avec des fonctionnalités d'export PDF
const useConcertDetailsWithExport = (concertId) => {
  const detailsHook = useGenericEntityDetails({
    entityType: 'concerts',
    collectionName: 'concerts',
    id: concertId
  });
  
  // Fonctionnalité supplémentaire
  const exportToPDF = useCallback(() => {
    if (!detailsHook.entity) return;
    
    // Logique d'export PDF
    const { entity: concert } = detailsHook;
    generateConcertPDF(concert);
  }, [detailsHook.entity]);
  
  return {
    ...detailsHook,
    exportToPDF
  };
};
```

## FAQ

**Q: Puis-je utiliser ce hook avec autre chose que Firestore ?**  
R: Actuellement, le hook est conçu pour Firestore, mais il peut être adapté pour d'autres sources de données en modifiant son implémentation interne.

**Q: Comment gérer les permissions ?**  
R: Le hook utilise Firestore directement, donc les règles de sécurité Firestore s'appliquent. Pour des contrôles supplémentaires, interceptez les erreurs avec `onLoadError`.

**Q: Est-il thread-safe pour plusieurs instances ?**  
R: Oui, chaque appel au hook crée sa propre instance indépendante avec son propre état.

**Q: Comment l'utiliser avec TypeScript ?**  
R: Des types sont fournis. Vous pouvez spécifier le type d'entité :
```typescript
const { entity } = useGenericEntityDetails<Concert>({...});
// entity est typé comme Concert
```

## Implémentation interne

Le hook utilise :
- `useState` pour gérer l'état local
- `useEffect` pour les effets de chargement
- `useCallback` pour les fonctions mémorisées
- `useMemo` pour les valeurs calculées
- La fonction `onSnapshot` de Firestore pour l'écoute en temps réel

## Historique des modifications

| Date | Version | Description | Auteur |
|------|---------|-------------|--------|
| 05/05/2025 | 1.0.0 | Version initiale | Copilot |
| 05/05/2025 | 1.0.1 | Correction du bug de collision de noms | Copilot |

## Prochaines améliorations prévues

1. Support pour la pagination des entités liées multiples
2. Optimisation des performances pour les grandes collections
3. Support pour les transactions Firestore
4. Option pour charger uniquement certains champs d'une entité

## Conclusion

`useGenericEntityDetails` représente une avancée significative dans la standardisation des hooks de l'application TourCraft. En centralisant la logique de récupération et de gestion des détails d'entités, ce hook contribue à réduire la duplication de code et à améliorer la maintenabilité de l'application.

Sa conception flexible permet de l'adapter facilement à différents types d'entités, tout en offrant des fonctionnalités avancées comme le chargement d'entités liées, la transformation des données et la mise en cache.