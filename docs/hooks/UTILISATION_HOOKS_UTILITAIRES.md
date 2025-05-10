# Guide d'utilisation des hooks utilitaires

*Document créé le: 8 mai 2025*

Ce document présente les conventions et bonnes pratiques pour l'utilisation des hooks utilitaires dans le projet TourCraft.

## Structure des hooks utilitaires

Les hooks utilitaires du projet ont été centralisés dans le dossier `/src/hooks/common/` pour éviter les duplications et faciliter la maintenance. Cette centralisation s'inscrit dans le cadre du plan global de restructuration des hooks.

### Hooks utilitaires disponibles

Voici la liste des hooks utilitaires centralisés :

| Hook | Description | Utilisation recommandée |
|------|-------------|-------------------------|
| `useSearchAndFilter` | Gestion de la recherche et du filtrage des données | Recherche dans des listes d'entités avec filtres |
| `useEntitySearch` | Recherche d'entités avec options avancées | Composants de recherche avec suggestions |
| `useFormSubmission` | Gestion de la soumission de formulaires | Formulaires avec validation et gestion d'erreurs |
| `useAddressSearch` | Recherche et validation d'adresses | Formulaires avec champs d'adresse |
| `useCompanySearch` | Recherche d'entreprises | Sélection d'entreprises dans les formulaires |
| `useDebounce` | Limitation de la fréquence d'appels de fonction | Champs de recherche, filtres temps réel |
| `useLocationIQ` | Géocodage et validation d'adresses | Fonctionnalités cartographiques |

## Bonnes pratiques d'importation

### ✅ Recommandé

Importez les hooks utilitaires directement depuis le dossier `common` :

```javascript
// Import recommandé d'un hook utilitaire
import { useEntitySearch } from '@/hooks/common';

// Utilisation
const searchHook = useEntitySearch({
  entityType: 'lieux',
  searchField: 'nom',
  // autres options...
});
```

### ⛔ Déconseillé

N'importez pas les hooks depuis les dossiers spécifiques aux entités :

```javascript
// Import DÉCONSEILLÉ
import { useLieuSearch } from '@/hooks/lieux';
import useFormSubmission from '@/hooks/forms/useFormSubmission';
```

## Hooks spécifiques aux entités vs hooks utilitaires

### Hooks utilitaires
Ces hooks offrent des fonctionnalités génériques qui peuvent s'appliquer à n'importe quel type d'entité. Ils sont **centralisés dans** `/hooks/common/` et doivent être importés de là.

### Hooks spécifiques aux entités 
Ces hooks sont conçus pour une entité particulière (lieux, concerts, etc.) et peuvent contenir des logiques métier spécifiques. Ils sont situés dans leur dossier d'entité correspondant.

## Personnalisation des hooks utilitaires

Pour personnaliser le comportement d'un hook utilitaire pour une entité spécifique, utilisez les options de configuration plutôt que de dupliquer et modifier le code :

```javascript
// Personnalisation via options (RECOMMANDÉ)
const programmateursSearch = useEntitySearch({
  entityType: 'programmateurs',
  searchField: 'nom',
  additionalFilters: {
    isActive: true
  },
  // Autres options spécifiques...
});
```

## Migration des composants existants

Si votre composant utilise actuellement un hook depuis un dossier spécifique qui est en réalité une redirection vers `common`, vous devriez le migrer progressivement :

1. Identifiez les hooks qui sont de simples redirections (ils affichent des avertissements de dépréciation)
2. Mettez à jour vos imports pour utiliser directement la version dans `hooks/common`
3. Adaptez l'appel du hook si nécessaire en consultant la documentation

## Calendrier de dépréciation

Les redirections de hooks utilitaires seront supprimées après le 6 novembre 2025, conformément au [Plan de dépréciation progressive des hooks](/docs/hooks/PLAN_DEPRECIATION_HOOKS.md).

---

*Document préparé par l'équipe TourCraft*