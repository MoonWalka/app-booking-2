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