# Analyse des Hooks de Recherche Existants

*Document créé le: 5 mai 2025*  
*Étape 1.1 du [Plan de Migration des Hooks Génériques](/docs/hooks/PLAN_MIGRATION_HOOKS_GENERIQUES.md)*

## Objectif

Ce document présente l'analyse détaillée des hooks de recherche existants dans l'application TourCraft pour identifier les fonctionnalités communes et les spécificités de chaque implémentation. Cette analyse servira de base pour la conception du hook générique `useGenericEntitySearch`.

## Hooks de recherche analysés

1. `useEntitySearch` (hook commun existant)
2. `useLieuSearch`
3. `useProgrammateurSearch`
4. `useArtisteSearch`
5. `useStructureSearch`
6. `useConcertSearch`

## Analyse comparative

### 1. useEntitySearch

**Localisation**: `/src/hooks/common/useEntitySearch.js`

**Description**: Hook générique de base pour la recherche d'entités dans Firestore. Déjà partiellement généralisé mais avec des limitations.

**Arguments**:
```javascript
{
  entityType,          // Type d'entité à rechercher (collection Firestore)
  searchField = 'nom', // Champ principal pour la recherche
  additionalSearchFields = [], // Champs supplémentaires pour la recherche
  maxResults = 10,     // Nombre maximum de résultats
  onSelect = null,     // Callback de sélection
  filterResults = null, // Fonction de filtrage personnalisée
  allowCreate = true,  // Autoriser la création d'une nouvelle entité
  customSearchFunction = null // Fonction de recherche personnalisée
}
```

**États retournés**:
```javascript
{
  searchTerm, setSearchTerm, // Terme de recherche
  results,                   // Résultats de recherche
  isSearching,               // État de chargement
  showResults,               // Afficher/masquer les résultats
  setShowResults,            // Fonction pour modifier l'affichage
  selectedEntity,            // Entité sélectionnée
  setSelectedEntity,         // Fonction pour définir l'entité sélectionnée
  handleSelect,              // Gestionnaire de sélection d'entité
  handleRemove,              // Gestionnaire de suppression de sélection
  handleCreate,              // Gestionnaire de création d'entité
  dropdownRef                // Référence au dropdown de résultats
}
```

**Fonctionnalités principales**:
- Recherche avec debounce (300ms)
- Support pour la recherche dans plusieurs champs
- Gestion des clics en dehors du menu déroulant
- Recherche selon le type de champ (date, nom, autres)
- Gestion d'une entité sélectionnée

**Limitations**:
- Pas de gestion des filtres prédéfinis
- Pas de gestion des tris
- Flexibilité limitée pour les requêtes complexes

### 2. useLieuSearch

**Localisation**: `/src/hooks/lieux/useLieuSearch.js`

**Description**: Hook spécifique pour la recherche de lieux.

**Particularités**:
- Utilise `useEntitySearch` comme base
- Ajoute une fonction `handleCreateLieu` pour naviguer vers la page de création de lieu
- Champs de recherche spécifiques: nom, ville, codePostal, adresse

### 3. useProgrammateurSearch

**Localisation**: `/src/hooks/programmateurs/useProgrammateurSearch.js`

**Description**: Hook pour la recherche et la sélection de programmateurs.

**Particularités**:
- Deux modes de fonctionnement:
  - Mode générique via `useEntitySearch`
  - Mode spécifique avec chargement d'un programmateur lié à un lieu
- API flexible qui peut accepter soit un ID de lieu directement, soit un objet d'options
- États supplémentaires liés au programmateur actuel
- Gestion du chargement du programmateur associé à un lieu

### 4. useArtisteSearch

**Localisation**: `/src/hooks/artistes/useArtisteSearch.js`

**Description**: Hook pour la recherche et le filtrage des artistes.

