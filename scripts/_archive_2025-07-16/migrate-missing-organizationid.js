/**
 * Script de migration pour ajouter entrepriseId aux documents existants
 * 
 * Ce script permet de migrer les documents créés avant l'implémentation
 * du système multi-organisation en leur ajoutant un entrepriseId.
 * 
 * Usage:
 * node scripts/migrate-missing-organizationid.js [entrepriseId]
 * 
 * Si aucun entrepriseId n'est fourni, le script listera les documents
 * sans entrepriseId et demandera confirmation.
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialiser Firebase Admin
const serviceAccount = require(path.join(__dirname, '../../app-booking-26571-firebase-adminsdk.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://app-booking-26571.firebaseio.com'
});

const db = admin.firestore();

// Collections à migrer
const COLLECTIONS_TO_MIGRATE = [
  'contacts',
  'artistes',
  'lieux',
  'concerts',
  'structures',
  'contrats',
  'formulaires',
  'relances'
];

// Fonction pour compter les documents sans entrepriseId
async function countDocumentsWithoutOrgId() {
  console.log('🔍 Analyse des documents sans entrepriseId...\n');
  
  const results = {};
  let totalMissing = 0;
  
  for (const collectionName of COLLECTIONS_TO_MIGRATE) {
    try {
      const snapshot = await db.collection(collectionName).get();
      let missingCount = 0;
      
      snapshot.forEach(doc => {
        const data = doc.data();
        if (!data.entrepriseId) {
          missingCount++;
        }
      });
      
      results[collectionName] = {
        total: snapshot.size,
        missing: missingCount
      };
      
      totalMissing += missingCount;
      
      if (missingCount > 0) {
        console.log(`❌ ${collectionName}: ${missingCount}/${snapshot.size} documents sans entrepriseId`);
      } else {
        console.log(`✅ ${collectionName}: Tous les documents ont un entrepriseId`);
      }
    } catch (error) {
      console.error(`❌ Erreur lors de l'analyse de ${collectionName}:`, error.message);
    }
  }
  
  console.log(`\n📊 Total: ${totalMissing} documents sans entrepriseId`);
  return { results, totalMissing };
}

// Fonction pour lister les organisations disponibles
async function listOrganizations() {
  console.log('\n🏢 Organisations disponibles:\n');
  
  try {
    const snapshot = await db.collection('organizations').get();
    const orgs = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      orgs.push({
        id: doc.id,
        name: data.name,
        createdAt: data.createdAt
      });
      console.log(`- ${data.name} (ID: ${doc.id})`);
    });
    
    return orgs;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des organisations:', error.message);
    return [];
  }
}

// Fonction pour migrer les documents
async function migrateDocuments(entrepriseId, dryRun = true) {
  const mode = dryRun ? '🧪 MODE TEST' : '🚀 MODE PRODUCTION';
  console.log(`\n${mode} - Migration vers l'organisation: ${entrepriseId}\n`);
  
  let totalMigrated = 0;
  
  for (const collectionName of COLLECTIONS_TO_MIGRATE) {
    try {
      const snapshot = await db.collection(collectionName).get();
      let migratedCount = 0;
      const batch = db.batch();
      let batchCount = 0;
      
      for (const doc of snapshot.docs) {
        const data = doc.data();
        if (!data.entrepriseId) {
          if (!dryRun) {
            batch.update(doc.ref, {
              entrepriseId: entrepriseId,
              migratedAt: admin.firestore.FieldValue.serverTimestamp(),
              migratedFrom: 'legacy'
            });
            batchCount++;
            
            // Firebase limite les batches à 500 opérations
            if (batchCount >= 500) {
              await batch.commit();
              batchCount = 0;
            }
          }
          
          migratedCount++;
          console.log(`  - ${collectionName}/${doc.id}: ${data.nom || data.titre || data.name || 'Sans nom'}`);
        }
      }
      
      // Commit du dernier batch
      if (!dryRun && batchCount > 0) {
        await batch.commit();
      }
      
      if (migratedCount > 0) {
        console.log(`✅ ${collectionName}: ${migratedCount} documents ${dryRun ? 'à migrer' : 'migrés'}`);
      }
      
      totalMigrated += migratedCount;
    } catch (error) {
      console.error(`❌ Erreur lors de la migration de ${collectionName}:`, error.message);
    }
  }
  
  console.log(`\n📊 Total: ${totalMigrated} documents ${dryRun ? 'à migrer' : 'migrés'}`);
  return totalMigrated;
}

// Fonction principale
async function main() {
  console.log('🔧 Script de Migration - Ajout d\'entrepriseId\n');
  
  const args = process.argv.slice(2);
  const entrepriseId = args[0];
  
  // 1. Analyser l'état actuel
  const { totalMissing } = await countDocumentsWithoutOrgId();
  
  if (totalMissing === 0) {
    console.log('\n✅ Aucune migration nécessaire - tous les documents ont un entrepriseId');
    process.exit(0);
  }
  
  // 2. Si pas d'entrepriseId fourni, lister les options
  if (!entrepriseId) {
    const orgs = await listOrganizations();
    
    console.log('\n📌 Usage:');
    console.log('  node scripts/migrate-missing-organizationid.js <entrepriseId>');
    console.log('\nExemple:');
    if (orgs.length > 0) {
      console.log(`  node scripts/migrate-missing-organizationid.js ${orgs[0].id}`);
    }
    process.exit(0);
  }
  
  // 3. Vérifier que l'organisation existe
  try {
    const orgDoc = await db.collection('organizations').doc(entrepriseId).get();
    if (!orgDoc.exists) {
      console.error(`\n❌ L'organisation ${entrepriseId} n'existe pas`);
      process.exit(1);
    }
    console.log(`\n✅ Organisation trouvée: ${orgDoc.data().name}`);
  } catch (error) {
    console.error(`\n❌ Erreur lors de la vérification de l'organisation:`, error.message);
    process.exit(1);
  }
  
  // 4. Faire un dry run d'abord
  console.log('\n--- APERÇU DE LA MIGRATION ---');
  await migrateDocuments(entrepriseId, true);
  
  // 5. Demander confirmation
  console.log('\n⚠️  ATTENTION: Cette opération va modifier les documents en production.');
  console.log('Voulez-vous continuer? (yes/no)');
  
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  
  process.stdin.on('data', async (text) => {
    const answer = text.trim().toLowerCase();
    
    if (answer === 'yes' || answer === 'y') {
      console.log('\n🚀 Démarrage de la migration...');
      await migrateDocuments(entrepriseId, false);
      console.log('\n✅ Migration terminée!');
      process.exit(0);
    } else {
      console.log('\n❌ Migration annulée');
      process.exit(0);
    }
  });
}

// Gestion des erreurs
process.on('unhandledRejection', (error) => {
  console.error('\n❌ Erreur non gérée:', error);
  process.exit(1);
});

// Lancer le script
main().catch(error => {
  console.error('\n❌ Erreur fatale:', error);
  process.exit(1);
});