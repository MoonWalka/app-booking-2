const admin = require('firebase-admin');
const serviceAccount = require('./firebase-migration/firebase-service-account-domo.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function checkContactEmails() {
  console.log('Vérification des emails dans les contacts...\n');
  
  // Vérifier contacts
  const contactsSnapshot = await db.collection('contacts').limit(10).get();
  console.log('=== CONTACTS - VÉRIFICATION EMAIL ===');
  console.log('Nombre de contacts dans l\'échantillon:', contactsSnapshot.size);
  
  let contactsAvecEmail = 0;
  let contactsSansEmail = 0;
  
  contactsSnapshot.forEach(doc => {
    const data = doc.data();
    console.log('\n--- Contact ID:', doc.id);
    console.log('Nom:', data.nom || 'N/A');
    console.log('Prénom:', data.prenom || 'N/A');
    console.log('Email (direct):', data.email || 'MANQUANT');
    console.log('Email (dans contact):', data.contact?.email || 'N/A');
    console.log('Structure complète:', JSON.stringify(data, null, 2));
    
    if (data.email || data.contact?.email) {
      contactsAvecEmail++;
    } else {
      contactsSansEmail++;
    }
  });
  
  console.log('\n=== RÉSUMÉ ===');
  console.log('Contacts avec email:', contactsAvecEmail);
  console.log('Contacts sans email:', contactsSansEmail);
  
  // Chercher un contact spécifique avec email pour tester
  const contactsAvecEmailQuery = await db.collection('contacts')
    .where('email', '!=', '')
    .limit(1)
    .get();
  
  if (!contactsAvecEmailQuery.empty) {
    console.log('\n=== EXEMPLE DE CONTACT AVEC EMAIL ===');
    const doc = contactsAvecEmailQuery.docs[0];
    const data = doc.data();
    console.log('ID:', doc.id);
    console.log('Données complètes:', JSON.stringify(data, null, 2));
  }
  
  process.exit(0);
}

checkContactEmails().catch(console.error);