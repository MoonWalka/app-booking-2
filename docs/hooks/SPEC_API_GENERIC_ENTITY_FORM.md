# Spécification d'API: useGenericEntityForm

*Document créé le: 5 mai 2025*

## Vue d'ensemble

`useGenericEntityForm` est un hook générique conçu pour standardiser la gestion des formulaires d'entités dans l'application TourCraft. Il centralise les fonctionnalités de chargement, d'édition, de validation et de soumission des données d'entité, en offrant une interface cohérente et flexible qui peut être adaptée à différents types d'entités.

## Objectifs

- Standardiser la gestion des formulaires d'entités à travers l'application
- Réduire la duplication de code entre les différents hooks de formulaire
- Améliorer la maintenabilité et la testabilité du code
- Simplifier la création de nouveaux formulaires d'entités
- Permettre la personnalisation du comportement pour différents types d'entités
- Faciliter l'intégration avec les hooks de recherche d'entités liées

## API

### Paramètres

`useGenericEntityForm` accepte un objet de configuration avec les propriétés suivantes :

#### Configuration de base

| Propriété | Type | Requis | Description |
|-----------|------|--------|-------------|
| `entityType` | string | Oui | Le type d'entité (ex: 'concert', 'artiste', 'lieu') |
| `collectionName` | string | Oui | Le nom de la collection Firestore à interroger |
| `id` | string | Non | L'identifiant de l'entité à charger (null/undefined pour nouvelle entité) |
| `idField` | string | Non | Le nom du champ identifiant (défaut: 'id') |
| `initialData` | object | Non | Données initiales pour le formulaire |

#### Validation et traitement des données

| Propriété | Type | Requis | Description |
|-----------|------|--------|-------------|
| `validationSchema` | Yup.Schema | Non | Schéma de validation Yup pour les données du formulaire |
| `initialErrors` | object | Non | Erreurs initiales pour le formulaire |
| `transformBeforeSave` | function | Non | Fonction pour transformer les données avant la sauvegarde |
| `transformAfterLoad` | function | Non | Fonction pour transformer les données après le chargement |
| `customValidation` | function | Non | Fonction de validation personnalisée |

#### Gestion des relations

| Propriété | Type | Requis | Description |
|-----------|------|--------|-------------|
| `relationFields` | array | Non | Liste des champs relatifs aux entités liées |
| `relationConfig` | object | Non | Configuration des relations (clés étrangères, chemins de cache) |
| `loadRelatedEntities` | boolean | Non | Charger automatiquement les entités liées (défaut: false) |

#### Options avancées

| Propriété | Type | Requis | Description |
|-----------|------|--------|-------------|
| `enableDraftSaving` | boolean | Non | Activer l'enregistrement automatique de brouillons (défaut: false) |
| `draftInterval` | number | Non | Intervalle entre les sauvegardes automatiques en ms (défaut: 30000) |
| `history` | object | Non | Objet React Router history pour la navigation |
| `onSaveSuccess` | function | Non | Fonction appelée après une sauvegarde réussie |
| `onSaveError` | function | Non | Fonction appelée en cas d'erreur lors de la sauvegarde |
| `onDeleteSuccess` | function | Non | Fonction appelée après une suppression réussie |
| `onDeleteError` | function | Non | Fonction appelée en cas d'erreur lors de la suppression |

### Valeur retournée

L'hook retourne un objet avec les propriétés et méthodes suivantes :

#### Données et état

| Propriété | Type | Description |
|-----------|------|-------------|
| `formData` | object | Les données actuelles du formulaire |
| `entity` | object | L'entité originale chargée de Firestore |
| `loading` | boolean | Indique si les données sont en cours de chargement |
| `saving` | boolean | Indique si les données sont en cours de sauvegarde |
| `deleting` | boolean | Indique si l'entité est en cours de suppression |
| `errors` | object | Les erreurs de validation actuelles |
| `isValid` | boolean | Indique si le formulaire est valide |
| `isDirty` | boolean | Indique si le formulaire a été modifié |
| `isNew` | boolean | Indique si l'entité est nouvelle ou existante |

#### Méthodes de manipulation des données

| Méthode | Signature | Description |
|---------|-----------|-------------|
| `handleChange` | (event) => void | Gère les changements de champs standard |
| `handleCustomChange` | (name, value) => void | Gère les changements de champs personnalisés |
| `setFormData` | (data) => void | Met à jour l'ensemble des données du formulaire |
| `resetForm` | () => void | Réinitialise le formulaire à son état initial |
| `validateForm` | () => Promise<boolean> | Valide le formulaire et renvoie si valide |
| `validateField` | (name) => Promise<void> | Valide un champ spécifique |

#### Méthodes de persistance

| Méthode | Signature | Description |
|---------|-----------|-------------|
| `handleSubmit` | (event?) => Promise<void> | Valide et soumet le formulaire |
| `saveEntity` | () => Promise<string> | Sauvegarde l'entité et retourne son ID |
| `deleteEntity` | () => Promise<void> | Supprime l'entité |
| `saveDraft` | () => Promise<void> | Sauvegarde un brouillon de l'entité |

#### Gestion des relations

| Méthode | Signature | Description |
|---------|-----------|-------------|
| `setRelatedEntity` | (field, entity) => void | Associe une entité liée |
| `removeRelatedEntity` | (field) => void | Supprime une association |
| `getRelatedEntityId` | (field) => string | Obtient l'ID d'une entité liée |
| `getCachedRelatedData` | (field) => object | Obtient les données en cache d'une entité liée |

## Types de relations supportées

Le hook prend en charge les types d'association suivants :

### Relations simples (one-to-one)

