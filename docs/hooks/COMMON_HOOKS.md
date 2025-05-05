# Hooks Communs

*Dernière mise à jour: 4 mai 2025*

Ce document décrit les hooks partagés et réutilisables disponibles dans le dossier `src/hooks/common`.

## useGenericEntityForm

Hook générique qui simplifie la gestion des formulaires d'entités (création, édition, validation, soumission). Il remplace et unifie les multiples hooks de formulaires spécifiques à chaque entité.

### Importation

```jsx
import { useGenericEntityForm } from '@/hooks/common';
// ou 
import { useEntityForm } from '@/hooks/common'; // Alias plus court
```

### Paramètres

```tsx
useGenericEntityForm({
  entityType: string,         // Type d'entité (ex: 'concerts', 'structures')
  entityId: string | null,    // ID de l'entité (ou 'nouveau' pour création)
  initialData: object,        // Données initiales du formulaire
  collectionName: string,     // Nom de la collection Firestore 
  validateForm: function,     // Fonction de validation
  transformData: function,    // Transformation avant sauvegarde
  onSuccess: function,        // Callback après sauvegarde réussie
  relatedEntities: array      // Configuration des entités liées
})
```

#### Configuration des entités liées

```jsx
const relatedEntities = [
  { 
    name: 'lieu',              // Nom de la relation
    collection: 'lieux',       // Collection Firestore pour l'entité liée
    idField: 'lieuId',         // Champ d'ID dans l'entité principale
    nameField: 'lieuNom'       // Champ facultatif pour stocker le nom
  }
]
```

### Valeurs retournées

```tsx
{
  formData: object,                     // État actuel du formulaire
  setFormData: function,                // Mise à jour directe de formData
  loading: boolean,                     // Indicateur de chargement
  submitting: boolean,                  // Indicateur de soumission
  error: string | null,                 // Message d'erreur global
  formErrors: object,                   // Erreurs par champ
  handleChange: function,               // Gestion des changements
  handleSubmit: function,               // Soumission du formulaire
  resetForm: function,                  // Réinitialisation du formulaire
  relatedData: object,                  // Données des entités liées
  handleSelectRelatedEntity: function,  // Sélection d'entité liée
  hasChanges: function,                 // Vérification des modifications
  initialEntityData: object | null      // Données initiales
}
```

### Fonctionnalités

- **Gestion uniforme des formulaires** - Même comportement et API pour tous les types d'entités
- **Gestion des champs imbriqués** - Support pour les chemins comme `contact.nom` dans les formulaires
- **Chargement automatique des données** - Récupération des données depuis Firestore pour les entités existantes
- **Validation configurable** - Interface uniforme pour la validation des formulaires
- **Gestion des entités liées** - Chargement et liaison des entités associées (comme les lieux pour un concert)
- **Détection des changements** - Suivi des champs modifiés
- **Gestion des erreurs** - Par champ et globales

### Exemple d'utilisation

```jsx
function ConcertForm({ concertId }) {
  // Configuration pour les concerts
  const {
    formData,
    loading,
    error,
    formErrors,
    handleChange,
    handleSubmit,
    relatedData
  } = useGenericEntityForm({
    entityType: 'concerts',
    entityId: concertId,
    initialData: { 
      titre: '',
      date: '',
      montant: ''
    },
    collectionName: 'concerts',
    validateForm: (data) => {
      const errors = {};
      if (!data.titre) errors.titre = 'Le titre est obligatoire';
      return { isValid: Object.keys(errors).length === 0, errors };
    }
  });

  if (loading) return <p>Chargement...</p>;

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Titre</label>
        <input
          name="titre"
          value={formData.titre}
          onChange={handleChange}
        />
        {formErrors.titre && <p className="error">{formErrors.titre}</p>}
      </div>
      
      {/* Autres champs du formulaire */}
      
      <button type="submit">Enregistrer</button>
    </form>
  );
}
```

### Remplacement des hooks existants

Ce hook générique est conçu pour remplacer progressivement les hooks spécifiques d'entités suivants :

- `useConcertForm` - Déjà mis à jour pour utiliser le hook générique
- `useStructureForm`
- `useLieuForm`
- `useProgrammateurForm`
- `useEntrepriseForm`

### Notes de migration

Pour migrer un hook de formulaire existant vers `useGenericEntityForm` :

