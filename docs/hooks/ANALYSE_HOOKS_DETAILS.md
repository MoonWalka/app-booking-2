# Analyse des Hooks de Détails Existants

*Document créé le: 5 mai 2025*  
*Étape 3.1 du [Plan de Migration des Hooks Génériques](/docs/hooks/PLAN_MIGRATION_HOOKS_GENERIQUES.md)*

<!-- ======= SECTION DÉVELOPPEUR (SIMPLIFIÉE) ======= -->

## 🧑‍💻 GUIDE DÉVELOPPEUR : Comprendre les Hooks de Détails

### Ce que vous devez savoir

Ce document analyse les différents hooks de détails (comme `useLieuDetails`, `useProgrammateurDetails`) pour identifier leurs points communs et créer un hook générique `useGenericEntityDetails`.

### Hooks analysés (résumé)

| Hook | Utilisation | Fonctionnalités clés |
|------|-------------|----------------------|
| `useLieuDetails` | Gestion des détails d'un lieu | Chargement/édition/suppression, gestion des programmateurs associés |
| `useProgrammateurDetails` | Gestion des détails d'un programmateur | Chargement/édition/suppression, gestion des structures associées |
| `useConcertDetails` | Gestion des détails d'un concert | Chargement/édition avec nombreuses entités liées (artistes, lieu, etc.) |
| `useContratDetails` | Gestion des détails d'un contrat | Focus sur le chargement de données et entités associées |
**Localisation**: `/src/hooks/lieux/useLieuDetails.js`

**Description**: Hook pour gérer les détails d'un lieu, déplacé depuis un emplacement spécifique aux composants vers le dossier standardisé des hooks.

**États gérés**:
- `lieu`: Données de l'entité lieu
- `loading`: Indicateur de chargement
- `error`: Erreurs éventuelles
- `isEditing`: Mode d'édition ou visualisation
- `isSubmitting`: Indicateur de soumission en cours
- `formData`: Données du formulaire d'édition
- `showDeleteModal`: Affichage du modal de confirmation de suppression
- `isDeleting`: Indicateur de suppression en cours
- `programmateur`: Entité liée (programmateur associé au lieu)
- `loadingProgrammateur`: Indicateur de chargement de l'entité liée

**Fonctionnalités principales**:
- Chargement des données du lieu
- Récupération des entités liées (programmateur)
- Bascule entre mode vue et mode édition
- Validation et soumission des modifications
- Gestion de la suppression avec confirmation
- Vérification des dépendances avant suppression (concerts associés)

**Particularités**:
- Gestion de l'association avec un programmateur
- Gestion des interactions entre le lieu et ses concerts associés

### 2. useProgrammateurDetails

**Localisation**: `/src/hooks/programmateurs/useProgrammateurDetails.js`

**Description**: Hook pour gérer les détails d'un programmateur.

**États gérés**:
- `programmateur`: Données de l'entité programmateur
- `structure`: Structure associée au programmateur
- `loading`: Indicateur de chargement
- `error`: Erreurs éventuelles
- `isEditing`: Mode d'édition ou visualisation
- `isSubmitting`: Indicateur de soumission en cours
- `formData`: Données du formulaire d'édition
- `structureCreated`: Indicateur de création d'une structure liée

**Fonctionnalités principales**:
- Chargement des données du programmateur
- Récupération des entités liées (structure)
- Bascule entre mode vue et mode édition
- Validation et soumission des modifications
- Gestion de la suppression
- Formatage des valeurs pour l'affichage

**Particularités**:
- Structure de données plus complexe avec sous-objets (contact, structure)
- Gestion des concerts associés au programmateur
- Gestion de la structure associée au programmateur

### 3. useConcertDetails

**Localisation**: `/src/hooks/concerts/useConcertDetails.js`

**Description**: Hook pour gérer les détails d'un concert, avec de nombreuses entités liées.

