#!/usr/bin/env node

/**
 * Script de nettoyage des documents de test
 * Supprime tous les documents créés pour les tests
 */

// Charger les variables d'environnement
require('dotenv').config({ path: '.env.local' });

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  getDocs, 
  query, 
  where, 
  deleteDoc,
  doc
} = require('firebase/firestore');

// Configuration Firebase
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const organizationId = '9LjkCJG04pEzbABdHkSf';

console.log('🧹 NETTOYAGE DES DOCUMENTS DE TEST');
console.log('==================================\n');

/**
 * Supprimer les documents de test d'une collection
 */
async function cleanupCollection(collectionName, testFields) {
  console.log(`🗑️  Nettoyage collection "${collectionName}"...`);
  
  let totalDeleted = 0;
  
  for (const field of testFields) {
    try {
      // Chercher les documents de test
      const q = query(
        collection(db, collectionName),
        where('organizationId', '==', organizationId),
        where(field.name, field.operator, field.value)
      );
      
      const snapshot = await getDocs(q);
      
      // Supprimer chaque document
      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        console.log(`   🗑️  Suppression: ${data[field.name] || docSnapshot.id}`);
        await deleteDoc(doc(db, collectionName, docSnapshot.id));
        totalDeleted++;
      }
      
    } catch (error) {
      console.error(`   ❌ Erreur pour ${field.name}:`, error.message);
    }
  }
  
  console.log(`   ✅ ${totalDeleted} documents supprimés\n`);
  return totalDeleted;
}

/**
 * Script principal
 */
async function main() {
  try {
    console.log(`🎯 Organisation: ${organizationId}\n`);
    
    let totalDeleted = 0;
    
    // Nettoyer structures
    totalDeleted += await cleanupCollection('structures', [
      { name: 'raisonSociale', operator: '>=', value: '_TEST_' },
      { name: 'raisonSociale', operator: '<', value: '_TEST_z' }
    ]);
    
    // Nettoyer personnes  
    totalDeleted += await cleanupCollection('personnes', [
      { name: 'prenom', operator: '>=', value: '_Test' },
      { name: 'prenom', operator: '<', value: '_Testz' }
    ]);
    
    // Nettoyer qualifications
    totalDeleted += await cleanupCollection('qualifications', [
      { name: 'label', operator: '>=', value: '_Test' },
      { name: 'label', operator: '<', value: '_Testz' }
    ]);
    
    // Nettoyer liaisons orphelines (sans structures/personnes valides)
    console.log('🔗 Vérification des liaisons...');
    const liaisonsQuery = query(
      collection(db, 'liaisons'),
      where('organizationId', '==', organizationId)
    );
    const liaisonsSnapshot = await getDocs(liaisonsQuery);
    
    let liaisonsDeleted = 0;
    for (const liaisonDoc of liaisonsSnapshot.docs) {
      const liaison = liaisonDoc.data();
      
      // Vérifier si structure et personne existent encore
      try {
        const structureQuery = query(
          collection(db, 'structures'),
          where('organizationId', '==', organizationId)
        );
        const structuresSnapshot = await getDocs(structureQuery);
        const structureExists = structuresSnapshot.docs.some(doc => doc.id === liaison.structureId);
        
        const personnesQuery = query(
          collection(db, 'personnes'),
          where('organizationId', '==', organizationId)
        );
        const personnesSnapshot = await getDocs(personnesQuery);
        const personneExists = personnesSnapshot.docs.some(doc => doc.id === liaison.personneId);
        
        if (!structureExists || !personneExists) {
          console.log(`   🗑️  Liaison orpheline: ${liaisonDoc.id}`);
          await deleteDoc(doc(db, 'liaisons', liaisonDoc.id));
          liaisonsDeleted++;
        }
        
      } catch (error) {
        console.error(`   ❌ Erreur vérification liaison ${liaisonDoc.id}:`, error.message);
      }
    }
    
    if (liaisonsDeleted > 0) {
      console.log(`   ✅ ${liaisonsDeleted} liaisons orphelines supprimées\n`);
      totalDeleted += liaisonsDeleted;
    } else {
      console.log(`   ✅ Aucune liaison orpheline trouvée\n`);
    }
    
    // Rapport final
    console.log('='.repeat(40));
    console.log('📊 RAPPORT DE NETTOYAGE');
    console.log('='.repeat(40));
    console.log(`Total supprimé: ${totalDeleted} documents`);
    
    if (totalDeleted > 0) {
      console.log('\n✅ NETTOYAGE TERMINÉ');
    } else {
      console.log('\nℹ️ Aucun document de test trouvé');
    }
    
  } catch (error) {
    console.error('❌ Erreur fatale:', error.message);
    process.exit(1);
  }
  
  process.exit(0);
}

// Exécuter le script
main();