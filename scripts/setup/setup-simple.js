#!/usr/bin/env node

/**
 * Script simple pour créer les documents de test sans authentification
 */

// Charger les variables d'environnement
require('dotenv').config({ path: '.env.local' });

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, serverTimestamp } = require('firebase/firestore');

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

const entrepriseId = '9LjkCJG04pEzbABdHkSf'; // Organisation "test"

console.log('🚀 Configuration Firestore pour le modèle relationnel de contacts');
console.log('==============================================================\n');

/**
 * Créer des documents de test pour initialiser les collections
 */
async function createTestDocuments() {
  try {
    console.log('📝 Création de documents de test...\n');
    
    // Document test dans structures
    const structureRef = doc(collection(db, 'structures'));
    await setDoc(structureRef, {
      entrepriseId: entrepriseId,
      raisonSociale: '_TEST_STRUCTURE_',
      type: 'autre',
      email: 'test@example.com',
      telephone1: '0123456789',
      ville: 'Paris',
      tags: ['_test_'],
      isClient: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('✅ Collection "structures" initialisée');
    
    // Document test dans personnes
    const personneRef = doc(collection(db, 'personnes'));
    await setDoc(personneRef, {
      entrepriseId: entrepriseId,
      prenom: '_Test_',
      nom: '_User_',
      email: 'test.user@example.com',
      telephone: '0123456789',
      tags: ['_test_'],
      isPersonneLibre: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('✅ Collection "personnes" initialisée');
    
    // Document test dans liaisons
    const liaisonRef = doc(collection(db, 'liaisons'));
    await setDoc(liaisonRef, {
      entrepriseId: entrepriseId,
      structureId: structureRef.id,
      personneId: personneRef.id,
      fonction: 'Test',
      actif: true,
      prioritaire: false,
      interesse: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('✅ Collection "liaisons" initialisée');
    
    // Document test dans qualifications
    const qualificationRef = doc(collection(db, 'qualifications'));
    await setDoc(qualificationRef, {
      entrepriseId: entrepriseId,
      parentId: null,
      label: '_Test_',
      code: '_TEST_',
      type: 'autre',
      ordre: 0,
      actif: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('✅ Collection "qualifications" initialisée\n');
    
    console.log('🗑️  Ces documents de test peuvent être supprimés après création des index.');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création des documents de test:', error);
    return false;
  }
  
  return true;
}

/**
 * Afficher les instructions d'index
 */
function printIndexInstructions() {
  console.log('\n📋 INDEX COMPOSITES À CRÉER DANS FIRESTORE:\n');
  
  console.log('1. Collection "structures":');
  console.log('   - Index: entrepriseId (ASC) + raisonSociale (ASC)');
  console.log('   - Index: entrepriseId (ASC) + isClient (ASC)');
  console.log('   - Index: entrepriseId (ASC) + tags (ARRAY_CONTAINS)');
  console.log('   - Index: entrepriseId (ASC) + createdAt (DESC)\n');
  
  console.log('2. Collection "personnes":');
  console.log('   - Index: entrepriseId (ASC) + email (ASC)');
  console.log('   - Index: entrepriseId (ASC) + nom (ASC) + prenom (ASC)');
  console.log('   - Index: entrepriseId (ASC) + isPersonneLibre (ASC)');
  console.log('   - Index: entrepriseId (ASC) + tags (ARRAY_CONTAINS)\n');
  
  console.log('3. Collection "liaisons":');
  console.log('   - Index: entrepriseId (ASC) + structureId (ASC) + personneId (ASC)');
  console.log('   - Index: entrepriseId (ASC) + actif (ASC)');
  console.log('   - Index: entrepriseId (ASC) + prioritaire (ASC)');
  console.log('   - Index: structureId (ASC) + actif (ASC) + prioritaire (DESC)');
  console.log('   - Index: personneId (ASC) + actif (ASC) + dateDebut (DESC)\n');
  
  console.log('4. Collection "qualifications" (optionnel):');
  console.log('   - Index: entrepriseId (ASC) + parentId (ASC) + ordre (ASC)');
  console.log('   - Index: entrepriseId (ASC) + type (ASC) + actif (ASC)\n');
  
  console.log('⚠️  Ces index doivent être créés manuellement dans:');
  console.log(`   https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/indexes\n`);
}

/**
 * Script principal
 */
async function main() {
  try {
    console.log(`🎯 Organisation cible: ${entrepriseId}\n`);
    
    // Créer les documents de test
    const success = await createTestDocuments();
    
    if (success) {
      // Afficher les instructions
      printIndexInstructions();
      
      console.log('\n✨ Configuration terminée!');
      console.log('Prochaines étapes:');
      console.log('1. Créez les index dans la console Firebase');
      console.log('2. Supprimez les documents de test créés (qui commencent par "_TEST_")');
      console.log('3. Lancez le script de migration des données\n');
      console.log('🚀 Maintenant vous pouvez tester:');
      console.log(`   node scripts/migration/migrate-to-relational-contacts.js test@example.com password123 ${entrepriseId} --dry-run\n`);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
  
  process.exit(0);
}

// Exécuter le script
main();