# Rapport d'Audit - Filtrage par organizationId dans les Hooks

## Date: 3 janvier 2025

## Résumé Exécutif

Cet audit examine tous les hooks spécifiques qui font des appels directs à Firebase pour vérifier s'ils filtrent correctement par `organizationId`. L'objectif est d'identifier les hooks non conformes qui nécessitent des corrections pour le support multi-organisations.

## Hooks Conformes ✅

### 1. **useRelances** (/src/hooks/relances/useRelances.js)
- ✅ Utilise `useOrganization` pour récupérer `currentOrganization`
- ✅ Filtre les requêtes par `organizationId` ligne 43: `where('organizationId', '==', currentOrganization.id)`
- ✅ Vérifie la présence de l'organisation avant d'exécuter les requêtes

### 2. **useRelancesAutomatiques** (/src/hooks/relances/useRelancesAutomatiques.js)
- ✅ Utilise `useOrganization` pour récupérer `currentOrganization`
- ✅ Passe `currentOrganization.id` à toutes les méthodes du service
- ✅ Vérifie la présence de l'organisation avant d'appeler les services

### 3. **useArtistesList** (/src/hooks/artistes/useArtistesList.js)
- ✅ Utilise `useOrganization` pour récupérer `currentOrganization`
- ✅ Filtre par `organizationId` dans la fonction `calculateStats` ligne 99: `where('organizationId', '==', currentOrganization.id)`
- ✅ Utilise `useGenericEntityList` qui gère automatiquement l'organizationId

### 4. **useLieuxQuery** (/src/hooks/lieux/useLieuxQuery.js)
- ✅ Utilise `useOrganization` pour récupérer `currentOrganization`
- ✅ Filtre par `organizationId` ligne 132: `where('organizationId', '==', currentOrganization.id)`
- ✅ Vérifie la présence de l'organisation avant d'exécuter les requêtes

### 5. **useMultiOrgQuery** (/src/hooks/useMultiOrgQuery.js)
- ✅ Hook spécialement conçu pour le multi-organisation
- ✅ Gère automatiquement les collections organisationnelles
- ✅ Fallback vers collections standard avec filtre `organizationId`
- ✅ Ajoute `organizationId` lors des créations dans `useMultiOrgMutation`

## Hooks Non Conformes ❌

### 1. **useConcertListData** (/src/hooks/concerts/useConcertListData.js) ⚠️ CRITIQUE
**Problèmes identifiés:**
- ❌ N'importe pas `useOrganization`
- ❌ Ne filtre pas par `organizationId` dans la requête principale des concerts (ligne 267)
- ❌ Ne filtre pas les formulaires par `organizationId` (ligne 333)
- ❌ Ne filtre pas les contrats par `organizationId` (ligne 361)
- ❌ Le cache local ne tient pas compte de l'organisation

**Corrections nécessaires:**
```javascript
// Ajouter l'import
import { useOrganization } from '@/context/OrganizationContext';

// Dans le composant
const { currentOrganization } = useOrganization();

// Modifier la requête des concerts (ligne 267)
let q = query(
  concertsRef, 
  where('organizationId', '==', currentOrganization.id),
  orderBy('date', 'desc'), 
  limit(pageSize)
);

// Modifier les requêtes des formulaires et contrats de la même façon
```

### 2. **useContratActions** (/src/hooks/contrats/useContratActions.js) ⚠️ CRITIQUE
**Problèmes identifiés:**
- ❌ N'importe pas `useOrganization`
- ❌ Ne vérifie pas que le contrat appartient à l'organisation avant modification/suppression
- ❌ N'ajoute pas `organizationId` lors des mises à jour

**Corrections nécessaires:**
```javascript
// Ajouter validation de l'appartenance avant toute action
const contratDoc = await getDoc(doc(db, 'contrats', contratId));
if (contratDoc.data()?.organizationId !== currentOrganization.id) {
  throw new Error('Accès non autorisé à ce contrat');
}
```

