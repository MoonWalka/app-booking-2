/**
 * Service pour gérer les relations bidirectionnelles entre entités
 * Maintient automatiquement la cohérence des relations dans les deux sens
 */

import { db } from '@/services/firebase-service';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc, serverTimestamp } from 'firebase/firestore';
import { entityConfigurations } from '@/config/entityConfigurations';

/**
 * Met à jour une relation bidirectionnelle entre deux entités
 * 
 * @param {Object} params - Paramètres de la mise à jour
 * @param {string} params.sourceType - Type de l'entité source (ex: 'lieu')
 * @param {string} params.sourceId - ID de l'entité source
 * @param {string} params.targetType - Type de l'entité cible (ex: 'contact')
 * @param {string} params.targetId - ID de l'entité cible
 * @param {string} params.relationName - Nom de la relation dans l'entité source
 * @param {string} params.action - Action à effectuer ('add' ou 'remove')
 * @returns {Promise<void>}
 */
export async function updateBidirectionalRelation({
  sourceType,
  sourceId,
  targetType,
  targetId,
  relationName,
  action = 'add'
}) {
  try {
    console.log('[BidirectionalRelations] Mise à jour:', {
      sourceType,
      sourceId,
      targetType,
      targetId,
      relationName,
      action
    });

    // Récupérer la configuration de la relation
    const sourceConfig = entityConfigurations[sourceType];
    if (!sourceConfig || !sourceConfig.relations || !sourceConfig.relations[relationName]) {
      console.error(`[BidirectionalRelations] Configuration manquante pour ${sourceType}.${relationName}`);
      return;
    }

    const relationConfig = sourceConfig.relations[relationName];
    
    // Vérifier si la relation est bidirectionnelle
    if (!relationConfig.bidirectional) {
      console.log(`[BidirectionalRelations] Relation ${relationName} n'est pas bidirectionnelle`);
      return;
    }

    // Récupérer le nom du champ inverse
    const inverseField = relationConfig.inverseField;
    if (!inverseField) {
      console.error(`[BidirectionalRelations] Champ inverse manquant pour ${sourceType}.${relationName}`);
      return;
    }

    // Préparer les références
    const sourceRef = doc(db, getCollectionName(sourceType), sourceId);
    const targetRef = doc(db, getCollectionName(targetType), targetId);

    // Mettre à jour dans les deux sens
    if (action === 'add') {
      // Ajouter la relation
      if (relationConfig.isArray) {
        // Relation many-to-many ou one-to-many (côté many)
        await updateDoc(sourceRef, {
          [relationConfig.field]: arrayUnion(targetId),
          updatedAt: serverTimestamp()
        });
      } else {
        // Relation one-to-one ou many-to-one (côté one)
        await updateDoc(sourceRef, {
          [relationConfig.field]: targetId,
          updatedAt: serverTimestamp()
        });
      }

      // Mettre à jour l'inverse
      const targetConfig = entityConfigurations[targetType];
      const inverseRelation = findInverseRelation(targetConfig, inverseField);
      
      if (inverseRelation && inverseRelation.isArray) {
        await updateDoc(targetRef, {
          [inverseField]: arrayUnion(sourceId),
          updatedAt: serverTimestamp()
        });
      } else {
        await updateDoc(targetRef, {
          [inverseField]: sourceId,
          updatedAt: serverTimestamp()
        });
      }
    } else if (action === 'remove') {
      // Supprimer la relation
      if (relationConfig.isArray) {
        await updateDoc(sourceRef, {
          [relationConfig.field]: arrayRemove(targetId),
          updatedAt: serverTimestamp()
        });
      } else {
        await updateDoc(sourceRef, {
          [relationConfig.field]: null,
          updatedAt: serverTimestamp()
        });
      }

      // Supprimer l'inverse
      const targetConfig = entityConfigurations[targetType];
      const inverseRelation = findInverseRelation(targetConfig, inverseField);
      
      if (inverseRelation && inverseRelation.isArray) {
        await updateDoc(targetRef, {
          [inverseField]: arrayRemove(sourceId),
          updatedAt: serverTimestamp()
        });
      } else {
        await updateDoc(targetRef, {
          [inverseField]: null,
          updatedAt: serverTimestamp()
        });
      }
    }

    console.log('[BidirectionalRelations] Mise à jour réussie');
  } catch (error) {
    console.error('[BidirectionalRelations] Erreur lors de la mise à jour:', error);
    throw error;
  }
}

