#!/usr/bin/env node

/**
 * Script de migration sécurisé pour aplatir les structures de données imbriquées
 * et garantir la cohérence des entrepriseId
 * 
 * Usage: node scripts/migrate-nested-data-secure.js [--dry-run] [--organization=orgId]
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const SPECIFIC_ORG = process.argv.find(arg => arg.startsWith('--organization='))?.split('=')[1];
const BATCH_SIZE = 500; // Taille maximale d'un batch Firestore

// Initialisation Firebase Admin
const serviceAccountPath = path.join(__dirname, '../firebase-adminsdk-key.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Fichier de clé de service introuvable:', serviceAccountPath);
  console.log('Veuillez placer votre clé de service Firebase Admin dans le fichier:', serviceAccountPath);
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Statistiques de migration
const stats = {
  contacts: { scanned: 0, nested: 0, fixed: 0, errors: 0 },
  lieux: { scanned: 0, nested: 0, fixed: 0, errors: 0 },
  artistes: { scanned: 0, nested: 0, fixed: 0, errors: 0 },
  structures: { scanned: 0, nested: 0, fixed: 0, errors: 0 },
  missingOrgId: 0,
  crossOrgRelations: 0
};

/**
 * Aplatit une structure imbriquée
 */
function flattenNestedStructure(data, entityType, docId, entrepriseId) {
  let flattened = { ...data };
  let wasNested = false;
  
  // Détecter et corriger les structures imbriquées
  const nestedField = entityType.slice(0, -1); // contacts -> contact
  
  if (data[nestedField] && typeof data[nestedField] === 'object') {
    console.log(`  ⚠️  Structure imbriquée détectée: ${entityType}/${docId}`);
    wasNested = true;
    
    // Extraire les données imbriquées
    flattened = {
      ...data[nestedField],
      id: docId,
      entrepriseId: data.entrepriseId || entrepriseId,
      // Préserver les métadonnées
      createdAt: data.createdAt || data[nestedField].createdAt || admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    };
    
    // Préserver les relations
    if (entityType === 'contacts') {
      flattened.structures = data.structures || data[nestedField].structures || [];
      flattened.lieux = data.lieux || data[nestedField].lieux || [];
      flattened.concerts = data.concerts || data[nestedField].concerts || [];
    } else if (entityType === 'lieux') {
      flattened.contacts = data.contacts || data[nestedField].contacts || [];
      flattened.structures = data.structures || data[nestedField].structures || [];
      flattened.concerts = data.concerts || data[nestedField].concerts || [];
    }
    
    // Supprimer le champ imbriqué
    delete flattened[nestedField];
    
    // Supprimer les champs indésirables
    delete flattened.contact;
    delete flattened.lieu;
    delete flattened.artiste;
    delete flattened.structure;
  }
  
  return { flattened, wasNested };
}

/**
 * Vérifie et corrige les relations cross-organisation
 */
async function validateRelations(data, entityType, entrepriseId) {
  const relationFields = ['contacts', 'lieux', 'artistes', 'structures', 'concerts'];
  const cleanedData = { ...data };
  let hasInvalidRelations = false;
  
  for (const field of relationFields) {
    if (!Array.isArray(data[field]) || data[field].length === 0) continue;
    
    const validIds = [];
    
    for (const relatedId of data[field]) {
      try {
        // Vérifier que l'entité liée existe et appartient à la même organisation
        const relatedDoc = await db.collection(field).doc(relatedId).get();
        
        if (relatedDoc.exists) {
          const relatedData = relatedDoc.data();
          if (relatedData.entrepriseId === entrepriseId) {
            validIds.push(relatedId);
          } else {
            console.log(`    ❌ Relation cross-org détectée: ${entityType}/${data.id} -> ${field}/${relatedId}`);
            hasInvalidRelations = true;
            stats.crossOrgRelations++;
          }
        }
      } catch (error) {
        console.error(`    ⚠️  Erreur vérification relation ${field}/${relatedId}:`, error.message);
      }
    }
    
    cleanedData[field] = validIds;
  }
  
  return { cleanedData, hasInvalidRelations };
}

/**
 * Migre une collection
 */
