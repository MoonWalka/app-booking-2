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

async function cleanupFlorent() {
  console.log('🧹 Nettoyage final de Florent (structurePays restant)');
  
  try {
    await updateDoc(doc(db, 'contacts', 'k1lukDQoOaEs7ogQvgCq'), {
      structurePays: deleteField(),
      updatedAt: serverTimestamp(),
      finalCleanupAt: serverTimestamp()
    });
    
    console.log('✅ Florent nettoyé - structurePays supprimé');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

cleanupFlorent();