#!/usr/bin/env node

/**
 * Script pour vérifier quelles entités n'ont pas d'entrepriseId
 */

const admin = require('firebase-admin');
const path = require('path');

// Configuration Firebase Admin
const serviceAccountPath = path.join(__dirname, '..', 'tourcraft-bb3eb-firebase-adminsdk-hln6f-6f68d6b85f.json');

try {
  const serviceAccount = require(serviceAccountPath);
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://tourcraft-bb3eb.firebaseio.com"
  });
} catch (error) {
  console.error('❌ Erreur lors du chargement du fichier de service account:', error.message);
  console.log('Assurez-vous que le fichier tourcraft-bb3eb-firebase-adminsdk-hln6f-6f68d6b85f.json existe dans le répertoire racine');
  process.exit(1);
}

const db = admin.firestore();

async function checkEntrepriseIds() {
  console.log('🔍 Vérification des documents sans entrepriseId...\n');
  
  const collections = ['contacts', 'lieux', 'concerts', 'structures', 'artistes', 'contrats'];
  const results = {};
  
  for (const collectionName of collections) {
    console.log(`\n📁 Collection: ${collectionName}`);
    
    try {
      // Récupérer tous les documents
      const snapshot = await db.collection(collectionName).get();
      const totalDocs = snapshot.size;
      
      // Compter ceux sans entrepriseId
      let withOrgId = 0;
      let withoutOrgId = 0;
      const samplesWithout = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.entrepriseId) {
          withOrgId++;
        } else {
          withoutOrgId++;
          // Garder quelques échantillons
          if (samplesWithout.length < 5) {
            samplesWithout.push({
              id: doc.id,
              nom: data.nom || data.titre || data.raisonSociale || 'Sans nom',
              createdAt: data.createdAt?.toDate?.() || 'Date inconnue'
            });
          }
        }
      });
      
      results[collectionName] = {
        total: totalDocs,
        withOrgId,
        withoutOrgId,
        percentage: totalDocs > 0 ? ((withOrgId / totalDocs) * 100).toFixed(1) : 0,
        samplesWithout
      };
      
      console.log(`  ✅ Avec entrepriseId: ${withOrgId} (${results[collectionName].percentage}%)`);
      console.log(`  ❌ Sans entrepriseId: ${withoutOrgId}`);
      
      if (samplesWithout.length > 0) {
        console.log(`  📋 Exemples sans entrepriseId:`);
        samplesWithout.forEach(sample => {
          console.log(`     - ${sample.id}: ${sample.nom} (créé: ${sample.createdAt})`);
        });
      }
      
    } catch (error) {
      console.error(`  ❌ Erreur: ${error.message}`);
      results[collectionName] = { error: error.message };
    }
  }
  
  // Résumé
  console.log('\n\n📊 RÉSUMÉ:');
  console.log('='.repeat(60));
  
  for (const [collection, stats] of Object.entries(results)) {
    if (stats.error) {
      console.log(`${collection}: ERREUR - ${stats.error}`);
    } else {
      const status = stats.withoutOrgId === 0 ? '✅' : '⚠️';
      console.log(`${status} ${collection}: ${stats.withoutOrgId}/${stats.total} sans entrepriseId (${(100 - parseFloat(stats.percentage)).toFixed(1)}%)`);
    }
  }
  
  // Recommandations
  const problemCollections = Object.entries(results)
    .filter(([_, stats]) => !stats.error && stats.withoutOrgId > 0)
    .map(([name, _]) => name);
  
  if (problemCollections.length > 0) {
    console.log('\n\n⚠️  ACTIONS RECOMMANDÉES:');
    console.log('='.repeat(60));
    console.log(`Les collections suivantes ont des documents sans entrepriseId:`);
    console.log(`- ${problemCollections.join('\n- ')}`);
    console.log('\nPour corriger, exécutez:');
    console.log(`node scripts/add-entreprise-ids.js`);
  } else {
    console.log('\n\n✅ Toutes les collections ont des entrepriseId!');
  }
}

// Exécution
checkEntrepriseIds()
  .then(() => {
    console.log('\n✅ Vérification terminée');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Erreur:', error);
    process.exit(1);
  });