**États gérés**:
- `concert`: Données de l'entité concert
- `loading`: Indicateur de chargement
- `isSubmitting`: Indicateur de soumission en cours
- `isEditMode`: Mode d'édition ou visualisation
- `formState`: État du formulaire d'édition
- Entités liées: lieu, programmateur, artiste, structure
- États initiaux des entités liées pour gérer les changements d'associations

**Fonctionnalités principales**:
- Chargement des données du concert
- Récupération de multiples entités liées
- Bascule entre mode vue et mode édition
- Validation et soumission des modifications
- Gestion de la suppression
- Formatage avancé des valeurs (dates, montants)
- Gestion des statuts du concert

**Particularités**:
- Utilisation intensive de hooks spécialisés (`useConcertStatus`, `useConcertFormsManagement`, etc.)
- Intégration avec plusieurs hooks de recherche pour les entités liées
- Nombreuses fonctionnalités spécifiques aux concerts (génération de formulaires)
- Gestion complexe des associations bidirectionnelles

### 4. useContratDetails

**Localisation**: `/src/hooks/contrats/useContratDetails.js`

**Description**: Hook pour gérer les détails d'un contrat, particulièrement axé sur le chargement de données.

**États gérés**:
- `contrat`: Données de l'entité contrat
- `concert`: Concert associé au contrat
- `template`: Template du contrat 
- `programmateur`, `lieu`, `artiste`, `entreprise`: Entités liées
- `loading`: Indicateur de chargement
- `error`: Erreurs éventuelles

**Fonctionnalités principales**:
- Chargement des données du contrat
- Récupération de nombreuses entités liées
- Agrégation de données provenant de différentes collections

**Particularités**:
- Focus sur le chargement et l'agrégation de données plus que sur l'édition
- Gestion de documents liés (templates)

### 5. useStructureDetails

**Localisation**: `/src/hooks/structures/useStructureDetails.js`

**Description**: Hook pour gérer les détails d'une structure.

**États gérés**:
- `structure`: Données de l'entité structure
- `loading`: Indicateur de chargement
- `error`: Erreurs éventuelles
- `programmateurs`: Liste des programmateurs associés
- `loadingProgrammateurs`: Indicateur de chargement des programmateurs

**Fonctionnalités principales**:
- Chargement des données de la structure
- Récupération des programmateurs associés
- Gestion de la navigation

**Particularités**:
- Focus sur la relation one-to-many avec les programmateurs
- Peu de logique d'édition (probablement déléguée à un hook de formulaire)

## Fonctionnalités communes identifiées

Après analyse des hooks existants, voici les fonctionnalités communes qui devraient être intégrées dans le hook générique `useGenericEntityDetails` :

1. **Chargement des données de base**:
   - Récupération de l'entité principale depuis Firestore
   - Gestion des états de chargement et d'erreur
   - Transformation des données récupérées si nécessaire

2. **Gestion des entités liées**:
   - Chargement des entités associées (one-to-one et one-to-many)
   - Gestion des états de chargement spécifiques aux entités liées
   - Mise en cache des entités liées pour éviter des requêtes répétées

3. **Gestion des modes d'affichage**:
   - Bascule entre mode visualisation et mode édition
   - Initialisation du formulaire d'édition avec les données actuelles
   - Gestion de l'état d'édition (dirty state)

4. **Opérations CRUD**:
   - Mise à jour de l'entité avec validation
   - Suppression de l'entité avec confirmation
   - Gestion des dépendances et vérifications avant suppression
   - Gestion des états pendant les opérations (isSubmitting, isDeleting)

5. **Navigation et routage**:
   - Redirection après opérations réussies
   - Navigation contextualisée (retour à la liste, aller vers une entité liée)

6. **Formatage et présentation**:
   - Transformation des données pour l'affichage (dates, montants, etc.)
   - Calcul de propriétés dérivées (statuts, indicateurs, etc.)

7. **Gestion des associations**:
   - Mise à jour des références bidirectionnelles entre entités
   - Ajout/suppression d'associations

## Différences et spécificités

