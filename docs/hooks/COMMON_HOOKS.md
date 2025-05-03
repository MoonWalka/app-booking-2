# Hooks communs

Cette section documente les hooks utilitaires réutilisables à travers l'application TourCraft.

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