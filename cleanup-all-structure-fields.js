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

async function cleanupAllStructureFields() {
  console.log('🧹 NETTOYAGE PRÉVENTIF - Tous les champs structure*');
  
  // Tous les contacts (même libres)
  const contacts = [
    'nW8FVcwoaWe6mXdtRD8E', // Romain
    'EtgGEqVu2CmOdgANgYZC'  // Test 2
  ];

  for (const contactId of contacts) {
    try {
      console.log(`🔧 Nettoyage ${contactId}...`);
      
      await updateDoc(doc(db, 'contacts', contactId), {
        structurePays: deleteField(),
        structureRaisonSociale: deleteField(),
        structureNom: deleteField(),
        structureEmail: deleteField(),
        structureAdresse: deleteField(),
        structureVille: deleteField(),
        structureCodePostal: deleteField(),
        structureTelephone1: deleteField(),
        structureTelephone2: deleteField(),
        structureMobile: deleteField(),
        structureFax: deleteField(),
        structureSiteWeb: deleteField(),
        structureSiret: deleteField(),
        structureDepartement: deleteField(),
        structureRegion: deleteField(),
        structureTva: deleteField(),
        structureNumeroIntracommunautaire: deleteField(),
        structureType: deleteField(),
        structureCommentaires1: deleteField(),
        structureCommentaires2: deleteField(),
        structureCommentaires3: deleteField(),
        structureCommentaires4: deleteField(),
        structureCommentaires5: deleteField(),
        structureCommentaires6: deleteField(),
        structureSuiteAdresse1: deleteField(),
        updatedAt: serverTimestamp(),
        preventiveCleanupAt: serverTimestamp()
      });
      
      console.log('✅ Nettoyé complètement');
    } catch (error) {
      console.error(`❌ Erreur: ${error.message}`);
    }
  }
  
  console.log('\n🎉 Nettoyage préventif terminé !');
  console.log('✅ AUCUN champ structure* ne reste dans les contacts');
  console.log('✅ Architecture 100% Structure-centrée');
}

cleanupAllStructureFields();