async function migrateCollection(collectionName) {
  console.log(`\n📁 Migration de la collection: ${collectionName}`);
  
  let query = db.collection(collectionName);
  
  // Filtrer par organisation si spécifiée
  if (SPECIFIC_ORG) {
    query = query.where('entrepriseId', '==', SPECIFIC_ORG);
  }
  
  const snapshot = await query.get();
  console.log(`  📊 ${snapshot.size} documents à analyser`);
  
  const batch = db.batch();
  let batchCount = 0;
  let totalFixed = 0;
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const docId = doc.id;
    stats[collectionName].scanned++;
    
    let needsUpdate = false;
    let updatedData = { ...data };
    
    // 1. Vérifier et ajouter entrepriseId si manquant
    if (!data.entrepriseId) {
      console.log(`  ⚠️  entrepriseId manquant: ${collectionName}/${docId}`);
      stats.missingOrgId++;
      
      if (SPECIFIC_ORG) {
        updatedData.entrepriseId = SPECIFIC_ORG;
        needsUpdate = true;
      } else {
        console.log(`    ⏭️  Ignoré (pas d'organisation spécifiée)`);
        continue;
      }
    }
    
    // 2. Aplatir les structures imbriquées
    const { flattened, wasNested } = flattenNestedStructure(
      updatedData, 
      collectionName, 
      docId,
      updatedData.entrepriseId
    );
    
    if (wasNested) {
      updatedData = flattened;
      needsUpdate = true;
      stats[collectionName].nested++;
    }
    
    // 3. Valider et nettoyer les relations
    if (!DRY_RUN && updatedData.entrepriseId) {
      const { cleanedData, hasInvalidRelations } = await validateRelations(
        updatedData,
        collectionName,
        updatedData.entrepriseId
      );
      
      if (hasInvalidRelations) {
        updatedData = cleanedData;
        needsUpdate = true;
      }
    }
    
    // 4. Appliquer les mises à jour
    if (needsUpdate) {
      if (DRY_RUN) {
        console.log(`  🔍 [DRY RUN] Correction nécessaire pour ${collectionName}/${docId}`);
        console.log(`     Avant:`, JSON.stringify(data, null, 2).substring(0, 200) + '...');
        console.log(`     Après:`, JSON.stringify(updatedData, null, 2).substring(0, 200) + '...');
      } else {
        batch.update(doc.ref, updatedData);
        batchCount++;
        totalFixed++;
        
        // Exécuter le batch si on atteint la limite
        if (batchCount >= BATCH_SIZE) {
          await batch.commit();
          console.log(`  ✅ ${batchCount} documents corrigés`);
          batchCount = 0;
        }
      }
      
      stats[collectionName].fixed++;
    }
  }
  
  // Exécuter le batch final
  if (!DRY_RUN && batchCount > 0) {
    await batch.commit();
    console.log(`  ✅ ${batchCount} documents corrigés`);
  }
  
  console.log(`  📊 Résumé ${collectionName}:`);
  console.log(`     - Documents scannés: ${stats[collectionName].scanned}`);
  console.log(`     - Structures imbriquées: ${stats[collectionName].nested}`);
  console.log(`     - Documents corrigés: ${stats[collectionName].fixed}`);
}

/**
 * Fonction principale
 */
async function main() {
  console.log('🚀 Démarrage de la migration sécurisée des données');
  console.log(`   Mode: ${DRY_RUN ? 'DRY RUN (simulation)' : 'PRODUCTION'}`);
  if (SPECIFIC_ORG) {
    console.log(`   Organisation: ${SPECIFIC_ORG}`);
  }
  console.log('');
  
  const startTime = Date.now();
  
  try {
    // Migrer chaque collection
    const collections = ['contacts', 'lieux', 'artistes', 'structures'];
    
    for (const collection of collections) {
      await migrateCollection(collection);
    }
    
    // Afficher le résumé final
    console.log('\n📊 RÉSUMÉ FINAL');
    console.log('================');
    
    let totalScanned = 0;
    let totalNested = 0;
    let totalFixed = 0;
    
    for (const collection of collections) {
      totalScanned += stats[collection].scanned;
      totalNested += stats[collection].nested;
      totalFixed += stats[collection].fixed;
    }
    
    console.log(`Documents scannés: ${totalScanned}`);
    console.log(`Structures imbriquées trouvées: ${totalNested}`);
    console.log(`Documents corrigés: ${totalFixed}`);
    console.log(`EntrepriseId manquants: ${stats.missingOrgId}`);
    console.log(`Relations cross-organisation: ${stats.crossOrgRelations}`);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✅ Migration terminée en ${duration} secondes`);
    
    if (DRY_RUN) {
      console.log('\n⚠️  Ceci était une simulation (DRY RUN)');
      console.log('   Relancez sans --dry-run pour appliquer les corrections');
    }
    
  } catch (error) {
    console.error('\n❌ Erreur lors de la migration:', error);
    process.exit(1);
  }
}

// Lancer la migration
main().catch(console.error);