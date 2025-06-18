#!/usr/bin/env node

/**
 * Test de migration pour UN SEUL contact
 * Approche progressive et sécurisée
 * Date: 18 juin 2025
 */

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
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

// ID du contact à migrer (Thierry Fumier - LARA)
const TARGET_CONTACT_ID = 'Vt1DLodkO5s2ktKcJNmx';

async function migrateSingleContact() {
  console.log('🧪 TEST MIGRATION - UN SEUL CONTACT');
  console.log('===================================\n');

  try {
    // 1. Récupérer le contact cible
    console.log('📋 1. RÉCUPÉRATION DU CONTACT');
    console.log('------------------------------');
    
    const contactDoc = await getDoc(doc(db, 'contacts', TARGET_CONTACT_ID));
    
    if (!contactDoc.exists()) {
      console.log('❌ Contact non trouvé !');
      return;
    }
    
    const contact = { id: contactDoc.id, ...contactDoc.data() };
    console.log(`✅ Contact trouvé: ${contact.prenom} ${contact.nom || ''}`);
    console.log(`📧 Email: ${contact.email || 'non défini'}`);
    console.log(`📞 Téléphone: ${contact.telephone || 'non défini'}`);
    console.log(`🏢 Organization: ${contact.organizationId || 'non défini'}`);
    
    // Vérifier s'il a des métadonnées structure
    const hasStructureData = Object.keys(contact).some(key => key.startsWith('structure'));
    console.log(`🔗 Métadonnées structure: ${hasStructureData ? 'OUI' : 'NON'}`);
    
    if (hasStructureData) {
      console.log('📊 Métadonnées structure trouvées:');
      Object.keys(contact).forEach(key => {
        if (key.startsWith('structure') && contact[key]) {
          console.log(`   ${key}: ${contact[key]}`);
        }
      });
    }
    
    // 2. Analyser le cas
    console.log('\n🔍 2. ANALYSE DU CAS');
    console.log('-------------------');
    
    const isPersonneLibre = !contact.structureId && !hasStructureData;
    const isPersonneAvecStructure = contact.structureId && hasStructureData;
    const isPersonnePartielle = hasStructureData && !contact.structureId;
    
    if (isPersonneLibre) {
      console.log('✅ CAS: Personne libre (aucune structure)');
      console.log('🎯 ACTION: Aucune migration nécessaire');
      return;
    }
    
    if (isPersonneAvecStructure) {
      console.log('⚠️ CAS: Personne avec structure associée');
      console.log(`🔗 Structure ID: ${contact.structureId}`);
      
      // Vérifier si la structure existe
      const structureDoc = await getDoc(doc(db, 'structures', contact.structureId));
      if (structureDoc.exists()) {
        const structure = structureDoc.data();
        console.log(`✅ Structure trouvée: ${structure.raisonSociale || 'non défini'}`);
        console.log('🎯 ACTION: Nettoyer métadonnées dupliquées');
      } else {
        console.log('❌ Structure référencée non trouvée');
        console.log('🎯 ACTION: Créer structure à partir des métadonnées');
      }
    }
    
    if (isPersonnePartielle) {
      console.log('⚠️ CAS: Métadonnées structure sans relation');
      console.log('🎯 ACTION: Créer structure et établir relation');
    }
    
    // 3. Proposer les actions
    console.log('\n⚡ 3. ACTIONS PROPOSÉES');
    console.log('----------------------');
    
    if (isPersonneLibre) {
      console.log('✅ Aucune action nécessaire');
      return;
    }
    
    // Pour les tests, on va demander confirmation
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
    
    console.log('🚨 ATTENTION: Migration sur données réelles !');
    const confirm = await askQuestion('Voulez-vous continuer ? (oui/non): ');
    
    if (confirm !== 'oui' && confirm !== 'o' && confirm !== 'y' && confirm !== 'yes') {
      console.log('❌ Migration annulée');
      rl.close();
      return;
    }
    
    // 4. Exécuter la migration selon le cas
    console.log('\n🚀 4. EXÉCUTION DE LA MIGRATION');
    console.log('-------------------------------');
    
    if (isPersonneAvecStructure) {
      await migratePersonneWithStructure(contact);
    } else if (isPersonnePartielle) {
      await migratePersonnePartielle(contact);
    }
    
    console.log('\n✅ Migration terminée avec succès !');
    rl.close();
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error.message);
    process.exit(1);
  }
}

