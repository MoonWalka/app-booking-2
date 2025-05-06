# Guide de Migration des Hooks Spécifiques vers les Hooks Génériques

*Créé le: 6 mai 2025*

Ce guide détaille la stratégie et les étapes pratiques pour migrer progressivement les hooks spécifiques aux entités (artistes, lieux, programmateurs, etc.) vers leurs versions basées sur les hooks génériques.

## Table des matières

1. [Contexte](#contexte)
2. [Principes de la migration progressive](#principes-de-la-migration-progressive)
3. [Stratégie par étapes](#stratégie-par-étapes)
4. [Guide pratique d'implémentation](#guide-pratique-dimplémentation)
5. [Exemples concrets](#exemples-concrets)
6. [Calendrier recommandé](#calendrier-recommandé)
7. [Vérification et tests](#vérification-et-tests)

## Contexte

Dans le cadre de la restructuration des hooks, nous passons de hooks spécifiques à chaque entité (useProgrammateurDetails, useLieuDetails, etc.) à des hooks génériques réutilisables (useGenericEntityDetails). Cette migration présente plusieurs défis :

- **Compatibilité** : Les composants existants ne doivent pas cesser de fonctionner pendant la transition
- **Adoption progressive** : Permettre à l'équipe de s'adapter aux nouvelles API sans urgence
- **Sécurité** : Minimiser les risques d'introduction de bugs

## Principes de la migration progressive

Notre stratégie de migration repose sur trois principes fondamentaux :

1. **Approche par wrapper** : Transformer les hooks originaux en wrappers autour de leurs versions migrées
2. **Rétrocompatibilité** : Maintenir la même API publique pour les composants existants
3. **Communication claire** : Ajouter des avertissements de dépréciation et de la documentation

## Stratégie par étapes

### Phase 1 : Transformation des hooks originaux en wrappers

Pour chaque hook spécifique (par exemple `useProgrammateurDetails`), nous allons :

1. Remplacer le code existant par un wrapper autour de la version migrée (`useProgrammateurDetailsMigrated`)
2. Adapter l'API pour maintenir la compatibilité
3. Ajouter des avertissements de dépréciation via `console.warn`

### Phase 2 : Exposition des versions alternatives dans les fichiers index.js

Dans chaque fichier `index.js` de dossier spécifique (programmateurs, lieux, etc.), nous allons :

1. Continuer à exporter les hooks originaux (wrappers) pour la compatibilité
2. Ajouter l'export des versions migrées avec leur nom original + "Migrated"
3. Ajouter l'export des versions migrées avec un suffixe "V2" pour encourager l'adoption

### Phase 3 : Migration des composants

Pour les composants utilisant les hooks originaux, nous recommandons :

1. Pour les nouveaux composants : Utiliser directement les versions V2
2. Pour les composants existants : Migrer vers les versions V2 lors des prochaines modifications substantielles

## Guide pratique d'implémentation

### 1. Transformer un hook original en wrapper

Voici comment transformer un hook original en wrapper :

```javascript
/**
 * @deprecated Ce hook est déprécié et sera supprimé dans une future version.
 * Veuillez utiliser le hook migré vers les hooks génériques à la place:
 * import { useXxxDetailsV2 } from '@/hooks/xxx';
 */
import useXxxDetailsMigrated from './useXxxDetailsMigrated';
import { useEffect } from 'react';

const useXxxDetails = (id) => {
  // Afficher un avertissement de dépréciation
  useEffect(() => {
    console.warn(
      'Avertissement: useXxxDetails est déprécié. ' +
      'Veuillez utiliser useXxxDetailsV2 depuis @/hooks/xxx à la place.'
    );
  }, []);
  
  // Utiliser la version migrée 
  const migratedHook = useXxxDetailsMigrated(id);
  
  // Adapter l'API pour être compatible avec les composants existants
  return {
    // Mapper les propriétés de la version migrée vers les noms attendus par les composants
    xxx: migratedHook.entity,
    loading: migratedHook.isLoading,
    // etc.
    
    // Mapper les fonctions
    handleSubmit: migratedHook.saveEntity,
    // etc.
  };
};

export default useXxxDetails;
```

### 2. Mettre à jour les fichiers index.js

```javascript
// src/hooks/xxx/index.js

// Export du hook original (maintenant un wrapper)
export { default as useXxxDetails } from './useXxxDetails';

// Export de la version migrée avec son nom original
export { default as useXxxDetailsMigrated } from './useXxxDetailsMigrated';

/**
 * @recommended La version migrée du hook useXxxDetails basée sur les hooks génériques.
 * À utiliser dans les nouveaux développements.
 */
export { default as useXxxDetailsV2 } from './useXxxDetailsMigrated';
```

### 3. Documenter les différences d'API

Pour chaque hook migré, documentez les différences clés entre l'API originale et l'API migrée :

```javascript
/**
 * API originale:
 * - xxx: données de l'entité
 * - loading: état de chargement
 * - handleSubmit: fonction de soumission
 * 
 * API migrée:
 * - entity: données de l'entité
 * - isLoading: état de chargement
 * - saveEntity: fonction de soumission
 */
```

## Exemples concrets

### Exemple de useProgrammateurDetails

Le hook `useProgrammateurDetails` a été transformé en wrapper autour de `useProgrammateurDetailsMigrated` :

```javascript
// Version originale (simplifiée)
const useProgrammateurDetails = (id) => {
  const [programmateur, setProgrammateur] = useState(null);
  const [loading, setLoading] = useState(true);
  // ...
  return { programmateur, loading, handleSubmit, /* ... */ };
};

// Nouvelle version (wrapper)
const useProgrammateurDetails = (id) => {
  // Avertissement de dépréciation 
  useEffect(() => {
    console.warn('Hook déprécié, utiliser useProgrammateurDetailsV2');
  }, []);
  
  // Utiliser la version migrée
  const migratedHook = useProgrammateurDetailsMigrated(id);
  
  // Adapter l'API
  return {
    programmateur: migratedHook.entity,
    loading: migratedHook.isLoading,
    handleSubmit: migratedHook.saveEntity,
    // ...
  };
};
```

## Calendrier recommandé

1. **Mai 2025** : Transformation des hooks en wrappers
2. **Juin 2025** : Documentation complète des différences d'API
3. **Juillet-Août 2025** : Migration progressive des composants
4. **Septembre 2025** : Dépréciation officielle des hooks originaux
5. **Décembre 2025** : Suppression des hooks originaux (wrappers)

## Vérification et tests

Pour chaque hook transformé en wrapper, assurez-vous de :

1. Vérifier que les composants existants continuent de fonctionner
2. S'assurer que les avertissements de dépréciation s'affichent correctement
3. Tester que les données sont correctement transmises entre le wrapper et le hook migré
4. Vérifier que les événements (soumission de formulaire, suppression, etc.) fonctionnent comme prévu

---

*Document préparé par l'équipe Développement*
*Pour toute question: dev@tourcraft.com*