1. **Structure des données**:
   - Certaines entités ont une structure simple (lieu)
   - D'autres ont une structure imbriquée avec des sous-objets (programmateur, concert)

2. **Relations entre entités**:
   - Types de relations variés (one-to-one, one-to-many)
   - Nombre d'entités liées (de 1 à plus de 5 pour concerts)
   - Bidirectionnalité des relations dans certains cas

3. **Logique métier spécifique**:
   - Gestion des statuts pour les concerts
   - Génération de documents pour les contrats
   - Vérifications spécifiques avant suppression (concerts associés à un lieu)

4. **Flux d'interface utilisateur**:
   - Certains utilisent des modals de confirmation
   - D'autres gèrent l'édition in-place
   - Variété dans les patterns de navigation

## Recommandations pour useGenericEntityDetails

Sur la base de cette analyse, voici les recommandations pour le nouveau hook générique:

1. **API flexible et configurable**:
   - Paramètres pour définir la collection principale et le champ ID
   - Configuration des entités liées avec cardinalité et champs de référence
   - Options pour le formatage des données et la validation

2. **Gestion des états complète**:
   - États de base: entité, loading, error
   - États d'édition: isEditing, formData, dirtyFields
   - États d'opérations: isSubmitting, isDeleting

3. **Chargement des entités liées configurable**:
   - Chargement à la demande ou automatique
   - Configuration des projections pour optimiser les requêtes
   - Mise en cache intelligente

4. **Points d'extension**:
   - Callbacks pour validation personnalisée
   - Transformateurs pour la présentation des données
   - Hooks pour intercepter les opérations CRUD

5. **Support pour la logique métier spécifique**:
   - Option pour injecter des fonctionnalités spécifiques aux entités
   - Possibilité d'étendre le comportement de base

## Ébauche de l'API proposée

```javascript
const useGenericEntityDetails = ({
  // Configuration de base
  entityType,                // Type d'entité (pour les logs et les messages)
  collectionName,            // Nom de la collection Firestore
  id,                        // ID de l'entité
  idField = 'id',            // Nom du champ ID
  
  // Configuration des entités liées
  relatedEntities = [],      // Configuration des entités liées
  autoLoadRelated = true,    // Charger automatiquement les entités liées
  
  // Callbacks et transformateurs
  transformData,             // Transformation des données après chargement
  validateForm,              // Validation personnalisée avant sauvegarde
  formatValue,               // Formatage des valeurs pour l'affichage
  
  // Callbacks d'événements
  onSaveSuccess,             // Appelé après sauvegarde réussie
  onSaveError,               // Appelé en cas d'erreur de sauvegarde
  onDeleteSuccess,           // Appelé après suppression réussie
  onDeleteError,             // Appelé en cas d'erreur de suppression
  onModeChange,              // Appelé lors du changement de mode (vue/édition)
  
  // Options de navigation
  navigate,                  // Fonction de navigation (optionnel)
  returnPath,                // Chemin de retour après suppression
  
  // Options avancées
  customQueries = {},        // Requêtes personnalisées pour certaines entités liées
  additionalFields = [],     // Champs supplémentaires à charger
  initialMode = 'view',      // Mode initial ('view' ou 'edit')
  skipPermissionCheck = false, // Ignorer la vérification des permissions
  realtime = false,          // Utiliser des écouteurs temps réel
}) => {
  // Implémentation
  
  // Valeurs retournées
  return {
    // Données de base
    entity,                  // L'entité principale
    relatedData,             // Entités liées
    loading,                 // Chargement en cours
    error,                   // Erreur éventuelle
    
    // États d'édition
    isEditing,               // Mode d'édition actif
    formData,                // Données du formulaire
    isDirty,                 // Formulaire modifié
    
    // États d'opérations
    isSubmitting,            // Sauvegarde en cours
    isDeleting,              // Suppression en cours
    
    // Actions
    toggleEditMode,          // Basculer entre vue et édition
    handleChange,            // Gérer les changements dans le formulaire
    handleSubmit,            // Soumettre les modifications
    handleDelete,            // Supprimer l'entité
    
    // Gestion des entités liées
    loadRelatedEntity,       // Charger une entité liée
    setRelatedEntity,        // Définir une entité liée
    removeRelatedEntity,     // Supprimer une entité liée
    
    // Utilitaires
    refresh,                 // Recharger les données
    formatDisplayValue       // Formater une valeur pour l'affichage
  };
};
```

