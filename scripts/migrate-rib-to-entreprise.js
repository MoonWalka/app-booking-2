/**
 * Script de migration des données RIB
 * Migre les données RIB depuis les paramètres de facturation vers les données d'entreprise
 */

const admin = require('firebase-admin');

// Initialisation Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = require('../firebase-admin-key.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function migrateRIBData() {
  console.log('🏦 Début de la migration des données RIB...');
  
  try {
    // Récupérer toutes les organisations
    const organizationsSnapshot = await db.collection('organizations').get();
    
    let migratedCount = 0;
    let totalCount = organizationsSnapshot.size;
    
    for (const orgDoc of organizationsSnapshot.docs) {
      const orgId = orgDoc.id;
      const orgData = orgDoc.data();
      
      console.log(`\n📂 Traitement de l'organisation: ${orgData.name || orgId}`);
      
      try {
        // Récupérer les paramètres de facturation
        const factureParamsRef = db.collection('organizations').doc(orgId)
          .collection('settings').doc('factureParameters');
        const factureParamsDoc = await factureParamsRef.get();
        
        if (!factureParamsDoc.exists) {
          console.log('  ⚠️  Pas de paramètres de facturation trouvés');
          continue;
        }
        
        const factureParams = factureParamsDoc.data();
        const parameters = factureParams.parameters || {};
        
        // Vérifier s'il y a des données RIB à migrer
        if (!parameters.iban && !parameters.bic && !parameters.nomBanque) {
          console.log('  ℹ️  Pas de données RIB à migrer');
          continue;
        }
        
        console.log('  🔍 Données RIB trouvées:');
        console.log(`     - IBAN: ${parameters.iban ? '✓' : '✗'}`);
        console.log(`     - BIC: ${parameters.bic ? '✓' : '✗'}`);
        console.log(`     - Banque: ${parameters.nomBanque ? '✓' : '✗'}`);
        
        // Récupérer les données d'entreprise existantes
        const entrepriseRef = db.collection('organizations').doc(orgId)
          .collection('settings').doc('entreprise');
        const entrepriseDoc = await entrepriseRef.get();
        
        let entrepriseData = {};
        if (entrepriseDoc.exists) {
          entrepriseData = entrepriseDoc.data();
        }
        
        // Ajouter les données RIB aux données d'entreprise
        const updatedData = {
          ...entrepriseData,
          iban: parameters.iban || entrepriseData.iban || '',
          bic: parameters.bic || entrepriseData.bic || '',
          banque: parameters.nomBanque || entrepriseData.banque || '',
          updatedAt: new Date().toISOString(),
          updatedBy: 'migration-script'
        };
        
        // Sauvegarder les données mises à jour
        await entrepriseRef.set(updatedData, { merge: true });
        
        console.log('  ✅ Données RIB migrées avec succès');
        migratedCount++;
        
      } catch (error) {
        console.error(`  ❌ Erreur lors de la migration pour ${orgId}:`, error.message);
      }
    }
    
    console.log('\n📊 Résumé de la migration:');
    console.log(`   - Organisations traitées: ${totalCount}`);
    console.log(`   - Migrations réussies: ${migratedCount}`);
    console.log(`   - Échecs: ${totalCount - migratedCount}`);
    
  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  }
}

// Exécuter la migration
migrateRIBData()
  .then(() => {
    console.log('\n✅ Migration terminée avec succès');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Erreur lors de la migration:', error);
    process.exit(1);
  });