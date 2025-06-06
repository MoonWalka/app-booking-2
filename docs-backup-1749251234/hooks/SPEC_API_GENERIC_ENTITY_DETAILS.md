# Spécification d'API: useGenericEntityDetails

*Document créé le: 5 mai 2025*

## Vue d'ensemble

`useGenericEntityDetails` est un hook générique conçu pour standardiser la gestion des détails d'entités dans l'application TourCraft. Il centralise les fonctionnalités de chargement, visualisation, édition et suppression des entités, ainsi que la gestion des entités associées, en offrant une interface cohérente et flexible qui peut être adaptée à différents types d'entités.

## Objectifs

- Standardiser la gestion des détails d'entités à travers l'application
- Réduire la duplication de code entre les différents hooks de détails
- Améliorer la maintenabilité et la testabilité du code
- Simplifier la création de nouvelles vues de détails
- Permettre la personnalisation du comportement pour différents types d'entités
- Gérer efficacement les entités liées et les associations bidirectionnelles

## API

### Paramètres

`useGenericEntityDetails` accepte un objet de configuration avec les propriétés suivantes :

#### Configuration de base

| Propriété | Type | Requis | Description |
|-----------|------|--------|-------------|
| `entityType` | string | Oui | Le type d'entité (ex: 'concert', 'lieu', 'programmateur') |
| `collectionName` | string | Oui | Le nom de la collection Firestore à interroger |
| `id` | string | Oui | L'identifiant de l'entité à charger |
| `idField` | string | Non | Le nom du champ identifiant (défaut: 'id') |
| `initialMode` | string | Non | Mode initial: 'view' ou 'edit' (défaut: 'view') |

#### Configuration des entités liées

| Propriété | Type | Requis | Description |
|-----------|------|--------|-------------|
| `relatedEntities` | array | Non | Liste des configurations des entités liées |
| `autoLoadRelated` | boolean | Non | Charger automatiquement les entités liées (défaut: true) |
| `customQueries` | object | Non | Requêtes personnalisées pour certaines entités liées |

Chaque élément de `relatedEntities` est un objet avec les propriétés suivantes :

```javascript
{
  name: 'programmateur',          // Nom de référence de l'entité liée
  collection: 'programmateurs',   // Collection Firestore de l'entité liée
  idField: 'programmateurId',     // Champ contenant l'ID de l'entité liée
  nameField: 'programmateurNom',  // Champ contenant le nom (pour l'affichage)
  type: 'one-to-one',             // Type de relation ('one-to-one' ou 'one-to-many')
  bidirectional: false,           // Si la relation est bidirectionnelle
  bidirectionalConfig: {          // Configuration pour relations bidirectionnelles
    targetField: 'lieuIds',       // Champ dans l'entité cible qui contient la référence inverse
    type: 'array'                 // Type de champ ('array', 'id', 'object')
  }
}
```

#### Callbacks et transformateurs

| Propriété | Type | Requis | Description |
|-----------|------|--------|-------------|
| `transformData` | function | Non | Fonction pour transformer les données après le chargement |
| `validateForm` | function | Non | Fonction de validation personnalisée avant la sauvegarde |
| `formatValue` | function | Non | Fonction de formatage des valeurs pour l'affichage |
| `checkDeletePermission` | function | Non | Fonction pour vérifier si la suppression est autorisée |

#### Callbacks d'événements

| Propriété | Type | Requis | Description |
|-----------|------|--------|-------------|
| `onSaveSuccess` | function | Non | Fonction appelée après une sauvegarde réussie |
| `onSaveError` | function | Non | Fonction appelée en cas d'erreur lors de la sauvegarde |
| `onDeleteSuccess` | function | Non | Fonction appelée après une suppression réussie |
| `onDeleteError` | function | Non | Fonction appelée en cas d'erreur lors de la suppression |
| `onModeChange` | function | Non | Fonction appelée lors du changement de mode (vue/édition) |

#### Options de navigation

