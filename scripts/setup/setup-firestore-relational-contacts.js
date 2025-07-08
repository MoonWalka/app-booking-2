#!/usr/bin/env node

/**
 * Script de configuration pour créer les collections et index Firestore
 * pour le nouveau modèle relationnel de contacts
 * 
 * À exécuter une seule fois pour préparer Firestore
 */

// Charger les variables d'environnement
require('dotenv').config({ path: '.env.local' });

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

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
const auth = getAuth(app);

console.log('🚀 Configuration Firestore pour le modèle relationnel de contacts');
console.log('==============================================================\n');

/**
 * Instructions pour créer les index composites
 * Ces index doivent être créés manuellement dans la console Firebase
 */
function printIndexInstructions() {
  console.log('📋 INDEX COMPOSITES À CRÉER DANS FIRESTORE:\n');
  
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
 * Créer des documents de test pour initialiser les collections
 */
async function createTestDocuments(entrepriseId) {
  try {
    console.log('📝 Création de documents de test...\n');
    
    // Document test dans structures
    const structureRef = doc(collection(db, 'structures'));
    await setDoc(structureRef, {
      entrepriseId: entrepriseId,
      raisonSociale: '_TEST_STRUCTURE_',
      type: 'autre',
      email: 'test@example.com',
      tags: ['_test_'],
      isClient: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('✅ Collection "structures" initialisée');
    
    // Document test dans personnes
    const personneRef = doc(collection(db, 'personnes'));
    await setDoc(personneRef, {
      entrepriseId: entrepriseId,
      prenom: '_Test_',
      nom: '_User_',
      email: 'test.user@example.com',
      tags: ['_test_'],
      isPersonneLibre: true,
      createdAt: new Date(),
      updatedAt: new Date()
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
      createdAt: new Date(),
      updatedAt: new Date()
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
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('✅ Collection "qualifications" initialisée\n');
    
    console.log('🗑️  Ces documents de test peuvent être supprimés après création des index.');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création des documents de test:', error);
  }
}

/**
 * Règles de sécurité Firestore recommandées
 */
function printSecurityRules() {
  console.log('\n🔒 RÈGLES DE SÉCURITÉ FIRESTORE RECOMMANDÉES:\n');
  
  const rules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Fonction helper pour vérifier l'appartenance à une organisation
    function isOrgMember(orgId) {
      return request.auth != null && 
        exists(/databases/$(database)/documents/user_organizations/$(request.auth.uid + '_' + orgId));
    }
    
    // Fonction pour vérifier si c'est un admin de l'organisation
    function isOrgAdmin(orgId) {
      return request.auth != null && 
        get(/databases/$(database)/documents/user_organizations/$(request.auth.uid + '_' + orgId)).data.role == 'admin';
    }
    
    // Règles pour structures
    match /structures/{structureId} {
      allow read: if isOrgMember(resource.data.entrepriseId);
      allow create: if isOrgMember(request.resource.data.entrepriseId) &&
        request.resource.data.keys().hasAll(['entrepriseId', 'raisonSociale']);
      allow update: if isOrgMember(resource.data.entrepriseId) &&
        request.resource.data.entrepriseId == resource.data.entrepriseId;
      allow delete: if isOrgAdmin(resource.data.entrepriseId);
    }
    
    // Règles pour personnes
    match /personnes/{personneId} {
      allow read: if isOrgMember(resource.data.entrepriseId);
      allow create: if isOrgMember(request.resource.data.entrepriseId) &&
        request.resource.data.keys().hasAll(['entrepriseId', 'prenom', 'nom', 'email']);
      allow update: if isOrgMember(resource.data.entrepriseId) &&
        request.resource.data.entrepriseId == resource.data.entrepriseId;
      allow delete: if isOrgAdmin(resource.data.entrepriseId);
    }
    
    // Règles pour liaisons
    match /liaisons/{liaisonId} {
      allow read: if isOrgMember(resource.data.entrepriseId);
      allow create: if isOrgMember(request.resource.data.entrepriseId) &&
        request.resource.data.keys().hasAll(['entrepriseId', 'structureId', 'personneId']);
      allow update: if isOrgMember(resource.data.entrepriseId) &&
        request.resource.data.entrepriseId == resource.data.entrepriseId;
      allow delete: if isOrgAdmin(resource.data.entrepriseId);
    }
    
    // Règles pour qualifications
    match /qualifications/{qualificationId} {
      allow read: if isOrgMember(resource.data.entrepriseId);
      allow write: if isOrgAdmin(resource.data.entrepriseId);
    }
  }
}`;
  
  console.log(rules);
  console.log('\n⚠️  Copiez ces règles dans la console Firestore > Rules');
}

/**
 * Script principal
 */
async function main() {
  try {
    // Demander les credentials si nécessaire
    if (process.argv.length < 4) {
      console.log('Usage: node setup-firestore-relational-contacts.js <email> <password> <entrepriseId>');
      console.log('Example: node setup-firestore-relational-contacts.js admin@example.com password123 org-123\n');
      
      printIndexInstructions();
      printSecurityRules();
      return;
    }
    
    const [,, email, password, entrepriseId] = process.argv;
    
    // Se connecter
    console.log('🔐 Connexion à Firebase...');
    await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ Connecté avec succès\n');
    
    // Créer les documents de test
    await createTestDocuments(entrepriseId);
    
    // Afficher les instructions
    printIndexInstructions();
    printSecurityRules();
    
    console.log('\n✨ Configuration terminée!');
    console.log('Prochaines étapes:');
    console.log('1. Créez les index dans la console Firebase');
    console.log('2. Appliquez les règles de sécurité');
    console.log('3. Supprimez les documents de test créés');
    console.log('4. Lancez le script de migration des données\n');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
  
  process.exit(0);
}

// Exécuter le script
main();