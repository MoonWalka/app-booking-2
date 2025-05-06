# Plan de Dépréciation Progressive des Hooks

*Document créé le: 6 mai 2025*  
*Dernière mise à jour: 6 mai 2025*

## Objectif

Ce document formalise le plan de dépréciation progressive des hooks spécifiques qui ont été remplacés par les hooks génériques. Il définit des échéances claires pour les différentes phases de transition et assure une communication cohérente aux développeurs.

## Hooks concernés

### Hooks complètement dépréciés et supprimés

| Hook | État | Date de suppression | Remplacé par |
|------|------|---------------------|--------------|
| `useIsMobile` | ✅ Supprimé | 6 mai 2025 | `useResponsive` |

### Hooks transformés en wrappers (à supprimer progressivement)

| Hook | État actuel | Date prévue de suppression | Remplacé par |
|------|-------------|---------------------------|--------------|
| `useResponsiveComponent` | Wrapper avec avertissements | 6 août 2025 | `useResponsive().getResponsiveComponent` |
| `useTheme` (racine) | Re-export simple | 6 août 2025 | `useTheme` (dans `/common/`) |

### Hooks spécifiques aux entités (Details/Search/List/Form)

| Catégorie | Hooks | État actuel | Date prévue de suppression | Remplacés par |
|-----------|-------|-------------|---------------------------|---------------|
| Hooks de détails | `useArtisteDetails`, `useConcertDetails`, etc. | Wrappers avec avertissements | 6 novembre 2025 | `useGenericEntityDetails` |
| Hooks de recherche | `useLieuSearch`, `useProgrammateurSearch`, etc. | Wrappers avec avertissements | 6 novembre 2025 | `useGenericEntitySearch` |
| Hooks de liste | `useArtistesList`, `useLieuxFilters`, etc. | Wrappers avec avertissements | 6 novembre 2025 | `useGenericEntityList` |
| Hooks de formulaire | `useConcertForm`, `useLieuForm`, etc. | Wrappers avec avertissements | 6 novembre 2025 | `useGenericEntityForm` |

## Calendrier de dépréciation

### Phase 1: Communication et documentation (Mai-Juin 2025) ✅

- ✅ Documentation des hooks génériques
- ✅ Guides de migration pour les développeurs
- ✅ Transformation des hooks spécifiques en wrappers avec avertissements
- ⏳ **À faire** (15 mai 2025): Présentation aux équipes de développement du plan de dépréciation
- ⏳ **À faire** (1 juin 2025): Mise à jour des standards de développement pour intégrer les hooks génériques

### Phase 2: Migration et suppression des hooks utilitaires (Juin-Août 2025)

- **6 août 2025**: Date limite pour migrer tout code utilisant `useResponsiveComponent` et `useTheme` (racine)
- **10 août 2025**: Suppression définitive de ces hooks et de leurs wrappers

### Phase 3: Migration des hooks spécifiques d'entité (Août-Octobre 2025)

- **15 septembre 2025**: Point de contrôle - analyse d'utilisation des hooks dépréciés
- **15 octobre 2025**: Date limite pour migrer le code utilisant les hooks spécifiques d'entité

### Phase 4: Suppression finale (Novembre 2025)

- **1 novembre 2025**: Avertissements renforcés (erreurs de console)
- **6 novembre 2025**: Suppression définitive de tous les hooks dépréciés restants

## Stratégie de migration

### 1. Détection automatisée

Un script d'analyse automatique sera exécuté hebdomadairement pour détecter l'utilisation de hooks dépréciés dans le code:

```bash
# Le script sera disponible à
scripts/detect_deprecated_hooks.js
```

### 2. Communication proactive

- Notifications dans les réunions d'équipe hebdomadaires
- Mises à jour mensuelles par e-mail avec l'état d'avancement
- Documentation maintenue à jour

### 3. Support technique

L'équipe centrale fournira un support pour la migration:

- Sessions de support dédiées (tous les mercredis, 14h-16h)
- Revues de code spécifiques pour les migrations complexes
- Documentation des cas d'utilisation spécifiques

## Métriques de suivi

Nous suivrons les métriques suivantes pour évaluer l'avancement de la migration:

| Métrique | Cible initiale | Cible T+1 mois | Cible T+3 mois | Cible finale |
|----------|---------------|---------------|--------------|--------------|
| % de composants utilisant les hooks génériques | 50% | 70% | 90% | 100% |
| % de hooks dépréciés avec avertissements | 100% | 100% | 100% | 0% (supprimés) |
| Erreurs de console liées aux hooks | < 10 | < 5 | < 2 | 0 |

## Exceptions et cas particuliers

Certains composants peuvent nécessiter plus de temps pour la migration en raison de leur complexité:

1. Les composants du module de contrats (`ContratGenerator`, `ContratTemplateEditor`)
2. Les composants de tableaux de bord interactifs

Ces composants bénéficieront d'un délai supplémentaire jusqu'au 15 novembre 2025, mais doivent suivre le même processus de migration.

---

**Note**: Ce plan de dépréciation a été approuvé par l'équipe de direction et l'équipe technique le 6 mai 2025. Toute modification doit être soumise à l'approbation des responsables techniques.