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
- `useResponsive` - Gestion de l'affichage responsive (alias de `useResponsiveComponent`)

### 2. Hooks Spécifiques à un Domaine (`/hooks/[entity]/`)

Les hooks spécifiques à un domaine sont des hooks qui contiennent une logique métier spécifique à une entité particulière (programmateurs, structures, concerts, etc.).

Ces hooks peuvent utiliser les hooks communs mais ne doivent pas les dupliquer.

## Comment utiliser les hooks standardisés

### useAddressSearch

```javascript
// Import du hook
import { useAddressSearch } from '@/hooks/common';

// Utilisation standard
const {
  searchTerm,
  setSearchTerm,
  selectedAddress,
  addressResults,
  isSearching,
  handleSelectAddress
} = useAddressSearch();

// Utilisation avec formulaire
const addressSearch = useAddressSearch({
  formData,
  updateFormData
});
```

### useCompanySearch

```javascript
// Import du hook
import { useCompanySearch } from '@/hooks/common';

// Utilisation standard
const {
  searchType,
  setSearchType,
  searchTerm,
  setSearchTerm,
  searchResults,
  isSearchingCompany,
  handleSelectCompany
} = useCompanySearch();

// Utilisation avec callback
const companySearch = useCompanySearch({
  onCompanySelect: (company) => {
    // Traitement des données de l'entreprise sélectionnée
  }
});
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

Si vous avez besoin d'étendre un hook commun avec une logique spécifique à une entité, créez un hook spécialisé qui utilise le hook commun :

```javascript
// hooks/structures/useStructureAddressSearch.js
import { useAddressSearch } from '@/hooks/common';

export const useStructureAddressSearch = (structure) => {
  const addressSearch = useAddressSearch({
    initialAddress: {
      adresse: structure.adresse,
      codePostal: structure.codePostal,
      ville: structure.ville
    }
  });
  
  // Logique spécifique supplémentaire
  
  return {
    ...addressSearch,
    // Fonctionnalités supplémentaires
  };
};
```

### 3. Mise à jour et maintenance

Si vous identifiez un bug ou souhaitez ajouter une fonctionnalité à un hook commun, mettez à jour le hook dans `/hooks/common/` et non dans des duplications spécifiques à une entité.

## Hooks consolidés récemment (Mai 2025)

Les hooks suivants ont été consolidés et sont désormais disponibles dans le dossier `/hooks/common/` :

| Hook | Description | Anciens chemins remplacés |
|------|-------------|---------------------------|
| `useAddressSearch` | Gestion de la recherche et sélection d'adresses | `hooks/parametres/useAddressSearch.js` |
| `useCompanySearch` | Recherche d'entreprises par SIRET ou nom | `hooks/parametres/useCompanySearch.js` |
| `useLocationIQ` | Interface directe avec l'API LocationIQ | `hooks/useLocationIQ.js` (redirecteur) |

## Ressources

- [API LocationIQ Documentation](https://locationiq.com/docs)
- [API Entreprise Documentation](https://entreprise.api.gouv.fr/catalogue/)