const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Charger les variables d'environnement
require('dotenv').config();

// Initialiser Firebase Admin
const serviceAccount = {
  type: 'service_account',
  project_id: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
};

initializeApp({
  credential: cert(serviceAccount),
  databaseURL: `https://${process.env.REACT_APP_FIREBASE_PROJECT_ID}.firebaseio.com`
});

const db = getFirestore();

async function checkConcertContactStructure() {
  console.log('Analyse de la structure des contacts dans les concerts...\n');
  
  try {
    const concertsSnapshot = await db.collection('concerts').limit(10).get();
    
    let singleContactCount = 0;
    let multipleContactsCount = 0;
    let withRolesCount = 0;
    let noContactCount = 0;
    
    concertsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`Concert ${doc.id}:`);
      console.log(`  Titre: ${data.titre || 'Sans titre'}`);
      
      // Vérifier contactId (singulier)
      if (data.contactId) {
        console.log(`  - contactId: ${data.contactId}`);
        singleContactCount++;
      }
      
      // Vérifier contactIds (pluriel)
      if (data.contactIds && Array.isArray(data.contactIds)) {
        console.log(`  - contactIds: [${data.contactIds.join(', ')}]`);
        multipleContactsCount++;
      }
      
      // Vérifier contactsWithRoles
      if (data.contactsWithRoles && Array.isArray(data.contactsWithRoles)) {
        console.log(`  - contactsWithRoles: ${JSON.stringify(data.contactsWithRoles, null, 2)}`);
        withRolesCount++;
      }
      
      // Aucun contact
      if (!data.contactId && !data.contactIds && !data.contactsWithRoles) {
        console.log(`  - Aucun contact`);
        noContactCount++;
      }
      
      console.log('');
    });
    
    console.log('\n=== RÉSUMÉ ===');
    console.log(`Total concerts analysés: ${concertsSnapshot.size}`);
    console.log(`- Concerts avec contactId (singulier): ${singleContactCount}`);
    console.log(`- Concerts avec contactIds (pluriel): ${multipleContactsCount}`);
    console.log(`- Concerts avec contactsWithRoles: ${withRolesCount}`);
    console.log(`- Concerts sans contact: ${noContactCount}`);
    
  } catch (error) {
    console.error('Erreur:', error);
  }
}

checkConcertContactStructure();