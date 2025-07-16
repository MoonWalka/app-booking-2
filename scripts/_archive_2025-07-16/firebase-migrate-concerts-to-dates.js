#!/usr/bin/env node

/**
 * Script de migration Firebase : concerts → dates
 * 
 * Ce script migre la collection "concerts" vers "dates" dans Firebase
 * et met à jour toutes les références dans les autres collections
 * 
 * IMPORTANT: Faire un backup complet avant d'exécuter ce script !
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Charger la configuration Firebase
const serviceAccountPath = path.join(__dirname, '../../../config/serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Fichier serviceAccountKey.json non trouvé !');
  console.error('Veuillez configurer Firebase Admin SDK d\'abord.');
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

// Initialiser Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const BATCH_SIZE = 500;

console.log(`🚀 Migration Firebase: concerts → dates`);
console.log(`📋 Mode: ${DRY_RUN ? 'DRY RUN (aucune modification)' : 'PRODUCTION'}`);
console.log('');

/**
 * Étape 1: Copier tous les documents de concerts vers dates
 */
async function migrateConcertsCollection() {
  console.log('📂 Étape 1: Migration de la collection concerts → dates');
  
  const concertsRef = db.collection('concerts');
  const datesRef = db.collection('dates');
  
  const snapshot = await concertsRef.get();
  console.log(`  Nombre de documents à migrer: ${snapshot.size}`);
  
  if (snapshot.empty) {
    console.log('  ✅ Aucun document à migrer');
    return;
  }
  
  let migrated = 0;
  const batch = db.batch();
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    
    if (!DRY_RUN) {
      batch.set(datesRef.doc(doc.id), {
        ...data,
        _migratedFrom: 'concerts',
        _migrationDate: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    
    migrated++;
    
    // Commit par batch
    if (migrated % BATCH_SIZE === 0) {
      if (!DRY_RUN) {
        await batch.commit();
        console.log(`  ✓ ${migrated} documents migrés...`);
      }
    }
  }
  
  // Commit final
  if (!DRY_RUN && migrated % BATCH_SIZE !== 0) {
    await batch.commit();
  }
  
  console.log(`  ✅ ${migrated} documents ${DRY_RUN ? 'à migrer' : 'migrés avec succès'}`);
}

/**
 * Étape 2: Mettre à jour les références dans les autres collections
 */
async function updateReferences() {
  console.log('\n📝 Étape 2: Mise à jour des références dans les autres collections');
  
  // Collections à mettre à jour avec leurs champs
  const collectionsToUpdate = [
    {
      name: 'artistes',
      fields: ['concertsIds', 'concertsAssocies'],
      newFields: ['datesIds', 'datesAssociees']
    },
    {
      name: 'lieux',
      fields: ['concertsIds', 'concertsAssocies'],
      newFields: ['datesIds', 'datesAssociees']
    },
    {
      name: 'structures',
      fields: ['concertsIds'],
      newFields: ['datesIds']
    },
    {
      name: 'contacts',
      fields: ['concertsIds'],
      newFields: ['datesIds']
    }
  ];
  
  for (const collection of collectionsToUpdate) {
    console.log(`\n  📁 Collection: ${collection.name}`);
    
    const snapshot = await db.collection(collection.name).get();
    let updated = 0;
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      let needsUpdate = false;
      const updates = {};
      
      // Vérifier chaque champ
      collection.fields.forEach((field, index) => {
        if (data[field] !== undefined) {
          needsUpdate = true;
          updates[collection.newFields[index]] = data[field];
          updates[field] = admin.firestore.FieldValue.delete();
        }
      });
      
      if (needsUpdate) {
        if (!DRY_RUN) {
          await db.collection(collection.name).doc(doc.id).update(updates);
        }
        updated++;
      }
    }
    
    console.log(`    ✓ ${updated} documents ${DRY_RUN ? 'à mettre à jour' : 'mis à jour'}`);
  }
}

/**
 * Étape 3: Mettre à jour les règles de sécurité Firebase
 */
function generateSecurityRules() {
  console.log('\n🔐 Étape 3: Nouvelles règles de sécurité suggérées');
  
  const rules = `
  // Remplacer dans firestore.rules :
  
  // Ancienne règle :
  match /concerts/{concertId} {
    allow read: if request.auth != null;
    allow write: if request.auth != null && hasOrganizationAccess();
  }
  
  // Nouvelle règle :
  match /dates/{dateId} {
    allow read: if request.auth != null;
    allow write: if request.auth != null && hasOrganizationAccess();
  }
  `;
  
  console.log(rules);
  
  if (!DRY_RUN) {
    fs.writeFileSync('firestore-rules-update.txt', rules);
    console.log('\n  ✅ Règles sauvegardées dans firestore-rules-update.txt');
  }
}

/**
 * Étape 4: Vérification post-migration
 */
async function verifyMigration() {
  console.log('\n🔍 Étape 4: Vérification de la migration');
  
  const concertsCount = (await db.collection('concerts').get()).size;
  const datesCount = (await db.collection('dates').get()).size;
  
  console.log(`  Documents dans 'concerts': ${concertsCount}`);
  console.log(`  Documents dans 'dates': ${datesCount}`);
  
  if (concertsCount === datesCount && concertsCount > 0) {
    console.log('  ✅ Migration vérifiée avec succès');
  } else if (concertsCount === 0 && datesCount > 0) {
    console.log('  ✅ Migration déjà effectuée');
  } else {
    console.log('  ⚠️  Vérification requise - les nombres ne correspondent pas');
  }
}

/**
 * Point d'entrée principal
 */
async function main() {
  try {
    console.log('⏰ Début:', new Date().toISOString());
    
    // Étape 1: Migrer la collection
    await migrateConcertsCollection();
    
    // Étape 2: Mettre à jour les références
    await updateReferences();
    
    // Étape 3: Générer les règles de sécurité
    generateSecurityRules();
    
    // Étape 4: Vérifier la migration
    await verifyMigration();
    
    console.log('\n✅ Migration terminée avec succès !');
    console.log('⏰ Fin:', new Date().toISOString());
    
    if (DRY_RUN) {
      console.log('\n⚠️  Ceci était un DRY RUN - aucune modification n\'a été effectuée');
      console.log('Pour exécuter réellement la migration, lancez sans --dry-run');
    } else {
      console.log('\n⚠️  IMPORTANT: ');
      console.log('1. Mettre à jour les règles de sécurité Firebase');
      console.log('2. Tester l\'application complètement');
      console.log('3. Supprimer l\'ancienne collection "concerts" une fois validé');
    }
    
  } catch (error) {
    console.error('\n❌ Erreur lors de la migration:', error);
    process.exit(1);
  }
}

// Exécuter le script
if (require.main === module) {
  main().then(() => process.exit(0));
}

module.exports = { migrateConcertsCollection, updateReferences };