## Exemples d'utilisation cible

### Exemple simple : Détails d'un lieu

```javascript
const LieuDetails = ({ lieuId }) => {
  const {
    entity: lieu,
    loading,
    error,
    isEditing,
    formData,
    toggleEditMode,
    handleChange,
    handleSubmit,
    handleDelete
  } = useGenericEntityDetails({
    entityType: 'lieu',
    collectionName: 'lieux',
    id: lieuId,
    relatedEntities: [
      {
        name: 'programmateur',
        collection: 'programmateurs',
        idField: 'programmateurId'
      }
    ],
    onDeleteSuccess: () => navigate('/lieux')
  });
  
  if (loading) return <Loading />;
  if (error) return <ErrorMessage error={error} />;
  
  // Rendu conditionnel selon le mode
  return isEditing ? (
    <LieuForm 
      formData={formData} 
      onChange={handleChange} 
      onSubmit={handleSubmit} 
      onCancel={toggleEditMode} 
    />
  ) : (
    <LieuView 
      lieu={lieu} 
      onEdit={toggleEditMode} 
      onDelete={handleDelete} 
    />
  );
};
```

### Exemple complexe : Détails d'un concert

```javascript
const ConcertDetails = ({ concertId }) => {
  const {
    entity: concert,
    relatedData,
    loading,
    isEditing,
    formData,
    handleChange,
    handleSubmit,
    toggleEditMode,
    handleDelete,
    setRelatedEntity,
    removeRelatedEntity,
    isSubmitting
  } = useGenericEntityDetails({
    entityType: 'concert',
    collectionName: 'concerts',
    id: concertId,
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
    onSaveSuccess: () => toast.success('Concert enregistré avec succès'),
    onDeleteSuccess: () => {
      toast.success('Concert supprimé');
      navigate('/concerts');
    }
  });
  
  // Hook de recherche pour les entités liées
  const lieuSearch = useGenericEntitySearch({
    collectionName: 'lieux',
    onSelect: (lieu) => setRelatedEntity('lieu', lieu)
  });
  
  // Similaire pour les autres entités liées
  
  return (
    // Rendu avec gestion des entités liées et états
  );
};
```

## Prochaines étapes

1. **Définition de l'API détaillée** (2 jours)
   - Spécification complète des options et valeurs retournées
   - Documentation des patterns d'utilisation

2. **Implémentation du hook** (3 jours)
   - Prototype fonctionnel pour les cas simples
   - Extension pour les cas complexes
   - Tests unitaires

3. **Migration du premier cas** (2 jours)
   - Sélection du premier hook à migrer (useConcertDetails recommandé)
   - Implémentation avec le nouveau hook générique
   - Tests et validation

4. **Validation et ajustements** (1 jour)
   - Révision de l'API après le premier cas d'utilisation
   - Ajustements si nécessaire
   - Documentation des bonnes pratiques découvertes

## Conclusion

L'analyse des hooks de détails existants montre un potentiel significatif de standardisation malgré la diversité des fonctionnalités. Le hook générique `useGenericEntityDetails` devra offrir une base solide pour les fonctionnalités communes tout en permettant l'extension pour les besoins spécifiques à chaque entité. Une attention particulière devra être portée à la gestion des entités liées et aux transformations de données, qui représentent des différences importantes entre les implémentations actuelles.

Cette analyse servira de fondement pour la conception détaillée de l'API du hook générique dans l'étape suivante du plan de migration.

---

**Prochaine étape**: Conception de l'API du hook useGenericEntityDetails (12/06/2025)