**Particularités**:
- Utilise `useSearchAndFilter` comme base (pas `useEntitySearch`)
- Filtres spécifiques aux artistes (tous, avecConcerts, sansConcerts, actifs, inactifs)
- Calcul de statistiques (nombre d'artistes dans chaque catégorie)
- Navigation vers le formulaire de création d'artiste avec pré-remplissage du nom

### 5. useStructureSearch

**Localisation**: `/src/hooks/structures/index.js`

**Description**: Hook pour la recherche de structures par nom, ville ou SIRET.

**Particularités**:
- Implémentation directe (ne repose pas sur un hook générique)
- Recherche par nom, ville et SIRET simultanément
- Fusion des résultats de différentes requêtes sans doublons
- Gestion des erreurs spécifique

### 6. useConcertSearch

**Localisation**: `/src/hooks/programmateurs/useConcertSearch.js`

**Description**: Hook pour la recherche de concerts à associer à un programmateur.

**Particularités**:
- Utilise `useEntitySearch` comme base
- Filtre pour exclure les concerts déjà associés à un programmateur
- Fonctionnalité pour ajouter/retirer des concerts à un programmateur
- Mise à jour des associations en temps réel dans Firestore

## Fonctionnalités communes identifiées

1. **Gestion du terme de recherche**:
   - États: `searchTerm`, `setSearchTerm`
   - Debounce pour éviter les requêtes trop fréquentes

2. **Gestion des résultats**:
   - États: `results`, `isSearching`, `showResults`
   - Affichage/masquage du menu déroulant

3. **Sélection d'entités**:
   - États: `selectedEntity` ou équivalent
   - Fonctions: `handleSelect`, `handleRemove`

4. **Gestion du DOM**:
   - Référence au dropdown pour la gestion des clics extérieurs
   - Écoute des événements de souris pour fermer le menu

5. **Requêtes Firestore**:
   - Construction dynamique des requêtes
   - Gestion des erreurs

## Différences et spécificités

1. **Base du hook**:
   - Certains utilisent `useEntitySearch`
   - D'autres utilisent `useSearchAndFilter` 
   - D'autres ont une implémentation directe

2. **Filtrage**:
   - Filtrage côté client vs côté serveur
   - Filtres spécifiques au domaine métier

3. **Création d'entités**:
   - Navigation vers un formulaire de création
   - Pré-remplissage des données

4. **Association d'entités**:
   - Certains hooks gèrent les relations entre entités
   - Mise à jour des documents liés

5. **Performances**:
   - Stratégies différentes pour limiter le nombre de résultats
   - Optimisation des requêtes

## Recommandations pour useGenericEntitySearch

Sur la base de cette analyse, voici les recommandations pour le nouveau hook générique:

1. **API flexible**:
   - Option pour utiliser des requêtes côté client ou côté serveur
   - Support pour des configurations de recherche multiples

2. **Gestion complète des états**:
   - États de base: terme, résultats, chargement, sélection
   - États optionnels: filtres, tri, pagination

3. **Paramètres configurables**:
   - Champs de recherche personnalisables
   - Filtres prédéfinis
   - Options de tri

4. **Fonctions d'extension**:
   - Callbacks pour la création d'entités
   - Callbacks pour la sélection/désélection
   - Transformateurs de données pour le formatage des résultats

5. **Optimisations de performance**:
   - Debounce configurable
   - Mise en cache des résultats récents
   - Pagination efficace

## Conclusion

L'analyse des hooks de recherche existants révèle une base commune mais avec des variations importantes dans l'implémentation et les fonctionnalités. Le nouveau hook générique `useGenericEntitySearch` devra offrir une API suffisamment flexible pour répondre à tous ces cas d'utilisation tout en simplifiant l'implémentation pour les développeurs.

La prochaine étape (1.2) consistera à concevoir l'API de ce nouveau hook générique en s'appuyant sur les enseignements de cette analyse.

## Prochaines étapes

- **1.2**: Conception de l'API du hook useGenericEntitySearch (7 mai 2025)
- **1.3**: Implémentation initiale du hook (8 mai 2025)
- **1.4**: Migration de useArtisteSearch comme exemple (9 mai 2025)
