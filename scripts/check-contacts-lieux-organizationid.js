const admin = require('firebase-admin');
const serviceAccount = require('./firebase-migration/firebase-service-account-domo.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function checkCollections() {
  console.log('Vérification des collections contacts et lieux...\n');
  
  // Vérifier contacts
  const contactsSnapshot = await db.collection('contacts').limit(5).get();
  console.log('=== CONTACTS ===');
  console.log('Nombre total dans l\'échantillon:', contactsSnapshot.size);
  contactsSnapshot.forEach(doc => {
    const data = doc.data();
    console.log('ID:', doc.id);
    console.log('organizationId:', data.organizationId || 'MANQUANT');
    console.log('nom:', data.contact?.nom || data.nom || 'N/A');
    console.log('---');
  });
  
  // Vérifier lieux
  const lieuxSnapshot = await db.collection('lieux').limit(5).get();
  console.log('\n=== LIEUX ===');
  console.log('Nombre total dans l\'échantillon:', lieuxSnapshot.size);
  lieuxSnapshot.forEach(doc => {
    const data = doc.data();
    console.log('ID:', doc.id);
    console.log('organizationId:', data.organizationId || 'MANQUANT');
    console.log('nom:', data.nom || 'N/A');
    console.log('---');
  });
  
  // Compter tous les documents
  const allContacts = await db.collection('contacts').get();
  const allLieux = await db.collection('lieux').get();
  
  // Compter ceux sans organizationId
  let contactsSansOrgId = 0;
  let lieuxSansOrgId = 0;
  
  allContacts.forEach(doc => {
    const data = doc.data();
    if (!data.organizationId) {
      contactsSansOrgId++;
    }
  });
  
  allLieux.forEach(doc => {
    const data = doc.data();
    if (!data.organizationId) {
      lieuxSansOrgId++;
    }
  });
  
  console.log('\n=== RÉSUMÉ ===');
  console.log('Total contacts:', allContacts.size);
  console.log('Contacts sans organizationId:', contactsSansOrgId);
  console.log('Total lieux:', allLieux.size);
  console.log('Lieux sans organizationId:', lieuxSansOrgId);
  
  // Vérifier aussi concerts et structures pour comparaison
  const concertsSnapshot = await db.collection('concerts').limit(5).get();
  const structuresSnapshot = await db.collection('structures').limit(5).get();
  
  console.log('\n=== COMPARAISON AVEC CONCERTS ET STRUCTURES ===');
  console.log('Concerts - échantillon:');
  concertsSnapshot.forEach(doc => {
    const data = doc.data();
    console.log('- organizationId:', data.organizationId || 'MANQUANT');
  });
  
  console.log('\nStructures - échantillon:');
  structuresSnapshot.forEach(doc => {
    const data = doc.data();
    console.log('- organizationId:', data.organizationId || 'MANQUANT');
  });
  
  process.exit(0);
}

checkCollections().catch(console.error);