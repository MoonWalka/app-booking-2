# Hooks pour les concerts

Cette section documente les hooks spécifiques à la gestion des concerts dans l'application TourCraft.

## hooks/concerts/useConcertDetails.js

**But :** Gérer les détails d'un concert, y compris le chargement des données, l'édition, la suppression et les interactions avec les entités associées (artistes, lieux, programmateurs).

**Paramètres :** 
- `id: string` - L'identifiant du concert
- `location: object` - L'objet de location React Router

**Dépendances :** 
- Firebase (db, doc, getDoc, updateDoc, deleteDoc)
- React Router (useNavigate)
- Hooks personnalisés (useEntitySearch, useConcertStatus, useConcertFormsManagement, useConcertAssociations)
- Utilitaires (formatDate, formatMontant, isDatePassed, copyToClipboard, getCacheKey)

**Fonctionnalités principales :**
- Chargement des données du concert et des entités associées (lieu, programmateur, artiste)
- Gestion de l'édition du concert avec validation du formulaire
- Suppression du concert avec nettoyage des références
- Gestion des formulaires liés au concert
- Gestion du statut du concert
- Rafraîchissement des données
- Utilitaires pour le formatage et l'affichage des données

**API retournée :**
- Données principales (concert, lieu, programmateur, artiste, loading, isSubmitting)
- États du formulaire (formData, formDataStatus, showFormGenerator, generatedFormLink)
- Mode d'édition (isEditMode, formState)
- Fonctions de recherche d'entités (lieuSearch, programmateurSearch, artisteSearch)
- Fonctions de gestion (handleChange, handleSubmit, handleDelete, toggleEditMode, validateForm)
- Fonctions utilitaires (copyToClipboard, formatDate, formatMontant, isDatePassed, getStatusInfo)

**Utilisation :** Ce hook est utilisé dans les composants de page et de détail de concert pour gérer toutes les interactions avec les données de concert.

## hooks/concerts/useConcertAssociations.js

**But :** Gérer les associations bidirectionnelles entre concerts et autres entités

**Paramètres :** Aucun

**Dépendances :** 
- Firebase (db, doc, updateDoc, arrayUnion, arrayRemove)
- React (useState, useEffect)

**Fonctionnalités principales :**
- Mise à jour des associations concert-programmateur
- Mise à jour des associations concert-artiste
- Gestion des références croisées dans Firestore

**API retournée :**
- `updateConcertProgrammateurAssociation` : (concertId, oldProgrammateurId, newProgrammateurId) => Promise
- `updateConcertArtisteAssociation` : (concertId, oldArtisteId, newArtisteId) => Promise
- `cleanupConcertAssociations` : (concertId) => Promise

**Utilisation :** Ce hook est utilisé pour maintenir la cohérence des données entre les entités liées.

## hooks/concerts/useConcertStatus.js

**But :** Gérer les statuts d'un concert et les transitions d'état

**Paramètres :** Aucun

**Dépendances :** 
- React (useState)

**Fonctionnalités principales :**
- Fourniture de la liste des statuts possibles
- Logique de transition entre statuts
- Validation des transitions de statut

**API retournée :**
- `statuses` : Objet contenant tous les statuts possibles et leurs propriétés
- `isValidTransition` : (currentStatus, newStatus) => boolean
- `getNextPossibleStatuses` : (currentStatus) => string[]
- `getStatusInfo` : (status) => { label, color, icon, description }

**Utilisation :** Ce hook est utilisé pour la gestion et l'affichage des statuts de concerts.

## hooks/concerts/useConcertFormsManagement.js

**But :** Gérer les formulaires associés à un concert

**Paramètres :**
- `id: string` - L'identifiant du concert

**Dépendances :** 
- Firebase (db, doc, getDoc, updateDoc, collection, addDoc)
- React (useState, useEffect)
- utils/formGenerators
- services/emailService

**Fonctionnalités principales :**
- Génération de formulaires personnalisés
- Stockage des formulaires
- Validation des réponses aux formulaires

**API retournée :**
- `generateForm` : () => Promise<string> - Génère un formulaire et retourne son URL
- `getFormStatus` : () => { hasForm, isCompleted, formId, formUrl }
- `checkFormResponse` : () => Promise<boolean> - Vérifie si le formulaire a été rempli
- `formData` : Données du formulaire rempli
- `formDataStatus` : État du chargement des données du formulaire
- `isGeneratingForm`, `errorMessage` : États de l'interface

**Utilisation :** Ce hook est utilisé pour gérer les formulaires à destination des programmateurs.

## Correctifs apportés à la recherche d'artistes (05/05/2025)

### Problème identifié
Un dysfonctionnement a été identifié dans la recherche d'artistes lors de la création d'un concert. Les résultats de recherche ne s'affichaient pas correctement, empêchant la sélection d'un artiste existant ou la création d'un nouvel artiste.