| Propriété | Type | Requis | Description |
|-----------|------|--------|-------------|
| `navigate` | function | Non | Fonction de navigation React Router (optionnelle) |
| `returnPath` | string | Non | Chemin de retour après suppression ou annulation |
| `editPath` | string | Non | Format de chemin d'édition (ex: '/concerts/:id/edit') |

#### Options avancées

| Propriété | Type | Requis | Description |
|-----------|------|--------|-------------|
| `additionalFields` | array | Non | Champs supplémentaires à charger (pour les requêtes optimisées) |
| `skipPermissionCheck` | boolean | Non | Ignorer la vérification des permissions (défaut: false) |
| `realtime` | boolean | Non | Utiliser des écouteurs temps réel pour les mises à jour (défaut: false) |
| `useDeleteModal` | boolean | Non | Utiliser un modal pour confirmer la suppression (défaut: true) |

### Valeur retournée

L'hook retourne un objet contenant les propriétés et méthodes suivantes :

#### Données et état

| Propriété | Type | Description |
|-----------|------|-------------|
| `entity` | object | L'entité principale chargée |
| `loading` | boolean | Indique si les données sont en cours de chargement |
| `error` | object | Erreur éventuelle lors du chargement |
| `relatedData` | object | Données des entités liées, organisées par nom |
| `loadingRelated` | object | États de chargement des entités liées |

#### États d'édition et formulaire

| Propriété | Type | Description |
|-----------|------|-------------|
| `isEditing` | boolean | Indique si le mode édition est actif |
| `formData` | object | Données du formulaire d'édition |
| `isDirty` | boolean | Indique si le formulaire a été modifié |
| `dirtyFields` | array | Liste des champs modifiés |
| `errors` | object | Erreurs de validation du formulaire |

#### États d'opérations

| Propriété | Type | Description |
|-----------|------|-------------|
| `isSubmitting` | boolean | Indique si une sauvegarde est en cours |
| `isDeleting` | boolean | Indique si une suppression est en cours |
| `showDeleteModal` | boolean | Indique si le modal de confirmation est affiché |

#### Actions de base

| Méthode | Signature | Description |
|---------|-----------|-------------|
| `toggleEditMode` | () => void | Basculer entre les modes vue et édition |
| `handleChange` | (event) => void ou (name, value) => void | Gérer les changements dans le formulaire |
| `handleSubmit` | (event?) => Promise<void> | Valider et soumettre les modifications |
| `handleDelete` | () => void | Lancer le processus de suppression |
| `handleCancelDelete` | () => void | Annuler la suppression |
| `handleConfirmDelete` | () => Promise<void> | Confirmer et exécuter la suppression |

#### Gestion des entités liées

| Méthode | Signature | Description |
|---------|-----------|-------------|
| `loadRelatedEntity` | (name, id) => Promise<void> | Charger une entité liée par son ID |
| `setRelatedEntity` | (name, entity) => void | Définir une entité liée |
| `removeRelatedEntity` | (name) => void | Supprimer l'association avec une entité liée |
| `getRelatedEntityId` | (name) => string | Obtenir l'ID d'une entité liée |
| `getRelatedEntityName` | (name) => string | Obtenir le nom d'affichage d'une entité liée |

#### Utilitaires et navigation

| Méthode/Propriété | Type/Signature | Description |
|-------------------|----------------|-------------|
| `refresh` | () => Promise<void> | Recharger les données de l'entité |
| `formatDisplayValue` | (field, value) => any | Formater une valeur pour l'affichage |
| `navigateToRelated` | (name, id) => void | Naviguer vers une entité liée |
| `navigateToEdit` | () => void | Naviguer vers la route d'édition |
| `navigateToList` | () => void | Naviguer vers la liste des entités |

## Gestion des Relations

Le hook gère plusieurs types de relations entre entités :

### 1. Relations simples (one-to-one)

- L'entité principale stocke l'ID de l'entité liée (ex: `concertId`)
- Le hook charge automatiquement l'entité liée et la rend disponible via `relatedData`

### 2. Relations multiples (one-to-many)

