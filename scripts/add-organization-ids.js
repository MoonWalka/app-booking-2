/**
 * Script pour ajouter les organizationId manquants aux documents
 */

const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialiser Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function addOrganizationIds(targetOrgId) {
  if (!targetOrgId) {
    console.error('❌ Veuillez fournir un organizationId');
    console.log('Usage: node scripts/add-organization-ids.js <organizationId>');
    process.exit(1);
  }

  const collections = ['concerts', 'contacts', 'lieux', 'structures', 'artistes'];
  const results = {};

  console.log(`\n🎯 Ajout de l'organizationId: ${targetOrgId}`);

  for (const collectionName of collections) {
    console.log(`\n📝 Traitement de la collection: ${collectionName}`);
    
    try {
      // Récupérer tous les documents sans organizationId
      const snapshot = await db.collection(collectionName)
        .where('organizationId', '==', null)
        .get();

      console.log(`📊 ${snapshot.size} documents à mettre à jour`);

      if (snapshot.size === 0) {
        results[collectionName] = { updated: 0, error: 0 };
        continue;
      }

      // Batch update pour performance
      const batchSize = 500;
      let updated = 0;
      let errors = 0;

      for (let i = 0; i < snapshot.docs.length; i += batchSize) {
        const batch = db.batch();
        const batchDocs = snapshot.docs.slice(i, i + batchSize);

        batchDocs.forEach(doc => {
          batch.update(doc.ref, {
            organizationId: targetOrgId,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
        });

        try {
          await batch.commit();
          updated += batchDocs.length;
          console.log(`✅ Batch ${Math.floor(i/batchSize) + 1}: ${batchDocs.length} documents mis à jour`);
        } catch (error) {
          console.error(`❌ Erreur batch ${Math.floor(i/batchSize) + 1}:`, error.message);
          errors += batchDocs.length;
        }
      }

      results[collectionName] = { updated, errors };
    } catch (error) {
      console.error(`❌ Erreur pour ${collectionName}:`, error.message);
      results[collectionName] = { updated: 0, errors: -1 };
    }
  }

  console.log('\n📊 Résumé des mises à jour:');
  console.table(results);
}

// Récupérer l'organizationId depuis les arguments
const targetOrgId = process.argv[2];

addOrganizationIds(targetOrgId).then(() => {
  console.log('\n✅ Mise à jour terminée');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});