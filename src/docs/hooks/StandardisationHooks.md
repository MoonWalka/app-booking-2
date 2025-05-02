# Standardisation des Hooks TourCraft

Ce document définit les standards de développement pour l'utilisation des hooks dans l'application TourCraft. Il sert de guide pour maintenir une cohérence et éviter les duplications.

## Organisation des Hooks

Les hooks sont organisés selon les principes suivants :

### 1. Hooks Communs (`/hooks/common/`)

Les hooks dans le dossier `/hooks/common/` sont des hooks génériques et réutilisables qui peuvent être utilisés dans plusieurs modules de l'application. **Ces hooks sont la source unique de vérité** pour les fonctionnalités qu'ils représentent.

Hooks communs standardisés :
- `useAddressSearch` - Recherche et gestion des adresses
- `useCompanySearch` - Recherche d'entreprises via l'API Entreprise
- `useLocationIQ` - Interaction directe avec l'API LocationIQ
- `useResponsive` - Gestion de l'affichage responsive
- `useTheme` - Application des thèmes et variables CSS

### 2. Hooks Utilitaires Génériques

Certains hooks fournissent des fonctionnalités génériques qui peuvent être spécialisées pour différentes entités :

- `/hooks/search/useSearchAndFilter` - Recherche, filtrage et tri génériques pour les collections
- `/hooks/forms/useFormSubmission` - Soumission générique de formulaires vers Firestore

### 3. Hooks Spécifiques à un Domaine (`/hooks/[entity]/`)

Les hooks spécifiques à un domaine sont des hooks qui contiennent une logique métier spécifique à une entité particulière (programmateurs, structures, concerts, etc.). Ces hooks devraient utiliser les hooks communs ou utilitaires comme base.

Exemples :
- `/hooks/concerts/useConcertSubmission` - Utilise useFormSubmission avec logique spécifique aux concerts
- `/hooks/artistes/useArtisteSearch` - Utilise useSearchAndFilter avec filtres spécifiques aux artistes

## Comment utiliser les hooks standardisés

### Hooks communs

```javascript
// Import des hooks communs
import { useAddressSearch, useCompanySearch, useTheme } from '@/hooks/common';

// Utilisation de useAddressSearch
const addressSearch = useAddressSearch({
  formData,
  updateFormData
});

// Utilisation de useTheme (généralement dans un composant de niveau application)
useTheme();
```

### Hooks de recherche

```javascript
// Import du hook générique
import { useSearchAndFilter } from '@/hooks/search';

// Utilisation directe pour un cas simple
const simpleSearch = useSearchAndFilter({
  items: maListe,
  searchFields: ['nom', 'description']
});

// Utilisation d'un hook spécifique à l'entité
import useArtisteSearch from '@/hooks/artistes/useArtisteSearch';

// Ce hook encapsule useSearchAndFilter avec une configuration spécifique
const artisteSearch = useArtisteSearch(listeArtistes);
```

### Hooks de formulaire

```javascript
// Import du hook générique
import useFormSubmission from '@/hooks/forms/useFormSubmission';

// Utilisation directe pour un cas simple
const formSubmission = useFormSubmission({
  collection: 'maCollection',
  onSuccess: () => navigate('/success')
});

// Utilisation d'un hook spécifique à l'entité
import useConcertSubmission from '@/hooks/concerts/useConcertSubmission';

// Ce hook encapsule useFormSubmission avec une logique spécifique aux concerts
const concertSubmission = useConcertSubmission(concertId, formData, selectedEntities);
```

## Bonnes pratiques

### 1. Importation

Toujours importer les hooks communs depuis le dossier `/hooks/common/` :

```javascript
// Bonne pratique
import { useAddressSearch, useCompanySearch } from '@/hooks/common';

// À éviter
import useAddressSearch from '@/hooks/parametres/useAddressSearch'; // NON
import { useLocationIQ } from '@/hooks/useLocationIQ'; // NON
```

### 2. Extension

Si vous avez besoin d'étendre un hook commun ou utilitaire avec une logique spécifique à une entité, créez un hook spécialisé qui utilise le hook générique :

```javascript
// hooks/structures/useStructureSearch.js
import { useSearchAndFilter } from '@/hooks/search';

export const useStructureSearch = (structures) => {
  // Définir les filtres spécifiques aux structures
  const structureFilters = {
    tous: () => true,
    actifs: (structure) => structure.statut === 'actif',
    // Autres filtres spécifiques...
  };
  
  // Utiliser le hook générique
  const searchAndFilter = useSearchAndFilter({
    items: structures,
    filters: structureFilters,
    // Autres options...
  });
  
  // Ajouter des fonctionnalités supplémentaires si nécessaire
  
  return {
    ...searchAndFilter,
    // Fonctionnalités supplémentaires...
  };
};
```

### 3. Mise à jour et maintenance

Si vous identifiez un bug ou souhaitez ajouter une fonctionnalité à un hook commun, mettez à jour le hook dans le dossier approprié (`/hooks/common/`, `/hooks/search/`, `/hooks/forms/`) et non dans des duplications spécifiques à une entité.

### 4. Dépréciation progressive

Certains hooks au niveau racine (`/hooks/useIsMobile.js`, `/hooks/useResponsiveComponent.js`, etc.) sont en cours de dépréciation et redirigent vers leurs équivalents dans `/hooks/common/`. Veuillez utiliser les versions dans `/hooks/common/` pour les nouveaux développements.

## Hooks consolidés récemment (Mai 2025)

| Hook | Location | Description | 
|------|----------|-------------|
| `useAddressSearch` | `/hooks/common/` | Recherche et sélection d'adresses |
| `useCompanySearch` | `/hooks/common/` | Recherche d'entreprises par nom ou SIRET |
| `useLocationIQ` | `/hooks/common/` | Interface avec l'API LocationIQ |
| `useTheme` | `/hooks/common/` | Application des thèmes et variables CSS |
| `useResponsive` | `/hooks/common/` | Gestion responsive (remplace useResponsiveComponent et useIsMobile) |
| `useSearchAndFilter` | `/hooks/search/` | Filtrage et recherche génériques |
| `useFormSubmission` | `/hooks/forms/` | Hook générique pour soumission de formulaires |
| `useConcertSubmission` | `/hooks/concerts/` | Hook spécifique pour les concerts, utilise useFormSubmission |
| `useArtisteSearch` | `/hooks/artistes/` | Hook spécifique pour la recherche d'artistes, utilise useSearchAndFilter |

## Ressources

- [API LocationIQ Documentation](https://locationiq.com/docs)
- [API Entreprise Documentation](https://entreprise.api.gouv.fr/catalogue/)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [React Hooks Documentation](https://reactjs.org/docs/hooks-intro.html)