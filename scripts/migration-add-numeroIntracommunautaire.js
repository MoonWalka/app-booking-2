/**
 * Script de migration pour ajouter le champ numeroIntracommunautaire
 * aux soumissions existantes qui l'ont dans rawData mais pas dans structureData
 */

const admin = require('firebase-admin');

// Initialiser Firebase Admin
const serviceAccount = require('../path-to-your-service-account.json'); // Remplacez par le chemin de votre fichier de clé

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function migrateNumeroIntracommunautaire() {
  console.log('Début de la migration du champ numeroIntracommunautaire...');
  
  try {
    // Récupérer toutes les soumissions de formulaire
    const submissionsSnapshot = await db.collection('formSubmissions').get();
    
    let updatedCount = 0;
    let processedCount = 0;
    
    for (const doc of submissionsSnapshot.docs) {
      processedCount++;
      const data = doc.data();
      
      // Vérifier si rawData contient structureNumeroIntracommunautaire
      // mais que structureData ne contient pas numeroIntracommunautaire
      if (data.rawData?.structureNumeroIntracommunautaire && 
          data.structureData && 
          !data.structureData.numeroIntracommunautaire) {
        
        console.log(`Mise à jour de la soumission ${doc.id}...`);
        
        // Mettre à jour structureData
        await doc.ref.update({
          'structureData.numeroIntracommunautaire': data.rawData.structureNumeroIntracommunautaire
        });
        
        updatedCount++;
        console.log(`✓ Soumission ${doc.id} mise à jour avec succès`);
      }
    }
    
    console.log(`\nMigration terminée !`);
    console.log(`Soumissions traitées : ${processedCount}`);
    console.log(`Soumissions mises à jour : ${updatedCount}`);
    
  } catch (error) {
    console.error('Erreur lors de la migration:', error);
  } finally {
    // Terminer le processus
    process.exit();
  }
}

// Lancer la migration
migrateNumeroIntracommunautaire(); 