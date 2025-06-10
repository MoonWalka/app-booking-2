#!/usr/bin/env node

/**
 * Script de migration globale des données RIB
 * Migre les données RIB de toutes les organisations depuis les paramètres de facturation vers les données d'entreprise
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialiser Firebase Admin avec les credentials
const serviceAccountPath = path.join(__dirname, '..', 'tourcraft-app-firebase-adminsdk.json');

try {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://tourcraft-app.firebaseio.com'
  });
} catch (error) {
  console.error('❌ Erreur lors de l\'initialisation Firebase Admin');
  console.error('   Assurez-vous que le fichier tourcraft-app-firebase-adminsdk.json est présent à la racine du projet');
  process.exit(1);
}

const db = admin.firestore();

async function migrateAllRIBData() {
  console.log('🚀 Démarrage de la migration globale des données RIB...\n');
  
  try {
    // Récupérer toutes les organisations
    const organizationsSnapshot = await db.collection('organizations').get();
    
    if (organizationsSnapshot.empty) {
      console.log('ℹ️  Aucune organisation trouvée');
      return;
    }
    
    console.log(`📊 ${organizationsSnapshot.size} organisations trouvées\n`);
    
    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    // Traiter chaque organisation
    for (const orgDoc of organizationsSnapshot.docs) {
      const orgId = orgDoc.id;
      const orgData = orgDoc.data();
      console.log(`\n🏢 Traitement de l'organisation: ${orgData.name || orgId}`);
      
      try {
        // Vérifier si la migration a déjà été effectuée
        const migrationDoc = await db
          .collection('organizations')
          .doc(orgId)
          .collection('migrations')
          .doc('ribMigration')
          .get();
          
        if (migrationDoc.exists() && migrationDoc.data().completed === true) {
          console.log('   ✓ Migration déjà effectuée');
          skippedCount++;
          continue;
        }
        
        // Récupérer les paramètres de facturation
        const factureParamsDoc = await db
          .collection('organizations')
          .doc(orgId)
          .collection('settings')
          .doc('factureParameters')
          .get();
          
        if (!factureParamsDoc.exists()) {
          console.log('   ⚠️  Pas de paramètres de facturation');
          skippedCount++;
          continue;
        }
        
        const factureParams = factureParamsDoc.data();
        const parameters = factureParams.parameters || {};
        
        // Vérifier s'il y a des données RIB à migrer
        if (!parameters.iban && !parameters.bic && !parameters.nomBanque) {
          console.log('   ⚠️  Pas de données RIB à migrer');
          skippedCount++;
          continue;
        }
        
        console.log('   🔍 Données RIB trouvées:');
        console.log(`      - IBAN: ${parameters.iban ? '✓' : '✗'}`);
        console.log(`      - BIC: ${parameters.bic ? '✓' : '✗'}`);
        console.log(`      - Banque: ${parameters.nomBanque ? '✓' : '✗'}`);
        
        // Récupérer les données d'entreprise existantes
        const entrepriseDoc = await db
          .collection('organizations')
          .doc(orgId)
          .collection('settings')
          .doc('entreprise')
          .get();
          
        let entrepriseData = {};
        if (entrepriseDoc.exists()) {
          entrepriseData = entrepriseDoc.data();
        }
        
        // Ne migrer que si les données n'existent pas déjà dans entreprise
        const needsUpdate = 
          (!entrepriseData.iban && parameters.iban) ||
          (!entrepriseData.bic && parameters.bic) ||
          (!entrepriseData.banque && parameters.nomBanque);
          
        if (!needsUpdate) {
          console.log('   ℹ️  Les données RIB existent déjà dans entreprise');
          skippedCount++;
          continue;
        }
        
        // Migrer les données
        const updatedData = {
          ...entrepriseData,
          iban: entrepriseData.iban || parameters.iban || '',
          bic: entrepriseData.bic || parameters.bic || '',
          banque: entrepriseData.banque || parameters.nomBanque || '',
          updatedAt: new Date().toISOString(),
          updatedBy: 'migration-script'
        };
        
        // Sauvegarder les données mises à jour
        await db
          .collection('organizations')
          .doc(orgId)
          .collection('settings')
          .doc('entreprise')
          .set(updatedData, { merge: true });
          
        // Marquer la migration comme complétée
        await db
          .collection('organizations')
          .doc(orgId)
          .collection('migrations')
          .doc('ribMigration')
          .set({
            completed: true,
            completedAt: new Date().toISOString(),
            version: '1.0'
          });
          
        console.log('   ✅ Migration effectuée avec succès');
        migratedCount++;
        
      } catch (error) {
        console.error(`   ❌ Erreur lors du traitement: ${error.message}`);
        errorCount++;
      }
    }
    
    // Résumé
    console.log('\n' + '='.repeat(60));
    console.log('📊 RÉSUMÉ DE LA MIGRATION');
    console.log('='.repeat(60));
    console.log(`✅ Organisations migrées : ${migratedCount}`);
    console.log(`⏭️  Organisations ignorées : ${skippedCount}`);
    console.log(`❌ Erreurs rencontrées : ${errorCount}`);
    console.log(`📊 Total traité : ${organizationsSnapshot.size}`);
    console.log('='.repeat(60) + '\n');
    
  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  }
}

// Mode dry-run pour tester
async function dryRun() {
  console.log('🧪 MODE TEST - Aucune modification ne sera effectuée\n');
  
  try {
    const organizationsSnapshot = await db.collection('organizations').get();
    console.log(`📊 ${organizationsSnapshot.size} organisations trouvées\n`);
    
    let toMigrateCount = 0;
    
    for (const orgDoc of organizationsSnapshot.docs) {
      const orgId = orgDoc.id;
      const orgData = orgDoc.data();
      
      // Vérifier si la migration est nécessaire
      const factureParamsDoc = await db
        .collection('organizations')
        .doc(orgId)
        .collection('settings')
        .doc('factureParameters')
        .get();
        
      if (factureParamsDoc.exists()) {
        const parameters = factureParamsDoc.data().parameters || {};
        if (parameters.iban || parameters.bic || parameters.nomBanque) {
          console.log(`🏢 ${orgData.name || orgId} - Données RIB à migrer`);
          toMigrateCount++;
        }
      }
    }
    
    console.log(`\n📊 ${toMigrateCount} organisations nécessitent une migration`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Gestion des arguments de ligne de commande
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run') || args.includes('-d');

if (isDryRun) {
  dryRun().then(() => process.exit(0));
} else {
  console.log('⚠️  ATTENTION: Cette opération va modifier les données en production.');
  console.log('   Pour tester d\'abord, utilisez: npm run migrate:rib -- --dry-run\n');
  
  // Donner 5 secondes pour annuler
  console.log('La migration va démarrer dans 5 secondes... (Ctrl+C pour annuler)');
  setTimeout(() => {
    migrateAllRIBData().then(() => process.exit(0));
  }, 5000);
}