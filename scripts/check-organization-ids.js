/**
 * Script pour vérifier et ajouter les entrepriseId manquants
 */

const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialiser Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkEntrepriseIds() {
  const collections = ['concerts', 'contacts', 'lieux', 'structures', 'artistes'];
  const results = {};

  for (const collectionName of collections) {
    console.log(`\n🔍 Vérification de la collection: ${collectionName}`);
    
    try {
      const snapshot = await db.collection(collectionName).limit(10).get();
      
      let withOrgId = 0;
      let withoutOrgId = 0;
      const examples = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.entrepriseId) {
          withOrgId++;
        } else {
          withoutOrgId++;
          if (examples.length < 3) {
            examples.push({
              id: doc.id,
              nom: data.nom || data.titre || data.raisonSociale || 'Sans nom',
              hasOrgId: false
            });
          }
        }
      });

      results[collectionName] = {
        total: snapshot.size,
        withOrgId,
        withoutOrgId,
        examples
      };

      console.log(`✅ ${collectionName}: ${withOrgId}/${snapshot.size} ont un entrepriseId`);
      if (withoutOrgId > 0) {
        console.log(`⚠️  ${withoutOrgId} documents sans entrepriseId`);
        console.log('Exemples:', examples);
      }
    } catch (error) {
      console.error(`❌ Erreur pour ${collectionName}:`, error.message);
    }
  }

  console.log('\n📊 Résumé:');
  console.table(results);

  // Proposer de corriger
  console.log('\n💡 Pour ajouter l\'entrepriseId manquant, exécutez:');
  console.log('node scripts/add-entreprise-ids.js <entrepriseId>');
}

checkEntrepriseIds().then(() => {
  console.log('\n✅ Vérification terminée');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});