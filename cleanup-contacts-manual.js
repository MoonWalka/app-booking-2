#!/usr/bin/env node

/**
 * Nettoyage manuel des contacts
 * Supprime les métadonnées structure* dupliquées
 * Date: 18 juin 2025
 */

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  doc, 
  getDoc,
  updateDoc,
  serverTimestamp
} = require('firebase/firestore');

// Configuration Firebase locale
const firebaseConfig = {
  apiKey: "AIzaSyD2nrKWoEBvEbjbopk26rrGbCYZDNpJ8BU",
  authDomain: "app-booking-26571.firebaseapp.com",
  projectId: "app-booking-26571",
  storageBucket: "app-booking-26571.firebasestorage.app",
  messagingSenderId: "985724562753",
  appId: "1:985724562753:web:253b7e7c678318b69a85c0",
  measurementId: "G-C7KPDD9RHG"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Contacts à nettoyer (ceux avec structure)
const CONTACTS_TO_CLEAN = [
  { id: 'gqm8Xw7fXyZyIjNU1r8k', name: 'Jean Fons' },
  { id: 'QxkEAuYVM3mFrZWDFm95', name: 'Sophie Madet' },
  { id: 'Vt1DLodkO5s2ktKcJNmx', name: 'Thierry Fumier' }
];

async function cleanupContact(contactId, contactName) {
  console.log(`\n🧹 Nettoyage de ${contactName} (${contactId})`);
  
  try {
    // 1. Récupérer le contact
    const contactDoc = await getDoc(doc(db, 'contacts', contactId));
    
    if (!contactDoc.exists()) {
      console.log('❌ Contact non trouvé');
      return false;
    }
    
    const contact = { id: contactDoc.id, ...contactDoc.data() };
    
    // 2. Identifier les champs structure* à supprimer
    const fieldsToRemove = {};
    const structureFields = [];
    
    Object.keys(contact).forEach(key => {
      if (key.startsWith('structure') && key !== 'structureId') {
        fieldsToRemove[key] = null; // Firestore deleteField equivalent
        structureFields.push(key);
      }
    });
    
    console.log(`📋 Champs à supprimer: ${structureFields.length}`);
    structureFields.forEach(field => {
      console.log(`   - ${field}: ${contact[field]}`);
    });
    
    // 3. Vérifier qu'on garde structureId
    if (contact.structureId) {
      console.log(`✅ Garde structureId: ${contact.structureId}`);
    } else {
      console.log('⚠️ Pas de structureId - contact libre');
    }
    
    if (structureFields.length === 0) {
      console.log('✅ Déjà nettoyé');
      return true;
    }
    
    // 4. Créer l'objet de mise à jour
    const updateData = {
      ...fieldsToRemove,
      updatedAt: serverTimestamp(),
      cleanedAt: serverTimestamp(),
      cleanupNote: 'Métadonnées structure supprimées manuellement'
    };
    
    console.log('🔧 Application du nettoyage...');
    
    // 5. Appliquer la mise à jour
    await updateDoc(doc(db, 'contacts', contactId), updateData);
    
    console.log('✅ Contact nettoyé avec succès');
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error.message);
    return false;
  }
}

async function cleanupAllContacts() {
  console.log('🧹 NETTOYAGE MANUEL DES CONTACTS');
  console.log('================================\n');
  
  let successCount = 0;
  let totalCount = CONTACTS_TO_CLEAN.length;
  
  for (const contact of CONTACTS_TO_CLEAN) {
    const success = await cleanupContact(contact.id, contact.name);
    if (success) successCount++;
    
    // Petite pause entre les opérations
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n📊 RÉSUMÉ DU NETTOYAGE');
  console.log('======================');
  console.log(`✅ Contacts nettoyés: ${successCount}/${totalCount}`);
  
  if (successCount === totalCount) {
    console.log('🎉 Nettoyage terminé avec succès !');
  } else {
    console.log('⚠️ Certains contacts n\'ont pas pu être nettoyés');
  }
}

// Fonction pour supprimer un champ spécifique (alternative)
async function removeSpecificFields() {
  console.log('\n🎯 SUPPRESSION SPÉCIFIQUE DES CHAMPS');
  console.log('===================================');
  
  const { deleteField } = require('firebase/firestore');
  
  for (const contact of CONTACTS_TO_CLEAN) {
    console.log(`\n🔧 ${contact.name}:`);
    
    try {
      // Liste des champs structure à supprimer
      const fieldsToDelete = {
        structureRaisonSociale: deleteField(),
        structureNom: deleteField(),
        structurePays: deleteField(),
        structureEmail: deleteField(),
        structureAdresse: deleteField(),
        structureCodePostal: deleteField(),
        structureVille: deleteField(),
        structureTelephone1: deleteField(),
        structureTelephone2: deleteField(),
        structureMobile: deleteField(),
        structureFax: deleteField(),
        structureSiteWeb: deleteField(),
        structureSiret: deleteField(),
        structureCommentaires1: deleteField(),
        structureCommentaires2: deleteField(),
        structureCommentaires3: deleteField(),
        structureCommentaires4: deleteField(),
        structureCommentaires5: deleteField(),
        structureCommentaires6: deleteField(),
        structureDepartement: deleteField(),
        structureRegion: deleteField(),
        structureSuiteAdresse1: deleteField(),
        structureTva: deleteField(),
        structureNumeroIntracommunautaire: deleteField(),
        structureType: deleteField(),
        updatedAt: serverTimestamp(),
        finalCleanupAt: serverTimestamp()
      };
      
      await updateDoc(doc(db, 'contacts', contact.id), fieldsToDelete);
      console.log('✅ Champs supprimés avec deleteField()');
      
    } catch (error) {
      console.error('❌ Erreur:', error.message);
    }
  }
}

// Exécuter le nettoyage
async function main() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const askQuestion = (question) => {
    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        resolve(answer.toLowerCase().trim());
      });
    });
  };
  
  console.log('🚨 ATTENTION: Nettoyage des métadonnées dupliquées !');
  console.log('Cela va supprimer définitivement les champs structure* des contacts');
  console.log('(mais garder structureId pour les relations)\n');
  
  const method = await askQuestion('Méthode ? (1=basique, 2=deleteField, q=quit): ');
  
  if (method === 'q' || method === 'quit') {
    console.log('❌ Annulé');
    rl.close();
    return;
  }
  
  const confirm = await askQuestion('Confirmez-vous le nettoyage ? (oui/non): ');
  
  if (confirm !== 'oui' && confirm !== 'o' && confirm !== 'y' && confirm !== 'yes') {
    console.log('❌ Nettoyage annulé');
    rl.close();
    return;
  }
  
  rl.close();
  
  if (method === '2') {
    await removeSpecificFields();
  } else {
    await cleanupAllContacts();
  }
  
  console.log('\n🔍 Relancez l\'audit pour vérifier le résultat');
}

main().then(() => {
  console.log('\n✅ Script terminé');
  process.exit(0);
}).catch(error => {
  console.error('💥 Erreur fatale:', error);
  process.exit(1);
});