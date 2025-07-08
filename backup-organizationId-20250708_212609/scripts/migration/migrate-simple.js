#!/usr/bin/env node

/**
 * Script de migration simple : contacts_unified → nouveau modèle relationnel
 * Version sans authentification pour tests
 */

// Charger les variables d'environnement
require('dotenv').config({ path: '.env.local' });

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  query, 
  where, 
  writeBatch,
  serverTimestamp,
  setDoc
} = require('firebase/firestore');

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

const organizationId = '9LjkCJG04pEzbABdHkSf'; // Organisation test
const isDryRun = process.argv.includes('--dry-run');

console.log('🚀 MIGRATION CONTACTS VERS MODÈLE RELATIONNEL');
console.log('==============================================\n');

if (isDryRun) {
  console.log('🧪 MODE SIMULATION - Aucune donnée ne sera écrite\n');
} else {
  console.log('⚠️  MODE PRODUCTION - Les données seront modifiées\n');
}

// Statistiques
const stats = {
  totalProcessed: 0,
  structuresCreated: 0,
  personnesCreated: 0,
  liaisonsCreated: 0,
  errors: 0
};

/**
 * Créer une structure unique
 */
async function createStructure(structureData, organizationId) {
  const structureRef = doc(collection(db, 'structures'));
  
  const structure = {
    organizationId,
    raisonSociale: structureData.raisonSociale || '',
    type: structureData.type || 'autre',
    email: structureData.email || '',
    telephone1: structureData.telephone1 || '',
    telephone2: structureData.telephone2 || '',
    fax: structureData.fax || '',
    siteWeb: structureData.siteWeb || '',
    adresse: structureData.adresse || '',
    codePostal: structureData.codePostal || '',
    ville: structureData.ville || '',
    pays: structureData.pays || 'France',
    tags: structureData.tags || [],
    isClient: structureData.isClient || false,
    notes: structureData.notes || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  
  if (!isDryRun) {
    await setDoc(structureRef, structure);
  }
  
  console.log(`   ✅ Structure: ${structure.raisonSociale}`);
  return structureRef.id;
}

/**
 * Créer une personne unique
 */
async function createPersonne(personneData, organizationId) {
  const personneRef = doc(collection(db, 'personnes'));
  
  const personne = {
    organizationId,
    prenom: personneData.prenom || '',
    nom: personneData.nom || '',
    email: personneData.email || '',
    telephone: personneData.telephone || '',
    telephone2: personneData.telephone2 || '',
    fax: personneData.fax || '',
    adresse: personneData.adresse || '',
    codePostal: personneData.codePostal || '',
    ville: personneData.ville || '',
    pays: personneData.pays || 'France',
    tags: personneData.tags || [],
    isPersonneLibre: false, // Sera défini selon le contexte
    notes: personneData.notes || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  
  if (!isDryRun) {
    await setDoc(personneRef, personne);
  }
  
  console.log(`   ✅ Personne: ${personne.prenom} ${personne.nom}`);
  return personneRef.id;
}

/**
 * Créer une liaison N-à-N
 */
async function createLiaison(structureId, personneId, liaisonData, organizationId) {
  const liaisonRef = doc(collection(db, 'liaisons'));
  
  const liaison = {
    organizationId,
    structureId,
    personneId,
    fonction: liaisonData.fonction || '',
    actif: true,
    prioritaire: liaisonData.prioritaire || false,
    interesse: false,
    dateDebut: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  
  if (!isDryRun) {
    await setDoc(liaisonRef, liaison);
  }
  
  console.log(`   🔗 Liaison: ${liaisonData.fonction || 'Contact'}`);
  return liaisonRef.id;
}

/**
 * Migrer un document contacts_unified
 */
async function migrateContact(contactDoc) {
  const data = contactDoc.data();
  console.log(`\n📄 Migration: ${contactDoc.id}`);
  
  try {
    if (data.entityType === 'structure') {
      // Créer la structure
      const structureId = await createStructure(data.structure || data, organizationId);
      stats.structuresCreated++;
      
      // Migrer les personnes associées
      if (data.personnes && Array.isArray(data.personnes)) {
        for (const personne of data.personnes) {
          const personneId = await createPersonne(personne, organizationId);
          stats.personnesCreated++;
          
          // Créer la liaison
          await createLiaison(structureId, personneId, personne, organizationId);
          stats.liaisonsCreated++;
        }
      }
      
    } else if (data.entityType === 'personne_libre') {
      // Créer la personne libre
      const personneData = { ...(data.personne || data), isPersonneLibre: true };
      await createPersonne(personneData, organizationId);
      stats.personnesCreated++;
    }
    
    stats.totalProcessed++;
    
  } catch (error) {
    console.error(`   ❌ Erreur: ${error.message}`);
    stats.errors++;
  }
}

/**
 * Script principal
 */
async function main() {
  try {
    console.log(`🎯 Organisation: ${organizationId}\n`);
    
    // Récupérer les contacts existants
    console.log('📋 Récupération des contacts existants...');
    const contactsQuery = query(
      collection(db, 'contacts_unified'),
      where('organizationId', '==', organizationId)
    );
    const contactsSnapshot = await getDocs(contactsQuery);
    
    console.log(`📊 ${contactsSnapshot.docs.length} contacts trouvés\n`);
    
    if (contactsSnapshot.empty) {
      console.log('ℹ️ Aucun contact à migrer pour cette organisation');
      return;
    }
    
    // Migrer chaque contact
    for (const contactDoc of contactsSnapshot.docs) {
      await migrateContact(contactDoc);
    }
    
    // Afficher le rapport final
    console.log('\n' + '='.repeat(50));
    console.log('📊 RAPPORT DE MIGRATION');
    console.log('='.repeat(50));
    console.log(`Total traités: ${stats.totalProcessed}`);
    console.log(`Structures créées: ${stats.structuresCreated}`);
    console.log(`Personnes créées: ${stats.personnesCreated}`);
    console.log(`Liaisons créées: ${stats.liaisonsCreated}`);
    console.log(`Erreurs: ${stats.errors}`);
    
    if (isDryRun) {
      console.log('\n🧪 SIMULATION TERMINÉE - Aucune donnée n\'a été écrite');
      console.log('Pour exécuter la migration réelle:');
      console.log('node scripts/migration/migrate-simple.js\n');
    } else {
      console.log('\n✅ MIGRATION TERMINÉE');
      console.log('Prochaines étapes:');
      console.log('1. Supprimer les documents de test (_TEST_)');
      console.log('2. Tester les nouveaux composants');
      console.log('3. Activer progressivement le nouveau système\n');
    }
    
  } catch (error) {
    console.error('❌ Erreur fatale:', error.message);
    process.exit(1);
  }
  
  process.exit(0);
}

// Exécuter le script
main();