### 3. **useFormTokenValidation** (/src/hooks/forms/useFormTokenValidation.js) ⚠️ MODÉRÉ
**Problèmes identifiés:**
- ❌ N'importe pas `useOrganization`
- ❌ Ne filtre pas les `formLinks` par `organizationId` (ligne 89)
- ⚠️ Utilise `useGenericEntityDetails` pour le concert mais sans vérifier l'organisation

**Note:** Ce hook est utilisé pour les formulaires publics, donc le filtrage par organisation pourrait ne pas être nécessaire selon le cas d'usage.

### 4. **useEntrepriseForm** (/src/hooks/parametres/useEntrepriseForm.js) ✓ ACCEPTABLE
**Note:** Ce hook utilise le `ParametresContext` qui gère déjà l'isolation par organisation. Pas de correction nécessaire.

### 5. **useFirestoreSubscription** (/src/hooks/common/useFirestoreSubscription.js) ⚠️ MODÉRÉ
**Problèmes identifiés:**
- ❌ Hook générique qui ne gère pas l'organizationId
- ⚠️ Devrait accepter un paramètre optionnel pour filtrer par organisation

**Note:** C'est un hook utilitaire générique, il pourrait être acceptable qu'il ne gère pas l'organizationId directement.

### 6. **useCompanySearch** (/src/hooks/common/useCompanySearch.js) ✓ OK
**Note:** Ce hook utilise une API externe (API Entreprise), donc pas de filtrage par organisation nécessaire.

### 7. **useStructureValidation** (/src/hooks/structures/useStructureValidation.js) ✓ OK
**Note:** Hook de validation pure, pas d'appels Firebase, donc pas de filtrage nécessaire.

### 8. **useConcertStatus** (/src/hooks/concerts/useConcertStatus.js) ✓ OK
**Note:** Wrapper autour de `useGenericEntityStatus`, pas d'appels Firebase directs.

### 9. **useConcertActions** (/src/hooks/concerts/useConcertActions.js) ✓ OK
**Note:** Hook de navigation uniquement, pas d'appels Firebase.

## Hooks Génériques à Vérifier

Les hooks génériques suivants devraient être vérifiés pour s'assurer qu'ils gèrent correctement l'organizationId:
- `useGenericEntityList`
- `useGenericEntityDetails`
- `useGenericEntityForm`
- `useGenericEntityDelete`
- `useGenericEntitySearch`

## Recommandations

### 1. Corrections Prioritaires (CRITIQUE)
- **useConcertListData**: Ajouter le filtrage par organizationId sur toutes les requêtes
- **useContratActions**: Ajouter validation de l'appartenance avant modifications

### 2. Corrections Importantes (MODÉRÉ)
- **useFormTokenValidation**: Évaluer si le filtrage est nécessaire selon le cas d'usage
- **useFirestoreSubscription**: Ajouter support optionnel de l'organizationId

### 3. Bonnes Pratiques
- Créer un hook `useOrganizationQuery` qui encapsule automatiquement le filtrage
- Documenter clairement quels hooks nécessitent le filtrage par organisation
- Ajouter des tests unitaires pour vérifier le filtrage correct

### 4. Pattern Recommandé
```javascript
import { useOrganization } from '@/context/OrganizationContext';

export const useEntityHook = () => {
  const { currentOrganization } = useOrganization();
  
  // Vérifier la présence de l'organisation
  if (!currentOrganization?.id) {
    console.warn('⚠️ Pas d\'organisation sélectionnée');
    return { data: [], loading: false };
  }
  
  // Toujours filtrer par organizationId
  const q = query(
    collection(db, 'collection'),
    where('organizationId', '==', currentOrganization.id)
  );
  
  // Ajouter organizationId lors des créations
  const createEntity = async (data) => {
    await addDoc(collection(db, 'collection'), {
      ...data,
      organizationId: currentOrganization.id
    });
  };
};
```

## Conclusion

L'audit révèle que plusieurs hooks critiques ne filtrent pas correctement par `organizationId`, ce qui pourrait causer des problèmes de sécurité et d'isolation des données dans un contexte multi-organisations. Les corrections prioritaires concernent principalement les hooks de gestion des concerts et contrats qui sont au cœur du système.