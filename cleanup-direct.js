#!/usr/bin/env node

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, updateDoc, deleteField, serverTimestamp } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyD2nrKWoEBvEbjbopk26rrGbCYZDNpJ8BU",
  authDomain: "app-booking-26571.firebaseapp.com", 
  projectId: "app-booking-26571",
  storageBucket: "app-booking-26571.firebasestorage.app",
  messagingSenderId: "985724562753",
  appId: "1:985724562753:web:253b7e7c678318b69a85c0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function cleanupContacts() {
  console.log('🧹 NETTOYAGE DIRECT DES CONTACTS\n');

  const contacts = [
    'gqm8Xw7fXyZyIjNU1r8k', // Jean
    'QxkEAuYVM3mFrZWDFm95', // Sophie
    'Vt1DLodkO5s2ktKcJNmx'  // Thierry
  ];

  for (const contactId of contacts) {
    try {
      console.log(`🔧 Nettoyage ${contactId}...`);
      
      await updateDoc(doc(db, 'contacts', contactId), {
        structureRaisonSociale: deleteField(),
        structureNom: deleteField(),
        structurePays: deleteField(),
        structureEmail: deleteField(),
        structureAdresse: deleteField(),
        updatedAt: serverTimestamp(),
        cleanedAt: serverTimestamp()
      });
      
      console.log('✅ Nettoyé');
    } catch (error) {
      console.error(`❌ Erreur: ${error.message}`);
    }
  }
  
  console.log('\n🎉 Terminé !');
}

cleanupContacts();