1. Identifiez les données initiales, la logique de validation et les transformations spécifiques
2. Configurez ces paramètres dans l'appel à `useGenericEntityForm`
3. Assurez-vous de renvoyer les mêmes propriétés que le hook original pour la compatibilité

Voir `src/hooks/concerts/useConcertForm.js` pour un exemple complet de migration.

## hooks/common/useEntitySearch.js

**But :** Fournir une fonctionnalité de recherche réutilisable pour différents types d'entités (artistes, lieux, programmateurs, etc.)  

**Paramètres :** 
- `options: object` - Options de configuration incluant:
  - `entityType: string` - Type d'entité à rechercher ('lieux', 'programmateurs', 'artistes', 'concerts')
  - `searchField: string` - Champ sur lequel effectuer la recherche principale (par défaut: 'nom')
  - `additionalSearchFields: string[]` - Champs supplémentaires pour la recherche (optionnel)
  - `maxResults: number` - Nombre maximum de résultats (par défaut: 10)
  - `onSelect: Function` - Callback pour la sélection d'une entité
  - `filterResults: Function` - Fonction de filtrage des résultats
  - `allowCreate: boolean` - Autorise la création d'entités (par défaut: true)

**Dépendances :** 
- Firebase (collection, query, where, limit, getDocs, doc, setDoc, orderBy, serverTimestamp)
- React (useState, useRef, useEffect)

**Fonctionnalités principales :**
- Recherche d'entités dans Firestore avec debounce
- Filtrage des résultats 
- Sélection d'entités existantes
- Création de nouvelles entités

**API retournée :**
- `searchTerm` & `setSearchTerm` : Gestion du terme de recherche
- `results` : Résultats de la recherche
- `isSearching`, `showResults` : États de l'interface
- `selectedEntity`, `setSelectedEntity` : Gestion de l'entité sélectionnée
- `handleSelect`, `handleRemove`, `handleCreate` : Fonctions d'interaction
- `performSearch` : Fonction de recherche
- `dropdownRef` : Référence pour la gestion du dropdown

**Utilisation :** Ce hook est utilisé dans de nombreux formulaires et composants pour rechercher et sélectionner des entités (artistes, lieux, programmateurs) à associer.

## hooks/common/useResponsive.js

**But :** Fournir une API pour adapter l'interface selon la taille d'écran  

**Paramètres :** Aucun

**Dépendances :**
- React (useState, useEffect)
- Window API pour les dimensions d'écran

**Fonctionnalités principales :**
- Détection de la taille d'écran
- Détection de l'orientation (portrait/paysage)
- Définition des breakpoints pour responsive design

**API retournée :**
- `isMobile`, `isTablet`, `isDesktop` : Boolean indiquant le type d'appareil
- `isPortrait`, `isLandscape` : Boolean indiquant l'orientation
- `screenWidth`, `screenHeight` : Dimensions actuelles de l'écran
- `breakpoints` : Objet contenant les valeurs des breakpoints

**Exemple d'utilisation :**
```jsx
const { isMobile, isTablet, isDesktop } = useResponsive();

return (
  <div>
    {isMobile && <MobileComponent />}
    {isTablet && <TabletComponent />}
    {isDesktop && <DesktopComponent />}
  </div>
);
```

## hooks/common/useTheme.js

**But :** Gérer le thème de l'application (sombre/clair)  

**Paramètres :** Aucun

**Dépendances :**
- localStorage (pour persister les préférences)
- React (useState, useEffect)

**Fonctionnalités principales :**
- Basculement entre thème clair et sombre
- Persistance du choix de thème
- Application des styles CSS correspondants

**API retournée :**
- `theme` : ('light' | 'dark') Thème actuel
- `toggleTheme` : () => void - Fonction pour basculer entre les thèmes
- `setTheme` : (theme: 'light' | 'dark') => void - Fonction pour définir un thème spécifique

**Exemple d'utilisation :**
```jsx
const { theme, toggleTheme } = useTheme();

return (
  <div className={`app ${theme}`}>
    <button onClick={toggleTheme}>
      {theme === 'light' ? 'Mode sombre' : 'Mode clair'}
    </button>
    <Content />
  </div>
);
```

## Navigation
- [Retour à la vue d'ensemble des hooks](HOOKS.md)
- [Voir les hooks des concerts](CONCERT_HOOKS.md)