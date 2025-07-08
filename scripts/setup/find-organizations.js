#!/usr/bin/env node

/**
 * Script pour identifier les organisations existantes dans la base
 */

// Charger les variables d'environnement
require('dotenv').config({ path: '.env.local' });

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, limit } = require('firebase/firestore');

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

async function findOrganizations() {
  try {
    console.log('🔍 Recherche des organisations existantes...\n');
    
    // Chercher dans les organizations
    const orgsQuery = query(collection(db, 'organizations'), limit(10));
    const orgsSnapshot = await getDocs(orgsQuery);
    
    if (!orgsSnapshot.empty) {
      console.log('📋 Organisations trouvées:');
      orgsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log(`  - ID: ${doc.id}`);
        console.log(`    Nom: ${data.name || 'Non défini'}`);
        console.log(`    Créé: ${data.createdAt?.toDate?.() || 'Non défini'}`);
        console.log('');
      });
    }
    
    // Chercher dans contacts_unified pour trouver des entrepriseId
    const contactsQuery = query(collection(db, 'contacts_unified'), limit(5));
    const contactsSnapshot = await getDocs(contactsQuery);
    
    if (!contactsSnapshot.empty) {
      console.log('📋 EntrepriseIds trouvés dans contacts_unified:');
      const orgIds = new Set();
      contactsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.entrepriseId) {
          orgIds.add(data.entrepriseId);
        }
      });
      
      orgIds.forEach(orgId => {
        console.log(`  - ${orgId}`);
      });
      console.log('');
    }
    
    // Suggestions
    console.log('💡 Suggestions:');
    if (orgsSnapshot.empty && contactsSnapshot.empty) {
      console.log('  - Aucune organisation trouvée');
      console.log('  - Utilisez un entrepriseId test: "org-test-123"');
    } else if (!orgsSnapshot.empty) {
      const firstOrg = orgsSnapshot.docs[0];
      console.log(`  - Utilisez l'organisation existante: "${firstOrg.id}"`);
      console.log(`  - Commande: node scripts/setup/setup-firestore-relational-contacts.js admin@example.com password123 ${firstOrg.id}`);
    } else if (orgIds.size > 0) {
      const firstOrgId = Array.from(orgIds)[0];
      console.log(`  - Utilisez l'entrepriseId existant: "${firstOrgId}"`);
      console.log(`  - Commande: node scripts/setup/setup-firestore-relational-contacts.js admin@example.com password123 ${firstOrgId}`);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
  
  process.exit(0);
}

findOrganizations();