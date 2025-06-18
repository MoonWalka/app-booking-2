#!/usr/bin/env node

/**
 * Script d'audit des contacts existants en production
 * Avant migration vers architecture Structure-centrée
 * Date: 18 juin 2025
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

// Configuration Firebase (utilise l'environnement local)
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

async function auditContacts() {
  console.log('🔍 AUDIT DES CONTACTS EXISTANTS - 18 juin 2025');
  console.log('================================================\n');

  try {
    // 1. Audit de la collection contacts
    console.log('📋 1. COLLECTION CONTACTS');
    console.log('-------------------------');
    
    const contactsSnapshot = await getDocs(collection(db, 'contacts'));
    const contacts = [];
    
    contactsSnapshot.forEach(doc => {
      const data = { id: doc.id, ...doc.data() };
      contacts.push(data);
    });
    
    console.log(`Nombre total de contacts: ${contacts.length}\n`);
    
    if (contacts.length === 0) {
      console.log('❌ Aucun contact trouvé\n');
    } else {
      // Analyser chaque contact
      contacts.forEach((contact, index) => {
        console.log(`--- CONTACT ${index + 1} ---`);
        console.log(`ID: ${contact.id}`);
        console.log(`Type: ${contact.type || 'non défini'}`);
        
        // Informations personne
        if (contact.prenom || contact.nom) {
          console.log(`Personne: ${contact.prenom || ''} ${contact.nom || ''}`);
          console.log(`Email: ${contact.email || 'non défini'}`);
          console.log(`Téléphone: ${contact.telephone || 'non défini'}`);
        }
        
        // Informations structure (métadonnées dupliquées)
        const hasStructureData = Object.keys(contact).some(key => key.startsWith('structure'));
        if (hasStructureData) {
          console.log('\n📊 MÉTADONNÉES STRUCTURE DUPLIQUÉES:');
          Object.keys(contact).forEach(key => {
            if (key.startsWith('structure') && contact[key]) {
              console.log(`  ${key}: ${contact[key]}`);
            }
          });
        }
        
        // Relations
        if (contact.structureId) {
          console.log(`\n🔗 Structure liée: ${contact.structureId}`);
        }
        
        // Dates
        console.log(`\n📅 Créé: ${contact.createdAt?.toDate?.() || contact.createdAt || 'non défini'}`);
        console.log(`📅 Modifié: ${contact.updatedAt?.toDate?.() || contact.updatedAt || 'non défini'}`);
        console.log(`🏢 Organization: ${contact.organizationId || 'non défini'}`);
        
        console.log(''); // Ligne vide
      });
    }
    
    // 2. Audit de la collection structures (si elle existe)
    console.log('🏢 2. COLLECTION STRUCTURES');
    console.log('----------------------------');
    
    try {
      const structuresSnapshot = await getDocs(collection(db, 'structures'));
      const structures = [];
      
      structuresSnapshot.forEach(doc => {
        const data = { id: doc.id, ...doc.data() };
        structures.push(data);
      });
      
      console.log(`Nombre total de structures: ${structures.length}\n`);
      
      if (structures.length === 0) {
        console.log('❌ Aucune structure trouvée (normal avant migration)\n');
      } else {
        structures.forEach((structure, index) => {
          console.log(`--- STRUCTURE ${index + 1} ---`);
          console.log(`ID: ${structure.id}`);
          console.log(`Raison sociale: ${structure.raisonSociale || structure.structureRaisonSociale || 'non défini'}`);
          console.log(`Email: ${structure.email || structure.structureEmail || 'non défini'}`);
          console.log(`Contacts associés: ${structure.contactsAssocies?.length || 0}`);
          console.log('');
        });
      }
    } catch (error) {
      console.log('⚠️ Collection structures non accessible (normal)\n');
    }
    
    // 3. Résumé et recommandations
    console.log('📊 3. RÉSUMÉ DE L\'AUDIT');
    console.log('========================');
    
    const typesCount = {};
    const withStructureData = contacts.filter(c => Object.keys(c).some(k => k.startsWith('structure')));
    const withStructureRelation = contacts.filter(c => c.structureId);
    
    contacts.forEach(contact => {
      const type = contact.type || 'non défini';
      typesCount[type] = (typesCount[type] || 0) + 1;
    });
    
    console.log(`📋 Total contacts: ${contacts.length}`);
    console.log('📊 Répartition par type:');
    Object.entries(typesCount).forEach(([type, count]) => {
      console.log(`   - ${type}: ${count}`);
    });
    console.log(`🔗 Contacts avec métadonnées structure: ${withStructureData.length}`);
    console.log(`🔗 Contacts avec relation structureId: ${withStructureRelation.length}`);
    
    console.log('\n🎯 4. RECOMMANDATIONS MIGRATION');
    console.log('================================');
    
    if (contacts.length <= 5) {
      console.log('✅ Volume idéal pour migration (≤ 5 contacts)');
      console.log('✅ Risque minimal - migration directe possible');
    }
    
    if (withStructureData.length > 0) {
      console.log('⚠️ Métadonnées structure dupliquées détectées');
      console.log('🔧 Migration nécessaire vers modèle Structure-centrée');
    }
    
    if (withStructureRelation.length > 0) {
      console.log('✅ Relations bidirectionnelles déjà présentes');
    }
    
    console.log('\n🚀 PRÊT POUR MIGRATION');
    
    // 4. Export des données pour sauvegarde
    const backupData = {
      auditDate: new Date().toISOString(),
      contacts: contacts,
      summary: {
        totalContacts: contacts.length,
        typesCount,
        withStructureData: withStructureData.length,
        withStructureRelation: withStructureRelation.length
      }
    };
    
    // Sauvegarder dans un fichier JSON
    const fs = require('fs');
    const backupFilename = `backup-contacts-pre-migration-${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(backupFilename, JSON.stringify(backupData, null, 2));
    console.log(`\n💾 Backup sauvegardé: ${backupFilename}`);
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'audit:', error.message);
    console.error('Vérifiez votre configuration Firebase');
  }
}

// Exécuter l'audit
auditContacts().then(() => {
  console.log('\n✅ Audit terminé');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});