#!/usr/bin/env node

/**
 * 🔒 Script de Création d'Utilisateur Test Firebase
 * 
 * Ce script aide à créer rapidement des comptes Firebase pour tester
 * l'authentification sécurisée après avoir corrigé les vulnérabilités.
 */

const { initializeApp } = require('firebase/app');
const { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword 
} = require('firebase/auth');

// Configuration Firebase (utilise les variables d'environnement)
require('dotenv').config();

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

console.log('🔒 Configuration Firebase...');
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

/**
 * Créer un utilisateur de test
 */
async function createTestUser() {
  const testUsers = [
    {
      email: 'admin@tourcraft.dev',
      password: 'TourCraft2025!',
      displayName: 'Admin TourCraft'
    },
    {
      email: 'user@tourcraft.dev', 
      password: 'TourCraft2025!',
      displayName: 'Utilisateur TourCraft'
    },
    {
      email: 'test@tourcraft.dev',
      password: 'Test123456!',
      displayName: 'Test TourCraft'
    }
  ];

  console.log('🔑 Création des utilisateurs de test...\n');

  for (const user of testUsers) {
    try {
      console.log(`📧 Création de l'utilisateur: ${user.email}`);
      
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        user.email, 
        user.password
      );
      
      console.log(`✅ Utilisateur créé avec succès: ${userCredential.user.uid}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Mot de passe: ${user.password}\n`);
      
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`⚠️ Utilisateur déjà existant: ${user.email}`);
        console.log(`   Mot de passe: ${user.password}\n`);
      } else {
        console.error(`❌ Erreur pour ${user.email}:`, error.message, '\n');
      }
    }
  }
}

/**
 * Tester la connexion
 */
async function testLogin() {
  console.log('🧪 Test de connexion...\n');
  
  const testEmail = 'admin@tourcraft.dev';
  const testPassword = 'TourCraft2025!';
  
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth, 
      testEmail, 
      testPassword
    );
    
    console.log('✅ Connexion de test réussie !');
    console.log(`   UID: ${userCredential.user.uid}`);
    console.log(`   Email: ${userCredential.user.email}`);
    console.log(`   Email vérifié: ${userCredential.user.emailVerified}\n`);
    
  } catch (error) {
    console.error('❌ Erreur de connexion de test:', error.message, '\n');
  }
}

/**
 * Afficher les instructions d'utilisation
 */
function showInstructions() {
  console.log('📋 COMPTES CRÉÉS POUR TESTER L\'AUTHENTIFICATION:');
  console.log('==================================================');
  console.log('🔑 Admin:');
  console.log('   Email: admin@tourcraft.dev');
  console.log('   Mot de passe: TourCraft2025!');
  console.log('');
  console.log('🔑 Utilisateur:');
  console.log('   Email: user@tourcraft.dev');
  console.log('   Mot de passe: TourCraft2025!');
  console.log('');
  console.log('🔑 Test:');
  console.log('   Email: test@tourcraft.dev');
  console.log('   Mot de passe: Test123456!');
  console.log('');
  console.log('🌐 Allez sur http://localhost:3000/login');
  console.log('✅ Utilisez ces identifiants pour vous connecter');
  console.log('');
}

/**
 * Script principal
 */
async function main() {
  try {
    console.log('🚀 Démarrage du script de création d\'utilisateurs...\n');
    
    // Vérifier la configuration
    if (!firebaseConfig.apiKey) {
      console.error('❌ Variables d\'environnement Firebase manquantes !');
      console.log('💡 Vérifiez votre fichier .env');
      return;
    }
    
    // Créer les utilisateurs
    await createTestUser();
    
    // Tester la connexion
    await testLogin();
    
    // Afficher les instructions
    showInstructions();
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  } finally {
    process.exit(0);
  }
}

// Exécuter le script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { createTestUser, testLogin }; 