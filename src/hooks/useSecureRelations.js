/**
 * Hook pour gérer les relations bidirectionnelles de manière sécurisée
 * en garantissant que les relations ne peuvent exister qu'entre entités
 * de la même organisation
 */

import { useState, useCallback } from 'react';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from '@/services/firebase-service';
import { db } from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';
import { useDataValidation } from '@/services/dataValidationService';
import { toast } from '@/utils/toasts';

export const useSecureRelations = () => {
  const { currentOrganization } = useOrganization();
  const { canCreateRelation } = useDataValidation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Crée une relation bidirectionnelle entre deux entités
   * @param {Object} params - Paramètres de la relation
   * @param {string} params.sourceCollection - Collection source
   * @param {string} params.sourceId - ID de l'entité source
   * @param {string} params.targetCollection - Collection cible
   * @param {string} params.targetId - ID de l'entité cible
   * @param {string} params.relationField - Nom du champ de relation (optionnel)
   */
  const createRelation = useCallback(async ({
    sourceCollection,
    sourceId,
    targetCollection,
    targetId,
    relationField = null
  }) => {
    if (!currentOrganization?.id) {
      const err = 'Aucune organisation sélectionnée';
      setError(err);
      toast.error(err);
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Récupérer les deux entités
      console.log(`🔗 Création relation: ${sourceCollection}/${sourceId} <-> ${targetCollection}/${targetId}`);
      
      const sourceRef = doc(db, sourceCollection, sourceId);
      const targetRef = doc(db, targetCollection, targetId);
      
      const [sourceDoc, targetDoc] = await Promise.all([
        getDoc(sourceRef),
        getDoc(targetRef)
      ]);

      if (!sourceDoc.exists()) {
        throw new Error(`Document source introuvable: ${sourceCollection}/${sourceId}`);
      }
      
      if (!targetDoc.exists()) {
        throw new Error(`Document cible introuvable: ${targetCollection}/${targetId}`);
      }

      const sourceData = sourceDoc.data();
      const targetData = targetDoc.data();

      // 2. Vérifier l'appartenance à la même organisation
      const sameOrg = await canCreateRelation(sourceData, targetData);
      if (!sameOrg) {
        throw new Error('Les relations entre organisations différentes sont interdites');
      }

      // 3. Déterminer les noms des champs de relation
      const sourceFieldName = relationField || targetCollection;
      const targetFieldName = relationField || sourceCollection;

      // 4. Mettre à jour les deux documents en parallèle
      const updates = [];

      // Vérifier que la relation n'existe pas déjà
      const sourceRelations = sourceData[sourceFieldName] || [];
      const targetRelations = targetData[targetFieldName] || [];

      if (!sourceRelations.includes(targetId)) {
        updates.push(
          updateDoc(sourceRef, {
            [sourceFieldName]: arrayUnion(targetId),
            updatedAt: new Date().toISOString()
          })
        );
      }

      if (!targetRelations.includes(sourceId)) {
        updates.push(
          updateDoc(targetRef, {
            [targetFieldName]: arrayUnion(sourceId),
            updatedAt: new Date().toISOString()
          })
        );
      }

      if (updates.length === 0) {
        console.log('ℹ️ La relation existe déjà');
        toast.info('La relation existe déjà');
        return true;
      }

      await Promise.all(updates);

      console.log('✅ Relation créée avec succès');
      toast.success('Relation créée avec succès');
      return true;

    } catch (err) {
      console.error('❌ Erreur création relation:', err);
      setError(err.message);
      toast.error(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentOrganization, canCreateRelation]);

  /**
   * Supprime une relation bidirectionnelle entre deux entités
   */
  const removeRelation = useCallback(async ({
    sourceCollection,
    sourceId,
    targetCollection,
    targetId,
    relationField = null
  }) => {
    if (!currentOrganization?.id) {
      const err = 'Aucune organisation sélectionnée';
      setError(err);
      toast.error(err);
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`🔗 Suppression relation: ${sourceCollection}/${sourceId} <-> ${targetCollection}/${targetId}`);
      
      const sourceRef = doc(db, sourceCollection, sourceId);
      const targetRef = doc(db, targetCollection, targetId);

      // Déterminer les noms des champs de relation
      const sourceFieldName = relationField || targetCollection;
      const targetFieldName = relationField || sourceCollection;

      // Supprimer les relations des deux côtés
      await Promise.all([
        updateDoc(sourceRef, {
          [sourceFieldName]: arrayRemove(targetId),
          updatedAt: new Date().toISOString()
        }),
        updateDoc(targetRef, {
          [targetFieldName]: arrayRemove(sourceId),
          updatedAt: new Date().toISOString()
        })
      ]);

      console.log('✅ Relation supprimée avec succès');
      toast.success('Relation supprimée avec succès');
      return true;

    } catch (err) {
      console.error('❌ Erreur suppression relation:', err);
      setError(err.message);
      toast.error(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentOrganization]);

  /**
   * Vérifie si une relation existe entre deux entités
   */
  const checkRelationExists = useCallback(async ({
    sourceCollection,
    sourceId,
    targetCollection,
    targetId,
    relationField = null
  }) => {
    try {
      const sourceRef = doc(db, sourceCollection, sourceId);
      const sourceDoc = await getDoc(sourceRef);
      
      if (!sourceDoc.exists()) {
        return false;
      }

      const sourceData = sourceDoc.data();
      const fieldName = relationField || targetCollection;
      const relations = sourceData[fieldName] || [];
      
      return relations.includes(targetId);
    } catch (err) {
      console.error('❌ Erreur vérification relation:', err);
      return false;
    }
  }, []);

  /**
   * Synchronise les relations bidirectionnelles pour une entité
   * (utile après une migration ou en cas d'incohérence)
   */
  const syncRelations = useCallback(async (entityCollection, entityId) => {
    if (!currentOrganization?.id) {
      return false;
    }

    setLoading(true);
    
    try {
      console.log(`🔄 Synchronisation des relations pour ${entityCollection}/${entityId}`);
      
      const entityRef = doc(db, entityCollection, entityId);
      const entityDoc = await getDoc(entityRef);
      
      if (!entityDoc.exists()) {
        throw new Error('Entité introuvable');
      }

      const entityData = entityDoc.data();
      const relationTypes = ['contacts', 'lieux', 'artistes', 'structures', 'concerts'];
      let fixedRelations = 0;

      for (const relationType of relationTypes) {
        const relatedIds = entityData[relationType] || [];
        
        for (const relatedId of relatedIds) {
          try {
            const relatedRef = doc(db, relationType, relatedId);
            const relatedDoc = await getDoc(relatedRef);
            
            if (relatedDoc.exists()) {
              const relatedData = relatedDoc.data();
              
              // Vérifier la même organisation
              if (relatedData.organizationId !== entityData.organizationId) {
                console.warn(`⚠️ Relation cross-org détectée: ${relatedId}`);
                continue;
              }
              
              // Vérifier la relation inverse
              const inverseField = entityCollection;
              const inverseRelations = relatedData[inverseField] || [];
              
              if (!inverseRelations.includes(entityId)) {
                console.log(`🔧 Ajout relation inverse manquante: ${relationType}/${relatedId}`);
                await updateDoc(relatedRef, {
                  [inverseField]: arrayUnion(entityId),
                  updatedAt: new Date().toISOString()
                });
                fixedRelations++;
              }
            }
          } catch (err) {
            console.error(`Erreur sync relation ${relationType}/${relatedId}:`, err);
          }
        }
      }

      if (fixedRelations > 0) {
        toast.success(`${fixedRelations} relations synchronisées`);
      }
      
      return true;
      
    } catch (err) {
      console.error('❌ Erreur synchronisation:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentOrganization]);

  return {
    createRelation,
    removeRelation,
    checkRelationExists,
    syncRelations,
    loading,
    error
  };
};

export default useSecureRelations;