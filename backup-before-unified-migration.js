#!/usr/bin/env node

/**
 * Backup avant migration vers architecture unifiée
 * Date: 18 juin 2025
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const fs = require('fs').promises;

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

async function backupBeforeUnifiedMigration() {
  console.log('💾 Backup avant migration unifiée');
  console.log('=================================\n');
  
  try {
    // Backup contacts
    const contactsSnapshot = await getDocs(collection(db, 'contacts'));
    const contacts = contactsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Backup structures
    const structuresSnapshot = await getDocs(collection(db, 'structures'));
    const structures = structuresSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const backupData = {
      backupDate: new Date().toISOString(),
      backupReason: "Avant migration vers architecture unifiée",
      collections: {
        contacts: {
          count: contacts.length,
          data: contacts
        },
        structures: {
          count: structures.length,
          data: structures
        }
      },
      summary: {
        totalDocuments: contacts.length + structures.length,
        contactsWithStructure: contacts.filter(c => c.structureId).length,
        freeContacts: contacts.filter(c => !c.structureId).length
      }
    };
    
    // Sauvegarder
    const filename = `backup-before-unified-migration-${Date.now()}.json`;
    await fs.writeFile(filename, JSON.stringify(backupData, null, 2));
    
    console.log('✅ Backup créé:', filename);
    console.log(`📊 Données sauvegardées:`);
    console.log(`   - Contacts: ${contacts.length}`);
    console.log(`   - Structures: ${structures.length}`);
    console.log(`   - Total: ${contacts.length + structures.length} documents`);
    
    return filename;
    
  } catch (error) {
    console.error('❌ Erreur backup:', error.message);
    throw error;
  }
}

backupBeforeUnifiedMigration();