/**
 * Met à jour plusieurs relations bidirectionnelles en une seule transaction
 * 
 * @param {Array<Object>} operations - Liste des opérations à effectuer
 * @returns {Promise<void>}
 */
export async function batchUpdateBidirectionalRelations(operations) {
  for (const operation of operations) {
    await updateBidirectionalRelation(operation);
  }
}

/**
 * Vérifie et corrige les incohérences dans les relations bidirectionnelles
 * 
 * @param {string} entityType - Type d'entité à vérifier
 * @param {string} entityId - ID de l'entité
 * @returns {Promise<Object>} - Rapport des corrections effectuées
 */
export async function checkAndFixBidirectionalRelations(entityType, entityId) {
  const corrections = [];
  
  try {
    // Récupérer l'entité
    const entityRef = doc(db, getCollectionName(entityType), entityId);
    const entityDoc = await getDoc(entityRef);
    
    if (!entityDoc.exists()) {
      return { error: 'Entité non trouvée', corrections };
    }
    
    const entityData = entityDoc.data();
    const entityConfig = entityConfigurations[entityType];
    
    if (!entityConfig || !entityConfig.relations) {
      return { error: 'Configuration manquante', corrections };
    }
    
    // Vérifier chaque relation bidirectionnelle
    for (const [relationName, relationConfig] of Object.entries(entityConfig.relations)) {
      if (!relationConfig.bidirectional) continue;
      
      const relatedIds = entityData[relationConfig.field];
      if (!relatedIds) continue;
      
      const idsToCheck = relationConfig.isArray ? relatedIds : [relatedIds];
      
      for (const relatedId of idsToCheck) {
        if (!relatedId) continue;
        
        // Vérifier que la relation inverse existe
        const relatedRef = doc(db, relationConfig.collection, relatedId);
        const relatedDoc = await getDoc(relatedRef);
        
        if (!relatedDoc.exists()) {
          corrections.push({
            type: 'missing_entity',
            relation: relationName,
            relatedId
          });
          continue;
        }
        
        const relatedData = relatedDoc.data();
        const inverseValue = relatedData[relationConfig.inverseField];
        
        // Vérifier la présence de la relation inverse
        if (relationConfig.isArray) {
          if (!inverseValue || !inverseValue.includes(entityId)) {
            // Corriger en ajoutant la relation manquante
            await updateDoc(relatedRef, {
              [relationConfig.inverseField]: arrayUnion(entityId),
              updatedAt: serverTimestamp()
            });
            
            corrections.push({
              type: 'fixed_missing_inverse',
              relation: relationName,
              relatedId,
              field: relationConfig.inverseField
            });
          }
        } else {
          if (inverseValue !== entityId) {
            // Corriger en mettant à jour la relation
            await updateDoc(relatedRef, {
              [relationConfig.inverseField]: entityId,
              updatedAt: serverTimestamp()
            });
            
            corrections.push({
              type: 'fixed_incorrect_inverse',
              relation: relationName,
              relatedId,
              field: relationConfig.inverseField
            });
          }
        }
      }
    }
    
    return { success: true, corrections };
  } catch (error) {
    console.error('[BidirectionalRelations] Erreur lors de la vérification:', error);
    return { error: error.message, corrections };
  }
}

// Helpers

/**
 * Obtient le nom de la collection pour un type d'entité
 */
function getCollectionName(entityType) {
  // Gestion des cas spéciaux
  if (entityType === 'lieu') return 'lieux';
  if (entityType === 'contact') return 'contacts';
  
  // Cas général : ajouter 's' si pas déjà présent
  return entityType.endsWith('s') ? entityType : entityType + 's';
}

/**
 * Trouve la configuration de la relation inverse dans l'entité cible
 */
function findInverseRelation(targetConfig, inverseField) {
  if (!targetConfig || !targetConfig.relations) return null;
  
  for (const relation of Object.values(targetConfig.relations)) {
    if (relation.field === inverseField) {
      return relation;
    }
  }
  
  return null;
}

const bidirectionalRelationsService = {
  updateBidirectionalRelation,
  batchUpdateBidirectionalRelations,
  checkAndFixBidirectionalRelations
};

export default bidirectionalRelationsService;