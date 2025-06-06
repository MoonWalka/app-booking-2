# Exemple d'Intégration des Relations Bidirectionnelles

## 1. Dans un formulaire de Programmateur

```javascript
// ProgrammateurForm.js
import { useBidirectionalRelations } from '@/hooks/common/useBidirectionalRelations';

const ProgrammateurForm = () => {
  const { programmateur, handleSubmit, ... } = useProgrammateurForm(id);
  
  // Hook pour gérer les relations bidirectionnelles
  const { updateRelation } = useBidirectionalRelations('programmateur', id);
  
  // Lors de l'ajout d'un lieu
  const handleAddLieu = async (lieuId) => {
    try {
      // Ajouter le lieu aux données du formulaire
      const updatedLieuxIds = [...(programmateur.lieuxIds || []), lieuId];
      setFormData(prev => ({ ...prev, lieuxIds: updatedLieuxIds }));
      
      // Mettre à jour la relation bidirectionnelle
      await updateRelation('lieu', null, lieuId, 'lieux');
      
      toast.success('Lieu associé avec succès');
    } catch (error) {
      toast.error('Erreur lors de l\'association du lieu');
    }
  };
  
  // Lors de la suppression d'un lieu
  const handleRemoveLieu = async (lieuId) => {
    try {
      // Retirer le lieu des données du formulaire
      const updatedLieuxIds = programmateur.lieuxIds.filter(id => id !== lieuId);
      setFormData(prev => ({ ...prev, lieuxIds: updatedLieuxIds }));
      
      // Mettre à jour la relation bidirectionnelle
      await updateRelation('lieu', lieuId, null, 'lieux');
      
      toast.success('Lieu dissocié avec succès');
    } catch (error) {
      toast.error('Erreur lors de la dissociation du lieu');
    }
  };
  
  return (
    // ... reste du composant
  );
};
```

## 2. Dans le hook useGenericAction (modification suggérée)

```javascript
// useGenericAction.js - Ajouter après la création/mise à jour

const update = useCallback(async (id, data) => {
  setLoading(true);
  setError(null);
  
  try {
    // ... code existant pour la mise à jour ...
    
    // NOUVEAU : Gérer les relations bidirectionnelles
    if (entityConfig && entityConfig.relations) {
      for (const [relationName, relationConfig of Object.entries(entityConfig.relations)) {
        if (relationConfig.bidirectional && data[relationConfig.field] !== undefined) {
          // Récupérer l'ancienne valeur
          const oldDoc = await getDoc(doc(db, entityType, id));
          const oldData = oldDoc.exists() ? oldDoc.data() : {};
          const oldValue = oldData[relationConfig.field];
          const newValue = data[relationConfig.field];
          
          // Comparer et mettre à jour si nécessaire
          if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
            // Gérer les changements de relations
            await handleRelationChange(
              entityType,
              id,
              relationConfig,
              oldValue,
              newValue
            );
          }
        }
      }
    }
    
    return result;
  } catch (err) {
    // ... gestion d'erreur existante ...
  }
}, [entityType, validateBeforeAction, enableLogging, autoResetError]);
```

## 3. Script de migration des données existantes

```javascript
// scripts/migrate-bidirectional-relations.js
import { db } from '../src/services/firebase-service';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { checkAndFixBidirectionalRelations } from '../src/services/bidirectionalRelationsService';

async function migrateAllRelations() {
  console.log('🚀 Début de la migration des relations bidirectionnelles');
  
  const entityTypes = ['programmateurs', 'lieux', 'concerts', 'artistes', 'structures'];
  const report = {};
  
  for (const collectionName of entityTypes) {
    console.log(`\n📋 Migration de la collection: ${collectionName}`);
    report[collectionName] = { total: 0, corrected: 0, errors: [] };
    
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      report[collectionName].total = querySnapshot.size;
      
      for (const docSnap of querySnapshot.docs) {
        const entityType = collectionName.endsWith('x') ? 
          collectionName.slice(0, -1) : 
          collectionName.slice(0, -1);
          
        const result = await checkAndFixBidirectionalRelations(
          entityType,
          docSnap.id
        );
        
        if (result.corrections && result.corrections.length > 0) {
          report[collectionName].corrected++;
          console.log(`✅ Corrigé ${docSnap.id}: ${result.corrections.length} corrections`);
        }
        
        if (result.error) {
          report[collectionName].errors.push({
            id: docSnap.id,
            error: result.error
          });
        }
      }
    } catch (error) {
      console.error(`❌ Erreur lors de la migration de ${collectionName}:`, error);
      report[collectionName].errors.push({
        collection: true,
        error: error.message
      });
    }
  }
  
  // Afficher le rapport
  console.log('\n📊 RAPPORT DE MIGRATION');
  console.log('======================');
  
  for (const [collection, stats] of Object.entries(report)) {
    console.log(`\n${collection}:`);
    console.log(`  - Total: ${stats.total}`);
    console.log(`  - Corrigés: ${stats.corrected}`);
    console.log(`  - Erreurs: ${stats.errors.length}`);
    
    if (stats.errors.length > 0) {
      console.log('  - Détail des erreurs:');
      stats.errors.forEach(err => {
        console.log(`    • ${err.id || 'Collection'}: ${err.error}`);
      });
    }
  }
  
  console.log('\n✨ Migration terminée!');
}

// Exécuter la migration
migrateAllRelations().catch(console.error);
```

## 4. Tests unitaires

```javascript
// __tests__/bidirectionalRelations.test.js
import { updateBidirectionalRelation } from '@/services/bidirectionalRelationsService';
import { doc, getDoc } from 'firebase/firestore';

describe('Bidirectional Relations Service', () => {
  test('should add bidirectional relation between lieu and programmateur', async () => {
    // Arrange
    const lieuId = 'lieu1';
    const programmateurId = 'prog1';
    
    // Act
    await updateBidirectionalRelation({
      sourceType: 'lieu',
      sourceId: lieuId,
      targetType: 'programmateur',
      targetId: programmateurId,
      relationName: 'programmateurs',
      action: 'add'
    });
    
    // Assert
    const lieuDoc = await getDoc(doc(db, 'lieux', lieuId));
    const progDoc = await getDoc(doc(db, 'programmateurs', programmateurId));
    
    expect(lieuDoc.data().programmateurIds).toContain(programmateurId);
    expect(progDoc.data().lieuxIds).toContain(lieuId);
  });
  
  test('should remove bidirectional relation', async () => {
    // Similar test for removal
  });
});
```

## 5. Monitoring et Debug

```javascript
// components/debug/BidirectionalRelationsDebug.js
import { useState } from 'react';
import { checkAndFixBidirectionalRelations } from '@/services/bidirectionalRelationsService';

const BidirectionalRelationsDebug = () => {
  const [report, setReport] = useState(null);
  const [checking, setChecking] = useState(false);
  
  const checkEntity = async (entityType, entityId) => {
    setChecking(true);
    try {
      const result = await checkAndFixBidirectionalRelations(entityType, entityId);
      setReport(result);
    } catch (error) {
      setReport({ error: error.message });
    } finally {
      setChecking(false);
    }
  };
  
  return (
    <div>
      <h3>Vérificateur de Relations Bidirectionnelles</h3>
      {/* Interface pour tester */}
    </div>
  );
};
```

## Points Clés

1. **Toujours utiliser le service** pour modifier les relations
2. **Vérifier les permissions** avant les modifications
3. **Gérer les erreurs** gracieusement
4. **Logger les opérations** pour le debug
5. **Tester exhaustivement** avant la mise en production