### Modifications apportées

1. **Dans hooks/concerts/useEntitySearch.js :**
   - Amélioration de la fonction `searchArtistes` pour garantir que les résultats s'affichent toujours, même en cas d'absence de correspondances
   - Modification de l'effet de recherche pour afficher immédiatement le dropdown avec l'indicateur de chargement pendant la recherche
   - Amélioration de la gestion d'état pour s'assurer que le dropdown reste visible dans tous les cas où il devrait l'être

2. **Dans components/concerts/sections/ArtisteSearchSection.js :**
   - Ajout d'une fonction `onFocus` qui déclenche une nouvelle recherche lorsque l'utilisateur clique dans le champ
   - Cette fonction force une nouvelle recherche si le terme actuel contient déjà au moins 2 caractères

3. **Dans components/concerts/sections/SearchDropdown.js :**
   - Ajout du support de la propriété `onFocus` pour permettre de déclencher une recherche au clic dans le champ

### Impact des modifications
Ces modifications améliorent partiellement la recherche d'artistes dans le contexte de création de concert. La fonctionnalité permet désormais de trouver et sélectionner les nouveaux artistes récemment créés, mais présente encore une limitation pour retrouver certains artistes existants plus anciens dans la base de données.

### Limitation connue
Le système permet actuellement de trouver les artistes nouvellement créés mais pas systématiquement les artistes plus anciens. Cette limitation est acceptée temporairement pendant la phase de développement et fera l'objet d'une correction ultérieure lors de tests plus approfondis sur la gestion des données.

**Note pour les développeurs:** Une investigation plus approfondie sur la structure des données des artistes et la façon dont ils sont indexés dans Firestore sera nécessaire pour résoudre complètement ce problème.

## Correction de l'incompatibilité entre ConcertForm et useConcertForm (05/05/2025)

### Problème identifié
En plus du problème de recherche d'artiste, un problème d'incompatibilité a été identifié entre le composant `ConcertForm` et le hook `useConcertForm`. Le hook utilise désormais `useGenericEntityForm` en interne, mais n'exposait pas correctement toutes les fonctions et propriétés nécessaires au composant, ce qui pouvait entraîner des erreurs ou un comportement inattendu lors de la création ou modification de concerts.

### Modifications apportées

Dans le hook `useConcertForm.js` :
1. Ajout de fonctions spécifiques pour désélectionner les entités liées (`handleRemoveLieu`, `handleRemoveProgrammateur`, `handleRemoveArtiste`)
2. Création de wrappers pour les setters (`setSelectedLieu`, `setSelectedProgrammateur`, `setSelectedArtiste`) qui maintiennent la compatibilité avec l'API attendue par le composant `ConcertForm`
3. Exposition correcte de toutes les fonctions et propriétés nécessaires dans l'objet retourné par le hook

### Impact des modifications
Ces modifications permettent au composant `ConcertForm` de fonctionner correctement avec le hook `useConcertForm` modernisé, tout en préservant la compatibilité API. La page d'ajout de concert devrait maintenant fonctionner correctement, tant pour la recherche d'artistes que pour la manipulation des entités liées.

## Exemple d'utilisation combinée

Voici un exemple d'utilisation combinée de ces hooks dans un composant de détail de concert :

```jsx
const ConcertDetailComponent = ({ id }) => {
  const {
    concert,
    lieu,
    programmateur,
    artiste,
    loading,
    isEditMode,
    toggleEditMode,
    handleSubmit,
    handleChange,
    formState
  } = useConcertDetails(id);
  
  const { statuses, getStatusInfo } = useConcertStatus();
  const { generateForm, formData, formDataStatus } = useConcertFormsManagement(id);
  
  // Composant utilisant ces hooks
  if (loading) return <LoadingSpinner />;
  
  return (
    <div>
      <h1>{concert.titre}</h1>
      <StatusBadge status={concert.status} />
      
      {/* Mode édition ou affichage */}
      {isEditMode ? (
        <ConcertEditForm 
          formState={formState}
          onChange={handleChange}
          onSubmit={handleSubmit}
        />
      ) : (
        <ConcertInfo 
          concert={concert}
          lieu={lieu}
          programmateur={programmateur}
          artiste={artiste}
        />
      )}
      
      {/* Actions */}
      <Button onClick={toggleEditMode}>
        {isEditMode ? 'Annuler' : 'Modifier'}
      </Button>
      
      {/* Formulaire */}
      {!formData && (
        <Button onClick={generateForm}>
          Générer un formulaire
        </Button>
      )}
      
      {formData && (
        <FormResponseDisplay data={formData} />
      )}
    </div>
  );
};
```

## Navigation
- [Retour à la vue d'ensemble des hooks](HOOKS.md)
- [Voir les hooks des contrats](CONTRAT_HOOKS.md)
- [Voir les hooks communs](COMMON_HOOKS.md)