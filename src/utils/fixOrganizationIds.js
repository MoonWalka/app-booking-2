import { collection, getDocs, doc, writeBatch } from 'firebase/firestore';
import { db } from '@/services/firebase-service';

/**
 * Utilitaire pour corriger automatiquement les organizationId manquants
 * À utiliser pour migrer les données existantes
 */

/**
 * Corrige tous les documents d'une collection qui n'ont pas d'organizationId
 * @param {string} collectionName - Nom de la collection
 * @param {string} organizationId - ID de l'organisation à attribuer
 * @returns {Promise<{success: number, errors: Array}>}
 */
export async function fixMissingOrganizationIds(collectionName, organizationId) {
  if (!organizationId) {
    throw new Error('organizationId est requis');
  }

  console.log(`🔧 Correction des organizationId manquants pour ${collectionName}...`);
  
  try {
    // Récupérer tous les documents de la collection
    const allDocsSnapshot = await getDocs(collection(db, collectionName));
    
    // Filtrer ceux qui n'ont pas d'organizationId
    const docsToFix = [];
    allDocsSnapshot.forEach(docSnapshot => {
      const data = docSnapshot.data();
      if (!data.organizationId) {
        docsToFix.push({ id: docSnapshot.id, data });
      }
    });

    console.log(`📊 Trouvé ${docsToFix.length} documents sans organizationId dans ${collectionName}`);

    if (docsToFix.length === 0) {
      return { success: 0, errors: [] };
    }

    // Utiliser batch writes pour de meilleures performances
    const maxBatchSize = 500; // Limite Firestore
    const batches = [];
    const errors = [];
    let successCount = 0;

    for (let i = 0; i < docsToFix.length; i += maxBatchSize) {
      const batch = writeBatch(db);
      const currentBatch = docsToFix.slice(i, i + maxBatchSize);

      currentBatch.forEach(({ id }) => {
        const docRef = doc(db, collectionName, id);
        batch.update(docRef, { 
          organizationId,
          updatedAt: new Date(),
          organizationIdAddedAt: new Date() // Pour traçabilité
        });
      });

      batches.push(batch);
    }

    // Exécuter tous les batches
    for (let i = 0; i < batches.length; i++) {
      try {
        await batches[i].commit();
        const currentBatchSize = Math.min(maxBatchSize, docsToFix.length - i * maxBatchSize);
        successCount += currentBatchSize;
        console.log(`✅ Batch ${i + 1}/${batches.length} completé (${currentBatchSize} documents)`);
      } catch (error) {
        console.error(`❌ Erreur batch ${i + 1}:`, error);
        errors.push(error);
      }
    }

    console.log(`🎯 ${collectionName}: ${successCount} documents corrigés avec succès`);
    return { success: successCount, errors };

  } catch (error) {
    console.error(`❌ Erreur lors de la correction de ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Corrige tous les contacts et lieux sans organizationId
 * @param {string} organizationId - ID de l'organisation à attribuer
 */
export async function fixAllMissingOrganizationIds(organizationId) {
  if (!organizationId) {
    throw new Error('organizationId est requis');
  }

  console.log(`🚀 Début de la correction automatique pour l'organisation: ${organizationId}`);
  
  const results = {
    contacts: { success: 0, errors: [] },
    lieux: { success: 0, errors: [] },
    structures: { success: 0, errors: [] },
    concerts: { success: 0, errors: [] }
  };

  const collections = ['contacts', 'lieux', 'structures', 'concerts'];

  for (const collectionName of collections) {
    try {
      const result = await fixMissingOrganizationIds(collectionName, organizationId);
      results[collectionName] = result;
    } catch (error) {
      console.error(`❌ Erreur pour ${collectionName}:`, error);
      results[collectionName].errors.push(error);
    }
  }

  // Afficher le résumé
  console.log('\n📊 RÉSUMÉ DE LA CORRECTION:');
  let totalSuccess = 0;
  let totalErrors = 0;

  Object.entries(results).forEach(([collection, result]) => {
    console.log(`${collection}: ${result.success} corrigés, ${result.errors.length} erreurs`);
    totalSuccess += result.success;
    totalErrors += result.errors.length;
  });

  console.log(`\n🎯 TOTAL: ${totalSuccess} documents corrigés, ${totalErrors} erreurs`);
  
  return results;
}

/**
 * Fonction helper pour lancer la correction depuis la console
 * Usage: await window.fixOrganizationIds('9LjkCJG04pEzbABdHkSf')
 */
export function installGlobalFixer() {
  if (typeof window !== 'undefined') {
    window.fixOrganizationIds = fixAllMissingOrganizationIds;
    console.log('🔧 Helper installé! Utilisation: await window.fixOrganizationIds("votre-organization-id")');
  }
} 