async function migratePersonneWithStructure(contact) {
  console.log(`🔧 Migration personne avec structure: ${contact.prenom}`);
  
  // ÉTAPE 1: Enrichir la structure avec les métadonnées du contact
  const structureDoc = await getDoc(doc(db, 'structures', contact.structureId));
  if (structureDoc.exists()) {
    const structure = { id: structureDoc.id, ...structureDoc.data() };
    
    // Extraire les métadonnées structure du contact
    const structureMetadata = {};
    Object.keys(contact).forEach(key => {
      if (key.startsWith('structure') && key !== 'structureId' && contact[key]) {
        // Convertir structureRaisonSociale → raisonSociale
        const cleanKey = key.replace('structure', '');
        const finalKey = cleanKey.charAt(0).toLowerCase() + cleanKey.slice(1);
        structureMetadata[finalKey] = contact[key];
      }
    });
    
    // Fusionner avec la structure existante (métadonnées contact prioritaires)
    const enrichedStructure = {
      ...structure,
      ...structureMetadata,
      contactsAssocies: [...(structure.contactsAssocies || [])],
      updatedAt: serverTimestamp(),
      enrichedFromContact: contact.id,
      enrichedAt: serverTimestamp()
    };
    
    // Ajouter le contact aux associés s'il n'y est pas
    if (!enrichedStructure.contactsAssocies.includes(contact.id)) {
      enrichedStructure.contactsAssocies.push(contact.id);
    }
    
    // Sauvegarder la structure enrichie
    await updateDoc(doc(db, 'structures', contact.structureId), enrichedStructure);
    console.log('✅ Structure enrichie avec métadonnées du contact');
    console.log(`   - Raison sociale: ${structureMetadata.raisonSociale || 'non défini'}`);
    console.log(`   - Email: ${structureMetadata.email || 'non défini'}`);
    console.log(`   - Pays: ${structureMetadata.pays || 'non défini'}`);
  }
  
  // ÉTAPE 2: Nettoyer le contact (supprimer les doublons)
  const cleanedContact = { ...contact };
  
  // Supprimer toutes les métadonnées structure* sauf structureId
  Object.keys(cleanedContact).forEach(key => {
    if (key.startsWith('structure') && key !== 'structureId') {
      delete cleanedContact[key];
    }
  });
  
  // Ajouter métadonnées de migration
  cleanedContact.updatedAt = serverTimestamp();
  cleanedContact.migratedAt = serverTimestamp();
  cleanedContact.migrationNote = 'Métadonnées transférées vers structure maître';
  
  // Sauvegarder contact nettoyé
  await updateDoc(doc(db, 'contacts', contact.id), cleanedContact);
  console.log('✅ Contact nettoyé - métadonnées dupliquées supprimées');
}

async function migratePersonnePartielle(contact) {
  console.log(`🔧 Migration personne partielle: ${contact.prenom}`);
  
  // Extraire les métadonnées structure
  const structureData = {};
  Object.keys(contact).forEach(key => {
    if (key.startsWith('structure') && contact[key]) {
      // Convertir structureRaisonSociale → raisonSociale
      const cleanKey = key.replace('structure', '').toLowerCase();
      const finalKey = cleanKey.charAt(0).toLowerCase() + cleanKey.slice(1);
      structureData[finalKey] = contact[key];
    }
  });
  
  // Créer un ID pour la nouvelle structure
  const structureId = `structure_${Date.now()}`;
  
  // Données structure complètes
  const newStructure = {
    ...structureData,
    contactsAssocies: [contact.id],
    organizationId: contact.organizationId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    migrationNote: 'Créée à partir des métadonnées contact'
  };
  
  // Créer la structure
  await setDoc(doc(db, 'structures', structureId), newStructure);
  console.log(`✅ Structure créée: ${structureId}`);
  
  // Nettoyer et lier le contact
  const cleanedContact = { ...contact };
  
  // Supprimer métadonnées structure et ajouter relation
  Object.keys(cleanedContact).forEach(key => {
    if (key.startsWith('structure')) {
      delete cleanedContact[key];
    }
  });
  
  cleanedContact.structureId = structureId;
  cleanedContact.updatedAt = serverTimestamp();
  cleanedContact.migratedAt = serverTimestamp();
  cleanedContact.migrationNote = 'Structure créée à partir métadonnées';
  
  // Sauvegarder contact
  await updateDoc(doc(db, 'contacts', contact.id), cleanedContact);
  console.log('✅ Contact nettoyé et lié à la nouvelle structure');
}

// Exécuter le script
migrateSingleContact().then(() => {
  console.log('\n🎉 Script terminé');
  process.exit(0);
}).catch(error => {
  console.error('💥 Erreur fatale:', error);
  process.exit(1);
});