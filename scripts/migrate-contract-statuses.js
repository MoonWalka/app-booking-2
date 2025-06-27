#!/usr/bin/env node

/**
 * Script de migration pour nettoyer les statuts de contrats
 * 
 * Ce script :
 * 1. Supprime les champs legacy de la collection concerts
 * 2. Supprime contratStatut de la collection contrats
 * 3. Synchronise les statuts entre les collections
 * 
 * Usage: node scripts/migrate-contract-statuses.js
 */

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteField,
  writeBatch 
} = require('firebase/firestore');

// Configuration Firebase - À adapter selon votre environnement
const firebaseConfig = {
  // Copiez votre configuration Firebase ici
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Fonction pour migrer les statuts
async function migrateContractStatuses() {
  console.log('🚀 Début de la migration des statuts de contrats...\n');
  
  try {
    // 1. Charger tous les contrats
    console.log('📋 Chargement des contrats...');
    const contratsSnapshot = await getDocs(collection(db, 'contrats'));
    const contrats = {};
    contratsSnapshot.forEach(doc => {
      contrats[doc.id] = { id: doc.id, ...doc.data() };
    });
    console.log(`✅ ${Object.keys(contrats).length} contrats chargés\n`);
    
    // 2. Nettoyer la collection contrats
    console.log('🧹 Nettoyage de la collection contrats...');
    let contratsUpdated = 0;
    const contratsBatch = writeBatch(db);
    
    for (const [contratId, contrat] of Object.entries(contrats)) {
      const updates = {};
      
      // Supprimer contratStatut s'il existe
      if (contrat.contratStatut !== undefined) {
        updates.contratStatut = deleteField();
      }
      
      // S'assurer que le statut est correct
      if (!contrat.status) {
        if (contrat.finalizedAt) {
          updates.status = 'finalized';
        } else if (contrat.contratContenu) {
          updates.status = 'generated';
        } else {
          updates.status = 'draft';
        }
      }
      
      if (Object.keys(updates).length > 0) {
        contratsBatch.update(doc(db, 'contrats', contratId), updates);
        contratsUpdated++;
      }
    }
    
    await contratsBatch.commit();
    console.log(`✅ ${contratsUpdated} contrats mis à jour\n`);
    
    // 3. Nettoyer et synchroniser la collection concerts
    console.log('🎪 Nettoyage de la collection concerts...');
    const concertsSnapshot = await getDocs(collection(db, 'concerts'));
    let concertsUpdated = 0;
    const concertsBatch = writeBatch(db);
    
    concertsSnapshot.forEach(concertDoc => {
      const concert = concertDoc.data();
      const updates = {};
      
      // Supprimer les champs legacy
      if (concert.contratStatut !== undefined) {
        updates.contratStatut = deleteField();
      }
      if (concert.hasContratRedige !== undefined) {
        updates.hasContratRedige = deleteField();
      }
      
      // Synchroniser le statut si un contrat existe
      if (concert.contratId && contrats[concert.contratId]) {
        const contrat = contrats[concert.contratId];
        if (concert.contratStatus !== contrat.status) {
          updates.contratStatus = contrat.status || 'draft';
        }
      } else if (concert.contratStatus && !concert.contratId) {
        // Supprimer le statut si pas de contrat
        updates.contratStatus = deleteField();
      }
      
      if (Object.keys(updates).length > 0) {
        concertsBatch.update(doc(db, 'concerts', concertDoc.id), updates);
        concertsUpdated++;
      }
    });
    
    await concertsBatch.commit();
    console.log(`✅ ${concertsUpdated} concerts mis à jour\n`);
    
    // 4. Rapport final
    console.log('📊 Migration terminée avec succès !\n');
    console.log('Résumé :');
    console.log(`- Contrats traités : ${Object.keys(contrats).length}`);
    console.log(`- Contrats mis à jour : ${contratsUpdated}`);
    console.log(`- Concerts traités : ${concertsSnapshot.size}`);
    console.log(`- Concerts mis à jour : ${concertsUpdated}`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration :', error);
    process.exit(1);
  }
}

// Fonction pour vérifier l'état avant migration (optionnel)
async function checkCurrentState() {
  console.log('🔍 Vérification de l\'état actuel...\n');
  
  const concertsSnapshot = await getDocs(collection(db, 'concerts'));
  let legacyFieldsCount = 0;
  let inconsistentStatuses = 0;
  
  concertsSnapshot.forEach(doc => {
    const data = doc.data();
    if (data.contratStatut || data.hasContratRedige) {
      legacyFieldsCount++;
    }
    if (data.contratId && data.contratStatus === 'draft' && data.contratStatut === 'redige') {
      inconsistentStatuses++;
    }
  });
  
  console.log(`Concerts avec champs legacy : ${legacyFieldsCount}`);
  console.log(`Concerts avec statuts incohérents : ${inconsistentStatuses}\n`);
}

// Exécuter la migration
async function main() {
  console.log('='.repeat(50));
  console.log('MIGRATION DES STATUTS DE CONTRATS');
  console.log('='.repeat(50) + '\n');
  
  // Vérifier l'état actuel
  await checkCurrentState();
  
  // Demander confirmation
  console.log('⚠️  Cette migration va modifier votre base de données.');
  console.log('Assurez-vous d\'avoir une sauvegarde récente.\n');
  console.log('Appuyez sur Ctrl+C pour annuler ou Entrée pour continuer...');
  
  await new Promise(resolve => {
    process.stdin.once('data', resolve);
  });
  
  // Exécuter la migration
  await migrateContractStatuses();
  
  console.log('\n✨ Migration terminée !');
  process.exit(0);
}

// Lancer le script
main().catch(error => {
  console.error('Erreur fatale :', error);
  process.exit(1);
});