- **Référence directe** : Stockage de l'ID de l'entité liée
- **Cache** : Stockage des données essentielles pour réduire les requêtes

### Relations multiples (one-to-many)

- **Array de références** : Stockage d'un tableau d'IDs
- **Collection imbriquée** : Stockage de petites collections dans l'entité

## Exemples d'utilisation

### Exemple simple : Formulaire d'artiste

```javascript
import useGenericEntityForm from '@/hooks/common/useGenericEntityForm';
import { artisteSchema } from '@/schemas/artisteSchema';

const useArtisteForm = (id) => {
  const formHook = useGenericEntityForm({
    entityType: 'artiste',
    collectionName: 'artistes',
    id,
    validationSchema: artisteSchema,
    initialData: {
      nom: '',
      style: '',
      biographie: '',
      dateCreation: new Date()
    }
  });
  
  return formHook;
};
```

### Exemple avancé : Formulaire de concert avec relations

```javascript
import useGenericEntityForm from '@/hooks/common/useGenericEntityForm';
import { concertSchema } from '@/schemas/concertSchema';
import useGenericEntitySearch from '@/hooks/common/useGenericEntitySearch';
import { useNavigate } from 'react-router-dom';

const useConcertForm = (id) => {
  const navigate = useNavigate();
  
  const formHook = useGenericEntityForm({
    entityType: 'concert',
    collectionName: 'concerts',
    id,
    validationSchema: concertSchema,
    initialData: {
      titre: '',
      date: '',
      status: 'brouillon',
      artisteId: '',
      lieuId: '',
      programmateurId: '',
      artisteCache: null,
      lieuCache: null,
      programmateurCache: null
    },
    relationFields: ['artiste', 'lieu', 'programmateur'],
    relationConfig: {
      artiste: {
        idField: 'artisteId',
        cacheField: 'artisteCache'
      },
      lieu: {
        idField: 'lieuId',
        cacheField: 'lieuCache'
      },
      programmateur: {
        idField: 'programmateurId',
        cacheField: 'programmateurCache'
      }
    },
    transformBeforeSave: (data) => {
      // Transformer les données avant enregistrement
      return {
        ...data,
        dateModification: new Date()
      };
    },
    onSaveSuccess: (id) => navigate(`/concerts/${id}`),
    onSaveError: (error) => console.error('Erreur lors de la sauvegarde:', error)
  });
  
  // Intégration avec useGenericEntitySearch pour la recherche d'entités liées
  const lieuSearch = useGenericEntitySearch({
    collectionName: 'lieux',
    searchFields: ['nom', 'ville'],
    onSelect: (lieu) => {
      formHook.setRelatedEntity('lieu', lieu);
    }
  });
  
  const artisteSearch = useGenericEntitySearch({
    collectionName: 'artistes',
    searchFields: ['nom'],
    onSelect: (artiste) => {
      formHook.setRelatedEntity('artiste', artiste);
    }
  });
  
  const programmateurSearch = useGenericEntitySearch({
    collectionName: 'programmateurs',
    searchFields: ['nom', 'prenom', 'structure'],
    onSelect: (programmateur) => {
      formHook.setRelatedEntity('programmateur', programmateur);
    }
  });
  
  return {
    ...formHook,
    lieuSearch,
    artisteSearch,
    programmateurSearch
  };
};
```

### Migration depuis un hook existant

Pour migrer depuis un hook existant comme `useConcertForm` :

```javascript
// Ancien hook spécifique
const useConcertForm = (id) => {
  // ... logique spécifique avec useState, useEffect, etc.
};

// Nouveau hook basé sur useGenericEntityForm
const useConcertForm = (id) => {
  const formHook = useGenericEntityForm({
    entityType: 'concert',
    collectionName: 'concerts',
    id,
    // reste de la configuration...
  });
  
  // Adapter l'interface pour maintenir la compatibilité
  return {
    concert: formHook.entity,
    formData: formHook.formData,
    loading: formHook.loading,
    errors: formHook.errors,
    handleChange: formHook.handleChange,
    handleSubmit: formHook.handleSubmit,
    handleDelete: formHook.deleteEntity,
    setLieu: (lieu) => formHook.setRelatedEntity('lieu', lieu),
    setArtiste: (artiste) => formHook.setRelatedEntity('artiste', artiste),
    setProgrammateur: (programmateur) => formHook.setRelatedEntity('programmateur', programmateur),
    removeLieu: () => formHook.removeRelatedEntity('lieu'),
    removeArtiste: () => formHook.removeRelatedEntity('artiste'),
    removeProgrammateur: () => formHook.removeRelatedEntity('programmateur')
  };
};
```

## Implémentation interne

L'implémentation du hook utilisera les APIs suivantes :

- `useState` et `useReducer` pour la gestion d'état
- `useCallback` et `useMemo` pour l'optimisation des performances
- `useEffect` pour les effets secondaires et le chargement des données
- Firestore pour la persistance des données
- Yup pour la validation des schémas

## Recommandations d'utilisation

- Utilisez les schémas Yup pour une validation cohérente des données
- Pour les relations complexes, envisagez d'utiliser des sous-hooks spécifiques
- Définissez des transformations standardisées pour chaque type d'entité
- Utilisez `loadRelatedEntities: true` avec parcimonie, uniquement lorsque nécessaire

## Prochaines étapes

1. Implémentation du hook de base `useGenericEntityForm`
2. Migration des hooks existants vers le hook générique
3. Ajout du support pour les relations multiples (tableaux)
4. Intégration plus étroite avec `useGenericEntitySearch` et `useGenericEntityList`
5. Ajout de fonctionnalités avancées (historique des modifications, permissions)

## Historique des modifications

- 05/05/2025 : Création de la spécification initiale