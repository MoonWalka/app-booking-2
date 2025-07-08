# Audit des Hooks de Suppression - Vérification de l'appartenance à l'Organisation

## Date de l'audit : 6/6/2025

## Résumé Exécutif

L'audit a révélé que **AUCUN** des hooks de suppression ne vérifie actuellement l'appartenance à l'organisation avant de supprimer une entité. C'est une **vulnérabilité de sécurité critique** qui permet potentiellement à un utilisateur de supprimer des entités appartenant à d'autres organisations.

## Hooks Audités

### 1. `/src/hooks/common/useGenericEntityDelete.js`
- **Status** : ❌ **AUCUNE vérification d'organisation**
- **Problème** : Le hook générique utilisé par tous les autres hooks de suppression ne vérifie pas l'appartenance à l'organisation
- **Impact** : Tous les hooks qui l'utilisent héritent de cette vulnérabilité
- **Lignes critiques** : 
  - Ligne 229 : `await deleteDoc(entityRef);` - Suppression directe sans vérification

### 2. `/src/hooks/artistes/useDeleteArtiste.js`
- **Status** : ❌ **AUCUNE vérification d'organisation**
- **Problème** : Utilise `useGenericEntityDelete` sans ajout de vérification supplémentaire

### 3. `/src/hooks/concerts/useConcertDelete.js`
- **Status** : ❌ **AUCUNE vérification d'organisation**
- **Problème** : Utilise `useGenericEntityDelete` sans ajout de vérification supplémentaire
- **Note** : Suppression directe sans confirmation (`showConfirmation: false`)

### 4. `/src/hooks/lieux/useLieuDelete.js`
- **Status** : ❌ **AUCUNE vérification d'organisation**
- **Problème** : Utilise `useGenericEntityDelete` sans ajout de vérification supplémentaire

### 5. `/src/hooks/contacts/useDeleteContact.js`
- **Status** : ❌ **AUCUNE vérification d'organisation**
- **Problème** : Utilise `useGenericEntityDelete` sans ajout de vérification supplémentaire

### 6. `/src/hooks/structures/useDeleteStructure.js`
- **Status** : ❌ **AUCUNE vérification d'organisation**
- **Problème** : Utilise `useGenericEntityDelete` sans ajout de vérification supplémentaire
- **Note** : Utilise un modal personnalisé pour la confirmation

### 7. `/src/hooks/contrats/useContratActions.js`
- **Status** : ✅ **VÉRIFICATION IMPLÉMENTÉE**
- **Points positifs** :
  - Fonction `verifyContratOwnership()` qui vérifie l'appartenance (lignes 18-34)
  - Vérification avant chaque action (suppression, envoi, signature)
  - Message d'erreur clair : "Accès non autorisé à ce contrat"

### 8. `/src/hooks/relances/useRelances.js`
- **Status** : ❌ **AUCUNE vérification lors de la suppression**
- **Problème** : La fonction `deleteRelance` (lignes 96-106) supprime directement sans vérification
- **Note** : Les relances sont filtrées par organisation lors du chargement, mais pas lors de la suppression

## Recommandations Critiques

### 1. Correction Immédiate du Hook Générique

Le hook `useGenericEntityDelete` doit être modifié pour inclure une vérification d'organisation :

```javascript
// Ajouter dans useGenericEntityDelete.js
const { currentOrganization } = useOrganization();

// Avant la suppression (ligne 229)
const entityDoc = await getDoc(entityRef);
if (!entityDoc.exists()) {
  throw new Error(`${entityType} introuvable`);
}

const entityData = entityDoc.data();
if (entityData.entrepriseId !== currentOrganization?.id) {
  throw new Error(`Accès non autorisé à ce ${entityType}`);
}

// Puis procéder à la suppression
await deleteDoc(entityRef);
```

### 2. Mise à jour du Hook useRelances

```javascript
const deleteRelance = useCallback(async (relanceId) => {
  try {
    const relanceRef = doc(db, 'relances', relanceId);
    
    // Vérifier l'appartenance avant suppression
    const relanceDoc = await getDoc(relanceRef);
    if (!relanceDoc.exists()) {
      throw new Error('Relance introuvable');
    }
    
    const relanceData = relanceDoc.data();
    if (relanceData.entrepriseId !== currentOrganization?.id) {
      throw new Error('Accès non autorisé à cette relance');
    }
    
    await deleteDoc(relanceRef);
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la suppression de la relance:', error);
    throw error;
  }
}, [currentOrganization]);
```

### 3. Ajouter une Option de Configuration

Pour les cas où la vérification d'organisation n'est pas nécessaire (ex: admin), ajouter une option :

```javascript
const useGenericEntityDelete = (options) => {
  const {
    // ... autres options
    skipOrganizationCheck = false
  } = options || {};
```

### 4. Tests de Sécurité

Implémenter des tests qui vérifient :
- Qu'un utilisateur ne peut pas supprimer une entité d'une autre organisation
- Que les messages d'erreur appropriés sont affichés
- Que les logs d'audit sont créés pour les tentatives non autorisées

## Impact et Priorité

**Priorité : CRITIQUE** 🔴

Cette vulnérabilité permet potentiellement :
- La suppression non autorisée de données d'autres organisations
- La perte de données critiques
- Des problèmes de conformité RGPD
- Une violation de la confiance des utilisateurs

## Plan d'Action Recommandé

1. **Immédiat** : Corriger `useGenericEntityDelete` et `useRelances`
2. **Court terme** : Ajouter des tests automatisés
3. **Moyen terme** : Audit de toutes les opérations CRUD (Create, Read, Update)
4. **Long terme** : Implémenter des règles de sécurité Firestore côté serveur

## Conclusion

L'audit révèle une vulnérabilité critique qui doit être corrigée immédiatement. Seul le hook `useContratActions` implémente correctement la vérification d'organisation, ce qui peut servir de modèle pour les corrections nécessaires.