- L'entité principale stocke un tableau d'IDs ou de références (ex: `concertsAssocies`)
- Le hook charge les entités liées et les rend disponibles via `relatedData`

### 3. Relations bidirectionnelles

- Lors de la création/modification d'une association, le hook met à jour les deux côtés de la relation
- Exemples: programmateur ↔ lieu, concert ↔ artiste

### 4. Entités embedées

- Certaines entités contiennent directement les données d'autres entités (ex: `contact` dans programmateur)
- Le hook gère la structure hiérarchique des données dans le formulaire

## Gestion des modes d'édition

Le hook prend en charge deux approches pour le mode d'édition :

### 1. Édition dans la même vue

- Bascule entre affichage et formulaire dans le même composant via `toggleEditMode`
- L'état `isEditing` contrôle ce qui est affiché

### 2. Navigation vers une route d'édition

- Utilisation de `navigateToEdit` pour aller vers une route dédiée à l'édition
- Configuration via `editPath` pour définir le format de la route

## Optimisations de performance

Le hook implémente plusieurs optimisations :

1. **Chargement à la demande**
   - Options pour contrôler quelles entités liées sont chargées automatiquement
   - Méthode `loadRelatedEntity` pour le chargement manuel

2. **Requêtes optimisées**
   - Support pour les projections via `additionalFields`
   - Minimisation des requêtes Firestore

3. **Mise en cache**
   - Les entités liées déjà chargées sont mises en cache

4. **Mises à jour temps réel (optionnel)**
   - Option `realtime` pour écouter les changements en temps réel

## Exemples d'utilisation

### Exemple de base : Détails d'un lieu

```javascript
function LieuDetails({ id }) {
  const {
    entity: lieu,
    loading,
    error,
    isEditing,
    formData,
    handleChange,
    handleSubmit,
    toggleEditMode,
    handleDelete,
    relatedData
  } = useGenericEntityDetails({
    entityType: 'lieu',
    collectionName: 'lieux',
    id,
    relatedEntities: [
      {
        name: 'programmateur',
        collection: 'programmateurs',
        idField: 'programmateurId',
        nameField: 'nom'
      }
    ],
    onSaveSuccess: () => toast.success('Lieu enregistré avec succès'),
    onDeleteSuccess: () => {
      toast.success('Lieu supprimé');
      navigate('/lieux');
    }
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  // Accès à l'entité principale
  const { nom, ville, capacite } = lieu;
  
  // Accès à une entité liée
  const programmateur = relatedData.programmateur;

  return (
    <div>
      {isEditing ? (
        <LieuForm 
          formData={formData} 
          onChange={handleChange} 
          onSubmit={handleSubmit}
          onCancel={toggleEditMode}
        />
      ) : (
        <LieuView 
          lieu={lieu} 
          programmateur={programmateur}
          onEdit={toggleEditMode}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
```

### Exemple avancé : Détails d'un concert avec nombreuses relations

```javascript
function ConcertDetails({ id }) {
  const {
    entity: concert,
    loading,
    error,
    relatedData,
    isEditing,
    formData,
    handleChange,
    handleSubmit,
    toggleEditMode,
    handleDelete,
    setRelatedEntity,
    removeRelatedEntity,
    formatDisplayValue
  } = useGenericEntityDetails({
    entityType: 'concert',
    collectionName: 'concerts',
    id,
    relatedEntities: [
      { name: 'lieu', collection: 'lieux', idField: 'lieuId' },
      { name: 'programmateur', collection: 'programmateurs', idField: 'programmateurId' },
      { name: 'artiste', collection: 'artistes', idField: 'artisteId' },
      { name: 'structure', collection: 'structures', idField: 'structureId' }
    ],
    formatValue: (field, value) => {
      if (field === 'date') return formatDate(value);
      if (field === 'montant') return formatMontant(value);
      return value;
    },
    validateForm: (data) => {
      const errors = {};
      if (!data.titre) errors.titre = 'Le titre est obligatoire';
      if (!data.date) errors.date = 'La date est obligatoire';
      if (!data.lieuId) errors.lieuId = 'Le lieu est obligatoire';
      return { isValid: Object.keys(errors).length === 0, errors };
    },
    checkDeletePermission: async (concertData) => {
      // Vérification si le concert peut être supprimé
      const isInPast = new Date(concertData.date) < new Date();
      if (isInPast && concertData.statut === 'confirme') {
        return { 
          allowed: false, 
          reason: 'Impossible de supprimer un concert passé qui a été confirmé' 
        };
      }
      return { allowed: true };
    }
  });
  
  // Hooks de recherche pour les entités liées
  const lieuSearch = useGenericEntitySearch({
    collectionName: 'lieux',
    onSelect: (lieu) => setRelatedEntity('lieu', lieu)
  });
  
  // ... autres hooks de recherche

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    // Rendu conditionnel selon le mode et avec gestion des entités liées
  );
}
```

