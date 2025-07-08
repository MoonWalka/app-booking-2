#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });

const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialiser Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function fixPersonneLibreStatus() {
  console.log('🔧 Correction du statut isPersonneLibre...\n');
  
  try {
    // Récupérer toutes les organisations
    const orgsSnapshot = await db.collection('organizations').get();
    console.log(`📊 ${orgsSnapshot.size} organisations trouvées\n`);
    
    let totalPersonnes = 0;
    let totalCorrected = 0;
    
    for (const orgDoc of orgsSnapshot.docs) {
      const orgId = orgDoc.id;
      const orgName = orgDoc.data().name;
      console.log(`\n🏢 Organisation: ${orgName} (${orgId})`);
      
      // Récupérer toutes les personnes de cette organisation
      const personnesSnapshot = await db.collection('personnes')
        .where('organizationId', '==', orgId)
        .get();
      
      console.log(`  👥 ${personnesSnapshot.size} personnes trouvées`);
      
      for (const personneDoc of personnesSnapshot.docs) {
        const personneId = personneDoc.id;
        const personneData = personneDoc.data();
        const currentStatus = personneData.isPersonneLibre;
        totalPersonnes++;
        
        // Vérifier les liaisons actives
        const liaisonsSnapshot = await db.collection('liaisons')
          .where('personneId', '==', personneId)
          .where('actif', '==', true)
          .where('organizationId', '==', orgId)
          .get();
        
        const hasActiveLiaisons = !liaisonsSnapshot.empty;
        const shouldBeLibre = !hasActiveLiaisons;
        
        // Si le statut est incorrect, le corriger
        if (currentStatus !== shouldBeLibre) {
          console.log(`  ⚠️  ${personneData.prenom} ${personneData.nom}:`);
          console.log(`      - Statut actuel: ${currentStatus ? 'libre' : 'non libre'}`);
          console.log(`      - Liaisons actives: ${liaisonsSnapshot.size}`);
          console.log(`      - Devrait être: ${shouldBeLibre ? 'libre' : 'non libre'}`);
          
          // Corriger le statut
          await db.collection('personnes').doc(personneId).update({
            isPersonneLibre: shouldBeLibre,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
          console.log(`      ✅ Corrigé!`);
          totalCorrected++;
        }
      }
    }
    
    console.log('\n📊 Résumé:');
    console.log(`  - Total personnes vérifiées: ${totalPersonnes}`);
    console.log(`  - Total corrections: ${totalCorrected}`);
    console.log('\n✅ Correction terminée!');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
  
  process.exit(0);
}

// Exécuter la correction
fixPersonneLibreStatus();