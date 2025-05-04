# Standardisation des Hooks

## Contexte

Cette documentation détaille le travail de standardisation des hooks réalisé dans l'application app-booking-2. L'objectif de cette standardisation était d'organiser tous les hooks dans une structure cohérente pour améliorer la maintenabilité du code et faciliter la réutilisation des hooks à travers l'application.

## Problème initial

Avant la standardisation, plusieurs problèmes ont été identifiés :

1. **Manque de cohérence architecturale** : Les hooks étaient dispersés à différents endroits dans l'application (dans `/components`, `/hooks`, etc.) sans organisation claire.

2. **Duplication de code** : Différentes versions des mêmes hooks existaient dans différents dossiers.

3. **Difficultés pour retrouver les hooks** : L'absence d'organisation claire rendait difficile de trouver le hook nécessaire pour une tâche spécifique.

4. **Complexité d'importation** : Les chemins d'importation étaient souvent complexes et incohérents.

## Solution implémentée

### 1. Structure standardisée des hooks

Tous les hooks ont été organisés selon la structure suivante :

```
src/hooks/
  index.js                   # Exporte tous les hooks principaux
  [common hooks]             # Hooks génériques utilisés dans toute l'application
  artistes/                  # Hooks spécifiques aux artistes
    index.js                 # Exporte tous les hooks d'artistes
  common/                    # Hooks utilitaires communs
    index.js                 # Exporte tous les hooks communs
  concerts/                  # Hooks spécifiques aux concerts
    index.js                 # Exporte tous les hooks de concerts
  lieux/                     # Hooks spécifiques aux lieux
    index.js                 # Exporte tous les hooks de lieux
  programmateurs/            # Hooks spécifiques aux programmateurs
    index.js                 # Exporte tous les hooks de programmateurs
  [...autres catégories]
```

### 2. Standardisation des hooks clés

Plusieurs hooks importants ont été standardisés, notamment :

#### useLieuDetails

- **Déplacement** : de `/components/lieux/desktop/hooks/useLieuDetails.js` vers `/hooks/lieux/useLieuDetails.js`
- **Amélioration** : Ajout d'une documentation JSDoc complète et optimisation des fonctionnalités
- **Fichiers mis à jour** : 
  - `/components/lieux/LieuDetails.js`
  - `/components/lieux/desktop/LieuView.js`
  - `/components/lieux/mobile/LieuView.js`
  - `/components/lieux/desktop/LieuDetails.js`

#### useProgrammateurSearch

- **Consolidation** : Fusion des fonctionnalités de différentes versions du hook
- **Emplacement standardisé** : `/hooks/programmateurs/useProgrammateurSearch.js`
- **Améliorations** : 
  - Interface flexible avec support pour différents modes d'utilisation
  - Compatibilité avec les anciennes implémentations via une API unifiée
  - Documentation JSDoc complète
  - Gestion intelligente des options pour supporter à la fois les appels directs avec lieuId et les appels avec objet d'options
- **Résolution de conflits** : Fusion des fonctionnalités de deux implémentations différentes :
  - Version spécifique aux lieux (chargement du programmateur lié à un lieu)
  - Version générique utilisant `useEntitySearch`

#### useAddressSearch

- **Standardisation** : Utilisation de la version principale dans `/hooks/common/useAddressSearch.js`
- **Fonctionnalités** : 
  - Support du mode standard et du mode formulaire
  - Interface flexible pour différents cas d'utilisation
  - Intégration avec l'API LocationIQ

### 3. Création de fichiers index.js

Des fichiers `index.js` ont été créés dans chaque dossier de hooks pour faciliter les imports :

```javascript
// Exemple pour src/hooks/lieux/index.js
export { default as useLieuDetails } from './useLieuDetails';
export { default as useLieuForm } from './useLieuForm';
export { default as useLieuSearch } from './useLieuSearch';
// ... autres hooks
```

Cela permet d'importer les hooks de manière plus concise :

```javascript
import { useLieuDetails, useLieuSearch } from '@/hooks/lieux';
```

au lieu de :

```javascript
import useLieuDetails from '@/hooks/lieux/useLieuDetails';
import useLieuSearch from '@/hooks/lieux/useLieuSearch';
```

## Hooks standardisés

### Hooks de lieux

- `useLieuDetails` - Gestion complète des détails d'un lieu
- `useLieuForm` - Gestion du formulaire d'édition d'un lieu
- `useLieuSearch` - Recherche de lieux
- `useAddressSearch` - Recherche et sélection d'adresses pour les lieux

### Hooks de programmateurs

- `useProgrammateurDetails` - Gestion des détails d'un programmateur
- `useProgrammateurSearch` - Recherche et sélection de programmateurs
- `useAddressSearch` - Version adaptée pour les programmateurs

### Hooks communs

- `useAddressSearch` - Version générique pour la recherche d'adresses
- `useEntitySearch` - Recherche générique d'entités dans Firestore
- `useResponsive` - Gestion de l'affichage responsive
- `useTheme` - Gestion du thème de l'application

## Fichiers supprimés

Pour éviter toute confusion, les fichiers hooks suivants ont été supprimés après avoir vérifié que leurs fonctionnalités étaient correctement migrées vers les versions standardisées :

- `/components/lieux/desktop/hooks/useLieuDetails.js`
- `/components/lieux/desktop/hooks/useProgrammateurSearch.js`
- `/components/lieux/desktop/hooks/useAddressSearch.js`

## Corrections d'erreurs et optimisations

Suite à la standardisation initiale, quelques problèmes ont été identifiés et corrigés :

1. **Export manquant dans index.js** :
   - Problème : Le hook `useProgrammateurSearch` n'était pas correctement exporté dans `/hooks/programmateurs/index.js`
   - Solution : Ajout de la ligne d'export dans le fichier index :
     ```javascript
     export { default as useProgrammateurSearch } from './useProgrammateurSearch';
     ```
   - Effets : Résolution des erreurs de compilation dans les composants utilisant ce hook

2. **Incompatibilités d'API** :
   - Problème : Certaines implémentations existantes utilisaient l'ancienne API des hooks
   - Solution : Implémentation d'une API rétrocompatible dans les hooks standardisés
   - Exemple : Adaptation du hook `useProgrammateurSearch` pour accepter directement un lieuId comme paramètre

3. **Vérification de la couverture fonctionnelle** :
   - Tests effectués pour s'assurer que toutes les fonctionnalités des hooks originaux sont préservées
   - Validation du fonctionnement des composants après migration vers les hooks standardisés

## Avantages de la standardisation

1. **Architecture cohérente** : Tous les hooks suivent maintenant une convention de nommage et d'organisation claire
2. **Meilleure découvrabilité** : Il est plus facile de trouver les hooks existants
3. **Facilitation des imports** : Les fichiers index.js permettent des imports plus concis
4. **Documentation améliorée** : Ajout de documentation JSDoc pour tous les hooks standardisés
5. **Réduction de la duplication** : Fusion des hooks ayant des fonctionnalités similaires

## Recommandations pour l'avenir

Pour maintenir cette standardisation, il est recommandé de :

1. **Placer tous les nouveaux hooks dans le répertoire approprié** sous `/hooks/[catégorie]/`
2. **Mettre à jour le fichier index.js** correspondant pour exporter le nouveau hook
3. **Documenter chaque hook avec des commentaires JSDoc** expliquant son fonctionnement
4. **Favoriser la réutilisation** des hooks existants plutôt que d'en créer de nouveaux
5. **Utiliser des interfaces flexibles** pour adapter les hooks à différents cas d'utilisation

## Tâches restantes

Pour compléter la standardisation des hooks dans l'ensemble du projet :

1. **Réviser les hooks des autres entités** :
   - Hooks liés aux contrats
   - Hooks liés aux structures 
   - Hooks liés aux paiements

2. **Mettre à jour la documentation des API** :
   - Créer une documentation complète des API pour chaque hook standardisé
   - Inclure des exemples d'utilisation pour différents scénarios

3. **Ajouter des tests unitaires** :
   - Implémenter des tests pour valider le bon fonctionnement des hooks standardisés
   - Assurer la couverture des différents cas d'utilisation

## Historique des mises à jour

- **Mai 2024** : Standardisation initiale des hooks liés aux lieux et programmateurs
- **4 mai 2025** : Corrections et optimisations, mise à jour de la documentation