### Adaptation d'un hook existant vers le hook générique

Pour migrer depuis un hook existant comme `useConcertDetails` :

```javascript
const useConcertDetails = (id, location) => {
  // Utiliser le hook générique comme base
  const genericDetails = useGenericEntityDetails({
    entityType: 'concert',
    collectionName: 'concerts',
    id,
    relatedEntities: [
      // Configuration des entités liées
    ],
    // Autres options de configuration
  });
  
  // Extension avec des fonctionnalités spécifiques aux concerts
  const getStatusInfo = (status) => {
    // Logique spécifique pour interpréter les statuts de concerts
  };
  
  const handleFormGenerated = async (formData) => {
    // Logique spécifique pour la génération de formulaires
  };
  
  // Retourner l'API combinée
  return {
    ...genericDetails,
    getStatusInfo,
    handleFormGenerated,
    // Autres fonctionnalités spécifiques
  };
};
```

## Implémentation interne

L'implémentation du hook utilise les patterns suivants :

1. **Pattern Adapter**
   - Pour unifier l'interface sur différents types d'entités
   - Pour maintenir la compatibilité avec le code existant

2. **Pattern State**
   - Pour gérer les différents états (chargement, édition, suppression)
   - Pour encapsuler la logique de transition d'état

3. **Pattern Observer**
   - Pour notifier les composants des changements via les callbacks

4. **Pattern Factory**
   - Pour créer des sous-hooks spécialisés selon la configuration

## Intégration avec d'autres hooks génériques

`useGenericEntityDetails` s'intègre naturellement avec les autres hooks génériques :

- **useGenericEntityForm** : Pour la gestion de formulaires complexes
- **useGenericEntitySearch** : Pour la recherche et la sélection d'entités liées
- **useGenericEntityList** : Pour afficher des listes d'entités associées

## Bonnes pratiques

1. **Définir des configurations réutilisables**
   ```javascript
   const LIEU_RELATED_ENTITIES = [/* config */];
   
   // Puis les réutiliser
   useGenericEntityDetails({
     // ...
     relatedEntities: LIEU_RELATED_ENTITIES
   });
   ```

2. **Créer des hooks spécifiques basés sur le générique**
   ```javascript
   const useLieuDetails = (id) => {
     return useGenericEntityDetails({
       entityType: 'lieu',
       collectionName: 'lieux',
       id,
       // Configuration spécifique aux lieux
     });
   };
   ```

3. **Extraire la logique de validation**
   ```javascript
   const validateConcert = (data) => {
     // Logique de validation
   };
   
   useGenericEntityDetails({
     // ...
     validateForm: validateConcert
   });
   ```

## Prochaines évolutions

1. **Support pour les transactions Firestore**
   - Garantir l'atomicité des opérations sur les entités liées

2. **Gestion plus fine des autorisations**
   - Intégration avec un système de rôles et permissions

3. **Historique des modifications**
   - Tracking des changements et versionnement

4. **Cache partagé entre les instances**
   - Optimisation pour les entités fréquemment utilisées

## Historique des modifications

| Date | Description | Auteur |
|------|-------------|--------|
| 05/05/2025 | Création de la spécification initiale | Copilot |
| - | - | - |