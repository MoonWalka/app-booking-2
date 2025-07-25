#!/usr/bin/env node

/**
 * Script pour corriger les structures sans entrepriseId
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialiser Firebase Admin
const serviceAccount = require('../tourcraft-384810-firebase-adminsdk-r0rsq-fde017c7f8.json');
initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function fixStructuresEntrepriseId() {
  console.log('\n🔧 Correction des structures sans entrepriseId\n');
  
  try {
    // Récupérer les structures sans entrepriseId
    const structuresSnapshot = await db.collection('structures')
      .where('entrepriseId', '==', null)
      .get();
    
    console.log(`Structures sans entrepriseId: ${structuresSnapshot.size}`);
    
    if (structuresSnapshot.empty) {
      console.log('✅ Toutes les structures ont un entrepriseId!');
      return;
    }
    
    // L'entrepriseId par défaut (trouvé dans d'autres structures)
    const defaultOrgId = 'tTvA6fzQpi6u3kx8wZO8';
    
    // Corriger chaque structure
    const batch = db.batch();
    let count = 0;
    
    structuresSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`\n📝 Correction de: ${data.nom || data.raisonSociale || doc.id}`);
      
      batch.update(doc.ref, {
        entrepriseId: defaultOrgId,
        updatedAt: new Date()
      });
      
      count++;
    });
    
    // Appliquer les corrections
    await batch.commit();
    console.log(`\n✅ ${count} structures corrigées avec entrepriseId: ${defaultOrgId}`);
    
    // Vérifier le résultat
    console.log('\n🔍 Vérification après correction:');
    const afterSnapshot = await db.collection('structures').get();
    
    let withOrgId = 0;
    let withoutOrgId = 0;
    
    afterSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.entrepriseId) {
        withOrgId++;
      } else {
        withoutOrgId++;
      }
    });
    
    console.log(`✅ Structures avec entrepriseId: ${withOrgId}`);
    console.log(`❌ Structures sans entrepriseId: ${withoutOrgId}`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Exécuter le script
fixStructuresEntrepriseId()
  .then(() => {
    console.log('\n✨ Script terminé');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });